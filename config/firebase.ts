import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { Platform } from 'react-native';

// These keys should come from your .env file
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

let app;
let auth: firebase.auth.Auth;
let db: firebase.firestore.Firestore;

try {
  if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
  } else {
    app = firebase.app();
  }
  
  auth = firebase.auth();
  db = firebase.firestore();

} catch (e) {
  console.warn("Firebase initialization failed. Ensure your .env file has the correct FIREBASE_ keys.", e);
}

export { auth, db, firebase };