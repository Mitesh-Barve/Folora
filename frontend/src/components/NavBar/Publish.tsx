import axios, { AxiosError } from "axios"
import { useState, DragEvent } from "react"
import { useRecoilValue } from "recoil"
import { blogPostData } from "../../store/atoms/editor"
import { BLOGS_BACKEND_URL } from "../../config"
import { AnimatePresence, easeInOut, motion } from "motion/react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { ImageUploadButton } from "../ImageUploadButton"
import { ImageCropModal } from "../ImageCropModal"
import { imageFromDrop } from "../../utils/imageUpload"

export const Publish = () => {
    const [confirmPost, setConfirmPost] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tag, setTag] = useState<string>("");
    const [brief, setBrief] = useState<string>("")
    const [imageURL, setImageURL] = useState<string>("")
    const [cropFile, setCropFile] = useState<File | null>(null)
    const [isEmpty, setEmpty] = useState(false)
    const blogdata = useRecoilValue(blogPostData);
    const navigate = useNavigate();
    const publishBlog = async () => {
        try {
            if (blogdata.title.trim().length === 0) {
                setConfirmPost(false)
            } else {
                if (tags.length === 0 || brief.length === 0) {
                    setEmpty(true)
                    return
                }

                const data = {
                    title: blogdata.title,
                    brief: brief,
                    content: blogdata.content,
                    tag: tags,
                    imageURL: imageURL.trim() || undefined,
                }
                const res = await axios.post(`${BLOGS_BACKEND_URL}/createBlog`, data, { withCredentials: true })
                // rather make a refetch request on blog publish
                if (res.status === 200) {
                    navigate("/myblogs")
                }
            }
        } catch (e) {
            if (e instanceof AxiosError) {
                toast.error("Internal Server Error!")
            }
        }
    }

    // dropping a picture onto the preview box opens the crop dialog
    const handleCoverDrop = (e: DragEvent<HTMLDivElement>) => {
        const file = imageFromDrop(e)
        if (!file) return
        e.preventDefault()
        setCropFile(file)
    }

    return (
        <>
            <button className=" px-4 h-9 btn-primary text-sm outline-none" onClick={() => setConfirmPost(!confirmPost)}>Publish <i className="bi bi-send text-sm"></i></button>
            <ImageCropModal
                file={cropFile}
                title="Cover image"
                onCancel={() => setCropFile(null)}
                onUploaded={(url) => { setCropFile(null); setImageURL(url) }}
            />
            <div className={` ${confirmPost ? "transition transform duration-150 ease-in-out scale-100 " : " opacity-0 scale-0"} absolute w-screen h-screen bg-canvas/70 backdrop-blur-xl  right-0 top-0  `} >
                <div className="flex flex-col gap-3 justify-center items-center h-screen md:grid md:grid-cols-4 ">
                    <button className="absolute top-6 right-6 w-8 h-8 transition-transform hover:scale-110" onClick={() => setConfirmPost(!confirmPost)}> <img src="/dropclose.svg" alt="closesvg" /></button>
                    <div className="flex flex-col gap-3 md:col-span-2 md:mx-auto w-[260px]">
                        {/* Cover image: upload from device, or paste a URL */}
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Cover Image <span className="normal-case font-normal text-neutral-400">(optional)</span></label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 text-sm field"
                          placeholder="https://example.com/image.jpg"
                          value={imageURL}
                          onChange={(e) => setImageURL(e.target.value)}
                        />
                        <ImageUploadButton onUploaded={(url) => setImageURL(url)} label="Upload cover" />
                        {/* Live preview (also a drop target) */}
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleCoverDrop}
                          className="w-full h-[180px] bg-neutral-100 border border-dashed border-stone-300 rounded-2xl overflow-hidden flex items-center justify-center">
                          {imageURL.trim() ? (
                            <img
                              src={imageURL.trim()}
                              alt="cover preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                            />
                          ) : (
                            <span className="text-neutral-400 text-sm text-center px-4">Upload a picture, paste a URL, or drop an image here</span>
                          )}
                        </div>
                        {imageURL.trim() && (
                          <button className="text-xs text-neutral-400 hover:text-neutral-700 self-end transition-colors" onClick={() => setImageURL("")}>Remove</button>
                        )}
                    </div>
                    <div className="md:col-span-2 items-start">
                        <div className="relative flex flex-col items-start text-sm md:text-base text-neutral-700 min-w-[230px] md:max-w-[300px] ">

                            {/* short brief */}
                            <label htmlFor="aboutBox" className="peer">Brief <i className="bi bi-question-circle-fill hover:text-primary"></i></label>
                            <span className="absolute rounded-lg text-neutral-600 bg-neutral-100 px-2 text-start left-14 top-0 w-[11rem] text-xs opacity-0 lg:translate-x-40 peer-hover:opacity-100 peer-hover:translate-x-0 transition duration-300 ease-in-out ">
                                Add a brief for your content to let people have a context.
                            </span>
                            <textarea maxLength={70} className=" mt-[2px] resize-none scroll-m-0 w-full h-[80px] px-3 py-2 text-sm text-neutral-800 field" onChange={(e) => setBrief(e.target.value)} ></textarea>


                            {/* tags */}
                            <label htmlFor="tagInput" className="md:mt-7 min-w-[180px] max-w-[230px] mt-2 "> Add tag (tags) that relate to your content (max 3).</label>
                            <input type="text" id="tagInput" className=" mt-[2px] w-full px-3 py-1.5 text-sm text-neutral-800 field " value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" disabled={tags.length === 3} />
                            <button aria-label="Add Tag" className='absolute bottom-1 right-3  w-3 outline-none ' onClick={() => {
                                if (!tags.includes(tag) && tag.trim().length !== 0 && tags.length < 3) {
                                    setTags([...tags, tag])
                                    setTag("")
                                    setEmpty(false)
                                }
                            }}><i className="bi bi-send text-sm"></i></button>
                            {
                                isEmpty &&
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 100, x: 0 }}
                                        exit={{ opacity: 0, x: 100 }}
                                        transition={{
                                            duration: 0.5,
                                            ease: easeInOut
                                        }}
                                        className='text-sm font-serif text-red-500 absolute -bottom-6 '> Add atleast a single tag to your blog
                                    </motion.div>
                                </AnimatePresence>
                            }
                        </div>

                        <div className="flex gap-2 mt-3 w-full ">
                            {
                                tags.map((value) => {
                                    return (
                                        <div key={value} className="text-sm md:mb-2 min-w-5 pill px-2.5 py-1 text-center text-neutral-600">
                                            {value}
                                            <button className="w-4 h-3" onClick={() => {
                                                setTags(tags.filter(t => t !== value));
                                            }} >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div>
                            <button className="mt-3 px-4 h-9 btn-primary text-sm outline-none" onClick={publishBlog}>Publish Post </button>
                        </div>
                    </div>
                </div>
            </div >

        </>
    )
}


