import nodemailer from "nodemailer"

type SmtpConfig = {
	host: string
	port: number
	secure: boolean
	user: string
	pass: string
	from: string
}

function getSmtpConfig(): SmtpConfig {
	const host = process.env.SMTP_HOST?.trim()
	const portRaw = String(process.env.SMTP_PORT || "587").trim()
	const secureRaw = String(process.env.SMTP_SECURE || "false")
		.trim()
		.toLowerCase()
	const port = Number(portRaw)
	const secure = secureRaw === "true"
	const user = process.env.SMTP_USER?.trim()
	const pass = process.env.SMTP_PASS?.replace(/\s+/g, "")
	const from = process.env.SMTP_FROM?.trim()

	if (!host || !user || !pass || !from) {
		throw new Error(
			"SMTP is not configured. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM"
		)
	}

	if (!Number.isFinite(port) || port <= 0) {
		throw new Error("SMTP_PORT is invalid")
	}

	return { host, port, secure, user, pass, from }
}

export async function sendPasswordResetEmail(params: {
	to: string
	resetUrl: string
	expiresInMinutes: number
}) {
	const cfg = getSmtpConfig()
	const transporter = nodemailer.createTransport({
		host: cfg.host,
		port: cfg.port,
		secure: cfg.secure,
		auth: {
			user: cfg.user,
			pass: cfg.pass
		}
	})

	await transporter.sendMail({
		from: cfg.from,
		to: params.to,
		subject: "Salonify Password Reset",
		text: `You requested a password reset for your Salonify account.\n\nUse this link to set a new password:\n${params.resetUrl}\n\nThis link expires in ${params.expiresInMinutes} minutes. If you did not request this, you can ignore this email.`,
		html: `<p>You requested a password reset for your Salonify account.</p><p><a href="${params.resetUrl}">Reset your password</a></p><p>This link expires in ${params.expiresInMinutes} minutes.</p><p>If you did not request this, you can ignore this email.</p>`
	})
}
