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

import { useRootStore, useStoreData } from "../../store/StoreProvider";
import type { CitySearchItem } from "../../types/citySearch";

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

export const LibraryScreen = () => {
  const { theme, typography, sizes } = useTheme();
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

  useEffect(() => {
    if (!formLoaded) return;
    setIsFormCollapsed(hasAnyFormValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formLoaded]);

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
    () => makeSummaryText({ day, month, year, time, city }),
    [day, month, year, time, city],
  );

  const chartSubtitle = useMemo(() => {
    if (!horoscope) return "Сначала постройте карту";
    const bodies = horoscope.CelestialBodies?.all?.length ?? 0;
    const houses = horoscope.Houses?.length ?? 0;
    const aspects = Object.values(horoscope.Aspects?.types ?? {}).reduce(
      (sum, a) => sum + (Array.isArray(a) ? a.length : 0),
      0,
    );
    return `${bodies} планет · ${houses} домов · ${aspects} аспектов`;
  }, [horoscope]);

  const handleGenerate = useCallback(() => {
    setError(null);

    const parsedDay = clampNumber(Number(day), 1, 31);
    const parsedMonth = clampNumber(Number(month) - 1, 0, 11);
    const parsedYear = clampNumber(Number(year), 1, 9999);

    const [h, m = "0"] = time.split(":");
    const parsedHour = clampNumber(Number(h), 0, 23);
    const parsedMinute = clampNumber(Number(m), 0, 59);

    const lat = Number(latitude);
    const lon = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setError("Проверьте координаты.");
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
    } catch (e) {
      console.warn(e);
      setError("Не удалось построить карту.");
    } finally {
      setLoading(false);
    }
  }, [
    day,
    month,
    year,
    time,
    latitude,
    longitude,
    collapseForm,
  ]);

  const handleCopyResults = useCallback(async () => {
    if (!horoscope) return;
    try {
      const payload = buildExportPayload(horoscope);
      await Clipboard.setStringAsync(JSON.stringify(payload, null, 2));
      setCopyMessage("Скопировано в буфер обмена");
    } catch {
      setCopyMessage("Ошибка копирования");
    }
  }, [horoscope]);

  /* ---------------- render ---------------- */

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Натальная карта</Text>
      <Spacer />

      {/* ---------- FORM ---------- */}
      <CollapsibleCard
        collapsed={isFormCollapsed}
        header={
          <FormHeader
            title="Данные рождения"
            subtitle={summaryText}
            collapsed={isFormCollapsed}
            hasResult={Boolean(horoscope)}
            onPress={toggleForm}
          />
        }
        collapsedFooter={
          <TouchableOpacity style={styles.smallAction} onPress={expandForm}>
            <Text style={styles.smallActionText}>Изменить данные</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.formRow}>
          <LabeledInput label="День" value={day} onChangeText={setDay} keyboardType="numeric" />
          <LabeledInput label="Месяц" value={month} onChangeText={setMonth} keyboardType="numeric" />
          <LabeledInput label="Год" value={year} onChangeText={setYear} keyboardType="numeric" />
        </View>

        <View style={styles.formRow}>
          <LabeledInput label="Время" value={time} onChangeText={setTime} placeholder="12:00" />
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
          />
        </View>

        <View style={styles.formRow}>
          <LabeledInput label="Широта" value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
          <LabeledInput label="Долгота" value={longitude} onChangeText={setLongitude} keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.white} /> : <Text style={styles.buttonText}>Построить карту</Text>}
        </TouchableOpacity>

        {horoscope && (
          <TouchableOpacity style={[styles.button, styles.copyButton]} onPress={handleCopyResults}>
            <Text style={[styles.buttonText, styles.copyButtonText]}>Скопировать данные</Text>
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
          />
        }
        collapsedFooter={
          horoscope ? (
            <TouchableOpacity style={styles.smallAction} onPress={expandChart}>
              <Text style={styles.smallActionText}>Показать карту</Text>
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
            <Text style={styles.sectionTitle}>Здесь появится ваша карта</Text>
            <Text style={styles.description}>
              Заполните данные и нажмите «Построить карту»
            </Text>
          </View>
        )}
      </CollapsibleCard>
    </ScrollView>
  );
};

export default LibraryScreen;
