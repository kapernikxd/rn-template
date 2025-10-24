import React, { FC, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { TextInput } from '../../../components/form';
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';

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
  const { theme, isDark } = useTheme();
  const { setColors } = useSafeAreaColors();
  const styles = getStyles({ theme });

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
        <HeaderDefault title="Настройки аккаунта" onBackPress={onBackPress} />

        <ScrollView style={{ flex: 1 }}>
          <CardContainer
            style={styles.card}
            styleTitleContainer={styles.cardTitleContainer}
            subTitle="Обновите имя пользователя и управляйте аккаунтом"
          >
            <View style={styles.cardContent}>
              <TextInput
                name="username"
                label="Имя пользователя"
                placeholder="Введите имя пользователя"
                control={methods.control}
                keyboardType="default"
              />
              <Spacer />
              <TextInput
                name="email"
                label="Электронная почта"
                placeholder="Введите электронную почту"
                control={methods.control}
                keyboardType="default"
                editable={false}
              />
            </View>
          </CardContainer>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Обновить" onPress={onSubmit} loading={isSubmitting} />
          <Spacer size="xs" />
          <Button title="Сбросить" type="gray-outline" onPress={onReset} />
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

