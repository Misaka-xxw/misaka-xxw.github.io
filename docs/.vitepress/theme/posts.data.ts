import { createContentLoader } from 'vitepress'

export interface PostData {
  title: string
  description: string
  date: string
  updated?: string
  category: string
  tags: string[]
  featured: boolean
  url: string
}

declare const data: PostData[]
export { data }

function normalizeDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const date = String(value || '')
  return date.includes('T') ? date.slice(0, 10) : date
}

export default createContentLoader('journal/*.md', {
  excerpt: true,
  transform(pages): PostData[] {
    return pages
      .filter(({ url, frontmatter }) => url !== '/journal/' && !frontmatter.draft)
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title,
        description: frontmatter.description || '',
        date: normalizeDate(frontmatter.date),
        updated: frontmatter.updated ? normalizeDate(frontmatter.updated) : undefined,
        category: frontmatter.category || '未分类',
        tags: frontmatter.tags || [],
        featured: Boolean(frontmatter.featured),
        url
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})
