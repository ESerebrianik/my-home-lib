DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT
);

CREATE TABLE books (
  book_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT,
  year INT,
  cover_url TEXT,
  description TEXT,
  collection_type TEXT NOT NULL DEFAULT 'library'
    CHECK (collection_type IN ('library', 'wishlist')),
  availability_status TEXT NOT NULL DEFAULT 'available'
    CHECK (availability_status IN ('available', 'pending', 'lent')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE loans (
  loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL
    CHECK (status IN ('requested', 'approved', 'declined', 'borrowed', 'returned')),
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  returned_at TIMESTAMP
);

CREATE TABLE messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  loan_id UUID REFERENCES loans(loan_id) ON DELETE SET NULL,
  book_id UUID REFERENCES books(book_id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);