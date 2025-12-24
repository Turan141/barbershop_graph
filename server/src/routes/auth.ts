import { Router } from "express"
import { prisma } from "../db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getJwtSecret } from "../config"

const router = Router()

// POST /api/auth/login
router.post("/login", async (req, res) => {
	const { email, password } = req.body

	try {
		let user = await prisma.user.findUnique({
			where: { email },
			include: { barberProfile: true }
		})

		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const isPasswordValid = await bcrypt.compare(password, (user as any).password)
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		// Generate real JWT
		const token = jwt.sign({ id: user.id, role: user.role }, getJwtSecret(), {
			expiresIn: "24h"
		})

		const { password: _, ...userWithoutPassword } = user as any
		res.json({ user: userWithoutPassword, token })
	} catch (error) {
		console.error("Login error:", error)
		res.status(500).json({ error: "Login failed" })
	}
})

// POST /api/auth/register
router.post("/register", async (req, res) => {
	const { name, email, password, role } = req.body
	console.log("Register request received:", { name, email, role })

	const normalizedRole = role ? String(role).trim().toLowerCase() : "client"

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } })
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" })
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: normalizedRole,
				avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
					name
				)}&background=random`
			} as any
		})

		if (normalizedRole === "barber") {
			console.log(`Creating barber profile for user ${user.id}`)
			try {
				const trialEndDate = new Date()
				trialEndDate.setDate(trialEndDate.getDate() + 30)

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
						}),
						subscriptionStatus: "trial",
						subscriptionEndDate: trialEndDate
					}
				})
				console.log(`Barber profile created for user ${user.id}`)
			} catch (profileError) {
				console.error("Failed to create barber profile:", profileError)
				// If profile creation fails, delete the user and return error
				await prisma.user.delete({ where: { id: user.id } })
				return res.status(500).json({ error: "Failed to create barber profile" })
			}
		}

		const token = jwt.sign({ id: user.id, role: user.role }, getJwtSecret(), {
			expiresIn: "24h"
		})
		const { password: _, ...userWithoutPassword } = user as any
		res.json({ user: userWithoutPassword, token })
	} catch (error) {
		console.error("Registration error:", error)
		res.status(500).json({ error: "Registration failed" })
	}
})

export default router
