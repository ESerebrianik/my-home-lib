import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { borrowedBooks as mockBorrowedBooks } from "../data/borrowedBooks";
import { lentBooks as mockLentBooks } from "../data/lentBooks";
import { fetchBooksByUser, postBook } from "../api/books";

import type { Book, BookStatus, NewBook, CollectionType } from "../types/books";
import { mapApiBookToBook } from "../mappers/mapApiBookToBook";
import { useUsers } from "./UsersContext";

type BooksContextType = {
  books: Book[];
  libraryBooks: Book[];
  wishlistBooks: Book[];
  borrowedBooks: Book[];
  lentBooks: Book[];

  addBook: (collection: CollectionType, book: NewBook) => Promise<void>;
  deleteBook: (collection: CollectionType, id: string) => void;

  getBookById: (bookId?: string) => Book | undefined;
  getMyAvailableBooks: () => Book[];
};

const BooksContext = createContext<BooksContextType | undefined>(undefined);

const normalizeBooks = (
  books: {
    id?: number | string;
    title: string;
    author: string;
    genre: string;
    year: number;
    cover?: string;
    description: string;
  }[],
  ownerId: string,
  status: BookStatus
): Book[] =>
  books.map((book, index) => ({
    ...book,
    id: String(book.id || index + 1),
    ownerId,
    status,
  }));

const initialManualBorrowedBooks: Book[] = normalizeBooks(
  mockBorrowedBooks,
  "u2",
  "lent"
);

const initialManualLentBooks: Book[] = normalizeBooks(
  mockLentBooks,
  "u1",
  "lent"
);

export function BooksProvider({ children }: { children: ReactNode }) {
  const { currentUserId } = useUsers();

  const [books, setBooks] = useState<Book[]>([]);
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [manualBorrowedBooks, setManualBorrowedBooks] = useState<Book[]>(
    initialManualBorrowedBooks
  );
  const [manualLentBooks, setManualLentBooks] = useState<Book[]>(
    initialManualLentBooks
  );

  useEffect(() => {
    if (!currentUserId) return;

    fetchBooksByUser(currentUserId, "library")
      .then((data) => {
        setBooks(data.map(mapApiBookToBook));
      })
      .catch((err) => {
        console.error("FAILED TO FETCH LIBRARY BOOKS:", err);
      });

    fetchBooksByUser(currentUserId, "wishlist")
      .then((data) => {
        setWishlistBooks(data.map(mapApiBookToBook));
      })
      .catch((err) => {
        console.error("FAILED TO FETCH WISHLIST BOOKS:", err);
      });
  }, [currentUserId]);

  const getMyAvailableBooks = () =>
    books.filter(
      (book) => book.ownerId === currentUserId && book.status === "available"
    );

  const libraryBooks = getMyAvailableBooks();
  const borrowedBooks = manualBorrowedBooks;
  const lentBooks = manualLentBooks;

  const addBook = async (collection: CollectionType, book: NewBook) => {
    if (!currentUserId) return;

    if (collection !== "library" && collection !== "wishlist") {
      console.warn(`Collection "${collection}" is not persisted to backend yet.`);
      return;
    }

    const payload = {
      title: book.title,
      author: book.author,
      genre: book.genre,
      year: book.year,
      cover_url: book.cover || "",
      description: book.description,
      owner_id: currentUserId,
      collection_type: collection,
      availability_status: "available",
    };

    try {
      await postBook(payload);

      if (collection === "library") {
        const libraryData = await fetchBooksByUser(currentUserId, "library");
        setBooks(libraryData.map(mapApiBookToBook));
      }

      if (collection === "wishlist") {
        const wishlistData = await fetchBooksByUser(currentUserId, "wishlist");
        setWishlistBooks(wishlistData.map(mapApiBookToBook));
      }
    } catch (err) {
      console.error("FAILED TO ADD BOOK:", err);
      throw err;
    }
  };

  const deleteBook = (collection: CollectionType, id: string) => {
    switch (collection) {
      case "library":
        setBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id)
        );
        break;
      case "wishlist":
        setWishlistBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id)
        );
        break;
      case "borrowed":
        setManualBorrowedBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id)
        );
        break;
      case "lent":
        setManualLentBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id)
        );
        break;
    }
  };

  const getBookById = (bookId?: string) =>
    [...books, ...wishlistBooks, ...borrowedBooks, ...lentBooks].find(
      (book) => book.id === bookId
    );

  const value = useMemo(
    () => ({
      books,
      libraryBooks,
      wishlistBooks,
      borrowedBooks,
      lentBooks,
      addBook,
      deleteBook,
      getBookById,
      getMyAvailableBooks,
    }),
    [books, libraryBooks, wishlistBooks, borrowedBooks, lentBooks]
  );

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);

  if (!context) {
    throw new Error("useBooks must be used within a BooksProvider");
  }

  return context;
}