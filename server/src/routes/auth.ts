import { Router } from "express"
import { prisma } from "../db"

const router = Router()

// POST /api/auth/login
router.post("/login", async (req, res) => {
	const { email } = req.body

	try {
		let user = await prisma.user.findUnique({
			where: { email },
			include: { barberProfile: true }
		})

		if (!user) {
			// For demo purposes, if user doesn't exist, maybe we should fail?
			// But the mock allowed "client@test.com" and "barber@test.com".
			// Let's return 404 if not found, or auto-create?
			// The contract says "Login", usually implies existing user.
			// But the mock db had them. I will seed them.
			return res.status(404).json({ error: "User not found" })
		}

		// Mock token
		const token = "mock-jwt-token-" + user.id

		res.json({ user, token })
	} catch (error) {
		res.status(500).json({ error: "Login failed" })
	}
})

// POST /api/auth/register
router.post("/register", async (req, res) => {
	const { name, email, role } = req.body

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } })
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" })
		}

		const user = await prisma.user.create({
			data: {
				name,
				email,
				role,
				avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
					name
				)}&background=random`
			}
		})

		if (role === "barber") {
			await prisma.barberProfile.create({
				data: {
					userId: user.id,
					specialties: JSON.stringify([]),
					location: "Baku",
					bio: "New barber",
					portfolio: JSON.stringify([]),
					schedule: JSON.stringify({
						Monday: ["09:00", "18:00"],
						Tuesday: ["09:00", "18:00"],
						Wednesday: ["09:00", "18:00"],
						Thursday: ["09:00", "18:00"],
						Friday: ["09:00", "18:00"]
					})
				}
			})
		}

		const token = "mock-jwt-token-" + user.id
		res.json({ user, token })
	} catch (error) {
		res.status(500).json({ error: "Registration failed" })
	}
})

export default router
