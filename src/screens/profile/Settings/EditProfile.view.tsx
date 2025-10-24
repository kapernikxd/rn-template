import React, { FC, useEffect } from 'react';
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
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';

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
        <HeaderDefault title="Редактирование профиля" onBackPress={onBackPress} />
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
            subTitle="Заполните личную информацию"
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
                label="Имя"
                placeholder="Имя"
                control={methods.control}
                keyboardType="default"
                rules={{
                  required: 'Введите имя!',
                }}
              />
              <Spacer />

              <TextInput
                name="lastname"
                label="Фамилия"
                placeholder="Фамилия"
                control={methods.control}
                keyboardType="default"
                rules={{
                  required: 'Введите фамилию!',
                }}
              />
              <Spacer />

              <TextInput
                name="profession"
                label="Профессия"
                placeholder="Ваша профессия"
                control={methods.control}
                keyboardType="default"
              />
              <Spacer />

              <TextInput
                name="phone"
                label="Номер телефона"
                placeholder="Введите номер телефона"
                control={methods.control}
                keyboardType="numeric"
              />
              <Spacer />

              <TextArea
                name="userBio"
                label="О себе"
                placeholder="Краткая информация о вас"
                control={methods.control}
              />
            </View>

            <View style={styles.footer}>
              <Button title="Обновить" onPress={onSubmit} loading={isSubmitting} />
              <Spacer size="xs" />
              <Button title="Сбросить" type="gray-outline" onPress={onReset} />
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

