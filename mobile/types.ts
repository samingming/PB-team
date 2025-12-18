export type Mode = 'login' | 'signup'
export type TabKey = 'home' | 'popular' | 'search' | 'wishlist'

export interface Movie {
  id: number
  title: string
  overview: string
  poster: string | undefined
  rating?: number
  releaseDate?: string
  runtime?: number
  country?: string
  genres?: string[]
}

export interface WishlistItem {
  id: number
  title: string
  poster: string | undefined
}
