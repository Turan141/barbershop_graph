import { Router } from "express"
import { prisma } from "../db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { getJwtSecret } from "../config"
import { sendPasswordResetEmail } from "../mail"
import { authenticateToken, AuthRequest } from "../middleware/auth"

const router = Router()

const RESET_TOKEN_EXPIRY_MINUTES = 60

const hashResetToken = (token: string) =>
	crypto.createHash("sha256").update(token).digest("hex")

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
			expiresIn: "30d"
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
	const { name, email, password, role, phone } = req.body
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
				phone,
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
			expiresIn: "30d"
		})
		const { password: _, ...userWithoutPassword } = user as any
		res.json({ user: userWithoutPassword, token })
	} catch (error) {
		console.error("Registration error:", error)
		res.status(500).json({ error: "Registration failed" })
	}
})

// POST /api/auth/refresh — issues a new 30-day token for any currently valid token
router.post("/refresh", authenticateToken, async (req: AuthRequest, res) => {
	try {
		const token = jwt.sign({ id: req.user!.id, role: req.user!.role }, getJwtSecret(), {
			expiresIn: "30d"
		})
		res.json({ token })
	} catch (error) {
		res.status(500).json({ error: "Token refresh failed" })
	}
})

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
	const { email } = req.body || {}

	if (!email || typeof email !== "string") {
		return res.status(400).json({ error: "Email is required" })
	}

	const normalizedEmail = email.trim().toLowerCase()

	try {
		const user = await prisma.user.findFirst({
			where: {
				email: {
					equals: normalizedEmail,
					mode: "insensitive"
				}
			},
			select: { id: true, email: true }
		})

		// Always return success to avoid user enumeration
		if (!user) {
			return res.json({
				success: true,
				message: "If that email exists, reset instructions were sent."
			})
		}

		// Invalidate previous unused reset tokens for this user
		await prisma.passwordResetToken.updateMany({
			where: {
				userId: user.id,
				usedAt: null
			},
			data: {
				usedAt: new Date()
			}
		})

		const rawToken = crypto.randomBytes(32).toString("hex")
		const tokenHash = hashResetToken(rawToken)
		const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000)

		const createdToken = await prisma.passwordResetToken.create({
			data: {
				userId: user.id,
				tokenHash,
				expiresAt
			}
		})

		const frontendBase = process.env.RESET_PASSWORD_BASE_URL || process.env.FRONTEND_URL

		if (!frontendBase) {
			console.error("Forgot password error: missing RESET_PASSWORD_BASE_URL/FRONTEND_URL")
			return res.status(500).json({ error: "Password reset is not configured" })
		}

		const resetUrl = `${frontendBase.replace(/\/$/, "")}/reset-password?token=${rawToken}`

		try {
			await sendPasswordResetEmail({
				to: user.email,
				resetUrl,
				expiresInMinutes: RESET_TOKEN_EXPIRY_MINUTES
			})
		} catch (mailError) {
			await prisma.passwordResetToken.update({
				where: { id: createdToken.id },
				data: { usedAt: new Date() }
			})
			throw mailError
		}

		console.log("[PASSWORD_RESET] email sent", {
			email: user.email,
			expiresAt: expiresAt.toISOString()
		})

		return res.json({
			success: true,
			message: "If that email exists, reset instructions were sent."
		})
	} catch (error) {
		console.error("Forgot password error:", error)
		res.status(500).json({ error: "Failed to process forgot password request" })
	}
})

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
	const { token, password } = req.body || {}

	if (!token || typeof token !== "string") {
		return res.status(400).json({ error: "Reset token is required" })
	}

	if (!password || typeof password !== "string" || password.length < 6) {
		return res.status(400).json({ error: "Password must be at least 6 characters" })
	}

	try {
		const tokenHash = hashResetToken(token)
		const now = new Date()

		const resetToken = await prisma.passwordResetToken.findFirst({
			where: {
				tokenHash,
				usedAt: null,
				expiresAt: {
					gt: now
				}
			},
			include: {
				user: {
					select: {
						id: true
					}
				}
			}
		})

		if (!resetToken) {
			return res.status(400).json({ error: "Invalid or expired reset token" })
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		await prisma.$transaction([
			prisma.user.update({
				where: { id: resetToken.user.id },
				data: { password: hashedPassword }
			}),
			prisma.passwordResetToken.update({
				where: { id: resetToken.id },
				data: { usedAt: now }
			}),
			prisma.passwordResetToken.updateMany({
				where: {
					userId: resetToken.user.id,
					usedAt: null
				},
				data: { usedAt: now }
			})
		])

		return res.json({ success: true, message: "Password has been reset successfully" })
	} catch (error) {
		console.error("Reset password error:", error)
		res.status(500).json({ error: "Failed to reset password" })
	}
})

export default router
