import { API_URL } from "./client";

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`);

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }

  const data = await res.json();
  return data.users;
};

export const fetchBooksByUser = async (
  userId: string,
  collection = "library"
) => {
  const res = await fetch(
    `${API_URL}/users/${userId}/books?collection=${collection}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch books: ${res.status}`);
  }

  const data = await res.json();
  return data.books;
};

export const postBook = async (bookData: any) => {
  const res = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookData),
  });

  if (!res.ok) {
    throw new Error(`Failed to post book: ${res.status}`);
  }

  const data = await res.json();
  return data.book;
};