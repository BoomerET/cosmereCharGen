// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDovEwgMF8lIsGhBMwElcDHmXVe8Wkv0eE",
  authDomain: "cosmerepcgen.firebaseapp.com",
  projectId: "cosmerepcgen",
  storageBucket: "cosmerepcgen.firebasestorage.app",
  messagingSenderId: "392648261999",
  appId: "1:392648261999:web:c0d2f7943b77db8bc9e89a",
  measurementId: "G-M2K13NS6YH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

