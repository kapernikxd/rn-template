import { AxiosResponse } from "axios";
import { $api } from "../../helpers";

export class CityService {
    async getAllCountries(): Promise<AxiosResponse<any>> {
        return $api.get(`/city/countries`);
    }

    async getCityesByCounty(county: string): Promise<AxiosResponse<{cities: string[], country: string}>> {
        return $api.get(`/city/by-country?country=${county}`);
    }
}
