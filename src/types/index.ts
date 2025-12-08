export interface User {
	id: string
	name: string
	email: string
	role: "client" | "barber"
	avatarUrl?: string
}

export interface Service {
	id: string
	name: string
	duration: number // in minutes
	price: number
	currency: string
}

export interface Barber extends User {
	role: "barber"
	specialties: string[]
	rating: number
	reviewCount: number
	location: string
	phone?: string
	services: Service[]
	portfolio: string[]
	bio: string
	schedule: {
		[key: string]: string[] // "Monday": ["09:00", "10:00", ...]
	}
	holidays?: string[] // ISO date strings YYYY-MM-DD
	tier?: "vip" | "standard"
}

export interface Booking {
	id: string
	barberId: string
	clientId: string
	serviceId: string
	date: string // ISO date string YYYY-MM-DD
	time: string // HH:mm
	status: "pending" | "confirmed" | "cancelled" | "completed" | "upcoming"
	comment?: string
	createdAt: string
}

export interface Review {
	id: string
	userId: string
	barberId: string
	rating: number
	text?: string
	createdAt: string
	user?: User
}

export interface Message {
	id: string
	senderId: string
	receiverId: string
	content: string
	timestamp: string
	read: boolean
}
