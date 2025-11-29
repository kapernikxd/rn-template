import React from 'react';
import { NoAuth } from 'rn-vs-lb';
import { useTranslation } from 'react-i18next';

import { ScreenLoader } from '../../components/ScreenLoader';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { usePortalNavigation } from '../../helpers/hooks';
import type { AuthRedirect } from '../types';

type GuardOptions = {
  /**
   * Сериализуемый редирект по умолчанию (если нельзя вывести из текущего экрана).
   * Важно: только plain-данные (строки/числа/объекты/массивы), без функций/классов/инстансов!
   */
  redirect?: AuthRedirect;
};

/**
 * Хелпер: можно вычислить редирект из текущих пропсов.
 * По умолчанию — используем options?.redirect (если он задан).
 * Если нужно — тут можно добавить свою логику извлечения экрана/параметров.
 */
function getRedirectFromProps<P extends { route?: { params?: Record<string, unknown> } }>(
  _props: P,
  fallback?: AuthRedirect,
): AuthRedirect | undefined {
  return fallback;
}

export function withAuthGuard<P extends { route?: { params?: Record<string, unknown> } }>(
  Component: React.ComponentType<P>,
  options?: GuardOptions,
): React.ComponentType<P> {
  const GuardedComponent: React.FC<P> = (props) => {
    const { authStore } = useRootStore();
    const { goToLogin } = usePortalNavigation();
    const { t } = useTranslation();

    const isAuthenticated = useStoreData(authStore, (s) => s.isAuthenticated);
    const hasAttemptedAutoLogin = useStoreData(authStore, (s) => s.hasAttemptedAutoLogin);
    const redirect = getRedirectFromProps(props, options?.redirect);

    const handleLoginPress = async () => {
      const isAuthorized = await authStore.loginWithClientId();
      if (!isAuthorized) {
        goToLogin(redirect);
      }
    };

    if (!hasAttemptedAutoLogin) {
      return <ScreenLoader />;
    }

    if (!isAuthenticated) {
      return (
        <NoAuth
          title={t('auth.guard.title')}
          description={t('auth.guard.description')}
          buttonText={t('auth.guard.button')}
          onPress={handleLoginPress}
        />
      );
    }

    return <Component {...(props as P)} />;
  };

  GuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name || 'Component'})`;
  return GuardedComponent;
}
