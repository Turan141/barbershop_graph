import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

interface ProtectedRouteProps {
	children: JSX.Element
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { user } = useAuthStore()
	const location = useLocation()

	if (!user) {
		return <Navigate to="/login" state={{ from: location.pathname }} replace />
	}

	return children
}
