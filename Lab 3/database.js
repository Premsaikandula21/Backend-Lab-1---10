// ============================================================
// database.js — Database Connection and Initialization Module
// ============================================================
// WHY a separate file?
//   In Lab 2, everything was in one file (app.js). As projects grow,
//   it's good practice to separate concerns. This file handles ONLY
//   database logic. The app.js file handles ONLY routes and server.
//   This makes code easier to read, test, and maintain.
// ============================================================

const path = require("path");
const fs = require("fs");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

// Path to the SQLite database file
// __dirname = the folder where this file lives (Lab-3/)
const DB_PATH = path.join(__dirname, "database.db");

// This variable will hold our database connection
let db = null;

/**
 * Opens (or creates) the SQLite database and runs initDB.sql
 * if the 'books' table does not yet exist.
 *
 * WHY check if the table exists first?
 *   - First run:  table doesn't exist → create it + insert sample data
 *   - Later runs: table already exists → skip, so we don't duplicate data
 *
 * @returns {Promise<object>} The database connection object
 */
const initializeDatabase = async () => {
  try {
    // Open (or create) the database file
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    // Check if the 'books' table already exists in the database
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='books'"
    );

    if (!tableExists) {
      // Read the SQL file and execute it to create the table + sample data
      const initSQL = fs.readFileSync(
        path.join(__dirname, "initDB.sql"),
        "utf-8"
      );
      await db.exec(initSQL);
      console.log("✅ Database initialized with 10 sample books.");
    } else {
      console.log("✅ Database already initialized.");
    }

    return db;
  } catch (error) {
    console.error(`❌ Database Error: ${error.message}`);
    process.exit(1); // Stop the app if database fails — no point running without data
  }
};

/**
 * Returns the active database connection.
 *
 * WHY a getter function instead of exporting `db` directly?
 *   Because `db` starts as null and only gets a value AFTER
 *   initializeDatabase() runs. If we exported the variable directly,
 *   other files would get `null`. A function always returns the
 *   current (latest) value.
 *
 * @returns {object} The database connection
 */
const getDb = () => db;

// Export both functions so app.js can use them
module.exports = { initializeDatabase, getDb };

