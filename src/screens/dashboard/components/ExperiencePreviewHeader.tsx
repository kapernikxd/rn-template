import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "rn-vs-lb/theme";

export type ExperiencePreviewHeaderProps = {
  image: ImageSourcePropType;
  title: string;
  description: string;
  onClose: () => void;
  topInset: number;
};

export const ExperiencePreviewHeader = ({
  image,
  title,
  description,
  onClose,
  topInset,
}: ExperiencePreviewHeaderProps) => {
  const { typography, sizes } = useTheme();

  return (
    <View style={styles.container}>
      <ImageBackground source={image} style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.9)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.header, { paddingTop: topInset + sizes.md, paddingHorizontal: sizes.lg }]}>        
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
            style={styles.closeButton}
            hitSlop={8}
          >
            <Feather name="x" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={[styles.textContainer, { paddingHorizontal: sizes.lg, paddingBottom: sizes.xl }]}>        
          <Text style={[typography.titleH2, styles.title]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[typography.bodyMd, styles.description]} numberOfLines={3}>
            {description}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  image: {
    height: 420,
    justifyContent: "space-between",
  },
  imageRadius: {
    resizeMode: "cover",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    alignItems: "flex-end",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    gap: 12,
  },
  title: {
    color: "#FFFFFF",
  },
  description: {
    color: "rgba(255,255,255,0.78)",
  },
});

export default ExperiencePreviewHeader;
