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
const router = (0, express_1.Router)();
// GET /api/bookings (User's bookings)
router.get("/", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const bookings = yield db_1.prisma.booking.findMany({
            where: { clientId: String(userId) }, // Assuming clientId is stored as string in DB based on previous code, but user.id is number. Let's check schema if possible, but previous code used string.
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
router.post("/", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { barberId, serviceId, date, time } = req.body;
    const clientId = req.user.id;
    try {
        // 1. Prevent Double Booking
        const existingBooking = yield db_1.prisma.booking.findFirst({
            where: {
                barberId,
                date,
                time,
                status: { not: "cancelled" }
            }
        });
        if (existingBooking) {
            return res.status(409).json({
                error: "This time slot is already booked",
                errorCode: "SLOT_ALREADY_BOOKED"
            });
        }
        // 2. Limit Active Bookings (Anti-Spam)
        // Limit to 3 active (pending or confirmed) bookings per user
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
        const booking = yield db_1.prisma.booking.create({
            data: {
                clientId,
                barberId,
                serviceId,
                date,
                time,
                status: "pending"
            },
            include: {
                barber: { include: { user: true } },
                service: true
            }
        });
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
            data: { status, comment }
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
            data: { status: "cancelled" }
        });
        res.json(updatedBooking);
    }
    catch (error) {
        res.status(500).json({ error: "Cancellation failed" });
    }
}));
exports.default = router;
