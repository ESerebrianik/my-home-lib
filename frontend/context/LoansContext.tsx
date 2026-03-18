import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUsers } from "./UsersContext";
import { useBooks } from "./BooksContext";
import type { Book } from "../types/books";
import type { Loan } from "../types/loans";
import type { ChatMessage } from "../types/messages";
import { fetchLoans, patchLoanStatus, postLoan } from "../api/loans";

type LoansContextType = {
  loans: Loan[];
  messages: ChatMessage[];
  requestBook: (params: { bookId: string; ownerId: string }) => Promise<void>;
  approveLoan: (loanId: string) => Promise<void>;
  declineLoan: (loanId: string) => Promise<void>;
  markReturned: (loanId: string) => Promise<void>;
  getFriendAvailableBooks: (friendId: string) => Book[];
  getBorrowedBooks: () => Book[];
  getLentBooks: () => Book[];
  getMessagesForFriend: (friendId: string) => ChatMessage[];
  getLoanById: (loanId?: string) => Loan | undefined;
  getBookById: (bookId?: string) => Book | undefined;
};

const LoansContext = createContext<LoansContextType | undefined>(undefined);

export function LoansProvider({ children }: { children: React.ReactNode }) {
  const { currentUserId } = useUsers();
  const { books } = useBooks();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const getNow = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    if (!currentUserId) return;

    fetchLoans(currentUserId)
      .then((data) => {
        const mappedLoans: Loan[] = data.map((loan: any) => ({
          id: String(loan.loan_id),
          bookId: String(loan.book_id),
          ownerId: String(loan.owner_id),
          borrowerId: String(loan.borrower_id),
          status: loan.status,
          requestedAt: loan.requested_at || "",
          approvedAt: loan.approved_at || undefined,
          returnedAt: loan.returned_at || undefined,
        }));

        setLoans(mappedLoans);
      })
      .catch((err) => {
        console.error("FAILED TO FETCH LOANS:", err);
      });
  }, [currentUserId]);

  const requestBook = async ({
    bookId,
    ownerId,
  }: {
    bookId: string;
    ownerId: string;
  }) => {
    if (!currentUserId) return;

    const now = getNow();

    try {
      const loan = await postLoan({
        book_id: bookId,
        owner_id: ownerId,
        borrower_id: currentUserId,
        status: "requested",
      });

      const mappedLoan: Loan = {
        id: String(loan.loan_id),
        bookId: String(loan.book_id),
        ownerId: String(loan.owner_id),
        borrowerId: String(loan.borrower_id),
        status: loan.status,
        requestedAt: loan.requested_at || now,
        approvedAt: loan.approved_at || undefined,
        returnedAt: loan.returned_at || undefined,
      };

      setLoans((prev) => [mappedLoan, ...prev]);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          friendId: ownerId,
          sender: "me",
          text: "Hi, can I borrow this book from you?",
          time: now,
          bookId,
          loanId: mappedLoan.id,
        },
      ]);
    } catch (err) {
      console.error("FAILED TO CREATE LOAN:", err);
      throw err;
    }
  };

  const approveLoan = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = getNow();

    try {
      await patchLoanStatus(loanId, "borrowed");

      setLoans((prev) =>
        prev.map((l) =>
          l.id === loanId ? { ...l, status: "borrowed", approvedAt: now } : l
        )
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          friendId: loan.borrowerId,
          sender: "system",
          text: "Borrow request approved.",
          time: now,
          bookId: loan.bookId,
          loanId,
        },
      ]);
    } catch (err) {
      console.error("FAILED TO APPROVE LOAN:", err);
      throw err;
    }
  };

  const declineLoan = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = getNow();

    try {
      await patchLoanStatus(loanId, "declined");

      setLoans((prev) =>
        prev.map((l) => (l.id === loanId ? { ...l, status: "declined" } : l))
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          friendId: loan.borrowerId,
          sender: "system",
          text: "Borrow request declined.",
          time: now,
          bookId: loan.bookId,
          loanId,
        },
      ]);
    } catch (err) {
      console.error("FAILED TO DECLINE LOAN:", err);
      throw err;
    }
  };

  const markReturned = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = getNow();

    try {
      await patchLoanStatus(loanId, "returned");

      setLoans((prev) =>
        prev.map((l) =>
          l.id === loanId ? { ...l, status: "returned", returnedAt: now } : l
        )
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          friendId:
            currentUserId === loan.ownerId ? loan.borrowerId : loan.ownerId,
          sender: "system",
          text: "Book marked as returned.",
          time: now,
          bookId: loan.bookId,
          loanId,
        },
      ]);
    } catch (err) {
      console.error("FAILED TO RETURN LOAN:", err);
      throw err;
    }
  };

  const getFriendAvailableBooks = (friendId: string) =>
    books.filter(
      (book) => book.ownerId === friendId && book.status === "available"
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
      .filter(
        (loan) => loan.ownerId === currentUserId && loan.status === "borrowed"
      )
      .map((loan) => loan.bookId);

    return books.filter((book) => lentLoanBookIds.includes(book.id));
  };

  const getMessagesForFriend = (friendId: string) =>
    messages.filter((m) => m.friendId === friendId);

  const getLoanById = (loanId?: string) =>
    loans.find((loan) => loan.id === loanId);

  const getBookById = (bookId?: string) =>
    books.find((book) => book.id === bookId);

  const value = useMemo(
    () => ({
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
    [books, loans, messages, currentUserId]
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