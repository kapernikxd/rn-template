import { makeAutoObservable, runInAction } from "mobx";
import { CitySearchService } from "../../services/citySearch/CitySearchService";
import { CitySearchItem } from "../../types/citySearch";
import { BaseStore, StoreListener } from "./BaseStore";

export class CitySearchStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;
  private citySearchService = new CitySearchService();

  cities: CitySearchItem[] = [];
  isLoading = false;
  error: string | null = null;
  query = "";

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

  async searchCities(query: string) {
    const normalized = query.trim();
    this.query = normalized;

    if (!normalized) {
      runInAction(() => {
        this.cities = [];
        this.error = null;
        this.isLoading = false;
        this.notify();
      });
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.notify();

    try {
      const { data } = await this.citySearchService.search(normalized, 10);
      runInAction(() => {
        this.cities = data.items ?? [];
        this.isLoading = false;
        this.notify();
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.cities = [];
        this.isLoading = false;
        this.notify();
      });
    }
  }
}
