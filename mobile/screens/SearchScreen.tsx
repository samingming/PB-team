import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'

import { MovieSection } from '../components/MovieSection'
import type { ThemeColors } from '../theme'
import { styles } from '../styles'
import { Movie, SearchSort, WishlistItem } from '../types'

interface Props {
  colors: ThemeColors
  fontScale: (size: number) => number
  loading: boolean
  searchQuery: string
  setSearchQuery: (value: string) => void
  onSearch: () => void
  searchSort: SearchSort
  setSearchSort: (value: SearchSort) => void
  results: Movie[]
  wishlist: WishlistItem[]
  onToggleWishlist: (movie: Movie) => void
}

export function SearchScreen({
  colors,
  fontScale,
  loading,
  searchQuery,
  setSearchQuery,
  onSearch,
  searchSort,
  setSearchSort,
  results,
  wishlist,
  onToggleWishlist,
}: Props) {
  const fs = fontScale
  const hasResults = results.length > 0
  const sortOptions: Array<{ key: SearchSort; label: string }> = [
    { key: 'popular', label: '인기순' },
    { key: 'latest', label: '최신순' },
    { key: 'rating', label: '평점순' },
    { key: 'title', label: '제목순' },
  ]

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(18) }]}>검색</Text>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="검색어를 입력하세요"
          placeholderTextColor="#9ca3af"
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderColor: pressed ? colors.accent : colors.border,
              backgroundColor: pressed ? colors.accent : colors.card,
            },
          ]}
          onPress={onSearch}
        >
          {({ pressed }) => (
            <Text style={[styles.secondaryText, { color: pressed ? '#fff' : colors.text }]}>검색</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.searchHint}>
        <Text style={[styles.searchHintText, { color: colors.accent }]}>
          검색어를 입력하면 TMDB에서 결과를 불러옵니다.
        </Text>
      </View>
      <View style={styles.sortSection}>
        <Text style={[styles.sortLabel, { color: colors.text }]}>정렬</Text>
        <View style={styles.sortRow}>
          {sortOptions.map((option) => {
            const active = option.key === searchSort
            return (
              <Pressable
                key={option.key}
                style={({ pressed }) => [
                  styles.sortChip,
                  {
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active || pressed ? colors.accent : colors.card,
                  },
                ]}
                onPress={() => setSearchSort(option.key)}
              >
                {({ pressed }) => (
                  <Text
                    style={[
                      styles.sortChipText,
                      { color: active || pressed ? '#fff' : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                )}
              </Pressable>
            )
          })}
        </View>
      </View>
      {loading && <ActivityIndicator color="#e50914" style={{ marginVertical: 10 }} />}
      {hasResults && (
        <MovieSection
          title="검색 결과"
          data={results}
          colors={colors}
          fontScale={fs}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
        />
      )}
    </View>
  )
}
