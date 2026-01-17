import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getStoredNatalReading,
  getStoredNatalReadings,
  saveNatalReading,
} from "../../../helpers/astrology/natalReadingStorage";
import { AnalyticsEvent, trackEvent } from "../../../services/analytics/events";
import astrologyService from "../../../services/astrology/AstrologyService";

export type NatalReadingCardConfig = {
  key: string;
  title: string;
  accent: string;
};

type UseNatalReadingsArgs = {
  enabled: boolean; // horoscope exists
  adsEnabled: boolean;
  showRewardedAd: () => void;
  tNoChartError: string;
  tReadingFetchError: string;

  chartPayload: unknown | null;
  chartSignature: string;

  readingCards: NatalReadingCardConfig[];
};

export const useNatalReadings = ({
  enabled,
  adsEnabled,
  showRewardedAd,
  tNoChartError,
  tReadingFetchError,
  chartPayload,
  chartSignature,
  readingCards,
}: UseNatalReadingsArgs) => {
  const [natalReadings, setNatalReadings] = useState<Record<string, string>>({});
  const [readingErrors, setReadingErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [activeReadingKey, setActiveReadingKey] = useState<string | null>(null);
  const [loadingReadingKey, setLoadingReadingKey] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const openedReadingKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load stored readings for current chartSignature
  useEffect(() => {
    let isActive = true;

    const loadStoredReadings = async () => {
      if (!chartSignature) {
        if (isActive) {
          setNatalReadings({});
          setReadingErrors({});
        }
        return;
      }

      try {
        const stored = await getStoredNatalReadings();
        if (!isActive) return;

        const filtered: Record<string, string> = {};
        Object.entries(stored).forEach(([key, value]) => {
          if (value.chartSignature === chartSignature) {
            filtered[key] = value.reading;
          }
        });

        setNatalReadings(filtered);
        setReadingErrors({});
      } catch (storageError) {
        console.warn("Failed to read natal readings", storageError);
      }
    };

    loadStoredReadings().catch(console.warn);

    return () => {
      isActive = false;
    };
  }, [chartSignature]);

  const fetchNatalReading = useCallback(
    async (key: string, options?: { force?: boolean }) => {
      if (!enabled || !chartPayload || !chartSignature) {
        trackEvent(AnalyticsEvent.NatalReadingLoadFailed, {
          key,
          reason: "no_chart",
        });
        return { reading: null as string | null, error: tNoChartError };
      }

      if (!options?.force) {
        const cached = natalReadings[key];
        if (cached) {
          trackEvent(AnalyticsEvent.NatalReadingLoadSuccess, {
            key,
            source: "memory",
          });
          return { reading: cached, error: null as string | null };
        }

        const stored = await getStoredNatalReading(key, chartSignature);
        if (stored) {
          if (isMountedRef.current) {
            setNatalReadings((prev) => ({ ...prev, [key]: stored }));
            setReadingErrors((prev) => ({ ...prev, [key]: undefined }));
          }

          trackEvent(AnalyticsEvent.NatalReadingLoadSuccess, {
            key,
            source: "storage",
          });

          return { reading: stored, error: null as string | null };
        }
      }

      if (!isMountedRef.current) {
        return { reading: null as string | null, error: null as string | null };
      }

      setLoadingReadingKey(key);
      setReadingErrors((prev) => ({ ...prev, [key]: undefined }));

      try {
        const themeTitle =
          readingCards.find((item) => item.key === key)?.title ?? key;

        const response = await astrologyService.generateNatalReading(
          { chart: chartPayload, theme: themeTitle },
          undefined,
        );

        const normalized =
          typeof (response as any)?.reading === "string"
            ? String((response as any).reading).trim()
            : "";

        await saveNatalReading(key, normalized, chartSignature);

        if (isMountedRef.current) {
          setNatalReadings((prev) => ({ ...prev, [key]: normalized }));
        }

        trackEvent(AnalyticsEvent.NatalReadingLoadSuccess, {
          key,
          source: "api",
        });

        return { reading: normalized, error: null as string | null };
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : tReadingFetchError;

        if (isMountedRef.current) {
          setReadingErrors((prev) => ({ ...prev, [key]: message }));
        }

        trackEvent(AnalyticsEvent.NatalReadingLoadFailed, {
          key,
          error: message,
        });

        return { reading: null as string | null, error: message };
      } finally {
        if (isMountedRef.current) {
          setLoadingReadingKey((prev) => (prev === key ? null : prev));
        }
      }
    },
    [
      enabled,
      chartPayload,
      chartSignature,
      natalReadings,
      readingCards,
      tNoChartError,
      tReadingFetchError,
    ],
  );

  const openReading = useCallback(
    (key: string) => {
      if (!enabled) {
        trackEvent(AnalyticsEvent.NatalReadingLoadFailed, {
          key,
          reason: "no_chart",
        });
        setReadingErrors((prev) => ({ ...prev, [key]: tNoChartError }));
        return;
      }

      const shouldShowRewardedAd =
        adsEnabled && !natalReadings[key] && !openedReadingKeysRef.current.has(key);

      trackEvent(AnalyticsEvent.NatalReadingOpen, {
        key,
        hasCached: Boolean(natalReadings[key]),
        rewarded: shouldShowRewardedAd,
      });

      if (shouldShowRewardedAd) {
        openedReadingKeysRef.current.add(key);
        showRewardedAd();
      }

      setActiveReadingKey(key);

      fetchNatalReading(key).catch((err) => {
        console.warn(`Failed to load natal reading for ${key}`, err);
        trackEvent(AnalyticsEvent.NatalReadingLoadFailed, {
          key,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    },
    [
      adsEnabled,
      enabled,
      fetchNatalReading,
      natalReadings,
      showRewardedAd,
      tNoChartError,
    ],
  );

  const close = useCallback(() => {
    setActiveReadingKey(null);
  }, []);

  const retryActive = useCallback(() => {
    if (!activeReadingKey) return;

    trackEvent(AnalyticsEvent.NatalReadingRetry, {
      key: activeReadingKey,
    });

    fetchNatalReading(activeReadingKey, { force: true }).catch((err) => {
      console.warn(`Failed to reload natal reading for ${activeReadingKey}`, err);
    });
  }, [activeReadingKey, fetchNatalReading]);

  const activeCard = useMemo(
    () => readingCards.find((card) => card.key === activeReadingKey),
    [activeReadingKey, readingCards],
  );

  const activeReading = activeReadingKey ? natalReadings[activeReadingKey] : undefined;
  const activeReadingError = activeReadingKey
    ? readingErrors[activeReadingKey]
    : undefined;
  const activeReadingLoading = activeReadingKey
    ? loadingReadingKey === activeReadingKey
    : false;

  return {
    natalReadings,
    loadingReadingKey,

    openReading,

    modal: {
      visible: Boolean(activeReadingKey),
      close,
      retryActive,
      activeCard,
      activeReading,
      activeReadingError,
      activeReadingLoading,
    },
  };
};
