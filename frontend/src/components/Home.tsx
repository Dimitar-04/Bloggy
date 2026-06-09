import { useMemo, useState } from 'react'
import type { Post, PostComment, PostFilters } from '../types'

type HomeProps = {
  posts: Post[]
  isLoading: boolean
  error: string | null
}

function Home({ posts, isLoading, error }: HomeProps) {
  const [filters, setFilters] = useState<PostFilters>({
    search: '',
  })

  const filteredPosts = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return posts.filter((post) => {
      return (
        search.length === 0 ||
        post.title.toLowerCase().includes(search) ||
        post.content.toLowerCase().includes(search) ||
        (post.excerpt ?? '').toLowerCase().includes(search) ||
        post.author_name.toLowerCase().includes(search)
      )
    })
  }, [filters.search, posts])

  function normalizeComment(comment: PostComment | string): PostComment {
    if (typeof comment === 'string') {
      return {
        author_name: 'Unknown author',
        content: comment,
      }
    }

    return comment
  }

  return (
    <section id="posts" className="flex min-w-0 flex-col gap-6">
      <header className="border-b border-zinc-200 pb-5">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Blog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
          Posts
        </h1>
      </header>

      <label className="flex flex-col gap-1 rounded-md border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-700 shadow-sm">
        Search
        <input
          value={filters.search}
          onChange={(event) => setFilters({ search: event.target.value })}
          className="h-10 rounded border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-zinc-500"
          placeholder="Search text"
        />
      </label>

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

      {!isLoading && !error && posts.length > 0 && filteredPosts.length === 0 && (
        <p className="text-sm text-zinc-600">No posts match this search.</p>
      )}

      <div className="flex flex-col gap-4">
        {filteredPosts.map((post) => (
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

            {post.excerpt && (
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {post.excerpt}
              </p>
            )}

            <p className="mt-3 text-sm leading-6 text-zinc-800">
              {post.content.length > 260
                ? `${post.content.slice(0, 260).trim()}...`
                : post.content}
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

            {(post.comments?.length ?? 0) > 0 && (
              <div className="mt-5 border-t border-zinc-100 pt-4">
                <h3 className="text-sm font-medium text-zinc-800">Comments</h3>
                <div className="mt-3 flex flex-col gap-2">
                  {post.comments?.map((comment, index) => {
                    const normalizedComment = normalizeComment(comment)

                    return (
                      <div
                        key={`${post._id}-comment-${index}`}
                        className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-700">
                            {normalizedComment.author_name}
                          </span>
                          {normalizedComment.created_at && (
                            <span>
                              {new Date(
                                normalizedComment.created_at,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-zinc-700">
                          {normalizedComment.content}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default Home
