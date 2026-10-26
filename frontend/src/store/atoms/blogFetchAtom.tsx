import axios, { AxiosError } from "axios";
import { atom, selectorFamily } from "recoil";
import { BLOGS_BACKEND_URL, USERS_BACKEND_URL } from "../../config";
import { toast } from "sonner";

// Bumping this value invalidates the cached UserBlogs selector so "/myblogs" refetches
// (used after a blog is deleted from that page).
export const userBlogsVersion = atom({
    key: "userBlogsVersion",
    default: 0,
});

// all blogs 
export const AllBlogs = selectorFamily({
    key: "allBlogs",
    get: ({ limit, cursor }: { limit: number, cursor?: string | null }) => async () => {
        try {
            const res = await axios.get(`${BLOGS_BACKEND_URL}/bulk`, { params: cursor ? { limit: limit, cursor: cursor } : { limit: limit }, withCredentials: true })

            if (res.status === 200) {
                return res.data;
            }
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 401) {
                    return {
                        data: null,
                        errorStatus: 401
                    }
                } else {
                    return {
                        data: null,
                        errorStatus: 500
                    }
                }
            }
        }
    }
})

export const BlogPostData = selectorFamily({
    key: "blogPost/default",
    get: (id: string) => async () => {
        try {
            const res = await axios.get(`${BLOGS_BACKEND_URL}/id/${id}`, { withCredentials: true })
            if (res.status === 200) {
                return res.data;
            }
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 401) {
                    console.error("Unauthorized user")
                    return;
                } else {
                    console.error("internal server error", e);
                    return;
                }
            }
        }
        return;
    }
})



// user blogs on "/myblogs" page
export const UserBlogs = selectorFamily({
    key: "userBlogAtom",
    get: (userId: string) => async ({ get }) => {
        if (!userId) return null;
        // depend on the version so callers can force a refetch by bumping it
        get(userBlogsVersion);
        try {
            const res = await axios.get(`${USERS_BACKEND_URL}/myblogs?id=${userId}`, { withCredentials: true });
            return res.data;

        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 401) {
                    toast.error("User is Unauthorized")
                    return;
                } else {
                    toast.error("Internal Server Error")
                    return;
                }
            }
        }
        return;
    }
})

