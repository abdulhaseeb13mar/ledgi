import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuthContext } from "@/providers/auth.provider";
import ConfirmDuesScreen from "@/screens/ConfirmDuesScreen";
import CreateDueScreen from "@/screens/CreateDueScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import DuesOwedDetailScreen from "@/screens/DuesOwedDetailScreen";
import DuesOwedScreen from "@/screens/DuesOwedScreen";
import DuesReceivableDetailScreen from "@/screens/DuesReceivableDetailScreen";
import DuesReceivableScreen from "@/screens/DuesReceivableScreen";
import FriendsScreen from "@/screens/FriendsScreen";
import PendingDuesScreen from "@/screens/PendingDuesScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import ForgotPasswordScreen from "@/screens/auth/ForgotPasswordScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import RegisterScreen from "@/screens/auth/RegisterScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        ) : (
          // Authenticated app screens
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="DuesOwed" component={DuesOwedScreen} />
            <Stack.Screen
              name="DuesOwedDetail"
              component={DuesOwedDetailScreen}
            />
            <Stack.Screen
              name="DuesReceivable"
              component={DuesReceivableScreen}
            />
            <Stack.Screen
              name="DuesReceivableDetail"
              component={DuesReceivableDetailScreen}
            />
            <Stack.Screen name="CreateDue" component={CreateDueScreen} />
            <Stack.Screen name="ConfirmDues" component={ConfirmDuesScreen} />
            <Stack.Screen name="PendingDues" component={PendingDuesScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
