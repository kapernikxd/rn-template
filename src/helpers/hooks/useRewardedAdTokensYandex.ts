import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import {
  RewardedAd,
  RewardedAdLoader,
  AdRequestConfiguration,
} from "yandex-mobile-ads";
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

export const useRewardedAdTokensYandex = (
  options: UseRewardedAdTokensOptions = {},
): UseRewardedAdTokensResult => {
  const { onRewardEarned, shouldAwardTokens = true } = options;
  const { uiStore, configStore } = useRootStore();
  const { t } = useTranslation();

  const { yandexAdsConfig, rewardAmount } = useStoreData(configStore, (store) => ({
    yandexAdsConfig: 'demo-rewarded-yandex',        // ⚠️ нужно добавить в стор
    rewardAmount: store.tokenRewardAmount,
  }));

  const [balance, setBalance] = useState<number>(DEFAULT_TOKEN_BALANCE);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const isMountedRef = useRef(false);
  const adRef = useRef<RewardedAd | null>(null);
  const balanceRef = useRef(balance);
  const hasAppliedRewardRef = useRef(false);

  const rewardedAdUnitId = useMemo(() => {
    // можно сделать тестовый ID по аналогии с TestIds, пока пусть будет боевой
    return isIos
      ? 'demo-rewarded-yandex' // yandexAdsConfig.IOS_AD_UNIT_ID_REWARD
      : 'demo-rewarded-yandex' // yandexAdsConfig.ANDROID_AD_UNIT_ID_REWARD;
  }, [yandexAdsConfig]);

  const updateBalance = useCallback((value: number) => {
    if (isMountedRef.current) {
      setBalance(value);
    }
  }, []);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = addTokenBalanceListener(updateBalance);

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [updateBalance]);

  const loadAd = useCallback(async () => {
    setIsAdLoaded(false);
    adRef.current = null;

    try {
      const loader = await RewardedAdLoader.create();
      const config = new AdRequestConfiguration({
        adUnitId: rewardedAdUnitId,
      });

      const ad = await loader.loadAd(config);
      adRef.current = ad;
      setIsAdLoaded(true);
    } catch (e) {
      adRef.current = null;
      setIsAdLoaded(false);

      if (isMountedRef.current) {
        uiStore.showSnackbar(
          t("components.ads.rewardedTokens.snackbar.loadFailed"),
          "error",
        );
      }
    }
  }, [rewardedAdUnitId, uiStore, t]);

  useEffect(() => {
    const init = async () => {
      try {
        const storedBalance = await getTokenBalance();
        updateBalance(storedBalance);
      } catch {
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
        // игнорируем
      }

      if (!isMountedRef.current) return;

      await loadAd();
    };

    void init();
  }, [loadAd, uiStore, updateBalance, t]);

  const applyReward = useCallback(async () => {
    if (hasAppliedRewardRef.current) return;
    hasAppliedRewardRef.current = true;

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
      } else {
        onRewardEarned?.(balanceRef.current);
      }
    } catch {
      if (isMountedRef.current) {
        uiStore.showSnackbar(
          t("components.ads.rewardedTokens.snackbar.balanceUpdateError"),
          "error",
        );
      }
    }
  }, [
    onRewardEarned,
    rewardAmount,
    shouldAwardTokens,
    uiStore,
    updateBalance,
    t,
  ]);

  const showRewardedAd = useCallback(() => {
    const ad = adRef.current;

    if (!ad) {
      uiStore.showSnackbar(
        t("components.ads.rewardedTokens.snackbar.adLoading"),
        "info",
      );
      void loadAd();
      return;
    }

    // будем показывать этот инстанс — больше он не нужен, сразу очистим
    adRef.current = null;
    setIsAdLoaded(false);
    hasAppliedRewardRef.current = false;

    ad.onAdShown = () => {
      // можно логировать
    };

    ad.onAdFailedToShow = () => {
      uiStore.showSnackbar(
        t("components.ads.rewardedTokens.snackbar.showFailed"),
        "error",
      );
      void loadAd();
    };

    ad.onAdDismissed = () => {
      // если по какой-то причине не было onRewarded — просто перезагружаем
      void loadAd();
    };

    ad.onRewarded = () => {
      void applyReward();
    };

    ad.show();
  }, [applyReward, loadAd, uiStore, t]);

  return {
    balance,
    isAdLoaded,
    showRewardedAd,
  };
};
