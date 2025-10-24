import type { AxiosResponse } from "axios";
import $api from "../../helpers/http";
import { getQueriedUrl, QueryParams } from "../../helpers/queryStringHelper";
import { MyProfileDTO, ProfileDTO } from "../../types";
import { AuthProfileResponse, AuthResponse, ChangePasswordProps } from "../../types/auth/auth-api";
import { ProfilesFilterParams, UpdateProfileProps, UsersFilterParams, UsersResponse } from "../../types/profile";

export class ProfileService {
  /**
   * Получить профиль текущего пользователя.
   * @returns Ответ с данными профиля.
   */
  public async getMyProfile(): Promise<AxiosResponse<MyProfileDTO>> {
    return $api.get("/profile/my");
  }

  /**
   * Получить список всех профилей.
   * @returns Ответ со списком профилей.
   */
  public async getProfiles(params: ProfilesFilterParams): Promise<AxiosResponse<{ profiles: ProfileDTO[], hasMore: boolean }>> {
    return $api.get(getQueriedUrl({ url: "/profile/", query: params as QueryParams }));
  }

  /**
   * Получить профиль по его идентификатору.
   * @param id Идентификатор профиля.
   * @returns Ответ с данными профиля.
   */
  public async getProfileById(id: string): Promise<AxiosResponse<ProfileDTO>> {
    return $api.get(`/profile/${id}`);
  }

  /**
   * Загрузить фотографию профиля.
   * @param fileData Данные файла в формате FormData.
   * @returns Ответ от сервера.
   */
  public async uploadProfilePhoto(fileData: FormData): Promise<AxiosResponse> {
    return $api.post("/profile/upload", fileData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  /**
   * Получить фотографию профиля.
   * @returns Ответ с данными фотографии.
   */
  public async getProfilePhoto(): Promise<AxiosResponse> {
    return $api.get("/profile/avatar");
  }

  /**
   * Удалить фотографию профиля.
   * @param params Объект с именем файла (например, { name: "avatar.jpg" }).
   * @returns Ответ от сервера.
   */
  public async deleteProfilePhoto(params: { name: string }): Promise<AxiosResponse> {
    return $api({
      method: "DELETE",
      url: "/profile/avatar",
      data: { ...params },
    });
  }

  /**
   * Обновить данные профиля текущего пользователя.
   * @param props Объект с данными для обновления профиля.
   * @returns Ответ с обновлёнными данными профиля.
   */
  public async updateProfile(props: UpdateProfileProps): Promise<AxiosResponse<AuthProfileResponse>> {
    return $api.patch<AuthProfileResponse>("/profile/my", props);
  }

  /**
   * Изменить пароль пользователя.
   * @param props Объект, содержащий старый и новый пароль.
   * @returns Ответ от сервера.
   */
  public async changePassword({ oldPassword, password }: ChangePasswordProps): Promise<AxiosResponse> {
    return $api.post<AuthResponse>("/auth/changePassword", { oldPassword, password });
  }

  /**
   * Подписаться или отписаться от профиля по его идентификатору.
   * @param id Идентификатор профиля.
   * @returns Ответ с информацией о количестве подписчиков и статусе подписки.
   */
  public async followProfileById(id: string): Promise<AxiosResponse<{ followers: number; isFollowing: boolean }>> {
    return $api.put(`/profile/${id}/follow`);
  }

  /**
   * Получить список подписчиков текущего пользователя.
   * @returns Ответ со списком подписчиков.
   */
  public async getMyFollowers(params?: UsersFilterParams): Promise<AxiosResponse<UsersResponse>> {
    return $api.get(`/profile/my/followers`, { params });
  }

  /**
   * Получить список подписчиков указанного профиля.
   * @param id Идентификатор профиля.
   * @returns Ответ со списком подписчиков.
   */
  public async getFollowersById(id: string, params?: UsersFilterParams): Promise<AxiosResponse<UsersResponse>> {
    return $api.get(`/profile/${id}/followers`, { params });
  }

  /**
   * Получить список подписок текущего пользователя.
   * @returns Ответ со списком подписок.
   */
  public async getMyFollowing(params?: UsersFilterParams): Promise<AxiosResponse<UsersResponse>> {
    return $api.get(`/profile/my/following`, { params });
  }

  /**
   * Получить список подписок указанного профиля.
   * @param id Идентификатор профиля.
   * @returns Ответ со списком подписок.
   */
  public async getFollowingById(id: string, params?: UsersFilterParams): Promise<AxiosResponse<UsersResponse>> {
    return $api.get(`/profile/${id}/following`, { params });
  }

  public async reportUser(data: { reason?: string; details?: string; targetId: string }): Promise<AxiosResponse<boolean>> {
    return $api.post(`/reports`, { targetType: 'user', ...data });
  }

  public async blockUser(data: { reason?: string; details?: string; targetId: string }): Promise<AxiosResponse<boolean>> {
    return $api.post(`/reports`, { targetType: 'user', ...data });
  }

  public async reportAiBot(data: { reason?: string; details?: string; targetId: string }): Promise<AxiosResponse<boolean>> {
    return $api.post(`/reports`, { targetType: 'ai-bot', ...data });
  }

  public async deleteAccount(): Promise<AxiosResponse<boolean>> {
    return $api.delete(`/profile`);
  }
}

const profileService = new ProfileService();

export default profileService;
