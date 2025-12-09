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
			get: vi.fn(),
			getReviews: vi.fn().mockResolvedValue([])
		},
		bookings: {
			create: vi.fn(),
			listForBarber: vi.fn().mockResolvedValue([])
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
		Monday: { start: "10:00", end: "18:00" },
		Tuesday: { start: "10:00", end: "18:00" },
		Wednesday: { start: "10:00", end: "18:00" },
		Thursday: { start: "10:00", end: "18:00" },
		Friday: { start: "10:00", end: "18:00" },
		Saturday: { start: "10:00", end: "18:00" },
		Sunday: { start: "10:00", end: "18:00" }
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
		// vi.useFakeTimers({ toFake: ["Date"] })
		// vi.setSystemTime(new Date(2023, 10, 20, 10, 0, 0)) // Mon Nov 20 2023
		;(useAuthStore as any).mockReturnValue({ user: mockUser })
		;(api.barbers.get as any).mockResolvedValue(mockBarber)
		;(api.bookings.create as any).mockResolvedValue({ id: "booking-123" })
	})

	afterEach(() => {
		// vi.useRealTimers()
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
		// Open dropdown first
		const dropdownTrigger = screen.getByText(/Select a service/i)
		fireEvent.click(dropdownTrigger)

		// Select the service from the dropdown (it's a button, unlike the list in profile)
		const serviceButton = screen.getByRole("button", { name: /Test Service/i })
		fireEvent.click(serviceButton)

		// Wait for service to be selected (dropdown closes and main button shows service name)
		await waitFor(() => {
			// The main button should now show "Test Service"
			// We can check that the placeholder is gone
			expect(screen.queryByText("Select a service...")).not.toBeInTheDocument()
		})

		// 3. Select a date
		// Just click the first date button available
		const dateButtons = screen.getAllByRole("button")
		// The date buttons are the ones with "Mon", "Tue" etc. or just check for the container
		// We can look for buttons that are NOT the service selection button
		// The date buttons have a specific structure.
		// Let's just pick the 3rd button (index 2) - 1st is back, 2nd is service, 3rd+ are dates?
		// Actually, let's look for a button that contains a day name
		const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
		const dateButton = dateButtons.find((b) =>
			days.some((d) => b.textContent?.includes(d))
		)

		expect(dateButton).toBeDefined()
		if (dateButton) fireEvent.click(dateButton)

		// 4. Select a time
		// We mocked schedule for all days to have '10:00'.
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
				date: expect.any(String), // Date depends on current day
				time: "10:00"
			})
		})
	}, 15000) // Increase timeout to 10s
})
