import { useEffect, useState, DragEvent } from 'react'

import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import { all, createLowlight } from 'lowlight'


import css from "highlight.js/lib/languages/javascript"
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import { Floating } from './Floating'
import { Bubble } from './Bubble'
import { useSetRecoilState } from 'recoil'
import { blogPostData } from '../../store/atoms/editor'
import { AnimatePresence, easeInOut, motion } from 'motion/react'
import { addImageToEditor, imageFromDrop, pickImageFile, insertImageIntoEditor, isImageUploadConfigured } from '../../utils/imageUpload'
import { ImageCropModal } from '../ImageCropModal'


// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
type TiptapProps = {
  initialTitle?: string
  initialContent?: JSONContent
}
const Tiptap = ({ initialTitle, initialContent }: TiptapProps) => {
  const [title, setTitle] = useState<string>(initialTitle ?? "")
  const [cropFile, setCropFile] = useState<File | null>(null)
  const setBlogData = useSetRecoilState(blogPostData)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false
      }),
      Underline,
      Placeholder.configure({
        // Use a placeholder:
        placeholder: "Your content Goes here..."
      }),
      CodeBlockLowlight.configure({
        lowlight
      }),
      Image.configure({
        allowBase64: true,
      })
    ],
    content: initialContent ?? undefined,
  })

  // cleanup logic to destroy the editor when the component unmounts( Please Read the README.md for its significance)
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);
  // returning null untill the editor is loaded 
  if (!editor) {
    return null;
  }

  // converting editor data to json content and later back to html content 
  const jsonData: JSONContent = editor.getJSON()

  // dropping an image file straight onto the page opens the crop dialog
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    const file = imageFromDrop(e)
    if (!file) return
    e.preventDefault()
    setCropFile(file)
  }

  // every image control funnels through here: pick a file -> crop -> insert.
  // with no upload service configured we fall back to pasting a URL (uncroppable).
  const openImagePicker = async () => {
    if (!isImageUploadConfigured()) {
      await addImageToEditor(editor)
      return
    }
    const file = await pickImageFile()
    if (file) setCropFile(file)
  }

  // one thing to mention since the jsondata would be dynamic so unexpected behaviour may happen while setting it as a state /atom variable. So make sure when jsondata changes only then you have to change the state 
  useEffect(() => {
    setBlogData({ title: title, content: jsonData })
  }, [title, jsonData])
  
  return (
    <>
      <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} >
        <Floating editor={editor} onAddImage={openImagePicker} />
        <Bubble editor={editor} onAddImage={openImagePicker} />
        <div className='relative'>
          <input id='titleInput' maxLength={50} value={title} className='w-full max-w-[720px] max-h-[550px] pb-4 pt-4 mt-2 bg-transparent px-1 outline-none text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight leading-tight placeholder:text-neutral-300 placeholder:font-normal overflow-auto  ' placeholder='Your Title Goes Here..' onChange={(e) => setTitle(e.target.value)} />
          <AnimatePresence>
            {title.length === 50 &&
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 100, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{
                  duration: 0.5, ease: easeInOut
                }}
                className='text-sm font-medium text-red-500 absolute right-0 top-4x'> Title Length Exceeded ( 50 )
              </motion.div>}
          </AnimatePresence>
        </div>
        {/* always-visible image control: the floating menu only shows on an empty line */}
        <div className='flex items-center justify-between gap-3 pb-3 -mt-1'>
          <button
            type='button'
            onClick={() => openImagePicker()}
            className='btn-ghost px-3 h-8 text-xs font-medium inline-flex items-center gap-1.5'
          >
            <i className='bi bi-card-image text-xs'></i> Add image
          </button>
        </div>
        <EditorContent editor={editor} className='prose text-neutral-700 border-t border-line pt-4' />
      </div >
      <ImageCropModal
        file={cropFile}
        title="Insert image"
        onCancel={() => setCropFile(null)}
        onUploaded={(url) => { insertImageIntoEditor(editor, url); setCropFile(null) }}
      />
    </>
  )
}

export default Tiptap
