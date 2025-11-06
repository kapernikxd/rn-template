import { makeAutoObservable, runInAction } from 'mobx';
import { getLocalUserId } from '../../helpers/storageHelper';
import { BaseStore, StoreListener } from './BaseStore';

export class IdentityStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;

  userId: string | null = null;
  loading = false;

  constructor() {
    this.subscribe = this.baseStore.subscribe;
    makeAutoObservable(this, {
      baseStore: false,
      subscribe: false,
      notify: false,
    } as any);
  }

  private notify() {
    this.baseStore.notify();
  }

  get snapshotVersion() {
    return this.baseStore.snapshotVersion;
  }

  private setLoading(value: boolean) {
    runInAction(() => {
      this.loading = value;
    });
    this.notify();
  }

  private setUserId(value: string) {
    runInAction(() => {
      this.userId = value;
    });
    this.notify();
  }

  async ensureUserId() {
    if (this.userId) {
      return this.userId;
    }

    this.setLoading(true);
    try {
      const localUserId = await getLocalUserId();
      this.setUserId(localUserId);
      return localUserId;
    } finally {
      this.setLoading(false);
    }
  }
}
