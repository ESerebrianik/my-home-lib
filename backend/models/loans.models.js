const db = require("../db/connection");

exports.selectLoans = (user_id) => {
  const values = [];
  let queryStr = `
    SELECT
      loans.*,
      books.title,
      books.author,
      books.genre,
      books.year,
      books.cover_url,
      books.description,
      books.collection_type,
      books.availability_status
    FROM loans
    JOIN books ON loans.book_id = books.book_id
  `;

  if (user_id) {
    queryStr += `
      WHERE loans.owner_id = $1 OR loans.borrower_id = $1
    `;
    values.push(user_id);
  }

  queryStr += `
    ORDER BY loans.requested_at DESC;
  `;

  return db.query(queryStr, values).then(({ rows }) => rows);
};

exports.insertLoan = ({
  book_id,
  owner_id,
  borrower_id,
  status = "requested",
}) => {
  const queryStr = `
    INSERT INTO loans
      (book_id, owner_id, borrower_id, status)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [book_id, owner_id, borrower_id, status];

  return db.query(queryStr, values).then(({ rows }) => rows[0]);
};

exports.updateLoanStatus = (loan_id, status) => {
  let queryStr = "";

  if (status === "borrowed") {
    queryStr = `
      UPDATE loans
      SET status = $2,
          approved_at = NOW()
      WHERE loan_id = $1
      RETURNING *;
    `;
  } else if (status === "returned") {
    queryStr = `
      UPDATE loans
      SET status = $2,
          returned_at = NOW()
      WHERE loan_id = $1
      RETURNING *;
    `;
  } else {
    queryStr = `
      UPDATE loans
      SET status = $2
      WHERE loan_id = $1
      RETURNING *;
    `;
  }

  return db.query(queryStr, [loan_id, status]).then(({ rows }) => rows[0]);
};