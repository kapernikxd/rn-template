import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';
import { getTodayTitle, splitHoroscopeIntoParagraphs } from './HoroscopeDescription';
import { renderBoldText } from '../../../helpers/utils/text';

type HoroscopeModalProps = {
    visible: boolean;
    onClose: () => void;
    title: string;
    accent: string;
    horoscope?: string;
    isLoading: boolean;
    errorMessage?: string;
    onRetry: () => void;
};

export const HoroscopeModal: React.FC<HoroscopeModalProps> = ({
    visible,
    onClose,
    title,
    accent,
    horoscope,
    isLoading,
    errorMessage,
    onRetry,
}) => {
    const { theme, typography, sizes } = useTheme();
    const { t } = useTranslation();

    const styles = useMemo(
        () =>
            StyleSheet.create({
                contentWrapper: {
                    width: '100%',
                    maxWidth: 500,
                    alignSelf: 'center',
                    backgroundColor: theme.card,
                    borderRadius: sizes.radius_lg,
                    padding: sizes.lg,
                },
                backdrop: {
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: sizes.lg,
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
                },
                title: {
                    ...typography.titleH5,
                },
                closeButton: {
                    padding: sizes.xs as number,
                },
                accentLine: {
                    height: 4,
                    borderRadius: sizes.radius as number,
                    backgroundColor: accent,
                },
                date: {
                    ...typography.bodySm,
                    color: theme.greyText,
                },
                body: {
                    gap: sizes.xs as number,
                },
                paragraph: {
                    ...typography.body,
                    lineHeight: 22,
                },
                boldText: {
                    fontWeight: '700',
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
        [accent, sizes, theme.card, theme.greyText, theme.title, typography.body, typography.bodySm, typography.titleH5],
    );

    const paragraphs = useMemo(() => splitHoroscopeIntoParagraphs(horoscope), [horoscope]);
    const todayTitle = useMemo(() => getTodayTitle(), []);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={[styles.backdrop, { flex: 1 }]}>
                <View style={styles.contentWrapper}>
                    <ScrollView
                        style={{}}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>{title || t('screens.dashboard.horoscope.modal.defaultTitle')}</Text>
                            <Pressable
                                onPress={onClose}
                                style={styles.closeButton}
                                accessibilityRole="button"
                                accessibilityLabel={t('screens.dashboard.horoscope.modal.closeAccessibility')}
                                hitSlop={8}
                            >
                                <Feather name="x" size={20} color={theme.title} />
                            </Pressable>
                        </View>

                        <View style={[styles.accentLine, { backgroundColor: accent }]} />
                        <Text style={styles.date}>{todayTitle}</Text>

                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color={theme.title} />
                                <Text style={styles.helperText}>{t('screens.dashboard.horoscope.loading')}</Text>
                            </View>
                        ) : errorMessage ? (
                            <View style={styles.messageContainer}>
                                <Text style={styles.errorText}>{t('screens.dashboard.horoscope.errorTitle')}</Text>
                                <Text style={styles.helperText}>{errorMessage}</Text>
                                <Pressable onPress={onRetry} style={styles.retryButton}>
                                    <Text style={styles.retryText}>{t('screens.dashboard.horoscope.retry')}</Text>
                                </Pressable>
                            </View>
                        ) : paragraphs.length > 0 ? (
                            <View style={styles.body}>
                                {paragraphs.map((p, i) => (
                                    <Text key={i} style={styles.paragraph}>
                                        {renderBoldText(p, styles.boldText, `modal-${i}`)}
                                    </Text>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.helperText}>
                                {t('screens.dashboard.horoscope.modal.emptyState')}
                            </Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
