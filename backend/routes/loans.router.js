const loansRouter = require("express").Router();
const {
  getLoans,
  postLoan,
  patchLoanStatus,
} = require("../controllers/loans.controllers");

loansRouter.get("/", getLoans);
loansRouter.post("/", postLoan);
loansRouter.patch("/:loan_id", patchLoanStatus);

module.exports = loansRouter;