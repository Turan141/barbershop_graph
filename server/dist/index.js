"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes will go here
const auth_1 = __importDefault(require("./routes/auth"));
const barbers_1 = __importDefault(require("./routes/barbers"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const users_1 = __importDefault(require("./routes/users"));
app.use("/api/auth", auth_1.default);
app.use("/api/barbers", barbers_1.default);
app.use("/api/bookings", bookings_1.default);
app.use("/api/users", users_1.default);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
