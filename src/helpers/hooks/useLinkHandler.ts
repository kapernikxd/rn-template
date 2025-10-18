import * as Linking from 'expo-linking';
import { usePortalNavigation } from '../../helpers/hooks';

export const useLinkHandler = (domain: string) => {
  const { } = usePortalNavigation();

  const handleLinkPress = (url: string) => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace('www.', '');

      // если наш сайт — открываем внутри приложения
      if (hostname === domain) {
        const [_, type, id] = parsed.pathname.split('/');
        // if (type === 'user') return goToProfile(id);
      }

      // иначе — открываем во внешнем браузере
      Linking.openURL(url);
    } catch (error) {
      console.warn('Invalid URL:', url);
    }
  };

  return handleLinkPress;
};
