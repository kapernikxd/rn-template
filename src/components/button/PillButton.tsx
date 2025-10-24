// components/ui/PillButton.tsx
import React, { memo } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

type Size = 'md' | 'lg';
type Variant = 'filled' | 'outline';

export type PillButtonProps = PressableProps & {
  label: string;
  icon?: (opts: { color: string; size: number }) => React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  color?: string;
  glow?: boolean;
  iconRight?: boolean;
  /** показывает индикатор загрузки и блокирует нажатие */
  loading?: boolean;
  /** отключает кнопку */
  disabled?: boolean;
};

const HEIGHT: Record<Size, number> = { md: 48, lg: 64 };
const RADIUS: Record<Size, number> = { md: 16, lg: 24 };
const PADDING_H: Record<Size, number> = { md: 16, lg: 22 };
const GAP: Record<Size, number> = { md: 8, lg: 12 };
const ICON: Record<Size, number> = { md: 18, lg: 22 };
const FONT: Record<Size, number> = { md: 16, lg: 18 };

const glow = (c: string): ViewStyle => ({
  shadowColor: c,
  shadowOpacity: 0.6,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  ...(Platform.OS === 'android' ? { elevation: 10 } : null),
});

export const PillButton = memo<PillButtonProps>(({
  label,
  icon,
  variant = 'filled',
  size = 'lg',
  fullWidth = true,
  color = '#6f2da8',
  glow: needGlow = true,
  iconRight,
  style,
  loading = false,
  disabled = false,
  ...pressableProps
}) => {
  const height = HEIGHT[size];
  const radius = RADIUS[size];
  const gap = GAP[size];
  const iconSize = ICON[size];
  const fontSize = FONT[size];
  const isFilled = variant === 'filled';

  const bg = isFilled ? color : 'transparent';
  const border = isFilled ? 'transparent' : 'rgba(255,255,255,0.18)';
  const labelColor = isFilled ? '#ffffff' : 'rgba(255,255,255,0.92)';
  const iconColor = isFilled ? '#ffffff' : 'rgba(255,255,255,0.92)';

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      android_ripple={
        Platform.OS === 'android' && !isDisabled
          ? { color: isFilled ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)' }
          : undefined
      }
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: radius,
          paddingHorizontal: PADDING_H[size],
          backgroundColor: bg,
          borderColor: border,
          borderWidth: isFilled ? 0 : 1,
          opacity: isDisabled ? 0.6 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
          width: fullWidth ? '100%' : undefined,
        },
        isFilled && needGlow && !isDisabled ? glow(color) : null,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          color={labelColor}
          size={Platform.OS === 'ios' ? 'small' : 22}
        />
      ) : (
        <View
          style={[
            styles.row,
            { flexDirection: iconRight ? 'row-reverse' : 'row', gap },
          ]}
        >
          {icon?.({ color: iconColor, size: iconSize })}
          <Text
            numberOfLines={1}
            style={[styles.label, { color: labelColor, fontSize }]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  label: {
    fontWeight: '700',
    includeFontPadding: false,
  },
});
