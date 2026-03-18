export type BookStatus = "available" | "pending" | "lent";

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  cover?: string;
  description: string;
  ownerId?: string;
  status?: BookStatus;
};

export type NewBook = Omit<Book, "id" | "ownerId" | "status">;

export type CollectionType = "library" | "wishlist" | "borrowed" | "lent";