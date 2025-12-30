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
	"Johnny",
	"Murad",
	"Elvin",
	"Samir",
	"Tural",
	"Anar",
	"Vusal",
	"Rashad",
	"Orkhan",
	"Farid",
	"Ilgar"
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
	"Roberts",
	"Mammadov",
	"Aliyev",
	"Huseynov",
	"Guliyev",
	"Ismayilov",
	"Hasanov",
	"Abdullayev",
	"Jafarov"
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
	"Keratin",
	"Üz Baxımı",
	"Masaj"
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
	"https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=300",
	"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=300"
]

const SERVICES_TEMPLATE = [
	{ name: "Klassik Saç Kəsimi", duration: 45, price: 30, currency: "AZN" },
	{ name: "Saqqal Düzəltmə", duration: 30, price: 20, currency: "AZN" },
	{ name: "Uşaq Saçı Kəsimi", duration: 30, price: 15, currency: "AZN" },
	{ name: "VIP Xidmət", duration: 90, price: 70, currency: "AZN" },
	{ name: "Saç Rəngləmə", duration: 120, price: 100, currency: "AZN" },
	{ name: "Təraş", duration: 30, price: 15, currency: "AZN" },
	{ name: "Saç Yuma və Fen", duration: 20, price: 10, currency: "AZN" }
]

const SCHEDULE_TEMPLATE = {
	Monday: { start: "09:00", end: "18:00" },
	Tuesday: { start: "09:00", end: "18:00" },
	Wednesday: { start: "09:00", end: "18:00" },
	Thursday: { start: "09:00", end: "18:00" },
	Friday: { start: "09:00", end: "18:00" },
	Saturday: { start: "10:00", end: "16:00" }
}

class UniqueGenerator {
	private usedNames = new Set<string>()
	private usedEmails = new Set<string>()

	generateName(): { firstName: string; lastName: string; fullName: string } {
		let attempts = 0
		while (attempts < 100) {
			const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
			const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
			const fullName = `${firstName} ${lastName}`
			if (!this.usedNames.has(fullName)) {
				this.usedNames.add(fullName)
				return { firstName, lastName, fullName }
			}
			attempts++
		}
		// Fallback if we run out of combinations (unlikely with this list size)
		return {
			firstName: "Barber",
			lastName: `Gen${Date.now()}`,
			fullName: `Barber Gen${Date.now()}`
		}
	}

	generateEmail(firstName: string, lastName: string): string {
		let baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@barber.com`
		let email = baseEmail
		let counter = 1
		while (this.usedEmails.has(email)) {
			email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@barber.com`
			counter++
		}
		this.usedEmails.add(email)
		return email
	}
}

function getRandomItems<T>(arr: T[], count: number): T[] {
	const shuffled = [...arr].sort(() => 0.5 - Math.random())
	return shuffled.slice(0, count)
}

function getRandomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]
}

const generator = new UniqueGenerator()

function generateBarberData(index: number, plan: "basic" | "standard" | "pro") {
	const { firstName, lastName, fullName } = generator.generateName()
	const email = generator.generateEmail(firstName, lastName)
	const location = getRandomItem(LOCATIONS)
	const specialties = getRandomItems(SPECIALTIES_LIST, Math.floor(Math.random() * 3) + 2)

	let rating, reviewCount, tier, subscriptionPlan

	if (plan === "basic") {
		rating = (Math.random() * (4.2 - 3.5) + 3.5).toFixed(1)
		reviewCount = Math.floor(Math.random() * 30) + 5
		tier = "standard"
		subscriptionPlan = "basic"
	} else if (plan === "standard") {
		rating = (Math.random() * (4.8 - 4.2) + 4.2).toFixed(1)
		reviewCount = Math.floor(Math.random() * 100) + 30
		tier = "vip" // Giving them VIP tier for better visibility
		subscriptionPlan = "standard"
	} else {
		// pro
		rating = (Math.random() * (5.0 - 4.8) + 4.8).toFixed(1)
		reviewCount = Math.floor(Math.random() * 300) + 100
		tier = "vip"
		subscriptionPlan = "pro"
	}

	// Use pravatar.cc for unique realistic avatars based on email hash (simulated by index/random)
	// Adding a random query param to ensure uniqueness
	const avatarUrl = `https://i.pravatar.cc/300?u=${email}`

	const portfolio = getRandomItems(PORTFOLIO_IMAGES, Math.floor(Math.random() * 4) + 2)
	const services = getRandomItems(
		SERVICES_TEMPLATE,
		Math.floor(Math.random() * 4) + 3
	).map((s, i) => ({
		id: `s_gen_${index}_${i}`,
		...s
	}))

	return {
		id: `b_gen_${index}`,
		name: fullName,
		email,
		role: "barber",
		avatarUrl,
		specialties,
		rating: parseFloat(rating),
		reviewCount,
		location,
		bio: `Professional barber with over ${
			Math.floor(Math.random() * 15) + 2
		} years of experience. Expert in ${specialties.join(", ")}.`,
		tier,
		subscriptionPlan,
		portfolio,
		services,
		schedule: SCHEDULE_TEMPLATE
	}
}

