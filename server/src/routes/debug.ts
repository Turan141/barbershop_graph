import { Router } from "express"
import { prisma } from "../db"

const router = Router()

function getRedactedDbInfo() {
	const raw = process.env.DATABASE_URL
	if (!raw) return { configured: false as const }

	try {
		const url = new URL(raw)
		return {
			configured: true as const,
			host: url.host,
			database: url.pathname?.replace(/^\//, "") || null
		}
	} catch {
		return { configured: true as const, host: null, database: null }
	}
}

// GET /api/debug/stats
// Guarded by DEBUG_KEY header to avoid leaking production details.
router.get("/stats", async (req, res) => {
	const expectedKey = process.env.DEBUG_KEY
	if (!expectedKey) {
		return res.status(404).json({ error: "Not found" })
	}

	const providedKey = String(req.header("x-debug-key") || "")
	if (!providedKey || providedKey !== expectedKey) {
		return res.status(403).json({ error: "Forbidden" })
	}

	try {
		const [users, barbers, services, bookings, favorites, reviews] = await Promise.all([
			prisma.user.count(),
			prisma.barberProfile.count(),
			prisma.service.count(),
			prisma.booking.count(),
			prisma.favorite.count(),
			prisma.review.count()
		])

		res.json({
			ok: true,
			env: {
				nodeEnv: process.env.NODE_ENV || null,
				vercel: process.env.VERCEL || null,
				vercelEnv: process.env.VERCEL_ENV || null
			},
			db: getRedactedDbInfo(),
			counts: { users, barbers, services, bookings, favorites, reviews }
		})
	} catch (error) {
		res.status(500).json({ error: "Failed to collect stats" })
	}
})

export default router
