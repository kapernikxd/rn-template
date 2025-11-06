import React, { memo, ReactNode } from "react";
import { StyleSheet, View, Text, ViewStyle, TextStyle, StyleProp } from "react-native";
import { ThemeType } from "rn-vs-lb/theme";
import { ThreeDotsMenu } from "rn-vs-lb";

import { BackButton, ShareIconButton } from "../buttons";

type AiAgentHeaderProps = {
  theme: ThemeType;
  onBack: () => void;
  /** Опционально: кнопка «Поделиться». Если не передан — не показываем */
  onShare?: () => void;
  /** Пункты для меню. Если пусто/undefined — меню не показываем */
  items?: any[]; // или ваш тип
  menuPositionLeft?: number;
  menuPositionTop?: number;
  isDark?: boolean;

  /** Заголовок по центру */
  title?: string;
  /** Кастомный рендер заголовка (если нужен сложный JSX) */
  renderTitle?: ReactNode;
  /** Контент справа от заголовка (например, баланс токенов) */
  renderRight?: ReactNode;
  /** Стили к контейнеру и заголовку */
  style?: StyleProp<ViewStyle>;
  titleStyle?: TextStyle;
};

export const AiAgentHeader = memo((props: AiAgentHeaderProps) => {
  const {
    theme,
    onBack,
    onShare,
    items,
    menuPositionLeft = 210,
    menuPositionTop = 10,
    isDark = false,
    title,
    renderTitle,
    renderRight,
    style,
    titleStyle,
  } = props;

  const styles = getStyles(theme, isDark);

  const hasMenu = Array.isArray(items) && items.length > 0;
  const hasShare = typeof onShare === "function";
  const hasActions = hasMenu || hasShare;
  const hasRightContent = Boolean(renderRight) || hasActions;

  return (
    <View style={[styles.header, style]}>
      {/* Левая кнопка */}
      <View style={styles.sideSlotLeft}>
        <BackButton onPress={onBack} style={styles.iconButton} iconColor={theme.title} />
      </View>

      {/* Центр — заголовок */}
      <View style={styles.center}>
        {renderTitle ? (
          renderTitle
        ) : (
          title && <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
        )}
      </View>

      {/* Правая зона (может быть пустой) */}
      {hasRightContent ? (
        <View style={styles.sideSlotRight}>
          {renderRight ? (
            <View style={[styles.rightAddon, hasActions && styles.rightAddonWithActions]}>
              {renderRight}
            </View>
          ) : null}
          {hasShare && (
            <ShareIconButton
              onPress={onShare!}
              style={[styles.iconButton, styles.iconButtonSecondary]}
              iconColor={theme.title}
            />
          )}
          {hasMenu && (
            <ThreeDotsMenu
              positionLeft={menuPositionLeft}
              positionTop={menuPositionTop}
              iconColor={theme.black}
              style={[styles.iconButton, styles.iconButtonSecondary]}
              items={items}
            />
          )}
        </View>
      ) : (
        null
        // <View style={[styles.sideSlotRight, styles.sideSlotRightPlaceholder]} />
      )}
    </View>

  );
});

AiAgentHeader.displayName = "AiAgentHeader";

const LEFT_ICON_WIDTH = 44;
const RIGHT_SLOT_MIN_WIDTH = LEFT_ICON_WIDTH + 8 + LEFT_ICON_WIDTH; // ширина под две иконки (кнопка + отступ + кнопка)

const getStyles = (theme: ThemeType, isDark: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      marginTop: 12,
    },
    sideSlotLeft: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: LEFT_ICON_WIDTH,
    },
    sideSlotRight: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: RIGHT_SLOT_MIN_WIDTH,
    },
    sideSlotRightPlaceholder: {
      width: RIGHT_SLOT_MIN_WIDTH,
    },
    center: {
      flex: 1, // 👈 центр занимает всё оставшееся пространство
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    headerTitle: {
      color: theme.title,
      marginLeft: -LEFT_ICON_WIDTH, // ширина иконки
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      flexShrink: 1, // 👈 позволяет тексту сжиматься, а не вылазить
      flexWrap: 'wrap', // 👈 перенос длинных строк
    },
    iconButton: {
      width: LEFT_ICON_WIDTH,
      height: LEFT_ICON_WIDTH,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonSecondary: {
      marginLeft: 8,
    },
    rightAddon: {
      flexShrink: 0,
    },
    rightAddonWithActions: {
      marginRight: 8,
    },
  });
