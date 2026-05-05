import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CountdownTimer } from "@/components/CountdownTimer";
import { useTickets } from "@/context/TicketsContext";
import { useColors } from "@/hooks/useColors";
import { useGetShow, useGetChatMessages } from "@workspace/api-client-react";

interface LocalChatMessage {
  id: string;
  displayName: string;
  message: string;
  sentAt: string;
  isLocal?: boolean;
}

const FAKE_VIEWERS = ["Rahul", "Priya", "Aditya", "Sneha", "Karan", "Ananya", "Vikram"];
const FAKE_MSGS = [
  "🔥🔥🔥", "Wow amazing!", "This is so good!", "Can't believe it!",
  "Best scene ever", "❤️❤️", "Loving this", "Mind blown 🤯",
  "So emotional", "This is epic!", "Bahut badiya!", "Incredible!",
];

function randomFakeMsg(): LocalChatMessage {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    displayName: FAKE_VIEWERS[Math.floor(Math.random() * FAKE_VIEWERS.length)],
    message: FAKE_MSGS[Math.floor(Math.random() * FAKE_MSGS.length)],
    sentAt: new Date().toISOString(),
  };
}

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasTicket } = useTickets();
  const [playing, setPlaying] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [localMessages, setLocalMessages] = useState<LocalChatMessage[]>([]);
  const chatRef = useRef<FlatList>(null);

  const { data: show, isLoading } = useGetShow(Number(id));
  const { data: apiMessages } = useGetChatMessages(Number(id), { limit: 20 } as any);

  const owned = show ? hasTicket(show.id) : false;
  const isUpcoming = show?.category === "upcoming";
  const isOnline = show && (show.releaseType === "online_only" || show.releaseType === "hybrid");

  const allMessages: LocalChatMessage[] = [
    ...((apiMessages ?? []).map((m) => ({
      id: m.id.toString(),
      displayName: m.displayName,
      message: m.message,
      sentAt: m.sentAt,
    }))),
    ...localMessages,
  ].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  useEffect(() => {
    if (!show?.isLive && !playing) return;
    const interval = setInterval(() => {
      setLocalMessages((prev) => [randomFakeMsg(), ...prev].slice(0, 50));
    }, 2500 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [show?.isLive, playing]);

  const sendMessage = useCallback(() => {
    const msg = chatInput.trim();
    if (!msg) return;
    setLocalMessages((prev) => [
      {
        id: Date.now().toString(),
        displayName: "You",
        message: msg,
        sentAt: new Date().toISOString(),
        isLocal: true,
      },
      ...prev,
    ]);
    setChatInput("");
  }, [chatInput]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!show) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Show not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!owned || !isOnline) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.foreground }]}>
          {!owned ? "Purchase a ticket to watch" : "This show is theatre-only"}
        </Text>
        <Pressable
          style={[styles.backBtn2, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtn2Text}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <View style={styles.videoSection}>
        {show.thumbnailUrl ? (
          <Image
            source={{ uri: show.thumbnailUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.videoTop, { paddingTop: topPad + 4 }]}>
          <Pressable
            style={[styles.videoBackBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.videoTitle} numberOfLines={1}>
            {show.title}
          </Text>
          {show.isLive && (
            <View style={[styles.livePill, { backgroundColor: colors.primary }]}>
              <View style={styles.liveDotW} />
              <Text style={styles.livePillText}>LIVE</Text>
            </View>
          )}
        </View>

        <View style={styles.videoCenter}>
          {isUpcoming && show.startTime ? (
            <View style={styles.countdownWrapper}>
              <Text style={styles.countdownLabel}>STARTS IN</Text>
              <CountdownTimer targetDate={show.startTime} large />
            </View>
          ) : (
            <Pressable
              style={[
                styles.playBtn,
                { backgroundColor: playing ? "rgba(0,0,0,0.4)" : colors.primary },
              ]}
              onPress={() => setPlaying((p) => !p)}
            >
              <Feather
                name={playing ? "pause" : "play"}
                size={32}
                color="#fff"
              />
            </Pressable>
          )}
        </View>

        <View style={styles.videoBottom}>
          {playing && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
            </View>
          )}
          {playing && (
            <Text style={styles.streamingText}>
              Streaming · HD · {allMessages.length + 1240} watching
            </Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatSection}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.chatHeader, { borderBottomColor: colors.border }]}>
          <Feather name="message-circle" size={14} color={colors.mutedForeground} />
          <Text style={[styles.chatHeaderText, { color: colors.mutedForeground }]}>
            Live Chat
          </Text>
          <View style={[styles.liveCount, { backgroundColor: colors.accent }]}>
            <Text style={[styles.liveCountText, { color: colors.mutedForeground }]}>
              {allMessages.length + 1240} viewers
            </Text>
          </View>
        </View>

        <FlatList
          ref={chatRef}
          data={allMessages}
          keyExtractor={(item) => item.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatList}
          renderItem={({ item }) => (
            <View style={styles.chatMsgRow}>
              <Text
                style={[
                  styles.chatName,
                  { color: item.isLocal ? colors.primary : colors.mutedForeground },
                ]}
              >
                {item.displayName}
              </Text>
              <Text style={[styles.chatMsg, { color: colors.foreground }]}>
                {item.message}
              </Text>
            </View>
          )}
        />

        <View
          style={[
            styles.chatInputRow,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: bottomPad + 8,
            },
          ]}
        >
          <TextInput
            style={[
              styles.chatInput,
              {
                backgroundColor: colors.muted,
                color: colors.foreground,
                borderRadius: 20,
              },
            ]}
            placeholder="Send a message..."
            placeholderTextColor={colors.mutedForeground}
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <Pressable
            style={[
              styles.sendBtn,
              { backgroundColor: chatInput.trim() ? colors.primary : colors.muted },
            ]}
            onPress={sendMessage}
          >
            <Feather name="send" size={16} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  errorText: { fontSize: 16, fontWeight: "500" },
  backLink: { fontSize: 14, fontWeight: "600" },
  backBtn2: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  backBtn2Text: { color: "#fff", fontSize: 15, fontWeight: "700" },
  videoSection: {
    height: 240,
    position: "relative",
    backgroundColor: "#111",
    justifyContent: "space-between",
  },
  videoTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  videoBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  videoTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDotW: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  livePillText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  videoCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownWrapper: { alignItems: "center", gap: 8 },
  countdownLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  videoBottom: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    width: "35%",
    height: "100%",
    borderRadius: 2,
  },
  streamingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "500",
  },
  chatSection: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
  },
  chatHeaderText: { fontSize: 13, fontWeight: "600", flex: 1 },
  liveCount: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveCountText: { fontSize: 10, fontWeight: "600" },
  chatList: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  chatMsgRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    flexWrap: "wrap",
  },
  chatName: { fontSize: 12, fontWeight: "700" },
  chatMsg: { fontSize: 13, flex: 1 },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
});
