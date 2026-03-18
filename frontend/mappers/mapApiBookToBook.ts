import type { Book } from "../types/books";

export const mapApiBookToBook = (book: any): Book => ({
  id: String(book.book_id),
  title: book.title,
  author: book.author,
  genre: book.genre || "Unknown",
  year: Number(book.year) || new Date().getFullYear(),
  cover:
    book.cover_url ||
    `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
  description: book.description || "",
  ownerId: book.owner_id ? String(book.owner_id) : undefined,
  status: book.availability_status || "available",
});