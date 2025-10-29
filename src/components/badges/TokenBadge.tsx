import React, { memo, useEffect, useMemo, useState } from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, ThemeType } from "rn-vs-lb/theme";

import { DEFAULT_TOKEN_BALANCE, getTokenBalance } from "../../helpers/tokenStorage";

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

    const [storedBalance, setStoredBalance] = useState(DEFAULT_TOKEN_BALANCE);

    const shouldLoadFromStorage = typeof balance !== "number";

    useEffect(() => {
      if (!shouldLoadFromStorage) {
        return;
      }

      let isMounted = true;

      getTokenBalance()
        .then((value) => {
          if (isMounted) {
            setStoredBalance(value);
          }
        })
        .catch((error) => {
          console.warn("Failed to load token balance", error);
        });

      return () => {
        isMounted = false;
      };
    }, [shouldLoadFromStorage]);

    const currentBalance = useMemo(
      () => (typeof balance === "number" ? balance : storedBalance),
      [balance, storedBalance],
    );

    const formattedBalance = useMemo(() => formatTokens(currentBalance), [currentBalance]);

    return (
      <View
        style={[styles.container, style]}
        accessibilityRole="text"
        accessibilityLabel={`${label}: ${formattedBalance}`}
      >
        <MaterialIcons
          name="diamond"
          size={iconSize}
          color={iconColor ?? theme.primary}
          style={styles.icon}
        />
        <View>
          {label && <Text style={[styles.label, labelStyle]} numberOfLines={1}>
            {label}
          </Text>}
          <Text style={[styles.value, { color: theme.title }, valueStyle]} numberOfLines={1}>
            {formattedBalance}
          </Text>
        </View>
      </View>
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
  });
