import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
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
import { useTranslation } from "react-i18next";

import { useRewardedAdTokens } from "../../../helpers/hooks/useRewardedAdTokens";

const formatTokens = (value: number, locale: string) =>
  Number.isFinite(value) ? value.toLocaleString(locale) : String(value);

type TokenBadgeProps = {
  balance?: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  iconSize?: number;
  onBalanceChange?: (balance: number) => void;
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
    onBalanceChange,
  }: TokenBadgeProps) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { balance: storedBalance, isAdLoaded, showRewardedAd } = useRewardedAdTokens();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [pendingShowAfterClose, setPendingShowAfterClose] = useState(false);
    const { t, i18n } = useTranslation();

    const currentBalance = useMemo(
      () => (typeof balance === "number" ? balance : storedBalance),
      [balance, storedBalance],
    );

    useEffect(() => {
      onBalanceChange?.(currentBalance);
    }, [currentBalance, onBalanceChange]);

    const locale = i18n.language || "en";
    const formattedBalance = useMemo(
      () => formatTokens(currentBalance, locale),
      [currentBalance, locale],
    );

    const accessibilityLabelText = label
      ? t("ads.tokenBadge.accessibility.withLabel", {
          label,
          balance: formattedBalance,
        })
      : t("ads.tokenBadge.accessibility.balance", {
          balance: formattedBalance,
        });

    const menuStatusText = t(
      isAdLoaded ? "ads.tokenBadge.adReady" : "ads.tokenBadge.adLoading",
    );

    const openMenu = useCallback(() => {
      setIsMenuVisible(true);
    }, []);

    const closeMenu = useCallback(() => {
      setIsMenuVisible(false);
    }, []);

    const handleWatchAd = useCallback(() => {
      if (!isAdLoaded) {
        // просто игнорим клик или можешь тут показать тост
        return;
      }

      // 1) Закрываем модалку
      closeMenu();

      // 2) Ставим флаг, что после закрытия надо показать рекламу
      setPendingShowAfterClose(true);

      // 3) Через небольшой таймаут (особенно важно для iOS) вызываем показ
      const delay = Platform.OS === "ios" ? 350 : 0;
      setTimeout(() => {
        setPendingShowAfterClose(false);
        showRewardedAd();
      }, delay);
    }, [closeMenu, isAdLoaded, showRewardedAd]);

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
            <Text
              style={[styles.value, { color: theme.title }, valueStyle]}
              numberOfLines={1}
            >
              {formattedBalance}
            </Text>
          </View>
        </TouchableOpacity>

        <Modal
          transparent
          visible={isMenuVisible}
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <Pressable style={styles.menuBackdrop} onPress={closeMenu}>
            <Pressable
              style={styles.menuContainer}
              onPress={(event) => event.stopPropagation()}
              accessibilityLabel={t("ads.tokenBadge.menuAccessibility")}
            >
              <Text style={[styles.menuTitle, { color: theme.text }]}>
                {t("ads.tokenBadge.menuTitle")}
              </Text>
              <Text style={[styles.menuValue, { color: theme.title }]}>
                {formattedBalance}
              </Text>

              <TouchableOpacity
                style={[
                  styles.menuButton,
                  !isAdLoaded && styles.menuButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleWatchAd}
                disabled={!isAdLoaded || pendingShowAfterClose}
              >
                <MaterialIcons
                  name="ondemand-video"
                  size={20}
                  color={theme.primary}
                  style={styles.menuButtonIcon}
                />
                <View style={styles.menuButtonTextWrapper}>
                  <Text
                    style={[styles.menuButtonText, { color: theme.title }]}
                    numberOfLines={1}
                  >
                    {t("ads.tokenBadge.watchAd")}
                  </Text>
                  <Text
                    style={[styles.menuButtonSubtext, { color: theme.text }]}
                    numberOfLines={2}
                  >
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
      textAlign: "center",
    },
    menuValue: {
      fontSize: 28,
      fontWeight: "700",
      marginTop: 6,
      textAlign: "center",
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
      opacity: 0.5,
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
