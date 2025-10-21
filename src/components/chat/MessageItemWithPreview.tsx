// components/Chat/MessageItem/MessageItemWithPreview.tsx
import React, { FC, useCallback } from 'react';
import { Linking } from 'react-native';
import { MessageItem } from 'rn-vs-lb';
import type { MessageItemProps } from 'rn-vs-lb';
import { useLinkPreview } from '../../helpers/hooks';
import { extractFirstUrl } from '../../helpers/utils/common';

type Props = Omit<MessageItemProps, 'linkPreview' | 'linkPreviewLoading' | 'linkHandler'>;

export const MessageItemWithPreview: FC<Props> = ({ item, onLongPress, ...rest }) => {
  const deletedPlaceholder = 'Message deleted';
  const rawItem = item as any;
  const isDeleted = rawItem?.status === 'deleted';

  const replyToWithStatus = rawItem?.replyTo as any;
  const sanitizedReplyTo = replyToWithStatus?.status === 'deleted'
    ? {
        ...replyToWithStatus,
        content: deletedPlaceholder,
        attachments: [],
        images: [],
      }
    : replyToWithStatus ?? null;

  const sanitizedItem = isDeleted
    ? {
        ...rawItem,
        content: deletedPlaceholder,
        attachments: [],
        images: [],
        replyTo: sanitizedReplyTo,
      }
    : sanitizedReplyTo !== rawItem.replyTo
      ? {
          ...rawItem,
          replyTo: sanitizedReplyTo,
        }
      : rawItem;

  const url = extractFirstUrl((sanitizedItem as any).content ?? undefined);
  const { data, loading } = useLinkPreview(url);

  const handleLink = useCallback(async (u: string) => {
    const finalUrl = u.startsWith('http') ? u : `https://${u}`;
    try {
      await Linking.openURL(finalUrl);
    } catch (e) {
      console.warn('Open URL failed', e);
    }
  }, []);

  return (
    <MessageItem
      {...rest}
      item={sanitizedItem as any}
      onLongPress={isDeleted ? undefined : onLongPress}
      linkPreview={data}
      linkPreviewLoading={loading}
      linkHandler={handleLink}
    />
  );
};

export default MessageItemWithPreview;
