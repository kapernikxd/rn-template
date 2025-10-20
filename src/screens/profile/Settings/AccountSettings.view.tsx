import React, { FC } from 'react';
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
import { MainLayout } from '../../../components';

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
  const styles = getStyles({ theme });

  return (
    <MainLayout
      contentStyle={styles.container}
      topBackgroundColor={theme.background}
      bottomBackgroundColor={theme.backgroundSecond}
      backgroundSplit={0.35}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormProvider {...methods}>
          <HeaderDefault title="Account Setting" onBackPress={onBackPress} />

          <ScrollView style={{ flex: 1 }}>
            <CardContainer
              style={styles.card}
              styleTitleContainer={styles.cardTitleContainer}
              subTitle="Update your username and manage your account"
            >
              <View style={styles.cardContent}>
                <TextInput
                  name="username"
                  label="Username"
                  placeholder="Enter username"
                  control={methods.control}
                  keyboardType="default"
                />
                <Spacer />
                <TextInput
                  name="email"
                  label="Email"
                  placeholder="Enter your email"
                  control={methods.control}
                  keyboardType="default"
                  editable={false}
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
    </MainLayout>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) =>
  StyleSheet.create({
    container: { flex: 1 },
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

