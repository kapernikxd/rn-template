import React, { FC } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';

interface Props {
  visible: boolean;
  onAction: () => void;
}

export const NatalChartRequiredModal: FC<Props> = ({ visible, onAction }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles({ theme });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('screens.chats.natalChartModal.title')}</Text>
          <Text style={styles.modalDescription}>{t('screens.chats.natalChartModal.description')}</Text>
          <TouchableOpacity
            onPress={onAction}
            style={[styles.modalButton, { backgroundColor: theme.primary }]}
            activeOpacity={0.9}
          >
            <Text style={[styles.modalButtonText, { color: theme.white }]}>
              {t('screens.chats.natalChartModal.action')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: {
      width: '100%',
      borderRadius: 16,
      backgroundColor: theme.card,
      padding: 24,
      gap: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.title,
    },
    modalDescription: {
      fontSize: 16,
      color: theme.greyText,
      lineHeight: 22,
    },
    modalButton: {
      marginTop: 8,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },
  });

