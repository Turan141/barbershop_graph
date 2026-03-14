import { Router } from "express"
import { prisma } from "../db"
import { authenticateToken, AuthRequest } from "../middleware/auth"
import { getVapidPublicKey } from "../push"

const router = Router()

// GET /api/push/vapid-key — public, returns the VAPID public key
router.get("/vapid-key", (_req, res) => {
	const key = getVapidPublicKey()
	if (!key) {
		return res.status(503).json({ error: "Push notifications not configured" })
	}
	res.json({ publicKey: key })
})

// POST /api/push/subscribe — save a push subscription for the authenticated user
router.post("/subscribe", authenticateToken, async (req: AuthRequest, res) => {
	const userId = req.user!.id
	const { endpoint, keys } = req.body

	if (!endpoint || !keys?.p256dh || !keys?.auth) {
		return res.status(400).json({ error: "Invalid push subscription" })
	}

	try {
		await prisma.pushSubscription.upsert({
			where: { endpoint },
			update: { userId, p256dh: keys.p256dh, auth: keys.auth },
			create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth }
		})
		res.json({ success: true })
	} catch (error) {
		console.error("Failed to save push subscription:", error)
		res.status(500).json({ error: "Failed to save subscription" })
	}
})

// DELETE /api/push/subscribe — remove a push subscription
router.delete("/subscribe", authenticateToken, async (req: AuthRequest, res) => {
	const { endpoint } = req.body

	if (!endpoint) {
		return res.status(400).json({ error: "Missing endpoint" })
	}

	try {
		await prisma.pushSubscription.deleteMany({ where: { endpoint } })
		res.json({ success: true })
	} catch (error) {
		res.status(500).json({ error: "Failed to remove subscription" })
	}
})

export default router
