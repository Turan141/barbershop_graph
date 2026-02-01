import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// --- Utility Functions ---

function randomDate(start: Date, end: Date) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function formatDate(date: Date): string {
	return date.toISOString().split("T")[0] // YYYY-MM-DD
}

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

// --- Main Seed ---

async function main() {
	console.log(" Starting seed...")

	// 1. Clean up database
	await prisma.expense.deleteMany()
	await prisma.barberClientNote.deleteMany()
	await prisma.review.deleteMany()
	// await prisma.activityLog.deleteMany().catch(() => {}) // In case it doesnt exist yet
	await prisma.booking.deleteMany()
	await prisma.service.deleteMany()
	await prisma.favorite.deleteMany()
	await prisma.barberProfile.deleteMany()
	await prisma.user.deleteMany()

	console.log(" Database cleared")

	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash("password123", salt)

	// 2. Create "Hero" Barber (Murad)
	const heroBarber = await prisma.user.create({
		data: {
			name: "Murad Aliyev",
			email: "barber@demo.com",
			password: hashedPassword,
			role: "barber",
			phone: "+994501234567",
			avatarUrl:
				"https://images.unsplash.com/photo-1588731234159-8b9963143fca?q=80&w=400&auto=format&fit=crop"
		}
	})

	console.log(" Created hero barber: Murad Aliyev")

	// 3. Create Barber Profile
	// Portfolio images
	const portfolioImages = [
		"https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800", // Fade
		"https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800", // Beard
		"https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=800", // Tools
		"https://images.unsplash.com/photo-1503951914875-befbb713346b?q=80&w=800", // Styling
		"https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800" // Shopvibe
	]

	const profile = await prisma.barberProfile.create({
		data: {
			userId: heroBarber.id,
			bio: 'Professional barber with 7 years of experience. I specialize in classic cuts and modern fades. Founder of "Style & Blade" academy. My goal is to make every client look and feel their best.',
			location: "Baku, Nizami St. 23",
			latitude: 40.377,
			longitude: 49.854,
			specialties: JSON.stringify([
				"Fuls",
				"Skin Fade",
				"Royal Shave",
				"Beard Sculpting",
				"Kids Cut"
			]),
			portfolio: JSON.stringify(portfolioImages),
			previewImageUrl: portfolioImages[0],
			phone: "+994 50 123 45 67",
			rating: 4.9,
			reviewCount: 42,
			tier: "vip",
			subscriptionStatus: "active",
			subscriptionPlan: "pro", // Premium plan
			subscriptionEndDate: new Date("2030-01-01"), // Long expiry
			verificationStatus: "verified",
			schedule: JSON.stringify({
				monday: { start: "10:00", end: "20:00" },
				tuesday: { start: "10:00", end: "20:00" },
				wednesday: { start: "10:00", end: "20:00" },
				thursday: { start: "10:00", end: "20:00" },
				friday: { start: "10:00", end: "21:00" },
				saturday: { start: "11:00", end: "19:00" }
				// Sunday off
			})
		}
	})

	console.log(" Created barber profile")

	// 4. Create Services
	const servicesData = [
		{ name: "Haircut (Classic)", duration: 45, price: 20 },
		{ name: "Haircut & Beard", duration: 75, price: 35 },
		{ name: "Beard Trim & Shape", duration: 30, price: 15 },
		{ name: "Royal Shave", duration: 45, price: 25 },
		{ name: "Father & Son", duration: 75, price: 35 },
		{ name: "Hair Styling", duration: 20, price: 10 }
	]

	const services = []
	for (const s of servicesData) {
		const service = await prisma.service.create({
			data: {
				...s,
				currency: "AZN",
				barberId: profile.id
			}
		})
		services.push(service)
	}
	console.log(" Created services")

	// 5. Create Clients
	const clientNames = [
		"Anar Mammadov",
		"Farid Guliyev",
		"Elvin Huseynov",
		"Rashad Babayev",
		"Orkhan Aliyev",
		"Teymur Mirzayev",
		"Nijat Ibrahimov",
		"Kanan Ismayilov",
		"Vusal Hasanov",
		"Samir Jafarov",
		"Ilgar Abdullayev",
		"Ruslan Rustamov"
	]

	const clients = []
	for (let i = 0; i < clientNames.length; i++) {
		const client = await prisma.user.create({
			data: {
				name: clientNames[i],
				email: `client${i}@demo.com`,
				password: hashedPassword,
				role: "client",
				phone: `+9945000000${i.toString().padStart(2, "0")}`
			}
		})
		clients.push(client)
	}
	console.log(` Created ${clients.length} clients`)

	// 5.5 Create Extra Barbers (15 total mockup barbers)
	const extraBarberNames = [
		"Kamran Aliyev",
		"Eldar Mammadov",
		"Rasim Hasanov",
		"Javid Guliyev",
		"Sanan Ismayilov",
		"Tural Huseynov",
		"Vugar Abdullayev",
		"Zaur Jafarov",
		"Rauf Babayev",
		"Nurlan Mirzayev",
		"Hikmat Ibrahimov",
		"Elchin Rustamov",
		"Azar Suleymanov",
		"Fariz Orujov",
		"Ramil Khalilov"
	]

	const avatarUrls = [
		"https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1583864697784-a0efc8379f70?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&fit=crop&q=60",
		"https://images.unsplash.com/photo-1596387430636-24e52622416f?w=400&fit=crop&q=60"
	]

	for (let i = 0; i < extraBarberNames.length; i++) {
		const bName = extraBarberNames[i]
		// Create User
		const bUser = await prisma.user.create({
			data: {
				name: bName,
				email: `barber${i + 2}@demo.com`,
				password: hashedPassword,
				role: "barber",
				phone: `+99450777${i.toString().padStart(2, "0")}00`,
				avatarUrl: avatarUrls[i % avatarUrls.length]
			}
		})

		// Create Profile
		const bProfile = await prisma.barberProfile.create({
			data: {
				userId: bUser.id,
				bio: `Experienced barber ${bName}. Specializing in classic and modern cuts.`,
				location: "Baku, Center",
				latitude: 40.37 + (Math.random() * 0.04 - 0.02),
				longitude: 49.84 + (Math.random() * 0.04 - 0.02),
				specialties: JSON.stringify(["Haircut", "Beard", "Styling"]),
				portfolio: "[]",
				phone: bUser.phone,
				rating: Number((4.0 + Math.random()).toFixed(1)),
				reviewCount: getRandomInt(5, 50),
				tier: "standard",
				subscriptionStatus: "active",
				schedule: JSON.stringify({
					monday: { start: "10:00", end: "20:00" },
					tuesday: { start: "10:00", end: "20:00" },
					wednesday: { start: "10:00", end: "20:00" },
					thursday: { start: "10:00", end: "20:00" },
					friday: { start: "10:00", end: "21:00" },
					saturday: { start: "11:00", end: "19:00" }
				})
			}
		})

		// Create Services for this barber
		const bServices = []
		for (const s of servicesData) {
			const serv = await prisma.service.create({
				data: { ...s, currency: "AZN", barberId: bProfile.id }
			})
			bServices.push(serv)
		}

		// Reserved Slots (Future Bookings)
		const bFutureStart = new Date()
		const bFutureEnd = new Date()
		bFutureEnd.setDate(bFutureEnd.getDate() + 7)

		for (let d = new Date(bFutureStart); d <= bFutureEnd; d.setDate(d.getDate() + 1)) {
			if (Math.random() > 0.7) continue // some days off
			const slots = getRandomInt(1, 3)
			for (let k = 0; k < slots; k++) {
				const time = `${getRandomInt(10, 18)}:${getRandomInt(0, 1) === 0 ? "00" : "30"}`
				const dateStr = formatDate(d)
				try {
					await prisma.booking.create({
						data: {
							date: dateStr,
							time: time,
							status: "confirmed",
							barberId: bProfile.id,
							clientId: clients[getRandomInt(0, clients.length - 1)].id,
							serviceId: bServices[getRandomInt(0, bServices.length - 1)].id,
							slotKey: `${bProfile.id}:${dateStr}:${time}`
						}
					})
				} catch (e) {}
			}
		}
	}
	console.log(` Created ${extraBarberNames.length} extra barbers with reserved slots`)

	// 6. Generate Past Bookings & Reviews (1 month back)
	const startDate = new Date()
	startDate.setMonth(startDate.getMonth() - 1)
	const endDate = new Date()

	let totalBookings = 0
	let totalRevenue = 0

	// Loop through each day from 6 months ago to today
	for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
		const isWeekend = d.getDay() === 0 || d.getDay() === 6
		const dayBookingsCount = isWeekend ? getRandomInt(5, 8) : getRandomInt(2, 6)

		// 10% chance day off
		if (Math.random() < 0.1 && !isWeekend) continue

		for (let i = 0; i < dayBookingsCount; i++) {
			const client = clients[getRandomInt(0, clients.length - 1)]
			const service = services[getRandomInt(0, services.length - 1)]
			const time = `${getRandomInt(10, 19)}:${getRandomInt(0, 1) === 0 ? "00" : "30"}`
			const dateStr = formatDate(d)

			const statusRoll = Math.random()
			let status = "completed"
			if (statusRoll < 0.05) status = "cancelled"
			if (statusRoll < 0.02) status = "no_show"

			try {
				const booking = await prisma.booking.create({
					data: {
						date: dateStr,
						time: time,
						status: status,
						barberId: profile.id,
						clientId: client.id,
						serviceId: service.id,
						slotKey: status === "cancelled" ? null : `${profile.id}:${dateStr}:${time}`
					}
				})

				if (status === "completed") {
					totalRevenue += service.price

					// Add Review (30% chance)
					if (Math.random() < 0.3) {
						const rating = Math.random() > 0.8 ? 5 : 4
						const comments = [
							"Great cut as always!",
							"Murad is the best in town.",
							"Very professional.",
							"Nice atmosphere.",
							"Perfect fade.",
							"Recommended!",
							"Clean and fast.",
							"Best barber ever."
						]
						await prisma.review.create({
							data: {
								barberId: profile.id,
								userId: client.id,
								rating: rating,
								text: comments[getRandomInt(0, comments.length - 1)],
								createdAt: d // Review date same as booking date
							}
						})
					}
				}
				totalBookings++
			} catch (e) {
				// Ignore slot collisions
			}
		}
	}
	console.log(` Generated ~${totalBookings} past bookings`)

	// 7. Generate Future Bookings (Next 2 weeks)
	const futureStart = new Date()
	const futureEnd = new Date()
	futureEnd.setDate(futureEnd.getDate() + 14)

	for (let d = new Date(futureStart); d <= futureEnd; d.setDate(d.getDate() + 1)) {
		const count = getRandomInt(1, 4)
		for (let i = 0; i < count; i++) {
			const client = clients[getRandomInt(0, clients.length - 1)]
			const service = services[getRandomInt(0, services.length - 1)]
			const time = `${getRandomInt(10, 18)}:${getRandomInt(0, 1) === 0 ? "00" : "30"}`
			const dateStr = formatDate(d)

			try {
				await prisma.booking.create({
					data: {
						date: dateStr,
						time: time,
						status: "confirmed",
						barberId: profile.id,
						clientId: client.id,
						serviceId: service.id,
						slotKey: `${profile.id}:${dateStr}:${time}`
					}
				})
			} catch (e) {}
		}
	}
	console.log(" Generated future bookings")

	// 8. Generate Expenses
	const expenseCategories = ["rent", "supplies", "utilities", "marketing", "other"]
	const expenseNotes = {
		rent: "Monthly Seat Rent",
		supplies: "Shampoo, blades, talc",
		utilities: "Electricity share",
		marketing: "Instagram Ads",
		other: "Coffee for clients"
	}

	for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
		// Rent on 1st of month
		if (d.getDate() === 1) {
			await prisma.expense.create({
				data: {
					barberId: heroBarber.id,
					amount: 500,
					category: "rent",
					date: d,
					note: expenseNotes.rent
				}
			})
		}

		// Supplies every 2 weeks
		if (d.getDate() === 15 || d.getDate() === 28) {
			await prisma.expense.create({
				data: {
					barberId: heroBarber.id,
					amount: getRandomInt(50, 150),
					category: "supplies",
					date: d,
					note: expenseNotes.supplies
				}
			})
		}

		// Random coffee/marketing
		if (Math.random() < 0.1) {
			await prisma.expense.create({
				data: {
					barberId: heroBarber.id,
					amount: getRandomInt(10, 50),
					category: Math.random() > 0.5 ? "marketing" : "other",
					date: d,
					note: Math.random() > 0.5 ? expenseNotes.marketing : expenseNotes.other
				}
			})
		}
	}
	console.log(" Generated expenses")

	// 9. Client Notes & Tags (CRM)
	for (const client of clients) {
		if (Math.random() > 0.5) {
			await prisma.barberClientNote.create({
				data: {
					barberId: profile.id,
					clientId: client.id,
					notes: "Prefers silent appointments. Likes matte clay finish.",
					tags: JSON.stringify(["vip", "messy crop", "silent"])
				}
			})
		}
	}
	console.log(" Generated client notes")

	console.log(" Seed completed successfully!")
	console.log("-----------------------------------------")
	console.log("Login Email: barber@demo.com")
	console.log("Login Password: password123")
	console.log("-----------------------------------------")
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
