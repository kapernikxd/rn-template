import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Keyboard,
  ImageBackground,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen, InputMessage, PinnedMessagesBar, HeaderSwitcher } from 'rn-vs-lb';
import { useTheme, type ThemeType, type SizesType, type CommonStylesType } from 'rn-vs-lb/theme';
import HeaderWithImg, { type HeaderActionItem } from '../../components/chat/HeaderWithImg';
import { usePortalNavigation } from '../../helpers/hooks';
import { getSmartTime } from '../../helpers/utils/date';
import type { MessageDTOExtented } from '../../types';
import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import { useChatMessages } from '../../helpers/hooks/Chats/useChatMessages';
import MessageItemWithPreview from '../../components/chat/MessageItemWithPreview';
import { HeaderEdit } from '../../components/chat/HeaderEdit';

const chatBackground = require('../../assets/chat-background.png');

export const ChatMessagesScreen: FC = observer(() => {
  const { theme, sizes, commonStyles, globalStyleSheet, typography } = useTheme();
  const { setColors } = useSafeAreaColors();
  const styles = getStyles({ theme, sizes, commonStyles });

  const { goBack } = usePortalNavigation();

  const {
    // refs
    flatListRef,
    // flags
    isLoading,
    refreshing,
    editMode,
    isGroupChat,
    hasPinnedMessages,
    // ids
    myId,
    lastReadMessageIdOpponent,
    // data
    users,
    chatTitle,
    chatImg,
    groupedMessages,
    pinnedMessages,
    selectedMessage,
    inputMessage,
    // setters
    setInputMessage,
    setSelectedMessage,
    // handlers
    onRefresh,
    loadMoreMessages,
    handleSubmitFromInput,
    handleTypingStart,
    handleTypingStop,
    handlePinnedMessagePress,
    handleUnpinMessage,
    toggleMode,
    exitEditMode,
    pickImages,
    handleDownloadImage,
    handleShareImage,
    actions,
  } = useChatMessages();

  useEffect(() => {
    setColors({
      topColor: theme.backgroundThird,
      bottomColor: theme.white,
    });
  }, [theme, setColors]);

  const headerActions = useMemo<HeaderActionItem[]>(
    () => [
      {
        label: 'Clear chat history',
        icon: 'trash-outline',
        colorIcon: theme.danger,
        onPress: () => {
          void actions.clearChatHistory();
        },
      },
    ],
    [actions.clearChatHistory, theme.danger]
  );

  const renderMessageItem = useCallback(
    ({ item }: { item: MessageDTOExtented }) => {
      const isMyMessage = item.sender?._id === myId;
      const isRead = (isMyMessage && lastReadMessageIdOpponent && lastReadMessageIdOpponent >= item._id) || false;

      return (
        <MessageItemWithPreview
          item={item}
          myId={myId!}
          timeText={getSmartTime(item.createdAt)}
          isGroupChat={isGroupChat}
          isReadByOpponent={isRead}
          isSelected={selectedMessage?.actionType === 'select' && selectedMessage._id === item._id}
          onLongPress={() => {
            setSelectedMessage({ ...item, actionType: 'select' });
            toggleMode();
          }}
          onDownloadImage={handleDownloadImage}
          onShareImage={handleShareImage}
        />
      );
    },
    [
      handleDownloadImage,
      handleShareImage,
      isGroupChat,
      lastReadMessageIdOpponent,
      myId,
      selectedMessage,
      setSelectedMessage,
      toggleMode,
    ]
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundThird }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={styles.container}>
          <HeaderSwitcher
            isFirst={editMode}
            componentA={
              <HeaderEdit
                onClosePress={exitEditMode}
                onReportMessage={selectedMessage && selectedMessage.sender._id !== myId ? actions.reportSelected : undefined}
                onDeleteMessage={selectedMessage && selectedMessage.sender._id === myId ? actions.deleteSelected : undefined}
                onCopy={actions.copySelected}
                onEdit={selectedMessage && selectedMessage.sender._id === myId ? actions.startEditSelected : undefined}
                onPinToggle={actions.togglePinSelected}
                isPinned={selectedMessage ? Boolean(selectedMessage && selectedMessage._id && selectedMessage._id === selectedMessage._id && true && !!selectedMessage && selectedMessage._id && /* no-op; hook сам считает */ false) : false}
              />
            }
            componentB={
              <HeaderWithImg
                users={users}
                isGroupChat={isGroupChat}
                onBackPress={goBack}
                onImgPress={() => { }}
                onActionPress={headerActions}
                title={chatTitle}
                imgUrl={chatImg}
              />
            }
          />

          <ImageBackground source={chatBackground} style={styles.background}>
            {hasPinnedMessages ? (
              <View style={styles.pinnedWrapper}>
                <PinnedMessagesBar
                  pinnedMessages={pinnedMessages}
                  onUnpin={handleUnpinMessage}
                  onPress={handlePinnedMessagePress}
                  isGroupChat={isGroupChat}
                  myId={myId!}
                  lastReadMessageIdOpponent={lastReadMessageIdOpponent}
                />
              </View>
            ) : null}

            <FlatList
              keyboardShouldPersistTaps="handled"
              ref={flatListRef}
              data={groupedMessages as any}
              keyExtractor={(item, index) => (item._id ? item._id?.toString() : `index-${index}`)}
              renderItem={renderMessageItem}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              removeClippedSubviews
              windowSize={5}
              contentContainerStyle={styles.messagesListContent}
              onEndReached={loadMoreMessages}
              refreshControl={
                <RefreshControl
                  onRefresh={onRefresh}
                  refreshing={refreshing}
                  colors={[theme.primary]}
                  tintColor={theme.primary}
                />
              }
              inverted
              onTouchStart={Keyboard.dismiss}
            />
          </ImageBackground>

          {editMode && (
            <Pressable onPress={exitEditMode} style={[StyleSheet.absoluteFill, { zIndex: 10 }]} />
          )}

          {editMode && (
            <View style={styles.replyBar}>
              <TouchableOpacity onPress={actions.setReplyMode} style={[globalStyleSheet.flexRowCenterStart, { gap: 8 }]}>
                <Ionicons name="arrow-undo-outline" size={25} color={theme.text} />
                <Text style={[typography.body, { top: 3 }]}>Reply</Text>
              </TouchableOpacity>
            </View>
          )}

          <View>
            <InputMessage
              value={inputMessage}
              onChange={setInputMessage}
              onSubmit={handleSubmitFromInput}
              replyToMessage={
                selectedMessage?.actionType === 'reply'
                  ? selectedMessage?.content
                    ? { content: selectedMessage.content }
                    : selectedMessage?.attachments?.length
                      ? { attachments: selectedMessage.attachments }
                      : null
                  : null
              }
              onCancelReply={() => setSelectedMessage(null)}
              editMessage={
                selectedMessage?.actionType === 'edit'
                  ? selectedMessage?.content
                    ? { content: selectedMessage?.content ?? 'photo' }
                    : null
                  : null
              }
              onCancelEdit={() => {
                setSelectedMessage(null);
                setInputMessage('');
              }}
              maxImages={1}
              onAttachPress={async () => {
                const picked = await pickImages(1);
                return picked;
              }}
              onMaxImagesExceeded={(max) => {/* показывай snackbar из хука при желании */ }}
              onTyping={handleTypingStart}
              onStopTyping={handleTypingStop}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
});

const getStyles = ({ theme, sizes, commonStyles }: { theme: ThemeType; sizes: SizesType; commonStyles: CommonStylesType }) =>
  StyleSheet.create({
    background: { flex: 1, resizeMode: 'cover' },
    container: { flex: 1, backgroundColor: 'transparent' },
    messagesListContent: { paddingTop: 8, paddingBottom: 12 },
    pinnedWrapper: { paddingVertical: 0, paddingHorizontal: 0, borderColor: theme.border, borderBottomWidth: 1 },
    replyBar: {
      ...commonStyles.backgroundLight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: sizes.sm,
      paddingHorizontal: sizes.sm,
      borderTopColor: theme.border,
      borderTopWidth: 1,
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '100%',
      zIndex: 20,
    },
  });
