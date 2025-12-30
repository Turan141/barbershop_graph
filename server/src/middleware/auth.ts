import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { getJwtSecret } from "../config"

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
		const verified = jwt.verify(token, getJwtSecret()) as { id: string; role: string }
		req.user = verified
		next()
	} catch (error) {
		res.status(403).json({ error: "Invalid token." })
	}
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers["authorization"]
	const token = authHeader && authHeader.split(" ")[1]

	if (!token) {
		return next()
	}

	try {
		const verified = jwt.verify(token, getJwtSecret()) as { id: string; role: string }
		req.user = verified
		next()
	} catch (error) {
		// If token is invalid, just proceed as guest
		next()
	}
}
