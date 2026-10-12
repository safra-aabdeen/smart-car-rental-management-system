import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const updateDrivers = async () => {
  try {
    const driversRef = collection(db, "drivers");
    const snapshot = await getDocs(driversRef);
    let updatedCount = 0;

    for (const d of snapshot.docs) {
      if (d.data().status === "Busy") {
        await updateDoc(doc(db, "drivers", d.id), {
          status: "Unavailable"
        });
        updatedCount++;
        console.log(`Updated driver ${d.id}`);
      }
    }
    console.log(`Successfully updated ${updatedCount} drivers.`);
  } catch (err) {
    console.error("Error updating drivers:", err);
  }
};

updateDrivers();
