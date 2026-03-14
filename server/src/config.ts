import cors from "cors"

function normalizeOrigin(value?: string): string | null {
	if (!value) return null
	const trimmed = value.trim()
	if (!trimmed) return null
	if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
		return trimmed.toLowerCase()
	}
	return `https://${trimmed}`.toLowerCase()
}

function matchesAllowedOrigin(origin: string, allowList: string[]): boolean {
	const normalizedOrigin = origin.toLowerCase()

	return allowList.some((allowed) => {
		const normalizedAllowed = allowed.toLowerCase()
		if (normalizedAllowed === "*") return true

		// Supports wildcard patterns like https://*.vercel.app
		if (normalizedAllowed.includes("*")) {
			const escaped = normalizedAllowed
				.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
				.replace(/\*/g, ".*")
			return new RegExp(`^${escaped}$`).test(normalizedOrigin)
		}

		return normalizedAllowed === normalizedOrigin
	})
}

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
	const envAllowList = raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)

	const isProd = process.env.NODE_ENV === "production"
	const autoVercelOrigins = isProd
		? [
				normalizeOrigin(process.env.FRONTEND_URL),
				normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
				normalizeOrigin(process.env.VERCEL_URL)
		  ].filter((v): v is string => Boolean(v))
		: []

	const allowList = Array.from(new Set([...envAllowList, ...autoVercelOrigins]))

	// In development, if no allowlist is provided, allow all origins.
	if (allowList.length === 0 && !isProd) {
		return {
			origin: true,
			credentials: true
		}
	}

	if (allowList.length === 0 && isProd) {
		// Safe fallback for Vercel-hosted frontends when env vars are missing.
		allowList.push("https://*.vercel.app")
	}

	return {
		origin: (origin, callback) => {
			// Allow non-browser clients (no Origin header) like curl/Capacitor native.
			if (!origin) return callback(null, true)
			if (matchesAllowedOrigin(origin, allowList))
				return callback(null, true)
			console.error(
				`CORS blocked origin: ${origin}. Allowed: ${JSON.stringify(allowList)}`
			)
			return callback(new Error("Not allowed by CORS"))
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"]
	}
}
