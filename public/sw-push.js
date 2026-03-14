// Service Worker for Web Push Notifications
// This file runs in the background even when the app is closed.

self.addEventListener("push", (event) => {
	if (!event.data) return

	let payload
	try {
		payload = event.data.json()
	} catch (e) {
		payload = { title: "New Notification", body: event.data.text() }
	}

	const options = {
		body: payload.body || "",
		icon: "/fonts/icon-192.png",
		badge: "/fonts/icon-192.png",
		vibrate: [200, 100, 200],
		data: { url: payload.url || "/" },
		actions: [{ action: "open", title: "Open" }]
	}

	event.waitUntil(
		self.registration.showNotification(payload.title || "BarberBook", options)
	)
})

self.addEventListener("notificationclick", (event) => {
	event.notification.close()

	const url = event.notification.data?.url || "/"

	event.waitUntil(
		clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((windowClients) => {
				// If a window is already open, focus it and navigate
				for (const client of windowClients) {
					if ("focus" in client) {
						client.focus()
						client.navigate(url)
						return
					}
				}
				// Otherwise open a new window
				return clients.openWindow(url)
			})
	)
})
