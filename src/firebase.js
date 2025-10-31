// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB9iT0JXFOwG38uTjY8dYDa527dujrFjBs",
  authDomain: "my-todo-app-69bbe.firebaseapp.com",
  projectId: "my-todo-app-69bbe",
  storageBucket: "my-todo-app-69bbe.appspot.com",
  messagingSenderId: "844616107737",
  appId: "1:844616107737:web:b7f37df2b1aecbd240a0c8"
};

// ✅ prevent duplicate initialization (Vite reload e often duplicate hoy)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// ✅ Firestore and Auth instances
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
