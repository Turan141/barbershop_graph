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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const RESET_TOKEN_EXPIRY_MINUTES = 60;
const hashResetToken = (token) => crypto_1.default.createHash("sha256").update(token).digest("hex");
// POST /api/auth/login
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        let user = yield db_1.prisma.user.findUnique({
            where: { email },
            include: { barberProfile: true }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate real JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, (0, config_1.getJwtSecret)(), {
            expiresIn: "30d"
        });
        const _a = user, { password: _ } = _a, userWithoutPassword = __rest(_a, ["password"]);
        res.json({ user: userWithoutPassword, token });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
}));
// POST /api/auth/register
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role, phone } = req.body;
    console.log("Register request received:", { name, email, role });
    const normalizedRole = role ? String(role).trim().toLowerCase() : "client";
    try {
        const existingUser = yield db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield db_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: normalizedRole,
                phone,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            }
        });
        if (normalizedRole === "barber") {
            console.log(`Creating barber profile for user ${user.id}`);
            try {
                const trialEndDate = new Date();
                trialEndDate.setDate(trialEndDate.getDate() + 30);
                yield db_1.prisma.barberProfile.create({
                    data: {
                        userId: user.id,
                        specialties: JSON.stringify([]),
                        location: "Baku",
                        bio: "New barber",
                        portfolio: JSON.stringify([]),
                        schedule: JSON.stringify({
                            Monday: ["09:00", "18:00"],
                            Tuesday: ["09:00", "18:00"],
                            Wednesday: ["09:00", "18:00"],
                            Thursday: ["09:00", "18:00"],
                            Friday: ["09:00", "18:00"]
                        }),
                        subscriptionStatus: "trial",
                        subscriptionEndDate: trialEndDate
                    }
                });
                console.log(`Barber profile created for user ${user.id}`);
            }
            catch (profileError) {
                console.error("Failed to create barber profile:", profileError);
                // If profile creation fails, delete the user and return error
                yield db_1.prisma.user.delete({ where: { id: user.id } });
                return res.status(500).json({ error: "Failed to create barber profile" });
            }
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, (0, config_1.getJwtSecret)(), {
            expiresIn: "30d"
        });
        const _a = user, { password: _ } = _a, userWithoutPassword = __rest(_a, ["password"]);
        res.json({ user: userWithoutPassword, token });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
}));
// POST /api/auth/refresh — issues a new 30-day token for any currently valid token
router.post("/refresh", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = jsonwebtoken_1.default.sign({ id: req.user.id, role: req.user.role }, (0, config_1.getJwtSecret)(), {
            expiresIn: "30d"
        });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ error: "Token refresh failed" });
    }
}));
// POST /api/auth/forgot-password
router.post("/forgot-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    try {
        const user = yield db_1.prisma.user.findFirst({
            where: {
                email: {
                    equals: normalizedEmail,
                    mode: "insensitive"
                }
            },
            select: { id: true, email: true }
        });
        // Always return success to avoid user enumeration
        if (!user) {
            return res.json({
                success: true,
                message: "If that email exists, a reset link has been generated."
            });
        }
        // Invalidate previous unused reset tokens for this user
        yield db_1.prisma.passwordResetToken.updateMany({
            where: {
                userId: user.id,
                usedAt: null
            },
            data: {
                usedAt: new Date()
            }
        });
        const rawToken = crypto_1.default.randomBytes(32).toString("hex");
        const tokenHash = hashResetToken(rawToken);
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
        yield db_1.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt
            }
        });
        const frontendBase = process.env.RESET_PASSWORD_BASE_URL || process.env.FRONTEND_URL;
        const resetUrl = frontendBase
            ? `${frontendBase.replace(/\/$/, "")}/reset-password?token=${rawToken}`
            : `/reset-password?token=${rawToken}`;
        console.log("[PASSWORD_RESET] link generated", {
            email: user.email,
            resetUrl,
            expiresAt: expiresAt.toISOString()
        });
        return res.json({
            success: true,
            message: "If that email exists, a reset link has been generated.",
            // Return for manual flows/dev; can be hidden by client in production UI
            resetUrl
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Failed to process forgot password request" });
    }
}));
// POST /api/auth/reset-password
router.post("/reset-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body || {};
    if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Reset token is required" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    try {
        const tokenHash = hashResetToken(token);
        const now = new Date();
        const resetToken = yield db_1.prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: {
                    gt: now
                }
            },
            include: {
                user: {
                    select: {
                        id: true
                    }
                }
            }
        });
        if (!resetToken) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: resetToken.user.id },
                data: { password: hashedPassword }
            }),
            db_1.prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: now }
            }),
            db_1.prisma.passwordResetToken.updateMany({
                where: {
                    userId: resetToken.user.id,
                    usedAt: null
                },
                data: { usedAt: now }
            })
        ]);
        return res.json({ success: true, message: "Password has been reset successfully" });
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Failed to reset password" });
    }
}));
exports.default = router;
