import { makeAutoObservable } from "mobx";
import { CityService } from "../../services/city/CityService";
import { RootStore } from "../rootStore";
import { GeoResponse, SnackBarParams, SnackbarType, UiFilterParams } from "../../types/ui";
import { BaseStore, StoreListener } from "./BaseStore";


export class UiStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;
  private root: RootStore;
  private cityService: CityService;
  coordinates: [number, number] | undefined = undefined;

  filters: UiFilterParams = {
    page: 1,
    startDate: undefined,
    endDate: undefined,
  };

  placeFilter: UiFilterParams = {
    page: 1,
    eventType: "PLACE",
    day: undefined,
  };

  geoFilter: UiFilterParams = {
    city: undefined,
    country: undefined,
  }

  snackBar: SnackBarParams = {
    visible: false,
    message: '',
    type: 'success',
  };

  // В будущем сюда можно добавить состояния для модальных окон и др.

  constructor(root: RootStore) {
    this.root = root;
    this.subscribe = this.baseStore.subscribe;
    makeAutoObservable(this, {
      baseStore: false,
      subscribe: false,
      notify: false,
      root: false,
    } as any);
    this.cityService = new CityService();
  }

  private notify() {
    this.baseStore.notify();
  }

  get snapshotVersion() {
    return this.baseStore.snapshotVersion;
  }

  // Методы для работы с фильтрами
  setFilter<K extends keyof UiFilterParams>(key: K, value: UiFilterParams[K]) {
    this.filters = { ...this.filters, [key]: value };
  }

  // Методы для работы с фильтрами
  setPlaceFilter<K extends keyof UiFilterParams>(key: K, value: UiFilterParams[K]) {
    this.placeFilter = { ...this.placeFilter, [key]: value };
  }

  setFilterGroup<
    T extends 'filters' | 'geoFilter',
    K extends keyof UiStore[T]
  >(group: T, key: K, value: UiStore[T][K]) {
    this[group] = { ...this[group], [key]: value };
  }

  setFilters<K extends keyof Pick<UiStore, 'filters' | 'geoFilter' | 'placeFilter'>>(
    target: K,
    newFilters: Partial<UiStore[K]>
  ) {
    this[target] = { ...this[target], ...newFilters };
  }

  setGeoFilters(geo: GeoResponse) {
    if (geo.city) {
      if (this.geoFilter.city !== geo.city) {
        this.geoFilter = {
          city: geo?.city,
          country: geo?.country,
        }
      }
      this.coordinates = geo.coordinates
    }
  }

  resetFilters() {
    this.filters = {
      startDate: undefined,
      endDate: undefined,
      friends: undefined,
      participation: undefined,
    };
  }

  resetPlaceFilter() {
    this.placeFilter = {
      eventType: "PLACE",
      page: 1,
      day: undefined,
    }
  }

  //оставялем фильтрацию по городам
  resetFiltersDatesAndPage() {
    this.filters = {
      ...this.filters,
      page: 1,
      startDate: undefined,
      endDate: undefined,
      friends: undefined,
      participation: undefined,
    };
  }

  getFilters(): UiFilterParams {
    return this.filters;
  }

  // Методы для работы со Snackbar
  showSnackbar(message: string, type: SnackbarType) {
    this.snackBar.message = message;
    this.snackBar.type = type;
    this.snackBar.visible = true;
  }

  hideSnackbar() {
    this.snackBar.visible = false;
  }

  async getCountries() {
    try {
      return (await this.cityService.getAllCountries()).data;
    } catch (error) {
      console.error("Error getting countries:", error);
    }
  }

  async getCityesByCounty(county: string) {
    try {
      return (await this.cityService.getCityesByCounty(county)).data;
    } catch (error) {
      console.error("Error getting countries:", error);
    }
  }
}