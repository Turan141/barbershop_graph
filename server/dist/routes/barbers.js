"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
const mapBarber = (profile) => {
    const { user } = profile, rest = __rest(profile, ["user"]);
    return Object.assign(Object.assign(Object.assign({}, user), rest), { 
        // Ensure ID is the barber profile ID, not user ID (though spread order handles this, let's be explicit if needed, but rest.id comes after user.id)
        specialties: JSON.parse(rest.specialties), schedule: JSON.parse(rest.schedule), portfolio: JSON.parse(rest.portfolio), holidays: rest.holidays ? JSON.parse(rest.holidays) : undefined });
};
// GET /api/barbers
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    const where = {};
    if (query) {
        const search = query;
        where.OR = [
            { user: { name: { contains: search, mode: "insensitive" } } },
            { location: { contains: search, mode: "insensitive" } },
            { services: { some: { name: { contains: search, mode: "insensitive" } } } }
        ];
    }
    try {
        const barbers = yield db_1.prisma.barberProfile.findMany({
            where,
            include: {
                user: true,
                services: true
            }
        });
        res.json(barbers.map(mapBarber));
    }
    catch (error) {
        console.error("Error fetching barbers:", error);
        res.status(500).json({ error: "Failed to fetch barbers" });
    }
}));
// GET /api/barbers/:id
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(`Fetching barber with ID or UserID: ${id}`);
    try {
        let barber = yield db_1.prisma.barberProfile.findUnique({
            where: { id },
            include: {
                user: true,
                services: true,
                bookings: true
            }
        });
        if (!barber) {
            console.log(`Barber not found by ID ${id}, trying userId...`);
            // Try finding by userId
            barber = yield db_1.prisma.barberProfile.findUnique({
                where: { userId: id },
                include: {
                    user: true,
                    services: true,
                    bookings: true
                }
            });
        }
        if (!barber) {
            console.log(`Barber not found by userId ${id} either.`);
            return res.status(404).json({ error: "Barber not found" });
        }
        console.log(`Barber found: ${barber.id}`);
        res.json(mapBarber(barber));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch barber" });
    }
}));
// GET /api/barbers/:id/bookings
router.get("/:id/bookings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Resolve barber ID (could be profile ID or user ID)
        let barber = yield db_1.prisma.barberProfile.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!barber) {
            barber = yield db_1.prisma.barberProfile.findUnique({
                where: { userId: id },
                select: { id: true }
            });
        }
        if (!barber) {
            return res.status(404).json({ error: "Barber not found" });
        }
        const bookings = yield db_1.prisma.booking.findMany({
            where: { barberId: barber.id },
            include: {
                client: true,
                service: true
            },
            orderBy: { date: "desc" }
        });
        res.json(bookings);
    }
    catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
}));
// POST /api/barbers/:id/reviews
router.post("/:id/reviews", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId, rating, text } = req.body;
    if (!userId || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        // Check if user already reviewed
        const existingReview = yield db_1.prisma.review.findUnique({
            where: {
                userId_barberId: {
                    userId,
                    barberId: id
                }
            }
        });
        if (existingReview) {
            return res.status(400).json({ error: "You have already reviewed this barber" });
        }
        // Create review
        const review = yield db_1.prisma.review.create({
            data: {
                userId,
                barberId: id,
                rating: Number(rating),
                text
            },
            include: {
                user: true
            }
        });
        // Update barber rating stats
        const reviews = yield db_1.prisma.review.findMany({
            where: { barberId: id }
        });
        const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = totalRating / reviews.length;
        yield db_1.prisma.barberProfile.update({
            where: { id },
            data: {
                rating: parseFloat(averageRating.toFixed(1)),
                reviewCount: reviews.length
            }
        });
        res.json(review);
    }
    catch (error) {
        console.error("Review error:", error);
        res.status(500).json({ error: "Failed to submit review" });
    }
}));
// GET /api/barbers/:id/reviews
router.get("/:id/reviews", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const reviews = yield db_1.prisma.review.findMany({
            where: { barberId: id },
            include: {
                user: true
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
}));
// PUT /api/barbers/:id
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    try {
        // First find the profile to get the userId
        const profile = yield db_1.prisma.barberProfile.findUnique({
            where: { id }
        });
        if (!profile) {
            return res.status(404).json({ error: "Barber not found" });
        }
        // Update User info if provided
        if (data.name || data.avatarUrl) {
            yield db_1.prisma.user.update({
                where: { id: profile.userId },
                data: {
                    name: data.name,
                    avatarUrl: data.avatarUrl
                }
            });
        }
        // Update BarberProfile info
        const updateData = {};
        if (data.location)
            updateData.location = data.location;
        if (data.bio)
            updateData.bio = data.bio;
        if (data.specialties)
            updateData.specialties = JSON.stringify(data.specialties);
        if (data.schedule)
            updateData.schedule = JSON.stringify(data.schedule);
        if (data.portfolio)
            updateData.portfolio = JSON.stringify(data.portfolio);
        if (data.holidays)
            updateData.holidays = JSON.stringify(data.holidays);
        // Handle Services Update
        if (data.services && Array.isArray(data.services)) {
            const currentServices = yield db_1.prisma.service.findMany({
                where: { barberId: id },
                select: { id: true }
            });
            const currentIds = currentServices.map((s) => s.id);
            const servicesToUpdate = [];
            const servicesToCreate = [];
            const inputIds = [];
            for (const s of data.services) {
                if (s.id && currentIds.includes(s.id)) {
                    servicesToUpdate.push(s);
                    inputIds.push(s.id);
                }
                else {
                    // New service (remove temp ID)
                    const { id: tempId } = s, rest = __rest(s, ["id"]);
                    servicesToCreate.push(rest);
                }
            }
            const idsToDelete = currentIds.filter((cid) => !inputIds.includes(cid));
            yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                // Delete removed services
                if (idsToDelete.length > 0) {
                    // Optional: Check for bookings or handle error
                    yield tx.service.deleteMany({
                        where: {
                            id: { in: idsToDelete },
                            barberId: id
                        }
                    });
                }
                // Update existing services
                for (const s of servicesToUpdate) {
                    yield tx.service.update({
                        where: { id: s.id },
                        data: {
                            name: s.name,
                            duration: Number(s.duration),
                            price: Number(s.price),
                            currency: s.currency
                        }
                    });
                }
                // Create new services
                for (const s of servicesToCreate) {
                    yield tx.service.create({
                        data: {
                            name: s.name,
                            duration: Number(s.duration),
                            price: Number(s.price),
                            currency: s.currency || "AZN",
                            barberId: id
                        }
                    });
                }
            }));
        }
        const updatedProfile = yield db_1.prisma.barberProfile.update({
            where: { id },
            data: updateData,
            include: {
                user: true,
                services: true
            }
        });
        res.json(mapBarber(updatedProfile));
    }
    catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
}));
exports.default = router;
