// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyASBJAKz7L5tri5vAqU8CoR8xlx-k-EnXg",
  authDomain: "gap-x-e7deb.firebaseapp.com",
  projectId: "gap-x-e7deb",
  storageBucket: "gap-x-e7deb.firebasestorage.app",
  messagingSenderId: "74158737941",
  appId: "1:74158737941:web:6364360aec7327efcd9c1c",
  measurementId: "G-Q89TXV8SYQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };
