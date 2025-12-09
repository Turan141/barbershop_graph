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
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/users/:id
router.get("/:id", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (req.user.id !== id) {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const user = yield db_1.prisma.user.findUnique({
            where: { id },
            include: {
                barberProfile: true,
                favorites: {
                    include: {
                        barber: { include: { user: true } }
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
}));
// GET /api/users/:id/bookings
router.get("/:id/bookings", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (req.user.id !== id) {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const bookings = yield db_1.prisma.booking.findMany({
            where: { clientId: id },
            include: {
                barber: { include: { user: true } },
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
// Helper to map barber profile to frontend interface
const mapBarber = (profile) => {
    const { user } = profile, rest = __rest(profile, ["user"]);
    return Object.assign(Object.assign(Object.assign({}, user), rest), { specialties: JSON.parse(rest.specialties), schedule: JSON.parse(rest.schedule), portfolio: JSON.parse(rest.portfolio), holidays: rest.holidays ? JSON.parse(rest.holidays) : undefined });
};
// GET /api/users/:id/favorites
router.get("/:id/favorites", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (req.user.id !== id) {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const favorites = yield db_1.prisma.favorite.findMany({
            where: { userId: id },
            include: {
                barber: { include: { user: true, services: true } }
            }
        });
        // Map to return just the barber objects as expected by frontend
        const barbers = favorites.map((f) => mapBarber(f.barber));
        res.json(barbers);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
}));
// POST /api/users/:id/favorites
router.post("/:id/favorites", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { barberId } = req.body;
    if (req.user.id !== id) {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const favorite = yield db_1.prisma.favorite.create({
            data: {
                userId: id,
                barberId
            }
        });
        res.json(favorite);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to add favorite" });
    }
}));
// DELETE /api/users/:id/favorites/:barberId
router.delete("/:id/favorites/:barberId", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, barberId } = req.params;
    if (req.user.id !== id) {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        // We need to find the favorite entry first or deleteMany
        yield db_1.prisma.favorite.deleteMany({
            where: {
                userId: id,
                barberId
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to remove favorite" });
    }
}));
exports.default = router;
