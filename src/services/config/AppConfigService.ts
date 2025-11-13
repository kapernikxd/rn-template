import axios from "axios";

import { API_URL, CONFIG_APP_ID } from "../../constants/links";
import type { AppConfigResponse } from "../../types/config";

export class AppConfigService {
  static async fetchConfig(appId: string = CONFIG_APP_ID): Promise<AppConfigResponse> {
    const response = await axios.get<AppConfigResponse>(`${API_URL}auth/config/${appId}`);
    return response.data;
  }
}
