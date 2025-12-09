/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Euclid Circular B", "sans-serif"]
			},
			colors: {
				primary: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8",
					500: "#0ea5e9",
					600: "#0284c7",
					700: "#0369a1",
					800: "#075985",
					900: "#0c4a6e",
					950: "#082f49"
				}
			},
			boxShadow: {
				soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
				glow: "0 0 15px rgba(14, 165, 233, 0.3)"
			},
			animation: {
				"fade-in": "fadeIn 0.5s ease-out",
				"slide-up": "slideUp 0.5s ease-out",
				gradient: "gradient 8s linear infinite",
				"pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite"
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" }
				},
				slideUp: {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" }
				},
				gradient: {
					"0%, 100%": {
						"background-size": "200% 200%",
						"background-position": "left center"
					},
					"50%": {
						"background-size": "200% 200%",
						"background-position": "right center"
					}
				}
			}
		}
	},
	plugins: []
}
