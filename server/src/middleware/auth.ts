import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthRequest extends Request {
	user?: {
		id: string
		role: string
	}
}

export const authenticateToken = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers["authorization"]
	const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

	if (!token) {
		return res.status(401).json({ error: "Access denied. No token provided." })
	}

	try {
		const verified = jwt.verify(token, JWT_SECRET) as { id: string; role: string }
		req.user = verified
		next()
	} catch (error) {
		res.status(403).json({ error: "Invalid token." })
	}
}
