import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Routes will go here
import authRoutes from "./routes/auth"
import barberRoutes from "./routes/barbers"
import bookingRoutes from "./routes/bookings"
import userRoutes from "./routes/users"

app.use("/api/auth", authRoutes)
app.use("/api/barbers", barberRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/users", userRoutes)

if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`)
	})
}

export default app
