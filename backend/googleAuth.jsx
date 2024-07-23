// googleAuth.jsx
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_NMbQuYZjH5k5yhvUM3MvhQ4h0IUmLUA",
  authDomain: "g-guide-1368b.firebaseapp.com",
  projectId: "g-guide-1368b",
  storageBucket: "g-guide-1368b.appspot.com",
  messagingSenderId: "838761191517",
  appId: "1:838761191517:web:978e3960aadc70e5a695b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

// window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {});