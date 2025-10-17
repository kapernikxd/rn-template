import type { NavigatorScreenParams } from '@react-navigation/native';

export type DashboardStackParamList = {
  Dashboard: undefined;
  DashboardDetails: undefined;
};

export type DiscoverStackParamList = {
  Discover: undefined;
  DiscoverCollection: { collectionId: string };
};

export type ActivityStackParamList = {
  Activity: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  ProfileSettings: undefined;
};

export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  DiscoverTab: NavigatorScreenParams<DiscoverStackParamList>;
  ActivityTab: NavigatorScreenParams<ActivityStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
