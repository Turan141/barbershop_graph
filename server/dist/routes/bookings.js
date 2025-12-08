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
const router = (0, express_1.Router)();
// GET /api/bookings (User's bookings)
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // In a real app, we'd get userId from the token middleware.
    // For now, we'll accept a query param or header for simplicity, or just fetch all for the demo if no auth middleware is strictly enforced yet.
    // But let's assume the frontend sends a userId in query for now to keep it simple without full JWT implementation
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: "User ID required" });
    }
    try {
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
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId, barberId, serviceId, date, time } = req.body;
    try {
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
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, comment } = req.body;
    try {
        const booking = yield db_1.prisma.booking.update({
            where: { id },
            data: { status, comment }
        });
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
}));
// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const booking = yield db_1.prisma.booking.update({
            where: { id },
            data: { status: "cancelled" }
        });
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ error: "Cancellation failed" });
    }
}));
exports.default = router;
