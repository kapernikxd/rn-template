import { FC, useCallback, useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CardContainer,
  ListItem,
  Spacer,
  SettingsSection,
  ThemeSwitcher,
} from 'rn-vs-lb';
import { useTheme, ThemeType, SizesType, GlobalStyleSheetType, SIZES } from 'rn-vs-lb/theme';
import { appVersion } from '../../constants/links';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { RewardedAdSettingsCard } from '../../components/ads/components/RewardedAdSettingsCard';
import { LanguageSelector } from '../../components/settings/LanguageSelector';
import { truncateText } from '../../helpers/utils/common';
import SettingsListItem from '../../components/SettingsListItem';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ProfileNav } from '../../navigation';
import { useNavigation } from '@react-navigation/native';
import { useActions } from '../../helpers/hooks';



export const SettingsScreen: FC = () => {
  const { globalStyleSheet, theme, sizes, typography } = useTheme();
  const { setColors } = useSafeAreaColors();
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileNav>();
  const { handleShareAppLink } = useActions();


  const styles = getStyles({ globalStyleSheet, theme, sizes });
  const { uiStore, identityStore, configStore } = useRootStore();
  const userId = useStoreData(identityStore, (store) => store.userId);
  const adsEnabled = useStoreData(configStore, (store) => store.adsEnabled);
  const configUrls = useStoreData(configStore, (store) => store.urls);


  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
    void identityStore.ensureUserId();
  }, [identityStore, setColors, theme.background]);


    const COPY_LINK = useMemo(
      () => [
          { icon: 'copy', label: t('settings.section.copyAppLink'), action: handleShareAppLink },
      ],
      [handleShareAppLink, t],
  );

  const onCopy = async () => {
    if (userId) {
      await Clipboard.setStringAsync(userId);
      uiStore.showSnackbar(t('common.copy'), 'success');
    }
  }

  return (
    <View style={styles.content}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.list}>
          <SettingsSection
            title={t('settings.section.userTitle')}
            style={styles.section}
          >
            <View style={styles.cardWithoutH}>
              <Pressable onPress={onCopy} style={styles.cardWithoutH}>
                <SettingsListItem
                  label={t('settings.section.userID')}
                  laberColor={theme.text}
                  value={userId ? truncateText(userId, 18) : '—'}
                  valueTone='muted'
                />
              </Pressable>
              <Spacer size='xxs' />
            </View>
          </SettingsSection>
          {adsEnabled &&
            <SettingsSection
              title={t('settings.section.adsTitle')}
              style={styles.section}
            ><CardContainer style={styles.card}>
                <RewardedAdSettingsCard style={{ padding: 0, backgroundColor: theme.card }} />
              </CardContainer>
            </SettingsSection>}


          <SettingsSection
            title={t('settings.section.appTitle')}
            style={styles.section}
          ><CardContainer style={styles.card}>
              <ThemeSwitcher lightModeLabel={t('settings.component.theme.light')} darkModeLabel={t('settings.component.theme.dark')} />
              <Spacer size='xs' />
              <SettingsListItem
                label={t('settings.component.language.title')}
                laberColor={theme.text}
                accessory={<LanguageSelector />}
                labelIcon={<FontAwesome color={theme.text} name="language" size={21} />}
                labelIconColor={theme.text}
              />
              {COPY_LINK.map((item, index) => (
                <ListItem iconColor={theme.text} key={index} {...item} hideBottomLine hideArrow />
              ))}
            </CardContainer>
          </SettingsSection>
        </View>
        <Spacer size='xl' />
        <Spacer size='xl' />
        <View>
          <View style={styles.version}>
            <Text style={typography.body}>{t('settings.section.version', { version: appVersion })}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = ({ sizes, globalStyleSheet, theme }: { theme: ThemeType, sizes: SizesType, globalStyleSheet: GlobalStyleSheetType }) => StyleSheet.create({
  content: {
    paddingHorizontal: sizes.xxs,
    backgroundColor: theme.background,
    height: '100%'
  },
  section: {
    marginBottom: sizes.lg,
  },
  body: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  list: {
    marginTop: 4,
  },
  card: {
    marginHorizontal: 0,
    marginVertical: 4,
    borderRadius: 16,
    borderBottomWidth: 0,
    backgroundColor: theme.card,
  },
  cardWithoutH: {
    paddingHorizontal: SIZES.xs,
    paddingVertical: 0,
  },
  version: {
    alignItems: 'center',
    padding: sizes.xs,
  },
});

