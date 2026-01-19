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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// GET /api/bookings (User's bookings)
router.get("/", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    try {
        if (page) {
            const skip = (page - 1) * limit;
            const [bookings, total] = yield db_1.prisma.$transaction([
                db_1.prisma.booking.findMany({
                    where: { clientId: userId },
                    include: {
                        barber: {
                            include: { user: true }
                        },
                        service: true
                    },
                    orderBy: { date: "desc" },
                    skip,
                    take: limit
                }),
                db_1.prisma.booking.count({ where: { clientId: userId } })
            ]);
            return res.json({
                data: bookings,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
            });
        }
        const bookings = yield db_1.prisma.booking.findMany({
            where: { clientId: userId },
            include: {
                barber: {
                    include: { user: true }
                },
                service: true
            },
            orderBy: { date: "desc" }
        });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
}));
// POST /api/bookings
router.post("/", rateLimit_1.createBookingLimiter, auth_1.optionalAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { barberId, serviceId, date, time, guestName, guestPhone, asGuest } = req.body;
    let clientId;
    if (req.user && !asGuest) {
        // Allow barbers to book too (e.g. for themselves or testing)
        // if (req.user.role !== "client") {
        // 	return res.status(403).json({ error: "Only clients can create bookings" })
        // }
        clientId = req.user.id;
    }
    else {
        // Guest validation
        if (!guestName || !guestPhone) {
            return res
                .status(400)
                .json({ error: "Name and phone are required for guest booking" });
        }
        // Security: Check for spamming from same guest phone number
        // Limit: Max 2 pending bookings per phone number
        const pendingGuestBookings = yield db_1.prisma.booking.count({
            where: {
                guestPhone,
                status: { in: ["pending", "confirmed"] },
                date: { gte: new Date().toISOString().split("T")[0] } // Only count future/today bookings
            }
        });
        if (pendingGuestBookings >= 2) {
            return res.status(429).json({
                error: "You have reached the maximum limit of active bookings for this phone number.",
                errorCode: "MAX_GUEST_BOOKINGS_REACHED"
            });
        }
    }
    if (typeof barberId !== "string" || typeof serviceId !== "string") {
        return res.status(400).json({ error: "Invalid barberId or serviceId" });
    }
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "Invalid date. Expected YYYY-MM-DD" });
    }
    if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({ error: "Invalid time. Expected HH:mm" });
    }
    const slotKey = `${barberId}:${date}:${time}`;
    try {
        const [barberProfile, service] = yield Promise.all([
            db_1.prisma.barberProfile.findUnique({
                where: { id: barberId },
                select: {
                    id: true,
                    userId: true,
                    subscriptionStatus: true,
                    subscriptionPlan: true,
                    subscriptionEndDate: true
                }
            }),
            db_1.prisma.service.findUnique({
                where: { id: serviceId },
                select: { id: true, barberId: true }
            })
        ]);
        if (!barberProfile) {
            return res.status(404).json({ error: "Barber not found" });
        }
        // Check subscription status (Soft Lock)
        // Allow the barber themselves to book (manual entry), but block clients if expired
        const isBarberOwner = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === barberProfile.userId;
        if (!isBarberOwner) {
            const isExpired = barberProfile.subscriptionStatus !== "active" &&
                barberProfile.subscriptionEndDate &&
                new Date(barberProfile.subscriptionEndDate) < new Date();
            if (isExpired) {
                return res.status(403).json({
                    error: "This barber is currently not accepting online bookings.",
                    errorCode: "BARBER_SUBSCRIPTION_EXPIRED"
                });
            }
            // Check Basic Plan Limit (50 bookings/month)
            if (barberProfile.subscriptionPlan === "basic") {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const monthlyBookings = yield db_1.prisma.booking.count({
                    where: {
                        barberId: barberProfile.id,
                        date: {
                            gte: startOfMonth.toISOString().split("T")[0],
                            lte: endOfMonth.toISOString().split("T")[0]
                        }
                    }
                });
                if (monthlyBookings >= 50) {
                    return res.status(403).json({
                        error: "This barber has reached their monthly booking limit.",
                        errorCode: "BARBER_LIMIT_REACHED"
                    });
                }
            }
        }
        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }
        if (service.barberId !== barberId) {
            return res.status(400).json({ error: "Service does not belong to this barber" });
        }
        // 1. Prevent Double Booking (fast path)
        const existingBooking = yield db_1.prisma.booking.findFirst({
            where: { slotKey }
        });
        if (existingBooking) {
            return res.status(409).json({
                error: "This time slot is already booked",
                errorCode: "SLOT_ALREADY_BOOKED"
            });
        }
        // 2. Limit Active Bookings (Anti-Spam) - Only for registered users
        if (clientId) {
            const activeBookingsCount = yield db_1.prisma.booking.count({
                where: {
                    clientId,
                    status: { in: ["pending", "confirmed"] }
                }
            });
            if (activeBookingsCount >= 3) {
                return res.status(429).json({
                    error: "You have reached the maximum limit of 3 active bookings.",
                    errorCode: "MAX_ACTIVE_BOOKINGS_REACHED"
                });
            }
        }
        let booking;
        try {
            booking = yield db_1.prisma.booking.create({
                data: {
                    clientId,
                    guestName,
                    guestPhone,
                    barberId,
                    serviceId,
                    date,
                    time,
                    slotKey,
                    status: "pending"
                },
                include: {
                    barber: { include: { user: true } },
                    service: true
                }
            });
        }
        catch (error) {
            // Race-safe: DB unique index rejects duplicate active slots
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res.status(409).json({
                    error: "This time slot is already booked",
                    errorCode: "SLOT_ALREADY_BOOKED"
                });
            }
            throw error;
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ error: "Booking failed" });
    }
}));
// PATCH /api/bookings/:id
router.patch("/:id", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, comment } = req.body;
    const userId = req.user.id;
    try {
        const booking = yield db_1.prisma.booking.findUnique({
            where: { id },
            include: { barber: true }
        });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        // Only the barber associated with the booking can update status/comment
        // Client can only cancel
        const isBarber = booking.barber.userId === userId;
        const isClient = booking.clientId === userId;
        if (!isBarber) {
            if (isClient && status === "cancelled") {
                // Allow client to cancel
            }
            else {
                return res.status(403).json({ error: "Not authorized to update this booking" });
            }
        }
        const updatedBooking = yield db_1.prisma.booking.update({
            where: { id },
            data: Object.assign({ status,
                comment }, (status === "cancelled" ? { slotKey: null } : {}))
        });
        res.json(updatedBooking);
    }
    catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
}));
// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const booking = yield db_1.prisma.booking.findUnique({
            where: { id },
            include: { barber: true }
        });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        // Client or Barber can cancel
        if (booking.clientId !== userId && booking.barber.userId !== userId) {
            return res.status(403).json({ error: "Not authorized to cancel this booking" });
        }
        const updatedBooking = yield db_1.prisma.booking.update({
            where: { id },
            data: { status: "cancelled", slotKey: null }
        });
        res.json(updatedBooking);
    }
    catch (error) {
        res.status(500).json({ error: "Cancellation failed" });
    }
}));
exports.default = router;
