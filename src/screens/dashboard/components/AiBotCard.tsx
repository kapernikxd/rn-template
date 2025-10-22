import { ImageBackground, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';

import type { AiBotMainPageBot } from '../../../types';
import { BASE_URL } from '../../../constants/links';

const PLACEHOLDER_IMAGE = require('../../../assets/noProfile.png');

type AiBotCardProps = {
  bot: AiBotMainPageBot;
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

const resolveImageSource = (bot: AiBotMainPageBot) => {
  const photo = getImageUri(bot.details?.photos?.[0]);
  if (photo) {
    return { uri: photo };
  }
  const avatar = getImageUri(bot.avatarFile);
  if (avatar) {
    return { uri: avatar };
  }
  return PLACEHOLDER_IMAGE;
};

export const AiBotCard = ({ bot, style, onPress }: AiBotCardProps) => {
  const { theme } = useTheme();
  const fullName = useMemo(() => {
    const parts = [bot.name, bot.lastname].filter(Boolean);
    return parts.length ? parts.join(' ') : 'AI Bot';
  }, [bot.lastname, bot.name]);

  const description = bot.details?.intro ?? bot.userBio ?? '';
  const username = bot.username ? `@${bot.username}` : undefined;
  const followers = formatFollowers(bot.followers);
  const profession = bot.profession ?? bot.details?.usefulness?.[0];
  const imageSource = resolveImageSource(bot);

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
