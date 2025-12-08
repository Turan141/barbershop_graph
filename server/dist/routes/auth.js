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
const index_1 = require("../index");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        let user = yield index_1.prisma.user.findUnique({
            where: { email },
            include: { barberProfile: true }
        });
        if (!user) {
            // For demo purposes, if user doesn't exist, maybe we should fail?
            // But the mock allowed "client@test.com" and "barber@test.com".
            // Let's return 404 if not found, or auto-create?
            // The contract says "Login", usually implies existing user.
            // But the mock db had them. I will seed them.
            return res.status(404).json({ error: "User not found" });
        }
        // Mock token
        const token = "mock-jwt-token-" + user.id;
        res.json({ user, token });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
}));
// POST /api/auth/register
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, role } = req.body;
    try {
        const existingUser = yield index_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const user = yield index_1.prisma.user.create({
            data: {
                name,
                email,
                role,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            }
        });
        const token = "mock-jwt-token-" + user.id;
        res.json({ user, token });
    }
    catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
}));
exports.default = router;
