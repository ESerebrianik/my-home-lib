import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchBooksByUser, postBook } from "../api/books";
import type { Book, NewBook, CollectionType } from "../types/books";
import { mapApiBookToBook } from "../mappers/mapApiBookToBook";
import { useUsers } from "./UsersContext";

type BooksContextType = {
  books: Book[];
  libraryBooks: Book[];
  wishlistBooks: Book[];

  addBook: (collection: CollectionType, book: NewBook) => Promise<void>;
  deleteBook: (collection: CollectionType, id: string) => void;

  getBookById: (bookId?: string) => Book | undefined;
  getMyAvailableBooks: () => Book[];
  refreshBooks: () => Promise<void>;
};

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: { children: ReactNode }) {
  const { currentUserId } = useUsers();

  // books = все library-книги текущего пользователя из backend
  const [books, setBooks] = useState<Book[]>([]);
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);

  const refreshBooks = async () => {
    if (!currentUserId) {
      setBooks([]);
      setWishlistBooks([]);
      return;
    }

    try {
      const [libraryData, wishlistData] = await Promise.all([
        fetchBooksByUser(currentUserId, "library"),
        fetchBooksByUser(currentUserId, "wishlist"),
      ]);

      const mappedLibraryBooks = libraryData.map(mapApiBookToBook);
      const mappedWishlistBooks = wishlistData.map(mapApiBookToBook);

      console.log("FETCHED LIBRARY BOOKS:", mappedLibraryBooks);
      console.log("FETCHED WISHLIST BOOKS:", mappedWishlistBooks);

      setBooks(mappedLibraryBooks);
      setWishlistBooks(mappedWishlistBooks);
    } catch (err) {
      console.error("FAILED TO REFRESH BOOKS:", err);
    }
  };

  useEffect(() => {
    refreshBooks();
  }, [currentUserId]);

  // ✅ в My Books показываем только доступные книги
  const getMyAvailableBooks = () =>
    books.filter((book) => book.status === "available");

  // ✅ libraryBooks теперь = только available
  const libraryBooks = getMyAvailableBooks();

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
      console.log("POST BOOK PAYLOAD:", payload);

      await postBook(payload);
      await refreshBooks();
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
    }
  };

  const getBookById = (bookId?: string) =>
    [...books, ...wishlistBooks].find((book) => book.id === bookId);

  const value = useMemo(
    () => ({
      books,
      libraryBooks,
      wishlistBooks,
      addBook,
      deleteBook,
      getBookById,
      getMyAvailableBooks,
      refreshBooks,
    }),
    [books, libraryBooks, wishlistBooks]
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