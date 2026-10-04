const { sql, poolPromise } = require("./db");

async function createTables() {
  try {
    const pool = await poolPromise;

    console.log("Connected to Azure SQL");

    // ==========================================
    // USERS TABLE
    // ==========================================

    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sysobjects
        WHERE name='Users' AND xtype='U'
      )
      BEGIN
        CREATE TABLE Users (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          Name VARCHAR(100) NOT NULL,
          Email VARCHAR(255) NOT NULL UNIQUE,
          PasswordHash VARCHAR(255) NOT NULL,
          CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
        );
      END
    `);

    console.log("Users table created/exists");


    // ==========================================
    // PRODUCTS TABLE
    // ==========================================

    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sysobjects
        WHERE name='Products' AND xtype='U'
      )
      BEGIN
        CREATE TABLE Products (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          Name VARCHAR(255) NOT NULL,
          Description VARCHAR(MAX) NOT NULL,
          Image VARCHAR(500) NULL,
          Pdf VARCHAR(500) NULL,
          CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
        );
      END
    `);

    console.log("Products table created/exists");


    // ==========================================
    // CLOSE CONNECTION
    // ==========================================

    await pool.close();

    console.log("All tables are ready!");

  } catch (error) {
    console.error("Table creation failed:");
    console.error(error.message);
  }
}

createTables();