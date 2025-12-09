import { Router } from "express"
import { prisma } from "../db"
import { authenticateToken, AuthRequest } from "../middleware/auth"

const router = Router()

// GET /api/bookings (User's bookings)
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
	const userId = req.user!.id

	try {
		const bookings = await prisma.booking.findMany({
			where: { clientId: String(userId) }, // Assuming clientId is stored as string in DB based on previous code, but user.id is number. Let's check schema if possible, but previous code used string.
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
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
	const { barberId, serviceId, date, time } = req.body
	const clientId = req.user!.id

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
router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
	const { id } = req.params
	const { status, comment } = req.body
	const userId = req.user!.id

	try {
		const booking = await prisma.booking.findUnique({
			where: { id },
			include: { barber: true }
		})

		if (!booking) {
			return res.status(404).json({ error: "Booking not found" })
		}

		// Only the barber associated with the booking can update status/comment
		// Or maybe the client can add a comment? For now, let's restrict to barber for status.
		if (booking.barber.userId !== userId) {
			return res.status(403).json({ error: "Not authorized to update this booking" })
		}

		const updatedBooking = await prisma.booking.update({
			where: { id },
			data: { status, comment } as any
		})
		res.json(updatedBooking)
	} catch (error) {
		res.status(500).json({ error: "Update failed" })
	}
})

// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", authenticateToken, async (req: AuthRequest, res) => {
	const { id } = req.params
	const userId = req.user!.id

	try {
		const booking = await prisma.booking.findUnique({
			where: { id },
			include: { barber: true }
		})

		if (!booking) {
			return res.status(404).json({ error: "Booking not found" })
		}

		// Client or Barber can cancel
		if (booking.clientId !== userId && booking.barber.userId !== userId) {
			return res.status(403).json({ error: "Not authorized to cancel this booking" })
		}

		const updatedBooking = await prisma.booking.update({
			where: { id },
			data: { status: "cancelled" }
		})
		res.json(updatedBooking)
	} catch (error) {
		res.status(500).json({ error: "Cancellation failed" })
	}
})

export default router
