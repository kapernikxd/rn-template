import { ProfileMinData } from "../profile";
import { UserDTO } from "./UserDto";

export interface AiBotDTO extends UserDTO {
  photos?: string[];
  usefulness?: string[];
  intro?: string;
  categories?: string[];
  botId: string;
  createdBy: ProfileMinData;
  aiPrompt: string;
  isFollowing?: boolean;
}

export interface AiBotDetails {
  aiPrompt: string;
  photos?: string[];
  usefulness?: string[];
  intro?: string;
  categories?: string[];
  botId?: string;
  createdBy?: ProfileMinData;
  isFollowing?: boolean;
}
