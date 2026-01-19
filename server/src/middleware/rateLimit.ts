import rateLimit from "express-rate-limit"

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 50,
	standardHeaders: true,
	legacyHeaders: false
})

export const bookingsLimiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 120,
	standardHeaders: true,
	legacyHeaders: false
})

export const createBookingLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour window
	max: 10, // Limit each IP to 10 booking creation requests per hour
	message: { error: "Too many booking attempts, please try again later." },
	standardHeaders: true,
	legacyHeaders: false
})
