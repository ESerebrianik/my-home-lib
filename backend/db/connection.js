const { Pool } = require("pg");
require("dotenv").config();

const ENV = process.env.NODE_ENV || "development";

const config = {
  connectionString:
    ENV === "production"
      ? process.env.DATABASE_URL
      : process.env.DATABASE_URL,
  ssl:
    ENV === "production"
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: false },
};

module.exports = new Pool(config);