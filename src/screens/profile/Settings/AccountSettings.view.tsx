import React, { FC, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { TextInput } from '../../../components/form';
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';
import { useTranslation } from 'react-i18next';

type AccountSettingsFormValues = {
  username?: string;
  email?: string;
};

type AccountSettingsViewProps = {
  methods: UseFormReturn<AccountSettingsFormValues>;
  onSubmit: () => void;
  onReset: () => void;
  onBackPress: () => void;
  isSubmitting: boolean;
};

export const AccountSettingsView: FC<AccountSettingsViewProps> = ({
  methods,
  onSubmit,
  onReset,
  onBackPress,
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const { setColors } = useSafeAreaColors();
  const styles = getStyles({ theme });
  const { t } = useTranslation();

  useEffect(() => {
    setColors({
      topColor: theme.white,
      bottomColor: theme.white,
    });
  }, [theme, setColors]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FormProvider {...methods}>
        <HeaderDefault title={t('settings.account.title')} onBackPress={onBackPress} />

        <ScrollView style={{ flex: 1 }}>
          <CardContainer
            style={styles.card}
            styleTitleContainer={styles.cardTitleContainer}
            subTitle={t('settings.account.subtitle')}
          >
            <View style={styles.cardContent}>
              <TextInput
                name="username"
                label={t('settings.account.fields.username.label')}
                placeholder={t('settings.account.fields.username.placeholder')}
                control={methods.control}
                keyboardType="default"
              />
              <Spacer />
              <TextInput
                name="email"
                label={t('settings.account.fields.email.label')}
                placeholder={t('settings.account.fields.email.placeholder')}
                control={methods.control}
                keyboardType="default"
                editable={false}
              />
            </View>
          </CardContainer>
        </ScrollView>

        <View style={styles.footer}>
          <Button title={t('common.update')} onPress={onSubmit} loading={isSubmitting} />
          <Spacer size="xs" />
          <Button title={t('common.reset')} type="gray-outline" onPress={onReset} />
        </View>
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
