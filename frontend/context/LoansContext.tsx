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
import { useBooks } from "./BooksContext";

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

/**
 * mapper из ответа API в frontend Loan
 */
const mapApiLoanToLoan = (loan: any): Loan => ({
  id: String(loan.loan_id),
  bookId: String(loan.book_id),
  ownerId: String(loan.owner_id),
  borrowerId: String(loan.borrower_id),
  status: loan.status,
  requestedAt: loan.requested_at || "",
  approvedAt: loan.approved_at || undefined,
  returnedAt: loan.returned_at || undefined,
});

export function LoansProvider({ children }: { children: ReactNode }) {
  const { currentUserId } = useUsers();
  const { books } = useBooks();

  const [loans, setLoans] = useState<Loan[]>([]);

  /**
   * Загружаем все займы текущего пользователя с backend.
   * Это главный источник правды для borrowed/lent/requested.
   */
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

  /**
   * Создать запрос на займ книги.
   * После создания не пытаемся руками долго синхронизировать state,
   * а просто заново подтягиваем loans с backend.
   */
  const requestBook = async ({
    bookId,
    ownerId,
  }: {
    bookId: string;
    ownerId: string;
  }) => {
    if (!currentUserId) return;

    // Не даём создать дубликат активного займа по той же книге
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

  /**
   * Одобрить займ.
   * После PATCH сразу обновляем loans из backend,
   * чтобы полки borrowed/lent считались уже из актуальных данных.
   */
  const approveLoan = async (loanId: string) => {
    try {
      await patchLoanStatus(loanId, "borrowed");
      await refreshLoans();
    } catch (err) {
      console.error("FAILED TO APPROVE LOAN:", err);
      throw err;
    }
  };

  /**
   * Отклонить займ.
   */
  const declineLoan = async (loanId: string) => {
    try {
      await patchLoanStatus(loanId, "declined");
      await refreshLoans();
    } catch (err) {
      console.error("FAILED TO DECLINE LOAN:", err);
      throw err;
    }
  };

  /**
   * Отметить книгу как возвращённую.
   */
  const markReturned = async (loanId: string) => {
    try {
      await patchLoanStatus(loanId, "returned");
      await refreshLoans();
    } catch (err) {
      console.error("FAILED TO MARK RETURNED:", err);
      throw err;
    }
  };

  /**
   * Книги друга для friend library:
   * только его книги и только доступные.
   *
   * Важно:
   * это работает корректно только если в BooksContext реально есть книги нужного пользователя.
   * Для экрана friend/[id] у тебя уже отдельная загрузка с backend — это ок.
   */
  const getFriendAvailableBooks = (friendId: string) =>
    books.filter(
      (book) => book.ownerId === friendId && book.status === "available"
    );

  /**
   * Мои одолженные книги:
   * те книги, где я borrower и статус займа borrowed.
   */
  const getBorrowedBooks = () => {
    const borrowedBookIds = loans
      .filter(
        (loan) =>
          loan.borrowerId === currentUserId && loan.status === "borrowed"
      )
      .map((loan) => loan.bookId);

    return books.filter((book) => borrowedBookIds.includes(book.id));
  };

  /**
   * Книги, которые я отдал другим:
   * owner === currentUserId и статус займа borrowed.
   */
  const getLentBooks = () => {
    const lentBookIds = loans
      .filter(
        (loan) => loan.ownerId === currentUserId && loan.status === "borrowed"
      )
      .map((loan) => loan.bookId);

    return books.filter((book) => lentBookIds.includes(book.id));
  };

  const getLoanById = (loanId?: string) =>
    loans.find((loan) => loan.id === loanId);

  const getBookById = (bookId?: string) =>
    books.find((book) => book.id === bookId);

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
    [loans, books, currentUserId]
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