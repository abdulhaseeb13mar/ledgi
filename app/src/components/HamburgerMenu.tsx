import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import { useAuthContext } from "@/providers/auth.provider";
import { signOut } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "@/navigation/types";

const DRAWER_WIDTH = 280;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavItem = {
  label: string;
  screen: keyof RootStackParamList;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const navItems: NavItem[] = [
  { label: "Dashboard", screen: "Dashboard", icon: "home-outline" },
  { label: "Friends", screen: "Friends", icon: "people-outline" },
  { label: "Create Due", screen: "CreateDue", icon: "add-circle-outline" },
  {
    label: "Confirm Dues",
    screen: "ConfirmDues",
    icon: "checkmark-circle-outline",
  },
  {
    label: "Pending Confirmations",
    screen: "PendingDues",
    icon: "time-outline",
  },
  { label: "Settings", screen: "Settings", icon: "settings-outline" },
];

interface HamburgerMenuProps {
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
  currentRoute?: string;
}

export default function HamburgerMenu({
  navigation,
  currentRoute,
}: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const { appUser } = useAuthContext();
  const insets = useSafeAreaInsets();

  const openDrawer = () => {
    setOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOpen(false);
      callback?.();
    });
  };

  const handleNavPress = (screen: keyof RootStackParamList) => {
    closeDrawer(() => {
      navigation.navigate(screen as any);
    });
  };

  const handleLogout = () => {
    closeDrawer(async () => {
      await signOut();
      // Navigation resets automatically when user becomes null in AuthProvider
    });
  };

  return (
    <>
      {/* Fixed Header Bar */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 56 + insets.top },
        ]}
      >
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.menuBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="menu" size={24} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ledgi</Text>

        {/* Spacer to balance the menu button */}
        <View style={{ width: 40 }} />
      </View>

      {/* Drawer Modal */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => closeDrawer()}
        statusBarTranslucent
      >
        {/* Overlay */}
        <Animated.View
          style={[styles.overlay, { opacity: overlayAnim }]}
          pointerEvents="box-none"
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => closeDrawer()}
          />
        </Animated.View>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            { paddingTop: insets.top, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.drawerName} numberOfLines={1}>
                {appUser?.name ?? "User"}
              </Text>
              <Text style={styles.drawerEmail} numberOfLines={1}>
                {appUser?.email ?? ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => closeDrawer()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Nav Items */}
          <View style={styles.navList}>
            {navItems.map((item) => {
              const isActive = currentRoute === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleNavPress(item.screen)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isActive ? colors.white : colors.gray[700]}
                  />
                  <Text
                    style={[styles.navLabel, isActive && styles.navLabelActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.red[600]}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    justifyContent: "space-between",
  },
  headerTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  menuBtn: {
    width: 40,
    alignItems: "flex-start",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  drawerName: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  drawerEmail: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  navList: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  navItemActive: {
    backgroundColor: colors.accent,
  },
  navLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray[700],
  },
  navLabelActive: {
    color: colors.white,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    padding: spacing.md,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  logoutText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.red[600],
  },
});
