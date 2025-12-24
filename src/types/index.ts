export interface User {
	id: string
	name: string
	email: string
	role: "client" | "barber"
	avatarUrl?: string
}

export interface PaginatedResponse<T> {
	data: T[]
	meta: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

export interface Service {
	id: string
	name: string
	duration: number // in minutes
	price: number
	currency: string
}

export interface BarberScheduleItem {
	start: string // "09:00"
	end: string // "18:00"
	lunchStart?: string
	lunchEnd?: string
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
	previewImageUrl?: string
	bio: string
	verificationStatus: "none" | "pending" | "verified" | "rejected"
	verificationDocumentUrl?: string
	schedule: {
		[key: string]: BarberScheduleItem | null // "Monday": { start: "09:00", end: "18:00" }
	}
	holidays?: string[] // ISO date strings YYYY-MM-DD
	tier?: "vip" | "standard"
	isAddressVerified?: boolean
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
	client?: User
	barber?: Barber
	service?: Service
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
