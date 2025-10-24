import React, { FC, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { TextInput } from '../../../components/form';
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';

type SocialProfilesForm = {
  facebook?: string;
  instagram?: string;
  vk?: string;
  tg?: string;
};

type SocialProfilesViewProps = {
  methods: UseFormReturn<SocialProfilesForm>;
  onSubmit: () => void;
  onReset: () => void;
  onBackPress: () => void;
  isSubmitting: boolean;
};

export const SocialProfilesView: FC<SocialProfilesViewProps> = ({
  methods,
  onSubmit,
  onReset,
  onBackPress,
  isSubmitting,
}) => {
  const { theme, isDark } = useTheme();
  const { setColors } = useSafeAreaColors();
  const styles = getStyles({ theme });

  const iconStyle = { marginRight: 10 };

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
        <HeaderDefault title="Социальные профили" onBackPress={onBackPress} />

        <ScrollView style={{ flex: 1 }}>
          <CardContainer
            style={styles.card}
            styleTitleContainer={styles.cardTitleContainer}
            subTitle="Добавьте ссылки на свои профили"
          >
            <View style={styles.cardContent}>
              <TextInput
                name="facebook"
                label="Facebook"
                icon={
                  <FontAwesome
                    name="facebook-official"
                    size={20}
                    color={theme.greyText}
                    style={iconStyle}
                  />
                }
                placeholder="Введите имя пользователя"
                control={methods.control}
                keyboardType="default"
              />
              <Spacer />
              <TextInput
                name="instagram"
                label="Instagram"
                icon={
                  <FontAwesome
                    name="instagram"
                    size={20}
                    color={theme.greyText}
                    style={iconStyle}
                  />
                }
                placeholder="Введите имя пользователя"
                control={methods.control}
                keyboardType="default"
              />
              <Spacer />
              <TextInput
                name="vk"
                label="VK"
                icon={
                  <FontAwesome
                    name="vk"
                    size={20}
                    color={theme.greyText}
                    style={iconStyle}
                  />
                }
                placeholder="Введите имя пользователя"
                control={methods.control}
                keyboardType="default"
              />
              <Spacer />
              <TextInput
                name="tg"
                label="Telegram"
                icon={
                  <FontAwesome
                    name="telegram"
                    size={20}
                    color={theme.greyText}
                    style={iconStyle}
                  />
                }
                placeholder="Введите имя пользователя"
                control={methods.control}
                keyboardType="default"
              />
              <Spacer />
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

