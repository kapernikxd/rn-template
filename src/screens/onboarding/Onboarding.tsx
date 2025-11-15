import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_OPTIONS, normalizeLanguageCode } from '../../constants/languages';
import { ZODIAC_OPTIONS } from '../../constants/zodiac';
import { mergeProfileInfo } from '../../helpers/profile/profileInfoStorage';
import { setPreferredLanguage } from '../../helpers/i18n/languageStorage';

type OnboardingStep = 'language' | 'zodiac';

interface Props {
  onFinish: () => void;
}

const STEPS: OnboardingStep[] = ['language', 'zodiac'];

const Onboarding: React.FC<Props> = ({ onFinish }) => {
  const { theme, typography, sizes } = useTheme();
  const { t, i18n } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedLanguageCode =
    normalizeLanguageCode(i18n.resolvedLanguage) ??
    normalizeLanguageCode(i18n.language) ??
    LANGUAGE_OPTIONS[0].code;
  const [selectedLanguage, setSelectedLanguage] = useState<string>(resolvedLanguageCode);
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);

  const styles = useMemo(
    () => getStyles({ theme, sizes }),
    [sizes, theme],
  );

  const step = STEPS[currentStepIndex];
  const totalSteps = STEPS.length;

  const stepTitle =
    step === 'language'
      ? t('screens.onboarding.steps.language.title')
      : t('screens.onboarding.steps.zodiac.title');
  const stepDescription =
    step === 'language'
      ? t('screens.onboarding.steps.language.description')
      : t('screens.onboarding.steps.zodiac.description');

  const isNextDisabled =
    step === 'language'
      ? !selectedLanguage
      : !selectedZodiac || isSubmitting;

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    void i18n.changeLanguage(languageCode);
  };

  const handleNext = async () => {
    if (step === 'language') {
      setCurrentStepIndex(1);
      return;
    }

    if (!selectedLanguage || !selectedZodiac || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await Promise.all([
        setPreferredLanguage(selectedLanguage),
        mergeProfileInfo({ zodiacSign: selectedZodiac }),
      ]);
      onFinish();
    } catch (error) {
      console.warn('Failed to complete onboarding', error);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((index) => index - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepCounter}>
          {t('screens.onboarding.stepCounter', { current: currentStepIndex + 1, total: totalSteps })}
        </Text>
        <Text style={[typography.titleH3, styles.title]}>{stepTitle}</Text>
        <Text style={[typography.body, styles.description]}>{stepDescription}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'language' ? (
          <View style={styles.optionsGrid}>
            {LANGUAGE_OPTIONS.map((language) => {
              const isSelected = language.code === selectedLanguage;

              return (
                <TouchableOpacity
                  key={language.code}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  activeOpacity={0.8}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <Text
                    style={[typography.body, styles.optionLabel, isSelected && styles.optionLabelSelected]}
                  >
                    {t(language.translationKey, { defaultValue: language.fallbackLabel })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.optionsGrid}>
            {ZODIAC_OPTIONS.map((zodiac) => {
              const isSelected = zodiac.value === selectedZodiac;

              return (
                <TouchableOpacity
                  key={zodiac.value}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedZodiac(zodiac.value)}
                >
                  <Text
                    style={[typography.body, styles.optionLabel, isSelected && styles.optionLabelSelected]}
                  >
                    {t(zodiac.translationKey, { defaultValue: zodiac.fallbackLabel })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'zodiac' ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.secondaryButton}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>{t('screens.onboarding.back')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.secondaryButtonPlaceholder} />
        )}

        <TouchableOpacity
          onPress={handleNext}
          disabled={isNextDisabled}
          style={[styles.primaryButton, isNextDisabled && styles.primaryButtonDisabled]}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {step === 'zodiac' ? t('screens.onboarding.start') : t('screens.onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = ({
  theme,
  sizes,
}: {
  theme: any;
  sizes: any;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: sizes.lg,
      paddingTop: sizes.lg,
      paddingBottom: sizes.xl,
    },
    header: {
      gap: sizes.xs,
    },
    stepCounter: {
      color: theme.greyText,
      fontSize: sizes.sm,
    },
    title: {
      textAlign: 'left',
    },
    description: {
      color: theme.greyText,
    },
    scroll: {
      flex: 1,
      marginTop: sizes.lg,
    },
    content: {
      paddingBottom: sizes.lg,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sizes.sm,
    },
    option: {
      flexBasis: '48%',
      minHeight: 56,
      borderRadius: sizes.md,
      borderWidth: 1,
      borderColor: theme.divider,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: sizes.md,
    },
    optionSelected: {
      borderColor: theme.primary,
      backgroundColor: `${theme.primary}14`,
    },
    optionLabel: {
      color: theme.text,
      textAlign: 'center',
    },
    optionLabelSelected: {
      color: theme.primary,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: sizes.lg,
      gap: sizes.sm,
    },
    secondaryButton: {
      paddingVertical: sizes.sm,
      paddingHorizontal: sizes.lg,
    },
    secondaryButtonPlaceholder: {
      width: 1,
    },
    secondaryButtonText: {
      color: theme.greyText,
    },
    primaryButton: {
      flex: 1,
      borderRadius: sizes.md,
      backgroundColor: theme.primary,
      paddingVertical: sizes.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonDisabled: {
      backgroundColor: theme.disabled ?? theme.divider,
    },
    primaryButtonText: {
      color: theme.background,
      fontWeight: '600',
      fontSize: sizes.md,
    },
  });

export default Onboarding;
