import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchLoans, patchLoanStatus, postLoan } from "../api/loans";
import { useUsers } from "./UsersContext";

import type { Book } from "../types/books";
import type { Loan } from "../types/loans";

type LoansContextType = {
  loans: Loan[];
  refreshLoans: () => Promise<void>;
  requestBook: (params: { bookId: string; ownerId: string }) => Promise<void>;
  approveLoan: (loanId: string) => Promise<void>;
  declineLoan: (loanId: string) => Promise<void>;
  markReturned: (loanId: string) => Promise<void>;
  getFriendAvailableBooks: (friendId: string) => Book[];
  getBorrowedBooks: () => Book[];
  getLentBooks: () => Book[];
  getLoanById: (loanId?: string) => Loan | undefined;
  getBookById: (bookId?: string) => Book | undefined;
};

const LoansContext = createContext<LoansContextType | undefined>(undefined);

const mapApiLoanToLoan = (loan: any): Loan => ({
  id: String(loan.loan_id),
  bookId: String(loan.book_id),
  ownerId: String(loan.owner_id),
  borrowerId: String(loan.borrower_id),
  status: loan.status,
  requestedAt: loan.requested_at || "",
  approvedAt: loan.approved_at || undefined,
  returnedAt: loan.returned_at || undefined,
  book: {
    id: String(loan.book_id),
    title: loan.title,
    author: loan.author,
    genre: loan.genre || "Unknown",
    year: Number(loan.year) || new Date().getFullYear(),
    cover: loan.cover_url?.replace("http://", "https://") || "",
    description: loan.description || "",
    ownerId: String(loan.owner_id),
    status: loan.availability_status || "available",
  },
});

export function LoansProvider({ children }: { children: ReactNode }) {
  const { currentUserId } = useUsers();
  const [loans, setLoans] = useState<Loan[]>([]);

  const refreshLoans = async () => {
    if (!currentUserId) {
      setLoans([]);
      return;
    }

    const data = await fetchLoans(currentUserId);
    const mappedLoans: Loan[] = data.map(mapApiLoanToLoan);
    setLoans(mappedLoans);
  };

  useEffect(() => {
    refreshLoans().catch((err) => {
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

    const existingActiveLoan = loans.find(
      (loan) =>
        loan.bookId === bookId &&
        ["requested", "approved", "borrowed"].includes(loan.status)
    );

    if (existingActiveLoan) return;

    try {
      await postLoan({
        book_id: bookId,
        owner_id: ownerId,
        borrower_id: currentUserId,
        status: "requested",
      });

      await refreshLoans();
    } catch (err) {
      console.error("FAILED TO CREATE LOAN:", err);
      throw err;
    }
  };

  const approveLoan = async (loanId: string) => {
    try {
      await patchLoanStatus(loanId, "borrowed");
      await refreshLoans();
    } catch (err) {
      console.error("FAILED TO APPROVE LOAN:", err);
      throw err;
    }
  };

  const declineLoan = async (loanId: string) => {
    try {
      await patchLoanStatus(loanId, "declined");
      await refreshLoans();
    } catch (err) {
      console.error("FAILED TO DECLINE LOAN:", err);
      throw err;
    }
  };

  const markReturned = async (loanId: string) => {
    try {
      await patchLoanStatus(loanId, "returned");
      await refreshLoans();
    } catch (err) {
      console.error("FAILED TO MARK RETURNED:", err);
      throw err;
    }
  };

  // Пока можно вернуть пустой массив, потому что friend library у тебя уже грузится отдельным API на экране друга
  const getFriendAvailableBooks = (_friendId: string) => [];

  const getBorrowedBooks = () =>
    loans
      .filter(
        (loan) =>
          loan.borrowerId === currentUserId && loan.status === "borrowed"
      )
      .map((loan) => loan.book)
      .filter(Boolean) as Book[];

  const getLentBooks = () =>
    loans
      .filter(
        (loan) => loan.ownerId === currentUserId && loan.status === "borrowed"
      )
      .map((loan) => loan.book)
      .filter(Boolean) as Book[];

  const getLoanById = (loanId?: string) =>
    loans.find((loan) => loan.id === loanId);

  const getBookById = (bookId?: string) =>
    loans.find((loan) => loan.bookId === bookId)?.book;

  const value = useMemo(
    () => ({
      loans,
      refreshLoans,
      requestBook,
      approveLoan,
      declineLoan,
      markReturned,
      getFriendAvailableBooks,
      getBorrowedBooks,
      getLentBooks,
      getLoanById,
      getBookById,
    }),
    [loans, currentUserId]
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