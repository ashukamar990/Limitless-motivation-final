// Import Firebase SDK (v12 modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMDAW2Gvsh8qJY5gZoFvgiMHxO5qjQl-I",
  authDomain: "videoapp-67c32.firebaseapp.com",
  databaseURL: "https://videoapp-67c32-default-rtdb.firebaseio.com",
  projectId: "videoapp-67c32",
  storageBucket: "videoapp-67c32.firebasestorage.app",
  messagingSenderId: "711675594877",
  appId: "1:711675594877:web:7786ab4a432d60e6f70914"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Export db so you can use it elsewhere
export { db };
