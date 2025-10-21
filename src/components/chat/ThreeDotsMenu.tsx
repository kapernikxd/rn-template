import React, { useRef, useState } from 'react';
import {
  LayoutRectangle,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type ThemeType } from 'rn-vs-lb/theme';

import type { IoniconsProps } from '../../types/Icon';

export type ThreeDotsMenuItem = {
  label: string;
  icon?: IoniconsProps;
  colorIcon?: string;
  onPress: () => void;
};

type Props = {
  items: ThreeDotsMenuItem[];
  triggerStyle?: StyleProp<ViewStyle>;
};

const MENU_WIDTH = 200;

export const ThreeDotsMenu: React.FC<Props> = ({ items, triggerStyle }) => {
  const { theme, typography, globalStyleSheet } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [position, setPosition] = useState<LayoutRectangle | null>(null);
  const buttonRef = useRef<View | null>(null);
  const styles = getStyles(theme);

  const openMenu = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setPosition({ x: pageX, y: pageY, width, height });
      setMenuVisible(true);
    });
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  if (!items.length) {
    return null;
  }

  return (
    <View>
      <TouchableOpacity ref={buttonRef as any} onPress={openMenu} style={triggerStyle}>
        <Ionicons name="ellipsis-horizontal-sharp" size={20} color={theme.primary} />
      </TouchableOpacity>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          {position && (
            <Pressable
              onPress={event => event.stopPropagation()}
              style={[
                styles.dropdown,
                {
                  top: position.y + position.height + 4,
                  left: Math.max(position.x + position.width - MENU_WIDTH, 12),
                  width: MENU_WIDTH,
                },
              ]}
            >
              {items.map((item, index) => (
                <TouchableOpacity
                  key={`${item.label}-${index}`}
                  style={[
                    styles.menuItem,
                    globalStyleSheet.flexRowCenterStart,
                    index === items.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() => {
                    closeMenu();
                    item.onPress();
                  }}
                >
                  {item.icon && (
                    <Ionicons
                      style={styles.icon}
                      size={19}
                      name={item.icon}
                      color={item.colorIcon || theme.primary}
                    />
                  )}
                  <Text
                    style={[
                      typography.titleH6Regular,
                      styles.label,
                      { color: item.colorIcon || theme.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

const getStyles = (theme: ThemeType) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    dropdown: {
      position: 'absolute',
      backgroundColor: theme.white,
      borderRadius: 12,
      elevation: 8,
      shadowColor: theme.black,
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      paddingVertical: 8,
      minWidth: MENU_WIDTH,
    },
    menuItem: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderBottomColor: theme.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    icon: {
      marginRight: 12,
    },
    label: {
      flexShrink: 1,
    },
  });

export default ThreeDotsMenu;
