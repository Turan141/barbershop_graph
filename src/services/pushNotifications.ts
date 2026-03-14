import { useAuthStore } from "../store/authStore"
import { fetchWithAuth } from "./api"
import { Capacitor } from "@capacitor/core"

const getApiBase = () => {
	const override = import.meta.env.VITE_API_URL
	if (override) return override
	if (Capacitor.isNativePlatform()) {
		return "https://barbershop-graph-api.vercel.app/api"
	}
	return import.meta.env.PROD ? "/api" : "http://localhost:3000/api"
}

const API_BASE = getApiBase()

function isSupported(): boolean {
	return (
		"serviceWorker" in navigator &&
		"PushManager" in window &&
		"Notification" in window &&
		!Capacitor.isNativePlatform()
	)
}

/** Decode JWT payload and check if it's expired (client-side, no secret needed). */
function isTokenExpired(token: string): boolean {
	try {
		const payloadB64 = token.split(".")[1]
		if (!payloadB64) return true
		const payload = JSON.parse(atob(payloadB64))
		if (typeof payload.exp !== "number") return false
		// Add a 30-second buffer so we don't subscribe with a nearly-expired token
		return payload.exp * 1000 < Date.now() + 30_000
	} catch {
		return true
	}
}

async function getVapidPublicKey(): Promise<string | null> {
	try {
		const res = await fetch(`${API_BASE}/push/vapid-key`)
		if (!res.ok) return null
		const data = await res.json()
		return data.publicKey || null
	} catch {
		return null
	}
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
	const rawData = window.atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}

export async function subscribeToPush(): Promise<boolean> {
	if (!isSupported()) {
		console.log("Push notifications not supported in this environment")
		return false
	}

	// Check auth token FIRST — no point prompting for permission if we can't register
	const token = useAuthStore.getState().token
	if (!token) {
		console.log("No auth token, skipping push subscription")
		return false
	}
	if (isTokenExpired(token)) {
		console.warn(
			"Push subscription skipped: auth token is expired. Please log out and log back in."
		)
		return false
	}

	const permission = await Notification.requestPermission()
	if (permission !== "granted") {
		console.log("Push notification permission denied")
		return false
	}

	const vapidKey = await getVapidPublicKey()
	if (!vapidKey) {
		console.warn("VAPID public key not available from server")
		return false
	}

	try {
		const registration = await navigator.serviceWorker.register("/sw-push.js")
		await navigator.serviceWorker.ready

		// Check existing subscription
		let subscription = await registration.pushManager.getSubscription()

		if (!subscription) {
			subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource
			})
		}

		// Re-read token after all the async ops above in case it changed
		// Send subscription to server — fetchWithAuth handles token refresh automatically
		const res = await fetchWithAuth(`${API_BASE}/push/subscribe`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(subscription.toJSON())
		})

		if (!res.ok) {
			const body = await res.json().catch(() => ({}))
			console.warn("Push subscription rejected by server:", res.status, body)
			return false
		}

		return true
	} catch (error) {
		console.error("Failed to subscribe to push notifications:", error)
		return false
	}
}

export async function unsubscribeFromPush(): Promise<void> {
	if (!isSupported()) return

	try {
		const registration = await navigator.serviceWorker.getRegistration("/sw-push.js")
		if (!registration) return

		const subscription = await registration.pushManager.getSubscription()
		if (!subscription) return

		const token = useAuthStore.getState().token
		if (token) {
			await fetchWithAuth(`${API_BASE}/push/subscribe`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ endpoint: subscription.endpoint })
			}).catch(() => {})
		}

		await subscription.unsubscribe()
	} catch (error) {
		console.error("Failed to unsubscribe from push:", error)
	}
}

export async function isPushSubscribed(): Promise<boolean> {
	if (!isSupported()) return false
	try {
		const registration = await navigator.serviceWorker.getRegistration("/sw-push.js")
		if (!registration) return false
		const subscription = await registration.pushManager.getSubscription()
		return !!subscription
	} catch {
		return false
	}
}
