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
import { FormProvider, useForm } from 'react-hook-form';
import { observer } from 'mobx-react-lite';

import { TextInput } from '../../../components/form';
import { useRootStore } from '../../../store/StoreProvider';
import { usePortalNavigation } from '../../../helpers/hooks';

export const AccountSettingsScreen: FC = observer(() => {
  const { theme } = useTheme();
  const styles = getStyles({ theme });
  const { profileStore, authStore, uiStore } = useRootStore();
  const { goBack } = usePortalNavigation();
  const methods = useForm({
    defaultValues: {
      username: profileStore.myProfile?.username,
      email: authStore.user?.email,
    },
  });

  const handleSubmit = methods.handleSubmit(async (data: { email: string | undefined, username: string | undefined }) => {
    try {
      await profileStore.updateProfile({ username: data.username })
      uiStore.showSnackbar('Udpated', 'success')
    }
    catch {
      uiStore.showSnackbar('Failed', 'error')
    }
  });

  const handleReset = () => {
    methods.reset();
  };

  useEffect(() => {
    if (!profileStore.myProfile?.id) {
      profileStore.fetchMyProfile();
    }
  }, [profileStore, profileStore.myProfile?.id]);

  useEffect(() => {
    methods.reset({
      username: profileStore.myProfile?.username ?? '',
      email: authStore.user?.email ?? '',
    });
  }, [profileStore.myProfile?.username, authStore.user?.email, methods]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormProvider {...methods}>
          <HeaderDefault title="Account Setting" onBackPress={goBack} />

          {/* Прокручиваемая часть с полями ввода */}
          <ScrollView
            style={{ flex: 1 }}
          >
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

          {/* Футер с кнопками внизу экрана */}
          <View style={styles.footer}>
            <Button title="Update" onPress={handleSubmit} />
            <Spacer size="xs" />
            <Button
              title="Reset"
              type="gray-outline"
              onPress={handleReset}
            />
          </View>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const getStyles = ({ theme }: { theme: ThemeType }) => StyleSheet.create({
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
