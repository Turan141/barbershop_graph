"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config");
const rateLimit_1 = require("./middleware/rateLimit");
dotenv_1.default.config();
// Fail fast if critical secrets are missing.
(0, config_1.requireEnv)("JWT_SECRET");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
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
app.use("/api/auth", rateLimit_1.authLimiter, auth_1.default);
app.use("/api/barbers", barbers_1.default);
app.use("/api/bookings", rateLimit_1.bookingsLimiter, bookings_1.default);
app.use("/api/users", users_1.default);
app.use("/api/debug", debug_1.default);
if (require.main === module) {
    app.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}
exports.default = app;
