import { http, HttpResponse, delay } from "msw"
import { db } from "./db"
import { User, Booking, Barber } from "../types"

export const handlers = [
	// --- Auth ---
	http.post("/api/auth/login", async ({ request }) => {
		await delay(500)
		const { email } = (await request.json()) as { email: string }
		const user = db.users.getByEmail(email)

		if (user) {
			return HttpResponse.json({
				user,
				token: "mock-jwt-token-" + user.id
			})
		}
		return new HttpResponse(null, { status: 401, statusText: "Invalid credentials" })
	}),

	http.post("/api/auth/register", async ({ request }) => {
		await delay(500)
		const data = (await request.json()) as any
		const existing = db.users.getByEmail(data.email)

		if (existing) {
			return new HttpResponse(null, { status: 409, statusText: "User already exists" })
		}

		const newUser: User = {
			id: "u" + Date.now(),
			name: data.name,
			email: data.email,
			role: data.role || "client",
			avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
		}

		db.users.create(newUser)

		return HttpResponse.json({
			user: newUser,
			token: "mock-jwt-token-" + newUser.id
		})
	}),

	// --- Barbers ---
	http.get("/api/barbers", async ({ request }) => {
		await delay(300)
		const url = new URL(request.url)
		const query = url.searchParams.get("query")?.toLowerCase()

		let barbers = db.barbers.getAll()

		if (query) {
			barbers = barbers.filter(
				(b) =>
					b.name.toLowerCase().includes(query) ||
					b.location.toLowerCase().includes(query) ||
					b.specialties.some((s) => s.toLowerCase().includes(query))
			)
		}

		return HttpResponse.json(barbers)
	}),

	http.get("/api/barbers/:id", async ({ params }) => {
		await delay(300)
		const { id } = params
		const barber = db.barbers.getById(id as string)

		if (barber) {
			return HttpResponse.json(barber)
		}
		return new HttpResponse(null, { status: 404 })
	}),

	http.put("/api/barbers/:id", async ({ params, request }) => {
		await delay(500)
		const { id } = params
		const updates = (await request.json()) as Partial<Barber>
		const updatedBarber = db.barbers.update(id as string, updates)

		if (updatedBarber) {
			return HttpResponse.json(updatedBarber)
		}
		return new HttpResponse(null, { status: 404 })
	}),

	// --- Bookings ---
	http.get("/api/barbers/:id/bookings", async ({ params }) => {
		await delay(300)
		const { id } = params
		const bookings = db.bookings.getByBarberId(id as string)
		return HttpResponse.json(bookings)
	}),

	http.get("/api/users/:id", async ({ params }) => {
		await delay(300)
		const { id } = params
		const user = db.users.getById(id as string)
		if (user) {
			return HttpResponse.json(user)
		}
		return new HttpResponse(null, { status: 404 })
	}),

	http.post("/api/bookings", async ({ request }) => {
		await delay(500)
		const data = (await request.json()) as Omit<Booking, "id" | "status" | "createdAt">

		// Simple collision check
		const existingBookings = db.bookings.getByBarberId(data.barberId)
		const collision = existingBookings.find(
			(b) => b.date === data.date && b.time === data.time && b.status !== "cancelled"
		)

		if (collision) {
			return new HttpResponse(JSON.stringify({ message: "Slot already taken" }), {
				status: 409
			})
		}

		const newBooking: Booking = {
			...data,
			id: "bk" + Date.now(),
			status: "pending",
			createdAt: new Date().toISOString()
		}

		db.bookings.create(newBooking)
		return HttpResponse.json(newBooking)
	}),

	http.patch("/api/bookings/:id", async ({ params, request }) => {
		await delay(300)
		const { id } = params
		const updates = (await request.json()) as Partial<Booking>

		const updated = db.bookings.update(id as string, updates)

		if (updated) {
			return HttpResponse.json(updated)
		}
		return new HttpResponse(null, { status: 404 })
	}),

	// --- Favorites ---
	http.get("/api/users/:id/favorites", async ({ params }) => {
		await delay(200)
		const { id } = params
		const favoriteIds = db.favorites.get(id as string)
		const allBarbers = db.barbers.getAll()
		const favorites = allBarbers.filter((b) => favoriteIds.includes(b.id))
		return HttpResponse.json(favorites)
	}),

	http.post("/api/users/:id/favorites", async ({ params, request }) => {
		await delay(200)
		const { id } = params
		const { barberId } = (await request.json()) as { barberId: string }

		db.favorites.add(id as string, barberId)
		return HttpResponse.json({ success: true