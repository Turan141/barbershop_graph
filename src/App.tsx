import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { BarberProfilePage } from "./pages/BarberProfilePage"
import { BarberDashboardPage } from "./pages/BarberDashboardPage"
import { FavoritesPage } from "./pages/FavoritesPage"
import { UserBookingsPage } from "./pages/UserBookingsPage"
import { ScrollToTop } from "./components/ScrollToTop"
import { ProtectedRoute } from "./components/ProtectedRoute"

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Layout>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<BarberDashboardPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/favorites'
						element={
							<ProtectedRoute>
								<FavoritesPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/bookings'
						element={
							<ProtectedRoute>
								<UserBookingsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/barbers/:id'
						element={
							<ProtectedRoute>
								<BarberProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	)
}

export default App
