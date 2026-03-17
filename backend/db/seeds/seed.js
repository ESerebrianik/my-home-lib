const db = require("../connection");
const format = require("pg-format");
const createLookup = require("./utils/createLookup");

let userLookup;
let bookLookup;

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
          username VARCHAR UNIQUE,
          name VARCHAR,
          avatar_url TEXT
        );
      `);
    })

    .then(() => {
      return db.query(`
        CREATE TABLE books (
          book_id SERIAL PRIMARY KEY,
          title TEXT,
          author TEXT,
          genre TEXT,
          year INT,
          description TEXT,
          owner_id INT REFERENCES users(user_id),
          collection_type TEXT
        );
      `);
    })

    .then(() => {
      return db.query(`
        CREATE TABLE loans (
          loan_id SERIAL PRIMARY KEY,
          book_id INT REFERENCES books(book_id),
          owner_id INT REFERENCES users(user_id),
          borrower_id INT REFERENCES users(user_id),
          status TEXT
        );
      `);
    })

    .then(() => {
      return db.query(`
        CREATE TABLE messages (
          message_id SERIAL PRIMARY KEY,
          sender_id INT REFERENCES users(user_id),
          receiver_id INT REFERENCES users(user_id),
          text TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })

    .then(() => {
      const formattedUsers = users.map((user) => {
        return [user.username, user.name, user.avatar_url];
      });

      const queryStr = format(
        `INSERT INTO users (username, name, avatar_url) VALUES %L RETURNING *`,
        formattedUsers
      );

      return db.query(queryStr);
    })

    .then((result) => {
      userLookup = createLookup(result.rows, "username", "user_id");

      const formattedBooks = books.map((book) => {
        return [
          book.title,
          book.author,
          book.genre,
          book.year,
          book.description,
          userLookup[book.owner],
          book.collection_type
        ];
      });

      const queryStr = format(
        `INSERT INTO books
        (title, author, genre, year, description, owner_id, collection_type)
        VALUES %L RETURNING *`,
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
          loan.status
        ];
      });

      const queryStr = format(
        `INSERT INTO loans (book_id, owner_id, borrower_id, status)
         VALUES %L`,
        formattedLoans
      );

      return db.query(queryStr);
    })

    .then(() => {
      const formattedMessages = messages.map((msg) => {
        return [
          userLookup[msg.sender],
          userLookup[msg.receiver],
          msg.text
        ];
      });

      const queryStr = format(
        `INSERT INTO messages (sender_id, receiver_id, text)
         VALUES %L`,
        formattedMessages
      );

      return db.query(queryStr);
    });
};

module.exports = seed;