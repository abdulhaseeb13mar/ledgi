import RootNavigator from "@/navigation";
import { AuthProvider } from "@/providers/auth.provider";
import { QueryProvider } from "@/providers/query.provider";
import React from "react";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RootNavigator />
        <Toast />
      </AuthProvider>
    </QueryProvider>
  );
}
