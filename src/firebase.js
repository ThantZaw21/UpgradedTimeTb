import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc5oofgw6apW_mEQS6IpuRBfuNZAcOWsI",
  authDomain: "timetb-b1698.firebaseapp.com",
  projectId: "timetb-b1698",
  storageBucket: "timetb-b1698.firebasestorage.app",
  messagingSenderId: "581665773176",
  appId: "1:581665773176:web:c000e08b0cbbe54f2dbf8d",
  measurementId: "G-S2QKNGN60J",
  // CRITICAL: The URL must include 'asia-southeast1' to match your database location
  databaseURL: "https://timetb-b1698-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
// We export 'db' so it can be imported in App.jsx
export const db = getDatabase(app);