import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ThemeType, SizesType, useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';
import i18n from '../../../helpers/i18n';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import 'dayjs/locale/sr';
import 'dayjs/locale/es';
import 'dayjs/locale/it';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt';

const SUPPORTED_DAYJS_LOCALES = new Set(['en', 'ru', 'sr', 'es', 'it', 'de', 'fr', 'pt']);

const resolveDayjsLocale = (language: string | undefined) => {
  const base = language?.split('-')[0] ?? 'en';
  return SUPPORTED_DAYJS_LOCALES.has(base) ? base : 'en';
};

export const getTodayTitle = () => {
  const locale = resolveDayjsLocale(i18n.resolvedLanguage ?? i18n.language);
  const format = i18n.t('screens.dashboard.horoscope.dateFormat');
  const formatted = dayjs().locale(locale).format(format);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const splitHoroscopeIntoParagraphs = (value?: string) =>
  value
    ? value
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0)
    : [];

type HoroscopeDescriptionProps = {
  horoscope?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export const HoroscopeDescription: React.FC<HoroscopeDescriptionProps> = ({
  horoscope,
  isLoading = false,
  errorMessage,
  onRetry,
}) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.card,
          borderRadius: sizes.radius_lg as number,
          padding: sizes.lg as number,
          gap: sizes.sm as number,
        },
        title: {
          ...typography.titleH5,
        },
        text: {
          ...typography.body,
          lineHeight: 22,
        },
        loadingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.xs as number,
        },
        messageContainer: {
          gap: sizes.xs as number,
        },
        helperText: {
          ...typography.body,
          color: theme.greyText,
        },
        errorText: {
          ...typography.body,
          color: theme.title,
          fontWeight: '600',
        },
        retryButton: {
          alignSelf: 'flex-start',
          paddingVertical: sizes.xs as number,
        },
        retryText: {
          ...typography.bodySm,
          color: theme.title,
          fontWeight: '600',
        },
      }),
    [theme, typography, sizes],
  );

  const todayTitle = useMemo(() => getTodayTitle(), []);
  const paragraphs = useMemo(() => splitHoroscopeIntoParagraphs(horoscope), [horoscope]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{todayTitle}</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.title} />
          <Text style={styles.helperText}>{t('screens.dashboard.horoscope.loading')}</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{t('screens.dashboard.horoscope.errorTitle')}</Text>
          <Text style={styles.helperText}>{errorMessage}</Text>
          <Pressable
            onPress={onRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel={t('screens.dashboard.horoscope.retryAccessibility')}
            hitSlop={8}
          >
            <Text style={styles.retryText}>{t('screens.dashboard.horoscope.retry')}</Text>
          </Pressable>
        </View>
      ) : paragraphs.length > 0 ? (
        paragraphs.map((paragraph, index) => (
          <Text key={index} style={styles.text}>
            {paragraph}
          </Text>
        ))
      ) : (
        <Text style={styles.helperText}>
          {t('screens.dashboard.horoscope.emptyPlaceholder')}
        </Text>
      )}
    </View>
  );
};