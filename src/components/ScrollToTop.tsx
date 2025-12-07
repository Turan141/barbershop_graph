import { useLayoutEffect } from "react"
import { useLocation } from "react-router-dom"

export const ScrollToTop = () => {
	const { pathname } = useLocation()

	useLayoutEffect(() => {
		if ("scrollRestoration" in window.history) {
			window.history.scrollRestoration = "manual"
		}

		const scrollToTop = () => {
			window.scrollTo(0, 0)
			document.documentElement.scrollTo(0, 0)
			document.body.scrollTo(0, 0)
		}

		scrollToTop()

		const timeout = setTimeout(scrollToTop, 0)

		const raf = requestAnimationFrame(scrollToTop)

		return () => {
			clearTimeout(timeout)
			cancelAnimationFrame(raf)
		}
	}, [pathname])

	return null
}
