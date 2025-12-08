import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { BarberProfilePage } from "../pages/BarberProfilePage"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { api } from "../services/api"
import { useAuthStore } from "../store/authStore"
import { I18nextProvider } from "react-i18next"
import i18n from "../i18n/config"

// Mock the API
vi.mock("../services/api", () => ({
	api: {
		barbers: {
			get: vi.fn()
		},
		bookings: {
			create: vi.fn()
		}
	}
}))

// Mock Auth Store
vi.mock("../store/authStore", () => ({
	useAuthStore: vi.fn()
}))

// Mock Favorites Store
vi.mock("../store/favoritesStore", () => ({
	useFavoritesStore: vi.fn(() => ({
		isFavorite: () => false,
		addFavorite: vi.fn(),
		removeFavorite: vi.fn(),
		fetchFavorites: vi.fn()
	}))
}))

const mockBarber = {
	id: "b1",
	name: "Test Barber",
	email: "test@barber.com",
	role: "barber",
	specialties: ["Fade"],
	rating: 5.0,
	reviewCount: 10,
	location: "Test Location",
	bio: "Test Bio",
	tier: "vip",
	portfolio: [],
	services: [
		{ id: "s1", name: "Test Service", duration: 30, price: 20, currency: "AZN" }
	],
	schedule: {
		Monday: ["10:00", "11:00"],
		Tuesday: ["10:00", "11:00"],
		Wednesday: ["10:00", "11:00"],
		Thursday: ["10:00", "11:00"],
		Friday: ["10:00", "11:00"],
		Saturday: ["10:00", "11:00"],
		Sunday: ["10:00", "11:00"]
	}
}

const mockUser = {
	id: "u1",
	name: "Test User",
	email: "user@test.com",
	role: "client"
}

describe("Booking Flow", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers({ toFake: ["Date"] })
		vi.setSystemTime(new Date(2023, 10, 20, 10, 0, 0)) // Mon Nov 20 2023
		;(useAuthStore as any).mockReturnValue({ user: mockUser })
		;(api.barbers.get as any).mockResolvedValue(mockBarber)
		;(api.bookings.create as any).mockResolvedValue({ id: "booking-123" })
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.resetAllMocks()
	})

	it("completes a booking successfully", async () => {
		await i18n.changeLanguage("en") // Use English for predictable date formatting

		render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={["/barber/b1"]}>
					<Routes>
						<Route path='/barber/:id' element={<BarberProfilePage />} />
					</Routes>
				</MemoryRouter>
			</I18nextProvider>
		)

		// 1. Wait for barber details to load
		await waitFor(() => {
			expect(screen.getByText("Test Barber")).toBeInTheDocument()
		})

		// 2. Select a service
		const serviceButton = screen.getByText("Test Service")
		fireEvent.click(serviceButton)

		// 3. Select a date
		// On Nov 20 2023 (Monday), the first date button should be "Mon 20" in English.
		// The component splits by space: label.split(" ")[1] is the day number.
		// "Mon 20" -> "20".

		const dateButtons = screen.getAllByRole("button")
		// Find button that has "20" in it.
		const dateButton = dateButtons.find((b) => b.textContent?.includes("20"))

		expect(dateButton).toBeDefined()
		if (dateButton) fireEvent.click(dateButton)

		// 4. Select a time
		// We mocked schedule for Monday to have '10:00'.
		// Wait for time slots to appear.
		await waitFor(() => {
			expect(screen.getByText("10:00")).toBeInTheDocument()
		})

		const timeButton = screen.getByText("10:00")
		fireEvent.click(timeButton)

		// 5. Click Book
		// In English, it should be "Confirm".
		const confirmButton = screen.getByText("Confirm")
		fireEvent.click(confirmButton)

		// 6. Assert API call
		await waitFor(() => {
			expect(api.bookings.create).toHaveBeenCalledWith({
				barberId: "b1",
				clientId: "u1",
				serviceId: "s1",
				date: "2023-11-20",
				time: "10:00"
			})
		})
	}, 15000) // Increase timeout to 10s
})
