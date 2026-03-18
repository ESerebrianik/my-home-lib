const db = require("../db/connection");

exports.selectMessagesBetweenUsers = (user1, user2) => {
  const queryStr = `
    SELECT *
    FROM messages
    WHERE
      (sender_id = $1 AND receiver_id = $2)
      OR
      (sender_id = $2 AND receiver_id = $1)
    ORDER BY created_at ASC;
  `;

  return db.query(queryStr, [user1, user2]).then(({ rows }) => rows);
};

exports.insertMessage = ({
  sender_id,
  receiver_id,
  text,
  loan_id = null,
  book_id = null,
  is_system = false,
}) => {
  const queryStr = `
    INSERT INTO messages
      (sender_id, receiver_id, text, loan_id, book_id, is_system)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    sender_id,
    receiver_id,
    text,
    loan_id,
    book_id,
    is_system,
  ];

  return db.query(queryStr, values).then(({ rows }) => rows[0]);
};