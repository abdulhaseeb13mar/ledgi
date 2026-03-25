import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyADDC5Ur7FbB8MRMcGmXUY0fBJqFuyoz_g",
//   authDomain: "khaata-ledger.firebaseapp.com",
//   projectId: "khaata-ledger",
//   storageBucket: "khaata-ledger.firebasestorage.app",
//   messagingSenderId: "573556950304",
//   appId: "1:573556950304:web:8c00c24b38ab3124414345",
// };

const firebaseConfig = {
  apiKey: "AIzaSyB1Mu37BOFEl3GIy9bOmPtnUju5kxRntNI",
  authDomain: "kamel-hisaab.firebaseapp.com",
  projectId: "kamel-hisaab",
  storageBucket: "kamel-hisaab.firebasestorage.app",
  messagingSenderId: "577518418175",
  appId: "1:577518418175:web:f51dba5a56c0cb068634ca",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
