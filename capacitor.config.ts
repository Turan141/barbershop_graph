import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
	appId: "com.barberbook.app",
	appName: "BarberBook",
	webDir: "dist",
	server: {
		androidScheme: "http",
		cleartext: true
	}
}

export default config
