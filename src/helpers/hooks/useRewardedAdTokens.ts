import { useCallback, useEffect, useRef, useState } from "react";
import { TestIds, useRewardedAd } from "react-native-google-mobile-ads";

import { useRootStore } from "../../store/StoreProvider";
import {
  DEFAULT_TOKEN_BALANCE,
  addTokens,
  getTokenBalance,
} from "../tokenStorage";

const TOKEN_REWARD_AMOUNT = 10;

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-8636022279548301/8567360540";

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

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const storedBalance = await getTokenBalance();
        updateBalance(storedBalance);
      } catch (storageError) {
        if (isMountedRef.current) {
          uiStore.showSnackbar("Не удалось получить баланс токенов.", "error");
        }
      }
    };

    void loadBalance();

    if (!isLoaded) {
      load();
    }
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

  const handleShowRewardedAd = useCallback(() => {
    if (isLoaded) {
      show();
    } else {
      uiStore.showSnackbar("Реклама загружается, попробуйте чуть позже.", "info");
      load();
    }
  }, [isLoaded, load, show, uiStore]);

  return {
    balance,
    isAdLoaded: isLoaded,
    showRewardedAd: handleShowRewardedAd,
  };
};
