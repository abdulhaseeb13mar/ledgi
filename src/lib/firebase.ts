import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyADDC5Ur7FbB8MRMcGmXUY0fBJqFuyoz_g",
  authDomain: "khaata-ledger.firebaseapp.com",
  projectId: "khaata-ledger",
  storageBucket: "khaata-ledger.firebasestorage.app",
  messagingSenderId: "573556950304",
  appId: "1:573556950304:web:8c00c24b38ab3124414345",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
