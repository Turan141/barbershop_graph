import { create } from "zustand"
import { api } from "../services/api"
import { Barber } from "../types"

interface FavoritesState {
	favorites: Barber[]
	isLoading: boolean
	fetchFavorites: (userId: string) => Promise<void>
	addFavorite: (userId: string, barberId: string) => Promise<void>
	removeFavorite: (userId: string, barberId: string) => Promise<void>
	isFavorite: (barberId: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
	favorites: [],
	isLoading: false,
	fetchFavorites: async (userId: string) => {
		set({ isLoading: true })
		try {
			const favorites = await api.favorites.list(userId)
			set({ favorites })
		} catch (error) {
			console.error("Failed to fetch favorites", error)
		} finally {
			set({ isLoading: false })
		}
	},
	addFavorite: async (userId: string, barberId: string) => {
		try {
			await api.favorites.add(userId, barberId)
			// Optimistic update or re-fetch
			get().fetchFavorites(userId)
		} catch (error) {
			console.error("Failed to add favorite", error)
		}
	},
	removeFavorite: async (userId: string, barberId: string) => {
		try {
			await api.favorites.remove(userId, barberId)
			set((state) => ({
				favorites: state.favorites.filter((b) => b.id !== barberId)
			}))
		} catch (error) {
			console.error("Failed to remove favorite", error)
		}
	},
	isFavorite: (barberId: string) => {
		return get().favorites.some((b) => b.id === barberId)
	}
}))
