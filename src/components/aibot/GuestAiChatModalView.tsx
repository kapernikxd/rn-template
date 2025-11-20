import React, { FC, memo, RefObject, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeType, SizesType, TypographytType } from 'rn-vs-lb/theme';

export type PureChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type GuestAiChatViewProps = {
  visible: boolean;
  onClose: () => void;
  botName?: string;

  // данные
  messages: PureChatMessage[];
  inputValue: string;
  error: string | null;
  isSending: boolean;
  limit?: number;
  remaining?: number;
  defaultBotName: string;
  limitLabel: (remaining: number, limit: number) => string;
  inputPlaceholder: string;

  // экшены
  onChangeInput: (v: string) => void;
  onSend: () => void;

  // ссылки
  listRef: RefObject<FlatList<PureChatMessage> | null>;

  // тема
  theme: ThemeType;
  typography: TypographytType;
  sizes: SizesType;
};

const GuestAiChatModalView: FC<GuestAiChatViewProps> = memo(
  ({
    visible,
    onClose,
    botName,
    messages,
    inputValue,
    error,
    isSending,
    limit,
    remaining,
    defaultBotName,
    limitLabel,
    inputPlaceholder,
    onChangeInput,
    onSend,
    listRef,
    theme,
    typography,
    sizes,
  }) => {
    const isAndroid = Platform.OS === 'android';
    const styles = useMemo(() => getStyles(theme, isAndroid), [theme, isAndroid]);

    const disabled =
      isSending || !inputValue.trim() || (remaining !== undefined && remaining <= 0);

    const renderItem = ({ item }: { item: PureChatMessage }) => {
      const isUser = item.role === 'user';
      return (
        <View style={[styles.messageRow, isUser ? styles.rowEnd : styles.rowStart]}>
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
            <Text style={[typography.body, isUser ? styles.userText : styles.botText]}>
              {item.content}
            </Text>
          </View>
        </View>
      );
    };

    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={isAndroid ? 0 : 0}
          style={styles.centered}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <View>
                <Text style={typography.titleH6}>{botName || defaultBotName}</Text>
                {limit !== undefined && remaining !== undefined && (
                  <Text style={styles.limitText}>{limitLabel(remaining, limit)}</Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={sizes.md} color={theme.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={inputPlaceholder}
                placeholderTextColor={theme.greyText}
                value={inputValue}
                onChangeText={onChangeInput}
                editable={!isSending && (remaining === undefined || remaining > 0)}
                multiline
              />
              <TouchableOpacity
                onPress={onSend}
                style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
                disabled={disabled}
              >
                {isSending ? (
                  <ActivityIndicator color={theme.white} />
                ) : (
                  <Ionicons name="send" size={18} color={theme.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

const getStyles = (theme: ThemeType, isAndroid: boolean) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      backgroundColor: theme.backgroundSemiTransparent,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.white,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24 + (isAndroid ? 25 : 0),
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    limitText: {
      marginTop: 4,
      fontSize: 12,
      color: theme.greyText,
    },
    messagesContainer: {
      paddingBottom: 12,
    },
    messageRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    rowEnd: {
      justifyContent: 'flex-end',
    },
    rowStart: {
      justifyContent: 'flex-start',
    },
    messageBubble: {
      maxWidth: '85%',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    userBubble: {
      backgroundColor: theme.primary,
      borderBottomRightRadius: 2,
    },
    botBubble: {
      backgroundColor: theme.background,
      borderBottomLeftRadius: 2,
    },
    userText: {
      color: theme.white,
    },
    botText: {
      color: theme.text,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginTop: 8,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: theme.background,
      color: theme.text,
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      marginLeft: 8,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    errorText: {
      color: theme.danger || '#E53935',
      marginBottom: 4,
      fontSize: 12,
    },
  });

export default GuestAiChatModalView;
