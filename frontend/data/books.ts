import { BookStatus } from "@/context/BooksContext";

export type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  cover?: string;
  description: string;
  ownerId?: string;
  status?: BookStatus;
};

export const books: Book[] = [
  {
    id: 1,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    year: 1937,
    cover: "https://covers.openlibrary.org/b/id/6979861-L.jpg",
    description:
      "Bilbo Baggins joins a group of dwarves on a quest to reclaim their mountain home from a dragon.",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    year: 1949,
    cover: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    description:
      "A chilling story about surveillance, censorship, and totalitarian control.",
  },
  {
    id: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Classic",
    year: 1813,
    cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg",
    description:
      "Elizabeth Bennet navigates love, class, and societal expectations in Regency England.",
  },
  {
    id: 4,
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    year: 1965,
    cover: "https://covers.openlibrary.org/b/id/8101356-L.jpg",
    description:
      "A political and ecological epic set on the desert planet Arrakis.",
  },
  {
    id: 5,
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genre: "Fantasy",
    year: 2007,
    cover: "https://covers.openlibrary.org/b/id/8231996-L.jpg",
    description: "Kvothe recounts the story of his extraordinary life.",
  },
];
