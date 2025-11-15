import { FC, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeType, SizesType, GlobalStyleSheetType } from 'rn-vs-lb/theme';
import { LANGUAGE_OPTIONS, normalizeLanguageCode, LanguageOption } from '../../constants/languages';
import { setPreferredLanguage } from '../../helpers/i18n/languageStorage';

export const LanguageSelector: FC = () => {
  const { theme, sizes, globalStyleSheet } = useTheme();
  const { i18n, t } = useTranslation();
  const styles = useMemo(() => getStyles({ theme, sizes, globalStyleSheet }), [globalStyleSheet, sizes, theme]);
  const [isModalVisible, setModalVisible] = useState(false);

  const resolvedLanguageCode =
    normalizeLanguageCode(i18n.resolvedLanguage) ??
    normalizeLanguageCode(i18n.language) ??
    LANGUAGE_OPTIONS[0].code;
  const selectedLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((language) => language.code === resolvedLanguageCode) ?? LANGUAGE_OPTIONS[0],
    [resolvedLanguageCode],
  );

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleLanguageSelect = async (language: LanguageOption) => {
    if (language.code === resolvedLanguageCode) {
      closeModal();
      return;
    }

    try {
      await setPreferredLanguage(language.code);
      await i18n.changeLanguage(language.code);
    } catch (error) {
      console.warn('Failed to change language', error);
    } finally {
      closeModal();
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={openModal} activeOpacity={0.8}>
        <Text style={styles.triggerValue}>
          {t(selectedLanguage.translationKey, { defaultValue: selectedLanguage.fallbackLabel })}
        </Text>
      </TouchableOpacity>

      <Modal transparent animationType='fade' visible={isModalVisible} onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.modalContainer} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('settings.component.language.modalTitle')}</Text>
            <View style={styles.optionsContainer}>
              {LANGUAGE_OPTIONS.map((language) => {
                const isSelected = language.code === selectedLanguage.code;

                return (
                  <TouchableOpacity
                    key={language.code}
                    onPress={() => {
                      void handleLanguageSelect(language);
                    }}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {t(language.translationKey, { defaultValue: language.fallbackLabel })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const getStyles = ({
  theme,
  sizes,
  globalStyleSheet,
}: {
  theme: ThemeType;
  sizes: SizesType;
  globalStyleSheet: GlobalStyleSheetType;
}) =>
  StyleSheet.create({
    trigger: {
      justifyContent: "flex-end",
      alignItems: "center",
      borderRadius: sizes.sm,
      backgroundColor: theme.card,
    },
    triggerLabel: {
      color: theme.text,
    },
    triggerValue: {
      color: theme.primary,
      fontWeight: '600',
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: sizes.lg,
    },
    modalContainer: {
      width: '100%',
      borderRadius: sizes.md,
      backgroundColor: theme.background,
      paddingVertical: sizes.lg,
      paddingHorizontal: sizes.lg,
      gap: sizes.md,
    },
    modalTitle: {
      color: theme.text,
      fontSize: sizes.lg,
      fontWeight: '600',
    },
    optionsContainer: {
      gap: sizes.xs,
    },
    option: {
      borderRadius: sizes.sm,
      paddingVertical: sizes.sm,
      paddingHorizontal: sizes.md,
      backgroundColor: theme.card,
    },
    optionSelected: {
      backgroundColor: theme.background,
    },
    optionLabel: {
      color: theme.text,
    },
    optionLabelSelected: {
      color: theme.primary,
      fontWeight: '600',
    },
  });

export default LanguageSelector;
