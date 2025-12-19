import { GithubAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth'

import { auth } from '../firebaseConfig'

/**
 * GitHub 로그인 (Firebase Auth API만 사용)
 * - 우선 redirect 시도, 환경이 지원되지 않으면 popup으로 폴백
 */
export async function signInWithGithub() {
  const provider = new GithubAuthProvider()
  provider.addScope('read:user')
  provider.addScope('user:email')

  try {
    await signInWithRedirect(auth, provider)
    return
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const notSupported =
      message.includes('operation-not-supported') ||
      message.includes('auth/operation-not-supported') ||
      message.includes('popup') ||
      message.includes('redirect')

    if (notSupported) {
      await signInWithPopup(auth, provider)
      return
    }
    throw err
  }
}
