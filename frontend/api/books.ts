import { API_URL } from "./client";

export const fetchBooksByUser = async (
  userId: string,
  collection: "library" | "wishlist"
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

export const postBook = async (payload: {
  title: string;
  author: string;
  genre: string;
  year: number;
  cover_url: string;
  description: string;
  owner_id: string;
  collection_type: "library" | "wishlist";
  availability_status: "available" | "pending" | "lent";
}) => {
  const res = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create book: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.book;
};

export const deleteBookById = async (bookId: string) => {
  const res = await fetch(`${API_URL}/books/${bookId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete book: ${res.status} ${errorText}`);
  }
};