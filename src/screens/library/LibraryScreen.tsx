// src/screens/Library/LibraryScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, LayoutAnimation, Platform, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Horoscope, Origin } from "circular-natal-horoscope-js";
import { Spacer } from "rn-vs-lb";
import { useTheme } from "rn-vs-lb/theme";

import { useRootStore, useStoreData } from "../../store/StoreProvider";
import type { CitySearchItem } from "../../types/citySearch";

import { CollapsibleCard } from "./components/CollapsibleCard";
import { FormHeader } from "./components/FormHeader";
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
  const styles = useMemo(() => makeStyles({ theme, typography, sizes }), [theme, typography, sizes]);

  const rootStore = useRootStore();
  const citySearchState = useStoreData(rootStore.citySearchStore, (store) => ({
    cities: store.cities,
    isLoading: store.isLoading,
    error: store.error,
    query: store.query,
  }));

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [formLoaded, setFormLoaded] = useState(false);

  // dropdown control
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [isCitySelected, setIsCitySelected] = useState(false);
  const cityInputRef = useRef<TextInput>(null);

  // collapsible form
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  const { animate } = useLayoutAnimation();

  const toggleForm = useCallback(() => {
    animate();
    setIsFormCollapsed((prev) => !prev);
  }, [animate]);

  const collapseForm = useCallback(() => {
    animate();
    setIsFormCollapsed(true);
  }, [animate]);

  const expandForm = useCallback(() => {
    animate();
    setIsFormCollapsed(false);
  }, [animate]);

  const isAnyFormValue =
    Boolean(day.trim()) ||
    Boolean(month.trim()) ||
    Boolean(year.trim()) ||
    Boolean(time.trim()) ||
    Boolean(city.trim()) ||
    Boolean(latitude.trim()) ||
    Boolean(longitude.trim());

  // initial collapse logic: if saved values exist, start collapsed; else expanded
  useEffect(() => {
    if (!formLoaded) return;
    setIsFormCollapsed(isAnyFormValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formLoaded]);

  // load saved form
  useEffect(() => {
    const loadForm = async () => {
      try {
        const savedForm = await AsyncStorage.getItem(FORM_STORAGE_KEY);
        if (savedForm) {
          const parsed = JSON.parse(savedForm) as Partial<FormState>;
          setDay(parsed.day ?? "");
          setMonth(parsed.month ?? "");
          setYear(parsed.year ?? "");
          setTime(parsed.time ?? "");
          setCity(parsed.city ?? "");
          setLatitude(parsed.latitude ?? "");
          setLongitude(parsed.longitude ?? "");
          setIsCitySelected(Boolean((parsed.city ?? "").trim()));
        }
      } catch (storageError) {
        console.warn("Failed to load library form state", storageError);
      } finally {
        setFormLoaded(true);
      }
    };

    loadForm().catch((e) => console.warn(e));
  }, []);

  // save with small debounce
  useDebouncedEffect(
    () => {
      if (!formLoaded) return;
      const payload: FormState = { day, month, year, time, city, latitude, longitude };
      AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(payload)).catch((e) =>
        console.warn("Failed to save library form state", e),
      );
    },
    400,
    [formLoaded, day, month, year, time, city, latitude, longitude],
  );

  // city search: debounce 1s, only when focused and not selected
  useDebouncedEffect(
    () => {
      const q = city.trim();
      if (!q) return;
      if (q.length < 2) return;
      if (!isCityFocused) return;
      if (isCitySelected) return;
      void rootStore.citySearchStore.searchCities(q);
    },
    1000,
    [city, isCityFocused, isCitySelected, rootStore.citySearchStore],
  );

  const handleSelectCity = useCallback((selectedCity: CitySearchItem) => {
    setCity(selectedCity.city);
    setLatitude(String(selectedCity.lat));
    setLongitude(String(selectedCity.lng));
    setIsCitySelected(true);
    setIsCityFocused(false);
  }, []);

  const handleClearCity = useCallback(() => {
    setCity("");
    setLatitude("");
    setLongitude("");
    setIsCitySelected(false);

    // keep focus after press
    setTimeout(() => {
      cityInputRef.current?.focus();
      setIsCityFocused(true);
    }, 0);
  }, []);

  const summaryText = useMemo(() => makeSummaryText({ day, month, year, time, city }), [day, month, year, time, city]);

  const handleGenerate = useCallback(() => {
    setError(null);

    const parsedDay = clampNumber(Number(day), 1, 31);
    const parsedMonth = clampNumber(Number(month) - 1, 0, 11);
    const parsedYear = clampNumber(Number(year), 1, 9999);

    const [hoursString, minutesString] = time.split(":");
    const parsedHour = clampNumber(Number(hoursString), 0, 23);
    const parsedMinute = clampNumber(Number(minutesString ?? "0"), 0, 59);

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setError("Проверьте координаты — не удалось распознать числа.");
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

      const nextHoroscope = new Horoscope({
        origin,
        houseSystem: "placidus",
        zodiac: "tropical",
        aspectPoints: ["bodies", "points", "angles"],
        aspectWithPoints: ["bodies", "points", "angles"],
        aspectTypes: ["major"],
        customOrbs: {},
        language: "en",
      });

      setHoroscope(nextHoroscope);
      setCopyMessage(null);
      collapseForm();
    } catch (creationError) {
      console.warn("Failed to build horoscope", creationError);
      setError("Не удалось построить натальную карту. Проверьте введённые данные.");
    } finally {
      setLoading(false);
    }
  }, [collapseForm, day, latitude, longitude, month, time, year]);

  const handleCopyResults = useCallback(async () => {
    if (!horoscope) return;
    setCopyMessage(null);

    try {
      const payload = buildExportPayload(horoscope);
      await Clipboard.setStringAsync(JSON.stringify(payload, null, 2));
      setCopyMessage("Планеты и дома скопированы в буфер обмена.");
    } catch (copyError) {
      console.warn("Failed to copy horoscope data", copyError);
      setCopyMessage("Не удалось скопировать данные. Попробуйте ещё раз.");
    }
  }, [horoscope]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Натальная карта</Text>
      <Spacer />

      <CollapsibleCard
        collapsed={isFormCollapsed}
        header={<FormHeader title="Данные рождения" subtitle={summaryText} collapsed={isFormCollapsed} hasResult={Boolean(horoscope)} onPress={toggleForm} />}
        collapsedFooter={
          <TouchableOpacity style={styles.smallAction} onPress={expandForm}>
            <Text style={styles.smallActionText}>Изменить данные</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.formRow}>
          <LabeledInput label="День" value={day} onChangeText={setDay} keyboardType="numeric" placeholder="1" autoCapitalize="none" />
          <LabeledInput label="Месяц" value={month} onChangeText={setMonth} keyboardType="numeric" placeholder="1" autoCapitalize="none" />
          <LabeledInput label="Год" value={year} onChangeText={setYear} keyboardType="numeric" placeholder="1990" autoCapitalize="none" />
        </View>

        <View style={styles.formRow}>
          <LabeledInput label="Время (чч:мм)" value={time} onChangeText={setTime} placeholder="12:00" autoCapitalize="none" />
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
          <LabeledInput label="Широта" value={latitude} onChangeText={setLatitude} keyboardType="numeric" placeholder="55.7558" autoCapitalize="none" />
          <LabeledInput label="Долгота" value={longitude} onChangeText={setLongitude} keyboardType="numeric" placeholder="37.6173" autoCapitalize="none" />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.white} /> : <Text style={styles.buttonText}>Построить карту</Text>}
        </TouchableOpacity>

        {horoscope ? (
          <TouchableOpacity style={[styles.button, styles.copyButton]} onPress={handleCopyResults}>
            <Text style={[styles.buttonText, styles.copyButtonText]}>Скопировать планеты и дома</Text>
          </TouchableOpacity>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {copyMessage ? <Text style={styles.copyMessage}>{copyMessage}</Text> : null}
      </CollapsibleCard>

      {horoscope ? (
        <View style={styles.chartWrapper}>
          <Text style={styles.sectionTitle}>Карта</Text>
          <NatalChart horoscope={horoscope} />
        </View>
      ) : (
        <View style={styles.chartWrapper}>
          <Text style={styles.sectionTitle}>Здесь появится ваша карта</Text>
          <Text style={styles.description}>
            Заполните данные и нажмите “Построить карту” — мы покажем планеты, дома, аспекты и визуализацию круга.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default LibraryScreen;
