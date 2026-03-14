import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "../types"

interface AuthState {
	user: User | null
	token: string | null
	isAuthenticated: boolean
	login: (user: User, token: string) => void
	logout: () => void
	updateToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			login: (user, token) => set({ user, token, isAuthenticated: true }),
			logout: () => set({ user: null, token: null, isAuthenticated: false }),
			updateToken: (token) => set({ token })
		}),
		{
			name: "auth-storage"
		}
	)
)
