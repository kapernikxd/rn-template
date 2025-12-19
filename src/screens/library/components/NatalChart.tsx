// src/screens/Library/components/NatalChart.tsx
import React, { memo, useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Svg, Circle, Line, Text as SvgText } from "react-native-svg";
import { useTheme } from "rn-vs-lb/theme";
import type { Horoscope } from "circular-natal-horoscope-js";

type Props = {
  horoscope: Horoscope;
};

export const NatalChart = memo(({ horoscope }: Props) => {
  const { theme, typography, sizes } = useTheme();

  const s = useMemo(
    () =>
      StyleSheet.create({
        chartContainer: { alignItems: "center", justifyContent: "center" },
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
        infoLabel: { ...typography.body, color: theme.text, flex: 1 },
        infoValue: { ...typography.body, color: theme.greyText, marginLeft: sizes.sm as number, textAlign: "right" },
      }),
    [sizes.md, sizes.sm, sizes.xs, theme.border, theme.greyText, theme.text, theme.title, typography.body, typography.body, typography.titleH4],
  );

  const toPolar = useCallback((angle: number, radius: number, center: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  }, []);

  const formatPosition = useCallback((item: any) => {
    const degrees = item?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30;
    const signLabel = item?.Sign?.label ?? item?.label;
    if (!degrees) return signLabel ?? "-";
    return `${signLabel} · ${degrees}`;
  }, []);

  const chart = useMemo(() => {
    const chartSize = 320;
    const center = chartSize / 2;
    const outerRadius = chartSize / 2 - 12;
    const innerRadius = outerRadius - 26;
    const planetRadius = innerRadius - 18;
    const houses = horoscope.Houses ?? [];
    const bodies = horoscope.CelestialBodies?.all ?? [];

    return (
      <View style={s.chartContainer}>
        <Svg width={chartSize} height={chartSize}>
          <Circle cx={center} cy={center} r={outerRadius} fill={theme.background} stroke={theme.border} />
          <Circle cx={center} cy={center} r={innerRadius} fill={theme.white} stroke={theme.border} />

          {houses.map((house:any) => {
            const angle = house?.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? 0;
            const lineStart = toPolar(angle, outerRadius, center);
            const lineEnd = toPolar(angle, innerRadius, center);
            return (
              <Line key={`house-${house.id}`} x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke={theme.border} strokeWidth={2} />
            );
          })}

          {bodies.map((body:any, index: number) => {
            const angle = body?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0;
            const position = toPolar(angle, planetRadius, center);
            const labelPosition = toPolar(angle, planetRadius - 12, center);
            const shortLabel = body?.label?.slice(0, 3) ?? `P${index + 1}`;

            return (
              <React.Fragment key={body.key ?? `planet-${index}`}>
                <Circle cx={position.x} cy={position.y} r={6} fill={theme.primary} stroke={theme.white} />
                <SvgText x={labelPosition.x} y={labelPosition.y} fill={theme.text} fontSize={10} fontWeight="bold" textAnchor="middle">
                  {shortLabel}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  }, [horoscope, s.chartContainer, theme.background, theme.border, theme.primary, theme.text, theme.white, toPolar]);

  return (
    <View>
      {chart}

      <Text style={s.sectionTitle}>Планеты</Text>
      {(horoscope.CelestialBodies?.all ?? []).map((body:any) => (
        <View key={body.key} style={s.infoRow}>
          <Text style={s.infoLabel}>{body.label}</Text>
          <Text style={s.infoValue}>{formatPosition(body)}</Text>
        </View>
      ))}

      <Text style={s.sectionTitle}>Дома</Text>
      {(horoscope.Houses ?? []).map((house:any) => (
        <View key={house.id} style={s.infoRow}>
          <Text style={s.infoLabel}>Дом {house.id}</Text>
          <Text style={s.infoValue}>{formatPosition(house)}</Text>
        </View>
      ))}

      <Text style={s.sectionTitle}>Основные аспекты</Text>
      {Object.entries(horoscope.Aspects?.types ?? {}).map(([aspectKey, aspects]) => (
        <View key={aspectKey} style={s.infoRow}>
          <Text style={s.infoLabel}>{aspectKey}</Text>
          <Text style={s.infoValue}>{(aspects as any[]).length}</Text>
        </View>
      ))}
    </View>
  );
});
NatalChart.displayName = "NatalChart";
