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
    try {
        const { user } = profile, rest = __rest(profile, ["user"]);
        return Object.assign(Object.assign(Object.assign({}, user), rest), { 
            // Ensure ID is the barber profile ID, not user ID (though spread order handles this, let's be explicit if needed, but rest.id comes after user.id)
            specialties: JSON.parse(rest.specialties), schedule: JSON.parse(rest.schedule), portfolio: JSON.parse(rest.portfolio), holidays: rest.holidays ? JSON.parse(rest.holidays) : undefined });
    }
    catch (e) {
        console.error('Error mapping barber profile:', profile.id, e);
        throw e;
    }
};
// GET /api/barbers
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    const where = {};
    if (query) {
        const search = query;
        where.OR = [
            { user: { name: { contains: search } } },
            { location: { contains: search } },
            { services: { some: { name: { contains: search } } } }
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
        console.error('Error fetching barbers:', error);
        res.status(500).json({ error: 'Failed to fetch barbers' });
    }
}));
// GET /api/barbers/:id
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const barber = yield db_1.prisma.barberProfile.findUnique({
            where: { id },
            include: {
                user: true,
                services: true,
                bookings: true
            }
        });
        if (!barber) {
            return res.status(404).json({ error: 'Barber not found' });
        }
        res.json(mapBarber(barber));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch barber' });
    }
}));
// GET /api/barbers/:id/bookings
router.get("/:id/bookings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const bookings = yield db_1.prisma.booking.findMany({
            where: { barberId: id },
            include: {
                client: true,
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
exports.default = router;
