import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBP-bB5u7hXMaCroqr7Vb1CvkEtWWahWWA",
  authDomain: "uhd-first.firebaseapp.com",
  projectId: "uhd-first",
  storageBucket: "uhd-first.firebasestorage.app",
  messagingSenderId: "595908995722",
  appId: "1:595908995722:web:18f6941ea1e0dda1785b73",
  measurementId: "G-M8CBTVQS90"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);