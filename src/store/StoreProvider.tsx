import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { RootStore } from './rootStore';
import type { SubscribableStore } from './mobx/BaseStore';

const StoreContext = createContext<RootStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<RootStore>(null);
  if (!storeRef.current) {
    storeRef.current = new RootStore();
  }
  useEffect(() => {
    void storeRef.current?.authStore.refreshAccessToken();
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
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store),
    () => selector(store),
  );
}