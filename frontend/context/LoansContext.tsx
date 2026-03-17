import React, { createContext, useContext, useMemo, useState } from "react";

export type UserRole = "owner" | "borrower";

export type AppBook = {
  id: number;
  ownerId: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  description: string;
  cover: string;
  availabilityStatus: "available" | "pending" | "lent";
};

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
  sender: "me" | "friend" | "system";
  text: string;
  time: string;
  bookId?: number;
  loanId?: string;
};

type LoansContextType = {
  currentUserId: string;
  books: AppBook[];
  loans: Loan[];
  messages: ChatMessage[];
  requestBook: (params: { bookId: number; ownerId: string }) => void;
  approveLoan: (loanId: string) => void;
  declineLoan: (loanId: string) => void;
  markReturned: (loanId: string) => void;
  getFriendAvailableBooks: (friendId: string) => AppBook[];
  getBorrowedBooks: () => AppBook[];
  getLentBooks: () => AppBook[];
  getMessagesForFriend: (friendId: string) => ChatMessage[];
  getLoanById: (loanId?: string) => Loan | undefined;
  getBookById: (bookId?: number) => AppBook | undefined;
};

const LoansContext = createContext<LoansContextType | undefined>(undefined);

const initialBooks: AppBook[] = [
  {
    id: 1,
    ownerId: "1",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    year: 1937,
    description: "Bilbo Baggins goes on an unexpected journey.",
    cover: "https://covers.openlibrary.org/b/isbn/9780345272577-L.jpg",
    availabilityStatus: "available",
  },
  {
    id: 2,
    ownerId: "1",
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    year: 1949,
    description: "A novel about surveillance, control, and totalitarianism.",
    cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    availabilityStatus: "available",
  },
  {
    id: 3,
    ownerId: "2",
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    genre: "Programming",
    year: 2015,
    description: "Programming interview questions and solutions.",
    cover: "https://covers.openlibrary.org/b/isbn/9780984782857-L.jpg",
    availabilityStatus: "available",
  },
];

export function LoansProvider({ children }: { children: React.ReactNode }) {
  const currentUserId = "me";

  const [books, setBooks] = useState<AppBook[]>(initialBooks);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const requestBook = ({
    bookId,
    ownerId,
  }: {
    bookId: number;
    ownerId: string;
  }) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const loanId = `loan-${Date.now()}`;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newLoan: Loan = {
      id: loanId,
      bookId,
      ownerId,
      borrowerId: currentUserId,
      status: "requested",
      requestedAt: now,
    };

    setLoans((prev) => [...prev, newLoan]);

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, availabilityStatus: "pending" } : b
      )
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        friendId: ownerId,
        sender: "me",
        text: `Hi, can I borrow this book from you?`,
        time: now,
        bookId,
        loanId,
      },
    ]);
  };

  const approveLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? { ...l, status: "borrowed", approvedAt: now }
          : l
      )
    );

    setBooks((prev) =>
      prev.map((b) =>
        b.id === loan.bookId ? { ...b, availabilityStatus: "lent" } : b
      )
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        friendId: loan.ownerId,
        sender: "system",
        text: `Borrow request approved.`,
        time: now,
        bookId: loan.bookId,
        loanId,
      },
    ]);
  };

  const declineLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: "declined" } : l))
    );

    setBooks((prev) =>
      prev.map((b) =>
        b.id === loan.bookId ? { ...b, availabilityStatus: "available" } : b
      )
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        friendId: loan.ownerId,
        sender: "system",
        text: `Borrow request declined.`,
        time: now,
        bookId: loan.bookId,
        loanId,
      },
    ]);
  };

  const markReturned = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status: "returned", returnedAt: now } : l
      )
    );

    setBooks((prev) =>
      prev.map((b) =>
        b.id === loan.bookId ? { ...b, availabilityStatus: "available" } : b
      )
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        friendId: loan.ownerId,
        sender: "system",
        text: `Book marked as returned.`,
        time: now,
        bookId: loan.bookId,
        loanId,
      },
    ]);
  };

  const getFriendAvailableBooks = (friendId: string) =>
    books.filter(
      (book) =>
        book.ownerId === friendId && book.availabilityStatus === "available"
    );

  const getBorrowedBooks = () => {
    const borrowedLoanBookIds = loans
      .filter(
        (loan) =>
          loan.borrowerId === currentUserId && loan.status === "borrowed"
      )
      .map((loan) => loan.bookId);

    return books.filter((book) => borrowedLoanBookIds.includes(book.id));
  };

  const getLentBooks = () => {
    const lentLoanBookIds = loans
      .filter((loan) => loan.ownerId === currentUserId && loan.status === "borrowed")
      .map((loan) => loan.bookId);

    return books.filter((book) => lentLoanBookIds.includes(book.id));
  };

  const getMessagesForFriend = (friendId: string) =>
    messages.filter((m) => m.friendId === friendId);

  const getLoanById = (loanId?: string) =>
    loans.find((loan) => loan.id === loanId);

  const getBookById = (bookId?: number) =>
    books.find((book) => book.id === bookId);

  const value = useMemo(
    () => ({
      currentUserId,
      books,
      loans,
      messages,
      requestBook,
      approveLoan,
      declineLoan,
      markReturned,
      getFriendAvailableBooks,
      getBorrowedBooks,
      getLentBooks,
      getMessagesForFriend,
      getLoanById,
      getBookById,
    }),
    [books, loans, messages]
  );

  return (
    <LoansContext.Provider value={value}>{children}</LoansContext.Provider>
  );
}

export function useLoans() {
  const context = useContext(LoansContext);
  if (!context) {
    throw new Error("useLoans must be used inside LoansProvider");
  }
  return context;
}