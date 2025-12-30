import { Booking } from "../types"
import { format } from "date-fns"

export const generateTimeSlots = (
	start: string,
	end: string,
	serviceDuration: number,
	interval: number = 30,
	selectedDate?: string
): string[] => {
	const slots: string[] = []
	let currentTime = new Date(`2000-01-01T${start}`)
	const endTime = new Date(`2000-01-01T${end}`)

	const now = new Date()
	const isToday = selectedDate === format(now, "yyyy-MM-dd")
	const currentMinutes = now.getHours() * 60 + now.getMinutes()

	while (currentTime < endTime) {
		const timeString = format(currentTime, "HH:mm")

		// Filter past times if today
		if (isToday) {
			const slotMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
			// Add buffer of 30 mins
			if (slotMinutes < currentMinutes + 30) {
				currentTime = new Date(currentTime.getTime() + interval * 60000)
				continue
			}
		}

		const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000)
		if (slotEnd <= endTime) {
			slots.push(timeString)
		}

		currentTime = new Date(currentTime.getTime() + interval * 60000)
	}

	return slots
}

export const isSlotAvailable = (
	slotTime: string,
	serviceDuration: number,
	bookings: Booking[],
	selectedDate: string
): boolean => {
	const slotStart = new Date(`2000-01-01T${slotTime}`)
	const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

	return !bookings.some((b) => {
		if (b.date !== selectedDate || b.status === "cancelled") return false

		const bookingStart = new Date(`2000-01-01T${b.time}`)

		// If booking has no service, assume 30 mins duration for safety
		const bookingDuration = b.service?.duration || 30
		const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60000)

		// Check for overlap
		// Overlap exists if (StartA < EndB) and (EndA > StartB)
		return slotStart < bookingEnd && slotEnd > bookingStart
	})
}
