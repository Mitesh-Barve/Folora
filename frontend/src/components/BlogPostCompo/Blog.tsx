import { motion } from "motion/react"
import { AuthorDetails } from "./AuthorDetails"
import { HeaderContent } from "./HeaderContent"
import { ParsedContent } from "./ParsedContent"
import { ArticleSummary } from "./ArticleSummary"

export const Blog = () => {

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1 } }
    }
    const item = {
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="flex justify-center md:mx-auto px-4 py-10 ">
            {/* warm-paper reading column: no card chrome, distraction free */}
            <motion.div variants={container} initial={"hidden"} animate={"show"} layout className="flex flex-col justify-start w-full max-w-reader mx-auto px-2 md:px-8 py-10 md:py-14 gap-2">
                {/* title of the blog */}
                <HeaderContent item={item}></HeaderContent>

                {/* author image/svg */}
                <motion.span variants={item} className="w-full h-px bg-line"></motion.span>
                <AuthorDetails item={item}></AuthorDetails>
                <motion.span variants={item} className="w-full h-px bg-line"></motion.span>

                {/* AI summary of the article */}
                <ArticleSummary item={item}></ArticleSummary>

                {/* content of the blog */}
                <ParsedContent item={item}></ParsedContent>
            </motion.div>
        </div>
    )
}
