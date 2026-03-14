import webpush from "web-push"
import { prisma } from "./db"

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ""
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ""
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@barbershop.app"

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
	try {
		webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
	} catch (err: any) {
		console.error("Failed to configure web-push VAPID keys:", err.message)
	}
}

export function getVapidPublicKey(): string {
	return VAPID_PUBLIC_KEY
}

export async function sendPushToUser(
	userId: string,
	payload: { title: string; body: string; url?: string }
) {
	if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
		console.warn("VAPID keys not configured, skipping push notification")
		return
	}

	const subscriptions = await prisma.pushSubscription.findMany({
		where: { userId }
	})

	if (subscriptions.length === 0) return

	const data = JSON.stringify(payload)

	const results = await Promise.allSettled(
		subscriptions.map((sub) =>
			webpush
				.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: { p256dh: sub.p256dh, auth: sub.auth }
					},
					data
				)
				.catch(async (err) => {
					// If subscription is expired or invalid (410 Gone, 404), remove it
					if (err.statusCode === 410 || err.statusCode === 404) {
						await prisma.pushSubscription
							.delete({ where: { id: sub.id } })
							.catch(() => {})
					}
					throw err
				})
		)
	)

	const sent = results.filter((r) => r.status === "fulfilled").length
	const failed = results.filter((r) => r.status === "rejected").length
	if (failed > 0) {
		console.warn(`Push notifications: ${sent} sent, ${failed} failed for user ${userId}`)
	}
}
