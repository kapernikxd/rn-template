import React, { FC, useMemo } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';

import { getStyles } from './ChatItem.styles';

export type BaseChatItemProps = {
  unread?: number | string | null;
  onPress?: () => void;
  createdAt?: string;
  lastMessage?: string;
};

/** PERSON */
type PersonProps = BaseChatItemProps & {
  variant: 'person';
  senderFullName: string; // имя отправителя последнего сообщения
  imgUrl?: string; // аватар пользователя
  isUserOnline?: boolean; // статус онлайн
  chatName?: string; // подпись чата, если отличается от имени отправителя
};

/** GROUP */
type GroupProps = BaseChatItemProps & {
  variant: 'group';
  chatName: string; // имя чата
  senderFullName?: string; // кто отправил последнее сообщение
  imgUrl?: string; // общий аватар группы
};

/** BOT */
type BotProps = BaseChatItemProps & {
  variant: 'bot';
  chatName: string;
};

export type ChatItemProps = PersonProps | GroupProps | BotProps;

const formatUnread = (unread?: number | string | null) => {
  if (unread === null || unread === undefined) return '';
  if (typeof unread === 'number') {
    if (unread <= 0) return '';
    if (unread > 99) return '99+';
    return String(unread);
  }
  const trimmed = String(unread).trim();
  return trimmed.length > 0 ? trimmed : '';
};

export const ChatItem: FC<ChatItemProps> = (props) => {
  const { theme, typography } = useTheme();
  const styles = getStyles(theme);

  const handlePress = () => props.onPress?.();

  const unreadLabel = useMemo(() => formatUnread(props.unread), [props.unread]);

  // Общий заголовок (верхняя строка) + бейдж непрочитанного
  const renderHeader = (title: string) => (
    <View style={styles.senderContainer}>
      <Text numberOfLines={1} ellipsizeMode="tail" style={typography.titleH6}>
        {title}
      </Text>
      {unreadLabel ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unreadLabel}</Text>
        </View>
      ) : null}
    </View>
  );

  // Превью последнего сообщения (нижний блок)
  const renderLastMessage = () => {
    if (!props.lastMessage) return null;

    if (props.variant === 'person') {
      return (
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.senderName}>
          {props.senderFullName}: <Text style={styles.senderMessage}>{props.lastMessage}</Text>
        </Text>
      );
    }

    if (props.variant === 'group' && props.senderFullName) {
      return (
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.senderName}>
          {props.senderFullName}: <Text style={styles.senderMessage}>{props.lastMessage}</Text>
        </Text>
      );
    }

    // bot или group без senderFullName
    return (
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.senderName}>
        {props.lastMessage}
      </Text>
    );
  };

  // Левая часть: аватар/иконка
  const renderAvatar = () => {
    const wrapAvatar = (
      content: React.ReactNode,
      showStatus: boolean,
      isOnline: boolean = false,
    ) => (
      <View style={styles.avatarWrapper}>
        {content}
        {showStatus ? (
          <View style={[styles.status, isOnline ? styles.online : styles.offline]} />
        ) : null}
      </View>
    );

    if (props.variant === 'bot') {
      return wrapAvatar(
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialIcons name="smart-toy" size={32} color={theme.text} />
        </View>,
        false,
      );
    }

    const placeholderIcon = props.variant === 'group' ? 'groups' : 'person';

    const content = props.imgUrl ? (
      <Image source={{ uri: props.imgUrl }} style={styles.avatar} />
    ) : (
      <View style={[styles.avatar, styles.avatarPlaceholder]}>
        <MaterialIcons name={placeholderIcon as any} size={28} color={theme.text} />
      </View>
    );

    if (props.variant === 'person') {
      return wrapAvatar(content, true, Boolean(props.isUserOnline));
    }

    return wrapAvatar(content, false);
  };

  // Заголовок для каждой ветки
  const titleText =
    props.variant === 'person'
      ? props.chatName ?? props.senderFullName
      : props.chatName;

  return (
    <View style={styles.userContainer}>
      <TouchableOpacity onPress={handlePress} style={styles.profileSection}>
        {renderAvatar()}
        <View style={styles.userInfo}>
          {renderHeader(titleText)}

          <View style={styles.senderContainer}>{renderLastMessage()}</View>

          {props.createdAt ? (
            <Text style={styles.timeAgo}>{props.createdAt}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ChatItem;
