import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// const firebaseConfig = {
//   // Add your Firebase config here
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID
// };

const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "AIzaSyCMqNOL4heOA7IEZzKVBrQqDdWUPLBhVQ4",
  authDomain: "flashcards-with-ai.firebaseapp.com",
  projectId: "flashcards-with-ai",
  storageBucket: "flashcards-with-ai.firebasestorage.app",
  messagingSenderId: "139333492763",
  appId: "1:139333492763:web:820d81aafcb5d4d37718be",
  measurementId: "G-B3DS0Z90ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
