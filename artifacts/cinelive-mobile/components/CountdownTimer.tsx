import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface CountdownTimerProps {
  targetDate: string;
  onExpire?: () => void;
  large?: boolean;
}

function getTimeLeft(target: Date) {
  const now = Date.now();
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({ targetDate, onExpire, large = false }: CountdownTimerProps) {
  const colors = useColors();
  const target = useRef(new Date(targetDate));
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target.current));

  useEffect(() => {
    if (timeLeft.expired) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => {
      const tl = getTimeLeft(target.current);
      setTimeLeft(tl);
      if (tl.expired) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft.expired, onExpire]);

  if (timeLeft.expired) {
    return (
      <View style={[styles.expiredContainer, { backgroundColor: colors.primary }]}>
        <Text style={[styles.expiredText, { color: colors.primaryForeground }]}>
          LIVE NOW
        </Text>
      </View>
    );
  }

  const unitStyle = large ? styles.unitLarge : styles.unit;
  const labelStyle = large ? styles.labelLarge : styles.label;
  const digitStyle = [
    large ? styles.digitLarge : styles.digit,
    { color: large ? colors.primary : colors.foreground },
  ];

  return (
    <View style={styles.container}>
      {timeLeft.days > 0 && (
        <>
          <View style={unitStyle}>
            <Text style={digitStyle}>{pad(timeLeft.days)}</Text>
            <Text style={[labelStyle, { color: colors.mutedForeground }]}>days</Text>
          </View>
          <Text style={[styles.colon, { color: colors.mutedForeground }]}>:</Text>
        </>
      )}
      <View style={unitStyle}>
        <Text style={digitStyle}>{pad(timeLeft.hours)}</Text>
        <Text style={[labelStyle, { color: colors.mutedForeground }]}>hrs</Text>
      </View>
      <Text style={[styles.colon, { color: colors.mutedForeground }]}>:</Text>
      <View style={unitStyle}>
        <Text style={digitStyle}>{pad(timeLeft.minutes)}</Text>
        <Text style={[labelStyle, { color: colors.mutedForeground }]}>min</Text>
      </View>
      <Text style={[styles.colon, { color: colors.mutedForeground }]}>:</Text>
      <View style={unitStyle}>
        <Text style={digitStyle}>{pad(timeLeft.seconds)}</Text>
        <Text style={[labelStyle, { color: colors.mutedForeground }]}>sec</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  unit: {
    alignItems: "center",
    minWidth: 32,
  },
  unitLarge: {
    alignItems: "center",
    minWidth: 56,
  },
  digit: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  digitLarge: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  labelLarge: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  colon: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  expiredContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  expiredText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
