const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

function getArg(name) {
	const idx = process.argv.indexOf(name)
	if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]
	return null
}

function getPositionalEmail() {
	const args = process.argv.slice(2).filter((a) => !a.startsWith("--"))
	return args[0] || null
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function main() {
	const email = getArg("--email") || getPositionalEmail()
	const dryRun = process.argv.includes("--dry-run")

	if (!email) {
		console.error(
			"Usage: node scripts/promote-admin.cjs --email user@example.com [--dry-run]"
		)
		process.exit(1)
	}

	if (!isValidEmail(email)) {
		console.error("Invalid email format:", email)
		process.exit(1)
	}

	const user = await prisma.user.findFirst({
		where: {
			email: {
				equals: email,
				mode: "insensitive"
			}
		},
		select: {
			id: true,
			email: true,
			name: true,
			role: true
		}
	})

	if (!user) {
		console.error("User not found for email:", email)
		process.exit(1)
	}

	if (user.role === "admin") {
		console.log("No change: user is already admin", {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role
		})
		return
	}

	if (dryRun) {
		console.log("Dry run only. Would promote:", {
			id: user.id,
			email: user.email,
			name: user.name,
			fromRole: user.role,
			toRole: "admin"
		})
		return
	}

	const updated = await prisma.user.update({
		where: { id: user.id },
		data: { role: "admin" },
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			updatedAt: true
		}
	})

	console.log("Promoted user to admin:", updated)
	console.log(
		"Important: user must log out and log in again to get a new JWT with admin role."
	)
}

main()
	.catch((error) => {
		console.error("Promote admin failed:", error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
