import React, { FC, useState, useCallback, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '../../../../store/StoreProvider';
import { usePortalNavigation, usePushNotifications } from '../../../../helpers/hooks';

type NotificationType =
  | 'likes'
  | 'followers'
  | 'groupMessages'
  | 'participants'
  | 'newPost'
  | 'invites'
  | 'pollAnswers'
  | 'pollInvites';

interface FormValues {
  likes: boolean;
  followers: boolean;
  groupMessages: boolean;
  participants: boolean;
  newPost: boolean;
  invites: boolean;
  pollAnswers: boolean;
  pollInvites: boolean;
}

const NOTIFICATION_SETTINGS: {
  key: NotificationType;
  label: string;
  icon: React.ReactNode;
}[] = [
    { key: 'likes', label: 'Likes', icon: <FontAwesome name="heart-o" size={18} /> },
    { key: 'followers', label: 'Followers', icon: <Ionicons name="person-add-outline" size={18} /> },
    { key: 'groupMessages', label: 'Group Messages', icon: <FontAwesome name="comments-o" size={18} /> },
    { key: 'participants', label: 'Participants', icon: <Ionicons name="add-outline" size={18} /> },
    { key: 'newPost', label: 'Created/Updated Post', icon: <FontAwesome name="calendar-o" size={18} /> },
    { key: 'invites', label: 'Post Invites', icon: <FontAwesome name="calendar-plus-o" size={18} /> },
    { key: 'pollAnswers', label: 'Poll Answers', icon: <Ionicons name="bar-chart-outline" size={18} /> },
    { key: 'pollInvites', label: 'Poll Invites', icon: <Ionicons name="stats-chart-outline" size={18} /> },
  ];

export const NotificationSettingsScreen: FC = observer(() => {
  const { theme, globalStyleSheet, typography } = useTheme();
  const styles = getStyles({ theme });
  const { profileStore, uiStore, authStore } = useRootStore();
  const { goBack } = usePortalNavigation();
  const { expoPushToken, registerForPushNotificationsAsync } = usePushNotifications();

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const checkPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    if (granted && !expoPushToken) {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await authStore.sendPushToken(token);
      }
    }
  }, [expoPushToken, registerForPushNotificationsAsync, authStore]);

  useFocusEffect(
    useCallback(() => {
      checkPermission();
    }, [checkPermission])
  );

  const handlePermissionToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      if (granted) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await authStore.sendPushToken(token);
        }
      }
    } else {
      Linking.openSettings();
      setHasPermission(false);
    }
  };

  const myProfile = profileStore.myProfile;
  const initialSettings = myProfile?.pushNotificationSettings || {};

  const methods = useForm<FormValues>({
    defaultValues: {
      likes: initialSettings.likes ?? false,
      followers: initialSettings.followers ?? false,
      groupMessages: initialSettings.groupMessages ?? true,
      participants: initialSettings.participants ?? false,
      newPost: initialSettings.newPost ?? true,
      invites: initialSettings.invites ?? true,
      pollAnswers: initialSettings.pollAnswers ?? true,
      pollInvites: initialSettings.pollInvites ?? true,
    },
  });

  const handleSubmit = methods.handleSubmit(async (data: FormValues) => {
    try {
      await profileStore.updateProfile({
        pushNotificationSettings: data,
      });
      if (hasPermission) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await authStore.sendPushToken(token);
        }
      }
      uiStore.showSnackbar('Updated', 'success');
    } catch {
      uiStore.showSnackbar('Failed', 'error');
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
      likes: initialSettings.likes ?? false,
      followers: initialSettings.followers ?? false,
      groupMessages: initialSettings.groupMessages ?? true,
      participants: initialSettings.participants ?? false,
      newPost: initialSettings.newPost ?? true,
      invites: initialSettings.invites ?? true,
      pollAnswers: initialSettings.pollAnswers ?? true,
      pollInvites: initialSettings.pollInvites ?? true,
    });
  }, [
    initialSettings.likes,
    initialSettings.followers,
    initialSettings.groupMessages,
    initialSettings.participants,
    initialSettings.newPost,
    initialSettings.invites,
    initialSettings.pollAnswers,
    initialSettings.pollInvites,
    methods,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormProvider {...methods}>
          <HeaderDefault title="Notification Settings" onBackPress={goBack} />

          <ScrollView style={{ flex: 1 }}>
            <CardContainer
              style={styles.card}
              styleTitleContainer={styles.cardTitleContainer}
              subTitle="Update your push rules"
            >
              <View style={styles.cardContent}>
                <View>
                  <View style={globalStyleSheet.flexRowCenterBetween}>
                    <View style={globalStyleSheet.flexRowCenterCenter}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="notifications-outline" size={18} />
                      </View>
                      <View style={{ marginLeft: 8 }}>
                        <Spacer size="xs" />
                        <Text style={[typography.titleH6Regular, { color: theme.text }]}> 
                          Push Notifications
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={hasPermission}
                      onValueChange={handlePermissionToggle}
                      trackColor={{ false: theme.background4, true: theme.background4 }}
                      thumbColor={hasPermission ? theme.primary : theme.black}
                      style={styles.switch}
                    />
                  </View>
                  <Spacer />
                </View>

                {NOTIFICATION_SETTINGS.map(({ key, label, icon }) => (
                  <View key={key}>
                    <View style={globalStyleSheet.flexRowCenterBetween}>
                      <View style={globalStyleSheet.flexRowCenterCenter}>
                        <View style={styles.iconContainer}>{icon}</View>
                        <View style={{ marginLeft: 8 }}>
                          <Spacer size="xs" key={`spacer-${key}-top`} />
                          <Text style={[typography.titleH6Regular, { color: theme.text }]}>
                            {label}
                          </Text>
                        </View>
                      </View>

                      <Controller
                        name={key}
                        control={methods.control}
                        render={({ field: { value, onChange } }) => (
                          <Switch
                            value={value}
                            onValueChange={onChange}
                            trackColor={{ false: theme.background4, true: theme.background4 }}
                            thumbColor={value ? theme.primary : theme.black}
                            style={styles.switch}
                            disabled={!hasPermission}
                          />
                        )}
                      />
                    </View>
                    <Spacer key={`spacer-${key}-bottom`} />
                  </View>
                ))}

                <Spacer />
              </View>
            </CardContainer>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Update" onPress={handleSubmit} />
            <Spacer size="xs" />
            <Button title="Reset" type="gray-outline" onPress={handleReset} />
          </View>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const getStyles = ({ theme }: { theme: ThemeType }) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 4,
    left: 4,
    top: 3,
  },
  switch: {
    marginVertical: -4,
  },
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
