export interface AuthUserDTO {
  email: string;
  id: string;
  isActivated: boolean;
  fullName: string;
}

export interface AuthResponse {
  user: AuthUserDTO;
}

export interface AuthResponseExtend {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDTO;
}

export interface AuthRejection {
  message: string;
}

export type ChangePasswordProps = {
  oldPassword:string;
  password:string;
}

export interface AuthProfileDTO {
  name: string;
  lastname: string;
  email?: string;
  phone?: string;
  userBio?: string;
  username?: string;
  profession: string;
  socialMedia?: TSocialMediaLinks;
  city?: TCity;
}

type TSocialMediaLinks = {
  facebook?: string;
  instagram?: string;
  vk?: string;
};

type TCity = {
  name: string;
  countryCode: string;
  stateCode: string;
  latitude: string;
  longitude: string;
};

export interface AuthProfileResponse {
  user: AuthProfileDTO;
}
