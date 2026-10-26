import { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react"
import { EditorBtn } from "./EditorButton"
type Props = {
    editor: Editor
    onAddImage: () => void
}
export const Bubble = ({ editor, onAddImage } : Props) => {
    return (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="tiptap-menu flex items-center gap-1 rounded-xl bg-primary shadow-card-hover px-2 py-1.5">
                <EditorBtn
                    editorClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'is-active' : ''}
                    text='fa-solid fa-bold'
                />
                <EditorBtn
                    editorClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'is-active' : ''}
                    text='fa-solid fa-italic'
                />
                <EditorBtn
                    editorClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'is-active' : ''}
                    text='fa-solid fa-strikethrough'
                />

                <EditorBtn
                    editorClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? 'is-active' : ''}
                    text='fa-solid fa-underline'
                />

                <EditorBtn
                    editorClick={() => { onAddImage() }}
                    text='bi bi-card-image'
                />
            </div>
        </BubbleMenu>
    )
}
