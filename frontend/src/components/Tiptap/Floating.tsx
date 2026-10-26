import { EditorBtn } from "./EditorButton"
import { Editor } from "@tiptap/react"
import { FloatingMenu } from "@tiptap/react"
type Props = {
  editor: Editor
  onAddImage: () => void
}
export const Floating = ({ editor, onAddImage }: Props) => {
  return (
    <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} >
      <div className="tiptap-menu flex items-center gap-1 rounded-xl bg-primary shadow-card-hover px-2 py-1.5 ">

        <EditorBtn
          editorClick={() => { onAddImage() }}
          className={`${editor?.isActive('image') ? 'is-active' : ''}`}
          text='bi bi-card-image'
        />
        <EditorBtn editorClick={() => editor?.chain().focus().toggleBulletList().run()} className={`${editor?.isActive('bulletList') ? 'is-active' : ''}`} text='fas fa-thin fa-list' />

        <EditorBtn editorClick={() => {
          editor?.chain().focus().toggleOrderedList().run()
        }} className={`${editor?.isActive('orderedList') ? 'is-active' : ''} `} text='fa-solid fa-list-ol' />

        <EditorBtn editorClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={editor?.isActive('codeBlock') ? 'is-active' : ''} text='fa-solid fa-code' />

        <EditorBtn editorClick={() => {
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }} className={editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''} text='fa-solid fa-h' />

        <EditorBtn editorClick={() => {
          editor?.chain().focus().toggleHeading({ level: 3 }).run()
        }} className={editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''} text='bi bi-type-h2' />

        <EditorBtn editorClick={() => {
          editor?.chain().focus().setHorizontalRule().run()
        }} text='fa-solid fa-minus' />

      </div>
    </FloatingMenu>
  )
}
