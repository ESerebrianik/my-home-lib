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