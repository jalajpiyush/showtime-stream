import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
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

import { MockTicket, useTickets } from "@/context/TicketsContext";
import { useColors } from "@/hooks/useColors";

function showTypeIcon(type: string) {
  if (type === "movie") return "film";
  if (type === "concert") return "music";
  return "radio";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TicketCard({ ticket }: { ticket: MockTicket }) {
  const colors = useColors();
  const router = useRouter();

  const canWatch =
    ticket.releaseType === "online_only" || ticket.releaseType === "hybrid";

  return (
    <Pressable
      style={[
        styles.ticketCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
      onPress={() => router.push(`/show/${ticket.showId}`)}
    >
      <View
        style={[
          styles.ticketThumbnail,
          {
            backgroundColor: colors.muted,
            borderRadius: colors.radius - 2,
          },
        ]}
      >
        {ticket.showThumbnail ? (
          <Image
            source={{ uri: ticket.showThumbnail }}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: colors.radius - 2 },
            ]}
            contentFit="cover"
          />
        ) : (
          <Feather
            name={showTypeIcon(ticket.showType) as any}
            size={24}
            color={colors.mutedForeground}
          />
        )}
      </View>

      <View style={styles.ticketContent}>
        <Text
          style={[styles.ticketTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {ticket.showTitle}
        </Text>

        <View style={styles.ticketMeta}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: colors.accent },
            ]}
          >
            <Feather
              name={showTypeIcon(ticket.showType) as any}
              size={10}
              color={colors.mutedForeground}
            />
            <Text style={[styles.typeBadgeText, { color: colors.mutedForeground }]}>
              {ticket.showType === "live_event"
                ? "Live Event"
                : ticket.showType.charAt(0).toUpperCase() + ticket.showType.slice(1)}
            </Text>
          </View>
          {ticket.releaseType !== "theatre_only" && (
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    ticket.releaseType === "hybrid"
                      ? colors.accent
                      : colors.primary + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color:
                      ticket.releaseType === "hybrid"
                        ? colors.mutedForeground
                        : colors.primary,
                  },
                ]}
              >
                {ticket.releaseType === "hybrid" ? "Hybrid" : "Online"}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.ticketDate, { color: colors.mutedForeground }]}>
          Purchased {formatDate(ticket.purchasedAt)}
        </Text>

        <View style={styles.ticketFooter}>
          <Text style={[styles.ticketPrice, { color: colors.primary }]}>
            ₹{ticket.amountPaid}
          </Text>
          {canWatch && (
            <Pressable
              style={[styles.watchBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/watch/${ticket.showId}`)}
            >
              <Feather name="play" size={12} color="#fff" />
              <Text style={styles.watchBtnText}>Watch</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.ticketStub, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text
          style={[styles.ticketRef, { color: colors.mutedForeground }]}
          numberOfLines={4}
        >
          {ticket.paymentRef}
        </Text>
      </View>
    </Pressable>
  );
}

export default function TicketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tickets } = useTickets();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.heading, { color: colors.foreground }]}>
          My Tickets
        </Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </Text>
      </View>

      {tickets.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="tag" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No tickets yet
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Browse shows and purchase tickets to get started
          </Text>
          <Pressable
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/browse")}
          >
            <Text style={styles.browseBtnText}>Browse Shows</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: 100 + bottomPad },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {[...tickets].reverse().map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 2,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
  },
  subheading: {
    fontSize: 13,
    fontWeight: "500",
  },
  list: {
    padding: 16,
    gap: 0,
  },
  ticketCard: {
    flexDirection: "row",
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  ticketThumbnail: {
    width: 80,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  ticketContent: {
    flex: 1,
    padding: 12,
    gap: 5,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  ticketMeta: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  ticketDate: {
    fontSize: 11,
  },
  ticketFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: "800",
  },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  watchBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  ticketStub: {
    width: 36,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  ticketRef: {
    fontSize: 7,
    fontWeight: "600",
    letterSpacing: 1,
    transform: [{ rotate: "90deg" }],
    textAlign: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
