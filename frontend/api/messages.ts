import { API_URL } from "./client";

export const fetchMessages = async (user1: string, user2: string) => {
  const res = await fetch(
    `${API_URL}/messages?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch messages: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.messages;
};

export const postMessage = async (payload: {
  sender_id: string;
  receiver_id: string;
  text: string;
  loan_id?: string | null;
  book_id?: string | null;
}) => {
  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to post message: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.message;
};