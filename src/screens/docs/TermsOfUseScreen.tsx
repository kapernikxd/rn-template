import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native';
import { HeaderDefault } from 'rn-vs-lb';
import { usePortalNavigation } from '../../helpers/hooks';
import { DOMAIN, EMAIL, SITE_NAME } from '../../constants/links';
import { MainLayout } from '../../components';

const TermsOfUseScreen = () => {
  const openLink = (url: string) => Linking.openURL(url);
  const { goBack } = usePortalNavigation();

  return (
    <MainLayout>
      <HeaderDefault title='Terms of Use' onBackPress={goBack} />
      <ScrollView contentContainerStyle={styles.container}>
        <Section title={`Welcome to ${SITE_NAME}!`}>
          <Text style={styles.paragraph}>
            These Terms of Use ("Terms") govern your access to and use of the {SITE_NAME} mobile application and the website<Text> </Text>
            <Text style={styles.link} onPress={() => openLink(DOMAIN)}>{DOMAIN}</Text> (collectively, the "Service").
          </Text>
          <Text style={styles.paragraph}>By accessing or using our Service, you agree to be bound by these Terms.</Text>
          <Text style={styles.paragraph}>If you do not agree with these Terms, you may not access or use the Service.</Text>
        </Section>

        <Section title="1. Use of the Service">
          <Bullet text="Use the Service only in compliance with applicable laws." />
          <Bullet text="Do not use the Service for illegal or unauthorized purposes." />
          <Bullet text="Do not harass, abuse, or harm other users." />
          <Bullet text="Do not disrupt the security or integrity of the Service." />
        </Section>

        <Section title="2. User Content">
          <Text style={styles.paragraph}>
            By submitting content, you grant {SITE_NAME} a non-exclusive, worldwide, royalty-free license to use, store, display, and distribute your content.
          </Text>
          <Text style={styles.paragraph}>You are responsible for the content you create and share.</Text>
        </Section>

        <Section title="3. Account Registration and Security">
          <Text style={styles.paragraph}>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</Text>
        </Section>

        <Section title="4. Privacy">
          <Text style={styles.paragraph}>
            Our collection and use of personal data are governed by our
            <Text style={styles.link} onPress={() => openLink(`${DOMAIN}/privacy-policy`)}> Privacy Policy</Text>.
          </Text>
        </Section>

        <Section title="5. Intellectual Property">
          <Text style={styles.paragraph}>All rights in the Service (excluding user content) belong to {SITE_NAME} and its licensors.</Text>
        </Section>

        <Section title="6. Termination">
          <Text style={styles.paragraph}>We may suspend or terminate your access to the Service at any time for any reason.</Text>
        </Section>

        <Section title="7. Changes to the Terms">
          <Text style={styles.paragraph}>We may update these Terms at any time. Continued use of the Service after changes become effective constitutes acceptance of the new Terms.</Text>
        </Section>

        <Section title="8. Reporting and Moderation">
          <Text style={styles.paragraph}>
            {SITE_NAME} has zero tolerance for objectionable content, including but not limited to hate speech, harassment, pornography, or any illegal activity.
          </Text>
          <Text style={styles.paragraph}>
            Users can report inappropriate content directly in the app. We review all reports within 24 hours and take appropriate actions, such as removing the content or blocking the user responsible.
          </Text>
          <Text style={styles.paragraph}>
            By using {SITE_NAME}, you agree to behave respectfully and follow these guidelines at all times.
          </Text>
        </Section>

        <Section title="9. Contact Us">
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at{' '}
            <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>{EMAIL}</Text>.
          </Text>
        </Section>
      </ScrollView>
    </MainLayout>
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
