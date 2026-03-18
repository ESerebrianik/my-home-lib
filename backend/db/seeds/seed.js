const db = require("../connection");
const format = require("pg-format");
const createLookup = require("./utils/createLookup");

let userLookup;
let bookLookup;
let loanLookup;

const seed = ({ users, books, loans, messages }) => {
  return db
    .query(`
      DROP TABLE IF EXISTS messages;
      DROP TABLE IF EXISTS loans;
      DROP TABLE IF EXISTS books;
      DROP TABLE IF EXISTS users;
    `)

    .then(() => {
      return db.query(`
        CREATE TABLE users (
          user_id SERIAL PRIMARY KEY,
          username VARCHAR UNIQUE NOT NULL,
          name TEXT NOT NULL,
          avatar_url TEXT
        );
      `);
    })

    .then(() => {
      return db.query(`
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
      `);
    })

    .then(() => {
      return db.query(`
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
      `);
    })

    .then(() => {
      return db.query(`
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
      `);
    })

    .then(() => {
      const formattedUsers = users.map((user) => {
        return [user.username, user.name, user.avatar_url];
      });

      const queryStr = format(
        `INSERT INTO users (username, name, avatar_url)
         VALUES %L
         RETURNING *;`,
        formattedUsers
      );

      return db.query(queryStr);
    })

    .then((result) => {
      userLookup = createLookup(result.rows, "username", "user_id");

      const formattedBooks = books.map((book) => {
        return [
          userLookup[book.owner],
          book.title,
          book.author,
          book.genre || null,
          book.year || null,
          book.cover_url || null,
          book.description || null,
          book.collection_type || "library",
          book.availability_status || "available",
          book.created_at || null,
        ];
      });

      const queryStr = format(
        `INSERT INTO books
          (
            owner_id,
            title,
            author,
            genre,
            year,
            cover_url,
            description,
            collection_type,
            availability_status,
            created_at
          )
         VALUES %L
         RETURNING *;`,
        formattedBooks
      );

      return db.query(queryStr);
    })

    .then((result) => {
      bookLookup = createLookup(result.rows, "title", "book_id");

      const formattedLoans = loans.map((loan) => {
        return [
          bookLookup[loan.book_title],
          userLookup[loan.owner],
          userLookup[loan.borrower],
          loan.status,
          loan.requested_at || null,
          loan.approved_at || null,
          loan.returned_at || null,
        ];
      });

      const queryStr = format(
        `INSERT INTO loans
          (
            book_id,
            owner_id,
            borrower_id,
            status,
            requested_at,
            approved_at,
            returned_at
          )
         VALUES %L
         RETURNING *;`,
        formattedLoans
      );

      return db.query(queryStr);
    })

    .then((result) => {
      loanLookup = createLookup(result.rows, "book_id", "loan_id");

      const formattedMessages = messages.map((msg) => {
        const relatedBookId = msg.book_title ? bookLookup[msg.book_title] : null;
        const relatedLoanId =
          msg.book_title && relatedBookId ? loanLookup[relatedBookId] : null;

        return [
          userLookup[msg.sender],
          userLookup[msg.receiver],
          msg.text,
          msg.loan_id || relatedLoanId || null,
          msg.book_id || relatedBookId || null,
          msg.is_system || false,
          msg.created_at || null,
        ];
      });

      const queryStr = format(
        `INSERT INTO messages
          (
            sender_id,
            receiver_id,
            text,
            loan_id,
            book_id,
            is_system,
            created_at
          )
         VALUES %L;`,
        formattedMessages
      );

      return db.query(queryStr);
    });
};

module.exports = seed;