import { initializeApp }      from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth';

const firebaseConfig = {
  //apiKey:    'YOUR_API_KEY',
  //authDomain:'your-app.firebaseapp.com',
  // …the rest from your Firebase console…
  apiKey: "AIzaSyDovEwgMF8lIsGhBMwElcDHmXVe8Wkv0eE",
  authDomain: "cosmerepcgen.firebaseapp.com",
  projectId: "cosmerepcgen",
  storageBucket: "cosmerepcgen.firebasestorage.app",
  messagingSenderId: "392648261999",
  appId: "1:392648261999:web:c0d2f7943b77db8bc9e89a",
  measurementId: "G-M2K13NS6YH"
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// export one provider per social login
export const googleProvider   = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider  = new TwitterAuthProvider();

