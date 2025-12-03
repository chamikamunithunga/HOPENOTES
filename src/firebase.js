// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCHDqj4q_D7WMZtJwi12tgS9UzhtLrosdI",
    authDomain: "hopenotes-cce7a.firebaseapp.com",
    projectId: "hopenotes-cce7a",
    storageBucket: "hopenotes-cce7a.firebasestorage.app",
    messagingSenderId: "685290049598",
    appId: "1:685290049598:web:495a9c3ebd6ec4bbf4416f"
  };
  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);