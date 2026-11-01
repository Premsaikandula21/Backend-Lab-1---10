const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const fs = require("fs");

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, "database.db");

// Middleware to parse JSON request bodies
app.use(express.json());

let db = null;

// Initialize database and start server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Check if the book table already exists
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='book'"
    );

    if (!tableExists) {
      // Table doesn't exist yet, run the init SQL script
      const initSQL = fs.readFileSync(
        path.join(__dirname, "initDB.sql"),
        "utf-8"
      );
      await db.exec(initSQL);
      console.log("Database initialized with sample data.");
    } else {
      console.log("Database already initialized.");
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ==================== API ENDPOINTS ====================

// 1. GET /books/ - Retrieve all books
app.get("/books/", async (req, res) => {
  try {
    const getBooksQuery = `SELECT * FROM book ORDER BY id;`;
    const books = await db.all(getBooksQuery);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /books/:bookId/ - Retrieve a specific book by ID
app.get("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /books/ - Insert a new book
app.post("/books/", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    // Validate required fields
    if (!title || !author || price === undefined || pages === undefined) {
      return res.status(400).json({
        error:
          "All fields are required: title, author, price, pages",
      });
    }

    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;
    const result = await db.run(addBookQuery, [title, author, price, pages]);

    res.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT /books/:bookId/ - Update an existing book
app.put("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    // Check if book exists
    const existingBook = await db.get(`SELECT * FROM book WHERE id = ?;`, [
      bookId,
    ]);

    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    const updateBookQuery = `
      UPDATE book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE id = ?;
    `;
    await db.run(updateBookQuery, [
      title || existingBook.title,
      author || existingBook.author,
      price !== undefined ? price : existingBook.price,
      pages !== undefined ? pages : existingBook.pages,
      bookId,
    ]);

    res.json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE /books/:bookId/ - Delete an existing book
app.delete("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if book exists
    const existingBook = await db.get(`SELECT * FROM book WHERE id = ?;`, [
      bookId,
    ]);

    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    await db.run(deleteBookQuery, [bookId]);

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
