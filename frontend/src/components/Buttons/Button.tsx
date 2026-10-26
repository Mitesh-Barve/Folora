import { motion } from "motion/react"

type Props = {
    text: string
    className: string
    onclick: () => void
    loading?: boolean
}
export const Button = ({ text, className, onclick, loading }: Partial<Props>) => {
    return (
        <motion.button
            initial={{ opacity: 0, }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut", delay: 0.6 }}
            onClick={onclick}
            className={`w-[280px] h-11 text-center px-4 font-medium btn-primary rounded-xl shadow-card ${className} `}>
            <p>{loading ? text?.toLowerCase() === "login" ? "Logging In..." : "Signing Up..." : text}</p>
        </motion.button>
    )
}
