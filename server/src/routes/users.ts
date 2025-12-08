import { Router } from "express"
import { prisma } from "../db"

const router = Router()

// GET /api/users/:id
router.get("/:id", async (req, res) => {
	const { id } = req.params
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
router.get("/:id/bookings", async (req, res) => {
	const { id } = req.params
	try {
		const bookings = await prisma.booking.findMany({
			where: { clientId: id },
			include: {
				barber: { include: { user: true } },
				service: true
			},
			orderBy: { date: "desc" }
		})
		res.json(bookings)
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch bookings" })
	}
})

// Helper to map barber profile to frontend interface
const mapBarber = (profile: any) => {
	const { user, ...rest } = profile
	return {
		...user,
		...rest,
		specialties: JSON.parse(rest.specialties),
		schedule: JSON.parse(rest.schedule),
		portfolio: JSON.parse(rest.portfolio),
		holidays: rest.holidays ? JSON.parse(rest.holidays) : undefined
	}
}

// GET /api/users/:id/favorites
router.get("/:id/favorites", async (req, res) => {
	const { id } = req.params
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
router.post("/:id/favorites", async (req, res) => {
	const { id } = req.params
	const { barberId } = req.body

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
router.delete("/:id/favorites/:barberId", async (req, res) => {
	const { id, barberId } = req.params

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
})

export default router
