import axios from "axios";
import { CitySearchItem, CitySearchResponse } from "../../types/citySearch";

const CITY_SEARCH_API = "https://cities.webbro.org";

export class CitySearchService {
  async search(query: string, limit = 10) {
    return axios.get<CitySearchResponse>(`${CITY_SEARCH_API}/search.php`, {
      params: { q: query, limit },
    });
  }
}

export type { CitySearchItem };
