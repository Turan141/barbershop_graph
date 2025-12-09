import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
	appId: "com.barberbook.app",
	appName: "BarberBook",
	webDir: "dist",
	server: {
		androidScheme: "http",
		cleartext: true
	},
	plugins: {
		SplashScreen: {
			launchShowDuration: 2000,
			launchAutoHide: true,
			backgroundColor: "#0284c7",
			androidSplashResourceName: "splash",
			showSpinner: false,
			splashFullScreen: true,
			splashImmersive: true
		}
	}
}

export default config
