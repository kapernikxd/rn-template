export type UserId = string;
export interface UserDTO {
  _id: UserId;
  name: string;
  lastname: string;
  password: string;
  email?: string;
  isActivated: boolean;
  activationLink?: string;
  gender?: string;
  phone?: string;
  userBio?: string;
  aiPrompt?: string;
  username?: string;
  profession?: string;
  avatarFile?: string;
  city?: TCity;
  socialMediaLinks?: TSocialMediaLinks;
  following: number;
  followers: number;
  lastSeen?: string;
  moderationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderationImageStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBasicDTO {
  _id: UserId;
  name: string;
  lastname: string;
  avatarFile?: string;
}

export interface MyProfileDTO extends UserDTO {
  pushNotificationSettings: PushNotificationSettings;
}

export interface ProfileDTO extends UserDTO {
  isFollowing: boolean;
}

type TSocialMediaLinks = {
  facebook?: string;
  instagram?: string;
  vk?: string;
  tg?: string;
};

export type TCity = {
  name: string;
  countryCode: string;
  stateCode: string;
  latitude: string;
  longitude: string;
};

export interface PushNotificationSettings {
  likes: boolean;
  followers: boolean;
  groupMessages: boolean;
  participants: boolean;
  newPost: boolean;
  invites: boolean;
  pollAnswers: boolean;
  pollInvites: boolean;
}
