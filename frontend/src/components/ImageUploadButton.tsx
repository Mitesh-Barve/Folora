import { ChangeEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { isImageUploadConfigured } from "../utils/imageUpload"
import { ImageCropModal } from "./ImageCropModal"

type Props = {
    label?: string
    className?: string
    onUploaded: (url: string) => void
    /** lock the crop to a square (avatars) */
    square?: boolean
    /** header text for the crop dialog */
    title?: string
}

// A small "Upload" control that sits next to any image-URL field. Picking a file
// opens the crop dialog; the cropped result is uploaded and the hosted URL is
// handed back to the parent's own state, so the existing URL inputs / preview
// boxes keep working untouched.
export const ImageUploadButton = ({ label = "Upload", className, onUploaded, square, title = "Crop image" }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [cropFile, setCropFile] = useState<File | null>(null)

    const handleClick = () => {
        if (!isImageUploadConfigured()) {
            toast.error("Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to frontend/.env to enable uploads")
            return
        }
        inputRef.current?.click()
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        // reset first so picking the same file again still fires change
        e.target.value = ""
        if (file) setCropFile(file)
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={handleClick}
                className={`btn-ghost px-3 h-8 text-xs font-medium inline-flex items-center gap-1.5 ${className ?? ""}`}
            >
                <i className="bi bi-upload text-xs" />
                {label}
            </button>
            <ImageCropModal
                file={cropFile}
                square={square}
                title={title}
                onCancel={() => setCropFile(null)}
                onUploaded={(url) => { setCropFile(null); onUploaded(url) }}
            />
        </>
    )
}
