export const POSTS_API_URL =
  import.meta.env.VITE_API_URL ??
  (window.location.port === '5173' ? 'http://localhost:8000/posts' : '/api/posts')
