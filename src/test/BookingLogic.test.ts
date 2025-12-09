import { describe, it, expect } from "vitest"
import { generateTimeSlots, isSlotAvailable } from "../utils/bookingLogic"
import { Booking } from "../types"

describe("Booking Logic", () => {
	describe("generateTimeSlots", () => {
		it("generates slots correctly for 15:00 start", () => {
			const slots = generateTimeSlots("15:00", "18:00", 30)
			expect(slots).toEqual(["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"])
		})

		it("generates slots correctly for 60 min service", () => {
			const slots = generateTimeSlots("15:00", "18:00", 60)
			expect(slots).toEqual(["15:00", "15:30", "16:00", "16:30", "17:00"])
		})
	})

	describe("isSlotAvailable", () => {
		const date = "2023-10-27"

		it("should return true if no bookings", () => {
			const bookings: Booking[] = []
			expect(isSlotAvailable("14:00", 30, bookings, date)).toBe(true)
		})

		it("should return false if exact overlap", () => {
			const bookings: Booking[] = [
				{
					id: "1",
					date: date,
					time: "14:00",
					status: "confirmed",
					barberId: "1",
					clientId: "1",
					serviceId: "1",
					createdAt: "",
					service: { duration: 30, id: "1", name: "Cut", price: 10, currency: "USD" }
				}
			]
			expect(isSlotAvailable("14:00", 30, bookings, date)).toBe(false)
		})

		it("should return false if overlapping with a long booking", () => {
			// Booking at 14:00 for 2 hours (until 16:00)
			const bookings: Booking[] = [
				{
					id: "1",
					date: date,
					time: "14:00",
					status: "confirmed",
					barberId: "1",
					clientId: "1",
					serviceId: "1",
					createdAt: "",
					service: {
						duration: 120,
						id: "1",
						name: "Long Cut",
						price: 10,
						currency: "USD"
					}
				}
			]

			// 14:00 (30m) -> Overlaps
			expect(isSlotAvailable("14:00", 30, bookings, date)).toBe(false)
			// 15:00 (30m) -> Overlaps
			expect(isSlotAvailable("15:00", 30, bookings, date)).toBe(false)
			// 15:30 (30m) -> Overlaps
			expect(isSlotAvailable("15:30", 30, bookings, date)).toBe(false)
			// 16:00 (30m) -> No overlap
			expect(isSlotAvailable("16:00", 30, bookings, date)).toBe(true)
		})

		it("should return false if new booking overlaps existing short booking", () => {
			// Booking at 15:00 for 30 mins
			const bookings: Booking[] = [
				{
					id: "1",
					date: date,
					time: "15:00",
					status: "confirmed",
					barberId: "1",
					clientId: "1",
					serviceId: "1",
					createdAt: "",
					service: { duration: 30, id: "1", name: "Cut", price: 10, currency: "USD" }
				}
			]

			// Try to book 14:00 for 2 hours (14:00 - 16:00)
			// Overlaps 15:00-15:30
			expect(isSlotAvailable("14:00", 120, bookings, date)).toBe(false)
		})
	})
})
