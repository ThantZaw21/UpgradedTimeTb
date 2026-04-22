import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc5oofgw6apW_mEQS6IpuRBfuNZAcOWsI",
  authDomain: "timetb-b1698.firebaseapp.com",
  projectId: "timetb-b1698",
  storageBucket: "timetb-b1698.firebasestorage.app",
  messagingSenderId: "581665773176",
  appId: "1:581665773176:web:ab4560b7ca43e9b02dbf8d",
  measurementId: "G-LGBZR69JBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);