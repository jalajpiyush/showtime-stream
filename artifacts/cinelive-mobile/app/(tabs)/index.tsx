import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryTabs, ShowCategory } from "@/components/CategoryTabs";
import { MovieCard } from "@/components/MovieCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ShowCard } from "@/components/ShowCard";
import { SkeletonRow } from "@/components/SkeletonCard";
import { useColors } from "@/hooks/useColors";
import { useListShows } from "@workspace/api-client-react";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [category, setCategory] = useState<ShowCategory>("all");

  const { data: allShows, isLoading } = useListShows({
    showType: category === "all" ? "all" : category,
    category: "all",
  } as any);

  const { data: featuredShows } = useListShows({ category: "all" } as any);

  const nowShowing = (allShows ?? []).filter((s) => s.category === "now_showing");
  const upcoming = (allShows ?? []).filter((s) => s.category === "upcoming");
  const featured = (featuredShows ?? []).filter((s) => s.isFeatured).slice(0, 3);
  const featuredShow = featured[0];

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 100 + bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {featuredShow ? (
        <Pressable
          style={styles.hero}
          onPress={() => router.push(`/show/${featuredShow.id}`)}
        >
          {featuredShow.thumbnailUrl ? (
            <Image
              source={{ uri: featuredShow.thumbnailUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]}
            />
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroTop, { paddingTop: topPad + 8 }]}>
            <Text style={styles.logoText}>CINE<Text style={{ color: colors.primary }}>LIVE</Text></Text>
          </View>
          <View style={styles.heroBottom}>
            {featuredShow.isLive && (
              <View style={[styles.liveChip, { backgroundColor: colors.primary }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveChipText}>LIVE</Text>
              </View>
            )}
            <Text style={styles.heroTitle} numberOfLines={2}>
              {featuredShow.title}
            </Text>
            <Text style={styles.heroDesc} numberOfLines={2}>
              {featuredShow.description}
            </Text>
            <View style={styles.heroActions}>
              <Pressable
                style={[styles.watchBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/show/${featuredShow.id}`)}
              >
                <Feather name="play" size={14} color="#fff" />
                <Text style={styles.watchBtnText}>View Details</Text>
              </Pressable>
              <View style={[styles.priceChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                <Text style={styles.priceChipText}>₹{featuredShow.price}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      ) : (
        <View style={[styles.heroSkeleton, { backgroundColor: colors.card, paddingTop: topPad + 8 }]}>
          <Text style={styles.logoText}>CINE<Text style={{ color: colors.primary }}>LIVE</Text></Text>
          {isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}
        </View>
      )}

      <View style={styles.categoryRow}>
        <CategoryTabs selected={category} onChange={setCategory} />
      </View>

      {isLoading ? (
        <>
          <SectionHeader title="Now Showing" />
          <SkeletonRow />
        </>
      ) : (
        <>
          {nowShowing.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Now Showing"
                onSeeAll={() => router.push("/(tabs)/browse")}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {nowShowing.map((show) => (
                  <MovieCard
                    key={show.id}
                    id={show.id}
                    title={show.title}
                    thumbnailUrl={show.thumbnailUrl}
                    price={show.price}
                    genre={show.genre}
                    language={show.language}
                    releaseType={show.releaseType}
                    isLive={show.isLive}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {upcoming.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Coming Soon" />
              <View style={styles.verticalList}>
                {upcoming.slice(0, 5).map((show) => (
                  <ShowCard
                    key={show.id}
                    id={show.id}
                    title={show.title}
                    description={show.description}
                    thumbnailUrl={show.thumbnailUrl}
                    price={show.price}
                    showType={show.showType}
                    genre={show.genre}
                    language={show.language}
                    releaseType={show.releaseType}
                    isLive={show.isLive}
                    startTime={show.startTime}
                  />
                ))}
              </View>
            </View>
          )}

          {nowShowing.length === 0 && upcoming.length === 0 && (
            <View style={styles.empty}>
              <Feather name="film" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No shows found
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  hero: {
    height: 460,
    justifyContent: "space-between",
  },
  heroSkeleton: {
    height: 460,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  heroTop: {
    paddingHorizontal: 16,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  heroBottom: {
    padding: 20,
    gap: 8,
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveChipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
  },
  heroDesc: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    lineHeight: 18,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  watchBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  priceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  priceChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  categoryRow: {
    marginTop: 20,
    marginBottom: 4,
  },
  section: {
    marginTop: 24,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  verticalList: {
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
