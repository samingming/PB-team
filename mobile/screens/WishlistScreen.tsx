import { Text, View } from 'react-native'

import { MovieSection } from '../components/MovieSection'
import type { ThemeColors } from '../theme'
import { styles } from '../styles'
import { Movie, WishlistItem } from '../types'

interface Props {
  colors: ThemeColors
  fontScale: (size: number) => number
  wishlist: WishlistItem[]
  onToggleWishlist: (movie: Movie) => void
}

export function WishlistScreen({
  colors,
  fontScale,
  wishlist,
  onToggleWishlist,
}: Props) {
  const fs = fontScale

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(18) }]}>위시리스트</Text>
      {wishlist.length ? (
        <MovieSection
          title=""
          data={wishlist.map((w) => ({ id: w.id, title: w.title, overview: '', poster: w.poster }))}
          colors={colors}
          fontScale={fs}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
        />
      ) : (
        <Text style={{ color: colors.muted }}>위시리스트가 비어 있습니다.</Text>
      )}
    </View>
  )
}
