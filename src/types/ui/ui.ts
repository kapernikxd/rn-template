export type Notification = { id: number; message: string; variant?: 'info' | 'success' | 'error' };

export type SnackbarType = 'success' | 'warning' | 'error' | 'info';


export type GeoResponse = {
  country?: string,
  city?: string,
  coordinates?: [number, number]
}

export interface SnackBarParams {
  visible: boolean;
  message: string;
  type: SnackbarType;
}

export interface UiFilterParams {
  userId?: string;
  status?: string;
  eventType?: "EVENT" | "PLACE";
  page?: number;
  location?: string;
  startDate?: string;
  endDate?: string;
  categories?: string;
  day?: any;
  city?: string;
  country?: string;
  coordinates?: [number, number];
  zoom?: number;
  /**
   * Фильтр по событиям, созданным друзьями.
   * - `only` – только события друзей
   * - `exclude` – все события, кроме созданных друзьями
   */
  friends?: "only" | "exclude";
  /**
   * Фильтр по участию пользователя в событии.
   * - `joined` – события, в которых пользователь участвует
   * - `not_joined` – события, в которых пользователь не участвует
   */
  participation?: "joined" | "not_joined";
}