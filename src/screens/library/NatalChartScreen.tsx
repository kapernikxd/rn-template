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
import { AnalyticsEvent, trackEvent } from "../../services/analytics/events";

import { CollapsibleCard } from "./components/CollapsibleCard";
import { FormHeader } from "./components/FormHeader";
import { ChartHeader } from "./components/ChartHeader";
import { LabeledInput } from "./components/LabeledInput";
import { CityPicker } from "./components/CityPicker";
import { NatalChart } from "./components/NatalChart";

import { useLayoutAnimation } from "./hooks/useLayoutAnimation";
import { useDebouncedEffect } from "./hooks/useDebouncedEffect";

import { buildExportPayload } from "./utils/buildExportPayload";
import { clampNumber } from "./utils/clampNumber";
import { formatTimeValue, sanitizeNumericInput } from "./utils/inputFormatters";
import { makeSummaryText } from "./utils/makeSummaryText";
import { makeStyles } from "./styles";
import { saveNatalChart, savePartnerNatalChart } from "../../helpers/astrology/natalChartStorage";
import { AiAgentHeader } from "../aibot/components";
import { usePortalNavigation } from "../../helpers/hooks";
import { getStoredNatalFormState, saveNatalFormState } from "../../helpers/astrology/natalFormStorage";


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

  const { goBack } = usePortalNavigation();

  // form state
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [partnerDay, setPartnerDay] = useState("");
  const [partnerMonth, setPartnerMonth] = useState("");
  const [partnerYear, setPartnerYear] = useState("");
  const [partnerTime, setPartnerTime] = useState("");
  const [partnerCity, setPartnerCity] = useState("");
  const [partnerLatitude, setPartnerLatitude] = useState("");
  const [partnerLongitude, setPartnerLongitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [partnerHoroscope, setPartnerHoroscope] = useState<Horoscope | null>(null);
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

  const handlePartnerDayChange = useCallback((text: string) => {
    setPartnerDay(sanitizeNumericInput(text, 31, 2));
  }, []);

  const handlePartnerMonthChange = useCallback((text: string) => {
    setPartnerMonth(sanitizeNumericInput(text, 12, 2));
  }, []);

  const handlePartnerYearChange = useCallback((text: string) => {
    setPartnerYear(sanitizeNumericInput(text, 9999, 4));
  }, []);

  const handlePartnerTimeChange = useCallback((text: string) => {
    setPartnerTime(formatTimeValue(text));
  }, []);

  // city picker
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [isCitySelected, setIsCitySelected] = useState(false);
  const cityInputRef = useRef<TextInput>(null);
  const [isPartnerCityFocused, setIsPartnerCityFocused] = useState(false);
  const [isPartnerCitySelected, setIsPartnerCitySelected] = useState(false);
  const partnerCityInputRef = useRef<TextInput>(null);

  // collapsible states
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isPartnerFormCollapsed, setIsPartnerFormCollapsed] = useState(false);
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);
  const [isPartnerChartCollapsed, setIsPartnerChartCollapsed] = useState(false);

  const { animate } = useLayoutAnimation();

  /* ---------------- form collapse ---------------- */

  const toggleForm = useCallback(() => {
    animate();
    setIsFormCollapsed((v) => !v);
  }, [animate]);

  const togglePartnerForm = useCallback(() => {
    animate();
    setIsPartnerFormCollapsed((v) => !v);
  }, [animate]);

  const expandForm = useCallback(() => {
    animate();
    setIsFormCollapsed(false);
  }, [animate]);

  const expandPartnerForm = useCallback(() => {
    animate();
    setIsPartnerFormCollapsed(false);
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

  const togglePartnerChart = useCallback(() => {
    animate();
    setIsPartnerChartCollapsed((v) => !v);
  }, [animate]);

  const expandPartnerChart = useCallback(() => {
    animate();
    setIsPartnerChartCollapsed(false);
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

  const hasAnyPartnerFormValue =
    Boolean(partnerDay.trim()) ||
    Boolean(partnerMonth.trim()) ||
    Boolean(partnerYear.trim()) ||
    Boolean(partnerTime.trim()) ||
    Boolean(partnerCity.trim()) ||
    Boolean(partnerLatitude.trim()) ||
    Boolean(partnerLongitude.trim());

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

  const hasAllPartnerFormValues = useMemo(() => {
    if (
      !partnerDay.trim() ||
      !partnerMonth.trim() ||
      !partnerYear.trim() ||
      !partnerTime.trim()
    ) {
      return false;
    }

    if (!partnerCity.trim() || !partnerLatitude.trim() || !partnerLongitude.trim()) {
      return false;
    }

    const lat = Number(partnerLatitude);
    const lon = Number(partnerLongitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return false;
    }

    const [h, m = "0"] = partnerTime.split(":");
    return !Number.isNaN(Number(h)) && !Number.isNaN(Number(m));
  }, [
    partnerCity,
    partnerDay,
    partnerLatitude,
    partnerLongitude,
    partnerMonth,
    partnerTime,
    partnerYear,
  ]);

  useEffect(() => {
    if (!formLoaded) return;
    setIsFormCollapsed(hasAnyFormValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formLoaded]);

  useEffect(() => {
    if (!formLoaded) return;
    setIsPartnerFormCollapsed(hasAnyPartnerFormValue);
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
    if (
      !formLoaded ||
      partnerLoading ||
      partnerHoroscope ||
      !hasAllPartnerFormValues
    ) {
      return;
    }
    handleGeneratePartner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formLoaded, partnerLoading, partnerHoroscope, hasAllPartnerFormValues]);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await getStoredNatalFormState();
        if (!saved) return;

        const meState = saved.me;
        const partnerState = saved.partner;

        setDay(meState.day);
        setMonth(meState.month);
        setYear(meState.year);
        setTime(meState.time);
        setCity(meState.city);
        setLatitude(meState.latitude);
        setLongitude(meState.longitude);
        setIsCitySelected(Boolean(meState.city?.trim()));

        setPartnerDay(partnerState.day);
        setPartnerMonth(partnerState.month);
        setPartnerYear(partnerState.year);
        setPartnerTime(partnerState.time);
        setPartnerCity(partnerState.city);
        setPartnerLatitude(partnerState.latitude);
        setPartnerLongitude(partnerState.longitude);
        setIsPartnerCitySelected(Boolean(partnerState.city?.trim()));
      } finally {
        setFormLoaded(true);
      }
    };

    load().catch(console.warn);
  }, []);

  useDebouncedEffect(
    () => {
      if (!formLoaded) return;

      void saveNatalFormState({
        me: { day, month, year, time, city, latitude, longitude },
        partner: {
          day: partnerDay,
          month: partnerMonth,
          year: partnerYear,
          time: partnerTime,
          city: partnerCity,
          latitude: partnerLatitude,
          longitude: partnerLongitude,
        },
      });
    },
    400,
    [
      formLoaded,
      day,
      month,
      year,
      time,
      city,
      latitude,
      longitude,
      partnerDay,
      partnerMonth,
      partnerYear,
      partnerTime,
      partnerCity,
      partnerLatitude,
      partnerLongitude,
    ],
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

  useDebouncedEffect(
    () => {
      const q = partnerCity.trim();
      if (!q || q.length < 2 || !isPartnerCityFocused || isPartnerCitySelected) {
        return;
      }
      void rootStore.citySearchStore.searchCities(q);
    },
    1000,
    [partnerCity, isPartnerCityFocused, isPartnerCitySelected],
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

  const handleSelectPartnerCity = useCallback((c: CitySearchItem) => {
    setPartnerCity(c.city);
    setPartnerLatitude(String(c.lat));
    setPartnerLongitude(String(c.lng));
    setIsPartnerCitySelected(true);
    setIsPartnerCityFocused(false);
  }, []);

  const handleClearPartnerCity = useCallback(() => {
    setPartnerCity("");
    setPartnerLatitude("");
    setPartnerLongitude("");
    setIsPartnerCitySelected(false);

    setTimeout(() => {
      partnerCityInputRef.current?.focus();
      setIsPartnerCityFocused(true);
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

  const partnerSummaryText = useMemo(
    () =>
      makeSummaryText(
        {
          day: partnerDay,
          month: partnerMonth,
          year: partnerYear,
          time: partnerTime,
          city: partnerCity,
        },
        t("library.form.summaryPlaceholder"),
      ),
    [partnerCity, partnerDay, partnerMonth, partnerTime, partnerYear, t],
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

  const partnerChartSubtitle = useMemo(() => {
    if (!partnerHoroscope) return t("library.chart.subtitleEmpty");
    const bodies = partnerHoroscope.CelestialBodies?.all?.length ?? 0;
    const houses = partnerHoroscope.Houses?.length ?? 0;
    const aspects = Object.values(partnerHoroscope.Aspects?.types ?? {}).reduce(
      (sum, a) => sum + (Array.isArray(a) ? a.length : 0),
      0,
    );
    return t("library.chart.subtitleStats", { bodies, houses, aspects });
  }, [partnerHoroscope, t]);

  const handleGenerate = useCallback(() => {
    setError(null);
    setCopyMessage(null);

    if (!hasAllFormValues) {
      setError(t("library.form.summaryPlaceholder"));
      return;
    }

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
    hasAllFormValues,
    t,
  ]);

  const handleGeneratePartner = useCallback(() => {
    setPartnerError(null);

    if (!hasAllPartnerFormValues) {
      setPartnerError(t("library.form.summaryPlaceholder"));
      return;
    }

    const parsedDay = clampNumber(Number(partnerDay), 1, 31);
    const parsedMonth = clampNumber(Number(partnerMonth) - 1, 0, 11);
    const parsedYear = clampNumber(Number(partnerYear), 1, 9999);

    const [h, m = "0"] = partnerTime.split(":");
    const parsedHour = clampNumber(Number(h), 0, 23);
    const parsedMinute = clampNumber(Number(m), 0, 59);

    const lat = Number(partnerLatitude);
    const lon = Number(partnerLongitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setPartnerError(t("library.errors.coordinates"));
      return;
    }

    setPartnerLoading(true);

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

      setPartnerHoroscope(next);
      setIsPartnerChartCollapsed(false);
    } catch (e) {
      console.warn(e);
      setPartnerError(t("library.errors.build"));
    } finally {
      setPartnerLoading(false);
    }
  }, [
    partnerDay,
    partnerMonth,
    partnerYear,
    partnerTime,
    partnerLatitude,
    partnerLongitude,
    hasAllPartnerFormValues,
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

  const partnerChartPayload = useMemo(
    () => (partnerHoroscope ? buildExportPayload(partnerHoroscope) : null),
    [partnerHoroscope],
  );

  const partnerChartSignature = useMemo(
    () => (partnerChartPayload ? JSON.stringify(partnerChartPayload) : ""),
    [partnerChartPayload],
  );

  useEffect(() => {
    if (!chartPayload || !chartSignature) return;

    // Cache the generated chart so chat messages can attach it later without rebuilding.
    saveNatalChart(chartPayload, chartSignature).catch((cacheError) => {
      console.warn("Failed to cache natal chart payload", cacheError);
    });
  }, [chartPayload, chartSignature]);

  useEffect(() => {
    if (!partnerChartPayload || !partnerChartSignature) return;

    savePartnerNatalChart(partnerChartPayload, partnerChartSignature).catch(
      (cacheError) => {
        console.warn("Failed to cache partner natal chart payload", cacheError);
      },
    );
  }, [partnerChartPayload, partnerChartSignature]);

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
              title={t("library.form.myTitle")}
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

        <Spacer />

        <View style={styles.sectionDivider}>
          <View style={styles.sectionDividerLine} />
          <Text style={styles.sectionDividerText}>
            {t("library.form.partnerTitle")}
          </Text>
          <View style={styles.sectionDividerLine} />
        </View>

        <Spacer />

        {/* ---------- PARTNER FORM ---------- */}
        <CollapsibleCard
          collapsed={isPartnerFormCollapsed}
          header={
            <FormHeader
              title={t("library.form.partnerTitle")}
              subtitle={partnerSummaryText}
              collapsed={isPartnerFormCollapsed}
              hasResult={Boolean(partnerHoroscope)}
              onPress={togglePartnerForm}
            />
          }
          collapsedFooter={
            <TouchableOpacity
              style={styles.smallAction}
              onPress={expandPartnerForm}
            >
              <Text style={styles.smallActionText}>{t("library.form.edit")}</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.formRow}>
            <LabeledInput
              label={t("library.form.fields.day")}
              value={partnerDay}
              onChangeText={handlePartnerDayChange}
              keyboardType="numeric"
            />
            <LabeledInput
              label={t("library.form.fields.month")}
              value={partnerMonth}
              onChangeText={handlePartnerMonthChange}
              keyboardType="numeric"
            />
            <LabeledInput
              label={t("library.form.fields.year")}
              value={partnerYear}
              onChangeText={handlePartnerYearChange}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formRow}>
            <LabeledInput
              label={t("library.form.fields.time")}
              value={partnerTime}
              onChangeText={handlePartnerTimeChange}
              keyboardType="numeric"
              placeholder={t("library.form.fields.timePlaceholder")}
            />
            <CityPicker
              value={partnerCity}
              onChange={setPartnerCity}
              onSelect={handleSelectPartnerCity}
              onClear={handleClearPartnerCity}
              isFocused={isPartnerCityFocused}
              setFocused={setIsPartnerCityFocused}
              isSelected={isPartnerCitySelected}
              setSelected={setIsPartnerCitySelected}
              inputRef={partnerCityInputRef}
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
              value={partnerLatitude}
              onChangeText={setPartnerLatitude}
              keyboardType="numeric"
            />
            <LabeledInput
              label={t("library.form.fields.longitude")}
              value={partnerLongitude}
              onChangeText={setPartnerLongitude}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleGeneratePartner}
            disabled={partnerLoading}
          >
            {partnerLoading ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <Text style={styles.buttonText}>
                {t("library.form.actions.build")}
              </Text>
            )}
          </TouchableOpacity>

          {partnerError && <Text style={styles.errorText}>{partnerError}</Text>}
        </CollapsibleCard>

        <Spacer />

        {/* ---------- PARTNER CHART ---------- */}
        <CollapsibleCard
          collapsed={isPartnerChartCollapsed}
          header={
            <ChartHeader
              collapsed={isPartnerChartCollapsed}
              hasResult={Boolean(partnerHoroscope)}
              subtitle={partnerChartSubtitle}
              onPress={togglePartnerChart}
              title={t("library.chart.title")}
            />
          }
          collapsedFooter={
            partnerHoroscope ? (
              <TouchableOpacity
                style={styles.smallAction}
                onPress={expandPartnerChart}
              >
                <Text style={styles.smallActionText}>
                  {t("library.chart.show")}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        >
          {partnerHoroscope ? (
            <View style={styles.chartWrapper}>
              <NatalChart horoscope={partnerHoroscope} />
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

      </ScrollView>
    </>
  );
};

export default NatalChartScreen;
