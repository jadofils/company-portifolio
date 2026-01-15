// Simple in-memory cache with TTL support
interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private readonly defaultTTL = parseInt(process.env.CACHE_TTL || '300') * 1000 // 5 minutes default

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clear expired items
  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new MemoryCache()

// Auto cleanup every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000)

// Cache key generators
export const cacheKeys = {
  content: (section?: string, subsection?: string) => 
    `content:${section || 'all'}:${subsection || 'all'}`,
  images: (section: string) => `images:${section}`,
  settings: () => 'settings:all',
  publications: () => 'publications:all',
  contactMessages: () => 'contact:messages'
}