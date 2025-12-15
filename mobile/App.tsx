import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebaseConfig'
import {
  fetchNowPlaying,
  fetchPopular,
  fetchTopRated,
  searchMovies,
  posterUrl,
  type TmdbMovie,
} from './services/tmdb'

type Mode = 'login' | 'signup'

interface Movie {
  id: number
  title: string
  overview: string
  poster: string | undefined
}

interface WishlistItem {
  id: number
  title: string
  poster: string | undefined
}

export default function App() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [busy, setBusy] = useState(false)

  const [popular, setPopular] = useState<Movie[]>([])
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([])
  const [recommend, setRecommend] = useState<Movie[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [fontScale, setFontScale] = useState(1)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  const notesRef = useMemo(() => collection(db, 'mobile-notes'), [])
  const scrollRef = useRef<ScrollView>(null)
  const sectionY = useRef<Record<string, number>>({})

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next)
      if (next) {
        loadMovies()
        fetchWishlist(next.uid)
      } else {
        setWishlist([])
      }
    })
    return unsub
  }, [])

  function mapMovies(items: TmdbMovie[]): Movie[] {
    return items.map((m) => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster: posterUrl(m.poster_path),
    }))
  }

  async function loadMovies() {
    setLoadingMovies(true)
    try {
      const [pop, now, top] = await Promise.all([fetchPopular(), fetchNowPlaying(), fetchTopRated()])
      setPopular(mapMovies(pop.slice(0, 10)))
      setNowPlaying(mapMovies(now.slice(0, 10)))
      setRecommend(mapMovies(top.slice(0, 10)))
    } catch (err) {
      console.error(err)
      Alert.alert('TMDB 오류', '영화 정보를 불러오지 못했습니다.')
    } finally {
      setLoadingMovies(false)
    }
  }

  async function fetchWishlist(uid: string) {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'wishlists', uid, 'items'), orderBy('title', 'asc')),
      )
      const items: WishlistItem[] = snapshot.docs.map((d) => {
        const data = d.data() as { id: number; title: string; poster?: string }
        return { id: data.id, title: data.title, poster: data.poster }
      })
      setWishlist(items)
    } catch (err) {
      console.error('wishlist load error', err)
    }
  }

  async function handleAuth() {
    if (!email.trim() || !password) {
      Alert.alert('입력 필요', '이메일과 비밀번호를 입력하세요.')
      return
    }
    if (mode === 'signup' && password !== passwordConfirm) {
      Alert.alert('비밀번호 확인', '비밀번호가 일치하지 않습니다.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
        Alert.alert('회원가입 완료', '로그인되었습니다.')
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '로그인/회원가입 중 오류가 발생했습니다.'
      Alert.alert('오류', message)
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setBusy(true)
    try {
      await signOut(auth)
    } finally {
      setBusy(false)
    }
  }

  async function toggleWishlistItem(movie: Movie) {
    if (!user) {
      Alert.alert('로그인 필요', '먼저 로그인하세요.')
      return
    }
    const exists = wishlist.find((w) => w.id === movie.id)
    const docRef = collection(db, 'wishlists', user.uid, 'items')
    if (exists) {
      const snapshot = await getDocs(query(docRef, orderBy('id', 'asc')))
      const target = snapshot.docs.find((d) => (d.data() as { id: number }).id === movie.id)
      if (target) await target.ref.delete()
      setWishlist((prev) => prev.filter((w) => w.id !== movie.id))
    } else {
      await addDoc(docRef, { id: movie.id, title: movie.title, poster: movie.poster })
      setWishlist((prev) => [...prev, { id: movie.id, title: movie.title, poster: movie.poster }])
    }
  }

  async function handleAddNote() {
    if (!user) return
    const text = `Hello from ${user.email ?? 'user'} @ ${new Date().toLocaleTimeString()}`
    try {
      await addDoc(notesRef, { text, createdAt: serverTimestamp(), uid: user.uid })
      const snapshot = await getDocs(query(notesRef, orderBy('createdAt', 'desc')))
      setNotes(snapshot.docs.map((d) => (d.data().text as string) ?? ''))
    } catch (err) {
      const message = err instanceof Error ? err.message : '저장에 실패했습니다.'
      Alert.alert('오류', message)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    try {
      setLoadingMovies(true)
      const results = await searchMovies(searchQuery.trim())
      setSearchResults(mapMovies(results.slice(0, 12)))
      const y = sectionY.current['search']
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({ y, animated: !reduceMotion })
      }
    } catch (err) {
      console.error(err)
      Alert.alert('검색 오류', '검색 결과를 불러오지 못했습니다.')
    } finally {
      setLoadingMovies(false)
    }
  }

  const c = theme === 'dark' ? palette.dark : palette.light
  const fs = (size: number) => size * fontScale
  const scrollToSection = (key: string) => {
    const y = sectionY.current[key]
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y, animated: !reduceMotion })
      setNavOpen(false)
    }
  }

  const Section = ({
    title,
    data,
    onLayout,
  }: {
    title: string
    data: Movie[]
    onLayout?: (y: number) => void
  }) => (
    <View
      style={styles.section}
      onLayout={(e) => {
        onLayout?.(e.nativeEvent.layout.y)
      }}
    >
      <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(16) }]}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const picked = wishlist.some((w) => w.id === item.id)
          return (
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <Image
                source={
                  item.poster
                    ? { uri: item.poster }
                    : { uri: 'https://dummyimage.com/500x750/111827/ffffff&text=No+Image' }
                }
                style={styles.poster}
                resizeMode="cover"
              />
              <Text style={[styles.cardTitle, { color: c.text, fontSize: fs(14) }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.cardTag, { color: c.muted, fontSize: fs(12) }]} numberOfLines={2}>
                {item.overview || '줄거리가 없습니다.'}
              </Text>
              <TouchableOpacity
                style={[styles.wishButton, picked && styles.wishButtonActive, { borderColor: c.border }]}
                onPress={() => toggleWishlistItem(item)}
              >
                <Text style={[styles.wishButtonText, { color: c.text, fontSize: fs(12) }]}>
                  {picked ? '♥ 찜됨' : '♡ 찜하기'}
                </Text>
              </TouchableOpacity>
            </View>
          )
        }}
      />
    </View>
  )

  if (!user) {
    return (
      <SafeAreaView style={[styles.authContainer, { backgroundColor: c.bg }]}>
        <StatusBar style="light" />
        <Text style={[styles.logo, { color: c.accent }]}>PB neteflix</Text>
        <View style={[styles.authCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.authTabs}>
            <TouchableOpacity
              style={[
                styles.authTab,
                { borderColor: c.border },
                mode === 'login' && { backgroundColor: c.accent, borderColor: c.accent },
              ]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.authTabText, { fontSize: fs(14) }]}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.authTab,
                { borderColor: c.border },
                mode === 'signup' && { backgroundColor: c.accent, borderColor: c.accent },
              ]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.authTabText, { fontSize: fs(14) }]}>SIGN UP</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.authTitle, { fontSize: fs(20), color: c.text }]}>
            {mode === 'login' ? '로그인' : 'Create account'}
          </Text>
          <TextInput
            placeholder="이메일"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            value={password}
            onChangeText={setPassword}
          />
          {mode === 'signup' && (
            <TextInput
              placeholder="비밀번호 확인"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
            />
          )}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: c.accent }]}
            onPress={handleAuth}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.primaryText, { fontSize: fs(16) }]}>시작하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: c.bg }]}>
      <StatusBar style="light" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <View style={styles.navBar}>
          <Text style={[styles.logo, { color: c.accent }]}>PB neteflix</Text>
          <TouchableOpacity
            style={[styles.menuButton, { borderColor: c.border }]}
            onPress={() => setNavOpen((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={{ color: c.text, fontWeight: '700' }}>MENU</Text>
          </TouchableOpacity>
          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.navIconButton}
              onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Text style={{ color: c.text }}>{theme === 'dark' ? '☀' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navIconButton}
              onPress={() => setFontScale((s) => Math.min(1.2, s + 0.05))}
            >
              <Text style={{ color: c.text }}>A+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navIconButton}
              onPress={() => setFontScale((s) => Math.max(0.9, s - 0.05))}
            >
              <Text style={{ color: c.text }}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navIconButton, reduceMotion && { borderColor: c.accent }]}
              onPress={() => setReduceMotion((v) => !v)}
            >
              <Text style={{ color: c.text }}>⚡</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutPill} onPress={handleLogout} disabled={busy}>
              <Text style={[styles.logoutPillText, { color: c.text }]}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
        {navOpen && (
          <View style={[styles.navDropdown, { backgroundColor: c.card, borderColor: c.border }]}>
            {[
              ['HOME', 'home'],
              ['POPULAR', 'popular'],
              ['SEARCH', 'search'],
              ['WISHLIST', 'wishlist'],
              ['RECOMMENDED', 'recommended'],
            ].map(([label, key]) => (
              <TouchableOpacity key={key} onPress={() => scrollToSection(key as string)} style={styles.navRow}>
                <Text style={[styles.navLink, { color: c.text }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View
          style={styles.hero}
          onLayout={(e) => (sectionY.current['home'] = e.nativeEvent.layout.y)}
        >
          <Text style={[styles.heroEyebrow, { color: c.muted }]}>FOR YOU</Text>
          <Text style={[styles.heroTitle, { color: c.text }]}>TMDB API로 큐레이션된 추천</Text>
          <Text style={[styles.heroSubtitle, { color: c.muted }]}>
            인기, 상영 중, 추천 작품을 한 곳에서 만나보세요.
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              placeholder="검색어를 입력하세요"
              placeholderTextColor="#9ca3af"
              style={[
                styles.searchInput,
                { backgroundColor: c.card, borderColor: c.border, color: c.text },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: c.border, backgroundColor: c.card }]}
              onPress={handleSearch}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryText, { color: c.text }]}>검색</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: c.accent }]}
              onPress={handleAddNote}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryText}>Firestore에 메모 저장</Text>
            </TouchableOpacity>
            {!!notes.length && (
              <View style={[styles.noteBubble, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[styles.noteBubbleText, { color: c.text }]}>{notes[0]}</Text>
              </View>
            )}
          </View>
        </View>

        {loadingMovies && <ActivityIndicator color="#e50914" style={{ marginVertical: 10 }} />}

        {!!searchResults.length && (
          <Section title="검색 결과" data={searchResults} onLayout={(y) => (sectionY.current['search'] = y)} />
        )}
        <Section title="지금 가장 뜨는 영화" data={popular} onLayout={(y) => (sectionY.current['popular'] = y)} />
        <Section title="극장에서 막 나온 작품" data={nowPlaying} onLayout={(y) => (sectionY.current['search'] = y)} />
        <Section title="추천 큐레이션" data={recommend} onLayout={(y) => (sectionY.current['recommended'] = y)} />
        {!!wishlist.length && (
          <Section
            title="내 위시리스트"
            data={wishlist.map((w) => ({
              id: w.id,
              title: w.title,
              overview: '',
              poster: w.poster,
            }))}
            onLayout={(y) => (sectionY.current['wishlist'] = y)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const palette = {
  dark: {
    bg: '#05070f',
    card: '#0b1021',
    border: '#1f2937',
    text: '#f8fafc',
    muted: '#9ca3af',
    accent: '#e50914',
  },
  light: {
    bg: '#f8fafc',
    card: '#ffffff',
    border: '#e5e7eb',
    text: '#0f172a',
    muted: '#475569',
    accent: '#e50914',
  },
} as const

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#05070f',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logo: {
    color: '#e50914',
    fontWeight: '800',
    fontSize: 22,
  },
  authCard: {
    marginTop: 12,
    backgroundColor: '#0b1021',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#111827',
  },
  authTabs: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  authTabActive: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },
  authTabText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  authTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  primaryButton: {
    backgroundColor: '#e50914',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#05070f',
  },
  navBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  navLink: {
    color: '#e5e7eb',
    fontSize: 12,
    letterSpacing: 1,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navIconButton: {
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0b1021',
  },
  logoutPillText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  menuButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 12,
  },
  navDropdown: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  navRow: {
    paddingVertical: 6,
  },
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 6,
  },
  heroEyebrow: {
    color: '#9ca3af',
    letterSpacing: 2,
    fontSize: 11,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#0b1021',
  },
  secondaryText: {
    color: '#e5e7eb',
    fontWeight: '700',
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  noteBubble: {
    marginTop: 10,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  noteBubbleText: {
    color: '#e5e7eb',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#0b1021',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  poster: {
    height: 190,
    borderRadius: 8,
    backgroundColor: '#111827',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardTag: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 10,
  },
  wishButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  wishButtonActive: {
    borderColor: '#e50914',
    backgroundColor: 'rgba(229,9,20,0.12)',
  },
  wishButtonText: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 12,
  },
})
