import cors from "cors"

export function requireEnv(name: string): string {
	const value = process.env[name]
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`)
	}
	return value
}

export function getJwtSecret(): string {
	// Always require an explicit secret; do not fall back to an insecure default.
	return requireEnv("JWT_SECRET")
}

export function getCorsOptions(): cors.CorsOptions {
	const raw = process.env.CORS_ORIGINS || ""
	const allowList = raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)

	// In development, if no allowlist is provided, allow all origins.
	if (allowList.length === 0 && process.env.NODE_ENV !== "production") {
		return {
			origin: true,
			credentials: true
		}
	}

	return {
		origin: (origin, callback) => {
			// Allow non-browser clients (no Origin header) like curl/Capacitor native.
			if (!origin) return callback(null, true)
			if (allowList.includes("*") || allowList.includes(origin)) return callback(null, true)
			console.error(`CORS blocked origin: ${origin}. Allowed: ${JSON.stringify(allowList)}`)
			return callback(new Error("Not allowed by CORS"))
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"]
	}
}
