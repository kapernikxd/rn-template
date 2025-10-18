export type StoreListener = () => void;

export class BaseStore {
  private listeners = new Set<StoreListener>();
  private version = 0;

  readonly subscribe = (listener: StoreListener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  notify() {
    this.version += 1;
    for (const listener of Array.from(this.listeners)) {
      listener();
    }
  }

  get snapshotVersion() {
    return this.version;
  }
}

export type SubscribableStore = Pick<BaseStore, 'subscribe'>;
