import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const FIRST_NAMES = [
	"James",
	"Robert",
	"John",
	"Michael",
	"David",
	"William",
	"Richard",
	"Joseph",
	"Thomas",
	"Charles",
	"Daniel",
	"Matthew",
	"Anthony",
	"Mark",
	"Donald",
	"Steven",
	"Paul",
	"Andrew",
	"Joshua",
	"Kenneth",
	"Kevin",
	"Brian",
	"George",
	"Edward",
	"Ronald",
	"Timothy",
	"Jason",
	"Jeffrey",
	"Ryan",
	"Jacob",
	"Gary",
	"Nicholas",
	"Eric",
	"Jonathan",
	"Stephen",
	"Larry",
	"Justin",
	"Scott",
	"Brandon",
	"Benjamin",
	"Samuel",
	"Gregory",
	"Frank",
	"Alexander",
	"Raymond",
	"Patrick",
	"Jack",
	"Dennis",
	"Jerry",
	"Tyler",
	"Aaron",
	"Jose",
	"Adam",
	"Henry",
	"Nathan",
	"Douglas",
	"Zachary",
	"Peter",
	"Kyle",
	"Walter",
	"Ethan",
	"Jeremy",
	"Harold",
	"Keith",
	"Christian",
	"Roger",
	"Noah",
	"Gerald",
	"Carl",
	"Terry",
	"Sean",
	"Austin",
	"Arthur",
	"Lawrence",
	"Jesse",
	"Dylan",
	"Bryan",
	"Joe",
	"Jordan",
	"Billy",
	"Bruce",
	"Albert",
	"Willie",
	"Gabriel",
	"Logan",
	"Alan",
	"Juan",
	"Wayne",
	"Roy",
	"Ralph",
	"Randy",
	"Eugene",
	"Vincent",
	"Russell",
	"Elijah",
	"Louis",
	"Bobby",
	"Philip",
	"Johnny"
]
const LAST_NAMES = [
	"Smith",
	"Johnson",
	"Williams",
	"Brown",
	"Jones",
	"Garcia",
	"Miller",
	"Davis",
	"Rodriguez",
	"Martinez",
	"Hernandez",
	"Lopez",
	"Gonzalez",
	"Wilson",
	"Anderson",
	"Thomas",
	"Taylor",
	"Moore",
	"Jackson",
	"Martin",
	"Lee",
	"Perez",
	"Thompson",
	"White",
	"Harris",
	"Sanchez",
	"Clark",
	"Ramirez",
	"Lewis",
	"Robinson",
	"Walker",
	"Young",
	"Allen",
	"King",
	"Wright",
	"Scott",
	"Torres",
	"Nguyen",
	"Hill",
	"Flores",
	"Green",
	"Adams",
	"Nelson",
	"Baker",
	"Hall",
	"Rivera",
	"Campbell",
	"Mitchell",
	"Carter",
	"Roberts"
]
const LOCATIONS = [
	"Mərkəz, Bakı",
	"Yasamal, Bakı",
	"Gənclik, Bakı",
	"Nərimanov, Bakı",
	"Xətai, Bakı",
	"Nizami, Bakı",
	"Səbail, Bakı",
	"Nəsimi, Bakı",
	"Binəqədi, Bakı",
	"Suraxanı, Bakı"
]
const SPECIALTIES_LIST = [
	"Fade",
	"Saqqal Düzəltmə",
	"Klassik Kəsim",
	"Rəngləmə",
	"Stilləşdirmə",
	"Uzun Saç",
	"Maşınla Kəsim",
	"Təraş",
	"Uşaq Saçı",
	"Keratin"
]

const PORTFOLIO_IMAGES = [
	"https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1593702295094-aea22597af65?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1595476103518-3c8add20d758?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=300"
]

