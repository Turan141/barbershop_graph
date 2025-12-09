import React, { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
	const modalRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
		}

		if (isOpen) {
			document.addEventListener("keydown", handleEscape)
			document.body.style.overflow = "hidden"
		}

		return () => {
			document.removeEventListener("keydown", handleEscape)
			document.body.style.overflow = "unset"
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in'>
			<div
				ref={modalRef}
				className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in max-h-[90vh] flex flex-col'
			>
				<div className='flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0'>
					<h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
					<button
						onClick={onClose}
						className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors'
					>
						<X className='w-5 h-5' />
					</button>
				</div>
				<div className='overflow-y-auto custom-scrollbar flex-1 relative'>{children}</div>
			</div>
		</div>
	)
}
