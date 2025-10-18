
import axios, { AxiosResponse, isAxiosError } from "axios";
import $api, { API_URL } from "../../helpers/http";
import { AuthRejection, AuthResponse, AuthResponseExtend, LoginParams, NewPasswordParams, ParamsVerificateEmail, RegistrationParams, ResetPasswordParams } from "../../types/auth";

export default class AuthService {
  static async login({
    email,
    password,
  }: LoginParams): Promise<AxiosResponse<AuthResponseExtend, AuthRejection>> {
    return $api.post("/auth/login", { email, password });
  }

  static async loginByGoogleCode(
    credential: string
  ): Promise<AxiosResponse<AuthResponseExtend, AuthRejection>> {
    return $api.post("/auth/loginByGoogleCode", { credential });
  }

  static async loginByAppleCode(
    identityToken: string
  ): Promise<AxiosResponse<AuthResponseExtend, AuthRejection>> {
    return $api.post("/auth/loginByAppleCode", { identityToken });
  }

  static async loginByGoogle(
    credential: string
  ): Promise<AxiosResponse<AuthResponseExtend, AuthRejection>> {
    return $api.post("/auth/loginByGoogle", { credential });
  }

  static async loginByApple(
    identityToken: string
  ): Promise<AxiosResponse<AuthResponseExtend, AuthRejection>> {
    return $api.post("/auth/loginByApple", { identityToken });
  }

  static async registration(
    params: RegistrationParams
  ): Promise<AxiosResponse<AuthResponseExtend, AuthRejection>> {
    return $api.post<AuthResponseExtend>("/auth/registration", { ...params });
  }

  static async activateEmail(email: string): Promise<AxiosResponse> {
    return $api.post<AuthResponse>("/auth/activateEmail", { email });
  }

  static async verificateEmail(
    params: ParamsVerificateEmail
  ): Promise<AxiosResponse> {
    return $api.post<AuthResponse>("/auth/verificateEmail", { ...params });
  }

  static async resetPassword({
    verificationCode,
    email,
  }: ResetPasswordParams): Promise<AxiosResponse> {
    return $api.post<AuthResponseExtend>("/auth/resetPassword", {
      verificationCode,
      email,
    });
  }

  static async newPassword({
    password,
    activatedLink,
  }: NewPasswordParams): Promise<AxiosResponse> {
    return $api.post<AuthResponseExtend>("/auth/newPassword", {
      password,
      activatedLink,
    });
  }

  static async logout(): Promise<void> {
    return $api.post("/auth/logout");
  }

  static async refreshAccessTokenRequest(refreshToken: string): Promise<AxiosResponse<AuthResponseExtend>> {
    try {
      const response = await axios.post<AuthResponseExtend>(`${API_URL}auth/refresh`, {
        refreshToken,
      });
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const responseMessage = error.response?.data ?? error.message;
        console.error('Error during refresh request:', responseMessage);
      } else if (error instanceof Error) {
        console.error('Error during refresh request:', error.message);
      } else {
        console.error('Error during refresh request:', error);
      }
      throw error;
    }
  }

  static async sendPushToken(pushToken: string): Promise<void> {
    return $api.post("/push/mobile", { pushToken });
  }
}
