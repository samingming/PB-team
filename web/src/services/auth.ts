import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'
import type { User } from '@/types/user'

const CURRENT_USER_KEY = 'currentUser'
const KEEP_LOGIN_KEY = 'keepLogin'
const TMDB_KEY_STORAGE = 'TMDb-Key'
const REMEMBER_EMAIL_KEY = 'rememberEmail'

function setPersistedValue(key: string, value: string, persist: boolean) {
  const primary = persist ? localStorage : sessionStorage
  const secondary = persist ? sessionStorage : localStorage
  primary.setItem(key, value)
  secondary.removeItem(key)
}

function clearStoredValue(key: string) {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

function getFromStorages(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key)
}

let authReadyPromise: Promise<unknown> | null = null
const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()
githubProvider.addScope('read:user')
githubProvider.addScope('user:email')

export function ensureAuthReady() {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user?.email) {
          setPersistedValue(CURRENT_USER_KEY, user.email, true)
        }
        unsubscribe()
        resolve(user)
      })
    })
  }
  return authReadyPromise
}

export async function tryRegister(
  email: string,
  password: string,
  success: (user: User) => void,
  fail: (msg: string) => void,
) {
  try {
    await setPersistence(auth, browserLocalPersistence)
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const userEmail = cred.user.email ?? email
    setPersistedValue(TMDB_KEY_STORAGE, password, true)
    setPersistedValue(CURRENT_USER_KEY, userEmail, true)
    localStorage.setItem(KEEP_LOGIN_KEY, 'true')
    localStorage.setItem(REMEMBER_EMAIL_KEY, email)

    success({ id: userEmail, password })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
    fail(message)
  }
}

export async function tryLogin(
  email: string,
  password: string,
  success: (user: User) => void,
  fail: (msg: string) => void,
  saveToken: boolean,
) {
  try {
    const persistence = saveToken ? browserLocalPersistence : browserSessionPersistence
    await setPersistence(auth, persistence)
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const userEmail = cred.user.email ?? email

    setPersistedValue(TMDB_KEY_STORAGE, password, saveToken)
    setPersistedValue(CURRENT_USER_KEY, userEmail, saveToken)

    if (saveToken) {
      localStorage.setItem(KEEP_LOGIN_KEY, 'true')
      localStorage.setItem(REMEMBER_EMAIL_KEY, email)
    } else {
      localStorage.removeItem(KEEP_LOGIN_KEY)
      localStorage.removeItem(REMEMBER_EMAIL_KEY)
    }

    success({ id: userEmail, password })
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
    fail(message)
  }
}

export async function logout() {
  await signOut(auth)
  clearStoredValue(CURRENT_USER_KEY)
  clearStoredValue(TMDB_KEY_STORAGE)
}

export async function loginWithGoogle(
  saveToken: boolean,
  success: (user: User) => void,
  fail: (msg: string) => void,
) {
  try {
    const persistence = saveToken ? browserLocalPersistence : browserSessionPersistence
    await setPersistence(auth, persistence)
    const cred = await signInWithPopup(auth, googleProvider)
    const userEmail = cred.user.email ?? 'Google User'

    setPersistedValue(CURRENT_USER_KEY, userEmail, saveToken)
    clearStoredValue(TMDB_KEY_STORAGE)

    if (saveToken) {
      localStorage.setItem(KEEP_LOGIN_KEY, 'true')
      localStorage.setItem(REMEMBER_EMAIL_KEY, userEmail)
    } else {
      localStorage.removeItem(KEEP_LOGIN_KEY)
      localStorage.removeItem(REMEMBER_EMAIL_KEY)
    }

    success({ id: userEmail, password: '' })
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Google 로그인에 실패했습니다. 다시 시도해주세요.'
    fail(message)
  }
}

export async function loginWithGithub(
  saveToken: boolean,
  success: (user: User) => void,
  fail: (msg: string) => void,
) {
  console.log('[GitHub login] callback URI:', getFirebaseAuthRedirectUri())
  try {
    const persistence = saveToken ? browserLocalPersistence : browserSessionPersistence
    await setPersistence(auth, persistence)
    const cred = await signInWithPopup(auth, githubProvider)
    const userEmail = cred.user.email ?? cred.user.displayName ?? 'GitHub User'

    setPersistedValue(CURRENT_USER_KEY, userEmail, saveToken)
    clearStoredValue(TMDB_KEY_STORAGE)

    if (saveToken) {
      localStorage.setItem(KEEP_LOGIN_KEY, 'true')
      localStorage.setItem(REMEMBER_EMAIL_KEY, userEmail)
    } else {
      localStorage.removeItem(KEEP_LOGIN_KEY)
      localStorage.removeItem(REMEMBER_EMAIL_KEY)
    }

    success({ id: userEmail, password: '' })
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'GitHub 搿滉犯?胳棎 ?ろ尐?堨姷?堧嫟. ?れ嫓 ?滊弰?挫＜?胳殧.'
    fail(message)
  }
}

export function getCurrentUserId(): string | null {
  // Rely solely on Firebase auth state so stale storage entries
  // do not make the app think a user is logged in.
  return auth.currentUser?.email ?? null
}

export function getStoredTmdbKey(): string | null {
  return getFromStorages(TMDB_KEY_STORAGE)
}

export function getRememberedEmail(): string | null {
  return localStorage.getItem(REMEMBER_EMAIL_KEY)
}

export function isKeepLoginEnabled(): boolean {
  return localStorage.getItem(KEEP_LOGIN_KEY) === 'true'
}

export function getFirebaseAuthRedirectUri(): string | null {
  const domain =
    auth.app?.options?.authDomain ??
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    null
  if (!domain) return null
  return `https://${domain}/__/auth/handler`
}
