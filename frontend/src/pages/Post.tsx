import { useRecoilValueLoadable } from "recoil"
import { BlogPostData } from "../store/atoms/blogFetchAtom"
import { useNavigate, useParams } from "react-router-dom"
import { BlogPostSkeleton } from "../components/BlogPostSkeleton"
import { Blog } from "../components/BlogPostCompo/Blog"
import { NavLinks } from "../components/NavBar/NavLinks"
import { JSONContent } from "@tiptap/react"
import { PostContext } from "../context/PostContext"
import { toast } from "sonner"

export type Blog = {
    id: string
    title: string
    brief: string
    imageURL: string | null
    content: JSONContent
    summary?: string | null
    publishedAt: string
    author: {
        id: string
        username: string
    }
    isSaved: boolean
    isFollower: boolean
}

export const Post = () => {

    const navigate = useNavigate();

    // 1. one way that i can use to extract id from search params also called as Dynamic routing
    const { id } = useParams();

    // if id only then state update else a red squiggly would appear over "id" if not conditioned following step
    const blogLoadable = useRecoilValueLoadable(BlogPostData(id ?? ""))   // this will cause a re-render cuz its updating the state

    const handleLoginNav = () => {
        navigate("/login")
    }
    if (blogLoadable.state === "loading") {
        return <div className="flex flex-col min-h-screen bg-canvas">
            <BlogPostSkeleton></BlogPostSkeleton>
        </div>
    } else if (blogLoadable.state === "hasError") {
        toast.error("Unexpected error occured")
    } else if (blogLoadable.state === "hasValue") {
        if (blogLoadable.contents === undefined) {
            return (
                <>
                    <div className="flex h-screen justify-center items-center bg-canvas px-6 ">
                        <div className=" surface-card flex flex-col gap-3 w-[500px] max-w-full rounded-2xl p-7 ">
                            <h1 className="text-2xl text-neutral-900 font-semibold font-serif ">No data found</h1>
                            <p className="text-neutral-700 text-base font-medium">Reason :</p>
                            <ul className="text-neutral-500 list-disc pl-5 space-y-1">
                                <li>User Not Authenticated</li>
                                <li>Blog Doesn't Exist</li>
                            </ul>
                            <p className="text-neutral-700 text-base font-medium mt-2">Possible Fixes : </p>
                            <button onClick={handleLoginNav} className="w-[150px] h-10 font-medium btn-primary self-center rounded-full">Re-Login</button>
                        </div>
                    </div>
                </>
            )
        } else {
            const blog: Blog = blogLoadable.contents.blog

            return (
                <>
                    {
                        blog &&
                        <div className="flex flex-col min-h-screen bg-canvas">
                            <NavLinks ></NavLinks>
                            <PostContext.Provider value={blog}>
                                <Blog />
                            </PostContext.Provider>
                        </div>
                    }
                </>
            );
        }
    }
    return null;
}



// 2. other way to pass id from the BlogCard.tsx Link tag, and use useLocation to capture id and pass it to recoil state management
// const location = useLocation();
// const { id } = location.state;

