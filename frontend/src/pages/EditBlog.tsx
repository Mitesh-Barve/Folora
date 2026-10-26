import { useEffect, useState, DragEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilCallback } from "recoil";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { JSONContent } from "@tiptap/react";
import { BLOGS_BACKEND_URL } from "../config";
import { blogPostData } from "../store/atoms/editor";
import { userId } from "../store/atoms/userInfoAtom";
import { NavLinks } from "../components/NavBar/NavLinks";
import { Wobble } from "../components/Loader/Wobble";
import Tiptap from "../components/Tiptap/Tiptap";
import { ImageUploadButton } from "../components/ImageUploadButton";
import { ImageCropModal } from "../components/ImageCropModal";
import { imageFromDrop } from "../utils/imageUpload";

type FetchedBlog = {
  id: string;
  title: string;
  brief: string;
  content: JSONContent;
  imageURL: string | null;
  postTag: string[];
};

export const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const myUserId = useRecoilValue(userId);

  // The editor state must NOT be subscribed to here. Tiptap (rendered by this page)
  // writes blogPostData in an effect on every render, so subscribing would re-render
  // this page -> re-render Tiptap -> write atom again -> infinite loop / blank screen.
  // Read a snapshot only at save time instead.
  const getEditorData = useRecoilCallback(
    ({ snapshot }) =>
      () => snapshot.getLoadable(blogPostData).getValue() as { title: string; content: JSONContent },
    []
  );

  const [blog, setBlog] = useState<FetchedBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAuthor, setNotAuthor] = useState(false);

  // save form state
  const [saving, setSaving] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);

  // fetch on mount
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${BLOGS_BACKEND_URL}/id/${id}`, { withCredentials: true })
      .then((res) => {
        const b = res.data?.blog;
        if (!b) { setLoading(false); return; }
        // verify ownership
        if (b.author?.id !== myUserId) {
          setNotAuthor(true);
          setLoading(false);
          return;
        }
        const fetched: FetchedBlog = {
          id: b.id,
          title: b.title,
          brief: b.brief ?? "",
          content: b.content,
          imageURL: b.imageURL ?? null,
          postTag: b.postTag ?? [],
        };
        setBlog(fetched);
        setBrief(fetched.brief);
        setImageURL(fetched.imageURL ?? "");
        setTags(fetched.postTag);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load blog.");
        setLoading(false);
      });
  }, [id, myUserId]);

  const handleSave = async () => {
    if (!blog) return;
    if (tags.length === 0 || brief.trim().length === 0) {
      setIsEmpty(true);
      return;
    }
    setIsEmpty(false);
    setSaving(true);
    const editorData = getEditorData();
    try {
      await axios.put(
        `${BLOGS_BACKEND_URL}/updateBlog`,
        {
          blogId: blog.id,
          title: editorData?.title?.trim() ? editorData.title : blog.title,
          content: editorData?.content ?? blog.content,
          brief,
          imageURL: imageURL.trim() || null,
        },
        { withCredentials: true }
      );
      toast.success("Blog updated!");
      setSaveOpen(false);
      navigate("/myblogs");
    } catch (e) {
      if (e instanceof AxiosError) {
        toast.error(e.response?.data?.msg ?? "Update failed. Try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // dropping a picture onto the preview box opens the crop dialog
  const handleCoverDrop = (e: DragEvent<HTMLDivElement>) => {
    const file = imageFromDrop(e);
    if (!file) return;
    e.preventDefault();
    setCropFile(file);
  };

  if (loading) return <Wobble />;

  if (notAuthor || !blog) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="surface-card p-8 text-center max-w-sm">
          <p className="text-lg font-semibold text-neutral-800">Cannot edit this blog.</p>
          <p className="text-neutral-500 mt-1 text-sm">It either doesn't exist or isn't yours.</p>
          <button onClick={() => navigate("/myblogs")} className="btn-primary px-5 h-10 mt-5 font-medium text-sm">
            My Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-screen min-h-screen bg-canvas">
      <NavLinks />
      <ImageCropModal
        file={cropFile}
        title="Cover image"
        onCancel={() => setCropFile(null)}
        onUploaded={(url) => { setCropFile(null); setImageURL(url) }}
      />

      {/* Editor */}
      <div className="surface-card w-full max-w-[780px] mx-4 my-8 px-4 md:px-8 py-2">
        <Tiptap
          key={blog.id}
          initialTitle={blog.title}
          initialContent={blog.content}
        />
      </div>

      {/* Save bar */}
      <div className="w-full max-w-[780px] mx-4 mb-10 flex justify-end">
        <button
          className="btn-primary px-5 h-10 text-sm font-medium"
          onClick={() => setSaveOpen(true)}
        >
          Save Changes
        </button>
      </div>

      {/* Save modal */}
      <AnimatePresence>
        {saveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/70 backdrop-blur-xl p-4"
          >
            <div className="surface-card w-full max-w-[520px] p-6 relative flex flex-col gap-5">
              <button
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-800 transition-colors"
                onClick={() => setSaveOpen(false)}
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold font-serif text-neutral-900">Update Blog</h2>

              {/* Brief */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Brief</label>
                <textarea
                  maxLength={70}
                  className="resize-none w-full h-[70px] px-3 py-2 text-sm field"
                  value={brief}
                  onChange={(e) => { setBrief(e.target.value); setIsEmpty(false); }}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Tags <span className="normal-case font-normal text-neutral-400">(max 3)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1.5 text-sm field"
                    placeholder="Tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    disabled={tags.length === 3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (tag.trim() && !tags.includes(tag.trim()) && tags.length < 3) {
                          setTags([...tags, tag.trim()]);
                          setTag("");
                          setIsEmpty(false);
                        }
                      }
                    }}
                  />
                  <button
                    className="btn-ghost px-3 h-8 text-sm font-medium"
                    onClick={() => {
                      if (tag.trim() && !tags.includes(tag.trim()) && tags.length < 3) {
                        setTags([...tags, tag.trim()]);
                        setTag("");
                        setIsEmpty(false);
                      }
                    }}
                    disabled={tags.length === 3}
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t} className="pill px-2.5 py-1 text-sm text-neutral-600 inline-flex items-center gap-1.5">
                        {t}
                        <button onClick={() => setTags(tags.filter((x) => x !== t))} className="text-neutral-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Cover Image <span className="normal-case font-normal text-neutral-400">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="flex-1 px-3 py-1.5 text-sm field"
                    placeholder="https://example.com/image.jpg"
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
                  />
                  {imageURL && (
                    <button className="btn-ghost px-3 h-8 text-xs text-neutral-500" onClick={() => setImageURL("")}>Clear</button>
                  )}
                </div>
                <ImageUploadButton onUploaded={(url) => setImageURL(url)} label="Upload cover" />
                {imageURL.trim() && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleCoverDrop}
                    className="mt-1 w-full h-28 rounded-xl overflow-hidden border border-stone-200"
                  >
                    <img src={imageURL.trim()} alt="preview" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                  </div>
                )}
              </div>

              {isEmpty && (
                <p className="text-sm text-red-500">Brief and at least one tag are required.</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button className="btn-ghost px-4 h-9 text-sm font-medium" onClick={() => setSaveOpen(false)}>
                  Cancel
                </button>
                <button
                  className="btn-primary px-5 h-9 text-sm font-medium flex items-center gap-2 disabled:opacity-60"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving && <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" />}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
