import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CountdownTimer } from "@/components/CountdownTimer";
import { useTickets } from "@/context/TicketsContext";
import { useColors } from "@/hooks/useColors";
import { useGetShow } from "@workspace/api-client-react";

const POSTER_PLACEHOLDERS: Record<string, string> = {
  movie: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
  concert: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
  live_event: "https://images.unsplash.com/photo-1471044781344-69b3e5a6f7e2?w=400",
};

function releaseTypeLabel(r: string): string {
  if (r === "theatre_only") return "Theatre Only";
  if (r === "online_only") return "Online Only";
  return "Hybrid (Theatre + Online)";
}

function releaseTypeIcon(r: string): string {
  if (r === "theatre_only") return "map-pin";
  if (r === "online_only") return "play-circle";
  return "layers";
}

export default function ShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasTicket, purchaseTicket } = useTickets();
  const [purchasing, setPurchasing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: show, isLoading, isError } = useGetShow(Number(id));

  const owned = show ? hasTicket(show.id) : false;
  const canWatch = show && (show.releaseType === "online_only" || show.releaseType === "hybrid");
  const isUpcoming = show?.category === "upcoming";

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handlePurchase() {
    if (!show) return;
    setPurchasing(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 1200));
    await purchaseTicket({
      showId: show.id,
      showTitle: show.title,
      showThumbnail: show.thumbnailUrl ?? null,
      showType: show.showType,
      releaseType: show.releaseType,
      amountPaid: show.price,
      startTime: show.startTime ?? null,
    });
    setPurchasing(false);
    setSuccess(true);
    setShowModal(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !show) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Show not found
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const posterUrl = show.thumbnailUrl ?? POSTER_PLACEHOLDERS[show.showType] ?? null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + bottomPad }}
      >
        <View style={styles.heroContainer}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.card }]} />
          )}
          <LinearGradient
            colors={["transparent", colors.background]}
            style={styles.heroGradient}
          />

          <Pressable
            style={[styles.backBtn, { top: topPad + 8, backgroundColor: "rgba(0,0,0,0.5)" }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>

          {show.isLive && (
            <View style={[styles.liveOverlay, { backgroundColor: colors.primary }]}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveOverlayText}>LIVE NOW</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {show.title}
              </Text>
              {show.genre && (
                <Text style={[styles.genre, { color: colors.mutedForeground }]}>
                  {show.genre}
                </Text>
              )}
            </View>
            <Text style={[styles.price, { color: colors.primary }]}>
              ₹{show.price}
            </Text>
          </View>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Feather
                name={releaseTypeIcon(show.releaseType) as any}
                size={11}
                color={colors.mutedForeground}
              />
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                {releaseTypeLabel(show.releaseType)}
              </Text>
            </View>
            {show.language && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                  {show.language}
                </Text>
              </View>
            )}
            {show.duration && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Feather name="clock" size={11} color={colors.mutedForeground} />
                <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                  {Math.floor(show.duration / 60)}h {show.duration % 60}m
                </Text>
              </View>
            )}
          </View>

          {isUpcoming && show.startTime && (
            <View
              style={[
                styles.countdownBox,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>
                STARTS IN
              </Text>
              <CountdownTimer targetDate={show.startTime} />
            </View>
          )}

          {success && (
            <View
              style={[
                styles.successBanner,
                { backgroundColor: "#22c55e22", borderColor: "#22c55e55" },
              ]}
            >
              <Feather name="check-circle" size={18} color="#22c55e" />
              <Text style={[styles.successText, { color: "#22c55e" }]}>
                Ticket purchased successfully!
              </Text>
            </View>
          )}

          <Text style={[styles.descTitle, { color: colors.foreground }]}>
            About
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {show.description}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 16,
          },
        ]}
      >
        {owned ? (
          <View style={styles.footerOwned}>
            <View
              style={[
                styles.ownedBadge,
                { backgroundColor: "#22c55e22", borderColor: "#22c55e55" },
              ]}
            >
              <Feather name="check" size={14} color="#22c55e" />
              <Text style={[styles.ownedText, { color: "#22c55e" }]}>
                Ticket Owned
              </Text>
            </View>
            {canWatch && (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={() => router.push(`/watch/${show.id}`)}
              >
                <Feather name="play" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>
                  {isUpcoming ? "View Countdown" : "Watch Now"}
                </Text>
              </Pressable>
            )}
            {!canWatch && (
              <View style={[styles.theatreInfo, { flex: 1 }]}>
                <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                <Text style={[styles.theatreInfoText, { color: colors.mutedForeground }]}>
                  Enjoy at your local theatre
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowModal(true)}
          >
            <Feather name="tag" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Buy Ticket — ₹{show.price}</Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <Pressable
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                paddingBottom: bottomPad + 24,
              },
            ]}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Confirm Purchase
            </Text>

            <View style={[styles.modalShowRow, { backgroundColor: colors.background }]}>
              <View style={styles.modalShowInfo}>
                <Text style={[styles.modalShowTitle, { color: colors.foreground }]}>
                  {show.title}
                </Text>
                <Text style={[styles.modalShowType, { color: colors.mutedForeground }]}>
                  {releaseTypeLabel(show.releaseType)}
                </Text>
              </View>
              <Text style={[styles.modalPrice, { color: colors.primary }]}>
                ₹{show.price}
              </Text>
            </View>

            <View style={[styles.paymentRow, { borderColor: colors.border }]}>
              <Feather name="credit-card" size={16} color={colors.mutedForeground} />
              <Text style={[styles.paymentText, { color: colors.mutedForeground }]}>
                Mock Payment (Razorpay)
              </Text>
              <Text style={[styles.paymentStatus, { color: colors.success }]}>
                Ready
              </Text>
            </View>

            <Pressable
              style={[
                styles.confirmBtn,
                { backgroundColor: colors.primary, opacity: purchasing ? 0.7 : 1 },
              ]}
              onPress={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="zap" size={16} color="#fff" />
                  <Text style={styles.confirmBtnText}>
                    Pay ₹{show.price} Now
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable onPress={() => setShowModal(false)}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: { fontSize: 16, fontWeight: "500" },
  backLink: { fontSize: 15, fontWeight: "600" },
  heroContainer: { height: 380, position: "relative" },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  liveOverlay: {
    position: "absolute",
    bottom: 24,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  liveOverlayText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  body: { padding: 16, gap: 14 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleLeft: { flex: 1, gap: 3 },
  title: { fontSize: 24, fontWeight: "800", lineHeight: 30 },
  genre: { fontSize: 13, fontWeight: "500" },
  price: { fontSize: 22, fontWeight: "800" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  countdownBox: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    alignItems: "center",
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  successText: { fontSize: 14, fontWeight: "600" },
  descTitle: { fontSize: 16, fontWeight: "700" },
  description: { fontSize: 14, lineHeight: 22 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerOwned: { flexDirection: "row", gap: 10, alignItems: "center" },
  ownedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  ownedText: { fontSize: 13, fontWeight: "600" },
  theatreInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  theatreInfoText: { fontSize: 13, fontWeight: "500" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
    alignItems: "stretch",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  modalShowRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    gap: 12,
  },
  modalShowInfo: { flex: 1, gap: 3 },
  modalShowTitle: { fontSize: 15, fontWeight: "700" },
  modalShowType: { fontSize: 12 },
  modalPrice: { fontSize: 20, fontWeight: "800" },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  paymentText: { flex: 1, fontSize: 13, fontWeight: "500" },
  paymentStatus: { fontSize: 13, fontWeight: "600" },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 10,
  },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
  },
});
