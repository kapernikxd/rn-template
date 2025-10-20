import { StyleSheet } from 'react-native';
import type { ThemeType } from 'rn-vs-lb/theme';

export const getStyles = (theme: ThemeType) =>
  StyleSheet.create({
    userContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: theme.black,
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.backgroundSecond,
    },
    avatarWrapper: {
      marginRight: 16,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    status: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.card,
      right: 2,
      bottom: 2,
    },
    online: {
      backgroundColor: theme.success,
    },
    offline: {
      backgroundColor: theme.border,
    },
    userInfo: {
      flex: 1,
      gap: 6,
    },
    senderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    senderName: {
      flex: 1,
      color: theme.text,
      fontSize: 14,
    },
    senderMessage: {
      color: theme.title,
      fontWeight: '500',
    },
    unreadBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    unreadText: {
      color: theme.white,
      fontSize: 12,
      fontWeight: '600',
    },
    timeAgo: {
      color: theme.greyText,
      fontSize: 12,
    },
  });
