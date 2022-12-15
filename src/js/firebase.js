// Import the functions you need from the SDKs you need
import { initializeApp }  from 'firebase/app';
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0BMlIzghB018JTYDl0xRrVfj5-GuAvTE",
  authDomain: "pixel-c9fc0.firebaseapp.com",
  projectId: "pixel-c9fc0",
  storageBucket: "pixel-c9fc0.appspot.com",
  messagingSenderId: "66207413445",
  appId: "1:66207413445:web:1bd6ed9968dd577a61acac",
  measurementId: "G-XB3N3JX5V4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export {db}