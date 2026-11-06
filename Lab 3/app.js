// ============================================================
// app.js — Express Server with REST API Routes
// ============================================================
// Lab 3: REST API, Query Parameters, Validation, and Debugging
//
// WHAT'S NEW compared to Lab 2:
//   1. Database logic is in a separate module (database.js)
//   2. GET /books supports query parameters (search, sort, filter, pagination)
//   3. Thorough input validation with clear error messages
//   4. Consistent JSON response format for all endpoints
//   5. Listens on 0.0.0.0 so Render (cloud deployment) can access it
// ============================================================

const express = require("express");
const { initializeDatabase, getDb } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: tells Express to parse JSON request bodies
// Without this, req.body would be undefined for POST/PUT requests
app.use(express.json());

// ==================== VALIDATION HELPERS ====================
// WHY helper functions?
//   Instead of repeating the same validation code in every route,
//   we write it once and reuse it. This follows the DRY principle
//   (Don't Repeat Yourself).

/**
 * Validates that the :id parameter is a positive integer.
 * Returns the parsed integer, or null if invalid.
 *
 * WHY validate IDs?
 *   Users might send "/books/abc" or "/books/-5". We need to catch
 *   these before they reach the database.
 */
const validateId = (idParam) => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
};

/**
 * Validates the request body for creating or updating a book.
 * Returns an error message string if invalid, or null if everything is OK.
 *
 * @param {object} body - The request body (req.body)
 * @param {boolean} isUpdate - true for PUT (fields optional), false for POST (fields required)
 */
const validateBookBody = (body, isUpdate = false) => {
  const { title, author, price, pages } = body;

  // For POST: title, author, and price are required
  // For PUT: they are optional, but if provided, must be valid
  if (!isUpdate) {
    if (title === undefined || title === null || String(title).trim() === "") {
      return "Title is required";
    }
    if (
      author === undefined ||
      author === null ||
      String(author).trim() === ""
    ) {
      return "Author is required";
    }
    if (price === undefined || price === null) {
      return "Price is required";
    }
  }

  // If title is provided (POST or PUT), it must not be empty
  if (title !== undefined && title !== null && String(title).trim() === "") {
    return "Title must not be empty";
  }

  // If author is provided, it must not be empty
  if (
    author !== undefined &&
    author !== null &&
    String(author).trim() === ""
  ) {
    return "Author must not be empty";
  }

  // If price is provided, validate it
  if (price !== undefined && price !== null) {
    if (typeof price !== "number" || isNaN(price)) {
      return "Price must be a numeric value";
    }
    if (price < 0) {
      return "Price must not be negative";
    }
  }

  // Pages is optional, but if provided, must be a positive integer
  if (pages !== undefined && pages !== null) {
    if (!Number.isInteger(pages) || pages <= 0) {
      return "Pages must be a positive integer";
    }
  }

  return null; // No errors
};

// ==================== ROUTES ====================

// --------------------------------------------------
// GET / — Welcome route
// --------------------------------------------------
// Shows a welcome message and lists all available endpoints.
// This is helpful for anyone who opens the API URL in a browser.
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Books REST API — Lab 3",
    student: "K. Prem Sai (252U1R9058)",
    endpoints: {
      "GET /": "API welcome and endpoint list",
      "GET /books": "Get all books (supports query parameters)",
      "GET /books/:id": "Get a single book by ID",
      "POST /books": "Create a new book",
      "PUT /books/:id": "Update an existing book",
      "DELETE /books/:id": "Delete a book",
    },
    queryParameters: {
      search_q: "Search book titles (partial match)",
      order_by: "Sort column (id, title, author, price, pages)",
      order: "Sort direction (ASC or DESC)",
      limit: "Maximum number of results (default: 10)",
      offset: "Number of records to skip (default: 0)",
      min_price: "Minimum price filter",
      max_price: "Maximum price filter",
    },
  });
});

