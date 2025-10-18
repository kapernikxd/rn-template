import { PushNotificationSettings, UserId } from "../DTO";

type LucideIcon = string;

export interface IUser {
  name: string;
  lastname: string;
  email: string;
  isActivated: boolean;
  id: string;
}

export type AvatarFile = { uri: string; name: string; type: string };

export interface ProfileMinData {
  _id: UserId;
  name: string;
  lastname: string;
  avatarFile?: string;
  username?: string;
}

export interface ProfilesFilterParams {
  page?: number;
  limit?: number;
}

export type UpdateProfileProps = {
  lastname?: string,
  name?: string,
  phone?: string,
  profession?: string,
  userBio?: string,
  username?: string,
  socialMediaLinks?: {
    facebook?: string,
    instagram?: string,
    vk?: string,
  }
  pushNotificationSettings?: PushNotificationSettings,
  gender?: 'MALE' | 'FEMALE',
}

export type TalkieStat = {
  label: string;
  value: string;
  icon: LucideIcon;
};


export type AiAgentCard = {
  name: string;
  image: string;
  description: string;
  stats: TalkieStat[];
};


export type EditableProfile = {
  userName: string;
  gender: string;
  intro: string;
  profession: string;
};


export type ProfileFieldError = {
  field: string;
  message: string;
};

export type ProfileFormErrorResponse = {
  errors?: ProfileFieldError[];
};