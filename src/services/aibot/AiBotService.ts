import { AxiosResponse } from "axios";
import $api from "../../helpers/http";

import { AiBotDTO, AiBotMainPageBot, ProfileDTO, UserDTO } from "../../types";
import { getQueriedUrl, QueryParams } from "../../helpers/queryStringHelper";
import { AiBotPhotoResponse, AiBotReportPayload, AiBotUpdatePayload, GuestAiBotMessagePayload, GuestAiBotMessageResponse } from "../../types/aiBot";
import { ProfilesFilterParams } from "../../types/profile/profile";


class AiBotDetailsService {
  public async fetchAiBotsForMainPage(): Promise<AxiosResponse<AiBotMainPageBot[]>> {
    return $api.get("/profile/ai-bots/fetchAiBotsForMainPage");
  }
  /**
   * Получить список созданных AI-ботов.
   */
  public async getAllAiBots(params: ProfilesFilterParams = {}): Promise<AxiosResponse<{ profiles: ProfileDTO[], hasMore: boolean }>> {
    return $api.get(getQueriedUrl({ url: "/profile/ai-bots/all", query: params as QueryParams }));
  }

  public async getAiBotById(botId: string): Promise<AxiosResponse<AiBotDTO>> {
    return $api.get(`/profile/ai-bots/${botId}`);
  }

  public async getAiBotsByCreator(creatorId: string): Promise<AxiosResponse<AiBotDTO[]>> {
    return $api.get(`/profile/ai-bots/created-by/${creatorId}`);
  }


  /**
   * Получить список созданных AI-ботов текущего пользователя.
   */
  public async getMyAiBots(): Promise<AxiosResponse<UserDTO[]>> {
    return $api.get(`/profile/ai-bots/my`);
  }

  /**
   * Получить список AI-ботов, на которых подписан текущий пользователь.
   */
  public async getSubscribedAiBots(): Promise<AxiosResponse<UserDTO[]>> {
    return $api.get(`/profile/ai-bots/subscribed`);
  }

  /**
   * Подписаться или отписаться от AI-бота по его идентификатору.
   */
  public async followAiBotById(id: string): Promise<AxiosResponse<{ followers: number; isFollowing: boolean }>> {
    return $api.put(`/profile/${id}/follow`);
  }

  /**
   * Создать нового AI-бота. Для передачи аватара необходимо использовать FormData.
   */
  public async createAiBot(formData: FormData): Promise<AxiosResponse<UserDTO>> {
    return $api.post(`/profile/ai-bots`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  /**
   * Обновить данные AI-бота (без загрузки аватара).
   */
  public async updateAiBot(id: string, data: AiBotUpdatePayload): Promise<AxiosResponse<UserDTO>> {
    return $api.patch(`/profile/ai-bots/${id}`, data);
  }

  /**
   * Загрузить аватар для AI-бота.
   */
  public async uploadAiBotAvatar(id: string, formData: FormData): Promise<AxiosResponse<UserDTO>> {
    return $api.post(`/profile/ai-bots/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  /**
   * Получить фотографии для AI-бота.
   */
  public async getAiBotDetails(id: string): Promise<AxiosResponse<AiBotPhotoResponse>> {
    return $api.get(`/profile/ai-bots/${id}/details`);
  }

  /**
   * Загрузить новые фотографии для AI-бота.
   */
  public async addAiBotPhotos(id: string, formData: FormData): Promise<AxiosResponse<AiBotPhotoResponse>> {
    return $api.post(`/profile/ai-bots/${id}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  /**
   * Удалить фотографии AI-бота по ссылкам.
   */
  public async deleteAiBotPhotos(id: string, photoUrls: string[]): Promise<AxiosResponse<AiBotPhotoResponse>> {
    return $api.delete(`/profile/ai-bots/${id}/photos`, {
      data: { photoUrls },
    });
  }

  /**
   * Удалить AI-бота по идентификатору.
   */
  public async deleteAiBot(id: string): Promise<AxiosResponse<void>> {
    return $api.delete(`/profile/ai-bots/${id}`);
  }

  /**
   * Отправить сообщение AI-боту от гостя.
   */
  public async sendGuestMessage(
    botId: string,
    payload: GuestAiBotMessagePayload,
  ): Promise<AxiosResponse<GuestAiBotMessageResponse>> {
    return $api.post(`/profile/ai-bots/${botId}/guest/messages`, payload);
  }

  public async reportAiBot(data: AiBotReportPayload): Promise<AxiosResponse<boolean>> {
    return $api.post(`/reports`, { targetType: 'ai-bot', ...data });
  }
}

const aiBotDetailsService = new AiBotDetailsService();

export default aiBotDetailsService;