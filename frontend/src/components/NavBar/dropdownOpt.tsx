import { motion } from "motion/react"

type Prop = {
    text: string
    svg: string
    onclick: () => void
    className: string
}
export const DropdownOpt = ({ text, svg, onclick, className }: Partial<Prop>) => {

    return (
        <motion.button
            whileHover={{ scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } }}
            className={`flex items-center gap-2 text-xl md:text-2xl cursor-pointer text-neutral-700 hover:text-primary transition-colors ${className}`} onClick={onclick} >{text}
            <span>
                <img src={svg} className="w-7 h-7 md:w-9 md:h-9 pl-1 pt-1 " alt="" />
            </span>
        </motion.button>
    )
}
