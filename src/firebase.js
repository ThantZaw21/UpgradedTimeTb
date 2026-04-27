import { initializeApp } from "firebase/app";
import { getDatabase, forceLongPolling, goOnline } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc5oofgw6apW_mEQS6IpuRBfuNZAcOWsI",
  authDomain: "timetb-b1698.firebaseapp.com",
  projectId: "timetb-b1698",
  storageBucket: "timetb-b1698.firebasestorage.app",
  messagingSenderId: "581665773176",
  appId: "1:581665773176:web:c000e08b0cbbe54f2dbf8d",
  measurementId: "G-S2QKNGN60J",
  // Using the Singapore region (asia-southeast1) for better latency in Myanmar
  databaseURL: "https://timetb-b1698-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = getDatabase(app);

/**
 * --- MOBILE DATA & VPN-LESS OPTIMIZATION ---
 * * We use forceLongPolling to bypass ISP WebSocket blocks. 
 * This forces the SDK to use standard HTTPS requests, which 
 * are rarely throttled by mobile internet providers.
 */
if (typeof window !== "undefined") {
  try {
    forceLongPolling(db);
    goOnline(db);
    console.log("🚀 Firebase Optimized: Long-polling enabled for mobile data compatibility.");
  } catch (error) {
    console.error("Firebase Optimization Error:", error);
  }
}

export { db };