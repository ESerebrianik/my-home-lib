const db = require("../db/connection");

exports.selectBooksByUserId = (user_id, collection_type = "library") => {
  const queryStr = `
    SELECT *
    FROM books
    WHERE owner_id = $1
      AND collection_type = $2
    ORDER BY book_id;
  `;

  return db.query(queryStr, [user_id, collection_type]).then(({ rows }) => rows);
};

exports.insertBook = ({
  owner_id,
  title,
  author,
  genre,
  year,
  cover_url,
  description,
  collection_type,
}) => {
  const queryStr = `
    INSERT INTO books
      (owner_id, title, author, genre, year, cover_url, description, collection_type)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    owner_id,
    title,
    author,
    genre || null,
    year || null,
    cover_url || null,
    description || null,
    collection_type || "library",
  ];

  return db.query(queryStr, values).then(({ rows }) => rows[0]);
};

exports.deleteBookById = (book_id) => {
  return db
    .query("DELETE FROM books WHERE book_id = $1 RETURNING *;", [book_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Book not found" });
      }
    });
};