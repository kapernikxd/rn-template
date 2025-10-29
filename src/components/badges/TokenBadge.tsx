import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, ThemeType } from "rn-vs-lb/theme";

import { useRewardedAdTokens } from "../../helpers/hooks/useRewardedAdTokens";

const formatTokens = (value: number) =>
  Number.isFinite(value) ? value.toLocaleString("ru-RU") : String(value);

type TokenBadgeProps = {
  /** Текущее количество токенов. Если не передано — загружается из AsyncStorage. */
  balance?: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  iconSize?: number;
};

export const TokenBadge = memo(
  ({
    balance,
    label,
    style,
    labelStyle,
    valueStyle,
    iconColor,
    iconSize = 18,
  }: TokenBadgeProps) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { balance: storedBalance, isAdLoaded, showRewardedAd } = useRewardedAdTokens();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const currentBalance = useMemo(
      () => (typeof balance === "number" ? balance : storedBalance),
      [balance, storedBalance],
    );

    const formattedBalance = useMemo(() => formatTokens(currentBalance), [currentBalance]);

    const accessibilityLabelText = label
      ? `${label}: ${formattedBalance}`
      : `Баланс токенов: ${formattedBalance}`;

    const menuStatusText = isAdLoaded
      ? "Реклама готова к показу"
      : "Реклама загружается...";

    const openMenu = useCallback(() => {
      setIsMenuVisible(true);
    }, []);

    const closeMenu = useCallback(() => {
      setIsMenuVisible(false);
    }, []);

    const handleWatchAd = useCallback(() => {
      closeMenu();
      showRewardedAd();
    }, [closeMenu, showRewardedAd]);

    return (
      <>
        <TouchableOpacity
          style={[styles.container, style]}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabelText}
          activeOpacity={0.8}
          onPress={openMenu}
        >
          <MaterialIcons
            name="diamond"
            size={iconSize}
            color={iconColor ?? theme.primary}
            style={styles.icon}
          />
          <View>
            {label && (
              <Text style={[styles.label, labelStyle]} numberOfLines={1}>
                {label}
              </Text>
            )}
            <Text style={[styles.value, { color: theme.title }, valueStyle]} numberOfLines={1}>
              {formattedBalance}
            </Text>
          </View>
        </TouchableOpacity>

        <Modal transparent visible={isMenuVisible} animationType="fade" onRequestClose={closeMenu}>
          <Pressable style={styles.menuBackdrop} onPress={closeMenu}>
            <Pressable
              style={styles.menuContainer}
              onPress={(event) => event.stopPropagation()}
              accessibilityLabel="Меню токенов"
            >
              <Text style={[styles.menuTitle, { color: theme.text }]}>Баланс токенов</Text>
              <Text style={[styles.menuValue, { color: theme.title }]}>{formattedBalance}</Text>

              <TouchableOpacity
                style={[styles.menuButton, !isAdLoaded && styles.menuButtonDisabled]}
                activeOpacity={0.85}
                onPress={handleWatchAd}
              >
                <MaterialIcons
                  name="ondemand-video"
                  size={20}
                  color={theme.primary}
                  style={styles.menuButtonIcon}
                />
                <View style={styles.menuButtonTextWrapper}>
                  <Text style={[styles.menuButtonText, { color: theme.title }]}>
                    Посмотреть рекламу
                  </Text>
                  <Text style={[styles.menuButtonSubtext, { color: theme.text }]}>
                    {menuStatusText}
                  </Text>
                </View>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  },
);

TokenBadge.displayName = "TokenBadge";

const getStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: theme.card,
    },
    icon: {
      marginRight: 6,
    },
    label: {
      color: theme.text,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    value: {
      fontSize: 16,
      fontWeight: "600",
    },
    menuBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    menuContainer: {
      width: "100%",
      maxWidth: 320,
      borderRadius: 20,
      backgroundColor: theme.white,
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    menuTitle: {
      fontSize: 13,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    menuValue: {
      fontSize: 28,
      fontWeight: "700",
      marginTop: 6,
    },
    menuButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: theme.card,
      marginTop: 20,
    },
    menuButtonDisabled: {
      opacity: 0.7,
    },
    menuButtonIcon: {
      marginRight: 12,
    },
    menuButtonTextWrapper: {
      flex: 1,
    },
    menuButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    menuButtonSubtext: {
      marginTop: 2,
      fontSize: 12,
    },
  });
