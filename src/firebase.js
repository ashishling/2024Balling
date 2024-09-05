import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdAWySa5KlXAlRXXkhuZ-iscGJ6Lg9yWI",
  authDomain: "balling-a428d.firebaseapp.com",
  projectId: "balling-a428d",
  storageBucket: "balling-a428d.appspot.com",
  messagingSenderId: "467596199502",
  appId: "1:467596199502:web:41d03705423e0546fa251f",
  measurementId: "G-8CTMW6X9GR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Add this line to check if initialization was successful
console.log("Firebase initialized successfully:", app.name);

export { db };