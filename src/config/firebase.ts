import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import 'firebase/storage';

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_APP_API_KEY,
  authDomain: process.env.FIREBASE_APP_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_APP_PROJECT_ID,
  storageBucket: process.env.FIREBASE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_APP_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_APP_ID,
  measurementId: process.env.FIREBASE_APP_MEASUREMENT_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
