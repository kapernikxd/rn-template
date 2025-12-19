// src/screens/Library/components/LabeledInput.tsx
import React, { memo, useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "rn-vs-lb/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  rightPadding?: number;
  inputRef?: React.Ref<TextInput>;
  onFocus?: () => void;
  onBlur?: () => void;
};

export const LabeledInput = memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "sentences",
    rightPadding,
    inputRef,
    onFocus,
    onBlur,
  }: Props) => {
    const { theme, typography, sizes } = useTheme();

    const s = useMemo(
      () =>
        StyleSheet.create({
          label: { ...typography.body, color: theme.greyText, marginBottom: sizes.xs as number },
          input: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            paddingHorizontal: sizes.sm as number,
            paddingVertical: sizes.xs as number,
            color: theme.text,
            backgroundColor: theme.white,
            paddingRight: rightPadding ?? (sizes.sm as number),
          },
        }),
      [rightPadding, sizes.sm, sizes.xs, theme.border, theme.greyText, theme.text, theme.white, typography.body],
    );

    return (
      <View style={{ flex: 1 }}>
        <Text style={s.label}>{label}</Text>
        <TextInput
          ref={inputRef}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={theme.greyText}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    );
  },
);
LabeledInput.displayName = "LabeledInput";
