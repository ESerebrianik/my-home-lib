import { API_URL } from "./client";

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`);

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }

  const data = await res.json();
  return data.users;
};