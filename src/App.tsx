import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { BarberProfilePage } from "./pages/BarberProfilePage"
import { BarberDashboardPage } from "./pages/BarberDashboardPage"
import { FavoritesPage } from "./pages/FavoritesPage"
import { UserBookingsPage } from "./pages/UserBookingsPage"

function App() {
	return (
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/login' element={<LoginPage />} />
					<Route path='/dashboard' element={<BarberDashboardPage />} />
					<Route path='/favorites' element={<FavoritesPage />} />
					<Route path='/bookings' element={<UserBookingsPage />} />
					<Route path='/barbers/:id' element={<BarberProfilePage />} />
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	)
}

export default App
