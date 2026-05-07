// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDpYKd2THBfb1G2yielspWITpMW23bQkn8",
  authDomain: "gap001-312e3.firebaseapp.com",
  projectId: "gap001-312e3",
  storageBucket: "gap001-312e3.appspot.com",
  messagingSenderId: "217606666961",
  appId: "1:217606666961:web:bdba8692d5d0b66c0de3f0",
  measurementId: "G-82W2QHXVHE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };
