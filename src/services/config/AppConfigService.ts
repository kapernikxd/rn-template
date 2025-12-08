import axios from "axios";

import { CONFIG_APP_ID, CONFIG_SERVER_URL } from "../../constants/links";
import type { AppConfigResponse } from "../../types/config";

export class AppConfigService {
  static async fetchConfig(appId: string = CONFIG_APP_ID): Promise<AppConfigResponse> {
    const response = await axios.get<AppConfigResponse>(`${CONFIG_SERVER_URL}?site=${encodeURIComponent(appId)}`);
    return response.data;
  }
}
