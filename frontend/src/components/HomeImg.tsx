import { motion } from "motion/react"

type Prop = {
    className: string
}
export const HomeImg = ({ className }: Partial<Prop>) => {
    const parentVariant = {
        initial: {
            opacity: 0,
        },
        animate: {
            opacity: 1,
            transition: {
                delayChildren: 1,
                staggerChildren: 0.2
            }
        }
    }
    const childVariant = {
        initial: { opacity: 0, y: -100 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 10 } }
    }
    return (
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 50, damping: 10, restDelta: 0.014, restSpeed: 0.05 }} className={`${className} relative hidden lg:block self-center pl-28 `}>
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-accent-soft "></div>
            <div className="relative w-[450px] h-[300px] bg-surface border border-stone-200 rounded-2xl shadow-card-hover" >
                <div className="flex justify-between border-b border-neutral-200 pt-3">
                    <motion.div variants={parentVariant} initial="initial" animate="animate" className=" font-serif tracking-wide pl-4 text-2xl text-neutral-900">
                        <motion.p variants={childVariant} className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-accent-ink ">Folora</motion.p>
                        <motion.p variants={childVariant}>Henri Matisse</motion.p>
                    </motion.div>

                    <motion.div variants={parentVariant} initial="initial" animate="animate" className="flex gap-1 pr-6 pt-3">
                        <motion.span variants={childVariant} className=" w-2.5 h-2.5 rounded-full bg-accent"></motion.span>
                        <motion.span variants={childVariant} className=" w-2.5 h-2.5 rounded-full bg-accent"></motion.span>
                        <motion.span variants={childVariant} className=" w-2.5 h-2.5 rounded-full bg-accent"></motion.span>
                    </motion.div>
                </div>
                <motion.div variants={parentVariant} initial="initial" animate="animate" className=" grid grid-cols-3 ">
                    <motion.div variants={childVariant} className="col-span-2 text-2xl font-serif pt-20 pl-4 pr-2 font-semibold text-neutral-800  ">
                        Don't wait for inspiration, it comes while working
                        <motion.p variants={childVariant} className="text-xs text-neutral-400 pt-3 font-sans font-normal"> - French Painter, Prominent Figure In Modern Art</motion.p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: "easeIn", delay: 1 }} className="pt-16 pl-6 " >
                        <img src="https://www.henrimatisse.org/assets/img/henri-matisse.jpg" className="w-[110px] h-[110px] rounded-xl ring-1 ring-accent/40 object-cover " alt="" />
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    )
}
