import { Share } from 'react-native';
import { useCallback } from "react";
import { DOMAIN } from "../../constants/links";
import { useRootStore } from '../../store/StoreProvider';
import { AnalyticsEvent, trackEvent } from '../../services/analytics/events';

export function useActions() {
  const { authStore, configStore } = useRootStore();
  const userId = authStore.myId;

  const handleShareUserLink = useCallback(
    async (targetUserId?: string | null) => {
      const actualUserId = targetUserId ?? userId;
      if (!actualUserId) return;
      const link = `${DOMAIN}/user/${actualUserId}`;
      try {
        await Share.share({
          message: `Check out this user on Pllace:\n${link}`,
        });
      } catch (error) {
        console.log('Error:', error);
      }
    },
    [userId]
  );

  const handleShareAppLink = useCallback(
    async () => {
      const { iosStoreUrl, androidStoreUrl } = configStore.appVersionConfig;
      const messageParts: string[] = [];

      if (iosStoreUrl) {
        messageParts.push(`iOS: ${iosStoreUrl}`);
      }

      if (androidStoreUrl) {
        messageParts.push(`Android: ${androidStoreUrl}`);
      }

      if (!messageParts.length) {
        return;
      }

      try {
        void trackEvent(AnalyticsEvent.AppLinkShared, {
          ios: Boolean(iosStoreUrl),
          android: Boolean(androidStoreUrl),
        });
        await Share.share({
          message: messageParts.join('\n'),
        });
      } catch (error) {
        console.log('Error:', error);
      }
    },
    [configStore]
  );

  // Возвращаем объект со всеми экшенами
  return {
    myId: userId,
    handleShareUserLink,
    handleShareAppLink
  };
}
