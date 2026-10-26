import { Editor } from "@tiptap/react"
import { toast } from "sonner"
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../config"

// Folder inside the Cloudinary media library that all Folora uploads land in.
const CLOUDINARY_FOLDER = "folora"
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB

// Uploads are only possible once both public values are present in frontend/.env.
// Until then every image control gracefully falls back to "paste an image URL".
export const isImageUploadConfigured = (): boolean =>
  Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET)

const validImageFile = (file: File | Blob): boolean => {
  if (!file.type.startsWith("image/")) {
    toast.error("That file isn't an image")
    return false
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    toast.error("Image is larger than 10 MB")
    return false
  }
  return true
}

// Posts a file to Cloudinary's unsigned endpoint and returns the hosted URL.
export const uploadImage = async (file: File | Blob): Promise<string | null> => {
  if (!isImageUploadConfigured()) {
    toast.error("Image upload isn't set up yet - paste an image URL instead")
    return null
  }
  if (!validImageFile(file)) return null

  const toastId = toast.loading("Uploading image…")
  try {
    const body = new FormData()
    // Blob crops have no name; give the multipart part one so Cloudinary stores it.
    body.append("file", file, file instanceof File ? file.name : "image.jpg")
    body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
    body.append("folder", CLOUDINARY_FOLDER)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body }
    )
    if (!res.ok) {
      const detail = await res.json().catch(() => null)
      throw new Error(detail?.error?.message ?? `Upload failed (${res.status})`)
    }
    const data = await res.json()
    toast.success("Image uploaded", { id: toastId })
    return data.secure_url as string
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Could not upload the image", {
      id: toastId,
    })
    return null
  }
}

// Opens the OS file picker and resolves with the chosen file (null on cancel).
export const pickImageFile = (): Promise<File | null> =>
  new Promise((resolve) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => resolve(input.files?.[0] ?? null)
    input.click()
  })

const promptForImageUrl = (): string | null => {
  const url = window.prompt("Enter image URL:", "https://")
  const trimmed = url?.trim()
  return trimmed && trimmed !== "https://" ? trimmed : null
}

// The one entry point every image control uses:
// upload from device when configured, otherwise ask for a URL.
export const chooseImageUrl = async (): Promise<string | null> => {
  if (!isImageUploadConfigured()) return promptForImageUrl()
  const file = await pickImageFile()
  return file ? uploadImage(file) : null
}

// Reads the first dropped image file, if the drop actually carries one.
export const imageFromDrop = (
  e: { dataTransfer?: DataTransfer | null }
): File | null => {
  const file = e.dataTransfer?.files?.[0]
  return file && file.type.startsWith("image/") ? file : null
}

export const insertImageIntoEditor = (editor: Editor, src: string, alt?: string) => {
  editor.chain().focus().setImage({ src, alt: alt ?? "blog image" }).run()
}

// Toolbar / drag-drop handler for the editor.
export const addImageToEditor = async (editor: Editor): Promise<void> => {
  const src = await chooseImageUrl()
  if (src) insertImageIntoEditor(editor, src)
}

// Used by drag-and-drop, where the file is already in hand.
export const addImageFileToEditor = async (
  editor: Editor,
  file: File
): Promise<void> => {
  const src = await uploadImage(file)
  if (src) insertImageIntoEditor(editor, src, file.name)
}

/* ----------------------------- cropping helpers ----------------------------- */

// The crop rectangle react-easy-crop reports, already expressed in the
// ORIGINAL image's pixel coordinates (the library handles zoom/pan mapping).
export type PixelCrop = { x: number; y: number; width: number; height: number }

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", reject)
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

// Draws the selected crop rectangle onto a canvas and returns a JPEG blob.
export const getCroppedBlob = async (
  imageSrc: string,
  crop: PixelCrop
): Promise<Blob | null> => {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(crop.width)
    canvas.height = Math.round(crop.height)
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(
      image,
      Math.round(crop.x),
      Math.round(crop.y),
      Math.round(crop.width),
      Math.round(crop.height),
      0,
      0,
      canvas.width,
      canvas.height
    )
    return await new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92)
    )
  } catch {
    toast.error("Could not process the image")
    return null
  }
}
