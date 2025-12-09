import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { BarberProfilePage } from "./pages/BarberProfilePage"
import { BarberDashboardPage } from "./pages/BarberDashboardPage"
import { FavoritesPage } from "./pages/FavoritesPage"
import { UserBookingsPage } from "./pages/UserBookingsPage"
import { FeaturesPage } from "./pages/FeaturesPage"
import { ForBarbersPage } from "./pages/ForBarbersPage"
import { PricingPage } from "./pages/PricingPage"
import { AboutPage } from "./pages/AboutPage"
import { CareersPage } from "./pages/CareersPage"
import { ContactPage } from "./pages/ContactPage"
import { PrivacyPage } from "./pages/PrivacyPage"
import { TermsPage } from "./pages/TermsPage"
import { ScrollToTop } from "./components/ScrollToTop"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "react-hot-toast"

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<SpeedInsights />
			<Toaster position='top-center' />
			<Layout>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />
					<Route path='/features' element={<FeaturesPage />} />
					<Route path='/for-barbers' element={<ForBarbersPage />} />
					<Route path='/pricing' element={<PricingPage />} />
					<Route path='/about' element={<AboutPage />} />
					<Route path='/careers' element={<CareersPage />} />
					<Route path='/contact' element={<ContactPage />} />
					<Route path='/privacy' element={<PrivacyPage />} />
					<Route path='/terms' element={<TermsPage />} />
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
