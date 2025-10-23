import React, { memo } from "react";
import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "rn-vs-lb";
import { ThemeType } from "rn-vs-lb/theme";

import { AiAgentStyles } from "../styles";

type AiAgentHeroCardProps = {
  styles: AiAgentStyles;
  theme: ThemeType;
  avatarUri: string;
  displayName: string;
  profession: string;
  intro: string;
  categories: string[];
  followButtonTitle: string;
  onToggleFollow: () => void;
  isFollowUpdating: boolean;
  disableFollowAction: boolean;
  onStartChat: () => void;
  isChatLoading: boolean;
  aiBotId?: string;
  isFollowing: boolean;
};

const MAX_DESCRIPTION_LINES = 4;

export const AiAgentHeroCard = memo(
  ({
    styles,
    theme,
    avatarUri,
    displayName,
    profession,
    intro,
    categories,
    followButtonTitle,
    onToggleFollow,
    isFollowUpdating,
    disableFollowAction,
    onStartChat,
    isChatLoading,
    aiBotId,
    isFollowing,
  }: AiAgentHeroCardProps) => (
    <View style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.heroInfo}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.primary} />
            <Text style={styles.badgeText}>AI-агент</Text>
          </View>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {displayName}
          </Text>
          {!!profession && (
            <Text style={styles.profession} numberOfLines={2} ellipsizeMode="tail">
              {profession}
            </Text>
          )}
        </View>
      </View>

      {!!intro && (
        <Text style={styles.description} numberOfLines={MAX_DESCRIPTION_LINES} ellipsizeMode="tail">
          {intro}
        </Text>
      )}

      {!!categories.length && (
        <View style={styles.tagsContainer}>
          {categories.map((item) => (
            <View key={item} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button
            title={followButtonTitle}
            onPress={onToggleFollow}
            loading={isFollowUpdating}
            disabled={disableFollowAction}
            type={isFollowing ? "gray-outline" : "primary"}
          />
        </View>
        <View style={[styles.buttonWrapper, styles.buttonWrapperLast]}>
          <Button
            title="Перейти к чату"
            onPress={onStartChat}
            loading={isChatLoading}
            type="primary-outline"
            disabled={!aiBotId || isChatLoading}
          />
        </View>
      </View>
    </View>
  ),
);

AiAgentHeroCard.displayName = "AiAgentHeroCard";
