import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration for project: timetb-b1698
const firebaseConfig = {
  apiKey: "AIzaSyAc5oofgw6apW_mEQS6IpuRBfuNZAcOWsI",
  authDomain: "timetb-b1698.firebaseapp.com",
  projectId: "timetb-b1698",
  storageBucket: "timetb-b1698.firebasestorage.app",
  messagingSenderId: "581665773176",
  appId: "1:581665773176:web:c000e08b0cbbe54f2dbf8d",
  measurementId: "G-S2QKNGN60J",
  // Crucial: Matches your Singapore (Asia) database location
  databaseURL: "https://timetb-b1698-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = getDatabase(app);

// MOBILE DATA OPTIMIZATION:
// This helps the app maintain a connection even if the mobile carrier 
// (MPT/Atom/Ooredoo) has a strict firewall or unstable signal.
if (typeof window !== "undefined") {
  // Keeping the connection "warm" so alerts arrive instantly
  import("firebase/database").then(({ goOnline }) => {
    goOnline(db);
  });
}

export { db };