import axios from "axios";
import { CitySearchItem, CitySearchResponse } from "../../types/citySearch";
import type { ConfigStore } from "../../store/mobx/ConfigStore";

export class CitySearchService {
  constructor(private readonly configStore: ConfigStore) {}

  async search(query: string, limit = 10) {
    const citySearchUrl = this.configStore.urls?.CITY_SEARCH_API;

    return axios.get<CitySearchResponse>(citySearchUrl, {
      params: { q: query, limit },
    });
  }
}

export type { CitySearchItem };
