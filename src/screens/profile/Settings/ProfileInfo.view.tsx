import React, { FC, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, useForm } from 'react-hook-form';
import { IOScrollView } from 'react-native-intersection-observer';

import { TextArea, TextInput } from '../../../components/form';
import { UpdateProfileProps } from '../../../types/profile';
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';
import { useTranslation } from 'react-i18next';
import { usePortalNavigation } from '../../../helpers/hooks';

type EditProfileFormValues = Pick<
  UpdateProfileProps,
  'name' | 'lastname' | 'profession' | 'phone' | 'userBio'
>;

export const ProfileInfoView: FC = () => {
  const { theme } = useTheme();
  const { setColors } = useSafeAreaColors();
  const { goBack } = usePortalNavigation();
  const { t } = useTranslation();
  const styles = getStyles({ theme });

  // ✅ Локальный метод — здесь!
  const methods = useForm<EditProfileFormValues>({
    defaultValues: {
      name: '',
      lastname: '',
      profession: '',
      phone: '',
      userBio: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    setColors({
      topColor: theme.white,
      bottomColor: theme.white,
    });
  }, [theme, setColors]);

  // метод отправки
  const onSubmit = handleSubmit((values) => {
    console.log('submit values:', values);
    // тут твоя логика обновления профиля
  });

  const onReset = () => reset();

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
                name="name"
                label={t('settings.editProfile.fields.name.label')}
                placeholder={t('settings.editProfile.fields.name.placeholder')}
                control={methods.control}
                rules={{
                  required: t('settings.editProfile.validation.nameRequired'),
                }}
              />

              <Spacer />

              <TextArea
                name="userBio"
                label={t('settings.editProfile.fields.userBio.label')}
                placeholder={t('settings.editProfile.fields.userBio.placeholder')}
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
    },
    cardTitleContainer: {
      paddingTop: 0,
    },
    cardContent: {
      marginHorizontal: 16,
      marginVertical: 16,
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
  });
