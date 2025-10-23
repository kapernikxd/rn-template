import { ImageBackground, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';

import type { AiBotDTO, AiBotMainPageBot, UserDTO } from '../../types';
import { BASE_URL } from '../../constants/links';

const PLACEHOLDER_IMAGE = require('../../assets/noProfile.png');

export type AiBotCardEntity =
  | AiBotMainPageBot
  | (AiBotDTO & { details?: AiBotMainPageBot['details'] })
  | (UserDTO & {
      intro?: string;
      usefulness?: string[];
      categories?: string[];
      photos?: string[];
      details?: AiBotMainPageBot['details'];
    });

type AiBotCardProps = {
  bot: AiBotCardEntity;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

const formatFollowers = (followers?: number) => {
  if (typeof followers !== 'number' || Number.isNaN(followers)) {
    return undefined;
  }
  return followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const getImageUri = (value?: string) => {
  if (!value) {
    return undefined;
  }
  return /^https?:\/\//i.test(value) ? value : `${BASE_URL}images/${value}`;
};

type DetailsLike = AiBotMainPageBot['details'];

const getDetails = (bot: AiBotCardEntity): DetailsLike | undefined => {
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

const resolveImageSource = (bot: AiBotCardEntity) => {
  const details = getDetails(bot);
  const photo = getImageUri(details?.photos?.[0]);
  if (photo) {
    return { uri: photo };
  }
  const avatar = getImageUri(bot.avatarFile);
  if (avatar) {
    return { uri: avatar };
  }
  return PLACEHOLDER_IMAGE;
};

const getDescription = (bot: AiBotCardEntity) => {
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
  if ('aiPrompt' in bot && bot.aiPrompt) {
    return bot.aiPrompt;
  }
  return undefined;
};

const getProfession = (bot: AiBotCardEntity) => {
  if (bot.profession) {
    return bot.profession;
  }
  const details = getDetails(bot);
  if (details?.usefulness?.length) {
    return details.usefulness[0];
  }
  if ('usefulness' in bot && bot.usefulness?.length) {
    return bot.usefulness[0];
  }
  if ('categories' in bot && bot.categories?.length) {
    return bot.categories[0];
  }
  return undefined;
};

export const getAiBotIdentifier = (bot: AiBotCardEntity): string => {
  if ('botId' in bot && bot.botId) {
    return bot.botId;
  }
  if ('id' in bot && bot.id) {
    return bot.id;
  }
  if ('_id' in bot && bot._id) {
    return bot._id;
  }
  return '';
};

export const AiBotCard = ({ bot, style, onPress }: AiBotCardProps) => {
  const { theme } = useTheme();
  const fullName = useMemo(() => {
    const parts = [bot.name, bot.lastname].filter(Boolean);
    return parts.length ? parts.join(' ') : 'AI Bot';
  }, [bot.lastname, bot.name]);

  const description = useMemo(() => getDescription(bot), [bot]);
  const username = bot.username ? `@${bot.username}` : undefined;
  const followers = formatFollowers(bot.followers);
  const profession = useMemo(() => getProfession(bot), [bot]);
  const imageSource = useMemo(() => resolveImageSource(bot), [bot]);

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={onPress}
      android_ripple={{ color: theme.primary + '40' }}
      disabled={!onPress}
    >
      <ImageBackground source={imageSource} style={styles.image} imageStyle={styles.imageBorder}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName}
            </Text>
            {followers ? (
              <View style={styles.metric}>
                <Feather name="users" size={14} color={theme.white} />
                <Text style={styles.metricText}>{followers}</Text>
              </View>
            ) : null}
          </View>

          {description ? (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            {username ? (
              <Text style={styles.username} numberOfLines={1}>
                {username}
              </Text>
            ) : null}
            {profession ? (
              <Text style={styles.profession} numberOfLines={1}>
                {profession}
              </Text>
            ) : null}
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0F1117',
  },
  image: {
    width: '100%',
    aspectRatio: 0.68,
    justifyContent: 'flex-end',
  },
  imageBorder: {
    borderRadius: 24,
  },
  overlay: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: 'rgba(9, 11, 17, 0.55)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metricText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  username: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  profession: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
