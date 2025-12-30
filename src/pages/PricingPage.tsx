import { Check } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

export const PricingPage = () => {
const { t } = useTranslation()
const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

const handleContact = (plan: string) => {
const planName = plan === "starter" ? "Solo" : "Team"
const message = `Salam, m?n ${planName} paketin? qosulmaq ist?yir?m.`
const phoneNumber = "994500000000" // Replace with actual number
const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
window.open(url, "_blank")
}

const starterFeatures = t("pages.pricing.starter.features", {
returnObjects: true
}) as string[]
const proFeatures = t("pages.pricing.pro.features", { returnObjects: true }) as string[]

return (
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
<div className="text-center mb-16">
<h1 className="text-4xl font-bold text-slate-900 mb-4">{t("pages.pricing.title")}</h1>
<p className="text-xl text-slate-600 max-w-2xl mx-auto">
{t("pages.pricing.subtitle")}
</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
{/* Basic Plan */}
<div
className={`card p-8 border transition-all cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md ${
selectedPlan === "starter"
? "border-primary-600 ring-2 ring-primary-600 ring-offset-2"
: "border-slate-200 hover:border-primary-500"
}`}
onClick={() => setSelectedPlan("starter")}
>
<h3 className="text-xl font-semibold text-slate-900 mb-2">
{t("pages.pricing.starter.title")}
</h3>
<div className="text-4xl font-bold text-slate-900 mb-6">
{t("pages.pricing.starter.price")}
<span className="text-lg font-normal text-slate-500 ml-1">
/{t("pages.pricing.period")}
</span>
</div>
<ul className="space-y-4 mb-8">
{Array.isArray(starterFeatures) &&
starterFeatures.map((feature, index) => (
<li key={index} className="flex items-center gap-3 text-slate-600">
<Check className="h-5 w-5 text-green-500 flex-shrink-0" />
<span>{feature}</span>
</li>
))}
</ul>
<button
onClick={(e) => {
e.stopPropagation()
handleContact("starter")
}}
className={`w-full py-3 px-4 rounded-xl font-bold transition-colors ${
selectedPlan === "starter"
? "bg-primary-600 text-white hover:bg-primary-700"
: "bg-slate-100 text-slate-900 hover:bg-slate-200"
}`}
>
{t("pages.pricing.button")}
</button>
</div>

{/* Pro Plan */}
<div
className={`card p-8 border-2 relative transform transition-all cursor-pointer bg-white rounded-2xl shadow-xl ${
selectedPlan === "pro"
? "border-primary-600 ring-2 ring-primary-600 ring-offset-2 scale-105"
: "border-primary-600 scale-105"
}`}
onClick={() => setSelectedPlan("pro")}
>
<div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
{t("pages.pricing.popular")}
</div>
<h3 className="text-xl font-semibold text-slate-900 mb-2">
{t("pages.pricing.pro.title")}
</h3>
<div className="text-4xl font-bold text-slate-900 mb-6">
{t("pages.pricing.pro.price")}
<span className="text-lg font-normal text-slate-500 ml-1">
/{t("pages.pricing.period")}
</span>
</div>
<ul className="space-y-4 mb-8">
{Array.isArray(proFeatures) &&
proFeatures.map((feature, index) => (
<li key={index} className="flex items-center gap-3 text-slate-600">
<Check className="h-5 w-5 text-green-500 flex-shrink-0" />
<span>{feature}</span>
</li>
))}
</ul>
<button
onClick={(e) => {
e.stopPropagation()
handleContact("pro")
}}
className="w-full py-3 px-4 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
>
{t("pages.pricing.button")}
</button>
</div>
</div>
</div>
)
}
