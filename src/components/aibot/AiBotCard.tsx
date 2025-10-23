// AiBotCard.tsx
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      // необязательное поле просмотров, если у тебя есть
      viewsCount?: number;
    });

type AiBotCardProps = {
  bot: AiBotCardEntity;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

/* ---------- utils ---------- */
const joinUrl = (base: string, path: string) =>
  (base.endsWith('/') ? base : base + '/') + path.replace(/^\//, '');

const getImageUri = (v?: string) =>
  v ? (/^https?:\/\//i.test(v) ? v : joinUrl(BASE_URL, `images/${v}`)) : undefined;

const getDetails = (b: AiBotCardEntity) => {
  if ('details' in b && b.details) return b.details;
  const intro = 'intro' in b ? b.intro : undefined;
  const usefulness = 'usefulness' in b ? b.usefulness : undefined;
  const photos = 'photos' in b ? b.photos : undefined;
  const categories = 'categories' in b ? b.categories : undefined;
  if (!intro && !usefulness?.length && !photos?.length && !categories?.length) return undefined;
  return { intro, usefulness, photos, categories };
};

const resolveBgImage = (b: AiBotCardEntity) => {
  const d = getDetails(b);
  const photo = getImageUri(d?.photos?.[0]);
  if (photo) return { uri: photo };
  const avatar = getImageUri((b as any).avatarFile);
  if (avatar) return { uri: avatar };
  return PLACEHOLDER_IMAGE;
};

const resolveAvatar = (b: AiBotCardEntity) => {
  // маленький аватар слева от имени
  const avatar = getImageUri((b as any).avatarFile) ?? getImageUri(getDetails(b)?.photos?.[0]);
  return avatar ? { uri: avatar } : PLACEHOLDER_IMAGE;
};

const formatNum = (n?: number) =>
  typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString('en-US').replace(/,/g, ' ') : undefined;

const getDescription = (b: AiBotCardEntity) =>
  getDetails(b)?.intro || ('intro' in b && b.intro) || ('userBio' in b && b.userBio) || undefined;

/* ---------- component ---------- */
export const AiBotCard = ({ bot, style, onPress }: AiBotCardProps) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  console.log("bot!!!", bot)

  const fullName = useMemo(() => {
    const name = ('name' in bot && bot.name) || undefined;
    const last = ('lastname' in bot && bot.lastname) || undefined;
    if (name || last) return [name, last].filter(Boolean).join(' ');
    if ('username' in bot && bot.username) return bot.username!;
    return 'AI Agent';
  }, [bot]);

  const bgSource = useMemo(() => resolveBgImage(bot), [bot]);
  const avatarSrc = useMemo(() => resolveAvatar(bot), [bot]);

  const username = 'username' in bot && bot.username ? `@${bot.username}` : undefined;
  const snippet = useMemo(() => getDescription(bot), [bot]);

  // метрика под «глаз»: приоритет viewsCount -> followers
  const views = ('viewsCount' in bot && (bot as any).viewsCount) as number | undefined;
  const followers = ('followers' in bot && bot.followers) as number | undefined;
  const metric = formatNum(views ?? followers);

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={onPress}
      disabled={!onPress}
      android_ripple={{ color: theme.primary + '33', foreground: true }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={fullName}
    >
      <ImageBackground
        source={bgSource}
        style={styles.image}
        imageStyle={styles.imageBorder}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      >
        {/* нижний градиент как на макете */}
        <LinearGradient
          colors={['transparent', 'rgba(12,14,18,0.35)', 'rgba(12,14,18,0.8)']}
          locations={[0.45, 0.7, 1]}
          style={styles.gradient}
          pointerEvents="none"
        />

        {/* контентный блок снизу */}
        <View style={styles.content}>
          {/* имя с мини-аватаром */}
          <View style={styles.titleRow}>
            <Image source={avatarSrc} style={styles.avatar} />
            <Text style={styles.name} numberOfLines={1}>
              {fullName}
            </Text>
          </View>


          {bot.profession ? (
            <Text style={styles.profession} numberOfLines={2}>
              {bot.profession}
            </Text>
          ) : null}

          {/* сниппет */}
          {snippet ? (
            <Text style={styles.snippet} numberOfLines={2}>
              {snippet}
            </Text>
          ) : null}

          {/* нижняя строка: @username и «глаз» + число */}
          {/* <View style={styles.bottomRow}>
            {username ? (
              <Text style={styles.username} numberOfLines={1} ellipsizeMode="middle">
                {username}
              </Text>
            ) : <View />}

            {metric ? (
              <View style={styles.views}>
                <Feather name="eye" size={16} color="#C8CCD6" />
                <Text style={styles.viewsText}>{metric}</Text>
              </View>
            ) : null}
          </View> */}
        </View>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        )}
      </ImageBackground>
    </Pressable>
  );
};

/* ---------- styles ---------- */
const RADIUS = 8;

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: '#0F1117',
  },
  image: {
    width: '100%',
    aspectRatio: 0.68, // как на референсе
    justifyContent: 'flex-end',
  },
  imageBorder: {
    borderRadius: RADIUS,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 11,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  profession: {
    color: '#D7DBE3',
    fontSize: 15,
    lineHeight: 16,
    // paddingHorizontal: 8,
    // paddingVertical: 4,
    // backgroundColor: 'rgba(0, 0, 0, 0.75)',
    // borderRadius: 12,
    // marginTop: 0,
  },
  snippet: {
    color: '#D7DBE3',
    fontSize: 12,
    lineHeight: 14,
    // marginTop: 0,
  },
  bottomRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  username: {
    color: '#9CA3AF',
    fontSize: 14,
    maxWidth: '70%',
  },
  views: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewsText: {
    color: '#D7DBE3',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
