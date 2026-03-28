// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK7Vo3vT66IbtJeu3Txj5RphqpXD2iO20",
  authDomain: "spendict-14c0f.firebaseapp.com",
  projectId: "spendict-14c0f",
  storageBucket: "spendict-14c0f.firebasestorage.app",
  messagingSenderId: "431389866252",
  appId: "1:431389866252:web:bf0e39e355a4fdf0967129"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Set up Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});