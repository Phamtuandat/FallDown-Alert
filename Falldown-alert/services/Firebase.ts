// services/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBwoVtmXhoe0X1H43yDXRBJ-4oGT-qrtdI",
    authDomain: "emergency-4aecc.firebaseapp.com",
    databaseURL: "https://emergency-4aecc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "emergency-4aecc",
    storageBucket: "emergency-4aecc.firebasestorage.app",
    messagingSenderId: "300222582072",
    appId: "1:300222582072:web:c50a128ca1cdf31db745cd",
    measurementId: "G-SLEM3KQSCX"
};

// Ensure Firebase is only initialized once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const rtdb = getDatabase(app);

export { app, db, rtdb };
