// components/Chat/MessageItem/MessageItemWithPreview.tsx
import React, { FC, useCallback } from 'react';
import { Linking } from 'react-native';
import { MessageItem } from 'rn-vs-lb';
import type { MessageItemProps } from 'rn-vs-lb';
import { useLinkPreview } from '../../helpers/hooks';
import { extractFirstUrl } from '../../helpers/utils/common';

type Props = Omit<MessageItemProps, 'linkPreview' | 'linkPreviewLoading' | 'linkHandler'>;

export const MessageItemWithPreview: FC<Props> = (props) => {
  const url = extractFirstUrl(props.item.content ?? undefined);
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
      {...props}
      linkPreview={data}
      linkPreviewLoading={loading}
      linkHandler={handleLink}
    />
  );
};

export default MessageItemWithPreview;
