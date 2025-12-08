import { Router } from "express"
import { prisma } from "../db"

const router = Router()

// GET /api/bookings (User's bookings)
router.get("/", async (req, res) => {
	// In a real app, we'd get userId from the token middleware.
	// For now, we'll accept a query param or header for simplicity, or just fetch all for the demo if no auth middleware is strictly enforced yet.
	// But let's assume the frontend sends a userId in query for now to keep it simple without full JWT implementation
	const userId = req.query.userId as string

	if (!userId) {
		return res.status(400).json({ error: "User ID required" })
	}

	try {
		const bookings = await prisma.booking.findMany({
			where: { clientId: userId },
			include: {
				barber: {
					include: { user: true }
				},
				service: true
			},
			orderBy: { date: "desc" }
		})
		res.json(bookings)
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch bookings" })
	}
})

// POST /api/bookings
router.post("/", async (req, res) => {
	const { clientId, barberId, serviceId, date, time } = req.body

	try {
		const booking = await prisma.booking.create({
			data: {
				clientId,
				barberId,
				serviceId,
				date,
				time,
				status: "pending"
			},
			include: {
				barber: { include: { user: true } },
				service: true
			}
		})
		res.json(booking)
	} catch (error) {
		res.status(500).json({ error: "Booking failed" })
	}
})

// PATCH /api/bookings/:id
router.patch("/:id", async (req, res) => {
	const { id } = req.params
	const { status, comment } = req.body

	try {
		const booking = await prisma.booking.update({
			where: { id },
			data: { status, comment }
		})
		res.json(booking)
	} catch (error) {
		res.status(500).json({ error: "Update failed" })
	}
})

// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", async (req, res) => {
	const { id } = req.params
	try {
		const booking = await prisma.booking.update({
			where: { id },
			data: { status: "cancelled" }
		})
		res.json(booking)
	} catch (error) {
		res.status(500).json({ error: "Cancellation failed" })
	}
})

export default router
