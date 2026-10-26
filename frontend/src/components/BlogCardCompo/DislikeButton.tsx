import axios, { AxiosError } from "axios"
import { motion } from "motion/react"
import { BLOGS_BACKEND_URL } from "../../config"
import { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import { blogPostMetaData } from "../../store/atoms/blogMetadata"
import { toast } from "sonner"

type Prop = {
    blogID: string
}

// declared outside so the timer is shared across the handler and the debounce fn
let debounceDislikeTimer: NodeJS.Timeout

export const DislikeButton = ({ blogID }: Prop) => {
    const [dislike, setDislike] = useState<number>()
    const [isDisliked, setIsDislike] = useState<boolean>(false)

    const blogPost = useRecoilValue(blogPostMetaData(blogID))

    useEffect(() => {
        setDislike(blogPost?.dislikeCount)
    }, [blogPost])

    const debounceDislike = () => {
        clearTimeout(debounceDislikeTimer)
        debounceDislikeTimer = setTimeout(async () => {
            try {
                const res = await axios.post(`${BLOGS_BACKEND_URL}/disvote`, {}, { params: { blogId: blogID }, withCredentials: true })
                if (res.status === 200) {
                    setDislike(res.data.result.dislikeCount)
                    setIsDislike(res.data.result.isDisliked)
                }
            } catch (e) {
                setDislike(blogPost?.dislikeCount)
                setIsDislike(false)
                if (e instanceof AxiosError) {
                    if (e.response?.status === 401) {
                        toast.error("User Unauthorized")
                    } else {
                        toast.error("Internal Server Error")
                    }
                }
            }
        }, 1000)
    }

    const toggleDislike = () => {
        !isDisliked ? setDislike(prev => prev! + 1) : setDislike(prev => prev! - 1)
        setIsDislike(prev => !prev)
        debounceDislike()
    }

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeIn" }}
            className={` flex transition-colors rounded-full w-auto h-8 text-sm items-center gap-2 px-3 ${isDisliked ? 'bg-red-50 text-red-600' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'} `}
            onClick={toggleDislike}
        >
            {/* same heroicon path as the Like button, flipped 180deg so it reads as a thumbs-down */}
            <motion.span
                className="inline-flex"
                style={{ rotate: 180 }}
                whileHover={{ scale: 1.1, rotate: 190 }}
            >
                <svg
                    style={{ outline: 0 }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                    />
                </svg>
            </motion.span>
            {dislike}
        </motion.button>
    )
}
