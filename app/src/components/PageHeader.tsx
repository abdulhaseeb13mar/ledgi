import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  refreshFunction?: () => Promise<boolean>;
  titleStyle?: object;
}

export default function PageHeader({
  title,
  showBack = false,
  refreshFunction,
  titleStyle,
}: PageHeaderProps) {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const triggerRefresh = async () => {
    if (!refreshFunction) return;
    setRefreshing(true);
    const success = await refreshFunction();
    if (!success) {
      Toast.show({ type: "error", text1: "Failed to refresh data" });
    }
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.gray[700]} />
          </TouchableOpacity>
        )}
        {title ? (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      {refreshFunction && (
        <TouchableOpacity
          onPress={triggerRefresh}
          disabled={refreshing}
          style={styles.refreshBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.gray[600]} />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={18}
              color={colors.gray[600]}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    minWidth: 0,
  },
  backBtn: {
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    flexShrink: 1,
  },
  refreshBtn: {
    padding: spacing.sm,
    borderRadius: radius.md,
  },
});
