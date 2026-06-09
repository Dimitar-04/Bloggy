import { useEffect, useState } from 'react'

type Post = {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  author_name: string
  tags: string[]
  status: string
  created_at?: string
  published_at?: string | null
}

const API_URL = 'http://localhost:8000/posts'

function App() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`)
        }

        const data = (await response.json()) as Post[]
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load posts')
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="border-b border-zinc-200 pb-5">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Blog
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
            Posts
          </h1>
        </header>

        {isLoading && (
          <p className="text-sm text-zinc-600">Loading posts from the backend.</p>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <p className="text-sm text-zinc-600">No posts found.</p>
        )}

        <section className="flex flex-col gap-4">
          {posts.map((post) => (
            <article
              key={post._id}
              className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span>{post.author_name}</span>
                <span>/</span>
                <span className="capitalize">{post.status}</span>
              </div>

              <h2 className="mt-3 text-xl font-semibold text-zinc-950">
                {post.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-700">
                {post.excerpt || post.content}
              </p>

              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

export default App
