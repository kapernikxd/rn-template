import { FC, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CardContainer,
  ListItem,
  Spacer,
  SettingsSection,
  SettingsListItem,
  ThemeSwitcher,
} from 'rn-vs-lb';
import { useTheme, ThemeType, SizesType, GlobalStyleSheetType } from 'rn-vs-lb/theme';
import { ADS_ENABLED, appVersion } from '../../constants/links';
import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { RewardedAdSettingsCard } from '../../components/ads/components/RewardedAdSettingsCard';


export const SettingsScreen: FC = () => {
  const { globalStyleSheet, theme, sizes, typography, isDark, toggleTheme } = useTheme();
  const { setColors } = useSafeAreaColors();
  const styles = getStyles({ globalStyleSheet, theme, sizes });
  const rootStore = useRootStore();
  const userId = useStoreData(rootStore.identityStore, (store) => store.userId);

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
    void rootStore.identityStore.ensureUserId();
  }, [rootStore.identityStore, setColors, theme.background]);

  const COPY_LINK = [
    { icon: 'copy', label: 'Копировать ссылку на приложение', action: () => console.log('скопировано') },
  ];


  return (
    <View style={styles.content}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.list}>
          <SettingsSection
            title={"   User"}
            style={styles.section}
          >
            <SettingsListItem
              label={'UserId'}
              value={userId ?? '—'}
              valueTone='muted'
            />
          </SettingsSection>
          {ADS_ENABLED &&
            <SettingsSection
              title={"   Ads"}
              style={styles.section}
            ><CardContainer style={styles.card}>
                <RewardedAdSettingsCard style={{ padding: 0, backgroundColor: theme.card }} />
              </CardContainer>
            </SettingsSection>}


          <SettingsSection
            title={"   Application"}
            style={styles.section}
          ><CardContainer style={styles.card}>
              <ThemeSwitcher lightModeLabel="Светлая тема" darkModeLabel="Теманя тема" />
            </CardContainer>
            <CardContainer style={styles.card}>
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
            <Text style={typography.body}>Версия {appVersion}</Text>
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
  version: {
    alignItems: 'center',
    padding: sizes.xs,
  },
});