async function main() {
	console.log("Start seeding ...")

	// 1. Cleanup
	try {
		console.log("Cleaning up all data...")
		await prisma.booking.deleteMany({})
		await prisma.review.deleteMany({})
		await prisma.favorite.deleteMany({})
		await prisma.service.deleteMany({})
		await prisma.expense.deleteMany({})
		await prisma.barberClientNote.deleteMany({})
		await prisma.barberProfile.deleteMany({})
		await prisma.user.deleteMany({})
		console.log("Cleanup complete")
	} catch (e) {
		console.log("Cleanup failed:", e)
	}

	// 2. Create Demo User
	const demoUser = await prisma.user.create({
		data: {
			id: "u1",
			name: "John Doe",
			email: "client@test.com",
			role: "client",
			avatarUrl: "https://ui-avatars.com/api/?name=John+Doe&background=random",
			password: "$2b$10$GGR4GMr2Y60eTwPlR3prDeGlERNBTdI.2a5QxbtxEFFoqiIQStDde"
		}
	})
	console.log(`Created demo user: ${demoUser.email}`)

	// 3. Create Demo Barber
	const demoBarberUser = await prisma.user.create({
		data: {
			id: "b_test_user",
			name: "Test Barber",
			email: "barber@test.com",
			role: "barber",
			avatarUrl:
				"https://ui-avatars.com/api/?name=Test+Barber&background=random&size=200",
			password: "$2b$10$GGR4GMr2Y60eTwPlR3prDeGlERNBTdI.2a5QxbtxEFFoqiIQStDde"
		}
	})

	await prisma.barberProfile.create({
		data: {
			id: "b_test",
			userId: demoBarberUser.id,
			specialties: JSON.stringify(["Test Cut", "Debug Shave"]),
			rating: 5.0,
			reviewCount: 999,
			location: "Test Location",
			bio: "A test barber account for development purposes.",
			tier: "vip",
			subscriptionPlan: "pro",
			portfolio: JSON.stringify([
				"https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300"
			]),
			schedule: JSON.stringify({
				Monday: { start: "09:00", end: "17:00" },
				Tuesday: { start: "09:00", end: "17:00" },
				Wednesday: { start: "09:00", end: "17:00" },
				Thursday: { start: "09:00", end: "17:00" },
				Friday: { start: "09:00", end: "17:00" },
				Saturday: { start: "10:00", end: "15:00" }
			}),
			services: {
				create: [
					{
						id: "s_test_1",
						name: "Test Service",
						duration: 30,
						price: 10,
						currency: "AZN"
					}
				]
			}
		}
	})
	console.log(`Created demo barber: ${demoBarberUser.email}`)

	// 4. Create Realistic Barbers
	// 5 Basic, 3 Standard, 1 Pro
	const plans: ("basic" | "standard" | "pro")[] = [
		...Array(5).fill("basic"),
		...Array(3).fill("standard"),
		...Array(1).fill("pro")
	]

	for (let i = 0; i < plans.length; i++) {
		const plan = plans[i]
		const b = generateBarberData(i + 1, plan)

		const user = await prisma.user.create({
			data: {
				id: b.id + "_user",
				name: b.name,
				email: b.email,
				role: "barber",
				avatarUrl: b.avatarUrl,
				password: "$2b$10$GGR4GMr2Y60eTwPlR3prDeGlERNBTdI.2a5QxbtxEFFoqiIQStDde"
			}
		})

		await prisma.barberProfile.create({
			data: {
				id: b.id,
				userId: user.id,
				specialties: JSON.stringify(b.specialties),
				rating: b.rating,
				reviewCount: b.reviewCount,
				location: b.location,
				bio: b.bio,
				tier: b.tier,
				subscriptionPlan: b.subscriptionPlan,
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
		console.log(`Created ${plan} barber: ${b.name} (${b.email})`)
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
