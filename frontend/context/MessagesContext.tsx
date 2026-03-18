import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMessages, postMessage } from "../api/messages";
import { useUsers } from "./UsersContext";

export type AppMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  time: string;
  loanId?: string;
  bookId?: string;
};

type MessagesContextType = {
  messages: AppMessage[];
  getMessagesForFriend: (friendId: string) => AppMessage[];
  sendMessage: (params: {
    receiverId: string;
    text: string;
    loanId?: string;
    bookId?: string;
  }) => Promise<void>;
  refreshMessagesForFriend: (friendId: string) => Promise<void>;
};

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { currentUserId } = useUsers();
  const [messages, setMessages] = useState<AppMessage[]>([]);

  const mapApiMessage = (message: any): AppMessage => ({
    id: String(message.message_id),
    senderId: String(message.sender_id),
    receiverId: String(message.receiver_id),
    text: message.text,
    time: message.created_at || "",
    loanId: message.loan_id ? String(message.loan_id) : undefined,
    bookId: message.book_id ? String(message.book_id) : undefined,
  });

  const refreshMessagesForFriend = async (friendId: string) => {
    if (!currentUserId || !friendId) return;

    const data = await fetchMessages(currentUserId, friendId);
    const mapped = data.map(mapApiMessage);

    setMessages((prev) => {
      const otherMessages = prev.filter(
        (msg) =>
          !(
            (msg.senderId === currentUserId && msg.receiverId === friendId) ||
            (msg.senderId === friendId && msg.receiverId === currentUserId)
          )
      );

      return [...otherMessages, ...mapped];
    });
  };

  const sendMessage = async ({
    receiverId,
    text,
    loanId,
    bookId,
  }: {
    receiverId: string;
    text: string;
    loanId?: string;
    bookId?: string;
  }) => {
    if (!currentUserId || !text.trim()) return;

    const message = await postMessage({
      sender_id: currentUserId,
      receiver_id: receiverId,
      text: text.trim(),
      loan_id: loanId ?? null,
      book_id: bookId ?? null,
    });

    const mapped = mapApiMessage(message);
    setMessages((prev) => [...prev, mapped]);
  };

  const getMessagesForFriend = (friendId: string) =>
    messages.filter(
      (message) =>
        (message.senderId === currentUserId && message.receiverId === friendId) ||
        (message.senderId === friendId && message.receiverId === currentUserId)
    );

  const value = useMemo(
    () => ({
      messages,
      getMessagesForFriend,
      sendMessage,
      refreshMessagesForFriend,
    }),
    [messages, currentUserId]
  );

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }

  return context;
}