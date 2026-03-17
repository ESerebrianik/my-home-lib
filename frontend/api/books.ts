import { API_URL } from "./client";

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  const data = await res.json();
  return data.users;
};

export const fetchBooksByUser = async (userId: string, collection = "library") => {
  const res = await fetch(
    `${API_URL}/users/${userId}/books?collection=${collection}`
  );
  const data = await res.json();
  return data.books;
};