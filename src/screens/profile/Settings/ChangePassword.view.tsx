import React, { FC } from 'react';
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
  const { theme } = useTheme();
  const styles = getStyles({ theme });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormProvider {...methods}>
          <HeaderDefault title="Change Password" onBackPress={onBackPress} />

          <ScrollView style={{ flex: 1 }}>
            <CardContainer
              style={styles.card}
              styleTitleContainer={styles.cardTitleContainer}
              subTitle="Change your account password"
            >
              <View style={styles.cardContent}>
                <TextInput
                  name="oldPassword"
                  label="Old Password"
                  placeholder="Enter password"
                  secureTextEntry
                  control={methods.control}
                  rules={{
                    required: 'Password is required!',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters!',
                    },
                  }}
                />
                <Spacer />

                <TextInput
                  name="password"
                  label="New Password"
                  placeholder="Enter new password"
                  secureTextEntry
                  control={methods.control}
                  rules={{
                    required: 'Password is required!',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters!',
                    },
                  }}
                />
                <Spacer />

                <TextInput
                  name="rePassword"
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  secureTextEntry
                  control={methods.control}
                  rules={{
                    required: 'Confirm Password is required!',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters!',
                    },
                    validate: (value: string) =>
                      value === methods.getValues('password') || 'Passwords do not match!',
                  }}
                />
              </View>
            </CardContainer>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Update" onPress={onSubmit} loading={isSubmitting} />
            <Spacer size="xs" />
            <Button title="Reset" type="gray-outline" onPress={onReset} />
          </View>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

