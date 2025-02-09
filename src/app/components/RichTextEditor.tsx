'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { MdFormatBold, MdFormatItalic, MdFormatListBulleted, MdFormatListNumbered, MdFormatQuote } from 'react-icons/md'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  readOnly?: boolean
}

export function RichTextEditor({ content, onChange, readOnly = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="prose prose-invert max-w-none">
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 mb-2 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('bold') ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <MdFormatBold className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('italic') ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <MdFormatItalic className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('bulletList') ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <MdFormatListBulleted className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('orderedList') ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <MdFormatListNumbered className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('blockquote') ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <MdFormatQuote className="w-5 h-5" />
          </button>
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="min-h-[100px] p-4 rounded-lg bg-white/5 border border-white/10 [&_p]:whitespace-pre-wrap" 
      />
    </div>
  )
} 