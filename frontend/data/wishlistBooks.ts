import type { Book } from "../context/BooksContext";

export const wishlistBooks: Book[] = [
  {
    id: 8,
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    year: 1949,
    cover: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    description:
      "A man struggles to survive in a totalitarian society ruled by constant surveillance.",
  },
  {
    id: 9,
    title: "The Hunger Games",
    author: "Suzanne Collins",
    genre: "Dystopian",
    year: 2008,
    cover: "https://covers.openlibrary.org/b/id/7267116-L.jpg",
    description:
      "Katniss Everdeen volunteers for a deadly televised competition in a dystopian future.",
  },
  {
    id: 10,
    title: "The Martian",
    author: "Andy Weir",
    genre: "Science Fiction",
    year: 2011,
    cover: "https://covers.openlibrary.org/b/id/8370226-L.jpg",
    description:
      "An astronaut stranded on Mars must use science and ingenuity to survive.",
  },
  {
    id: 11,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Classic",
    year: 1813,
    cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg",
    description:
      "Elizabeth Bennet navigates love, class, and societal expectations in Regency England.",
  },
  {
    id: 12,
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    genre: "Thriller",
    year: 2005,
    cover: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    description:
      "A journalist and a hacker investigate a decades-old disappearance in a wealthy Swedish family.",
  },
  {
    id: 13,
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    year: 2021,
    cover: "https://covers.openlibrary.org/b/id/11153234-L.jpg",
    description:
      "A lone astronaut wakes up with amnesia and must save Earth from an extinction-level threat.",
  },
];
