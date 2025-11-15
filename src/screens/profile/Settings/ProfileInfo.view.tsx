import React, { FC, useEffect } from 'react';
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
import { usePortalNavigation } from '../../../helpers/hooks';
import {
  clearProfileInfo,
  createEmptyProfileInfo,
  getProfileInfo,
  saveProfileInfo,
} from '../../../helpers/profile';
import type { ProfileInfoData } from '../../../helpers/profile';
import { useRootStore } from '../../../store/StoreProvider';

export const ProfileInfoView: FC = () => {
  const { theme } = useTheme();
  const { setColors } = useSafeAreaColors();
  const { goBack } = usePortalNavigation();
  const { t } = useTranslation();
  const styles = getStyles({ theme });
  const { uiStore } = useRootStore();

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
      uiStore.showSnackbar('Обновлено', 'success');
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

  const genderOptions = [
    { label: 'Мужской', value: 'male' },
    { label: 'Женский', value: 'female' },
  ];

  const zodiacOptions = [
    { label: 'Овен', value: 'aries' },
    { label: 'Телец', value: 'taurus' },
    { label: 'Близнецы', value: 'gemini' },
    { label: 'Рак', value: 'cancer' },
    { label: 'Лев', value: 'leo' },
    { label: 'Дева', value: 'virgo' },
    { label: 'Весы', value: 'libra' },
    { label: 'Скорпион', value: 'scorpio' },
    { label: 'Стрелец', value: 'sagittarius' },
    { label: 'Козерог', value: 'capricorn' },
    { label: 'Водолей', value: 'aquarius' },
    { label: 'Рыбы', value: 'pisces' },
  ];

  const maritalStatusOptions = [
    { label: 'Одинок', value: 'single' },
    { label: 'В отношениях', value: 'in_relationship' },
  ];

  const hasChildrenOptions = [
    { label: 'Нет', value: 'no' },
    { label: 'Да', value: 'yes' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FormProvider {...methods}>
        <HeaderDefault title={t('settings.editProfile.title')} onBackPress={goBack} />

        <IOScrollView style={{ flex: 1 }}>
          <CardContainer
            style={styles.card}
            styleTitleContainer={styles.cardTitleContainer}
            subTitle={t('settings.editProfile.subtitle')}
          >
            <View style={styles.cardContent}>
              <TextInput
                name="username"
                label="Имя пользователя"
                placeholder="Введите имя пользователя"
                control={methods.control}
              />

              <Spacer size='md'/>

              <Select
                name="gender"
                label="Пол"
                placeholder="Выберите пол"
                options={genderOptions}
                control={methods.control}
              />

              <Spacer size='md'/>

              <Select
                name="zodiacSign"
                label="Знак зодиака"
                placeholder="Выберите знак зодиака"
                options={zodiacOptions}
                control={methods.control}
                rules={{ required: 'Выберите знак зодиака' }}
              />

              <Spacer size='md'/>

              <TextInput
                name="age"
                label="Возраст"
                placeholder="Введите возраст"
                control={methods.control}
                keyboardType="number-pad"
                rules={{
                  pattern: {
                    value: /^\d+$/,
                    message: 'Возраст должен содержать только цифры',
                  },
                }}
              />

              <Spacer size='md'/>

              <Select
                name="maritalStatus"
                label="Семейное положение"
                placeholder="Выберите семейное положение"
                options={maritalStatusOptions}
                control={methods.control}
              />

              {maritalStatus === 'in_relationship' && (
                <>
                  <Spacer size='md'/>
                  <TextInput
                    name="partnerName"
                    label="Имя партнёра"
                    placeholder="Введите имя партнёра"
                    control={methods.control}
                  />
                </>
              )}

              <Spacer size='md'/>

              <Select
                name="hasChildren"
                label="Есть ли дети"
                placeholder="Выберите вариант"
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
