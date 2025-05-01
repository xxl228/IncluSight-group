// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
   
const firebaseConfig = {
    apiKey: "AIzaSyCS7FGAuLrgvVXVt6xEMY5n4yTdX9WBRzE",
    authDomain: "inclusight-6e55a.firebaseapp.com",
    databaseURL: "https://inclusight-6e55a-default-rtdb.firebaseio.com",
    projectId: "inclusight-6e55a",
    storageBucket: "inclusight-6e55a.appspot.com",
    messagingSenderId: "270009455",
    appId: "1:270009455:web:34c4d4ce6c8c265af4399a",
    measurementId: "G-1NY06W1990"
  };

  console.log("✅ Initializing Firebase..."); // Debugging output

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// const auth = getAuth(app);
const db = getFirestore(app);

export { db };
