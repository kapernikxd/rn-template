import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderDefault } from 'rn-vs-lb';
import { usePortalNavigation } from '../../helpers/hooks';
import { DOMAIN, EMAIL, SITE_NAME } from '../../constants/links';
import { useTranslation } from 'react-i18next';

const TermsOfUseScreen = () => {
  const openLink = (url: string) => Linking.openURL(url);
  const { goBack } = usePortalNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderDefault title={t('screens.docs.terms.title')} onBackPress={goBack} />
      <ScrollView contentContainerStyle={styles.container}>
        <Section title={t('screens.docs.terms.sections.welcome.title', { siteName: SITE_NAME })}>
          <Text style={styles.paragraph}>
            {t('screens.docs.terms.sections.welcome.paragraph1.prefix', { siteName: SITE_NAME })}
            <Text style={styles.link} onPress={() => openLink(DOMAIN)}>{DOMAIN}</Text>
            {t('screens.docs.terms.sections.welcome.paragraph1.suffix')}
          </Text>
          <Text style={styles.paragraph}>{t('screens.docs.terms.sections.welcome.paragraph2')}</Text>
          <Text style={styles.paragraph}>{t('screens.docs.terms.sections.welcome.paragraph3')}</Text>
        </Section>

        <Section title={t('screens.docs.terms.sections.usage.title')}>
          {t<string[]>('screens.docs.terms.sections.usage.items', { returnObjects: true }).map((item) => (
            <Bullet key={item} text={item} />
          ))}
        </Section>

        <Section title={t('screens.docs.terms.sections.content.title')}>
          <Text style={styles.paragraph}>
            {t('screens.docs.terms.sections.content.paragraph1', { siteName: SITE_NAME })}
          </Text>
          <Text style={styles.paragraph}>{t('screens.docs.terms.sections.content.paragraph2')}</Text>
        </Section>

        <Section title={t('screens.docs.terms.sections.security.title')}>
          <Text style={styles.paragraph}>{t('screens.docs.terms.sections.security.paragraph')}</Text>
        </Section>

        <Section title={t('screens.docs.terms.sections.privacy.title')}>
          <Text style={styles.paragraph}>
            {t('screens.docs.terms.sections.privacy.paragraph.prefix')}
            <Text style={styles.link} onPress={() => openLink(`${DOMAIN}/privacy-policy`)}>
              {t('screens.docs.terms.sections.privacy.linkLabel')}
            </Text>
            {t('screens.docs.terms.sections.privacy.paragraph.suffix')}
          </Text>
        </Section>

        <Section title={t('screens.docs.terms.sections.ip.title')}>
          <Text style={styles.paragraph}>
            {t('screens.docs.terms.sections.ip.paragraph', { siteName: SITE_NAME })}
          </Text>
        </Section>

        <Section title={t('screens.docs.terms.sections.termination.title')}>
          <Text style={styles.paragraph}>{t('screens.docs.terms.sections.termination.paragraph')}</Text>
        </Section>

        <Section title={t('screens.docs.terms.sections.changes.title')}>
          <Text style={styles.paragraph}>{t('screens.docs.terms.sections.changes.paragraph')}</Text>
        </Section>

        <Section title={t('screens.docs.terms.sections.moderation.title')}>
          <Text style={styles.paragraph}>
            {t('screens.docs.terms.sections.moderation.paragraph1', { siteName: SITE_NAME })}
          </Text>
          <Text style={styles.paragraph}>{t('screens.docs.terms.sections.moderation.paragraph2')}</Text>
          <Text style={styles.paragraph}>{t('screens.docs.terms.sections.moderation.paragraph3', { siteName: SITE_NAME })}</Text>
        </Section>

        <Section title={t('screens.docs.terms.sections.contact.title')}>
          <Text style={styles.paragraph}>
            {t('screens.docs.terms.sections.contact.paragraph.prefix')}
            <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>{EMAIL}</Text>
            {t('screens.docs.terms.sections.contact.paragraph.suffix')}
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfUseScreen;

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Bullet = ({ text }: { text: string }) => (
  <View style={styles.bulletItem}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  date: {
    textAlign: 'center',
    marginBottom: 30,
  },
  bold: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  link: {
    color: '#6f2da8',
    textDecorationLine: 'underline',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    marginRight: 6,
    fontSize: 16,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
