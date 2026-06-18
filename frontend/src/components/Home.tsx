import { useMemo, useState } from 'react';
import type {
  CommentCreateInput,
  Post,
  PostComment,
  PostFilters,
} from '../types';

const API_URL = 'http://localhost:8000/posts';

type HomeProps = {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  onCommentCreated: (postId: string, comment: PostComment) => void;
  onCommentDeleted: (postId: string, commentId: string) => void;
};

function Home({
  posts,
  isLoading,
  error,
  onCommentCreated,
  onCommentDeleted,
}: HomeProps) {
  const [filters, setFilters] = useState<PostFilters>({
    search: '',
  });
  const [commentForms, setCommentForms] = useState<
    Record<string, CommentCreateInput>
  >({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(
    null,
  );
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>(
    {},
  );

  const filteredPosts = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return posts.filter((post) => {
      return (
        search.length === 0 ||
        post.title.toLowerCase().includes(search) ||
        post.content.toLowerCase().includes(search) ||
        (post.excerpt ?? '').toLowerCase().includes(search) ||
        post.author_name.toLowerCase().includes(search)
      );
    });
  }, [filters.search, posts]);

  function normalizeComment(comment: PostComment | string): PostComment {
    if (typeof comment === 'string') {
      return {
        author_name: 'Unknown author',
        content: comment,
      };
    }

    return comment;
  }

  function updateCommentForm(
    postId: string,
    field: keyof CommentCreateInput,
    value: string,
  ) {
    setCommentForms((currentForms) => ({
      ...currentForms,
      [postId]: {
        author_name: currentForms[postId]?.author_name ?? '',
        content: currentForms[postId]?.content ?? '',
        [field]: value,
      },
    }));
  }

  async function handleCreateComment(postId: string) {
    const form = commentForms[postId] ?? { author_name: '', content: '' };
    const payload: CommentCreateInput = {
      author_name: form.author_name.trim(),
      content: form.content.trim(),
    };

    if (!payload.author_name || !payload.content) {
      setCommentErrors((currentErrors) => ({
        ...currentErrors,
        [postId]: 'Author and comment are required.',
      }));
      return;
    }

    setSubmittingCommentId(postId);
    setCommentErrors((currentErrors) => ({
      ...currentErrors,
      [postId]: '',
    }));

    try {
      const response = await fetch(`${API_URL}/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const createdComment = (await response.json()) as PostComment;
      onCommentCreated(postId, createdComment);
      setCommentForms((currentForms) => ({
        ...currentForms,
        [postId]: {
          author_name: '',
          content: '',
        },
      }));
    } catch (err) {
      setCommentErrors((currentErrors) => ({
        ...currentErrors,
        [postId]:
          err instanceof Error ? err.message : 'Could not create comment.',
      }));
    } finally {
      setSubmittingCommentId(null);
    }
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    setDeletingCommentId(commentId);
    setCommentErrors((currentErrors) => ({
      ...currentErrors,
      [postId]: '',
    }));

    try {
      const response = await fetch(
        `${API_URL}/${postId}/comments/${commentId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      onCommentDeleted(postId, commentId);
    } catch (err) {
      setCommentErrors((currentErrors) => ({
        ...currentErrors,
        [postId]:
          err instanceof Error ? err.message : 'Could not delete comment.',
      }));
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <section id="posts" className="flex min-w-0 flex-col gap-6">
      <header className="border-b border-blue-100 pb-5">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
          Blogs
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-blue-950">
          Posts
        </h1>
      </header>

      <label className="flex flex-col gap-1 rounded-md border border-blue-100 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm shadow-blue-950/5">
        Search
        <input
          value={filters.search}
          onChange={(event) => setFilters({ search: event.target.value })}
          className="h-10 rounded border border-slate-300 bg-slate-50 px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
          placeholder="Search text"
        />
      </label>

      {isLoading && (
        <p className="text-sm text-slate-600">
          Loading posts from the backend.
        </p>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <p className="text-sm text-zinc-600">No posts found.</p>
      )}

      {!isLoading &&
        !error &&
        posts.length > 0 &&
        filteredPosts.length === 0 && (
          <p className="text-sm text-zinc-600">No posts match this search.</p>
        )}

      <div className="flex flex-col gap-4">
        {filteredPosts.map((post) => (
          <article
            key={post._id}
            className="rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{post.author_name}</span>
              <span>/</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 font-medium capitalize text-blue-800">
                {post.status}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-semibold text-blue-950">
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
                    className="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {(post.comments?.length ?? 0) > 0 && (
              <div className="mt-5 border-t border-blue-100 pt-4">
                <h3 className="text-sm font-medium text-blue-950">Comments</h3>
                <div className="mt-3 flex flex-col gap-2">
                  {post.comments?.map((comment, index) => {
                    const normalizedComment = normalizeComment(comment);

                    return (
                      <div
                        key={`${post._id}-comment-${index}`}
                        className="rounded border border-blue-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium text-blue-900">
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
                            <p className="mt-1 text-sm text-slate-700">
                              {normalizedComment.content}
                            </p>
                          </div>

                          {normalizedComment._id && (
                            <button
                              type="button"
                              disabled={
                                deletingCommentId === normalizedComment._id
                              }
                              onClick={() =>
                                handleDeleteComment(
                                  post._id,
                                  normalizedComment._id as string,
                                )
                              }
                              className="rounded border border-blue-100 px-2 py-1 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:text-slate-400"
                            >
                              {deletingCommentId === normalizedComment._id
                                ? 'Deleting'
                                : 'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <form
              className="mt-5 grid gap-3 border-t border-blue-100 pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateComment(post._id);
              }}
            >
              <h3 className="text-sm font-medium text-blue-950">Add comment</h3>
              <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                <input
                  value={commentForms[post._id]?.author_name ?? ''}
                  onChange={(event) =>
                    updateCommentForm(
                      post._id,
                      'author_name',
                      event.target.value,
                    )
                  }
                  className="h-10 rounded border border-slate-300 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
                  placeholder="Author"
                />
                <input
                  value={commentForms[post._id]?.content ?? ''}
                  onChange={(event) =>
                    updateCommentForm(post._id, 'content', event.target.value)
                  }
                  className="h-10 rounded border border-slate-300 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:bg-white"
                  placeholder="Comment"
                />
              </div>
              {commentErrors[post._id] && (
                <p className="text-sm text-red-700">
                  {commentErrors[post._id]}
                </p>
              )}
              <button
                type="submit"
                disabled={submittingCommentId === post._id}
                className="h-10 w-fit rounded bg-blue-950 px-4 text-sm font-medium text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submittingCommentId === post._id ? 'Adding' : 'Add comment'}
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Home;
