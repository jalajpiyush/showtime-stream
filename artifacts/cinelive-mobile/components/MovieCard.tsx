import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface MovieCardProps {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
  price: number;
  genre?: string | null;
  language?: string | null;
  releaseType: string;
  isLive: boolean;
  width?: number;
}

export function MovieCard({
  id,
  title,
  thumbnailUrl,
  price,
  genre,
  language,
  releaseType,
  isLive,
  width = 140,
}: MovieCardProps) {
  const colors = useColors();
  const router = useRouter();

  const height = Math.round(width * 1.5);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { width, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push(`/show/${id}`)}
    >
      <View
        style={[
          styles.poster,
          {
            width,
            height,
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderColor: colors.border,
          },
        ]}
      >
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={[StyleSheet.absoluteFill, { borderRadius: colors.radius }]}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Feather name="film" size={28} color={colors.mutedForeground} />
          </View>
        )}

        {isLive && (
          <View style={[styles.liveBadge, { backgroundColor: colors.live }]}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}

        {releaseType === "online_only" && (
          <View style={[styles.streamBadge, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <Feather name="play-circle" size={10} color="#fff" />
            <Text style={styles.streamBadgeText}>Online</Text>
          </View>
        )}

        {releaseType === "hybrid" && (
          <View style={[styles.streamBadge, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <Feather name="layers" size={10} color="#fff" />
            <Text style={styles.streamBadgeText}>Hybrid</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <View style={styles.meta}>
          {language && (
            <Text style={[styles.tag, { color: colors.mutedForeground }]}>
              {language}
            </Text>
          )}
          <Text style={[styles.price, { color: colors.primary }]}>
            ₹{price}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  poster: {
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  streamBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  streamBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  info: {
    marginTop: 8,
    gap: 3,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  tag: {
    fontSize: 10,
    fontWeight: "500",
  },
  price: {
    fontSize: 11,
    fontWeight: "700",
  },
});
