import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';

type NatalReadingModalProps = {
  visible: boolean;
  title: string;
  accent: string;
  reading?: string;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onClose: () => void;
};

const splitIntoParagraphs = (value?: string) =>
  value
    ? value
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0)
    : [];

export const NatalReadingModal: React.FC<NatalReadingModalProps> = ({
  visible,
  title,
  accent,
  reading,
  isLoading,
  errorMessage,
  onRetry,
  onClose,
}) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: sizes.lg as number,
        },
        wrapper: {
          width: '100%',
          maxWidth: 520,
        },
        content: {
          backgroundColor: theme.card,
          borderRadius: sizes.radius_lg as number,
          padding: sizes.lg as number,
          gap: sizes.sm as number,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: sizes.sm as number,
        },
        title: {
          ...typography.titleH5,
          flex: 1,
        },
        closeButton: {
          padding: sizes.xs as number,
        },
        accentLine: {
          height: 4,
          borderRadius: sizes.radius as number,
          backgroundColor: accent,
        },
        body: {
          gap: sizes.xs as number,
        },
        paragraph: {
          ...typography.body,
          lineHeight: 22,
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
        loading: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.xs as number,
        },
      }),
    [accent, sizes.lg, sizes.radius, sizes.radius_lg, sizes.sm, sizes.xs, theme.card, theme.greyText, theme.title, typography.body, typography.bodySm, typography.titleH5],
  );

  const paragraphs = useMemo(() => splitIntoParagraphs(reading), [reading]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.wrapper}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
                <Feather name="x" size={20} color={theme.title} />
              </Pressable>
            </View>

            <View style={[styles.accentLine, { backgroundColor: accent }]} />

            {isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={theme.title} />
                <Text style={styles.helperText}>{t('library.readings.modal.loading')}</Text>
              </View>
            ) : errorMessage ? (
              <View style={styles.body}>
                <Text style={styles.errorText}>{t('library.readings.modal.errorTitle')}</Text>
                <Text style={styles.helperText}>{errorMessage}</Text>
                <Pressable onPress={onRetry} style={styles.retryButton} hitSlop={8}>
                  <Text style={styles.retryText}>{t('library.readings.modal.retry')}</Text>
                </Pressable>
              </View>
            ) : paragraphs.length > 0 ? (
              <View style={styles.body}>
                {paragraphs.map((paragraph, index) => (
                  <Text key={index} style={styles.paragraph}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.helperText}>
                {t('library.readings.modal.empty')}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
