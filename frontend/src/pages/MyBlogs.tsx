import { useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from "recoil"
import { UserBlogs, userBlogsVersion } from "../store/atoms/blogFetchAtom"
import axios, { AxiosError } from "axios"
import { BLOGS_BACKEND_URL } from "../config"
import { UnAuth } from "../components/UnAuth"
import { userId } from "../store/atoms/userInfoAtom"
import { BlogCard } from "../components/BlogCard"
import { NavLinks } from "../components/NavBar/NavLinks"
import { JSONContent } from "@tiptap/react"
import { Wobble } from "../components/Loader/Wobble"
import { toast } from "sonner"

export const MyBlogs = () => {
    const id = useRecoilValue(userId)
    const blogPost = useRecoilValueLoadable(UserBlogs(id))
    const bumpVersion = useSetRecoilState(userBlogsVersion)

    const handleDelete = async (blogId: string) => {
        if (!window.confirm("Delete this blog? This can't be undone.")) return
        try {
            await axios.delete(`${BLOGS_BACKEND_URL}/deleteBlog/${blogId}`, { withCredentials: true })
            toast.success("Blog deleted")
            bumpVersion((v) => v + 1) // refetch the list
        } catch (e) {
            if (e instanceof AxiosError) {
                toast.error(e.response?.data?.msg ?? "Failed to delete the blog")
            } else {
                toast.error("Failed to delete the blog")
            }
        }
    }

    if (blogPost.state === "loading") {
        return <Wobble></Wobble>
    } else if (blogPost.state === "hasError") {
        toast.error("Unexpected Error Occured")
    } else if (blogPost.state === "hasValue") {
        if (blogPost.contents === undefined) {
            return <UnAuth />
        } else {
            type Post = {
                username: string;
                post: {
                    id: string;
                    title: string;
                    brief: string;
                    content: JSONContent;
                    imageURL?: string | null;
                    published: boolean;
                    publishedAt: string;
                    author_id: string;
                    postTag: string[];
                }[];
            }
            const user: Post = blogPost.contents.user
            return (
                <>
                    {
                        user.post.length === 0 ?
                            <div className=" flex flex-col gap-2 items-center w-screen min-h-screen bg-canvas  ">
                                <NavLinks />
                                <div className="flex justify-center items-center mt-16 text-neutral-500 text-lg"> No blogs written yet. </div>
                            </div>
                            :
                            <>
                                <div className=" flex flex-col gap-2 items-center w-screen min-h-screen bg-canvas  ">
                                    <NavLinks />
                                    {
                                        user.post.map((blog) => {
                                            return (
                                                <div key={blog.id}>
                                                    <BlogCard
                                                        username={user.username}
                                                        datePublished={blog.publishedAt}
                                                        title={blog.title}
                                                        brief={blog.brief}
                                                        content={blog.content}
                                                        blogID={blog.id}
                                                        tags={blog.postTag}
                                                        imageURL={blog.imageURL || undefined}
                                                        editHref={`/edit/${blog.id}`}
                                                        onDelete={() => handleDelete(blog.id)}
                                                    />
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </>
                    }
                </>
            )

        }
    }
}
