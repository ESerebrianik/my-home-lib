import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchMessages, postMessage } from "../api/messages";
import { useUsers } from "./UsersContext";
import type { AppMessage } from "../types/messages";
import { mapApiMessageToMessage } from "../mappers/mapApiMessageToMessage";

type MessagesContextType = {
  messages: AppMessage[];
  getMessagesForFriend: (friendId: string) => AppMessage[];
  refreshMessagesForFriend: (friendId: string) => Promise<void>;
  sendMessage: (params: {
    receiverId: string;
    text: string;
    loanId?: string;
    bookId?: string;
    isSystem?: boolean;
  }) => Promise<void>;
};

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { currentUserId } = useUsers();
  const [messages, setMessages] = useState<AppMessage[]>([]);

  const refreshMessagesForFriend = async (friendId: string) => {
    if (!currentUserId || !friendId) return;

    const data = await fetchMessages(currentUserId, friendId);
    const mapped = data.map(mapApiMessageToMessage);

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
    isSystem = false,
  }: {
    receiverId: string;
    text: string;
    loanId?: string;
    bookId?: string;
    isSystem?: boolean;
  }) => {
    if (!currentUserId || !text.trim()) return;

    const message = await postMessage({
      sender_id: currentUserId,
      receiver_id: receiverId,
      text: text.trim(),
      loan_id: loanId ?? null,
      book_id: bookId ?? null,
      is_system: isSystem,
    });

    const mapped = mapApiMessageToMessage(message);
    setMessages((prev) => [...prev, mapped]);
  };

  const getMessagesForFriend = (friendId: string) =>
    messages.filter(
      (message) =>
        (message.senderId === currentUserId &&
          message.receiverId === friendId) ||
        (message.senderId === friendId && message.receiverId === currentUserId)
    );

  const value = useMemo(
    () => ({
      messages,
      getMessagesForFriend,
      refreshMessagesForFriend,
      sendMessage,
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