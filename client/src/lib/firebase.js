import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { APP_CONFIG } from '../config/appConfig';

const firebaseConfig = {
  apiKey: APP_CONFIG.FIREBASE.API_KEY,
  authDomain: APP_CONFIG.FIREBASE.AUTH_DOMAIN,
  projectId: APP_CONFIG.FIREBASE.PROJECT_ID,
  storageBucket: APP_CONFIG.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: APP_CONFIG.FIREBASE.MESSAGING_SENDER_ID,
  appId: APP_CONFIG.FIREBASE.APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
};
