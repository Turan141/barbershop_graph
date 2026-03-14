import clsx from "clsx"
import { Scissors } from "lucide-react"

type BrandLogoProps = {
	size?: "sm" | "md"
	showText?: boolean
	className?: string
	textClassName?: string
}

export const BrandLogo = ({
	size = "md",
	showText = true,
	className,
	textClassName
}: BrandLogoProps) => {
	const iconSize = size === "sm" ? "w-9 h-9" : "w-10 h-10"
	const iconInner = size === "sm" ? "h-4.5 w-4.5" : "h-5 w-5"
	const titleSize = size === "sm" ? "text-lg" : "text-xl"

	return (
		<div className={clsx("group/brand flex items-center gap-3", className)}>
			<div
				className={clsx(
					"relative rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300",
					"motion-safe:[animation:brand-float_6s_ease-in-out_infinite]",
					"group-hover/brand:scale-[1.04]",
					"bg-gradient-to-br from-slate-900 via-slate-800 to-primary-600",
					"ring-1 ring-slate-800/30",
					iconSize
				)}
			>
				<div className='absolute inset-[-1px] rounded-[0.85rem] opacity-0 group-hover/brand:opacity-100 transition-opacity duration-300 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(14,165,233,0.35),rgba(2,132,199,0),rgba(14,165,233,0.35))] [animation:brand-spin_2.8s_linear_infinite]'></div>
				<div className='absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.25),transparent_45%)]'></div>
				<Scissors className={clsx("relative z-10", iconInner)} />
				<div className='absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-300 ring-2 ring-white/80'></div>
			</div>
			{showText && (
				<div className='leading-none'>
					<div
						className={clsx(
							"font-black tracking-tight text-slate-900 transition-transform duration-300 group-hover/brand:translate-x-[1px]",
							titleSize,
							textClassName
						)}
					>
						Salon<span className='text-primary-600'>ify</span>
					</div>
					<div className='text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 mt-1 transition-colors duration-300 group-hover/brand:text-slate-500'>
						Smart Booking
					</div>
				</div>
			)}
		</div>
	)
}
