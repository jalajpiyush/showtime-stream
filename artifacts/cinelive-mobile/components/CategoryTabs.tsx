import * as Haptics from "expo-haptics";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

export type ShowCategory = "all" | "movie" | "concert" | "live_event";

const CATEGORIES: { id: ShowCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "movie", label: "Movies" },
  { id: "concert", label: "Concerts" },
  { id: "live_event", label: "Live Events" },
];

interface CategoryTabsProps {
  selected: ShowCategory;
  onChange: (cat: ShowCategory) => void;
}

export function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORIES.map((cat) => {
        const active = cat.id === selected;
        return (
          <Pressable
            key={cat.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(cat.id);
            }}
            style={[
              styles.pill,
              {
                backgroundColor: active ? colors.primary : colors.card,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: 20,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: active ? colors.primaryForeground : colors.mutedForeground,
                  fontWeight: active ? "700" : "500",
                },
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
  spacer: {
    width: 8,
  },
});
