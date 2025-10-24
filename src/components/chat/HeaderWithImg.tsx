import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/StoreProvider';

import { GlobalStyleSheetType, SizesType, ThemeType, useTheme, CommonStylesType } from 'rn-vs-lb/theme';
import ThreeDotsMenu, { type ThreeDotsMenuItem } from './ThreeDotsMenu';

export type HeaderActionItem = ThreeDotsMenuItem;

interface HeaderProps {
  imgUrl: string;
  title: string;
  onImgPress: () => void;
  onActionPress?: (() => void) | HeaderActionItem[];
  onBackPress: () => void;
  isGroupChat: boolean;
  users: any;
}

const HeaderWithImg: React.FC<HeaderProps> = observer(({ imgUrl, title, onImgPress, onActionPress, onBackPress, isGroupChat, users }) => {
  const { globalStyleSheet, theme, sizes, commonStyles, typography } = useTheme();
  const styles = getStyles({ globalStyleSheet, theme, sizes, commonStyles });
  const { onlineStore } = useRootStore();
  // Получаем ID пользователя
  const singleUser = users?.[0] ?? {};
  const userId = singleUser._id;

   // Реактивно следим за статусом пользователя
  //  const isUserOnline = () => onlineStore.onlineUsers?.some(onlineUser => onlineUser.userId === userId);
  const isUserOnline = () => onlineStore.getIsUserOnline(userId);

  const isTyping = onlineStore.getTypingUsers()?.some(typingUser => typingUser.userId === singleUser._id)
  const typingSomeUser: any = onlineStore.getTypingUsers()?.[0]

  const getStatus = (isOnline: boolean) => {
    return (
      <View style={globalStyleSheet.flexRowCenter}>
        <Text style={[typography.body, { fontStyle: 'italic' }]}>{isOnline ? "В сети" : "Не в сети"}</Text>
        <View style={[styles.status, isOnline ? styles.online : styles.offline]}></View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackPress}>
        <Ionicons name="arrow-back" size={25} color={theme.text} />
      </TouchableOpacity>
      <View style={styles.title}>
        <View style={globalStyleSheet.flexRowCenterBetween}>
          <TouchableOpacity style={globalStyleSheet.flexRowCenter} onPress={onImgPress}>
            <Image source={{ uri: imgUrl }} style={styles.photo} />
            <View style={{ flex: 1, maxWidth: '70%' }}>
              <Text
                style={typography.titleH6}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>

              {!isGroupChat
                ? <Text style={{ fontStyle: 'italic', color: theme.text }}>{isTyping ? "печатает..." : getStatus(isUserOnline())}</Text>
                : typingSomeUser ?
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontStyle: 'italic', color: theme.text, }}
                  >{typingSomeUser.userName}: печатает...</Text> : null
              }

            </View>
          </TouchableOpacity>
          <View style={globalStyleSheet.flexRowCenter}>
            {onActionPress
              ? Array.isArray(onActionPress)
                ? (
                  <ThreeDotsMenu items={onActionPress} triggerStyle={styles.actionButton} />
                )
                : (
                  <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
                    <Ionicons name='ellipsis-horizontal-sharp' size={20} color={theme.primary} />
                  </TouchableOpacity>
                )
              : null}
          </View>
        </View>
      </View>
    </View>
  );
});

const getStyles = ({ theme, sizes, globalStyleSheet, commonStyles}: {commonStyles:CommonStylesType, theme: ThemeType, sizes: SizesType, globalStyleSheet: GlobalStyleSheetType }) => StyleSheet.create({
  container: {
    ...globalStyleSheet.flexRowCenter,
    // ...commonStyles.backgroundDark,
    backgroundColor: theme.backgroundThird,
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.xs,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    marginLeft: 18,
  },
  photo: {
    ...commonStyles.avatarSm,
    marginRight: sizes.sm,
  },
  actionButton: {
    marginLeft: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  status: {
    width: 8,
    height: 8,
    borderRadius: 10,
    left: 4,
    top: -1,
  },
  online: {
    backgroundColor: theme.success,
  },
  offline: {
    backgroundColor: theme.danger,
  }
});

export default HeaderWithImg;
