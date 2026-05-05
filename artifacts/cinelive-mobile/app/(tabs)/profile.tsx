import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTickets } from "@/context/TicketsContext";
import { useColors } from "@/hooks/useColors";

interface MenuRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuRow({ icon, label, value, onPress, danger }: MenuRowProps) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        {
          backgroundColor: pressed ? colors.accent : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.accent }]}>
        <Feather
          name={icon as any}
          size={16}
          color={danger ? colors.destructive : colors.mutedForeground}
        />
      </View>
      <Text
        style={[
          styles.menuLabel,
          { color: danger ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      {value && (
        <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>
          {value}
        </Text>
      )}
      {onPress && !danger && (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tickets } = useTickets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const totalSpent = tickets.reduce((sum, t) => sum + t.amountPaid, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 12, paddingBottom: 100 + bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.foreground }]}>Profile</Text>

      <View
        style={[
          styles.avatarCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
          <Feather name="user" size={36} color="#fff" />
        </View>
        <View style={styles.avatarInfo}>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            Guest User
          </Text>
          <Text style={[styles.userSub, { color: colors.mutedForeground }]}>
            Browsing as guest
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {tickets.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Tickets
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            ₹{totalSpent.toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Total Spent
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {tickets.filter((t) => t.releaseType !== "theatre_only").length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Online
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        PREFERENCES
      </Text>
      <View
        style={[
          styles.menuGroup,
          { borderColor: colors.border, borderRadius: colors.radius },
        ]}
      >
        <MenuRow icon="bell" label="Notifications" value="On" />
        <MenuRow icon="globe" label="Language" value="English" />
        <MenuRow icon="moon" label="Dark Mode" value="Always" />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        ABOUT
      </Text>
      <View
        style={[
          styles.menuGroup,
          { borderColor: colors.border, borderRadius: colors.radius },
        ]}
      >
        <MenuRow icon="info" label="App Version" value="1.0.0" />
        <MenuRow icon="shield" label="Privacy Policy" onPress={() => {}} />
        <MenuRow icon="file-text" label="Terms of Service" onPress={() => {}} />
      </View>

      <View style={[styles.appBranding, { marginTop: 40 }]}>
        <Text style={[styles.brandName, { color: colors.mutedForeground }]}>
          CINE<Text style={{ color: colors.primary }}>LIVE</Text>
        </Text>
        <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
          Movies · Concerts · Live Events
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    gap: 0,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  avatarCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
  },
  userSub: {
    fontSize: 13,
    fontWeight: "400",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  menuGroup: {
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  menuValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  appBranding: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 20,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 3,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
  },
});
