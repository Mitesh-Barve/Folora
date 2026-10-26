import { useContext, useState } from "react";
import axios, { AxiosError } from "axios";
import { motion } from "motion/react";
import { PostContext } from "../../context/PostContext";
import { BLOGS_BACKEND_URL } from "../../config";

type Prop = {
    item: {}
}

type Status = "idle" | "loading" | "done" | "error";

// A one-click AI summary card shown at the top of a blog post.
// It calls the edge /summarize endpoint which caches the result in the DB,
// so a second click (or a revisit) returns instantly without extra quota.
export const ArticleSummary = ({ item }: Prop) => {
    const blog = useContext(PostContext);
    const [summary, setSummary] = useState<string | null>(blog?.summary ?? null);
    const [status, setStatus] = useState<Status>(blog?.summary ? "done" : "idle");
    const [message, setMessage] = useState<string>("");

    const handleSummarize = async () => {
        if (!blog?.id) return;
        setStatus("loading");
        setMessage("");
        try {
            const res = await axios.post(
                `${BLOGS_BACKEND_URL}/summarize/${blog.id}`,
                {},
                { withCredentials: true }
            );
            if (res.status === 200) {
                if (res.data.summary) {
                    setSummary(res.data.summary);
                    setStatus("done");
                } else {
                    setStatus("idle");
                    setMessage(res.data.msg ?? "Not enough content to summarize.");
                }
            }
        } catch (e) {
            setStatus("error");
            if (e instanceof AxiosError) {
                setMessage(e.response?.data?.msg ?? "Could not generate a summary. Try again later.");
            } else {
                setMessage("Could not generate a summary. Try again later.");
            }
        }
    };

    if (!blog) return null;

    return (
        <motion.div variants={item} className="my-4">
            {status !== "done" && (
                <div className="flex flex-col items-start gap-2">
                    <button
                        onClick={handleSummarize}
                        disabled={status === "loading"}
                        className="inline-flex items-center gap-2 px-4 h-9 btn-primary text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {status === "loading" ? (
                            <>
                                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block"></span>
                                Summarizing…
                            </>
                        ) : (
                            <>
                                <i className="bi bi-stars text-sm"></i>
                                Summarize with AI
                            </>
                        )}
                    </button>
                    {status === "error" && (
                        <p className="text-sm text-red-600">{message}</p>
                    )}
                    {status === "idle" && message && (
                        <p className="text-sm text-neutral-500">{message}</p>
                    )}
                </div>
            )}

            {status === "done" && summary && (
                <div className="bg-accent-soft border border-accent/30 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-accent-ink inline-flex items-center gap-1.5">
                            <i className="bi bi-stars"></i> AI Summary
                        </span>
                        <button
                            onClick={() => { setStatus("idle"); setSummary(null); }}
                            className="text-xs text-neutral-500 hover:text-primary transition-colors"
                        >
                            Hide
                        </button>
                    </div>
                    <p className="text-neutral-800 leading-relaxed text-[0.975rem]">{summary}</p>
                </div>
            )}
        </motion.div>
    );
};
