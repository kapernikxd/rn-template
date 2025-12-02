import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, Platform } from "react-native";
import { TestIds, useRewardedAd } from "react-native-google-mobile-ads";
import { useTranslation } from "react-i18next";

import { ensureTrackingTransparencyPermission } from "../../services/privacy/trackingTransparency";
import { useRootStore, useStoreData } from "../../store/StoreProvider";
import {
  addTokens,
  addTokenBalanceListener,
  getTokenBalance,
} from "../tokenStorage";
import { DEFAULT_TOKEN_BALANCE } from "../../constants/links";

const isIos = Platform.OS === "ios";

type UseRewardedAdTokensResult = {
  balance: number;
  isAdLoaded: boolean;
  showRewardedAd: () => void;
};

type UseRewardedAdTokensOptions = {
  onRewardEarned?: (balance: number) => void;
  shouldAwardTokens?: boolean;
};

export const useRewardedAdTokens = (
  options: UseRewardedAdTokensOptions = {},
): UseRewardedAdTokensResult => {
  const { onRewardEarned, shouldAwardTokens = true } = options;
  const { uiStore, configStore } = useRootStore();
  const { t } = useTranslation();

  const { adsConfig, rewardAmount } = useStoreData(configStore, (store) => ({
    adsConfig: store.adsConfig,
    rewardAmount: store.tokenRewardAmount,
  }));

  const [balance, setBalance] = useState<number>(DEFAULT_TOKEN_BALANCE);
  const isMountedRef = useRef(false);
  const pendingShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingShowIntentRef = useRef(false);
  const hasAppliedRewardRef = useRef(false);
  const balanceRef = useRef(balance);

  const rewardedAdUnitId = useMemo(() => {
    if (__DEV__) {
      return TestIds.REWARDED;
    }

    return isIos ? adsConfig.IOS_AD_UNIT_ID_REWARD : adsConfig.ANDROID_AD_UNIT_ID_REWARD;
  }, [adsConfig]);

  const { isLoaded, isClosed, isEarnedReward, load, show, error } = useRewardedAd(
    rewardedAdUnitId,
    {
      requestNonPersonalizedAdsOnly: false,
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
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribeFromBalanceUpdates = addTokenBalanceListener(updateBalance);

    return () => {
      isMountedRef.current = false;
      cancelPendingShow();
      unsubscribeFromBalanceUpdates();
    };
  }, [cancelPendingShow, updateBalance]);

  useEffect(() => {
    const loadBalanceAndAd = async () => {
      try {
        const storedBalance = await getTokenBalance();
        updateBalance(storedBalance);
      } catch (storageError) {
        if (isMountedRef.current) {
          uiStore.showSnackbar(
            t("components.ads.rewardedTokens.snackbar.balanceLoadError"),
            "error",
          );
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
  }, [isLoaded, load, uiStore, updateBalance, t]);

  useEffect(() => {
    if (isClosed && !isLoaded) {
      load();
    }
  }, [isClosed, isLoaded, load]);

  useEffect(() => {
    if (!isEarnedReward) {
      hasAppliedRewardRef.current = false;
      return;
    }

    if (hasAppliedRewardRef.current) {
      return;
    }

    hasAppliedRewardRef.current = true;

    const applyReward = async () => {
      try {
        if (shouldAwardTokens) {
          const rewardValue = rewardAmount;
          const updatedBalance = await addTokens(rewardValue);
          updateBalance(updatedBalance);
          onRewardEarned?.(updatedBalance);

          uiStore.showSnackbar(
            t("components.ads.rewardedTokens.snackbar.rewardEarned", {
              amount: rewardValue,
            }),
            "success",
          );

          return;
        }

        onRewardEarned?.(balanceRef.current);
      } catch (storageError) {
        if (isMountedRef.current) {
          uiStore.showSnackbar(
            t("components.ads.rewardedTokens.snackbar.balanceUpdateError"),
            "error",
          );
        }
      }
    };

    void applyReward();
  }, [
    isEarnedReward,
    onRewardEarned,
    rewardAmount,
    shouldAwardTokens,
    uiStore,
    updateBalance,
    t,
  ]);

  useEffect(() => {
    if (!error) {
      return;
    }

    cancelPendingShow();

    if (pendingShowIntentRef.current) {
      uiStore.showSnackbar(
        t("components.ads.rewardedTokens.snackbar.adLoading"),
        "info",
      );
      pendingShowIntentRef.current = true;
    } else {
      uiStore.showSnackbar(
        t("components.ads.rewardedTokens.snackbar.loadFailed"),
        "error",
      );
    }

    load();
  }, [cancelPendingShow, error, load, uiStore, t]);

  const handleFailedShow = useCallback(() => {
    pendingShowIntentRef.current = true;
    uiStore.showSnackbar(
      t("components.ads.rewardedTokens.snackbar.showFailed"),
      "error",
    );
    load();
  }, [load, uiStore, t]);

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
      uiStore.showSnackbar(
        t("components.ads.rewardedTokens.snackbar.adLoading"),
        "info",
      );
      load();
      return;
    }

    scheduleShow();
  }, [isLoaded, load, scheduleShow, uiStore, t]);

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
