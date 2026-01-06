import { AppState, type AppStateStatus } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { RootStore } from './rootStore';
import type { SubscribableStore } from './mobx/BaseStore';

const StoreContext = createContext<RootStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<RootStore>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  if (!storeRef.current) {
    storeRef.current = new RootStore();
  }
  useEffect(() => {
    void storeRef.current?.configStore.fetchConfig();
    void storeRef.current?.authStore.refreshAccessToken();
    void storeRef.current?.identityStore.ensureUserId();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasInBackground = appStateRef.current.match(/inactive|background/);
      if (wasInBackground && nextAppState === 'active') {
        void storeRef.current?.configStore.fetchConfig();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);
  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
}

export function useRootStore(): RootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useRootStore must be used within StoreProvider');
  }
  return store;
}

export function useStoreData<S extends SubscribableStore, R>(store: S, selector: (store: S) => R): R {
  const cacheRef = useRef<{ version: number; value: R }>();

  const getSnapshot = useCallback(() => {
    const version = store.snapshotVersion;
    const cached = cacheRef.current;

    if (!cached || cached.version !== version) {
      const value = selector(store);
      cacheRef.current = { version, value };
      return value;
    }

    return cached.value;
  }, [selector, store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
