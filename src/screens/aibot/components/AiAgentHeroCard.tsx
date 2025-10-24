import React, { memo } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Spacer } from "rn-vs-lb";
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
        >
          {categories.map((item) => (
            <View key={item} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Spacer size="xs" />
      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button
            leftIcon={<Ionicons name={isFollowing ? "person-remove-outline" : "person-add-outline"} size={18} color={isFollowing ? theme.greyBtnText : theme.white} />}
            title={followButtonTitle}
            onPress={onToggleFollow}
            loading={isFollowUpdating}
            disabled={disableFollowAction}
            type={isFollowing ? "gray-outline" : "primary"}
            style={{ borderRadius: 16, minHeight: 42 }}
          />
        </View>
        <View style={[styles.buttonWrapper, styles.buttonWrapperLast]}>
          <Button
            leftIcon={<Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.primary} />}
            title="Перейти к чату"
            onPress={onStartChat}
            loading={isChatLoading}
            type="primary-outline"
            disabled={!aiBotId || isChatLoading}
            style={{ borderRadius: 16, minHeight: 42 }}
          />
        </View>
      </View>
    </View>
  ),
);

AiAgentHeroCard.displayName = "AiAgentHeroCard";
