import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { LanguageSwitcher } from "../components/LanguageSwitcher"
import { I18nextProvider } from "react-i18next"
import i18n from "../i18n/config"

describe("LanguageSwitcher", () => {
	it("renders language buttons", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<LanguageSwitcher />
			</I18nextProvider>
		)

		expect(screen.getByText("AZ")).toBeInTheDocument()
		expect(screen.getByText("EN")).toBeInTheDocument()
		expect(screen.getByText("RU")).toBeInTheDocument()
	})
})