const SERVICES_TEMPLATE = [
	{ name: "Klassik Saç Kəsimi", duration: 45, price: 30, currency: "AZN" },
	{ name: "Saqqal Düzəltmə", duration: 30, price: 20, currency: "AZN" },
	{ name: "Uşaq Saçı Kəsimi", duration: 30, price: 15, currency: "AZN" },
	{ name: "VIP Xidmət", duration: 90, price: 70, currency: "AZN" },
	{ name: "Saç Rəngləmə", duration: 120, price: 100, currency: "AZN" },
	{ name: "Təraş", duration: 30, price: 15, currency: "AZN" }
]

const SCHEDULE_TEMPLATE = {
	Monday: { start: "09:00", end: "18:00" },
	Tuesday: { start: "09:00", end: "18:00" },
	Wednesday: { start: "09:00", end: "18:00" },
	Thursday: { start: "09:00", end: "18:00" },
	Friday: { start: "09:00", end: "18:00" },
	Saturday: { start: "10:00", end: "16:00" }
}

function getRandomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomItems<T>(arr: T[], count: number): T[] {
	const shuffled = [...arr].sort(() => 0.5 - Math.random())
	return shuffled.slice(0, count)
}

function generateRandomBarber(index: number) {
	const firstName = getRandomItem(FIRST_NAMES)
	const lastName = getRandomItem(LAST_NAMES)
	const name = `${firstName} ${lastName}`
	const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@barber.com`
	const location = getRandomItem(LOCATIONS)
	const specialties = getRandomItems(SPECIALTIES_LIST, Math.floor(Math.random() * 3) + 1)
	const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1)
	const reviewCount = Math.floor(Math.random() * 200) + 10
	const portfolio = getRandomItems(PORTFOLIO_IMAGES, Math.floor(Math.random() * 4) + 2)
	const services = getRandomItems(
		SERVICES_TEMPLATE,
		Math.floor(Math.random() * 4) + 2
	).map((s, i) => ({
		id: `s_gen_${index}_${i}`,
		...s
	}))

	return {
		id: `b_gen_${index}`,
		name,
		email,
		role: "barber",
		avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=200`,
		specialties,
		rating: parseFloat(rating),
		reviewCount,
		location,
		bio: `Professional barber with over ${
			Math.floor(Math.random() * 15) + 2
		} years of experience. Expert in ${specialties.join(", ")}.`,
		tier: Math.random() > 0.8 ? "vip" : "standard",
		portfolio,
		services,
		schedule: SCHEDULE_TEMPLATE
	}
}

const SEED_BARBERS: any[] = [
	{
		id: "b_test",
		name: "Test Barber",
		email: "barber@test.com",
		role: "barber",
		avatarUrl: "https://ui-avatars.com/api/?name=Test+Barber&background=random&size=200",
		specialties: ["Test Cut", "Debug Shave"],
		rating: 5.0,
		reviewCount: 999,
		location: "Test Location",
		bio: "A test barber account for development purposes.",
		tier: "vip",
		portfolio: [
			"https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s_test_1", name: "Test Service", duration: 30, price: 10, currency: "AZN" }
		],
		schedule: {
			Monday: { start: "09:00", end: "17:00" },
			Tuesday: { start: "09:00", end: "17:00" },
			Wednesday: { start: "09:00", end: "17:00" },
			Thursday: { start: "09:00", end: "17:00" },
			Friday: { start: "09:00", end: "17:00" },
			Saturday: { start: "10:00", end: "15:00" }
		}
	},
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
			Monday: { start: "09:00", end: "16:00" },
			Tuesday: { start: "09:00", end: "16:00" },
			Wednesday: { start: "09:00", end: "16:00" },
			Thursday: { start: "09:00", end: "16:00" },
			Friday: { start: "09:00", end: "17:00" }
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
			Wednesday: { start: "10:00", end: "16:00" },
			Thursday: { start: "10:00", end: "16:00" },
			Friday: { start: "10:00", end: "18:00" },
			Saturday: { start: "10:00", end: "14:00" }
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
			"https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&q=80&w=300"
		],
		services: [
			{ id: "s6", name: "Maşınla Kəsim", duration: 30, price: 20, currency: "AZN" },
			{ id: "s7", name: "Təraş", duration: 30, price: 15, currency: "AZN" }
		],
		schedule: {
			Monday: { start: "10:00", end: "18:00" },
			Tuesday: { start: "10:00", end: "18:00" },
			Wednesday: { start: "10:00", end: "18:00" },
			Thursday: { start: "10:00", end: "18:00" },
			Friday: { start: "10:00", end: "18:00" }
		}
	}
]

