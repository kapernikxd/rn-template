import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "rn-vs-lb/theme";
import { Svg, Circle, Line, Text as SvgText } from "react-native-svg";
import { Horoscope, Origin } from "circular-natal-horoscope-js";
import { useRootStore, useStoreData } from "../../store/StoreProvider";
import { CitySearchItem } from "../../types/citySearch";

const clampNumber = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(Math.max(value, min), max);
};

export const LibraryScreen = () => {
  const { theme, typography, sizes } = useTheme();
  const rootStore = useRootStore();
  const citySearchState = useStoreData(rootStore.citySearchStore, (store) => ({
    cities: store.cities,
    isLoading: store.isLoading,
    error: store.error,
    query: store.query,
  }));

  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState("1990");
  const [time, setTime] = useState("12:00");
  const [city, setCity] = useState("Москва");
  const [latitude, setLatitude] = useState("55.7558");
  const [longitude, setLongitude] = useState("37.6173");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexGrow: 1,
          backgroundColor: theme.background,
          paddingHorizontal: sizes.xs as number,
          paddingVertical: sizes.md as number,
        },
        title: {
          ...typography.titleH3,
          color: theme.title,
          marginBottom: sizes.xs as number,
          textAlign: "center",
        },
        description: {
          ...typography.body,
          color: theme.greyText,
          marginBottom: sizes.lg as number,
          textAlign: "center",
        },
        formRow: {
          flexDirection: "row",
          columnGap: sizes.sm as number,
          marginBottom: sizes.sm as number,
        },
        input: {
          flex: 1,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 12,
          paddingHorizontal: sizes.sm as number,
          paddingVertical: sizes.xs as number,
          color: theme.text,
          backgroundColor: theme.white,
        },
        label: {
          ...typography.caption,
          color: theme.greyText,
          marginBottom: sizes.xs as number,
        },
        button: {
          backgroundColor: theme.primary,
          paddingVertical: sizes.sm as number,
          borderRadius: 14,
          alignItems: "center",
          marginTop: sizes.sm as number,
        },
        buttonText: {
          ...typography.button,
          color: theme.white,
        },
        copyButton: {
          backgroundColor: theme.white,
          borderWidth: 1,
          borderColor: theme.primary,
        },
        copyButtonText: {
          color: theme.primary,
        },
        errorText: {
          color: theme.danger,
          ...typography.caption,
          marginTop: sizes.xs as number,
        },
        copyMessage: {
          ...typography.caption,
          color: theme.primary,
          marginTop: sizes.xs as number,
          textAlign: "center",
        },
        suggestionsWrapper: {
          marginTop: sizes.xs as number,
        },
        suggestionsContainer: {
          backgroundColor: theme.white,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 12,
        },
        suggestionItem: {
          paddingHorizontal: sizes.sm as number,
          paddingVertical: sizes.xs as number,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
        },
        suggestionCity: {
          ...typography.body,
          color: theme.text,
        },
        suggestionCountry: {
          ...typography.caption,
          color: theme.greyText,
        },
        chartWrapper: {
          backgroundColor: theme.white,
          borderRadius: 16,
          padding: sizes.md as number,
          marginTop: sizes.lg as number,
        },
        sectionTitle: {
          ...typography.titleH4,
          color: theme.title,
          marginTop: sizes.md as number,
          marginBottom: sizes.xs as number,
        },
        infoRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: sizes.xs as number,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
        },
        infoLabel: {
          ...typography.body,
          color: theme.text,
          flex: 1,
        },
        infoValue: {
          ...typography.caption,
          color: theme.greyText,
          marginLeft: sizes.sm as number,
          textAlign: "right",
        },
        chartContainer: {
          alignItems: "center",
          justifyContent: "center",
        },
      }),
    [
      sizes.lg,
      sizes.md,
      sizes.sm,
      sizes.xs,
      theme.background,
      theme.border,
      theme.danger,
      theme.greyText,
      theme.primary,
      theme.text,
      theme.title,
      theme.white,
      typography.body,
      typography.button,
      typography.caption,
      typography.titleH3,
      typography.titleH4,
    ],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void rootStore.citySearchStore.searchCities(city);
    }, 300);

    return () => clearTimeout(timeout);
  }, [city, rootStore.citySearchStore]);

  const handleSelectCity = useCallback((selectedCity: CitySearchItem) => {
    setCity(selectedCity.city);
    setLatitude(selectedCity.lat.toString());
    setLongitude(selectedCity.lng.toString());
  }, []);

  const buildExportPayload = useCallback(() => {
    if (!horoscope) return null;

    const bodies = (horoscope.CelestialBodies?.all ?? []).map((body) => ({
      key: body.key,
      label: body.label,
      sign: body?.Sign?.label ?? null,
      house: body?.House?.id ?? null,
      eclipticDegrees: body?.ChartPosition?.Ecliptic?.DecimalDegrees ?? null,
      arcDegreesFormatted: body?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 ?? null,
    }));

    const houses = (horoscope.Houses ?? []).map((house) => ({
      id: house.id,
      label: house?.Sign?.label ?? house?.label ?? `Дом ${house.id}`,
      startDegrees: house?.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? null,
      arcDegreesFormatted: house?.ChartPosition?.StartPosition?.Ecliptic?.ArcDegreesFormatted30 ?? null,
    }));

    return { bodies, houses };
  }, [horoscope]);

  const formatPosition = useCallback((item: any) => {
    const degrees = item?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30;
    const signLabel = item?.Sign?.label ?? item?.label;

    if (!degrees) return signLabel ?? "-";
    return `${signLabel} · ${degrees}`;
  }, []);

  const toPolar = useCallback((angle: number, radius: number, center: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;

    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  }, []);

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
    } catch (creationError) {
      console.warn("Failed to build horoscope", creationError);
      setError("Не удалось построить натальную карту. Проверьте введённые данные.");
    } finally {
      setLoading(false);
    }
  }, [day, latitude, longitude, month, time, year]);

  const handleCopyResults = useCallback(async () => {
    const payload = buildExportPayload();

    if (!payload) return;

    setCopyMessage(null);

    try {
      await Clipboard.setStringAsync(JSON.stringify(payload, null, 2));
      setCopyMessage("Планеты и дома скопированы в буфер обмена.");
    } catch (copyError) {
      console.warn("Failed to copy horoscope data", copyError);
      setCopyMessage("Не удалось скопировать данные. Попробуйте ещё раз.");
    }
  }, [buildExportPayload]);

  const renderChart = useCallback(() => {
    if (!horoscope) return null;

    const chartSize = 320;
    const center = chartSize / 2;
    const outerRadius = chartSize / 2 - 12;
    const innerRadius = outerRadius - 26;
    const planetRadius = innerRadius - 18;
    const houses = horoscope.Houses ?? [];
    const bodies = horoscope.CelestialBodies?.all ?? [];

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartSize} height={chartSize}>
          <Circle cx={center} cy={center} r={outerRadius} fill={theme.background} stroke={theme.border} />
          <Circle cx={center} cy={center} r={innerRadius} fill={theme.white} stroke={theme.border} />

          {houses.map((house) => {
            const angle = house?.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? 0;
            const lineStart = toPolar(angle, outerRadius, center);
            const lineEnd = toPolar(angle, innerRadius, center);

            return (
              <Line
                key={`house-${house.id}`}
                x1={lineStart.x}
                y1={lineStart.y}
                x2={lineEnd.x}
                y2={lineEnd.y}
                stroke={theme.border}
                strokeWidth={2}
              />
            );
          })}

          {bodies.map((body, index) => {
            const angle = body?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0;
            const position = toPolar(angle, planetRadius, center);
            const labelPosition = toPolar(angle, planetRadius - 12, center);
            const shortLabel = body?.label?.slice(0, 3) ?? `P${index + 1}`;

            return (
              <React.Fragment key={body.key ?? `planet-${index}`}>
                <Circle
                  cx={position.x}
                  cy={position.y}
                  r={6}
                  fill={theme.primary}
                  stroke={theme.white}
                />
                <SvgText
                  x={labelPosition.x}
                  y={labelPosition.y}
                  fill={theme.text}
                  fontSize={10}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {shortLabel}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  }, [horoscope, styles.chartContainer, theme.background, theme.border, theme.primary, theme.text, theme.white, toPolar]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Построение натальной карты</Text>
      <Text style={styles.description}>
        Укажите дату, время и город рождения. Мы построим круг, дома и основные положения
        планет с помощью "circular-natal-horoscope-js".
      </Text>

      <View style={styles.formRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>День</Text>
          <TextInput
            keyboardType="numeric"
            value={day}
            onChangeText={setDay}
            style={styles.input}
            placeholder="1"
            placeholderTextColor={theme.greyText}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Месяц</Text>
          <TextInput
            keyboardType="numeric"
            value={month}
            onChangeText={setMonth}
            style={styles.input}
            placeholder="1"
            placeholderTextColor={theme.greyText}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Год</Text>
          <TextInput
            keyboardType="numeric"
            value={year}
            onChangeText={setYear}
            style={styles.input}
            placeholder="1990"
            placeholderTextColor={theme.greyText}
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Время (чч:мм)</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            style={styles.input}
            placeholder="12:00"
            placeholderTextColor={theme.greyText}
            autoCapitalize="none"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Город</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            style={styles.input}
            placeholder="Москва"
            placeholderTextColor={theme.greyText}
          />
          <View style={styles.suggestionsWrapper}>
            {citySearchState.isLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : null}
            {citySearchState.error ? (
              <Text style={styles.errorText}>Не удалось загрузить города</Text>
            ) : null}
            {!citySearchState.isLoading && !citySearchState.error && citySearchState.cities.length > 0 ? (
              <View style={styles.suggestionsContainer}>
                {citySearchState.cities.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion._id}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectCity(suggestion)}
                  >
                    <Text style={styles.suggestionCity}>{suggestion.city}</Text>
                    <Text style={styles.suggestionCountry}>{suggestion.country}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Широта</Text>
          <TextInput
            value={latitude}
            onChangeText={setLatitude}
            style={styles.input}
            keyboardType="numeric"
            placeholder="55.7558"
            placeholderTextColor={theme.greyText}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Долгота</Text>
          <TextInput
            value={longitude}
            onChangeText={setLongitude}
            style={styles.input}
            keyboardType="numeric"
            placeholder="37.6173"
            placeholderTextColor={theme.greyText}
          />
        </View>
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

      {horoscope ? (
        <View style={styles.chartWrapper}>
          <Text style={styles.sectionTitle}>Карта</Text>
          {renderChart()}

          <Text style={styles.sectionTitle}>Планеты</Text>
          {(horoscope.CelestialBodies?.all ?? []).map((body) => (
            <View key={body.key} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{body.label}</Text>
              <Text style={styles.infoValue}>{formatPosition(body)}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Дома</Text>
          {(horoscope.Houses ?? []).map((house) => (
            <View key={house.id} style={styles.infoRow}>
              <Text style={styles.infoLabel}>Дом {house.id}</Text>
              <Text style={styles.infoValue}>{formatPosition(house)}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Основные аспекты</Text>
          {Object.entries(horoscope.Aspects?.types ?? {}).map(([aspectKey, aspects]) => (
            <View key={aspectKey} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{aspectKey}</Text>
              <Text style={styles.infoValue}>{(aspects as any[]).length}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.chartWrapper}>
          <Text style={styles.sectionTitle}>Здесь появится ваша карта</Text>
          <Text style={styles.description}>
            После нажатия на кнопку мы покажем планеты, дома, аспекты и простую визуализацию круга.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default LibraryScreen;
