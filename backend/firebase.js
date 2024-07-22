
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyA_NMbQuYZjH5k5yhvUM3MvhQ4h0IUmLUA",
  authDomain: "g-guide-1368b.firebaseapp.com",
  projectId: "g-guide-1368b",
  storageBucket: "g-guide-1368b.appspot.com",
  messagingSenderId: "838761191517",
  appId: "1:838761191517:web:c884ac8f38f5cad9a695b4"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);