// Generate 20 more random barbers
for (let i = 0; i < 20; i++) {
	SEED_BARBERS.push(generateRandomBarber(i))
}

const SEED_USERS = [
	{
		id: "u1",
		name: "John Doe",
		email: "client@test.com",
		role: "client",
		avatarUrl: "https://ui-avatars.com/api/?name=John+Doe&background=random"
	},
	{
		id: "u2",
		name: "Jane Smith",
		email: "jane@test.com",
		role: "client",
		avatarUrl: "https://ui-avatars.com/api/?name=Jane+Smith&background=random"
	}
]

async function main() {
	console.log("Start seeding ...")

	// Cleanup generated barbers and users to avoid unique constraint errors
	try {
		console.log("Cleaning up old generated data...")
		// Delete related records first due to foreign key constraints
		await prisma.booking.deleteMany({ where: { barberId: { startsWith: "b_gen_" } } })
		await prisma.review.deleteMany({ where: { barberId: { startsWith: "b_gen_" } } })
		await prisma.favorite.deleteMany({ where: { barberId: { startsWith: "b_gen_" } } })
		await prisma.service.deleteMany({ where: { barberId: { startsWith: "b_gen_" } } })
		await prisma.barberProfile.deleteMany({ where: { id: { startsWith: "b_gen_" } } })
		await prisma.user.deleteMany({ where: { id: { startsWith: "b_gen_" } } })
		console.log("Cleanup complete")
	} catch (e) {
		console.log("Cleanup failed (might be first run):", e)
	}

	// Seed Users
	for (const u of SEED_USERS) {
		const user = await prisma.user.upsert({
			where: { email: u.email },
			update: {
				password: "$2b$10$3AnU7N5dg3X4cXcfzkNRDeW/x4TCg2SCu8aAmyUYogtycF0Z87P/2"
			},
			create: {
				id: u.id, // Ensure ID is used
				name: u.name,
				email: u.email,
				role: u.role as any,
				avatarUrl: u.avatarUrl,
				password: "$2b$10$3AnU7N5dg3X4cXcfzkNRDeW/x4TCg2SCu8aAmyUYogtycF0Z87P/2"
			}
		})
		console.log(`Created/Updated user with id: ${user.id}`)
	}

	// Seed Barbers (User + Profile + Services)
	for (const b of SEED_BARBERS) {
		// 1. Create User for Barber
		const user = await prisma.user.upsert({
			where: { email: b.email },
			update: {
				password: "$2b$10$3AnU7N5dg3X4cXcfzkNRDeW/x4TCg2SCu8aAmyUYogtycF0Z87P/2"
			},
			create: {
				id: b.id + "_user", // e.g. b1_user
				name: b.name,
				email: b.email,
				role: "barber",
				avatarUrl: b.avatarUrl,
				password: "$2b$10$3AnU7N5dg3X4cXcfzkNRDeW/x4TCg2SCu8aAmyUYogtycF0Z87P/2"
			}
		})

		// 2. Create Barber Profile
		const profile = await prisma.barberProfile.upsert({
			where: { userId: user.id },
			update: {},
			create: {
				id: b.id,
				userId: user.id,
				specialties: JSON.stringify(b.specialties),
				rating: b.rating,
				reviewCount: b.reviewCount,
				location: b.location,
				bio: b.bio,
				tier: b.tier,
				portfolio: JSON.stringify(b.portfolio),
				schedule: JSON.stringify(b.schedule),
				services: {
					create: b.services.map((s: any) => ({
						id: s.id,
						name: s.name,
						duration: s.duration,
						price: s.price,
						currency: s.currency
					}))
				}
			}
		})
		console.log(`Created barber profile with id: ${profile.id}`)
	}

	console.log("Seeding finished.")
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
