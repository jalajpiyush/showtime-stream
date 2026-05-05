import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface ShowCardProps {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  price: number;
  showType: string;
  genre?: string | null;
  language?: string | null;
  releaseType: string;
  isLive: boolean;
  startTime?: string | null;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function showTypeIcon(type: string): string {
  if (type === "movie") return "film";
  if (type === "concert") return "music";
  return "radio";
}

export function ShowCard({
  id,
  title,
  description,
  thumbnailUrl,
  price,
  showType,
  genre,
  language,
  releaseType,
  isLive,
  startTime,
}: ShowCardProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={() => router.push(`/show/${id}`)}
    >
      <View
        style={[
          styles.thumbnail,
          { backgroundColor: colors.muted, borderRadius: colors.radius - 2 },
        ]}
      >
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: colors.radius - 2 },
            ]}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <Feather name={showTypeIcon(showType) as any} size={22} color={colors.mutedForeground} />
          </View>
        )}
        {isLive && (
          <View style={[styles.livePill, { backgroundColor: colors.live }]}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>LIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {releaseType !== "theatre_only" && (
            <View
              style={[
                styles.releaseBadge,
                {
                  backgroundColor:
                    releaseType === "hybrid"
                      ? colors.accent
                      : colors.primary + "22",
                  borderColor:
                    releaseType === "hybrid" ? colors.border : colors.primary + "55",
                },
              ]}
            >
              <Text
                style={[
                  styles.releaseBadgeText,
                  {
                    color:
                      releaseType === "hybrid" ? colors.mutedForeground : colors.primary,
                  },
                ]}
              >
                {releaseType === "hybrid" ? "Hybrid" : "Online"}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.description, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.tags}>
            {genre && (
              <View style={[styles.tag, { backgroundColor: colors.accent }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                  {genre}
                </Text>
              </View>
            )}
            {language && (
              <View style={[styles.tag, { backgroundColor: colors.accent }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                  {language}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.priceRow}>
            {startTime && (
              <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                {formatDate(startTime)}
              </Text>
            )}
            <Text style={[styles.price, { color: colors.primary }]}>₹{price}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: 90,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholderIcon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  livePill: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  livePillText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 4,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  releaseBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  releaseBadgeText: {
    fontSize: 9,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  tags: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
    flex: 1,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "500",
  },
  priceRow: {
    alignItems: "flex-end",
    gap: 2,
  },
  dateText: {
    fontSize: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
  },
});
