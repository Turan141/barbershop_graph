import { Router } from "express"
import { prisma } from "../db"

const router = Router()

const mapBarber = (profile: any) => {
	const { user, ...rest } = profile
	return {
		...user, // name, email, role, avatarUrl
		...rest, // id, rating, location, etc.
		// Ensure ID is the barber profile ID, not user ID (though spread order handles this, let's be explicit if needed, but rest.id comes after user.id)
		specialties: JSON.parse(rest.specialties),
		schedule: JSON.parse(rest.schedule),
		portfolio: JSON.parse(rest.portfolio),
		holidays: rest.holidays ? JSON.parse(rest.holidays) : undefined
	}
}

// GET /api/barbers
router.get("/", async (req, res) => {
	const { query } = req.query

	const where: any = {}
	if (query) {
		const search = query as string
		where.OR = [
			{ user: { name: { contains: search } } },
			{ location: { contains: search } },
			{ services: { some: { name: { contains: search } } } }
		]
	}

	try {
		const barbers = await prisma.barberProfile.findMany({
			where,
			include: {
				user: true,
				services: true
			}
		})
		res.json(barbers.map(mapBarber))
	} catch (error) {
		console.error("Error fetching barbers:", error)
		res.status(500).json({ error: "Failed to fetch barbers" })
	}
})

// GET /api/barbers/:id
router.get("/:id", async (req, res) => {
	const { id } = req.params
	try {
		let barber = await prisma.barberProfile.findUnique({
			where: { id },
			include: {
				user: true,
				services: true,
				bookings: true
			}
		})

		if (!barber) {
			// Try finding by userId
			barber = await prisma.barberProfile.findUnique({
				where: { userId: id },
				include: {
					user: true,
					services: true,
					bookings: true
				}
			})
		}

		if (!barber) {
			return res.status(404).json({ error: "Barber not found" })
		}

		res.json(mapBarber(barber))
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch barber" })
	}
})

// GET /api/barbers/:id/bookings
router.get("/:id/bookings", async (req, res) => {
	const { id } = req.params
	try {
		const bookings = await prisma.booking.findMany({
			where: { barberId: id },
			include: {
				client: true,
				service: true
			},
			orderBy: { date: "desc" }
		})
		res.json(bookings)
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch bookings" })
	}
})

export default router
