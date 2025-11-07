// ...existing code...
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {  setPersistence, browserLocalPersistence, initializeAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
// ...existing code...

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Auth with browser local persistence (default is local, but you can set explicitly)
export const auth = initializeAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((err) => {
    console.warn("Could not set auth persistence:", err.code || err.message || err);
  });

onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed (from FirebaseConfig):", user ? "logged in" : "logged out");
  if (user) {
    console.log("User is signed in:", user.uid);
  } else {
    console.log("No user is signed in.");
  }

});

// I don't think the analytics is useful for us but the copy-paste gave me analytics so I am keeping it here just in case
export const analytics =
  typeof window !== "undefined" && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? getAnalytics(app)
    : undefined;
//console.log("Checking if firebase app is initialized:", app.name);