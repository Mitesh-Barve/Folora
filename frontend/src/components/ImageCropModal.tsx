import { useEffect, useMemo, useState } from "react"
import Cropper from "react-easy-crop"
import { motion } from "motion/react"
import { getCroppedBlob, uploadImage, type PixelCrop } from "../utils/imageUpload"

type Props = {
    file: File | null
    /** when true, modal stays open until parent closes it via onCancel/onUploaded */
    onCancel: () => void
    /** receives the hosted URL once the crop has been uploaded */
    onUploaded: (url: string) => void
    /** lock to a square (used for avatars) */
    square?: boolean
    /** short title shown in the dialog header */
    title?: string
}

// The labels/cycle for the aspect-ratio toggle. `null` = free crop.
const RATIOS: { label: string; value: number | null }[] = [
    { label: "Free", value: null },
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "1:1", value: 1 },
]

// Medium-style crop dialog: pick / drag an image, frame it, then it uploads the
// cropped result and hands the hosted URL back to the caller.
export const ImageCropModal = ({ file, onCancel, onUploaded, square, title = "Crop image" }: Props) => {
    const [imgSrc, setImgSrc] = useState<string>("")
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [aspect, setAspect] = useState<number | null>(square ? 1 : null)
    const [cropPixels, setCropPixels] = useState<PixelCrop>({ x: 0, y: 0, width: 0, height: 0 })
    const [busy, setBusy] = useState(false)

    // Build an object URL for the chosen file and always revoke it on close.
    useEffect(() => {
        if (!file) {
            setImgSrc("")
            return
        }
        const url = URL.createObjectURL(file)
        setImgSrc(url)
        setZoom(1)
        setCrop({ x: 0, y: 0 })
        return () => URL.revokeObjectURL(url)
    }, [file])

    const effectiveAspect = useMemo(() => (square ? 1 : aspect), [square, aspect])

    if (!file || !imgSrc) return null

    const handleCropComplete = (_area: PixelCrop, pixels: PixelCrop) => {
        setCropPixels(pixels)
    }

    const handleConfirm = async () => {
        if (!cropPixels.width || !cropPixels.height) return
        setBusy(true)
        const blob = await getCroppedBlob(imgSrc, cropPixels)
        if (blob) {
            const url = await uploadImage(blob)
            if (url) onUploaded(url)
        }
        setBusy(false)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="surface-card w-full max-w-2xl overflow-hidden"
            >
                {/* header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-line">
                    <h3 className="font-serif text-lg text-ink">{title}</h3>
                    <button
                        className="text-neutral-400 hover:text-primary transition-colors"
                        onClick={onCancel}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                {/* cropper */}
                <div className="relative h-[320px] w-full bg-neutral-900 sm:h-[380px]">
                    <Cropper
                        image={imgSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={effectiveAspect ?? undefined}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                    />
                </div>

                {/* controls */}
                <div className="flex flex-col gap-4 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {!square &&
                            RATIOS.map((r) => (
                                <button
                                    key={r.label}
                                    onClick={() => setAspect(r.value)}
                                    className={`pill px-3 h-7 text-xs font-medium transition-colors ${
                                        aspect === r.value
                                            ? "bg-primary text-white"
                                            : "bg-accent-soft text-accent-ink hover:bg-neutral-200"
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        <div className="ml-auto flex items-center gap-2 text-xs text-neutral-500">
                            <i className="bi bi-zoom-in" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-28 accent-[#233A2E]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button className="btn-ghost px-4 h-9 text-sm font-medium" onClick={onCancel}>
                            Cancel
                        </button>
                        <button
                            className="btn-primary px-4 h-9 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
                            onClick={handleConfirm}
                            disabled={busy}
                        >
                            {busy ? (
                                <>
                                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" />
                                    Uploading…
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg" /> Insert
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
