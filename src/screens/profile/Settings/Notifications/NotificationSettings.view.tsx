import React, { FC } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

type NotificationType =
  | 'likes'
  | 'followers'
  | 'groupMessages'
  | 'participants'
  | 'newPost'
  | 'invites'
  | 'pollAnswers'
  | 'pollInvites';

export type NotificationSettingsFormValues = {
  likes: boolean;
  followers: boolean;
  groupMessages: boolean;
  participants: boolean;
  newPost: boolean;
  invites: boolean;
  pollAnswers: boolean;
  pollInvites: boolean;
};

type NotificationSettingsViewProps = {
  methods: UseFormReturn<NotificationSettingsFormValues>;
  hasPermission: boolean;
  onPermissionToggle: (value: boolean) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBackPress: () => void;
  isSubmitting: boolean;
};

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

export const NotificationSettingsView: FC<NotificationSettingsViewProps> = ({
  methods,
  hasPermission,
  onPermissionToggle,
  onSubmit,
  onReset,
  onBackPress,
  isSubmitting,
}) => {
  const { theme, globalStyleSheet, typography } = useTheme();
  const styles = getStyles({ theme });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormProvider {...methods}>
          <HeaderDefault title="Notification Settings" onBackPress={onBackPress} />

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
                        <Text style={[typography.titleH6Regular, { color: theme.text }]}>Push Notifications</Text>
                      </View>
                    </View>
                    <Switch
                      value={hasPermission}
                      onValueChange={onPermissionToggle}
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
                          <Spacer size="xs" />
                          <Text style={[typography.titleH6Regular, { color: theme.text }]}>{label}</Text>
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
                    <Spacer />
                  </View>
                ))}

                <Spacer />
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

