import { useEffect, useState } from "react"
import axios, { AxiosError } from "axios";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { BLOGS_BACKEND_URL } from "../../config";
import { JSONContent } from "@tiptap/react";
import { toast } from "sonner";

export const SearchBar = () => {
    interface Blog {
        id: string
        title: string,
        brief: string,
        content: JSONContent
    }
    const [searchVal, setSearchVal] = useState<string>("")
    const { queryStr } = useDebounce(searchVal);
    const [blogPost, setBlogPost] = useState<Blog[]>([])
    useEffect(() => {
        if (queryStr !== "") {
            (async () => {
                try {
                    const res = await axios.get(`${BLOGS_BACKEND_URL}/searchBlog?search=${queryStr}`, { withCredentials: true })
                    if (res.status === 200) {
                        setBlogPost(res.data?.blog)
                    }
                } catch (e) {
                    if (e instanceof AxiosError) {
                        if (e.response?.status === 500) {
                            toast.error("Internal Server Error") // replace with custom alert 
                            return;
                        }
                    }
                }
            })()
        }
        return () => { }
    }, [queryStr, setBlogPost])

    return (
        <>
            <div className="pt-2">
                <input type="text" className="relative w-full min-w-[160px] md:min-w-[300px] lg:min-w-[380px] h-9 field pl-3 text-sm text-neutral-800 placeholder:text-neutral-400" onChange={(e) => setSearchVal(e.target.value)} placeholder="Search Here" />
            </div>
            {
                queryStr.length > 0 &&

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.3
                    }}
                    className="absolute flex flex-col gap-2 min-w-[180px] lg:min-w-[380px] md:min-w-[300px] right-0 max-h-[500px] min-h-5 bg-surface shadow-card-hover rounded-xl top-12 border border-stone-200 outline-none p-3 z-50 ">
                    {
                        blogPost?.length > 0 ?
                            blogPost?.map((post) => {
                                return (
                                    <Link key={post.id} to={`/blog/id/${post.id}`}>
                                        <div className="grid grid-cols-3 items-center">
                                            <div className="flex flex-col col-span-2">
                                                <span className="text-sm font-semibold text-neutral-800 "> {post.title.slice(0, 20)}</span>
                                                <span className="text-xs text-neutral-500  "> {post.brief?.slice(0, 30)}</span>
                                            </div>
                                            <span className="w-[80px] h-[50px] bg-neutral-100 rounded-lg col-span-1 "><img className="mt-1" src="/logo.svg" alt="" /> </span>
                                        </div>
                                    </Link>
                                )
                            })
                            : <span className=" text-sm text-neutral-500 font-medium">No results found</span>
                    }
                </motion.div >
            }

        </>

    )
}

