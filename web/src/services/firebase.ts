// Firebase initialization
// Reads config from Vite env (VITE_FIREBASE_*)
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

// Prevent re-initialization in HMR, and ensure type is FirebaseApp (not undefined)
let app: FirebaseApp
if (getApps().length) {
  app = getApp()
} else {
  app = initializeApp(firebaseConfig)
}

export const auth = getAuth(app)
export const db = getFirestore(app)
