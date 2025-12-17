export type Mode = 'login' | 'signup'
export type TabKey = 'home' | 'popular' | 'search' | 'wishlist' | 'recommended'

export interface Movie {
  id: number
  title: string
  overview: string
  poster: string | undefined
}

export interface WishlistItem {
  id: number
  title: string
  poster: string | undefined
}
