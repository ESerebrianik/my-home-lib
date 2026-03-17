import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { books as mockLibraryBooks } from "../data/books";
import { borrowedBooks as mockBorrowedBooks } from "../data/borrowedBooks";
import { lentBooks as mockLentBooks } from "../data/lentBooks";
import { wishlistBooks as mockWishlistBooks } from "../data/wishlistBooks";

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type BookStatus = "available" | "pending" | "lent";

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

type NewBook = Omit<Book, "id" | "ownerId" | "status">;

export type LoanStatus =
  | "requested"
  | "approved"
  | "declined"
  | "borrowed"
  | "returned";

export type Loan = {
  id: string;
  bookId: number;
  ownerId: string;
  borrowerId: string;
  status: LoanStatus;
  requestedAt: string;
  approvedAt?: string;
  returnedAt?: string;
};

export type ChatMessage = {
  id: string;
  friendId: string;
  senderId: string | "system";
  text: string;
  time: string;
  bookId?: number;
  loanId?: string;
};

export type CollectionType = "library" | "wishlist" | "borrowed" | "lent";

type BooksContextType = {
  users: User[];
  currentUserId: string;
  currentUser: User | undefined;
  setCurrentUserId: (userId: string) => void;

  books: Book[];
  loans: Loan[];
  messages: ChatMessage[];

  libraryBooks: Book[];
  wishlistBooks: Book[];
  borrowedBooks: Book[];
  lentBooks: Book[];

  addBook: (collection: CollectionType, book: NewBook) => void;
  deleteBook: (collection: CollectionType, id: number) => void;

  requestBook: (params: { bookId: number; ownerId: string }) => void;
  approveLoan: (loanId: string) => void;
  declineLoan: (loanId: string) => void;
  markReturned: (loanId: string) => void;

  getBookById: (bookId?: number) => Book | undefined;
  getLoanById: (loanId?: string) => Loan | undefined;
  getMessagesForFriend: (friendId: string) => ChatMessage[];

  getMyAvailableBooks: () => Book[];
  getFriendAvailableBooks: (friendId: string) => Book[];
  getBorrowedBooks: () => Book[];
  getLentBooks: () => Book[];
};

const BooksContext = createContext<BooksContextType | undefined>(undefined);

