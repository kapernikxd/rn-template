import React, { FC } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, ProfilePhotoUpload, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { IOScrollView } from 'react-native-intersection-observer';

import { TextArea, TextInput } from '../../../components/form';
import { UpdateProfileProps } from '../../../types/profile';

type EditProfileFormValues = Pick<
  UpdateProfileProps,
  'name' | 'lastname' | 'profession' | 'phone' | 'userBio'
>;

type EditProfileViewProps = {
  methods: UseFormReturn<EditProfileFormValues>;
  refreshing: boolean;
  onRefresh: () => void;
  onSubmit: () => void;
  onReset: () => void;
  onBackPress: () => void;
  previewVisible: boolean;
  onRequestOpenPreview: () => void;
  onRequestClosePreview: () => void;
  onPressSelect: () => void;
  onPressRemove: () => void;
  onPressEye: () => void;
  localImageUri: string | null;
  isSubmitting: boolean;
};

export const EditProfileView: FC<EditProfileViewProps> = ({
  methods,
  refreshing,
  onRefresh,
  onSubmit,
  onReset,
  onBackPress,
  previewVisible,
  onRequestOpenPreview,
  onRequestClosePreview,
  onPressSelect,
  onPressRemove,
  onPressEye,
  localImageUri,
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const styles = getStyles({ theme });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormProvider {...methods}>
          <HeaderDefault title="Edit Profile" onBackPress={onBackPress} />
          <IOScrollView
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          >
            <CardContainer
              style={styles.card}
              styleTitleContainer={styles.cardTitleContainer}
              subTitle="Set Up Your Personal Information"
            >
              <View>
                <ProfilePhotoUpload
                  imageUri={localImageUri}
                  previewVisible={previewVisible}
                  onRequestOpenPreview={onRequestOpenPreview}
                  onRequestClosePreview={onRequestClosePreview}
                  onPressSelect={onPressSelect}
                  onPressRemove={onPressRemove}
                  onPressEye={onPressEye}
                />
              </View>
              <View style={styles.cardContent}>
                <TextInput
                  name="name"
                  label="First Name"
                  placeholder="First Name"
                  control={methods.control}
                  keyboardType="default"
                  rules={{
                    required: 'First Name is required!',
                  }}
                />
                <Spacer />

                <TextInput
                  name="lastname"
                  label="Last name"
                  placeholder="Last Name"
                  control={methods.control}
                  keyboardType="default"
                  rules={{
                    required: 'Last Name is required!',
                  }}
                />
                <Spacer />

                <TextInput
                  name="profession"
                  label="Profession"
                  placeholder="Your proffession"
                  control={methods.control}
                  keyboardType="default"
                />
                <Spacer />

                <TextInput
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter your phone number "
                  control={methods.control}
                  keyboardType="numeric"
                />
                <Spacer />

                <TextArea
                  name="userBio"
                  label="User Bio"
                  placeholder="Short information about you"
                  control={methods.control}
                />
              </View>

              <View style={styles.footer}>
                <Button title="Update" onPress={onSubmit} loading={isSubmitting} />
                <Spacer size="xs" />
                <Button title="Reset" type="gray-outline" onPress={onReset} />
              </View>
            </CardContainer>
          </IOScrollView>
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

