import type { AppMessage } from "../types/messages";

export const mapApiMessageToMessage = (message: any): AppMessage => ({
  id: String(message.message_id),
  senderId: String(message.sender_id),
  receiverId: String(message.receiver_id),
  text: message.text,
  time: message.created_at || "",
  loanId: message.loan_id ? String(message.loan_id) : undefined,
  bookId: message.book_id ? String(message.book_id) : undefined,
  isSystem: message.is_system ?? false,
});