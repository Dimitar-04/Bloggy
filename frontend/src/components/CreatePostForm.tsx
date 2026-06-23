import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Post, PostCreateInput } from '../types'
import { POSTS_API_URL } from '../config/api'
import { createSlug, parseListInput } from '../utils/posts'

const initialPostForm: PostCreateInput = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  author_name: '',
  tags: [],
}

type CreatePostFormProps = {
  onPostCreated: (post: Post) => void
}

function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [postForm, setPostForm] = useState<PostCreateInput>(initialPostForm)
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setFormMessage(null)

    const payload: PostCreateInput = {
      ...postForm,
      title: postForm.title.trim(),
      slug: postForm.slug.trim() || createSlug(postForm.title),
      content: postForm.content.trim(),
      excerpt: postForm.excerpt?.trim() || null,
      author_name: postForm.author_name.trim(),
      tags: parseListInput(tagInput),
    }

    try {
      const response = await fetch(POSTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`)
      }

      const createdPost = (await response.json()) as Post
      onPostCreated(createdPost)
      setPostForm(initialPostForm)
      setTagInput('')
      setFormMessage('Post created')
    } catch (err) {
      setFormMessage(err instanceof Error ? err.message : 'Could not create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  function updatePostForm<Field extends keyof PostCreateInput>(
    field: Field,
    value: PostCreateInput[Field],
  ) {
    setPostForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  return (
    <aside id="create" className="lg:sticky lg:top-6 lg:self-start">
      <form
        onSubmit={handleCreatePost}
        className="flex flex-col gap-4 overflow-hidden rounded-md border border-blue-100 bg-white shadow-lg shadow-blue-950/10"
      >
        <div className="bg-blue-950 px-5 py-4 text-white">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-200">
            Create
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">New post</h2>
        </div>

        <div className="flex flex-col gap-4 px-5 pb-5">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Title
          <input
            required
            value={postForm.title}
            onChange={(event) => {
              updatePostForm('title', event.target.value)
              updatePostForm('slug', createSlug(event.target.value))
            }}
            className="h-10 rounded border border-slate-300 bg-slate-50 px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Slug
          <input
            required
            value={postForm.slug}
            onChange={(event) => updatePostForm('slug', event.target.value)}
            className="h-10 rounded border border-slate-300 bg-slate-50 px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Author
          <input
            required
            value={postForm.author_name}
            onChange={(event) =>
              updatePostForm('author_name', event.target.value)
            }
            className="h-10 rounded border border-slate-300 bg-slate-50 px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Excerpt
          <textarea
            value={postForm.excerpt ?? ''}
            onChange={(event) => updatePostForm('excerpt', event.target.value)}
            className="min-h-20 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Content
          <textarea
            required
            value={postForm.content}
            onChange={(event) => updatePostForm('content', event.target.value)}
            className="min-h-32 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Tags
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            className="h-10 rounded border border-slate-300 bg-slate-50 px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
            placeholder="fastapi, docker"
          />
        </label>

        {formMessage && <p className="text-sm text-blue-800">{formMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded bg-blue-950 px-4 text-sm font-medium text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? 'Creating' : 'Create post'}
        </button>
        </div>
      </form>
    </aside>
  )
}

export default CreatePostForm
