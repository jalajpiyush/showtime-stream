import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryTabs, ShowCategory } from "@/components/CategoryTabs";
import { ShowCard } from "@/components/ShowCard";
import { useColors } from "@/hooks/useColors";
import { useListShows } from "@workspace/api-client-react";

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ShowCategory>("all");
  const [query, setQuery] = useState("");

  const { data: shows, isLoading } = useListShows({
    showType: category === "all" ? "all" : category,
    category: "all",
  } as any);

  const filtered = useMemo(() => {
    if (!shows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return shows;
    return shows.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.genre ?? "").toLowerCase().includes(q) ||
        (s.language ?? "").toLowerCase().includes(q)
    );
  }, [shows, query]);

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
        <Text style={[styles.heading, { color: colors.foreground }]}>Browse</Text>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search movies, concerts..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Feather
              name="x"
              size={16}
              color={colors.mutedForeground}
              onPress={() => setQuery("")}
            />
          )}
        </View>
        <View style={styles.categoriesRow}>
          <CategoryTabs selected={category} onChange={setCategory} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Feather name="search" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {query ? `No results for "${query}"` : "No shows found"}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: 100 + bottomPad },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </Text>
          {filtered.map((show) => (
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
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categoriesRow: {
    marginHorizontal: -16,
  },
  list: {
    padding: 16,
    gap: 0,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
});
