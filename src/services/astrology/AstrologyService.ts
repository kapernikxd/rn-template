import type { AxiosResponse } from 'axios';

import { LANGUAGE_OPTIONS, normalizeLanguageCode } from '../../constants/languages';
import i18n from '../../helpers/i18n';
import $api from '../../helpers/http';
import type { ProfileInfoData } from '../../helpers/profile/profileInfoStorage';
import type { HoroscopeCategory, HoroscopeResponse } from '../../types/astrology';

class AstrologyService {
  private getLanguageParam(languageCode?: string): string {
    return (
      normalizeLanguageCode(languageCode ?? i18n.language ?? i18n.resolvedLanguage) ??
      LANGUAGE_OPTIONS[0].code
    );
  }

  async generateHoroscope(
    category: HoroscopeCategory,
    profile: ProfileInfoData,
    languageCode?: string,
  ): Promise<HoroscopeResponse> {
    const lang = this.getLanguageParam(languageCode);
    const response: AxiosResponse<HoroscopeResponse> = await $api.post(
      `astrology/${category}`,
      profile,
      { params: { lang } },
    );

    return response.data;
  }
}

const astrologyService = new AstrologyService();

export default astrologyService;