const users: User[] = [
  {
    id: "u1",
    name: "Anna",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: "u2",
    name: "John",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];

const normalizeBooks = (
  books: {
    id: number;
    title: string;
    author: string;
    genre: string;
    year: number;
    cover?: string;
    description: string;
  }[],
  ownerId: string,
  status: BookStatus,
): Book[] =>
  books.map((book, index) => ({
    ...book,
    id: book.id || index + 1,
    ownerId,
    status,
  }));

const initialBooks: Book[] = [
  ...normalizeBooks(mockLibraryBooks, "u1", "available"),
  {
    id: 1001,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    year: 1937,
    cover: "https://covers.openlibrary.org/b/isbn/9780345272577-L.jpg",
    description: "Bilbo Baggins goes on an unexpected journey.",
    ownerId: "u2",
    status: "available",
  },
  {
    id: 1002,
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    year: 1949,
    cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    description: "A novel about surveillance and totalitarianism.",
    ownerId: "u2",
    status: "available",
  },
];

const initialWishlistBooks: Book[] = normalizeBooks(
  mockWishlistBooks,
  "u1",
  "available",
);

const initialManualBorrowedBooks: Book[] = normalizeBooks(
  mockBorrowedBooks,
  "u2",
  "lent",
);

const initialManualLentBooks: Book[] = normalizeBooks(
  mockLentBooks,
  "u1",
  "lent",
);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("u1");
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [wishlistBooks, setWishlistBooks] =
    useState<Book[]>(initialWishlistBooks);
  const [manualBorrowedBooks, setManualBorrowedBooks] = useState<Book[]>(
    initialManualBorrowedBooks,
  );
  const [manualLentBooks, setManualLentBooks] = useState<Book[]>(
    initialManualLentBooks,
  );
  const [loans, setLoans] = useState<Loan[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const currentUser = users.find((user) => user.id === currentUserId);

  const getNow = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getMyAvailableBooks = () =>
    books.filter(
      (book) => book.ownerId === currentUserId && book.status === "available",
    );

  const getFriendAvailableBooks = (friendId: string) =>
    books.filter(
      (book) => book.ownerId === friendId && book.status === "available",
    );

  const getBorrowedBooks = () => {
    const borrowedBookIds = loans
      .filter(
        (loan) =>
          loan.borrowerId === currentUserId && loan.status === "borrowed",
      )
      .map((loan) => loan.bookId);

    const loanBorrowedBooks = books.filter((book) =>
      borrowedBookIds.includes(book.id),
    );

    return [...manualBorrowedBooks, ...loanBorrowedBooks];
  };

  const getLentBooks = () => {
    const lentBookIds = loans
      .filter(
        (loan) => loan.ownerId === currentUserId && loan.status === "borrowed",
      )
      .map((loan) => loan.bookId);

    const loanLentBooks = books.filter((book) => lentBookIds.includes(book.id));

    return [...manualLentBooks, ...loanLentBooks];
  };

  const libraryBooks = getMyAvailableBooks();
  const borrowedBooks = getBorrowedBooks();
  const lentBooks = getLentBooks();

  const addBook = (collection: CollectionType, book: NewBook) => {
    const newBook: Book = {
      id: Date.now(),
      ...book,
      ownerId: collection === "borrowed" ? "u2" : currentUserId,
      status:
        collection === "library" || collection === "wishlist"
          ? "available"
          : "lent",
    };

    switch (collection) {
      case "library":
        setBooks((currentBooks) => [newBook, ...currentBooks]);
        break;
      case "wishlist":
        setWishlistBooks((currentBooks) => [newBook, ...currentBooks]);
        break;
      case "borrowed":
        setManualBorrowedBooks((currentBooks) => [newBook, ...currentBooks]);
        break;
      case "lent":
        setManualLentBooks((currentBooks) => [newBook, ...currentBooks]);
        break;
    }
  };

  const deleteBook = (collection: CollectionType, id: number) => {
    switch (collection) {
      case "library":
        setBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id),
        );
        break;
      case "wishlist":
        setWishlistBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id),
        );
        break;
      case "borrowed":
        setManualBorrowedBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id),
        );
        break;
      case "lent":
        setManualLentBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id),
        );
        break;
    }
  };

  const requestBook = ({
    bookId,
    ownerId,
  }: {
    bookId: number;
    ownerId: string;
  }) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const existingActiveLoan = loans.find(
      (loan) =>
        loan.bookId === bookId &&
        ["requested", "approved", "borrowed"].includes(loan.status),
    );

    if (existingActiveLoan) return;

    const now = getNow();
    const loanId = `loan-${Date.now()}`;

    const newLoan: Loan = {
      id: loanId,
      bookId,
      ownerId,
      borrowerId: currentUserId,
      status: "requested",
      requestedAt: now,
    };

    setLoans((currentLoans) => [...currentLoans, newLoan]);

    setBooks((currentBooks) =>
      currentBooks.map((b) =>
        b.id === bookId ? { ...b, status: "pending" } : b,
      ),
    );

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `msg-${Date.now()}`,
        friendId: ownerId,
        senderId: currentUserId,
        text: "Hi, can I borrow this book from you?",
        time: now,
        bookId,
        loanId,
      },
    ]);
  };

  const approveLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = getNow();

    setLoans((currentLoans) =>
      currentLoans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: "borrowed",
              approvedAt: now,
            }
          : l,
      ),
    );

    setBooks((currentBooks) =>
      currentBooks.map((b) =>
        b.id === loan.bookId ? { ...b, status: "lent" } : b,
      ),
    );

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `msg-${Date.now()}`,
        friendId: loan.borrowerId,
        senderId: "system",
        text: "Borrow request approved.",
        time: now,
        bookId: loan.bookId,
        loanId,
      },
    ]);
  };

  const declineLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = getNow();

    setLoans((currentLoans) =>
      currentLoans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: "declined",
            }
          : l,
      ),
    );

    setBooks((currentBooks) =>
      currentBooks.map((b) =>
        b.id === loan.bookId ? { ...b, status: "available" } : b,
      ),
    );

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `msg-${Date.now()}`,
        friendId: loan.borrowerId,
        senderId: "system",
        text: "Borrow request declined.",
        time: now,
        bookId: loan.bookId,
        loanId,
      },
    ]);
  };

  const markReturned = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = getNow();

    setLoans((currentLoans) =>
      currentLoans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: "returned",
              returnedAt: now,
            }
          : l,
      ),
    );

    setBooks((currentBooks) =>
      currentBooks.map((b) =>
        b.id === loan.bookId ? { ...b, status: "available" } : b,
      ),
    );

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `msg-${Date.now()}`,
        friendId:
          currentUserId === loan.ownerId ? loan.borrowerId : loan.ownerId,
        senderId: "system",
        text: "Book marked as returned.",
        time: now,
        bookId: loan.bookId,
        loanId,
      },
    ]);
  };

 const getBookById = (bookId?: number) =>
  [...books, ...wishlistBooks, ...borrowedBooks, ...lentBooks].find(
    (book) => book.id === bookId,
  );

  const getLoanById = (loanId?: string) =>
    loans.find((loan) => loan.id === loanId);

  const getMessagesForFriend = (friendId: string) =>
    messages.filter((message) => message.friendId === friendId);

  const value = useMemo(
    () => ({
      users,
      currentUserId,
      currentUser,
      setCurrentUserId,
      books,
      loans,
      messages,
      libraryBooks,
      wishlistBooks,
      borrowedBooks,
      lentBooks,
      addBook,
      deleteBook,
      requestBook,
      approveLoan,
      declineLoan,
      markReturned,
      getBookById,
      getLoanById,
      getMessagesForFriend,
      getMyAvailableBooks,
      getFriendAvailableBooks,
      getBorrowedBooks,
      getLentBooks,
    }),
    [
      currentUserId,
      currentUser,
      books,
      loans,
      messages,
      libraryBooks,
      wishlistBooks,
      borrowedBooks,
      lentBooks,
      addBook,
      requestBook,
      approveLoan,
      declineLoan,
      markReturned,
      getBookById,
      getLoanById,
      getMessagesForFriend,
      getMyAvailableBooks,
      getFriendAvailableBooks,
      getBorrowedBooks,
      getLentBooks,
    ],
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
