import { LocalNotifications } from "@capacitor/local-notifications"

export const NotificationService = {
	async requestPermissions() {
		const result = await LocalNotifications.requestPermissions()
		return result.display === "granted"
	},

	async scheduleBookingReminder(
		bookingId: string,
		barberName: string,
		date: string,
		time: string
	) {
		// Parse date and time to create a Date object
		// date format: YYYY-MM-DD, time format: HH:mm
		const bookingDate = new Date(`${date}T${time}:00`)

		// Schedule reminder 1 hour before
		const reminderDate = new Date(bookingDate.getTime() - 60 * 60 * 1000)

		// If the reminder time is in the past, don't schedule (or schedule immediately if close?)
		// For now, only schedule if it's in the future
		if (reminderDate.getTime() <= Date.now()) {
			console.log("Reminder time is in the past, skipping")
			return
		}

		try {
			await LocalNotifications.schedule({
				notifications: [
					{
						title: "Upcoming Haircut Appointment",
						body: `You have an appointment with ${barberName} in 1 hour at ${time}.`,
						id: Math.floor(Math.random() * 1000000), // Simple random ID
						schedule: { at: reminderDate },
						sound: undefined,
						attachments: undefined,
						actionTypeId: "",
						extra: {
							bookingId
						}
					}
				]
			})
			console.log("Notification scheduled for", reminderDate)
		} catch (error) {
			console.error("Failed to schedule notification", error)
		}
	},

	async testNotification() {
		const granted = await this.requestPermissions()
		if (!granted) return

		await LocalNotifications.schedule({
			notifications: [
				{
					title: "Test Notification",
					body: "This is a test notification from BarberBook",
					id: 1,
					schedule: { at: new Date(Date.now() + 5000) }, // 5 seconds from now
					sound: undefined,
					attachments: undefined,
					actionTypeId: "",
					extra: null
				}
			]
		})
	}
}
