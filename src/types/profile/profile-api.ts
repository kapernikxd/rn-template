import { UserDTO } from "../DTO";

export interface UsersFilterParams {
  search?: string;
  limit?: number;
  page?: number;
}

export interface UsersResponse {
  users: UserDTO[];
  hasMore: boolean;
}