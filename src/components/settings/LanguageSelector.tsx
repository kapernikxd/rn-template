import { FC, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, ThemeType, SizesType, GlobalStyleSheetType } from 'rn-vs-lb/theme';

interface LanguageOption {
  code: string;
  label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'sr', label: 'Srpski' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
];

export const LanguageSelector: FC = () => {
  const { theme, sizes, globalStyleSheet } = useTheme();
  const styles = useMemo(() => getStyles({ theme, sizes, globalStyleSheet }), [globalStyleSheet, sizes, theme]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGE_OPTIONS[0]);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleLanguageSelect = (language: LanguageOption) => {
    setSelectedLanguage(language);
    closeModal();
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={openModal} activeOpacity={0.8}>
        <Text style={styles.triggerValue}>{selectedLanguage.label}</Text>
      </TouchableOpacity>

      <Modal transparent animationType='fade' visible={isModalVisible} onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.modalContainer} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Выберите язык</Text>
            <View style={styles.optionsContainer}>
              {LANGUAGE_OPTIONS.map((language) => {
                const isSelected = language.code === selectedLanguage.code;

                return (
                  <TouchableOpacity
                    key={language.code}
                    onPress={() => handleLanguageSelect(language)}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {language.label}
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
