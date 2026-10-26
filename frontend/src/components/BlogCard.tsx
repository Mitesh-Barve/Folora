
import React from "react"
import { Link } from "react-router-dom"
import { JSONContent } from "@tiptap/react"
import { motion } from "motion/react"
import { LikeButton } from "./BlogCardCompo/LikeButton"
import { DislikeButton } from "./BlogCardCompo/DislikeButton"
import { SaveButton } from "./BlogCardCompo/SaveButton"
import { BlogData } from "./BlogCardCompo/BlogData"
import { BlogImg } from "./BlogCardCompo/BlogImg"
import { BlogTags } from "./BlogCardCompo/BlogTags"

type Prop = {
  username: string
  title: string
  brief: string
  content: JSONContent
  datePublished: string
  imageURL?: string
  blogID: string
  tags: string[]
  editHref?: string
  onDelete?: () => void
}

// Walks the TipTap content tree and returns the src of the first inline image.
// Used as a thumbnail fallback when the author didn't set a dedicated cover image.
const firstImageSrc = (doc?: JSONContent): string | undefined => {
  if (!doc || !Array.isArray(doc.content)) return undefined
  for (const node of doc.content) {
    if (node.type === "image" && typeof node.attrs?.src === "string") {
      return node.attrs.src
    }
    const nested = firstImageSrc(node)
    if (nested) return nested
  }
  return undefined
}

// React.memo was used cuz i think motion can cause re-renders and disturb the rendering process, so.....
export const BlogCard = React.memo(({ username, title, datePublished, brief, content, imageURL, blogID, tags, editHref, onDelete }: Prop) => {

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0, offset: ["start center"] }}
        transition={{ type: "spring", stiffness: 100, damping: 20, restDelta: 0.015, }}
        className="surface-card relative m-2 cursor-pointer p-5 w-[400px] md:w-[500px] lg:w-[700px] lg:max-h-[250px] mt-5 transition-all duration-200 hover:shadow-card-hover hover:border-primary/40 "
      >

        <Link to={`/blog/id/${blogID}`}  >
          <div className=" grid grid-cols-6 md:grid-cols-3 lg:grid-cols-3">
            {/* blog data */}
            <BlogData username={username} title={title} brief={brief} datePublished={datePublished}></BlogData>
            {/* blog image */}
            <BlogImg imageURL={imageURL || firstImageSrc(content) || ""}></BlogImg>
          </div>
        </Link>

        {/* blog relation subject */}
        <div className="relative col-span-full flex gap-2 pt-6 items-center">
          <BlogTags tags={tags}></BlogTags>
          {/* read time  */}
          <div className="text-xs pl-1 text-neutral-400 "> 3 min read</div>
          <LikeButton blogID={blogID}></LikeButton>
          <DislikeButton blogID={blogID}></DislikeButton>
          <SaveButton blogId={blogID}></SaveButton>
          {editHref && (
            <Link
              to={editHref}
              className="ml-auto text-xs px-2.5 py-1 btn-ghost rounded-full font-medium text-neutral-500 hover:text-primary flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-pencil text-xs"></i> Edit
            </Link>
          )}
          {onDelete && (
            <button
              className={`${editHref ? "" : "ml-auto"} text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors`}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <i className="bi bi-trash text-xs"></i> Delete
            </button>
          )}
        </div>
      </motion.div>
    </>
  )
})