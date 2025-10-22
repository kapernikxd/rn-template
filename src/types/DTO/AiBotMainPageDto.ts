export interface AiBotMainPageDetails {
  categories?: string[];
  intro?: string;
  usefulness?: string[];
  photos?: string[];
}

export interface AiBotMainPageBot {
  id: string;
  name?: string;
  lastname?: string;
  avatarFile?: string;
  profession?: string;
  userBio?: string;
  username?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  details: AiBotMainPageDetails;
}
