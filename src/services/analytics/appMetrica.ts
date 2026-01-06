import { Linking } from "react-native";
import AppMetrica from "@appmetrica/react-native-analytics";
import { APP_METRICA } from "../../constants/links";
import { logToServer } from "../../helpers/utils/logger";

let isActivated = false;

export const initAppMetrica = () => {
  try {
    if (isActivated || !APP_METRICA) {
      return;
    }

    AppMetrica.activate({
      apiKey: APP_METRICA,
      sessionTimeout: 120,
      logs: __DEV__, // в проде можно вырубить
    });

    isActivated = true;

    // не обязательно ждать, просто "выстрелили и забыли"
    void logToServer("info", "AppMetrica activated", {
      apiKey: APP_METRICA,
    });
  } catch (e) {
    void logToServer("error", "AppMetrica activation failed", {
      error: String(e),
    });
  }
};

const ensureAppMetricaActivated = () => {
  if (!isActivated) {
    initAppMetrica();
  }
};

export const reportAppOpen = async () => {
  if (!APP_METRICA) return;

  try {
    ensureAppMetricaActivated();

    let url: string | null = null;

    try {
      url = await Linking.getInitialURL();
    } catch (e) {
      void logToServer("warn", "Linking.getInitialURL failed", {
        error: String(e),
      });
      url = null;
    }

    if (url && url.trim()) {
      try {
        AppMetrica.reportAppOpen(url);

        void logToServer("info", "AppMetrica.reportAppOpen", {
          url,
        });
      } catch (e) {
        void logToServer("error", "AppMetrica.reportAppOpen failed", {
          url,
          error: String(e),
        });
      }
    } else {
      void logToServer("info", "App open without deep link", {});
    }
  } catch (e) {
    // Любая неожиданная фигня
    void logToServer("error", "reportAppOpen crashed", {
      error: String(e),
    });
  }
};

export const reportEvent = async (
  name: string,
  attributes?: Record<string, unknown>,
) => {
  if (!APP_METRICA) return;

  try {
    ensureAppMetricaActivated();

    AppMetrica.reportEvent(name, attributes);

    if (__DEV__) {
      void logToServer("info", "AppMetrica event", {
        name,
        attributes,
      });
    }
  } catch (e) {
    void logToServer("error", "AppMetrica.reportEvent failed", {
      name,
      attributes,
      error: String(e),
    });
  }
};
