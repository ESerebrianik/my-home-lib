export type ChatMessageSender = "me" | "friend" | "system";

export type ChatMessage = {
  id: string;
  friendId: string;
  sender: ChatMessageSender;
  text: string;
  time: string;
  bookId?: string;
  loanId?: string;
};

export type AppMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  time: string;
  loanId?: string;
  bookId?: string;
  isSystem?: boolean;
};