import React from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { GlobalStyleSheetType, SizesType, ThemeType, useTheme, CommonStylesType } from 'rn-vs-lb/theme';

interface HeaderProps {
  onClosePress: () => void;
  onCopy: () => void;
  onEdit?: () => void;
  onReportMessage?: () => void;
  onDeleteMessage?: () => void;
  onPinToggle: () => void;
  isPinned: boolean;
}

export const HeaderEdit: React.FC<HeaderProps> = ({ onClosePress, onCopy, onEdit, onReportMessage, onDeleteMessage, onPinToggle, isPinned }) => {
  const { globalStyleSheet, theme, sizes, commonStyles } = useTheme();
  const styles = getStyles({ globalStyleSheet, theme, sizes, commonStyles });


  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation();
      }}
      style={styles.container}
    >
      <TouchableOpacity onPress={onClosePress}>
        <Ionicons name="close-outline" size={30} color={theme.text} />
      </TouchableOpacity>
      <View style={[styles.titleContainer]}>
        {onReportMessage && (
            <TouchableOpacity onPress={onReportMessage}>
                <Ionicons name="megaphone-outline" size={25} color={theme.red} />
            </TouchableOpacity>
        )}
        {onDeleteMessage && (
            <TouchableOpacity onPress={onDeleteMessage}>
                <Ionicons name="trash-outline" size={25} color={theme.red} />
            </TouchableOpacity>
        )}
        {onEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Ionicons name="create-outline" size={25} color={theme.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onPinToggle}>
          <Ionicons
            name={isPinned ? 'close-circle-outline' : 'pin-outline'}
            size={25}
            color={theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCopy}>
          <Ionicons name="copy-outline" size={25} color={theme.text} />
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={onReply}>
          <Ionicons name="arrow-redo-outline" size={25} color={theme.text} />
        </TouchableOpacity> */}
      </View>
    </Pressable>
  );
};

const getStyles = ({ theme, sizes, globalStyleSheet, commonStyles }: { commonStyles: CommonStylesType, theme: ThemeType, sizes: SizesType, globalStyleSheet: GlobalStyleSheetType }) => StyleSheet.create({
  container: {
    ...globalStyleSheet.flexRowCenterBetween,
    ...commonStyles.backgroundLight,
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.xs,
    height: 72,
    zIndex: 20, // 🟢 Поверх overlay
    position: 'relative', // важно
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  titleContainer: {
    marginRight: 14,
    gap: 22,
    ...globalStyleSheet.flexRowEnd,
  },
});