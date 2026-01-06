export type CitySearchItem = {
  _id: string;
  city: string;
  city_ascii?: string;
  lat: number;
  lng: number;
  country: string;
  iso2?: string;
  iso3?: string;
  admin_name?: string;
  capital?: string;
  population?: number;
  id?: number;
};

export type CitySearchResponse = {
  items: CitySearchItem[];
};
