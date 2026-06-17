export type PostStatus = 'draft' | 'published'

export type PostComment = {
  _id?: string
  author_name: string
  content: string
  created_at?: string
}

export type CommentCreateInput = {
  author_name: string
  content: string
}

export type Post = {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  author_name: string
  tags: string[]
  comments?: Array<PostComment | string>
  status: PostStatus | string
  created_at?: string
  updated_at?: string
  published_at?: string | null
}

export type PostCreateInput = {
  title: string
  slug: string
  content: string
  excerpt?: string | null
  author_name: string
  tags: string[]
}

export type PostFilters = {
  search: string
}
