import { motion } from "motion/react"
import { useContext } from "react"
import { PostContext } from "../../context/PostContext"
type Prop = {
    item: {}
}
export const HeaderContent = ({ item }: Prop) => {
    const blog = useContext(PostContext)
    return (
        <>
            <motion.div variants={item} className=" text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight leading-tight text-neutral-900 ">
                {blog?.title}
            </motion.div>
            <motion.div variants={item} className="text-sm text-neutral-500 md:text-base lg:text-lg">
                <span className="text-accent-ink font-medium">
                    Context :
                </span>
                <span>{blog?.brief}</span>
            </motion.div>
        </>
    )
}
