// Firebase initialization for Expo (mobile)
// Reads config from env (app.json / app.config.ts) via process.env.*
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra as
  | {
      firebase?: {
        apiKey?: string
        authDomain?: string
        projectId?: string
        storageBucket?: string
        messagingSenderId?: string
        appId?: string
      }
    }
  | undefined

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extra?.firebase?.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extra?.firebase?.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extra?.firebase?.projectId,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extra?.firebase?.storageBucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    extra?.firebase?.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extra?.firebase?.appId,
}

const missing = Object.entries(config)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missing.length) {
  throw new Error(`Missing Firebase env vars: ${missing.join(', ')}`)
}

let app: FirebaseApp
if (getApps().length) {
  app = getApp()
} else {
  app = initializeApp(config)
}

export const auth = getAuth(app)
export const db = getFirestore(app)
