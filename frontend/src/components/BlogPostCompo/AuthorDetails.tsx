import { motion } from "motion/react"
// import { useState } from "react"
import { SaveButton } from "../BlogCardCompo/SaveButton"
import { FollowButton } from "./FollowButton"
import { useContext } from "react"
import { PostContext } from "../../context/PostContext"
import { useRecoilValue } from "recoil"
import { userId } from "../../store/atoms/userInfoAtom"
type Prop = {
    item: {
        hidden: { opacity: number, y: number },
        show: { opacity: number, y: number }
    },
}

export const AuthorDetails = ({ item }: Prop) => {
    const blog = useContext(PostContext)
    const imageURL = ""  // for temporary purpose
    const id = useRecoilValue(userId)
    return (
        <motion.div variants={item} className="flex justify-between">
            <div className="flex items-center">
                {
                    imageURL === "" ?
                        <div className="flex">
                            <img className="w-7 h-7 " src="/user.svg" alt="authorsvg" />
                        </div>
                        :
                        <div >
                            <img src={imageURL} alt="authorImg" />
                        </div>
                }
                <div className="flex flex-col pl-2">
                    <div className=" font-medium text-md text-neutral-900 lg:text-base " >
                        {blog?.author.username}
                    </div>
                    <div className="text-neutral-400 text-xs ">
                        {blog?.publishedAt}
                    </div>
                </div>
            </div>
            {
                id !== blog?.author.id &&
                <div className="flex space-x-3 items-center">
                    <SaveButton ></SaveButton>
                    <FollowButton ></FollowButton>
                </div>}
        </motion.div>
    )
}