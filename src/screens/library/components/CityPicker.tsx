// src/screens/Library/components/CityPicker.tsx
import React, { memo, useCallback, useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "rn-vs-lb/theme";
import type { CitySearchItem } from "../../../types/citySearch";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSelect: (city: CitySearchItem) => void;
  onClear: () => void;

  isFocused: boolean;
  setFocused: (v: boolean) => void;
  isSelected: boolean;
  setSelected: (v: boolean) => void;

  inputRef: React.RefObject<TextInput>;

  suggestions: CitySearchItem[];
  isLoading: boolean;
  error: unknown;
  label: string;
  placeholder: string;
  errorText: string;
};

export const CityPicker = memo(
  ({
    value,
    onChange,
    onSelect,
    onClear,
    isFocused,
    setFocused,
    isSelected,
    setSelected,
    inputRef,
    suggestions,
    isLoading,
    error,
    label,
    placeholder,
    errorText,
  }: Props) => {
    const { theme, typography, sizes } = useTheme();

    const s = useMemo(
      () =>
        StyleSheet.create({
          wrapper: { flex: 1 },
          label: { ...typography.body, color: theme.greyText, marginBottom: sizes.xs as number },
          cityInputWrapper: { position: "relative" },
          input: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            paddingHorizontal: sizes.sm as number,
            paddingVertical: sizes.xs as number,
            color: theme.text,
            backgroundColor: theme.white,
            paddingRight: value.trim().length > 0 ? 44 : (sizes.sm as number),
          },
          clearButton: {
            position: "absolute",
            right: 3,
            top: 4,
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
          },
          clearButtonText: { fontSize: 18, lineHeight: 18, color: theme.greyText },

          suggestionsWrapper: { marginTop: -12, position: "relative", zIndex: 5 },
          suggestionsContainer: {
            backgroundColor: theme.white,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 12,
            paddingVertical: sizes.xs as number,
            paddingHorizontal: sizes.xs as number,
            position: "absolute",
            top: sizes.sm as number,
            left: 0,
            right: 0,
            maxHeight: 220,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          },
          suggestionsContent: { rowGap: sizes.xs as number },
          suggestionItem: {
            paddingHorizontal: sizes.sm as number,
            paddingVertical: sizes.xs as number,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: theme.border,
          },
          suggestionCity: { ...typography.body, color: theme.text },
          suggestionCountry: { ...typography.body, color: theme.greyText },

          errorText: { ...typography.body, marginTop: sizes.xs as number },
        }),
      [
        sizes.sm,
        sizes.xs,
        theme.border,
        theme.danger,
        theme.greyText,
        theme.text,
        theme.white,
        typography.body,
        typography.body,
        value,
      ],
    );

    const showSuggestions =
      isFocused &&
      !isSelected &&
      value.trim().length > 0 &&
      !isLoading &&
      !error &&
      suggestions.length > 0;

    const handleChange = useCallback(
      (text: string) => {
        onChange(text);
        setSelected(false);
      },
      [onChange, setSelected],
    );

    return (
      <View style={s.wrapper}>
        <Text style={s.label}>{label}</Text>

        <View style={s.cityInputWrapper}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            style={s.input}
            placeholder={placeholder}
            placeholderTextColor={theme.greyText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {value.trim().length > 0 ? (
            <TouchableOpacity
              style={s.clearButton}
              onPress={onClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={s.clearButtonText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={s.suggestionsWrapper}>
          {isLoading && isFocused && !isSelected && value.trim().length > 0 ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : null}

          {error && isFocused ? <Text style={s.errorText}>{errorText}</Text> : null}

          {showSuggestions ? (
            <View style={s.suggestionsContainer}>
              <ScrollView nestedScrollEnabled contentContainerStyle={s.suggestionsContent}>
                {suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion._id}
                    style={s.suggestionItem}
                    onPress={() => {
                      onSelect(suggestion);
                      setSelected(true);
                      setFocused(false);
                    }}
                  >
                    <Text style={s.suggestionCity}>{suggestion.city}</Text>
                    <Text style={s.suggestionCountry}>{suggestion.country}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>
    );
  },
);
CityPicker.displayName = "CityPicker";
