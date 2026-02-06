import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { getCorsOptions, requireEnv } from "./config"
import { authLimiter, bookingsLimiter } from "./middleware/rateLimit"
import { initSocket } from "./socket"

dotenv.config()

// Fail fast if critical secrets are missing.
requireEnv("JWT_SECRET")

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3000

// Initialize Socket.IO
// Note: This works for local dev and VPS.
// For Vercel Serverless, WebSockets generally require a 3rd party service (Pusher/Ably)
// because the server execution is ephemeral.
initSocket(httpServer)

// Needed when running behind proxies (e.g., Vercel) so rate limiting uses the real client IP.
app.set("trust proxy", 1)

app.use(cors(getCorsOptions()))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Routes will go here
import authRoutes from "./routes/auth"
import barberRoutes from "./routes/barbers"
import bookingRoutes from "./routes/bookings"
import userRoutes from "./routes/users"
import debugRoutes from "./routes/debug"

app.use("/api/auth", authLimiter, authRoutes)
app.use("/api/barbers", barberRoutes)
app.use("/api/bookings", bookingsLimiter, bookingRoutes)
app.use("/api/users", userRoutes)
app.use("/api/debug", debugRoutes)

if (require.main === module) {
	httpServer.listen(Number(PORT), "0.0.0.0", () => {
		console.log(`Server running on http://0.0.0.0:${PORT}`)
	})
}

export default app
