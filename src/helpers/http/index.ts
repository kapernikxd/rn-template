import axios, { isAxiosError } from "axios";
import type { AuthUserLike } from "../../types/auth";
import {
  getRefreshToken,
  getAccessToken,
  setRefreshToken,
  setAccessToken,
  removeRefreshToken,
  removeAccessToken,
  setLocalUserId,
  removeLocalUserId
} from "../storageHelper";
import { logToServer } from "../utils/logger";
import { API_URL } from "../../constants/links";

// Создаем экземпляр Axios
const $api = axios.create({
  baseURL: API_URL,
});

type TokenRefreshPayload = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserLike;
};

type TokenRefreshHandler = (payload: TokenRefreshPayload) => Promise<void> | void;
type TokenRefreshFailureHandler = (error: unknown) => Promise<void> | void;

let tokenRefreshHandler: TokenRefreshHandler | null = null;
let tokenRefreshFailureHandler: TokenRefreshFailureHandler | null = null;

export const registerTokenRefreshHandler = (handler: TokenRefreshHandler) => {
  tokenRefreshHandler = handler;
};

export const registerTokenRefreshFailureHandler = (handler: TokenRefreshFailureHandler) => {
  tokenRefreshFailureHandler = handler;
};

// **Interceptor для запросов**
$api.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken(); // Получаем accessToken из AsyncStorage
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// **Interceptor для ответов**
$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("error", error)

    // ЛОГИРУЕМ ОШИБКУ ДО ТОКЕНА
    logToServer("error", "Axios error", {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      responseData: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("Refresh token not found");

        const response = await axios.post(
          `${API_URL}auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data;

        if (tokenRefreshHandler) {
          await tokenRefreshHandler({ accessToken: newAccessToken, refreshToken: newRefreshToken, user });
        } else {
          await setAccessToken(newAccessToken);
          await setRefreshToken(newRefreshToken);
          await setLocalUserId(user.id);
          $api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return $api.request(originalRequest);
      } catch (e) {
        const axiosStatus = isAxiosError(e) ? e.response?.status : undefined;
        const isAuthError = !isAxiosError(e) || [400, 401, 403].includes(axiosStatus ?? 0);

        if (isAuthError) {
          if (tokenRefreshFailureHandler) {
            await tokenRefreshFailureHandler(e);
          } else {
            await removeAccessToken();
            await removeRefreshToken();
            await removeLocalUserId();
          }
        }

        logToServer("error", "Ошибка обновления токена", {
          message: e instanceof Error ? e.message : String(e),
          originalRequestUrl: originalRequest?.url,
          status: axiosStatus,
        });

        if (isAuthError) {
          console.log("НЕ АВТОРИЗОВАН");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default $api;
export type { TokenRefreshPayload };
