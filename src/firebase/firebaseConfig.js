// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClM_Keva5dVLcwgunK_IrA-M8dwyAt8jk",
  authDomain: "team-space-collaboration.firebaseapp.com",
  projectId: "team-space-collaboration",
  storageBucket: "team-space-collaboration.firebasestorage.app",
  messagingSenderId: "890810631260",
  appId: "1:890810631260:web:dc32e155385e34953a5299"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
const db = getFirestore(app);
  
export { db };