// --------------------------------------------------
// GET /books — Retrieve books with query parameters
// --------------------------------------------------
// This is the most complex endpoint. It builds a SQL query
// dynamically based on which query parameters the user sends.
//
// IMPORTANT SECURITY CONCEPTS:
//   1. PARAMETERIZED QUERIES: User values (search text, prices)
//      go into "?" placeholders — the database safely escapes them.
//      This prevents SQL injection attacks.
//
//   2. ALLOWLIST for column names: SQL column/table names CANNOT
//      be parameterized with "?". So we check the column name
//      against an explicit list of allowed values. If someone
//      sends order_by=DROP TABLE, it gets rejected.
app.get("/books", async (req, res) => {
  try {
    const db = getDb();
    const { search_q, order_by, order, limit, offset, min_price, max_price } =
      req.query;

    // ---- Build the query piece by piece ----

    // Start with the base query
    let query = "SELECT * FROM books WHERE 1=1";
    // WHY "WHERE 1=1"?
    //   This is a trick so we can always append " AND ..." conditions.
    //   Without it, the first condition would need "WHERE" and the rest
    //   would need "AND", making the code more complicated.
    //   1=1 is always true, so it doesn't affect results.

    const params = []; // Values for "?" placeholders

    // --- Filter: search by title ---
    if (search_q) {
      query += " AND title LIKE ?";
      params.push(`%${search_q}%`);
      // The % symbols mean "match anything before and after"
      // So "Java" matches "JavaScript" and "Java: The Complete Reference"
    }

    // --- Filter: minimum price ---
    if (min_price !== undefined) {
      const minVal = Number(min_price);
      if (isNaN(minVal)) {
        return res
          .status(400)
          .json({ message: "min_price must be a valid number" });
      }
      query += " AND price >= ?";
      params.push(minVal);
    }

    // --- Filter: maximum price ---
    if (max_price !== undefined) {
      const maxVal = Number(max_price);
      if (isNaN(maxVal)) {
        return res
          .status(400)
          .json({ message: "max_price must be a valid number" });
      }
      query += " AND price <= ?";
      params.push(maxVal);
    }

    // --- Sorting ---
    // ALLOWLIST: only these column names are permitted for sorting
    const allowedColumns = ["id", "title", "author", "price", "pages"];
    let sortColumn = "id"; // default

    if (order_by) {
      if (allowedColumns.includes(order_by.toLowerCase())) {
        sortColumn = order_by.toLowerCase();
      } else {
        return res.status(400).json({
          message: `Invalid order_by column. Allowed: ${allowedColumns.join(", ")}`,
        });
      }
    }

    // Validate sort direction — only ASC or DESC
    let sortDirection = "ASC"; // default
    if (order) {
      const upperOrder = order.toUpperCase();
      if (upperOrder === "ASC" || upperOrder === "DESC") {
        sortDirection = upperOrder;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid order value. Allowed: ASC, DESC" });
      }
    }

    // WHY string concatenation for column name and direction?
    //   SQL does not allow "?" placeholders for column names or keywords
    //   like ASC/DESC. But it's safe here because we already validated
    //   the values against an allowlist above.
    query += ` ORDER BY ${sortColumn} ${sortDirection}`;

    // --- Pagination: LIMIT and OFFSET ---
    let limitVal = 10; // default: return 10 books
    if (limit !== undefined) {
      limitVal = Number(limit);
      if (!Number.isInteger(limitVal) || limitVal <= 0) {
        return res
          .status(400)
          .json({ message: "limit must be a positive integer" });
      }
    }

    let offsetVal = 0; // default: start from the beginning
    if (offset !== undefined) {
      offsetVal = Number(offset);
      if (!Number.isInteger(offsetVal) || offsetVal < 0) {
        return res
          .status(400)
          .json({ message: "offset must be a non-negative integer" });
      }
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limitVal, offsetVal);

    // ---- Execute the query ----
    const books = await db.all(query, params);

    res.status(200).json({ message: "Success", books });
  } catch (error) {
    console.error("GET /books error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------
// GET /books/:id — Retrieve a single book by ID
// --------------------------------------------------
app.get("/books/:id", async (req, res) => {
  try {
    const id = validateId(req.params.id);
    if (id === null) {
      return res
        .status(400)
        .json({ message: "Invalid book ID. Must be a positive integer." });
    }

    const db = getDb();
    const book = await db.get("SELECT * FROM books WHERE id = ?", [id]);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Success", book });
  } catch (error) {
    console.error("GET /books/:id error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------
// POST /books — Create a new book
// --------------------------------------------------
app.post("/books", async (req, res) => {
  try {
    // Validate the request body
    const validationError = validateBookBody(req.body, false);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, author, price, pages } = req.body;
    const db = getDb();

    // pages can be null if not provided (it's optional in the schema)
    const result = await db.run(
      "INSERT INTO books (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title.trim(), author.trim(), price, pages || null]
    );

    // Fetch the newly created book to return it in the response
    const newBook = await db.get("SELECT * FROM books WHERE id = ?", [
      result.lastID,
    ]);

    res.status(201).json({
      message: "Book created successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("POST /books error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------
// PUT /books/:id — Update an existing book
// --------------------------------------------------
app.put("/books/:id", async (req, res) => {
  try {
    // Validate the ID
    const id = validateId(req.params.id);
    if (id === null) {
      return res
        .status(400)
        .json({ message: "Invalid book ID. Must be a positive integer." });
    }

    // Validate the request body (isUpdate = true → fields are optional)
    const validationError = validateBookBody(req.body, true);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const db = getDb();

    // Check if the book exists
    const existingBook = await db.get("SELECT * FROM books WHERE id = ?", [id]);
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    const { title, author, price, pages } = req.body;

    // Use existing values as fallbacks if the user didn't provide new ones
    // This allows partial updates (e.g., only updating the price)
    await db.run(
      `UPDATE books SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?`,
      [
        title !== undefined ? String(title).trim() : existingBook.title,
        author !== undefined ? String(author).trim() : existingBook.author,
        price !== undefined ? price : existingBook.price,
        pages !== undefined ? pages : existingBook.pages,
        id,
      ]
    );

    // Fetch the updated book to return it
    const updatedBook = await db.get("SELECT * FROM books WHERE id = ?", [id]);

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("PUT /books/:id error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------
// DELETE /books/:id — Delete a book
// --------------------------------------------------
app.delete("/books/:id", async (req, res) => {
  try {
    // Validate the ID
    const id = validateId(req.params.id);
    if (id === null) {
      return res
        .status(400)
        .json({ message: "Invalid book ID. Must be a positive integer." });
    }

    const db = getDb();

    // Check if the book exists before deleting
    const existingBook = await db.get("SELECT * FROM books WHERE id = ?", [id]);
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    await db.run("DELETE FROM books WHERE id = ?", [id]);

    res.status(200).json({
      message: "Book deleted successfully",
      book: existingBook,
    });
  } catch (error) {
    console.error("DELETE /books/:id error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== START THE SERVER ====================

const startServer = async () => {
  // Step 1: Initialize the database (creates table + sample data if needed)
  await initializeDatabase();

  // Step 2: Start listening for HTTP requests
  // WHY "0.0.0.0"?
  //   By default, Node listens on "localhost" (127.0.0.1), which means
  //   only YOUR computer can access it. Cloud platforms like Render run
  //   your app inside a container and need to connect from outside.
  //   "0.0.0.0" means "accept connections from any network interface."
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n📚 Books REST API — Lab 3`);
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
    console.log(`📖 API Docs: http://localhost:${PORT}/`);
    console.log(`\n--- Available Endpoints ---`);
    console.log(`GET    /            → Welcome + endpoint list`);
    console.log(`GET    /books       → Get all books (with query params)`);
    console.log(`GET    /books/:id   → Get one book by ID`);
    console.log(`POST   /books       → Create a new book`);
    console.log(`PUT    /books/:id   → Update a book`);
    console.log(`DELETE /books/:id   → Delete a book`);
    console.log(`\n✅ Server is ready!\n`);
  });
};

startServer();

module.exports = app;

