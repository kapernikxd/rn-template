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
import { formatTimeValue, sanitizeNumericInput } from "./utils/inputFormatters";
import { makeSummaryText } from "./utils/makeSummaryText";
import { makeStyles } from "./styles";
import { saveNatalChart } from "../../helpers/astrology/natalChartStorage";
import { AiAgentHeader } from "../aibot/components";
import { usePortalNavigation } from "../../helpers/hooks";
import { useNatalReadings } from "../../helpers/hooks/natalCharts/useNatalReadings";
import { NATAL_READING_CARDS } from "../../constants/natalChart";

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

export const NatalChartScreen = () => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => makeStyles({ theme, typography, sizes }),
    [theme, typography, sizes],
  );

  const rootStore = useRootStore();
  const citySearchState = useStoreData(rootStore.citySearchStore, (store) => ({
    cities: store.cities,
    isLoading: store.isLoading,
    error: store.error,
  }));

  const { adsEnabled, adsSource } = useStoreData(rootStore.configStore, (store) => ({
    adsEnabled: store.adsEnabled,
    adsSource: store.adsConfig.ADS_SOURCE,
  }));

  const { goBack } = usePortalNavigation();

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

  const handleDayChange = useCallback((text: string) => {
    setDay(sanitizeNumericInput(text, 31, 2));
  }, []);

  const handleMonthChange = useCallback((text: string) => {
    setMonth(sanitizeNumericInput(text, 12, 2));
  }, []);

  const handleYearChange = useCallback((text: string) => {
    setYear(sanitizeNumericInput(text, 9999, 4));
  }, []);

  const handleTimeChange = useCallback((text: string) => {
    setTime(formatTimeValue(text));
  }, []);

  // city picker
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [isCitySelected, setIsCitySelected] = useState(false);
  const cityInputRef = useRef<TextInput>(null);

  // collapsible states
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);

  const { animate } = useLayoutAnimation();

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
    setCopyMessage(null);

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
  }, [horoscope, t]);

  const chartPayload = useMemo(
    () => (horoscope ? buildExportPayload(horoscope) : null),
    [horoscope],
  );

  const chartSignature = useMemo(
    () => (chartPayload ? JSON.stringify(chartPayload) : ""),
    [chartPayload],
  );

  useEffect(() => {
    if (!chartPayload || !chartSignature) return;

    // Cache the generated chart so chat messages can attach it later without rebuilding.
    saveNatalChart(chartPayload, chartSignature).catch((cacheError) => {
      console.warn("Failed to cache natal chart payload", cacheError);
    });
  }, [chartPayload, chartSignature]);

  /* ---------------- readings ---------------- */

  const readingCards = useMemo(
    () =>
      NATAL_READING_CARDS.map((card) => ({
        ...card,
        title: t(`library.readings.cards.${card.key}`),
      })),
    [t],
  );

  const readings = useNatalReadings({
    enabled: Boolean(horoscope),
    adsEnabled,
    showRewardedAd,
    tNoChartError: t("library.errors.noChart"),
    tReadingFetchError: t("library.errors.readingFetch"),
    chartPayload,
    chartSignature,
    readingCards,
  });

  /* ---------------- render ---------------- */

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <AiAgentHeader theme={theme} onBack={goBack} title={t("library.title")} />
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
            <LabeledInput
              label={t("library.form.fields.day")}
              value={day}
              onChangeText={handleDayChange}
              keyboardType="numeric"
            />
            <LabeledInput
              label={t("library.form.fields.month")}
              value={month}
              onChangeText={handleMonthChange}
              keyboardType="numeric"
            />
            <LabeledInput
              label={t("library.form.fields.year")}
              value={year}
              onChangeText={handleYearChange}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formRow}>
            <LabeledInput
              label={t("library.form.fields.time")}
              value={time}
              onChangeText={handleTimeChange}
              keyboardType="numeric"
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
            <LabeledInput
              label={t("library.form.fields.latitude")}
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
            />
            <LabeledInput
              label={t("library.form.fields.longitude")}
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <Text style={styles.buttonText}>
                {t("library.form.actions.build")}
              </Text>
            )}
          </TouchableOpacity>

          {horoscope && (
            <TouchableOpacity
              style={[styles.button, styles.copyButton]}
              onPress={handleCopyResults}
            >
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
                <Text style={styles.smallActionText}>
                  {t("library.chart.show")}
                </Text>
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
              <Text style={styles.sectionTitle}>
                {t("library.chart.placeholder.title")}
              </Text>
              <Text style={styles.description}>
                {t("library.chart.placeholder.description")}
              </Text>
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
                preview={readings.natalReadings[card.key]}
                isSaved={Boolean(readings.natalReadings[card.key])}
                isLoading={readings.loadingReadingKey === card.key}
                disabled={!horoscope}
                onPress={() => readings.openReading(card.key)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <NatalReadingModal
        visible={readings.modal.visible}
        onClose={readings.modal.close}
        title={readings.modal.activeCard?.title ?? ""}
        accent={readings.modal.activeCard?.accent ?? theme.primary}
        reading={readings.modal.activeReading}
        isLoading={readings.modal.activeReadingLoading}
        errorMessage={readings.modal.activeReadingError ?? undefined}
        onRetry={readings.modal.retryActive}
      />
    </>
  );
};

export default NatalChartScreen;
