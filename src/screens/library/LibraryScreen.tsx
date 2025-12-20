import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Horoscope, Origin } from "circular-natal-horoscope-js";
import { Spacer } from "rn-vs-lb";
import { useTheme } from "rn-vs-lb/theme";
import { useTranslation } from "react-i18next";

import { useRootStore, useStoreData } from "../../store/StoreProvider";
import type { CitySearchItem } from "../../types/citySearch";
import astrologyService from "../../services/astrology/AstrologyService";
import { useRewardedAdTokensBySource } from "../../helpers/hooks/useRewardedAdTokensBySource";
import { resolveAdSource } from "../../types/ads";
import {
  getStoredNatalReading,
  getStoredNatalReadings,
  saveNatalReading,
} from "../../helpers/astrology/natalReadingStorage";
import { AnalyticsEvent, trackEvent } from "../../services/analytics/events";

import { CollapsibleCard } from "./components/CollapsibleCard";
import { FormHeader } from "./components/FormHeader";
import { ChartHeader } from "./components/ChartHeader";
import { LabeledInput } from "./components/LabeledInput";
import { CityPicker } from "./components/CityPicker";
import { NatalChart } from "./components/NatalChart";
import { NatalReadingCard } from "./components/NatalReadingCard";
import { NatalReadingModal } from "./components/NatalReadingModal";

import { useLayoutAnimation } from "./hooks/useLayoutAnimation";
import { useDebouncedEffect } from "./hooks/useDebouncedEffect";

import { buildExportPayload } from "./utils/buildExportPayload";
import { clampNumber } from "./utils/clampNumber";
import { makeSummaryText } from "./utils/makeSummaryText";
import { makeStyles } from "./styles";

const FORM_STORAGE_KEY = "libraryFormState";

type FormState = {
  day: string;
  month: string;
  year: string;
  time: string;
  city: string;
  latitude: string;
  longitude: string;
};

type NatalReadingCardConfig = {
  key: string;
  title: string;
  accent: string;
};

const NATAL_READING_CARDS: Omit<NatalReadingCardConfig, "title">[] = [
  { key: "energy", accent: "#8E7DFF" },
  { key: "personality", accent: "#FF8FB1" },
  { key: "emotions", accent: "#6DD3C2" },
  { key: "relationships", accent: "#F3B14C" },
  { key: "mind", accent: "#6EB5FF" },
  { key: "purpose", accent: "#C792EA" },
  { key: "career", accent: "#7ED957" },
  { key: "social", accent: "#FFA552" },
  { key: "inner", accent: "#A0AEC0" },
  { key: "shadow", accent: "#5E5CE6" },
];

