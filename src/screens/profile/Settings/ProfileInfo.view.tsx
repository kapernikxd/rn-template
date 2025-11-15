import React, { FC, useCallback, useEffect, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { SIZES, ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, useForm } from 'react-hook-form';
import { IOScrollView } from 'react-native-intersection-observer';

import { Select, TextInput } from '../../../components/form';
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
  clearProfileInfo,
  createEmptyProfileInfo,
  getProfileInfo,
  saveProfileInfo,
} from '../../../helpers/profile';
import type { ProfileInfoData } from '../../../helpers/profile';
import { useRootStore } from '../../../store/StoreProvider';
import { ProfileNav } from '../../../navigation';

export const ProfileInfoView: FC = () => {
  const { theme } = useTheme();
  const { setColors } = useSafeAreaColors();
  const navigation = useNavigation<ProfileNav>();
  const { t } = useTranslation();
  const styles = getStyles({ theme });
  const { uiStore } = useRootStore();

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  // ✅ Локальный метод — здесь!
  const methods = useForm<ProfileInfoData>({
    defaultValues: createEmptyProfileInfo(),
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const maritalStatus = watch('maritalStatus');

  useEffect(() => {
    setColors({
      topColor: theme.white,
      bottomColor: theme.white,
    });
  }, [theme, setColors]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await getProfileInfo();
        reset(storedProfile);
      } catch (error) {
        console.warn('Failed to load profile info', error);
      }
    };

    loadProfile();
  }, [reset]);

  // метод отправки
  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveProfileInfo(values);
      uiStore.showSnackbar(t('settings.editProfile.snackbar.updated'), 'success');
    } catch (error) {
      console.warn('Failed to save profile info', error);
    }
  });

  const onReset = async () => {
    reset(createEmptyProfileInfo());
    try {
      await clearProfileInfo();
    } catch (error) {
      console.warn('Failed to clear profile info', error);
    }
  };

  const genderOptions = useMemo(
    () => [
      { label: t('settings.editProfile.options.gender.male'), value: 'male' },
      { label: t('settings.editProfile.options.gender.female'), value: 'female' },
    ],
    [t],
  );

  const zodiacOptions = useMemo(
    () => [
      { label: t('common.zodiac.aries'), value: 'aries' },
      { label: t('common.zodiac.taurus'), value: 'taurus' },
      { label: t('common.zodiac.gemini'), value: 'gemini' },
      { label: t('common.zodiac.cancer'), value: 'cancer' },
      { label: t('common.zodiac.leo'), value: 'leo' },
      { label: t('common.zodiac.virgo'), value: 'virgo' },
      { label: t('common.zodiac.libra'), value: 'libra' },
      { label: t('common.zodiac.scorpio'), value: 'scorpio' },
      { label: t('common.zodiac.sagittarius'), value: 'sagittarius' },
      { label: t('common.zodiac.capricorn'), value: 'capricorn' },
      { label: t('common.zodiac.aquarius'), value: 'aquarius' },
      { label: t('common.zodiac.pisces'), value: 'pisces' },
    ],
    [t],
  );

  const maritalStatusOptions = useMemo(
    () => [
      { label: t('settings.editProfile.options.maritalStatus.single'), value: 'single' },
      { label: t('settings.editProfile.options.maritalStatus.inRelationship'), value: 'in_relationship' },
    ],
    [t],
  );

  const hasChildrenOptions = useMemo(
    () => [
      { label: t('settings.editProfile.options.hasChildren.no'), value: 'no' },
      { label: t('settings.editProfile.options.hasChildren.yes'), value: 'yes' },
    ],
    [t],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FormProvider {...methods}>
        <HeaderDefault title={t('settings.editProfile.title')} onBackPress={handleBackPress} />

        <IOScrollView style={{ flex: 1 }}>
          <CardContainer
            style={styles.card}
            styleTitleContainer={styles.cardTitleContainer}
            subTitle={t('settings.editProfile.subtitle')}
          >
            <View style={styles.cardContent}>
              <TextInput
                name="username"
                label={t('settings.editProfile.fields.username.label')}
                placeholder={t('settings.editProfile.fields.username.placeholder')}
                control={methods.control}
              />

              <Spacer size='md'/>

              <Select
                name="gender"
                label={t('settings.editProfile.fields.gender.label')}
                placeholder={t('settings.editProfile.fields.gender.placeholder')}
                options={genderOptions}
                control={methods.control}
              />

              <Spacer size='md'/>

              <Select
                name="zodiacSign"
                label={t('settings.editProfile.fields.zodiacSign.label')}
                placeholder={t('settings.editProfile.fields.zodiacSign.placeholder')}
                options={zodiacOptions}
                control={methods.control}
                rules={{ required: t('settings.editProfile.validation.zodiacSignRequired') }}
              />

              <Spacer size='md'/>

              <TextInput
                name="age"
                label={t('settings.editProfile.fields.age.label')}
                placeholder={t('settings.editProfile.fields.age.placeholder')}
                control={methods.control}
                keyboardType="number-pad"
                rules={{
                  pattern: {
                    value: /^\d+$/,
                    message: t('settings.editProfile.validation.ageDigits'),
                  },
                }}
              />

              <Spacer size='md'/>

              <Select
                name="maritalStatus"
                label={t('settings.editProfile.fields.maritalStatus.label')}
                placeholder={t('settings.editProfile.fields.maritalStatus.placeholder')}
                options={maritalStatusOptions}
                control={methods.control}
              />

              {maritalStatus === 'in_relationship' && (
                <>
                  <Spacer size='md'/>
                  <TextInput
                    name="partnerName"
                    label={t('settings.editProfile.fields.partnerName.label')}
                    placeholder={t('settings.editProfile.fields.partnerName.placeholder')}
                    control={methods.control}
                  />
                </>
              )}

              <Spacer size='md'/>

              <Select
                name="hasChildren"
                label={t('settings.editProfile.fields.hasChildren.label')}
                placeholder={t('settings.editProfile.fields.hasChildren.placeholder')}
                options={hasChildrenOptions}
                control={methods.control}
              />
            </View>

            <View style={styles.footer}>
              <Button title={t('common.update')} onPress={onSubmit} loading={isSubmitting} />
              <Spacer size="xs" />
              <Button title={t('common.reset')} type="gray-outline" onPress={onReset} />
            </View>
          </CardContainer>
        </IOScrollView>
      </FormProvider>
    </KeyboardAvoidingView>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    card: {
      padding: 0,
      marginVertical: 4,
      borderBottomWidth: 0,
      paddingHorizontal: 0,
    },
    cardTitleContainer: {
      paddingTop: 0,
    },
    cardContent: {
      marginHorizontal: SIZES.xxs,
      marginVertical: 16,
    },
    footer: {
      marginHorizontal: SIZES.xxs,
      paddingVertical: 8,
    },
  });
