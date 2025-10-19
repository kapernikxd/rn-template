import React from 'react';
import { NoAuth } from 'rn-vs-lb';

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

    const isAuthenticated = useStoreData(authStore, (s) => s.isAuthenticated);
    const hasAttemptedAutoLogin = useStoreData(authStore, (s) => s.hasAttemptedAutoLogin);

    if (!hasAttemptedAutoLogin) {
      return <ScreenLoader />;
    }

    if (!isAuthenticated) {
      // ВАЖНО: redirect — только сериализуемые данные
      const redirect = getRedirectFromProps(props, options?.redirect);

      // ВАЖНО: лямбда, чтобы в goToLogin не попал PressEvent из onPress
      return <NoAuth onPress={() => goToLogin(redirect)} />;
    }

    return <Component {...(props as P)} />;
  };

  GuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name || 'Component'})`;
  return GuardedComponent;
}
