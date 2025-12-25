<!-- src/views/HomeView.vue -->
<template>
  <main class="home-page page-shell">
    <HeroVideoBanner
      :playlist="heroState.entries"
      :current-index="heroState.currentIndex"
      :muted="heroState.muted"
      :loading="heroState.loading"
      :error="heroState.error"
      @next="nextHeroItem"
      @ended="nextHeroItem"
      @toggle-mute="toggleHeroMute"
      @set-index="setHeroIndex"
    />




    <section
      v-for="section in sections"
      :key="section.key"
      class="section-block"
    >
      <div class="section-header">
        <div>
          <p class="section-eyebrow">Curated · {{ section.key }}</p>
          <h2>{{ section.title }}</h2>
        </div>
      </div>

      <LoaderSpinner v-if="section.loading" />
      <p v-else-if="section.error" class="error-text">
        {{ section.error }}
      </p>

      <div v-else class="movie-row">
        <MovieCard
          v-for="movie in section.movies"
          :key="movie.id"
          :movie="movie"
          :is-wishlisted="isInWishlist(movie.id)"
          :is-recommended="false"
          @toggle-wishlist="toggleWishlist"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import LoaderSpinner from '@/components/common/LoaderSpinner.vue'
import HeroVideoBanner from '@/components/home/HeroVideoBanner.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
import {
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchDiscoverMovies,
  fetchMovieVideos,
  type TmdbMovie,
} from '@/services/tmdb'
import { useWishlist } from '@/composables/useWishlist'

interface HomeSectionState {
  key: string
  title: string
  loading: boolean
  error: string | null
  movies: TmdbMovie[]
}

interface HeroPlaylistEntry {
  movie: TmdbMovie
  videoKey: string
}

const { toggleWishlist, isInWishlist } = useWishlist()

const sections = reactive<HomeSectionState[]>([
  {
    key: 'popular',
    title: '지금 가장 뜨는 영화',
    loading: true,
    error: null,
    movies: [],
  },
  {
    key: 'nowPlaying',
    title: '극장에서 막 나온 작품',
    loading: true,
    error: null,
    movies: [],
  },
  {
    key: 'topRated',
    title: '팬들이 뽑은 명작 컬렉션',
    loading: true,
    error: null,
    movies: [],
  },
  {
    key: 'genreAction',
    title: '숨 쉴 틈 없는 액션',
    loading: true,
    error: null,
    movies: [],
  },
])

const HERO_PLAYLIST_LIMIT = 4
const PRIORITY_TITLES = ['zootopia', '주토피아']

const heroState = reactive({
  loading: true,
  error: null as string | null,
  entries: [] as HeroPlaylistEntry[],
  currentIndex: 0,
  muted: true,
})

async function loadHeroPlaylist() {
  heroState.loading = true
  heroState.error = null
  try {
    const popular = await fetchPopularMovies(1)
    const candidates = popular.results.slice(0, 8)
    const playlistResults = await Promise.all(
      candidates.map(async (movie) => {
        try {
          const videos = await fetchMovieVideos(movie.id)
          const trailer = videos.results.find(
            (v) =>
              v.site === 'YouTube' && ['Trailer', 'Teaser'].includes(v.type ?? ''),
          )
          return trailer
            ? ({
                movie,
                videoKey: trailer.key,
              } as HeroPlaylistEntry)
            : null
        } catch (err) {
          console.error('video fetch failed', err)
          return null
        }
      }),
    )
    const filtered = playlistResults.filter(
      (entry): entry is HeroPlaylistEntry => Boolean(entry),
    )
    const priorityIndex = filtered.findIndex((entry) => {
      const title = entry.movie.title?.toLowerCase() ?? ''
      return PRIORITY_TITLES.some((keyword) => title.includes(keyword.toLowerCase()))
    })
    if (priorityIndex > 0) {
      const [priorityItem] = filtered.splice(priorityIndex, 1)
      filtered.unshift(priorityItem)
    }
    heroState.entries = filtered.slice(0, HERO_PLAYLIST_LIMIT)
    heroState.currentIndex = 0
    if (!heroState.entries.length) {
      heroState.error = '예고편을 불러오지 못했어요.'
    }
  } catch (err) {
    console.error(err)
    heroState.error = '예고편을 불러오지 못했어요.'
  } finally {
    heroState.loading = false
  }
}

function nextHeroItem() {
  if (!heroState.entries.length) return
  heroState.currentIndex = (heroState.currentIndex + 1) % heroState.entries.length
}

function setHeroIndex(index: number) {
  if (index < 0 || index >= heroState.entries.length) return
  heroState.currentIndex = index
}

function toggleHeroMute() {
  heroState.muted = !heroState.muted
}

async function loadSection(
  key: HomeSectionState['key'],
  loader: () => Promise<TmdbMovie[]>,
) {
  const section = sections.find((s) => s.key === key)
  if (!section) return

  section.loading = true
  section.error = null
  try {
    const movies = await loader()
    section.movies = movies
  } catch (err) {
    console.error(err)
    section.error = '영화를 불러오지 못했습니다.'
  } finally {
    section.loading = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadHeroPlaylist(),
    loadSection('popular', async () => {
      const res = await fetchPopularMovies(1)
      return res.results
    }),
    loadSection('nowPlaying', async () => {
      const res = await fetchNowPlayingMovies(1)
      return res.results
    }),
    loadSection('topRated', async () => {
      const res = await fetchDiscoverMovies(
        '&sort_by=vote_average.desc&vote_count.gte=500',
        1,
      )
      return res.results
    }),
    loadSection('genreAction', async () => {
      const res = await fetchDiscoverMovies('&with_genres=28', 1)
      return res.results
    }),
  ])
})
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-sm);
}

.section-eyebrow {
  text-transform: uppercase;
  color: var(--color-muted);
  font-size: 0.75rem;
  margin: 0;
}

.section-header h2 {
  margin: 0.2rem 0 0;
}

.movie-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(160px, 1fr);
  gap: var(--space-sm);
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scroll-snap-type: x mandatory;
}

.movie-row > * {
  scroll-snap-align: start;
}

.movie-row::-webkit-scrollbar {
  height: 6px;
}

.movie-row::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
  border-radius: 999px;
}

.error-text {
  color: #f97373;
  font-size: 0.9rem;
}

@media (max-width: 700px) {
  .movie-row {
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    overflow-x: visible;
  }
}
</style>
