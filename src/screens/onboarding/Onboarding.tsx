import React, { useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, Image } from "react-native";
import Swiper from "react-native-swiper";
import { useTheme } from 'rn-vs-lb/theme';
import { SafeAreaView } from "react-native-safe-area-context";
import { ONBOARDING_PHOTO_1, ONBOARDING_PHOTO_2, ONBOARDING_PHOTO_3, ONBOARDING_PHOTO_4 } from "../../helpers/utils/onboarding"
import { useTranslation } from "react-i18next";

interface Slide {
  title: string;
  description: string;
  uri: string;
}

type SlideKey = "welcome" | "memory" | "character" | "start";

const SLIDE_CONFIG: Array<{ key: SlideKey; uri: string }> = [
  { key: "welcome", uri: ONBOARDING_PHOTO_1 },
  { key: "memory", uri: ONBOARDING_PHOTO_2 },
  { key: "character", uri: ONBOARDING_PHOTO_3 },
  { key: "start", uri: ONBOARDING_PHOTO_4 },
];

interface Props {
  onFinish: () => void;
}

const Onboarding: React.FC<Props> = ({ onFinish }) => {
  const swiperRef = useRef<Swiper>(null);
  const { typography, theme } = useTheme();
  const { t } = useTranslation();
  const { width, height } = Dimensions.get("window");
  const styles = getStyles({ width, height, theme, typography });

  const slides: Slide[] = useMemo(
    () =>
      SLIDE_CONFIG.map(({ key, uri }) => ({
        uri,
        title: t(`screens.onboarding.slides.${key}.title`),
        description: t(`screens.onboarding.slides.${key}.description`),
      })),
    [t],
  );

  const handleNext = (index: number) => {
    if (index === slides.length - 1) {
      onFinish();
    } else {
      swiperRef.current?.scrollBy(1, true);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;

  const totalSlides = slides.length;

  const animateTo = (ratio: number) => {
    Animated.parallel([
      Animated.spring(progress, {
        toValue: ratio,           // доля пройдённого пути
        useNativeDriver: false,
        bounciness: 10,
        speed: 12,
      }),
      Animated.sequence([
        Animated.timing(thumbScale, {
          toValue: 1.15,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(thumbScale, {
          toValue: 1,
          duration: 160,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handleIndexChange = (i: number) => {
    setCurrentIndex(i);
    const ratio = (i + 1) / totalSlides;
    animateTo(ratio);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={styles.pagination}
        onIndexChanged={handleIndexChange}
        renderPagination={() => {
          const widthAnim = progress.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          });

          return (
            <View style={styles.progressWrap}>
              <Text style={styles.progressText}>
                {currentIndex + 1} / {totalSlides}
              </Text>

              <View style={styles.progressBarBg}>
                {/* Сегменты фона для визуального ритма */}
                <View style={styles.segmentsRow}>
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <View key={i} style={styles.segment} />
                  ))}
                </View>

                {/* Заполнение с анимацией ширины */}
                <Animated.View style={[styles.progressBarFill, { width: widthAnim }]}>
                  {/* Бегунок на конце заполнения */}
                  <Animated.View style={[styles.thumb, { transform: [{ scale: thumbScale }] }]} />
                </Animated.View>
              </View>
            </View>
          );
        }}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            {/* Иллюстрация-заглушка */}
            <Image source={{ uri: slide.uri }} style={styles.illustration} />
            {/* <View style={styles.illustration}>
              <Text style={styles.emoji}>{slide.title.slice(0, 2).trim()}</Text>
            </View> */}

            {/* Контент */}
            <View style={styles.content}>
              <Text style={[typography.titleH3, styles.title]}>{slide.title}</Text>
              <Text style={[typography.body, styles.description]}>{slide.description}</Text>
            </View>

            {/* Футер с действиями */}
            <View style={styles.footer}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={onFinish}
                style={styles.skipBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.skipText}>{t('screens.onboarding.skip')}</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => handleNext(index)}
                style={styles.nextBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.nextText}>
                  {index === slides.length - 1
                    ? t('screens.onboarding.start')
                    : t('screens.onboarding.next')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Swiper>
    </SafeAreaView>
  );
};

const getStyles = ({
  width,
  height,
  theme,
  typography,
}: {
  width: number;
  height: number;
  theme: any;
  typography: any;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme?.background || "#fff",
    },

    // Прогресс над точками
    progressWrap: {
      position: "absolute",
      width: "100%",
      top: -28,
      left: 0,
      paddingHorizontal: 24,
    },

    progressText: {
      textAlign: "center",
      fontSize: 12,
      color: theme?.greyText || "#8A8A8A",
      marginBottom: 8,
    },

    progressBarBg: {
      height: 12,
      borderRadius: 999,
      backgroundColor: (theme?.divider || "#E5E6EA") + "AA", // чуть плотнее
      overflow: "hidden",
      justifyContent: "center",
    },

    // тонкие сегменты по всей ширине фона
    segmentsRow: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 6,
    },
    segment: {
      width: 1,
      height: 8,
      backgroundColor: (theme?.divider || "#C9CBD3"),
      opacity: 0.7,
      borderRadius: 1,
    },

    progressBarFill: {
      height: "100%",
      backgroundColor: theme?.primary || "#6f2da8",
      borderRadius: 999,
      // лёгкое свечение
      shadowColor: theme?.primary || "#6f2da8",
      shadowOpacity: 0.35,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
      alignItems: "flex-end",
      justifyContent: "center",
    },

    // бегунок на конце заполнения
    thumb: {
      width: 16,
      height: 16,
      borderRadius: 16,
      marginRight: 2,
      backgroundColor: "#fff",
      borderWidth: 2,
      borderColor: theme?.primary || "#6f2da8",
      // тень у бегунка
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },

    slide: {
      flex: 1,
      paddingTop: 24,
      paddingBottom: 24,
      paddingHorizontal: 20,
      justifyContent: "space-between",
    },

    illustration: {
      height: height * 0.58,
      borderRadius: 24,
      backgroundColor: theme?.card || "#F2F2F5",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },

    emoji: {
      fontSize: 56,
    },

    content: {
      paddingHorizontal: 4,
      marginTop: 8,
    },

    title: {
      textAlign: "center",
      marginBottom: 10,
    },

    description: {
      textAlign: "center",
      lineHeight: 20,
      color: theme?.greyText || "#6B6B6B",
    },

    // Пагинация
    pagination: {
      bottom: 0
      // bottom: height * 0.46, // под иллюстрацией
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 8,
      marginHorizontal: 4,
      backgroundColor: theme?.divider || "#E1E1E6",
      opacity: 0.8,
    },
    activeDot: {
      width: 20,
      height: 8,
      borderRadius: 8,
      marginHorizontal: 4,
      backgroundColor: theme?.primary || "#6f2da8",
    },


    footer: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme?.card || "#fff",
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 24,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },

    skipBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
    },

    skipText: {
      fontSize: 15,
      color: theme?.greyText || "#8A8A8A",
    },

    divider: {
      flex: 1,
    },

    nextBtn: {
      backgroundColor: theme?.primary || "#6f2da8",
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },

    nextText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
  });

export default Onboarding;
