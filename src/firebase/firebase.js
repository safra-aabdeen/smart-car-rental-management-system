import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByNfZQ_1l9K506MkMIUrcXbZBM8XdNr_8",
  authDomain: "car-rental-system-7fee1.firebaseapp.com",
  projectId: "car-rental-system-7fee1",
  storageBucket: "car-rental-system-7fee1.firebasestorage.app",
  messagingSenderId: "32170278876",
  appId: "1:32170278876:web:99b0309677210ea88e5919",
  measurementId: "G-K3LSXZEW4N"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);