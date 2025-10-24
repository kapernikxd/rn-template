import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderDefault } from 'rn-vs-lb';
import { usePortalNavigation } from '../../helpers/hooks';
import { DOMAIN, EMAIL, SITE_NAME } from '../../constants/links';

const TermsOfUseScreen = () => {
  const openLink = (url: string) => Linking.openURL(url);
  const { goBack } = usePortalNavigation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderDefault title='Условия использования' onBackPress={goBack} />
      <ScrollView contentContainerStyle={styles.container}>
        <Section title={`Добро пожаловать в ${SITE_NAME}!`}>
          <Text style={styles.paragraph}>
            Настоящие Условия использования («Условия») регулируют доступ и использование мобильного приложения {SITE_NAME}, а также сайта<Text> </Text>
            <Text style={styles.link} onPress={() => openLink(DOMAIN)}>{DOMAIN}</Text> (совместно — «Сервис»).
          </Text>
          <Text style={styles.paragraph}>Получая доступ к Сервису или используя его, вы подтверждаете своё согласие с этими Условиями.</Text>
          <Text style={styles.paragraph}>Если вы не согласны с Условиями, пожалуйста, не используйте Сервис.</Text>
        </Section>

        <Section title="1. Использование Сервиса">
          <Bullet text="Используйте Сервис только в соответствии с применимым законодательством." />
          <Bullet text="Не используйте Сервис для противоправных или несанкционированных целей." />
          <Bullet text="Не преследуйте, не оскорбляйте и не причиняйте вред другим пользователям." />
          <Bullet text="Не нарушайте безопасность или целостность Сервиса." />
        </Section>

        <Section title="2. Пользовательский контент">
          <Text style={styles.paragraph}>
            Предоставляя контент, вы даёте {SITE_NAME} неисключительную, действующую по всему миру и бесплатную лицензию на использование, хранение, отображение и распространение вашего контента.
          </Text>
          <Text style={styles.paragraph}>Вы несёте ответственность за контент, который создаёте и распространяете.</Text>
        </Section>

        <Section title="3. Регистрация и безопасность аккаунта">
          <Text style={styles.paragraph}>Вы несёте ответственность за сохранение конфиденциальности учётных данных и за все действия, совершённые в рамках вашего аккаунта.</Text>
        </Section>

        <Section title="4. Конфиденциальность">
          <Text style={styles.paragraph}>
            Сбор и использование персональных данных регулируются нашей
            <Text style={styles.link} onPress={() => openLink(`${DOMAIN}/privacy-policy`)}> Политикой конфиденциальности</Text>.
          </Text>
        </Section>

        <Section title="5. Интеллектуальная собственность">
          <Text style={styles.paragraph}>Все права на Сервис (за исключением пользовательского контента) принадлежат {SITE_NAME} и его лицензиарам.</Text>
        </Section>

        <Section title="6. Прекращение доступа">
          <Text style={styles.paragraph}>Мы можем приостановить или прекратить ваш доступ к Сервису в любое время и по любой причине.</Text>
        </Section>

        <Section title="7. Изменения Условий">
          <Text style={styles.paragraph}>Мы можем обновлять эти Условия в любое время. Продолжение использования Сервиса после вступления изменений в силу означает принятие новых Условий.</Text>
        </Section>

        <Section title="8. Жалобы и модерация">
          <Text style={styles.paragraph}>
            В {SITE_NAME} действует нулевая терпимость к недопустимому контенту, включая, помимо прочего, язык вражды, домогательства, порнографию и любую незаконную деятельность.
          </Text>
          <Text style={styles.paragraph}>
            Пользователи могут пожаловаться на неподходящий контент прямо в приложении. Мы рассматриваем все жалобы в течение 24 часов и принимаем соответствующие меры, включая удаление контента или блокировку ответственного пользователя.
          </Text>
          <Text style={styles.paragraph}>
            Используя {SITE_NAME}, вы соглашаетесь вести себя уважительно и соблюдать эти правила.
          </Text>
        </Section>

        <Section title="9. Связь с нами">
          <Text style={styles.paragraph}>
            Если у вас есть вопросы по поводу этих Условий, свяжитесь с нами по адресу{' '}
            <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>{EMAIL}</Text>.
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
