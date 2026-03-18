import type { User } from "../types/users";

export const mapApiUserToUser = (user: any): User => ({
  id: String(user.user_id),
  name: user.name,
  avatar: user.avatar_url,
});