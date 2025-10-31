import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, Platform } from "react-native";
import { TestIds, useRewardedAd } from "react-native-google-mobile-ads";

import { ensureTrackingTransparencyPermission } from "../../services/privacy/trackingTransparency";
import { useRootStore } from "../../store/StoreProvider";
import {
  DEFAULT_TOKEN_BALANCE,
  addTokens,
  getTokenBalance,
} from "../tokenStorage";
import {
  ANDROID_AD_UNIT_ID_REWARD,
  IOS_AD_UNIT_ID_REWARD,
  TOKEN_REWARD_AMOUNT,
} from "../../constants/links";

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.OS == "ios" ? IOS_AD_UNIT_ID_REWARD : ANDROID_AD_UNIT_ID_REWARD;

type UseRewardedAdTokensResult = {
  balance: number;
  isAdLoaded: boolean;
  showRewardedAd: () => void;
};

type UseRewardedAdTokensOptions = {
  onRewardEarned?: (balance: number) => void;
};

export const useRewardedAdTokens = (
  options: UseRewardedAdTokensOptions = {},
): UseRewardedAdTokensResult => {
  const { onRewardEarned } = options;
  const { uiStore } = useRootStore();
  const [balance, setBalance] = useState<number>(DEFAULT_TOKEN_BALANCE);
  const isMountedRef = useRef(false);
  const pendingShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingShowIntentRef = useRef(false);

  const { isLoaded, isClosed, isEarnedReward, load, show, error } = useRewardedAd(
    REWARDED_AD_UNIT_ID,
    {
      requestNonPersonalizedAdsOnly: true,
    },
  );

  const updateBalance = useCallback(
    (value: number) => {
      if (isMountedRef.current) {
        setBalance(value);
      }
    },
    [],
  );

  const cancelPendingShow = useCallback(() => {
    if (pendingShowTimeoutRef.current) {
      clearTimeout(pendingShowTimeoutRef.current);
      pendingShowTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cancelPendingShow();
    };
  }, [cancelPendingShow]);

  useEffect(() => {
    const loadBalanceAndAd = async () => {
      try {
        const storedBalance = await getTokenBalance();
        updateBalance(storedBalance);
      } catch (storageError) {
        if (isMountedRef.current) {
          uiStore.showSnackbar("Не удалось получить баланс токенов.", "error");
        }
      }

      try {
        await ensureTrackingTransparencyPermission();
      } catch {
        // Ignore tracking transparency errors and continue loading the ad.
      }

      if (!isMountedRef.current) {
        return;
      }

      if (!isLoaded) {
        load();
      }
    };

    void loadBalanceAndAd();
  }, [isLoaded, load, uiStore, updateBalance]);

  useEffect(() => {
    if (isClosed && !isLoaded) {
      load();
    }
  }, [isClosed, isLoaded, load]);

  useEffect(() => {
    if (isEarnedReward) {
      const applyReward = async () => {
        try {
          const updatedBalance = await addTokens(TOKEN_REWARD_AMOUNT);
          updateBalance(updatedBalance);
          onRewardEarned?.(updatedBalance);

          const rewardMessage = `Награда получена! +${TOKEN_REWARD_AMOUNT} токенов.`;
          uiStore.showSnackbar(rewardMessage, "success");
        } catch (storageError) {
          if (isMountedRef.current) {
            uiStore.showSnackbar("Не удалось обновить баланс токенов.", "error");
          }
        }
      };

      void applyReward();
    }
  }, [isEarnedReward, onRewardEarned, uiStore, updateBalance]);

  useEffect(() => {
    if (error) {
      uiStore.showSnackbar("Не удалось загрузить рекламу. Попробуйте позже.", "error");
    }
  }, [error, uiStore]);

  const handleFailedShow = useCallback(() => {
    pendingShowIntentRef.current = true;
    uiStore.showSnackbar("Не удалось показать рекламу. Попробуйте позже.", "error");
    load();
  }, [load, uiStore]);

  const scheduleShow = useCallback(() => {
    if (pendingShowTimeoutRef.current) {
      return;
    }

    const delay = Platform.OS === "ios" ? 250 : 0;

    pendingShowTimeoutRef.current = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        pendingShowTimeoutRef.current = null;

        if (!pendingShowIntentRef.current) {
          return;
        }

        pendingShowIntentRef.current = false;

        try {
          const maybePromise = show();

          if (maybePromise && typeof (maybePromise as Promise<unknown>).catch === "function") {
            (maybePromise as Promise<void>).catch(() => {
              handleFailedShow();
            });
          }
        } catch (showError) {
          handleFailedShow();
        }
      });
    }, delay);
  }, [handleFailedShow, show]);

  const handleShowRewardedAd = useCallback(() => {
    pendingShowIntentRef.current = true;

    if (!isLoaded) {
      uiStore.showSnackbar("Реклама загружается, попробуйте чуть позже.", "info");
      load();
      return;
    }

    scheduleShow();
  }, [isLoaded, load, scheduleShow, uiStore]);

  useEffect(() => {
    if (isLoaded && pendingShowIntentRef.current) {
      scheduleShow();
    }
  }, [isLoaded, scheduleShow]);

  return {
    balance,
    isAdLoaded: isLoaded,
    showRewardedAd: handleShowRewardedAd,
  };
};
