export type LoanStatus =
  | "requested"
  | "approved"
  | "declined"
  | "borrowed"
  | "returned";

export type Loan = {
  id: string;
  bookId: string;
  ownerId: string;
  borrowerId: string;
  status: LoanStatus;
  requestedAt: string;
  approvedAt?: string;
  returnedAt?: string;
};