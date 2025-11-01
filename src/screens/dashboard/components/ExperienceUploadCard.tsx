import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "rn-vs-lb/theme";

export type ExperienceUploadCardProps = {
  onPress: () => void;
};

export const ExperienceUploadCard = ({ onPress }: ExperienceUploadCardProps) => {
  const { typography, sizes } = useTheme();

  return (
    <Pressable
      style={[styles.container, { padding: sizes.lg }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Upload photo"
    >
      <View style={styles.inner}>
        <View style={styles.iconWrapper}>
          <Feather name="image" size={32} color="rgba(255,255,255,0.72)" />
        </View>
        <Text style={[typography.bodyMd, styles.text]}>
          Tap here to upload the photo you want to bring to life!
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    color: "rgba(255,255,255,0.72)",
  },
});

export default ExperienceUploadCard;
