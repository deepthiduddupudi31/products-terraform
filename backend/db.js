const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Connected to Azure SQL Database");
    return pool;
  })
  .catch((error) => {
    console.error("Azure SQL connection failed:", error.message);
    throw error;
  });

module.exports = { sql, poolPromise };