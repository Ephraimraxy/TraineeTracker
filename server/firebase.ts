import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx7axnsxE55MKwZBFKOGhzOtFeme8qNoA",
  authDomain: "trms-4f542.firebaseapp.com",
  projectId: "trms-4f542",
  storageBucket: "trms-4f542.firebasestorage.app",
  messagingSenderId: "419302910396",
  appId: "1:419302910396:web:fb29b1e13bb956a4c0e3b9",
  measurementId: "G-R78HR9DLX0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;