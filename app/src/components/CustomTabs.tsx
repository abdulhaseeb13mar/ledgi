import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import React, { useState, type ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

interface CustomTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function CustomTabs({ tabs, defaultTab }: CustomTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key ?? "");

  const activeContent = tabs.find((t) => t.key === activeTab)?.content;

  return (
    <View>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>{activeContent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.gray[100],
    borderRadius: radius.lg,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[500],
  },
  tabLabelActive: {
    color: colors.gray[900],
    fontWeight: fontWeight.semibold,
  },
  content: {
    marginTop: spacing.xs,
  },
});
