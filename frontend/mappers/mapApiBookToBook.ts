import type { Book } from "../types/books";

export const mapApiBookToBook = (api: any): Book => ({
  id: String(api.book_id),
  title: api.title,
  author: api.author,
  genre: api.genre || "Unknown",
  year: Number(api.year) || new Date().getFullYear(),
  cover: api.cover_url?.replace("http://", "https://") || "",
  description: api.description || "",
  ownerId: api.owner_id ? String(api.owner_id) : undefined,
  status: api.availability_status || "available",
});