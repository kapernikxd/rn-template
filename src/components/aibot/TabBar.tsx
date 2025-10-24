// TabBar.tsx
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import type { ScrollView } from 'react-native';

export type TabItem = {
  key: string;
  label: string;
  disabled?: boolean;
};

type MeasuredTab = {
  x: number;     // абсолютный x внутри контента ScrollView (с учётом padding)
  width: number;
};

type TabBarProps = {
  tabs: TabItem[];
  activeIndex: number;
  onChange: (index: number) => void;

  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;

  // стилизация
  activeColor?: string;
  inactiveColor?: string;
  indicatorColor?: string;
  indicatorHeight?: number;
  fontSize?: number;
  fontWeightActive?: '700' | '600' | '500' | '400';
  fontWeightInactive?: '600' | '500' | '400' | '300';
  tabHorizontalPadding?: number;
  gap?: number;
};

const PADDING_X = 12; // должен совпадать со styles.row.paddingHorizontal

export const TabBar: React.FC<TabBarProps> = memo((props) => {
  const {
    tabs,
    activeIndex,
    onChange,
    style,
    contentContainerStyle,
    activeColor = '#000000',
    inactiveColor = 'rgba(255,255,255,0.55)',
    indicatorColor = '#000000',
    indicatorHeight = 4,
    fontSize = 24,
    fontWeightActive = '700',
    fontWeightInactive = '600',
    tabHorizontalPadding = 4,
    gap = 24,
  } = props;

  const scrollRef = useRef<ScrollView>(null);
  const [rootWidth, setRootWidth] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // измерения вкладок
  const [measures, setMeasures] = useState<Record<string, MeasuredTab>>({});
  const onTabLayout = useCallback(
    (key: string) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      setMeasures((prev) =>
        prev[key]?.x === x && prev[key]?.width === width ? prev : { ...prev, [key]: { x, width } },
      );
    },
    [],
  );

  // индикатор: позиционируем по центру вкладки
  const centerX = useRef(new Animated.Value(0)).current; // координата центра ОТНОСИТЕЛЬНО left=PADDING_X
  const scaleX = useRef(new Animated.Value(1)).current;  // ширина индикатора (масштаб по X)

  const animateTo = useCallback(
    (centerRel: number, width: number) => {
      Animated.parallel([
        Animated.spring(centerX, {
          toValue: centerRel,
          useNativeDriver: true,
          bounciness: 6,
          speed: 15,
        }),
        Animated.spring(scaleX, {
          toValue: Math.max(1, width), // базовая ширина 1 -> растягиваем до нужной
          useNativeDriver: true,
          bounciness: 6,
          speed: 15,
        }),
      ]).start();
    },
    [centerX, scaleX],
  );

  // пересчёт при смене активной вкладки или измерений
  useEffect(() => {
    const tab = tabs[activeIndex];
    if (!tab) return;
    const m = measures[tab.key];
    if (!m) return;

    const targetWidth = Math.max(16, m.width * 0.6);
    const centerAbs = m.x + m.width / 2;          // абсолютный центр относительно контента
    const centerRel = centerAbs - PADDING_X;      // смещаем, т.к. индикатор имеет left=PADDING_X

    animateTo(centerRel, targetWidth);

    // автоцентрирование активной вкладки в видимой области
    const desiredScrollX = Math.max(0, centerAbs - rootWidth / 2);
    scrollRef.current?.scrollTo({ x: desiredScrollX, y: 0, animated: true });
  }, [activeIndex, measures, tabs, rootWidth, animateTo]);

  const handlePress = useCallback(
    (index: number, disabled?: boolean) => {
      if (!disabled) onChange(index);
    },
    [onChange],
  );

  const contentGapStyle = useMemo(() => ({ columnGap: gap }), [gap]);

  const translateX = useMemo(() => Animated.subtract(centerX, scrollX), [centerX, scrollX]);

  return (
    <View
      style={[styles.root, style]}
      onLayout={(e) => setRootWidth(e.nativeEvent.layout.width)}
    >
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, contentGapStyle, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        // important: чтобы Pressable не обрезался тенями
        overScrollMode="never"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {tabs.map((t, i) => {
          const isActive = i === activeIndex;
          return (
            <Pressable
              key={t.key}
              onPress={() => handlePress(i, t.disabled)}
              onLayout={onTabLayout(t.key)}
              android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: true }}
              style={({ pressed }) => [
                styles.tab,
                { paddingHorizontal: tabHorizontalPadding, opacity: t.disabled ? 0.5 : pressed ? 0.8 : 1 },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive, disabled: !!t.disabled }}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: isActive ? activeColor : inactiveColor,
                    fontSize,
                    fontWeight: isActive ? fontWeightActive : fontWeightInactive,
                  },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </Animated.ScrollView>

      {/* Индикатор: width анимируем через scaleX (native-driver) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            height: indicatorHeight,
            backgroundColor: indicatorColor,
            // базовая «единичка», далее растягиваем scaleX до нужной ширины
            width: 1,
            transform: [
              { translateX }, // сдвиг центра
              { scaleX },              // ширина
            ],
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: PADDING_X,
    paddingTop: 4,
    paddingBottom: 4,
  },
  tab: {
    paddingVertical: 6,
  },
  label: {
    letterSpacing: 0.2,
  },
  indicator: {
    position: 'absolute',
    left: PADDING_X, // точка отсчёта для centerX
    bottom: 0,
    borderRadius: 999,
  },
});

export default TabBar;
