import { Router, Response } from "express"
import { AuthRequest, authenticateToken } from "../middleware/auth"
import { prisma } from "../db"

const router = Router()

const requireAdmin = (req: AuthRequest, res: Response, next: any) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Require admin privileges" })
    }
    next()
}

// Global Stats for CRM
router.get("/stats", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: "client" } })
        const totalBarbers = await prisma.user.count({ where: { role: "barber" } })
        const totalBookings = await prisma.booking.count()
        const activeSubscriptions = await prisma.barberProfile.count({
            where: { subscriptionStatus: "active" }
        })
        
        res.json({ totalUsers, totalBarbers, totalBookings, activeSubscriptions })
    } catch (error) {
        console.error("Admin stats error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Get all barbers with subscription details
router.get("/barbers", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const barbers = await prisma.barberProfile.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                _count: { select: { bookings: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        res.json(barbers)
    } catch (error) {
        console.error("Admin getting barbers error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Update barber subscription (Manual payment workflow)
router.put("/barbers/:id/subscription", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params
        const { status, plan, endDate } = req.body

        const updated = await prisma.barberProfile.update({
            where: { id },
            data: {
                subscriptionStatus: status,
                subscriptionPlan: plan,
                subscriptionEndDate: endDate ? new Date(endDate) : null
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        })

        res.json(updated)
    } catch (error) {
        console.error("Update subscription error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

export default router
