import { useMemo } from "react";

import { useRootStore, useStoreData } from "../../store/StoreProvider";
import { AdSource, resolveAdSource } from "../../types/ads";
import {
  useRewardedAdTokens,
  type UseRewardedAdTokensOptions,
  type UseRewardedAdTokensResult,
} from "./useRewardedAdTokens";
import {
  useRewardedAdTokensYandex,
  type UseRewardedAdTokensOptions as UseRewardedAdTokensYandexOptions,
  type UseRewardedAdTokensResult as UseRewardedAdTokensYandexResult,
} from "./useRewardedAdTokensYandex";

type Options = UseRewardedAdTokensOptions & UseRewardedAdTokensYandexOptions;
type Result = UseRewardedAdTokensResult & UseRewardedAdTokensYandexResult;

type UseRewardedAdTokensBySource = (
  options?: Options,
  adSource?: AdSource,
) => Result;

export const useRewardedAdTokensBySource: UseRewardedAdTokensBySource = (
  options,
  adSource,
) => {
  const { configStore } = useRootStore();
  const adsSourceFromConfig = useStoreData(
    configStore,
    (store) => store.adsConfig.ADS_SOURCE,
  );

  const resolvedSource = useMemo(
    () => resolveAdSource(adSource ?? adsSourceFromConfig),
    [adSource, adsSourceFromConfig],
  );

  return resolvedSource === "yandex"
    ? useRewardedAdTokensYandex(options)
    : useRewardedAdTokens(options);
};
