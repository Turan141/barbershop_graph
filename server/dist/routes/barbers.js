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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
function resolveBarberProfile(idOrUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        let barber = yield db_1.prisma.barberProfile.findUnique({
            where: { id: idOrUserId },
            select: { id: true, userId: true }
        });
        if (!barber) {
            barber = yield db_1.prisma.barberProfile.findUnique({
                where: { userId: idOrUserId },
                select: { id: true, userId: true }
            });
        }
        return barber;
    });
}
const mapBarber = (profile) => {
    const { user } = profile, rest = __rest(profile, ["user"]);
    return Object.assign(Object.assign(Object.assign({}, user), rest), { 
        // Ensure ID is the barber profile ID, not user ID (though spread order handles this, let's be explicit if needed, but rest.id comes after user.id)
        specialties: JSON.parse(rest.specialties), schedule: JSON.parse(rest.schedule), portfolio: JSON.parse(rest.portfolio), previewImageUrl: rest.previewImageUrl, holidays: rest.holidays ? JSON.parse(rest.holidays) : undefined });
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
    const date = typeof req.query.date === "string" ? req.query.date : undefined;
    // Check for auth token to determine if we show full details
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let requesterId = null;
    if (token) {
        try {
            const verified = jsonwebtoken_1.default.verify(token, (0, config_1.getJwtSecret)());
            requesterId = verified.id;
        }
        catch (e) {
            // Invalid token, treat as guest
        }
    }
    try {
        // Resolve barber ID (could be profile ID or user ID)
        const barber = yield resolveBarberProfile(id);
        if (!barber) {
            return res.status(404).json({ error: "Barber not found" });
        }
        const isOwner = requesterId === barber.userId;
        let bookings = [];
        if (date) {
            // Availability use-case: keep payload small and exclude cancelled slots.
            bookings = yield db_1.prisma.booking.findMany({
                where: {
                    barberId: barber.id,
                    date,
                    status: { not: "cancelled" }
                },
                select: Object.assign({ id: true, date: true, time: true, status: true, clientId: true, barberId: true, serviceId: true, service: { select: { id: true, duration: true } } }, (isOwner ? { client: true } : {}))
            });
        }
        else {
            bookings = yield db_1.prisma.booking.findMany({
                where: { barberId: barber.id },
                include: {
                    client: isOwner, // Only include client details if owner
                    service: true
                },
                orderBy: { date: "desc" }
            });
        }
        res.json(bookings);
    }
    catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
}));
// GET /api/barbers/:id/stats
router.get("/:id/stats", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const profile = yield db_1.prisma.barberProfile.findUnique({
            where: { id },
            select: { userId: true }
        });
        if (!profile) {
            return res.status(404).json({ error: "Barber not found" });
        }
        if (profile.userId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        // Fetch all bookings for calculations
        // In a real app with millions of rows, we would use aggregate queries or raw SQL for performance.
        // For this scale, fetching and processing in memory is fine and flexible.
        const bookings = yield db_1.prisma.booking.findMany({
            where: { barberId: id },
            include: { service: true }
        });
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        // Helper to get date string for X days ago
        const getDayStr = (daysAgo) => {
            const d = new Date(now);
            d.setDate(d.getDate() - daysAgo);
            return d.toISOString().split("T")[0];
        };
        const last7Days = Array.from({ length: 7 }, (_, i) => getDayStr(6 - i)); // [6 days ago, ..., today]
        // Calculate Stats
        let todayRevenue = 0;
        let todayBookings = 0;
        let monthRevenue = 0;
        let monthBookings = 0;
        let totalClients = new Set();
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
        const chartData = last7Days.map((date) => ({
            date,
            revenue: 0,
            bookings: 0
        }));
        bookings.forEach((b) => {
            var _a;
            // Only count confirmed or completed for revenue
            const isPaid = b.status === "completed" || b.status === "confirmed";
            const price = ((_a = b.service) === null || _a === void 0 ? void 0 : _a.price) || 0;
            // Today
            if (b.date === todayStr) {
                todayBookings++;
                if (isPaid)
                    todayRevenue += price;
            }
            // Month
            if (b.date.startsWith(currentMonth)) {
                monthBookings++;
                if (isPaid)
                    monthRevenue += price;
            }
            // Total Clients (Unique)
            if (b.clientId)
                totalClients.add(b.clientId);
            // Chart Data
            const dayStat = chartData.find((d) => d.date === b.date);
            if (dayStat) {
                dayStat.bookings++;
                if (isPaid)
                    dayStat.revenue += price;
            }
        });
        res.json({
            today: { revenue: todayRevenue, bookings: todayBookings },
            month: { revenue: monthRevenue, bookings: monthBookings },
            totalClients: totalClients.size,
            chart: chartData
        });
    }
    catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
}));
// POST /api/barbers/:id/reviews
router.post("/:id/reviews", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { rating, text } = req.body;
    const userId = req.user.id;
    const barber = yield resolveBarberProfile(id);
    if (!barber) {
        return res.status(404).json({ error: "Barber not found" });
    }
    // Optional: restrict reviews to clients only
    if (req.user.role !== "client") {
        return res.status(403).json({ error: "Only clients can submit reviews" });
    }
    if (!rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }
    try {
        // Check if user already reviewed
        const existingReview = yield db_1.prisma.review.findUnique({
            where: {
                userId_barberId: {
                    userId,
                    barberId: barber.id
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
                barberId: barber.id,
                rating: ratingNum,
                text
            },
            include: {
                user: true
            }
        });
        // Update barber rating stats
        const reviews = yield db_1.prisma.review.findMany({
            where: { barberId: barber.id }
        });
        const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = totalRating / reviews.length;
        yield db_1.prisma.barberProfile.update({
            where: { id: barber.id },
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
router.put("/:id", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Check authorization
        if (profile.userId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to update this profile" });
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
        if (data.phone)
            updateData.phone = data.phone;
        if (data.bio)
            updateData.bio = data.bio;
        if (data.specialties)
            updateData.specialties = JSON.stringify(data.specialties);
        if (data.schedule)
            updateData.schedule = JSON.stringify(data.schedule);
        if (data.portfolio)
            updateData.portfolio = JSON.stringify(data.portfolio);
        if (data.previewImageUrl !== undefined)
            updateData.previewImageUrl = data.previewImageUrl;
        if (data.holidays)
            updateData.holidays = JSON.stringify(data.holidays);
        if (data.verificationDocumentUrl)
            updateData.verificationDocumentUrl = data.verificationDocumentUrl;
        if (data.verificationStatus === "pending")
            updateData.verificationStatus = "pending";
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
// GET /api/barbers/:id/clients
router.get("/:id/clients", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const barber = yield resolveBarberProfile(id);
        if (!barber) {
            return res.status(404).json({ error: "Barber not found" });
        }
        if (barber.userId !== req.user.id) {
            return res.status(403).json({ error: "Access denied" });
        }
        // Find all bookings for this barber to identify clients
        const bookings = yield db_1.prisma.booking.findMany({
            where: { barberId: barber.id },
            include: {
                client: true,
                service: true
            },
            orderBy: { date: "desc" }
        });
        // Group by client
        const clientsMap = new Map();
        for (const booking of bookings) {
            if (!clientsMap.has(booking.clientId)) {
                clientsMap.set(booking.clientId, {
                    user: booking.client,
                    bookings: [],
                    totalRevenue: 0,
                    lastBooking: booking.date
                });
            }
            const clientData = clientsMap.get(booking.clientId);
            clientData.bookings.push(booking);
            // Calculate revenue from completed bookings
            // In a real app, we'd check payment status too
            if (booking.status === "completed" || booking.status === "confirmed") {
                clientData.totalRevenue += booking.service.price;
            }
        }
        // Fetch notes for these clients
        const clientIds = Array.from(clientsMap.keys());
        const notes = yield db_1.prisma.barberClientNote.findMany({
            where: {
                barberId: barber.id,
                clientId: { in: clientIds }
            }
        });
        const notesMap = new Map(notes.map((n) => [n.clientId, n]));
        const result = Array.from(clientsMap.values()).map((c) => {
            const note = notesMap.get(c.user.id);
            return {
                id: c.user.id,
                name: c.user.name,
                email: c.user.email,
                avatarUrl: c.user.avatarUrl,
                totalBookings: c.bookings.length,
                totalRevenue: c.totalRevenue,
                lastBookingDate: c.lastBooking,
                notes: (note === null || note === void 0 ? void 0 : note.notes) || "",
                tags: (note === null || note === void 0 ? void 0 : note.tags) ? JSON.parse(note.tags) : []
            };
        });
        res.json(result);
    }
    catch (error) {
        console.error("Fetch clients error:", error);
        res.status(500).json({ error: "Failed to fetch clients" });
    }
}));
// POST /api/barbers/:id/clients/:clientId/notes
router.post("/:id/clients/:clientId/notes", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, clientId } = req.params;
    const { notes, tags } = req.body;
    try {
        const barber = yield resolveBarberProfile(id);
        if (!barber) {
            return res.status(404).json({ error: "Barber not found" });
        }
        if (barber.userId !== req.user.id) {
            return res.status(403).json({ error: "Access denied" });
        }
        const note = yield db_1.prisma.barberClientNote.upsert({
            where: {
                barberId_clientId: {
                    barberId: barber.id,
                    clientId: clientId
                }
            },
            update: {
                notes,
                tags: JSON.stringify(tags || [])
            },
            create: {
                barberId: barber.id,
                clientId,
                notes,
                tags: JSON.stringify(tags || [])
            }
        });
        res.json(note);
    }
    catch (error) {
        console.error("Save note error:", error);
        res.status(500).json({ error: "Failed to save client notes" });
    }
}));
exports.default = router;
