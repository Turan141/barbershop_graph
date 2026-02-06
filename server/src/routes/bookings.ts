import { Router } from "express"
import { prisma } from "../db"
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth"
import { createBookingLimiter } from "../middleware/rateLimit"
import { getIO } from "../socket"
import { Prisma } from "@prisma/client"

const router = Router()

// GET /api/bookings (User's bookings)
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
	const userId = req.user!.id
	const page = req.query.page ? Number(req.query.page) : undefined
	const limit = req.query.limit ? Number(req.query.limit) : 20

	try {
		if (page) {
			const skip = (page - 1) * limit
			const [bookings, total] = await prisma.$transaction([
				prisma.booking.findMany({
					where: { clientId: userId },
					include: {
						barber: {
							include: { user: true }
						},
						service: true
					},
					orderBy: { date: "desc" },
					skip,
					take: limit
				}),
				prisma.booking.count({ where: { clientId: userId } })
			])
			return res.json({
				data: bookings,
				meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
			})
		}

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
router.post("/", createBookingLimiter, optionalAuth, async (req: AuthRequest, res) => {
	const { barberId, serviceId, date, time, guestName, guestPhone, asGuest } = req.body

	let clientId: string | undefined
	if (req.user && !asGuest) {
		// Allow barbers to book too (e.g. for themselves or testing)
		// if (req.user.role !== "client") {
		// 	return res.status(403).json({ error: "Only clients can create bookings" })
		// }
		clientId = req.user.id
	} else {
		// Guest validation
		if (!guestName || !guestPhone) {
			return res
				.status(400)
				.json({ error: "Name and phone are required for guest booking" })
		}

		// Security: Check for spamming from same guest phone number
		// Limit: Max 2 pending bookings per phone number
		const pendingGuestBookings = await prisma.booking.count({
			where: {
				guestPhone,
				status: { in: ["pending", "confirmed"] },
				date: { gte: new Date().toISOString().split("T")[0] } // Only count future/today bookings
			}
		})

		if (pendingGuestBookings >= 2) {
			return res.status(429).json({
				error:
					"You have reached the maximum limit of active bookings for this phone number.",
				errorCode: "MAX_GUEST_BOOKINGS_REACHED"
			})
		}
	}

	if (typeof barberId !== "string" || typeof serviceId !== "string") {
		return res.status(400).json({ error: "Invalid barberId or serviceId" })
	}
	if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return res.status(400).json({ error: "Invalid date. Expected YYYY-MM-DD" })
	}
	if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
		return res.status(400).json({ error: "Invalid time. Expected HH:mm" })
	}

	const slotKey = `${barberId}:${date}:${time}`

	try {
		const [barberProfile, service] = await Promise.all([
			prisma.barberProfile.findUnique({
				where: { id: barberId },
				select: {
					id: true,
					userId: true,
					subscriptionStatus: true,
					subscriptionPlan: true,
					subscriptionEndDate: true
				}
			}),
			prisma.service.findUnique({
				where: { id: serviceId },
				select: { id: true, barberId: true }
			})
		])

		if (!barberProfile) {
			return res.status(404).json({ error: "Barber not found" })
		}

		// Check subscription status (Soft Lock)
		// Allow the barber themselves to book (manual entry), but block clients if expired
		const isBarberOwner = req.user?.id === barberProfile.userId
		if (!isBarberOwner) {
			const isExpired =
				barberProfile.subscriptionStatus !== "active" &&
				barberProfile.subscriptionEndDate &&
				new Date(barberProfile.subscriptionEndDate) < new Date()

			if (isExpired) {
				return res.status(403).json({
					error: "This barber is currently not accepting online bookings.",
					errorCode: "BARBER_SUBSCRIPTION_EXPIRED"
				})
			}

			// Check Basic Plan Limit (50 bookings/month)
			if (barberProfile.subscriptionPlan === "basic") {
				const now = new Date()
				const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
				const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

				const monthlyBookings = await prisma.booking.count({
					where: {
						barberId: barberProfile.id,
						date: {
							gte: startOfMonth.toISOString().split("T")[0],
							lte: endOfMonth.toISOString().split("T")[0]
						}
					}
				})

				if (monthlyBookings >= 50) {
					return res.status(403).json({
						error: "This barber has reached their monthly booking limit.",
						errorCode: "BARBER_LIMIT_REACHED"
					})
				}
			}
		}

		if (!service) {
			return res.status(404).json({ error: "Service not found" })
		}
		if (service.barberId !== barberId) {
			return res.status(400).json({ error: "Service does not belong to this barber" })
		}

		// 1. Prevent Double Booking (fast path)
		const existingBooking = await prisma.booking.findFirst({
			where: { slotKey } as any
		})

		if (existingBooking) {
			return res.status(409).json({
				error: "This time slot is already booked",
				errorCode: "SLOT_ALREADY_BOOKED"
			})
		}

		// 2. Limit Active Bookings (Anti-Spam) - Only for registered users
		if (clientId) {
			const activeBookingsCount = await prisma.booking.count({
				where: {
					clientId,
					status: { in: ["pending", "confirmed"] }
				}
			})

			if (activeBookingsCount >= 3) {
				return res.status(429).json({
					error: "You have reached the maximum limit of 3 active bookings.",
					errorCode: "MAX_ACTIVE_BOOKINGS_REACHED"
				})
			}
		}

		let booking
		try {
			booking = await prisma.booking.create({
				data: {
					clientId,
					guestName,
					guestPhone,
					barberId,
					serviceId,
					date,
					time,
					slotKey,
					status: "pending"
				} as any,
				include: {
					barber: { include: { user: true } },
					service: true
				}
			})

			try {
				getIO().to(`barber_${barberId}`).emit("bookingCreated", booking)
			} catch (e) {
				// Socket io might not be initialized (e.g. in Vercel serverless functions)
				console.warn("Socket.io emit failed")
			}
		} catch (error) {
			// Race-safe: DB unique index rejects duplicate active slots
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				return res.status(409).json({
					error: "This time slot is already booked",
					errorCode: "SLOT_ALREADY_BOOKED"
				})
			}
			throw error
		}
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
		// Client can only cancel
		const isBarber = booking.barber.userId === userId
		const isClient = booking.clientId === userId

		if (!isBarber) {
			if (isClient && status === "cancelled") {
				// Allow client to cancel
			} else {
				return res.status(403).json({ error: "Not authorized to update this booking" })
			}
		}

		const updatedBooking = await prisma.booking.update({
			where: { id },
			data: {
				status,
				comment,
				...(status === "cancelled" ? { slotKey: null } : {})
			} as any
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
			data: { status: "cancelled", slotKey: null } as any
		})
		res.json(updatedBooking)
	} catch (error) {
		res.status(500).json({ error: "Cancellation failed" })
	}
})

export default router
