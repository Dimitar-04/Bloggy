import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Post, PostCreateInput } from '../types'
import { createSlug, parseListInput } from '../utils/posts'

const API_URL = 'http://localhost:8000/posts'

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
      const response = await fetch(API_URL, {
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
        className="flex flex-col gap-4 rounded-md border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Create
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-950">New post</h2>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Title
          <input
            required
            value={postForm.title}
            onChange={(event) => {
              updatePostForm('title', event.target.value)
              updatePostForm('slug', createSlug(event.target.value))
            }}
            className="h-10 rounded border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Slug
          <input
            required
            value={postForm.slug}
            onChange={(event) => updatePostForm('slug', event.target.value)}
            className="h-10 rounded border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Author
          <input
            required
            value={postForm.author_name}
            onChange={(event) =>
              updatePostForm('author_name', event.target.value)
            }
            className="h-10 rounded border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Excerpt
          <textarea
            value={postForm.excerpt ?? ''}
            onChange={(event) => updatePostForm('excerpt', event.target.value)}
            className="min-h-20 rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-950 outline-none transition focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Content
          <textarea
            required
            value={postForm.content}
            onChange={(event) => updatePostForm('content', event.target.value)}
            className="min-h-32 rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-950 outline-none transition focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Tags
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            className="h-10 rounded border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-zinc-500"
            placeholder="fastapi, docker"
          />
        </label>

        {formMessage && <p className="text-sm text-zinc-600">{formMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? 'Creating' : 'Create post'}
        </button>
      </form>
    </aside>
  )
}

export default CreatePostForm
