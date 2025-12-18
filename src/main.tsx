import { StrictMode } from "react";

import "./index.css";
import { router } from "./router";
import QueryClientProvider from "@/providers/query.provider";
import { RouterProvider } from "@tanstack/react-router";
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
import { createRoot } from "react-dom/client";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyADDC5Ur7FbB8MRMcGmXUY0fBJqFuyoz_g",
//   authDomain: "khaata-ledger.firebaseapp.com",
//   projectId: "khaata-ledger",
//   storageBucket: "khaata-ledger.firebasestorage.app",
//   messagingSenderId: "573556950304",
//   appId: "1:573556950304:web:8c00c24b38ab3124414345",
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
