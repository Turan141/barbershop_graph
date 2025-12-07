import { Barber, Booking, User } from "../types"

const STORAGE_KEYS = {
	USERS: "barber_app_users_v3",
	BARBERS: "barber_app_barbers_v3",
	BOOKINGS: "barber_app_bookings_v3",
	MESSAGES: "barber_app_messages_v3",
	FAVORITES: "barber_app_favorites_v3" // { userId: [barberId, ...] }
}

// Seed Data
const SEED_BARBERS: Barber[] = [
	{
		id: "b1",
		name: 'Alex "The Blade" Johnson',
		email: "alex@barber.com",
		role: "barber",
		avatarUrl:
			"https://images.unsplash.com/photo-1580518337843-f959e992563b?auto=format&fit=crop&q=80&w=300",
		specialties: ["Fade", "Saqqal Düzəltmə", "Klassik Kəsim"],
		rating: 4.9,
		reviewCount: 124,
		location: "Mərkəz, Bakı",
		bio: "10 illik təcrübəyə malik usta bərbər. Klassik kəsimlər və müasir fade üzrə ixtisaslaşmışdır.",
		tier: "vip",
		portfolio: [
			"https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s1", name: "Klassik Saç Kəsimi", duration: 45, price: 35, currency: "AZN" },
			{ id: "s2", name: "Saqqal Düzəltmə", duration: 30, price: 25, currency: "AZN" },
			{
				id: "s_kids",
				name: "Uşaq Saçı Kəsimi",
				duration: 30,
				price: 20,
				currency: "AZN"
			},
			{
				id: "s3",
				name: "VIP Xidmət (Saç + Saqqal + Üz Baxımı)",
				duration: 90,
				price: 80,
				currency: "AZN"
			}
		],
		schedule: {
			Monday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
			Tuesday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
			Wednesday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
			Thursday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
			Friday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
		}
	},
	{
		id: "b2",
		name: "Sarah Styles",
		email: "sarah@barber.com",
		role: "barber",
		avatarUrl:
			"https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=300",
		specialties: ["Rəngləmə", "Stilləşdirmə", "Uzun Saç"],
		rating: 4.9,
		reviewCount: 89,
		location: "Yasamal, Bakı",
		bio: "Rəng və tekstura ilə eksperiment etməyi sevən yaradıcı stilist.",
		tier: "vip",
		portfolio: [
			"https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s4", name: "Saç Kəsimi və Stil", duration: 60, price: 50, currency: "AZN" },
			{ id: "s5", name: "Saç Rəngləmə", duration: 120, price: 120, currency: "AZN" },
			{ id: "s5b", name: "Keratin Baxımı", duration: 150, price: 150, currency: "AZN" }
		],
		schedule: {
			Wednesday: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
			Thursday: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
			Friday: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "18:00"],
			Saturday: ["10:00", "11:00", "12:00", "13:00", "14:00"]
		}
	},
	{
		id: "b3",
		name: 'Mike "The Clipper" Ross',
		email: "mike@barber.com",
		role: "barber",
		avatarUrl:
			"https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=300",
		specialties: ["Maşınla Kəsim", "Təraş"],
		rating: 4.5,
		reviewCount: 45,
		location: "Gənclik, Bakı",
		bio: "Sürətli, təmiz və peşəkar. Şəhərdə ən yaxşı maşınla kəsim.",
		tier: "standard",
		portfolio: [
			"https://images.unsplash.com/photo-1593702295094-aea22597af65?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s6", name: "Maşınla Kəsim", duration: 20, price: 20, currency: "AZN" },
			{
				id: "s7",
				name: "İsti Dəsmal ilə Təraş",
				duration: 30,
				price: 30,
				currency: "AZN"
			}
		],
		schedule: {
			Monday: ["08:00", "09:00", "10:00", "11:00", "12:00"],
			Tuesday: ["08:00", "09:00", "10:00", "11:00", "12:00"],
			Wednesday: ["08:00", "09:00", "10:00", "11:00", "12:00"],
			Thursday: ["08:00", "09:00", "10:00", "11:00", "12:00"],
			Friday: ["08:00", "09:00", "10:00", "11:00", "12:00"]
		}
	},
	{
		id: "b4",
		name: "David Miller",
		email: "david@barber.com",
		role: "barber",
		avatarUrl:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
		specialties: ["Premium Kəsim", "Üz Baxımı"],
		rating: 5.0,
		reviewCount: 210,
		location: "Port Baku, Bakı",
		bio: "Premium xidmət və eksklüziv təcrübə. Yalnız VIP müştərilər üçün.",
		tier: "vip",
		portfolio: [
			"https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s8", name: "Prezident Kəsimi", duration: 90, price: 100, currency: "AZN" },
			{ id: "s9", name: "Kral Təraşı", duration: 60, price: 70, currency: "AZN" }
		],
		schedule: {
			Monday: ["12:00", "14:00", "16:00"],
			Wednesday: ["12:00", "14:00", "16:00"],
			Friday: ["12:00", "14:00", "16:00"]
		}
	},
	{
		id: "b5",
		name: "Elena Petrova",
		email: "elena@barber.com",
		role: "barber",
		avatarUrl:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
		specialties: ["Uşaq Kəsimi", "Qadın Kəsimi"],
		rating: 4.7,
		reviewCount: 65,
		location: "Nərimanov, Bakı",
		bio: "Hər yaşda müştərilər üçün rahat və dostcanlı mühit.",
		tier: "standard",
		portfolio: [
			"https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s10", name: "Uşaq Saç Kəsimi", duration: 30, price: 20, currency: "AZN" },
			{ id: "s11", name: "Qadın Saç Kəsimi", duration: 60, price: 40, currency: "AZN" }
		],
		schedule: {
			Tuesday: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
			Thursday: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
			Saturday: ["10:00", "11:00", "12:00", "13:00", "14:00"]
		}
	},
	{
		id: "b6",
		name: "Murad Aliyev",
		email: "murad@barber.com",
		role: "barber",
		avatarUrl:
			"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
		specialties: ["Fade", "Hair Tattoo", "Gənclər Stili"],
		rating: 4.6,
		reviewCount: 32,
		location: "28 May, Bakı",
		bio: "Gənc və enerjili. Ən son trendləri izləyirəm və tətbiq edirəm.",
		tier: "standard",
		portfolio: [
			"https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s12", name: "Fade Kəsim", duration: 45, price: 25, currency: "AZN" },
			{
				id: "s13",
				name: "Saç Dizaynı (Tattoo)",
				duration: 60,
				price: 40,
				currency: "AZN"
			}
		],
		schedule: {
			Monday: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
			Wednesday: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
			Friday: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]
		}
	},
	{
		id: "b7",
		name: "Kamran Hasanov",
		email: "kamran@barber.com",
		role: "barber",
		avatarUrl:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
		specialties: ["Klassik Təraş", "Bığ Baxımı"],
		rating: 4.8,
		reviewCount: 150,
		location: "İçərişəhər, Bakı",
		bio: "Köhnə məktəb ənənələri. İsti dəsmal və ülgüc ilə əsl kişi təraşı.",
		tier: "standard",
		portfolio: [
			"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s14", name: "Klassik Təraş", duration: 40, price: 30, currency: "AZN" },
			{
				id: "s15",
				name: "Bığ və Saqqal Forması",
				duration: 30,
				price: 20,
				currency: "AZN"
			}
		],
		schedule: {
			Tuesday: ["09:00", "10:00", "11:00", "12:00", "13:00"],
			Thursday: ["09:00", "10:00", "11:00", "12:00", "13:00"],
			Saturday: ["09:00", "10:00", "11:00", "12:00", "13:00"]
		}
	},
	{
		id: "b8",
		name: "Leyla Mammadova",
		email: "leyla@barber.com",
		role: "barber",
		avatarUrl:
			"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
		specialties: ["Kreativ Kəsim", "Rəngləmə"],
		rating: 4.7,
		reviewCount: 55,
		location: "Xətai, Bakı",
		bio: "Hər kəs üçün fərdi yanaşma. Sizin stiliniz, mənim sənətim.",
		tier: "standard",
		portfolio: [
			"https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300",
			"https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s16", name: "Kreativ Kəsim", duration: 60, price: 40, currency: "AZN" },
			{ id: "s17", name: "Saç Rəngləmə", duration: 90, price: 80, currency: "AZN" }
		],
		schedule: {
			Monday: ["10:00", "11:00", "12:00", "14:00", "15:00"],
			Wednesday: ["10:00", "11:00", "12:00", "14:00", "15:00"],
			Friday: ["10:00", "11:00", "12:00", "14:00", "15:00"]
		}
	}
]

