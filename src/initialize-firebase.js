import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, get } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dataRef = ref(database, "foodEntries");

get(dataRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log("Data received once:", snapshot.val());
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    console.error("Error getting data:", error);
  });

const unsubscribe = onValue(
  dataRef,
  (snapshot) => {
    const data = snapshot.val();
    console.log("Real-time data update:", data);
  },
  (error) => {
    console.error("Error listening for data:", error);
  }
);

unsubscribe();

export default app;
