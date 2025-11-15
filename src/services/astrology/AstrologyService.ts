import type { AxiosResponse } from 'axios';

import $api from '../../helpers/http';
import type { ProfileInfoData } from '../../helpers/profile/profileInfoStorage';
import type { HoroscopeCategory, HoroscopeResponse } from '../../types/astrology';

class AstrologyService {
  async generateHoroscope(
    category: HoroscopeCategory,
    profile: ProfileInfoData,
  ): Promise<HoroscopeResponse> {
    const response: AxiosResponse<HoroscopeResponse> = await $api.post(
      `astrology/${category}`,
      profile,
    );

    return response.data;
  }
}

const astrologyService = new AstrologyService();

export default astrologyService;