const SEED_USERS: User[] = [
	{
		id: "u1",
		name: "John Doe",
		email: "client@test.com",
		role: "client",
		avatarUrl: "https://i.pravatar.cc/150?u=u1"
	},
	{
		id: "b1", // Barber is also a user for auth purposes
		name: 'Alex "The Blade" Johnson',
		email: "barber@test.com",
		role: "barber",
		avatarUrl: "https://i.pravatar.cc/150?u=b1"
	}
]

const SEED_BOOKINGS: Booking[] = [
	{
		id: "bk1",
		barberId: "b1",
		clientId: "u1",
		serviceId: "s1",
		date: new Date().toISOString().split("T")[0], // Today
		time: "10:00",
		status: "confirmed",
		createdAt: new Date().toISOString()
	},
	{
		id: "bk2",
		barberId: "b1",
		clientId: "u1",
		serviceId: "s2",
		date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
		time: "14:00",
		status: "pending",
		createdAt: new Date().toISOString()
	},
	{
		id: "bk3",
		barberId: "b1",
		clientId: "u1",
		serviceId: "s3",
		date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
		time: "11:00",
		status: "completed",
		createdAt: new Date().toISOString()
	}
]

// Helper to load/save
const load = <T>(key: string, defaultVal: T): T => {
	const stored = localStorage.getItem(key)
	return stored ? JSON.parse(stored) : defaultVal
}

