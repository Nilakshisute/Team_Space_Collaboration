// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyClM_Keva5dVLcwgunK_IrA-M8dwyAt8jk",
  authDomain: "team-space-collaboration.firebaseapp.com",
  projectId: "team-space-collaboration",
  storageBucket: "team-space-collaboration.firebasestorage.app",
  messagingSenderId: "890810631260",
  appId: "1:890810631260:web:dc32e155385e34953a5299",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
