import React, { memo, ReactNode } from "react";
import { StyleSheet, View, Text, ViewStyle, TextStyle } from "react-native";
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
  /** Стили к контейнеру и заголовку */
  style?: ViewStyle;
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
    style,
    titleStyle,
  } = props;

  const styles = getStyles(theme, isDark);

  const hasMenu = Array.isArray(items) && items.length > 0;
  const hasShare = typeof onShare === "function";
  const hasActions = hasMenu || hasShare;

  return (
    <View style={styles.header}>
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
      {hasActions ? (
        <View style={styles.sideSlotRight}>
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
        <View style={styles.sideSlotRight} />
      )}
    </View>

  );
});

AiAgentHeader.displayName = "AiAgentHeader";

const SIDE_SLOT_WIDTH = 44 + 8 + 44; // ширина под две иконки (кнопка + отступ + кнопка). Подстроите под себя.

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
    },
    sideSlotRight: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    center: {
      flex: 1, // 👈 центр занимает всё оставшееся пространство
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    headerTitle: {
      color: theme.title,
      marginLeft: -44, // ширина иконки
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      flexShrink: 1, // 👈 позволяет тексту сжиматься, а не вылазить
      flexWrap: 'wrap', // 👈 перенос длинных строк
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonSecondary: {
      marginLeft: 8,
    },
  });
