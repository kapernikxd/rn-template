import type { AiBotCardEntity } from '../../components/aibot/AiBotCard';
import { BASE_URL } from '../../constants/links';

const joinUrl = (base: string, path: string) =>
  (base.endsWith('/') ? base : `${base}/`) + path.replace(/^\//, '');

const toAbsoluteImageUri = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return joinUrl(BASE_URL, `images/${value}`);
};

type BotDetails = {
  intro?: string;
  usefulness?: string[];
  photos?: string[];
  categories?: string[];
};

const getDetails = (bot: AiBotCardEntity): BotDetails | undefined => {
  if ('details' in bot && bot.details) {
    return bot.details;
  }

  const intro = 'intro' in bot ? bot.intro : undefined;
  const usefulness = 'usefulness' in bot ? bot.usefulness : undefined;
  const photos = 'photos' in bot ? bot.photos : undefined;
  const categories = 'categories' in bot ? bot.categories : undefined;

  if (!intro && !usefulness?.length && !photos?.length && !categories?.length) {
    return undefined;
  }

  return {
    intro,
    usefulness,
    photos,
    categories,
  };
};

export const getAiBotImageUri = (bot: AiBotCardEntity): string | undefined => {
  const details = getDetails(bot);
  const photo = details?.photos?.[0];
  if (photo) {
    const uri = toAbsoluteImageUri(photo);
    if (uri) {
      return uri;
    }
  }

  const avatar = (bot as { avatarFile?: string | null }).avatarFile;
  if (avatar) {
    return toAbsoluteImageUri(avatar);
  }

  return undefined;
};

export const getAiBotTitle = (bot: AiBotCardEntity): string => {
  const name = 'name' in bot ? bot.name : undefined;
  const lastname = 'lastname' in bot ? bot.lastname : undefined;
  const fullName = [name, lastname].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }

  if ('username' in bot && bot.username) {
    return `@${bot.username}`;
  }

  return 'AI Agent';
};

export const getAiBotDescription = (bot: AiBotCardEntity): string | undefined => {
  const details = getDetails(bot);
  if (details?.intro) {
    return details.intro;
  }

  if ('intro' in bot && bot.intro) {
    return bot.intro;
  }

  if ('userBio' in bot && bot.userBio) {
    return bot.userBio;
  }

  return undefined;
};
