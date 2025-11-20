import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SIZES, ThemeType, useTheme } from 'rn-vs-lb/theme';

type ValueTone = 'default' | 'muted' | 'primary';

const VALUE_TONE_MAP: Record<ValueTone, 'valueDefault' | 'valueMuted' | 'valuePrimary'> = {
  default: 'valueDefault',
  muted: 'valueMuted',
  primary: 'valuePrimary',
};

export interface SettingsListItemProps {
  label: string;
  laberColor: string;
  description?: string;
  value?: string;
  valueTone?: ValueTone;
  valueStyle?: StyleProp<TextStyle>;
  accessory?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  isFirst?: boolean;
  isLast?: boolean;

  /** Иконка у лейбла: вариант 1 — готовый React-элемент */
  labelIcon?: React.ReactNode;
  /** Иконка у лейбла: вариант 2 — имя иконки из MaterialIcons */
  labelIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  /** Размер иконки у лейбла (если используется labelIconName) */
  labelIconSize?: number;
  /** Цвет иконки у лейбла (если используется labelIconName) */
  labelIconColor?: string;
  /** Позиция иконки относительно лейбла */
  labelIconPosition?: 'left' | 'right';
  /** Отступ между иконкой и текстом лейбла */
  labelIconGap?: number;
}

const SettingsListItem: React.FC<SettingsListItemProps> = ({
  label,
  laberColor,
  description,
  value,
  valueTone = 'default',
  valueStyle,
  accessory,
  onPress,
  showChevron,
  disabled,
  containerStyle,
  isFirst,
  isLast,
  labelIcon,
  labelIconName,
  labelIconSize,
  labelIconColor,
  labelIconPosition = 'left',
  labelIconGap,
}) => {
  const { theme, typography } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const renderLabelIcon = React.useCallback(() => {
    if (labelIcon) return <View style={{ marginRight: labelIconPosition === 'left' ? (labelIconGap ?? 12) : 0, marginLeft: labelIconPosition === 'right' ? (labelIconGap ?? 12) : 0 }}>{labelIcon}</View>;
    if (labelIconName) {
      return (
        <MaterialIcons
          name={labelIconName}
          size={labelIconSize ?? 18}
          color={labelIconColor ?? theme.placeholder}
        />
      );
    }
    return null;
  }, [labelIcon, labelIconName, labelIconSize, labelIconColor, labelIconPosition, labelIconGap, theme.placeholder]);

  const LabelBlock = (
    <View style={[styles.labelBlock, description ? styles.textWithDescription : null]}>
      <View style={styles.labelRow}>
        {labelIconPosition === 'left' && renderLabelIcon()}
        <Text style={[typography.titleH6Regular, styles.label, {color: laberColor} ]} numberOfLines={1} ellipsizeMode="tail">
          {label}
        </Text>
        {labelIconPosition === 'right' && renderLabelIcon()}
      </View>
      {description ? (
        <Text style={[styles.description, typography.bodySm]} numberOfLines={2} ellipsizeMode="tail">
          {description}
        </Text>
      ) : null}
    </View>
  );

  const content = (
    <View
      style={[
        styles.item,
        isFirst && styles.first,
        isLast && styles.last,
        disabled && styles.disabled,
        containerStyle,
      ]}
    >
      {LabelBlock}
      {value ? (
        <Text
          style={[
            styles.value,
            typography.titleH6Regular,
            styles[VALUE_TONE_MAP[valueTone]],
            valueStyle,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      ) : null}
      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
      {showChevron ? <MaterialIcons name="chevron-right" size={22} color={theme.placeholder} /> : null}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const getStyles = (theme: ThemeType) =>
  StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 0,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.background,
    },
    first: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    last: {
      borderBottomWidth: 0,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    disabled: {
      opacity: 0.5,
    },
    labelBlock: {
      flex: 1,
      minWidth: 0, // важно для ellipsizeMode в дочерних Text
    },
    textWithDescription: {
      justifyContent: 'center',
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 20,
    },
    label: {
      color: theme.title,
    },
    description: {
      marginTop: 4,
      color: theme.greyText,
    },
    value: {
      marginLeft: 16,
      color: theme.title,
      flexShrink: 0,
      maxWidth: '40%',
    },
    valueDefault: {
      color: theme.title,
    },
    valueMuted: {
      color: theme.placeholder,
    },
    valuePrimary: {
      color: theme.primary,
    },
    accessory: {
      marginLeft: 16,
    },
  });

export default SettingsListItem;
