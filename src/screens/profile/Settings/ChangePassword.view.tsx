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

type ChangePasswordForm = {
  oldPassword: string;
  password: string;
  rePassword: string;
};

type ChangePasswordViewProps = {
  methods: UseFormReturn<ChangePasswordForm>;
  onSubmit: () => void;
  onReset: () => void;
  onBackPress: () => void;
  isSubmitting: boolean;
};

export const ChangePasswordView: FC<ChangePasswordViewProps> = ({
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
        <HeaderDefault title="Смена пароля" onBackPress={onBackPress} />

        <ScrollView style={{ flex: 1 }}>
          <CardContainer
            style={styles.card}
            styleTitleContainer={styles.cardTitleContainer}
            subTitle="Измените пароль аккаунта"
          >
            <View style={styles.cardContent}>
              <TextInput
                name="oldPassword"
                label="Текущий пароль"
                placeholder="Введите пароль"
                secureTextEntry
                control={methods.control}
                rules={{
                  required: 'Введите пароль!',
                  minLength: {
                    value: 6,
                    message: 'Пароль должен содержать не менее 6 символов!',
                  },
                }}
              />
              <Spacer />

              <TextInput
                name="password"
                label="Новый пароль"
                placeholder="Введите новый пароль"
                secureTextEntry
                control={methods.control}
                rules={{
                  required: 'Введите пароль!',
                  minLength: {
                    value: 6,
                    message: 'Пароль должен содержать не менее 6 символов!',
                  },
                }}
              />
              <Spacer />

              <TextInput
                name="rePassword"
                label="Подтверждение пароля"
                placeholder="Повторите новый пароль"
                secureTextEntry
                control={methods.control}
                rules={{
                  required: 'Подтвердите пароль!',
                  minLength: {
                    value: 6,
                    message: 'Пароль должен содержать не менее 6 символов!',
                  },
                  validate: (value: string) =>
                    value === methods.getValues('password') || 'Пароли не совпадают!',
                }}
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

