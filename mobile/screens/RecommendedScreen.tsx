import { Text, View } from 'react-native'

import { MovieSection } from '../components/MovieSection'
import type { ThemeColors } from '../theme'
import { styles } from '../styles'
import { Movie, WishlistItem } from '../types'

interface Props {
  colors: ThemeColors
  fontScale: (size: number) => number
  recommendedList: WishlistItem[]
  recommendMovies: Movie[]
  wishlist: WishlistItem[]
  onToggleWishlist: (movie: Movie) => void
  onToggleRecommended: (movie: Movie) => void
}

export function RecommendedScreen({
  colors,
  fontScale,
  recommendedList,
  recommendMovies,
  wishlist,
  onToggleWishlist,
  onToggleRecommended,
}: Props) {
  const fs = fontScale

  return (
    <>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(18) }]}>내 추천</Text>
        {recommendedList.length ? (
          <MovieSection
            title=""
            data={recommendedList.map((w) => ({ id: w.id, title: w.title, overview: '', poster: w.poster }))}
            colors={colors}
            fontScale={fs}
            wishlist={wishlist}
            recommended={recommendedList}
            onToggleWishlist={onToggleWishlist}
            onToggleRecommended={onToggleRecommended}
          />
        ) : (
          <Text style={{ color: colors.muted }}>추천 목록이 비어 있습니다.</Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(18) }]}>추천 컬렉션</Text>
        <MovieSection
          title=""
          data={recommendMovies}
          colors={colors}
          fontScale={fs}
          wishlist={wishlist}
          recommended={recommendedList}
          onToggleWishlist={onToggleWishlist}
          onToggleRecommended={onToggleRecommended}
        />
      </View>
    </>
  )
}
