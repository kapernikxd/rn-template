import { Share, Alert } from 'react-native';
import { useCallback } from "react";
import { DOMAIN } from "../../constants/links";
import { useRootStore } from '../../store/StoreProvider';

export function useActions() {
  const { authStore } = useRootStore();
  const userId = authStore.myId;

  const handleShareUserLink = useCallback(
    async (userId?: string | null) => {
      if (!userId) return;
      const link = `${DOMAIN}/user/${userId}`;
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

  // Возвращаем объект со всеми экшенами
  return {
    myId: userId,
    handleShareUserLink
  };
}
