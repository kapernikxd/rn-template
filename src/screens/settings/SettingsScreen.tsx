import { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
import { ProfileNav, ROUTES } from '../../navigation';
import { useNavigation } from '@react-navigation/native';
import { useActions } from '../../helpers/hooks';
import { AdsConsentStatus } from '@react-native-google-mobile-ads/consent';
import { getConsentStatusLabel, getCurrentConsentStatus, requestConsentForm } from '../../ads/consent';

type SettingsRoute =
  | typeof ROUTES.ProfleSettings
  | typeof ROUTES.ProfileNotificationSettings;



export const SettingsScreen: FC = () => {
  const { globalStyleSheet, theme, sizes, typography } = useTheme();
  const { setColors } = useSafeAreaColors();
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileNav>();
  const { handleShareAppLink } = useActions();
  const [consentStatus, setConsentStatus] = useState<AdsConsentStatus | null>(null);
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false);


  const styles = getStyles({ globalStyleSheet, theme, sizes });
  const { uiStore, identityStore, configStore } = useRootStore();
  const userId = useStoreData(identityStore, (store) => store.userId);
  const adsEnabled = useStoreData(configStore, (store) => store.adsEnabled);
  const configUrls = useStoreData(configStore, (store) => store.urls);


  const navigateTo = useCallback(
    (screen: SettingsRoute) => () => navigation.navigate(screen),
    [navigation],
  );


  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
    void identityStore.ensureUserId();
  }, [identityStore, setColors, theme.background]);


  useEffect(() => {
    let isMounted = true;

    const fetchConsentStatus = async () => {
      try {
        const status = await getCurrentConsentStatus();
        if (isMounted) {
          setConsentStatus(status);
        }
      } catch (error) {
        console.warn('Failed to fetch ads consent status', error);
        if (isMounted) {
          setConsentStatus(AdsConsentStatus.UNKNOWN);
        }
      }
    };

    void fetchConsentStatus();

    return () => {
      isMounted = false;
    };
  }, []);


  const PROFILE = [
    { icon: 'user-o', label: t('settings.section.userTitle'), action: navigateTo(ROUTES.ProfleSettings) },
    { icon: 'bell', label: t('settings.section.accountManagement.notifications'), action: navigateTo(ROUTES.ProfileNotificationSettings) },
  ];


  const COPY_LINK = useMemo(
    () => [
      { icon: 'copy', label: t('settings.section.copyAppLink'), action: handleShareAppLink },
    ],
    [handleShareAppLink, t],
  );

  const consentStatusLabel = useMemo(() => {
    if (!consentStatus) return t('settings.component.adsConsent.status.unknown');

    const key = getConsentStatusLabel(consentStatus);
    return t(`settings.component.adsConsent.status.${key}`);
  }, [consentStatus, t]);

  const onCopy = async () => {
    if (userId) {
      await Clipboard.setStringAsync(userId);
      uiStore.showSnackbar(t('common.copy'), 'success');
    }
  }

  const handleChangeConsent = useCallback(async () => {
    setIsUpdatingConsent(true);
    try {
      const result = await requestConsentForm();
      setConsentStatus(result.status);

      if (result.formAvailable) {
        uiStore.showSnackbar(t('settings.component.adsConsent.updated'), 'success');
      } else {
        uiStore.showSnackbar(t('settings.component.adsConsent.unavailable'), 'warning');
      }
    } catch (error) {
      console.warn('Failed to update ads consent', error);
      uiStore.showSnackbar(t('settings.component.adsConsent.unavailable'), 'error');
    } finally {
      setIsUpdatingConsent(false);
    }
  }, [t, uiStore]);

  return (
    <View style={styles.content}>
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Spacer size='xxs' />
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
                    key={"userID"}
                  />
                </Pressable>

                {PROFILE.map((item, index) => (
                  <View key={`profile-${index}`}>
                    <ListItem iconColor={theme.text} key={`profile-${index}`} {...item} hideBottomLine />
                    <Spacer size='xxs' />
                  </View>
                ))}
                <Spacer size='xxs' />
              </View>
            </SettingsSection>
            {adsEnabled &&
              <SettingsSection
                title={t('settings.section.adsTitle')}
                style={styles.section}
              ><CardContainer style={styles.card}>
                  <RewardedAdSettingsCard style={{ padding: 0, backgroundColor: theme.card }} />
                  <Spacer size='xs' />
                  <SettingsListItem
                    label={t('settings.component.adsConsent.title')}
                    laberColor={theme.text}
                    value={consentStatusLabel}
                    valueTone='muted'
                    onPress={handleChangeConsent}
                    disabled={isUpdatingConsent}
                  />
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
                  <ListItem iconColor={theme.text} key={`link-${index}`} {...item} hideBottomLine hideArrow />
                ))}
              </CardContainer>
            </SettingsSection>
          </View>
          <Spacer size='xl' />
          <Spacer size='xl' />
        </View>
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

