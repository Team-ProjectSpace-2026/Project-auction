import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAGnvwT2WCjsifuLus4gpbvnGCtk2NbGQY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cric-auction-hub.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cric-auction-hub",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cric-auction-hub.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "59922001845",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:59922001845:web:c24d9cb6caed63be4e73fc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
