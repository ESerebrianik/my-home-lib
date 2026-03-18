DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT
);

CREATE TABLE books (
  book_id SERIAL PRIMARY KEY,
  owner_id INT REFERENCES users(user_id) ON DELETE CASCADE,
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
  loan_id SERIAL PRIMARY KEY,
  book_id INT REFERENCES books(book_id) ON DELETE CASCADE,
  owner_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  borrower_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL
    CHECK (status IN ('requested', 'approved', 'declined', 'borrowed', 'returned')),
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  returned_at TIMESTAMP
);

CREATE TABLE messages (
  message_id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  loan_id INT REFERENCES loans(loan_id) ON DELETE SET NULL,
  book_id INT REFERENCES books(book_id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);