const save = (key: string, data: any) => {
	localStorage.setItem(key, JSON.stringify(data))
}

// DB Interface
export const db = {
	users: {
		getAll: () => load<User[]>(STORAGE_KEYS.USERS, SEED_USERS),
		getById: (id: string) =>
			load<User[]>(STORAGE_KEYS.USERS, SEED_USERS).find((u) => u.id === id),
		getByEmail: (email: string) =>
			load<User[]>(STORAGE_KEYS.USERS, SEED_USERS).find((u) => u.email === email),
		create: (user: User) => {
			const users = load<User[]>(STORAGE_KEYS.USERS, SEED_USERS)
			users.push(user)
			save(STORAGE_KEYS.USERS, users)
			return user
		}
	},
	barbers: {
		getAll: () => {
			const list = load<Barber[]>(STORAGE_KEYS.BARBERS, SEED_BARBERS)
			return list.length > 0 ? list : SEED_BARBERS
		},
		getById: (id: string) =>
			load<Barber[]>(STORAGE_KEYS.BARBERS, SEED_BARBERS).find((b) => b.id === id),
		update: (id: string, updates: Partial<Barber>) => {
			const barbers = load<Barber[]>(STORAGE_KEYS.BARBERS, SEED_BARBERS)
			const index = barbers.findIndex((b) => b.id === id)
			if (index !== -1) {
				barbers[index] = { ...barbers[index], ...updates }
				save(STORAGE_KEYS.BARBERS, barbers)
				return barbers[index]
			}
			return null
		}
	},
	bookings: {
		getAll: () => load<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS),
		getByBarberId: (barberId: string) =>
			load<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS).filter(
				(b) => b.barberId === barberId
			),
		getByClientId: (clientId: string) =>
			load<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS).filter(
				(b) => b.clientId === clientId
			),
		create: (booking: Booking) => {
			const bookings = load<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS)
			bookings.push(booking)
			save(STORAGE_KEYS.BOOKINGS, bookings)
			return booking
		},
		update: (id: string, updates: Partial<Booking>) => {
			const bookings = load<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS)
			const index = bookings.findIndex((b) => b.id === id)
			if (index !== -1) {
				bookings[index] = { ...bookings[index], ...updates }
				save(STORAGE_KEYS.BOOKINGS, bookings)
				return bookings[index]
			}
			return null
		}
	},
	favorites: {
		get: (userId: string) => {
			const all = load<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {})
			return all[userId] || []
		},
		add: (userId: string, barberId: string) => {
			const all = load<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {})
			if (!all[userId]) all[userId] = []
			if (!all[userId].includes(barberId)) {
				all[userId].push(barberId)
				save(STORAGE_KEYS.FAVORITES, all)
			}
			return all[userId]
		},
		remove: (userId: string, barberId: string) => {
			const all = load<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {})
			if (all[userId]) {
				all[userId] = all[userId].filter((id) => id !== barberId)
				save(STORAGE_KEYS.FAVORITES, all)
			}
			return all[userId] || []
		}
	}
}
