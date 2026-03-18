import { API_URL } from "./client";

export const fetchLoans = async (userId: string) => {
  console.log("FETCH LOANS FOR USER:", userId);
  const res = await fetch(`${API_URL}/loans?user_id=${encodeURIComponent(userId)}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch loans: ${res.status}`);
  }

  const data = await res.json();
  return data.loans;
};

export const postLoan = async (payload: {
  book_id: string;
  owner_id: string;
  borrower_id: string;
  status?: "requested" | "approved" | "declined" | "borrowed" | "returned";
}) => {
  const res = await fetch(`${API_URL}/loans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create loan: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.loan;
};

export const patchLoanStatus = async (
  loanId: string,
  status: "requested" | "approved" | "declined" | "borrowed" | "returned"
) => {
  const res = await fetch(`${API_URL}/loans/${loanId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update loan: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.loan;
};