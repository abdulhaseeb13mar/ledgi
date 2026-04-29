import HamburgerMenu from "@/components/HamburgerMenu";
import { colors, spacing } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { RootStackParamList } from "@/navigation/types";

interface AppLayoutProps {
  children: ReactNode;
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
  currentRoute?: string;
}

export default function AppLayout({
  children,
  navigation,
  currentRoute,
}: AppLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <HamburgerMenu navigation={navigation} currentRoute={currentRoute} />
      <View
        style={[
          styles.content,
          { paddingBottom: insets.bottom > 0 ? 0 : spacing.lg },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
