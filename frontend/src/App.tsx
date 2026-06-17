import { useEffect, useState } from 'react'
import CreatePostForm from './components/CreatePostForm'
import Home from './components/Home'
import Navbar from './components/Navbar'
import type { Post } from './types'

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
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Home
          posts={posts}
          isLoading={isLoading}
          error={error}
          onCommentCreated={(postId, comment) =>
            setPosts((currentPosts) =>
              currentPosts.map((post) =>
                post._id === postId
                  ? { ...post, comments: [...(post.comments ?? []), comment] }
                  : post,
              ),
            )
          }
          onCommentDeleted={(postId, commentId) =>
            setPosts((currentPosts) =>
              currentPosts.map((post) =>
                post._id === postId
                  ? {
                      ...post,
                      comments: post.comments?.filter(
                        (comment) =>
                          typeof comment === 'string' ||
                          comment._id !== commentId,
                      ),
                    }
                  : post,
              ),
            )
          }
        />
        <CreatePostForm
          onPostCreated={(post) =>
            setPosts((currentPosts) => [post, ...currentPosts])
          }
        />
      </div>
    </main>
  )
}

export default App
