import axios from "axios";
import * as Localization from "expo-localization";

import { CONFIG_APP_ID, CONFIG_SERVER_URL, SITE_NAME } from "../../constants/links";
import type { AppConfigResponse } from "../../types/config";

export class AppConfigService {
  private static getUserCountry(): string | undefined {
    const locale = Localization.getLocales()[0];
    if (!locale) return undefined;

    if ("region" in locale && locale.region) {
      return locale.region;
    }

    const tagParts = locale.languageTag?.split("-") ?? [];
    return tagParts.find((part) => part.length === 2 && part.toUpperCase() === part);
  }

  static async fetchConfig(appId: string = CONFIG_APP_ID): Promise<AppConfigResponse> {
    const cacheBuster = Date.now();
    const userCountry = AppConfigService.getUserCountry();
    const response = await axios.get<AppConfigResponse>(
      `${CONFIG_SERVER_URL}?site=${encodeURIComponent(appId)}&_cb=${cacheBuster}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "X-App-Name": SITE_NAME,
          ...(userCountry ? { "X-User-Country": userCountry } : {}),
        },
      },
    );
    return response.data;
  }
}