export const LibraryScreen = () => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => makeStyles({ theme, typography, sizes }),
    [theme, typography, sizes],
  );

  const rootStore = useRootStore();
  const citySearchState = useStoreData(
    rootStore.citySearchStore,
    (store) => ({
      cities: store.cities,
      isLoading: store.isLoading,
      error: store.error,
    }),
  );

  const { adsEnabled, adsSource } = useStoreData(rootStore.configStore, (store) => ({
    adsEnabled: store.adsEnabled,
    adsSource: store.adsConfig.ADS_SOURCE,
  }));

  const { showRewardedAd } = useRewardedAdTokensBySource(
    { shouldAwardTokens: false },
    resolveAdSource(adsSource),
  );

  // form state
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [formLoaded, setFormLoaded] = useState(false);
  const [natalReadings, setNatalReadings] = useState<Record<string, string>>({});
  const [readingErrors, setReadingErrors] = useState<Record<string, string | undefined>>({});
  const [activeReadingKey, setActiveReadingKey] = useState<string | null>(null);
  const [loadingReadingKey, setLoadingReadingKey] = useState<string | null>(null);

  // city picker
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [isCitySelected, setIsCitySelected] = useState(false);
  const cityInputRef = useRef<TextInput>(null);

  // collapsible states
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);

  const { animate } = useLayoutAnimation();
  const isMountedRef = useRef(true);
  const openedReadingKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* ---------------- form collapse ---------------- */

  const toggleForm = useCallback(() => {
    animate();
    setIsFormCollapsed((v) => !v);
  }, [animate]);

  const expandForm = useCallback(() => {
    animate();
    setIsFormCollapsed(false);
  }, [animate]);

  const collapseForm = useCallback(() => {
    animate();
    setIsFormCollapsed(true);
  }, [animate]);

  /* ---------------- chart collapse ---------------- */

  const toggleChart = useCallback(() => {
    animate();
    setIsChartCollapsed((v) => !v);
  }, [animate]);

  const expandChart = useCallback(() => {
    animate();
    setIsChartCollapsed(false);
  }, [animate]);

  /* ---------------- persistence ---------------- */

  const hasAnyFormValue =
    Boolean(day.trim()) ||
    Boolean(month.trim()) ||
    Boolean(year.trim()) ||
    Boolean(time.trim()) ||
    Boolean(city.trim()) ||
    Boolean(latitude.trim()) ||
    Boolean(longitude.trim());

  const hasAllFormValues = useMemo(() => {
    if (!day.trim() || !month.trim() || !year.trim() || !time.trim()) {
      return false;
    }

    if (!city.trim() || !latitude.trim() || !longitude.trim()) {
      return false;
    }

    const lat = Number(latitude);
    const lon = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return false;
    }

    const [h, m = "0"] = time.split(":");
    return !Number.isNaN(Number(h)) && !Number.isNaN(Number(m));
  }, [city, day, latitude, longitude, month, time, year]);

  useEffect(() => {
    if (!formLoaded) return;
    setIsFormCollapsed(hasAnyFormValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formLoaded]);

  useEffect(() => {
    if (!formLoaded || loading || horoscope || !hasAllFormValues) {
      return;
    }

    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formLoaded, loading, horoscope, hasAllFormValues]);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(FORM_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<FormState>;
          setDay(parsed.day ?? "");
          setMonth(parsed.month ?? "");
          setYear(parsed.year ?? "");
          setTime(parsed.time ?? "");
          setCity(parsed.city ?? "");
          setLatitude(parsed.latitude ?? "");
          setLongitude(parsed.longitude ?? "");
          setIsCitySelected(Boolean(parsed.city?.trim()));
        }
      } finally {
        setFormLoaded(true);
      }
    };

    load().catch(console.warn);
  }, []);

  useDebouncedEffect(
    () => {
      if (!formLoaded) return;
      const payload: FormState = {
        day,
        month,
        year,
        time,
        city,
        latitude,
        longitude,
      };
      AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(payload)).catch(
        console.warn,
      );
    },
    400,
    [formLoaded, day, month, year, time, city, latitude, longitude],
  );

  /* ---------------- city search ---------------- */

  useDebouncedEffect(
    () => {
      const q = city.trim();
      if (!q || q.length < 2 || !isCityFocused || isCitySelected) return;
      void rootStore.citySearchStore.searchCities(q);
    },
    1000,
    [city, isCityFocused, isCitySelected],
  );

  const handleSelectCity = useCallback((c: CitySearchItem) => {
    setCity(c.city);
    setLatitude(String(c.lat));
    setLongitude(String(c.lng));
    setIsCitySelected(true);
    setIsCityFocused(false);
  }, []);

  const handleClearCity = useCallback(() => {
    setCity("");
    setLatitude("");
    setLongitude("");
    setIsCitySelected(false);

    setTimeout(() => {
      cityInputRef.current?.focus();
      setIsCityFocused(true);
    }, 0);
  }, []);

  /* ---------------- generate ---------------- */

  const summaryText = useMemo(
    () =>
      makeSummaryText(
        { day, month, year, time, city },
        t("library.form.summaryPlaceholder"),
      ),
    [city, day, month, t, time, year],
  );

  const chartSubtitle = useMemo(() => {
    if (!horoscope) return t("library.chart.subtitleEmpty");
    const bodies = horoscope.CelestialBodies?.all?.length ?? 0;
    const houses = horoscope.Houses?.length ?? 0;
    const aspects = Object.values(horoscope.Aspects?.types ?? {}).reduce(
      (sum, a) => sum + (Array.isArray(a) ? a.length : 0),
      0,
    );
    return t("library.chart.subtitleStats", { bodies, houses, aspects });
  }, [horoscope, t]);

  const handleGenerate = useCallback(() => {
    setError(null);
    setActiveReadingKey(null);

    void trackEvent(AnalyticsEvent.NatalChartGenerateStarted, {
      hasCoordinates: Boolean(latitude.trim()) && Boolean(longitude.trim()),
      hasCity: Boolean(city.trim()),
      hasTime: Boolean(time.trim()),
      hasDate: Boolean(day.trim()) && Boolean(month.trim()) && Boolean(year.trim()),
    });

    const parsedDay = clampNumber(Number(day), 1, 31);
    const parsedMonth = clampNumber(Number(month) - 1, 0, 11);
    const parsedYear = clampNumber(Number(year), 1, 9999);

    const [h, m = "0"] = time.split(":");
    const parsedHour = clampNumber(Number(h), 0, 23);
    const parsedMinute = clampNumber(Number(m), 0, 59);

    const lat = Number(latitude);
    const lon = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setError(t("library.errors.coordinates"));
      return;
    }

    setLoading(true);

    try {
      const origin = new Origin({
        year: parsedYear,
        month: parsedMonth,
        date: parsedDay,
        hour: parsedHour,
        minute: parsedMinute,
        latitude: lat,
        longitude: lon,
      });

      const next = new Horoscope({
        origin,
        houseSystem: "placidus",
        zodiac: "tropical",
        aspectPoints: ["bodies", "points", "angles"],
        aspectWithPoints: ["bodies", "points", "angles"],
        aspectTypes: ["major"],
        customOrbs: {},
        language: "en",
      });

      setHoroscope(next);
      setCopyMessage(null);

      collapseForm();
      setIsChartCollapsed(false);

      void trackEvent(AnalyticsEvent.NatalChartGenerateSuccess, {
        hasResult: Boolean(next),
      });
    } catch (e) {
      console.warn(e);
      setError(t("library.errors.build"));

      void trackEvent(AnalyticsEvent.NatalChartGenerateFailed, {
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  }, [
    day,
    month,
    year,
    time,
    city,
    latitude,
    longitude,
    collapseForm,
    t,
    trackEvent,
  ]);

  const handleCopyResults = useCallback(async () => {
    if (!horoscope) return;
    try {
      const payload = buildExportPayload(horoscope);
      await Clipboard.setStringAsync(JSON.stringify(payload, null, 2));
      setCopyMessage(t("library.copy.success"));

      void trackEvent(AnalyticsEvent.NatalChartCopy, {
        success: true,
      });
    } catch {
      setCopyMessage(t("library.copy.error"));

      void trackEvent(AnalyticsEvent.NatalChartCopy, {
        success: false,
      });
    }
  }, [horoscope, t, trackEvent]);

  const chartPayload = useMemo(
    () => (horoscope ? buildExportPayload(horoscope) : null),
    [horoscope],
  );

  const chartSignature = useMemo(
    () => (chartPayload ? JSON.stringify(chartPayload) : ""),
    [chartPayload],
  );

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

  const readingCards = useMemo(
    () =>
      NATAL_READING_CARDS.map((card) => ({
        ...card,
        title: t(`library.readings.cards.${card.key}`),
      })),
    [t],
  );

  const fetchNatalReading = useCallback(
    async (key: string, options?: { force?: boolean }) => {
      if (!horoscope || !chartPayload || !chartSignature) {
        setError(t("library.errors.noChart"));

        void trackEvent(AnalyticsEvent.NatalReadingLoadFailed, {
          key,
          reason: "no_chart",
        });
        return null;
      }

      if (!options?.force) {
        const cached = natalReadings[key];
        if (cached) {
          void trackEvent(AnalyticsEvent.NatalReadingLoadSuccess, {
            key,
            source: "memory",
          });
          return cached;
        }

        const stored = await getStoredNatalReading(key, chartSignature);
        if (stored) {
          if (isMountedRef.current) {
            setNatalReadings((prev) => ({ ...prev, [key]: stored }));
            setReadingErrors((prev) => ({ ...prev, [key]: undefined }));
          }

          void trackEvent(AnalyticsEvent.NatalReadingLoadSuccess, {
            key,
            source: "storage",
          });

          return stored;
        }
      }

      if (!isMountedRef.current) {
        return null;
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
          typeof response.reading === "string" ? response.reading.trim() : "";

        await saveNatalReading(key, normalized, chartSignature);

        if (isMountedRef.current) {
          setNatalReadings((prev) => ({ ...prev, [key]: normalized }));
        }

        void trackEvent(AnalyticsEvent.NatalReadingLoadSuccess, {
          key,
          source: "api",
        });

        return normalized;
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : t("library.errors.readingFetch");

        if (isMountedRef.current) {
          setReadingErrors((prev) => ({ ...prev, [key]: message }));
        }

        void trackEvent(AnalyticsEvent.NatalReadingLoadFailed, {
          key,
          error: message,
        });

        return null;
      } finally {
        if (isMountedRef.current) {
          setLoadingReadingKey((prev) => (prev === key ? null : prev));
        }
      }
    },
    [
      chartPayload,
      chartSignature,
      horoscope,
      natalReadings,
      readingCards,
      t,
      trackEvent,
    ],
  );

  const handleOpenReading = useCallback(
    (key: string) => {
      if (!horoscope) {
        setError(t("library.errors.noChart"));

        void trackEvent(AnalyticsEvent.NatalReadingLoadFailed, {
          key,
          reason: "no_chart",
        });
        return;
      }

      const shouldShowRewardedAd =
        adsEnabled &&
        !natalReadings[key] &&
        !openedReadingKeysRef.current.has(key);

      void trackEvent(AnalyticsEvent.NatalReadingOpen, {
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

        void trackEvent(AnalyticsEvent.NatalReadingLoadFailed, {
          key,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    },
    [
      adsEnabled,
      fetchNatalReading,
      horoscope,
      natalReadings,
      showRewardedAd,
      trackEvent,
    ],
  );

  const handleRetryReading = useCallback(() => {
    if (!activeReadingKey) return;

    void trackEvent(AnalyticsEvent.NatalReadingRetry, {
      key: activeReadingKey,
    });

    fetchNatalReading(activeReadingKey, { force: true }).catch((err) => {
      console.warn(`Failed to reload natal reading for ${activeReadingKey}`, err);
    });
  }, [activeReadingKey, fetchNatalReading, trackEvent]);

  const closeReadingModal = useCallback(() => {
    setActiveReadingKey(null);
  }, []);

  const activeCard = useMemo(
    () => readingCards.find((card) => card.key === activeReadingKey),
    [activeReadingKey, readingCards],
  );

  const activeReading = activeReadingKey
    ? natalReadings[activeReadingKey]
    : undefined;

  const activeReadingError = activeReadingKey
    ? readingErrors[activeReadingKey]
    : undefined;

  const activeReadingLoading = activeReadingKey
    ? loadingReadingKey === activeReadingKey
    : false;

  /* ---------------- render ---------------- */

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.title}>{t("library.title")}</Text>
      <Spacer />

      {/* ---------- FORM ---------- */}
      <CollapsibleCard
        collapsed={isFormCollapsed}
        header={
          <FormHeader
            title={t("library.form.title")}
            subtitle={summaryText}
            collapsed={isFormCollapsed}
            hasResult={Boolean(horoscope)}
            onPress={toggleForm}
          />
        }
        collapsedFooter={
          <TouchableOpacity style={styles.smallAction} onPress={expandForm}>
            <Text style={styles.smallActionText}>{t("library.form.edit")}</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.formRow}>
          <LabeledInput label={t("library.form.fields.day")} value={day} onChangeText={setDay} keyboardType="numeric" />
          <LabeledInput label={t("library.form.fields.month")} value={month} onChangeText={setMonth} keyboardType="numeric" />
          <LabeledInput label={t("library.form.fields.year")} value={year} onChangeText={setYear} keyboardType="numeric" />
        </View>

        <View style={styles.formRow}>
          <LabeledInput
            label={t("library.form.fields.time")}
            value={time}
            onChangeText={setTime}
            placeholder={t("library.form.fields.timePlaceholder")}
          />
          <CityPicker
            value={city}
            onChange={setCity}
            onSelect={handleSelectCity}
            onClear={handleClearCity}
            isFocused={isCityFocused}
            setFocused={setIsCityFocused}
            isSelected={isCitySelected}
            setSelected={setIsCitySelected}
            inputRef={cityInputRef}
            suggestions={citySearchState.cities}
            isLoading={citySearchState.isLoading}
            error={citySearchState.error}
            label={t("library.form.fields.city")}
            placeholder={t("library.form.fields.cityPlaceholder")}
            errorText={t("library.form.fields.cityError")}
          />
        </View>

        <View style={styles.formRow}>
          <LabeledInput label={t("library.form.fields.latitude")} value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
          <LabeledInput label={t("library.form.fields.longitude")} value={longitude} onChangeText={setLongitude} keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.white} />
          ) : (
            <Text style={styles.buttonText}>{t("library.form.actions.build")}</Text>
          )}
        </TouchableOpacity>

        {horoscope && (
          <TouchableOpacity style={[styles.button, styles.copyButton]} onPress={handleCopyResults}>
            <Text style={[styles.buttonText, styles.copyButtonText]}>
              {t("library.form.actions.copy")}
            </Text>
          </TouchableOpacity>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
        {copyMessage && <Text style={styles.copyMessage}>{copyMessage}</Text>}
      </CollapsibleCard>

      <Spacer />
      {/* ---------- CHART ---------- */}
      <CollapsibleCard
        collapsed={isChartCollapsed}
        header={
          <ChartHeader
            collapsed={isChartCollapsed}
            hasResult={Boolean(horoscope)}
            subtitle={chartSubtitle}
            onPress={toggleChart}
            title={t("library.chart.title")}
          />
        }
        collapsedFooter={
          horoscope ? (
            <TouchableOpacity style={styles.smallAction} onPress={expandChart}>
              <Text style={styles.smallActionText}>{t("library.chart.show")}</Text>
            </TouchableOpacity>
          ) : null
        }
      >
        {horoscope ? (
          <View style={styles.chartWrapper}>
            <NatalChart horoscope={horoscope} />
          </View>
        ) : (
          <View style={styles.chartWrapper}>
            <Text style={styles.sectionTitle}>{t("library.chart.placeholder.title")}</Text>
            <Text style={styles.description}>{t("library.chart.placeholder.description")}</Text>
          </View>
        )}
      </CollapsibleCard>

      <View style={styles.readingsSection}>
        <Text style={styles.sectionTitle}>{t("library.readings.title")}</Text>
        <Text style={styles.sectionDescription}>
          {t("library.readings.description")}
        </Text>

        <View style={styles.readingsList}>
          {readingCards.map((card) => (
            <NatalReadingCard
              key={card.key}
              title={card.title}
              accent={card.accent}
              preview={natalReadings[card.key]}
              isSaved={Boolean(natalReadings[card.key])}
              isLoading={loadingReadingKey === card.key}
              disabled={!horoscope}
              onPress={() => handleOpenReading(card.key)}
            />
          ))}
        </View>
      </View>
      </ScrollView>

      <NatalReadingModal
        visible={Boolean(activeReadingKey)}
        onClose={closeReadingModal}
        title={activeCard?.title ?? ""}
        accent={activeCard?.accent ?? theme.primary}
        reading={activeReading}
        isLoading={activeReadingLoading}
        errorMessage={activeReadingError ?? undefined}
        onRetry={handleRetryReading}
      />
    </>
  );
};

export default LibraryScreen;
