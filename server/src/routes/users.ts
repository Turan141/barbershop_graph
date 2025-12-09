import { Router } from "express"
import { prisma } from "../db"
import { authenticateToken, AuthRequest } from "../middleware/auth"

const router = Router()

// Helper to map barber profile to frontend interface
const mapBarber = (profile: any) => {
	const { user, ...rest } = profile
	return {
		...user,
		...rest,
		specialties:
			typeof rest.specialties === "string"
				? JSON.parse(rest.specialties)
				: rest.specialties,
		schedule:
			typeof rest.schedule === "string" ? JSON.parse(rest.schedule) : rest.schedule,
		portfolio:
			typeof rest.portfolio === "string" ? JSON.parse(rest.portfolio) : rest.portfolio,
		holidays: rest.holidays
			? typeof rest.holidays === "string"
				? JSON.parse(rest.holidays)
				: rest.holidays
			: undefined
	}
}

// GET /api/users/:id
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
	const { id } = req.params

	if (req.user!.id !== id) {
		return res.status(403).json({ error: "Access denied" })
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id },
			include: {
				barberProfile: true,
				favorites: {
					include: {
						barber: { include: { user: true } }
					}
				}
			}
		})

		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		res.json(user)
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch user" })
	}
})

// GET /api/users/:id/bookings
router.get("/:id/bookings", authenticateToken, async (req: AuthRequest, res) => {
	const { id } = req.params

	if (req.user!.id !== id) {
		return res.status(403).json({ error: "Access denied" })
	}

	try {
		const bookings = await prisma.booking.findMany({
			where: { clientId: id },
			include: {
				barber: { include: { user: true } },
				service: true
			},
			orderBy: { date: "desc" }
		})

		const mappedBookings = bookings.map((booking) => ({
			...booking,
			barber: booking.barber ? mapBarber(booking.barber) : null
		}))

		res.json(mappedBookings)
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch bookings" })
	}
})

// GET /api/users/:id/favorites
router.get("/:id/favorites", authenticateToken, async (req: AuthRequest, res) => {
	const { id } = req.params

	if (req.user!.id !== id) {
		return res.status(403).json({ error: "Access denied" })
	}

	try {
		const favorites = await prisma.favorite.findMany({
			where: { userId: id },
			include: {
				barber: { include: { user: true, services: true } }
			}
		})
		// Map to return just the barber objects as expected by frontend
		const barbers = favorites.map((f) => mapBarber(f.barber))
		res.json(barbers)
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch favorites" })
	}
})

// POST /api/users/:id/favorites
router.post("/:id/favorites", authenticateToken, async (req: AuthRequest, res) => {
	const { id } = req.params
	const { barberId } = req.body

	if (req.user!.id !== id) {
		return res.status(403).json({ error: "Access denied" })
	}

	try {
		const favorite = await prisma.favorite.create({
			data: {
				userId: id,
				barberId
			}
		})
		res.json(favorite)
	} catch (error) {
		res.status(500).json({ error: "Failed to add favorite" })
	}
})

// DELETE /api/users/:id/favorites/:barberId
router.delete(
	"/:id/favorites/:barberId",
	authenticateToken,
	async (req: AuthRequest, res) => {
		const { id, barberId } = req.params

		if (req.user!.id !== id) {
			return res.status(403).json({ error: "Access denied" })
		}

		try {
			// We need to find the favorite entry first or deleteMany
			await prisma.favorite.deleteMany({
				where: {
					userId: id,
					barberId
				}
			})
			res.json({ success: true })
		} catch (error) {
			res.status(500).json({ error: "Failed to remove favorite" })
		}
	}
)

export default router
