"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const config_1 = require("./config");
const rateLimit_1 = require("./middleware/rateLimit");
const socket_1 = require("./socket");
dotenv_1.default.config();
// Relaxing top-level fail-fast so server can boot and serve CORS headers on Vercel even if env vars are missing.
// Missing secrets will still throw inside the specific routes/functions that use them.
// requireEnv("JWT_SECRET")
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3000;
// Initialize Socket.IO
// Note: This works for local dev and VPS.
// For Vercel Serverless, WebSockets generally require a 3rd party service (Pusher/Ably)
// because the server execution is ephemeral.
(0, socket_1.initSocket)(httpServer);
// Needed when running behind proxies (e.g., Vercel) so rate limiting uses the real client IP.
app.set("trust proxy", 1);
app.use((0, cors_1.default)((0, config_1.getCorsOptions)()));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
// Routes will go here
const auth_1 = __importDefault(require("./routes/auth"));
const barbers_1 = __importDefault(require("./routes/barbers"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const users_1 = __importDefault(require("./routes/users"));
const debug_1 = __importDefault(require("./routes/debug"));
const push_1 = __importDefault(require("./routes/push"));
app.use("/api/auth", rateLimit_1.authLimiter, auth_1.default);
app.use("/api/barbers", barbers_1.default);
app.use("/api/bookings", rateLimit_1.bookingsLimiter, bookings_1.default);
app.use("/api/users", users_1.default);
app.use("/api/debug", debug_1.default);
app.use("/api/push", push_1.default);
app.get("/api/ping", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        env: {
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasDatabaseUrl: !!process.env.DATABASE_URL
        }
    });
});
// Global error handler to ensure JSON responses on errors (preserves CORS)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});
if (require.main === module) {
    httpServer.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}
exports.default = app;
