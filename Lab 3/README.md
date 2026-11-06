# Lab 3: REST API, Query Parameters, Validation, and Debugging

**Live URL:** _Pending deployment_

---

## 📋 Student Information

| Field | Details |
|---|---|
| **Student Name** | K. Prem Sai |
| **Registration Number** | 252U1R9058 |
| **Branch** | CSE – Gen AI |
| **Academic Year** | Year II, Term II |
| **Course** | Backend Development Fundamentals |
| **Faculty** | Joel Prashanth D |
| **Institution** | Aurora |
| **Lab Number** | 03 |
Live link: 

---

## 📖 Project Overview

This lab builds a **RESTful API** for managing a books collection using **Node.js**, **Express.js**, and **SQLite**. It extends the CRUD operations from Lab 2 with advanced features:

- **Query Parameters** — Search, sort, filter, and paginate results
- **Input Validation** — Validate all user input with clear error messages
- **Consistent JSON Responses** — Every endpoint returns a uniform response format
- **Parameterized SQL Queries** — Protect against SQL injection attacks
- **Debugging Skills** — Identify and fix common Node.js backend errors

---

## 🎯 Objectives

1. Build a complete REST API with all five HTTP methods (GET, POST, PUT, DELETE).
2. Implement query parameters for searching, sorting, filtering, and pagination.
3. Validate all incoming user data and return appropriate error messages.
4. Use parameterized SQL queries to prevent SQL injection.
5. Understand and fix common backend debugging scenarios.
6. Prepare the application for cloud deployment on Render.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for server-side code |
| **Express.js** | Web framework for building REST APIs |
| **SQLite** | Lightweight file-based relational database |
| **sqlite3** | Native SQLite driver for Node.js |
| **sqlite** | Promise-based wrapper around sqlite3 (enables async/await) |
| **Postman** | API testing and documentation tool |
| **Nodemon** | Auto-restarts server during development (dev dependency) |

---

## 📁 Folder Structure

```
Lab-3/
├── screenshots/                # Postman test screenshots (see Screenshots section)
├── app.js                      # Express server and all REST API routes
├── database.js                 # Database connection and initialization module
├── initDB.sql                  # SQL schema and 10 sample book records
├── package.json                # Project metadata and dependencies
├── package-lock.json           # Dependency lock file
├── .gitignore                  # Files excluded from Git
└── README.md                   # This documentation file
```

---

## 🗃️ Database Schema

### Table: `books`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique book identifier |
| `title` | TEXT | NOT NULL | Book title |
| `author` | TEXT | NOT NULL | Author name |
| `price` | REAL | NOT NULL | Book price (in ₹) |
| `pages` | INTEGER | _(optional)_ | Number of pages |

### Sample Data (10 Books)

| ID | Title | Author | Price | Pages |
|---|---|---|---|---|
| 1 | JavaScript: The Good Parts | Douglas Crockford | 350 | 176 |
| 2 | Python Crash Course | Eric Matthes | 480 | 544 |
| 3 | Java: The Complete Reference | Herbert Schildt | 650 | 1248 |
| 4 | Learning Python | Mark Lutz | 720 | 1648 |
| 5 | Eloquent JavaScript | Marijn Haverbeke | 400 | 472 |
| 6 | Clean Code | Robert C. Martin | 550 | 464 |
| 7 | The Pragmatic Programmer | Andrew Hunt | 500 | 352 |
| 8 | Introduction to Algorithms | Thomas H. Cormen | 850 | 1312 |
| 9 | Design Patterns | Erich Gamma | 600 | 416 |
| 10 | Node.js Design Patterns | Mario Casciaro | 580 | 640 |

---

## ⚙️ Installation Instructions

### Prerequisites

- **Node.js** (v18 or higher): [Download here](https://nodejs.org/)
- **Postman**: [Download here](https://www.postman.com/downloads/)

### Steps

1. **Clone the repository** (if not already cloned):

   ```bash
   git clone https://github.com/YOUR_USERNAME/backend-development-fundamentals-labs-2.git
   cd backend-development-fundamentals-labs-2
   ```

2. **Navigate to Lab 3**:

   ```bash
   cd Lab-3
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

   This installs Express, sqlite3, sqlite, and nodemon.

### How the Database Initializes

The database initializes **automatically** when you start the server:

- On **first run**: Creates `database.db`, creates the `books` table, and inserts 10 sample books.
- On **subsequent runs**: Detects the table already exists and skips initialization.

You do **not** need to manually create the database or run SQL scripts.

### How to Start the Server

**Production mode:**

```bash
npm start
```

**Development mode** (auto-restarts on file changes):

```bash
npm run dev
```

You should see:

```
✅ Database initialized with 10 sample books.

📚 Books REST API — Lab 3
🚀 Server running at http://localhost:3000/
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port number for the server | `3000` |

To use a custom port:

```bash
PORT=5000 npm start
```

On Render, the `PORT` variable is set automatically — no configuration needed.

---

## 📡 API Endpoints

### Endpoint Summary

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| GET | `/` | Welcome message + endpoint list | 200 |
| GET | `/books` | Get all books (with query parameters) | 200, 400, 500 |
| GET | `/books/:id` | Get a single book by ID | 200, 400, 404, 500 |
| POST | `/books` | Create a new book | 201, 400, 500 |
| PUT | `/books/:id` | Update an existing book | 200, 400, 404, 500 |
| DELETE | `/books/:id` | Delete a book | 200, 400, 404, 500 |

### HTTP Status Codes Used

| Code | Meaning | When Used |
|---|---|---|
| `200` | OK | Successful GET, PUT, DELETE operations |
| `201` | Created | Successful POST (new book created) |
| `400` | Bad Request | Invalid input, validation errors |
| `404` | Not Found | Book with given ID does not exist |
| `500` | Internal Server Error | Unexpected server/database error |

---

### 1. GET `/` — Welcome Route

Returns a welcome message and lists all available endpoints.

**Request:**

```
GET http://localhost:3000/
```

**Response (200):**

```json
{
  "message": "Welcome to the Books REST API — Lab 3",
  "student": "K. Prem Sai (252U1R9058)",
  "endpoints": {
    "GET /": "API welcome and endpoint list",
    "GET /books": "Get all books (supports query parameters)",
    "GET /books/:id": "Get a single book by ID",
    "POST /books": "Create a new book",
    "PUT /books/:id": "Update an existing book",
    "DELETE /books/:id": "Delete a book"
  }
}
```

---

### 2. GET `/books` — Get All Books

Returns all books. Supports query parameters for searching, sorting, filtering, and pagination.

#### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `search_q` | string | _(none)_ | Search book titles using partial match (SQL LIKE) |
| `order_by` | string | `id` | Sort by column: `id`, `title`, `author`, `price`, or `pages` |
| `order` | string | `ASC` | Sort direction: `ASC` (ascending) or `DESC` (descending) |
| `limit` | integer | `10` | Maximum number of records to return (must be positive) |
| `offset` | integer | `0` | Number of records to skip (must be non-negative) |
| `min_price` | number | _(none)_ | Minimum price filter |
| `max_price` | number | _(none)_ | Maximum price filter |

#### Example Request URLs

```
GET /books
GET /books?search_q=Java
GET /books?order_by=price&order=DESC
GET /books?limit=5&offset=0
GET /books?min_price=200&max_price=500
GET /books?search_q=Python&order_by=price&order=ASC&min_price=100&max_price=1000
```

#### Example: Get All Books

**Request:**

```
GET http://localhost:3000/books
```

**Response (200):**

```json
{
  "message": "Success",
  "books": [
    {
      "id": 1,
      "title": "JavaScript: The Good Parts",
      "author": "Douglas Crockford",
      "price": 350,
      "pages": 176
    },
    {
      "id": 2,
      "title": "Python Crash Course",
      "author": "Eric Matthes",
      "price": 480,
      "pages": 544
    }
  ]
}
```

#### Example: Search Books

**Request:**

```
GET http://localhost:3000/books?search_q=Java
```

**Response (200):** Returns books whose titles contain "Java" (e.g., "JavaScript: The Good Parts", "Java: The Complete Reference", "Eloquent JavaScript").

#### Example: Combined Filters

**Request:**

```
GET http://localhost:3000/books?search_q=Python&order_by=price&order=ASC&min_price=100&max_price=1000
```

**Response (200):** Returns Python-related books priced between ₹100–₹1000, sorted by price ascending.

#### Validation Errors (400)

```json
{ "message": "Invalid order_by column. Allowed: id, title, author, price, pages" }
{ "message": "Invalid order value. Allowed: ASC, DESC" }
{ "message": "limit must be a positive integer" }
{ "message": "offset must be a non-negative integer" }
{ "message": "min_price must be a valid number" }
```

---

### 3. GET `/books/:id` — Get Book by ID

Returns a single book by its ID.

**Request:**

```
GET http://localhost:3000/books/1
```

**Response (200):**

```json
{
  "message": "Success",
  "book": {
    "id": 1,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 350,
    "pages": 176
  }
}
```

**Error — Book Not Found (404):**

```
GET http://localhost:3000/books/999
```

```json
{
  "message": "Book not found"
}
```

**Error — Invalid ID (400):**

```
GET http://localhost:3000/books/abc
```

```json
{
  "message": "Invalid book ID. Must be a positive integer."
}
```

---

### 4. POST `/books` — Create a New Book

Creates a new book record.

**Request:**

```
POST http://localhost:3000/books
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "JavaScript Basics",
  "author": "John Smith",
  "price": 399,
  "pages": 250
}
```

**Response (201 Created):**

```json
{
  "message": "Book created successfully",
  "book": {
    "id": 11,
    "title": "JavaScript Basics",
    "author": "John Smith",
    "price": 399,
    "pages": 250
  }
}
```

#### Validation Rules

| Field | Rule |
|---|---|
| `title` | Required, must not be empty |
| `author` | Required, must not be empty |
| `price` | Required, must be numeric, must not be negative |
| `pages` | Optional, but if provided must be a positive integer |

**Error — Missing Title (400):**

```json
{ "message": "Title is required" }
```

**Error — Negative Price (400):**

```json
{ "message": "Price must not be negative" }
```

**Error — Invalid Pages (400):**

```json
{ "message": "Pages must be a positive integer" }
```

---

### 5. PUT `/books/:id` — Update a Book

Updates an existing book. Supports partial updates (only send the fields you want to change).

**Request:**

```
PUT http://localhost:3000/books/1
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "JavaScript: The Definitive Guide",
  "price": 450
}
```

**Response (200):**

```json
{
  "message": "Book updated successfully",
  "book": {
    "id": 1,
    "title": "JavaScript: The Definitive Guide",
    "author": "Douglas Crockford",
    "price": 450,
    "pages": 176
  }
}
```

**Error — Not Found (404):**

```json
{ "message": "Book not found" }
```

---

### 6. DELETE `/books/:id` — Delete a Book

Deletes a book by its ID.

**Request:**

```
DELETE http://localhost:3000/books/11
```

**Response (200):**

```json
{
  "message": "Book deleted successfully",
  "book": {
    "id": 11,
    "title": "JavaScript Basics",
    "author": "John Smith",
    "price": 399,
    "pages": 250
  }
}
```

**Error — Not Found (404):**

```json
{ "message": "Book not found" }
```

---

## 🧪 Postman Testing Guide

### Setup

1. Open **Postman**.
2. Create a new **Collection** named `Lab 3 - Books API`.
3. Set the **Base URL** to `http://localhost:3000`.
4. Make sure the server is running (`npm start`).

### Test Cases

#### GET Tests

| # | Test Name | Method | URL | Expected Status | Expected Result |
|---|---|---|---|---|---|
| 1 | Get all books | GET | `/books` | 200 | Returns all 10 books |
| 2 | Search by partial title | GET | `/books?search_q=Java` | 200 | Returns books with "Java" in title (3 results) |
| 3 | Sort by price ascending | GET | `/books?order_by=price&order=ASC` | 200 | Books sorted cheapest first |
| 4 | Sort by price descending | GET | `/books?order_by=price&order=DESC` | 200 | Books sorted most expensive first |
| 5 | Limit and offset | GET | `/books?limit=3&offset=2` | 200 | Returns 3 books, skipping the first 2 |
| 6 | Price filter (min and max) | GET | `/books?min_price=400&max_price=600` | 200 | Returns books priced between ₹400–₹600 |
| 7 | Combined filters | GET | `/books?search_q=Python&order_by=price&order=ASC&min_price=100&max_price=1000` | 200 | Python books, sorted by price, within price range |
| 8 | Get one book by valid ID | GET | `/books/1` | 200 | Returns book with id=1 |
| 9 | Get nonexistent book | GET | `/books/999` | 404 | `"Book not found"` |
| 10 | Invalid query parameter | GET | `/books?order_by=invalid` | 400 | `"Invalid order_by column..."` |

#### POST Tests

| # | Test Name | Method | URL | Body | Expected Status | Expected Result |
|---|---|---|---|---|---|---|
| 11 | Create a valid book | POST | `/books` | `{"title":"JavaScript Basics","author":"John Smith","price":399,"pages":250}` | 201 | Book created with new ID |
| 12 | Missing title | POST | `/books` | `{"author":"Test","price":100}` | 400 | `"Title is required"` |
| 13 | Missing author | POST | `/books` | `{"title":"Test","price":100}` | 400 | `"Author is required"` |
| 14 | Missing price | POST | `/books` | `{"title":"Test","author":"Test"}` | 400 | `"Price is required"` |
| 15 | Non-numeric price | POST | `/books` | `{"title":"Test","author":"Test","price":"abc"}` | 400 | `"Price must be a numeric value"` |
| 16 | Negative price | POST | `/books` | `{"title":"Test","author":"Test","price":-50}` | 400 | `"Price must not be negative"` |
| 17 | Invalid pages | POST | `/books` | `{"title":"Test","author":"Test","price":100,"pages":-10}` | 400 | `"Pages must be a positive integer"` |

#### PUT Tests

| # | Test Name | Method | URL | Body | Expected Status | Expected Result |
|---|---|---|---|---|---|---|
| 18 | Update existing book | PUT | `/books/1` | `{"title":"Updated Title","price":499}` | 200 | Book updated successfully |
| 19 | Update nonexistent book | PUT | `/books/999` | `{"title":"Ghost Book"}` | 404 | `"Book not found"` |
| 20 | Invalid ID | PUT | `/books/abc` | `{"title":"Test"}` | 400 | `"Invalid book ID..."` |
| 21 | Invalid request body | PUT | `/books/1` | `{"price":-100}` | 400 | `"Price must not be negative"` |

#### DELETE Tests

| # | Test Name | Method | URL | Expected Status | Expected Result |
|---|---|---|---|---|---|
| 22 | Delete existing book | DELETE | `/books/11` | 200 | Book deleted successfully |
| 23 | Delete nonexistent book | DELETE | `/books/999` | 404 | `"Book not found"` |
| 24 | Invalid ID | DELETE | `/books/abc` | 400 | `"Invalid book ID..."` |

### How to Send a POST/PUT Request in Postman

1. Select the HTTP method (**POST** or **PUT**).
2. Enter the URL (e.g., `http://localhost:3000/books`).
3. Go to the **Body** tab.
4. Select **raw** and choose **JSON** from the dropdown.
5. Paste the JSON request body.
6. Click **Send**.

---

## 🐛 Debugging Exercise

This section covers four common Node.js backend errors, their causes, and how to fix them.

### 1. EADDRINUSE — Port Already in Use

**Error Message:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** Another process (possibly a previously crashed server) is already using port 3000. Only one application can listen on a port at a time.

**How to Fix:**

- **Option A** — Find and kill the process using the port:

  ```bash
  # On Windows (find the process)
  netstat -ano | findstr :3000

  # Kill it using the PID shown
  taskkill /PID <PID_NUMBER> /F
  ```

  ```bash
  # On Linux/macOS
  lsof -i :3000
  kill -9 <PID_NUMBER>
  ```

- **Option B** — Use a different port:

  ```bash
  PORT=4000 npm start
  ```

---

### 2. Wrong Import Path — Module Not Found

**Error Message:**

```
Error: Cannot find module './datbase'
```

**Cause:** The `require()` path has a typo or the file doesn't exist. In this example, `database` is misspelled as `datbase`.

**How to Fix:**

1. Check the exact filename on disk (is it `database.js`?).
2. Fix the require statement:

   ```javascript
   // ❌ Wrong (typo in filename)
   const { getDb } = require("./datbase");

   // ✅ Correct
   const { getDb } = require("./database");
   ```

3. Remember that `require()` paths are **case-sensitive** on Linux but not on Windows. Always match the exact case to avoid deployment issues.

---

### 3. SQLite Table-Name Typo — No Such Table

**Error Message:**

```
SQLITE_ERROR: no such table: book
```

**Cause:** The SQL query references a table named `book`, but the actual table is named `books` (plural). SQLite table names must match exactly.

**How to Fix:**

1. Check what tables exist in your database:

   ```sql
   SELECT name FROM sqlite_master WHERE type='table';
   ```

2. Fix the table name in your SQL query:

   ```javascript
   // ❌ Wrong (table is 'books', not 'book')
   const query = "SELECT * FROM book";

   // ✅ Correct
   const query = "SELECT * FROM books";
   ```

3. Make sure `initDB.sql` and your route queries use the **same table name**.

---

### 4. Missing await — Asynchronous Operation Not Completed

**Error Message:**

```
TypeError: Cannot read properties of undefined (reading 'id')
```

Or the variable is a `Promise` object instead of the actual data.

**Cause:** Forgetting `await` before an async database call. Without `await`, the code moves to the next line before the database has returned the result.

**How to Fix:**

```javascript
// ❌ Wrong (missing await — 'book' will be a Promise, not the data)
const book = db.get("SELECT * FROM books WHERE id = ?", [id]);
console.log(book.title); // Error! book is a Promise, not an object

// ✅ Correct (await pauses until the database returns the result)
const book = await db.get("SELECT * FROM books WHERE id = ?", [id]);
console.log(book.title); // Works! book is now the actual data object
```

**Key Rule:** Any function that talks to the database (or does network I/O) is asynchronous. Always use `await` before calling `db.get()`, `db.all()`, `db.run()`, etc.

---

## 📸 Screenshots

The following screenshots were captured directly from Postman testing of all Lab 3 endpoints and query parameters.

| # | Endpoint / Test | Screenshot | Status |
|---|---|---|---|
| 1 | GET `/books` — All books | ![Get All Books](screenshots/get-all-books.png) | ✅ Added |
| 2 | GET `/books?search_q=Java` — Search | ![Search Books](screenshots/search-books.png) | ✅ Added |
| 3 | GET `/books?order_by=price&order=DESC` — Sort DESC | ![Sort Books](screenshots/sort-books.png) | ✅ Added |
| 4 | GET `/books?limit=3&offset=2` — Pagination | ![Pagination](screenshots/pagination.png) | ✅ Added |
| 5 | GET `/books?min_price=400&max_price=600` — Price filter | ![Price Filter](screenshots/price-filter.png) | ✅ Added |
| 6 | GET `/books/1` — Get book by ID | ![Get Book by ID](screenshots/get-book-by-id.png) | ✅ Added |
| 7 | POST `/books` — Create book | ![Create Book](screenshots/post-create-book.png) | ✅ Added |
| 8 | POST `/books` — Validation error (missing title) | ![Validation Error](screenshots/post-validation-error.png) | ✅ Added |
| 9 | PUT `/books/1` — Update book | ![Update Book](screenshots/put-update-book.png) | ✅ Added |
| 10 | DELETE `/books/1` — Delete book | ![Delete Book](screenshots/delete-book.png) | ✅ Added |
| 11 | GET `/books/999` — 404 Not Found error | ![Not Found Error](screenshots/not-found-error.png) | ✅ Added |
| 12 | Database verification / All books view | ![Database Verification](screenshots/database-verification.png) | ✅ Added |

### Additional Test Screenshots

| # | Endpoint / Test | Screenshot | Status |
|---|---|---|---|
| 13 | GET `/` — API Welcome & Endpoint List | ![API Welcome](screenshots/api-welcome.png) | ✅ Added |
| 14 | GET `/books` with combined search, sort & price filters | ![Combined Filters](screenshots/combined-filters.png) | ✅ Added |
| 15 | GET `/books/abc` — Invalid ID error (400) | ![Invalid ID Error](screenshots/invalid-id-error.png) | ✅ Added |
| 16 | GET `/books?order_by=invalid` — Invalid query column error (400) | ![Invalid Query Error](screenshots/invalid-query-error.png) | ✅ Added |
| 17 | GET `/books?order_by=price&order=ASC` — Sort ASC | ![Sort ASC](screenshots/sort-asc-books.png) | ✅ Added |
| 18 | POST `/books` — Negative price error (400) | ![Negative Price Error](screenshots/post-negative-price-error.png) | ✅ Added |

---

## 🔧 Problems Faced and Solutions

| # | Problem | Solution |
|---|---|---|
| 1 | SQL column names cannot be parameterized with `?` placeholders | Used an **allowlist** to validate column names before inserting them into the query string |
| 2 | Dynamic WHERE clause — first condition needs `WHERE`, rest need `AND` | Used the `WHERE 1=1` trick so every condition can use `AND` uniformly |
| 3 | `db` variable is `null` when imported directly | Created a `getDb()` getter function that always returns the current database connection |
| 4 | Database re-inserts sample data on every restart | Added a check for table existence before running `initDB.sql` |
| 5 | Server not accessible on Render | Changed `app.listen()` to bind to `0.0.0.0` instead of `localhost` |

---

## 🚀 Deployment Instructions (Render)

### Steps to Deploy

1. Push the code to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/).
3. Click **New → Web Service**.
4. Connect your GitHub repository.
5. Configure the service:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `Lab-3` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

6. Render automatically provides the `PORT` environment variable — no manual setup needed.
7. Click **Deploy**.

### After Deployment

- Update the **Live URL** at the top of this README.
- Test all endpoints using the deployed URL in Postman.

---

## 📚 Key Concepts for Viva

1. **REST API** — An architectural style for building web APIs using standard HTTP methods (GET, POST, PUT, DELETE).
2. **Query Parameters** — Key-value pairs appended to the URL after `?` to filter, sort, or paginate data.
3. **Parameterized Queries** — Using `?` placeholders in SQL instead of string concatenation to prevent SQL injection.
4. **Allowlist Validation** — Checking user input against a predefined list of acceptable values (used for column names).
5. **Separation of Concerns** — Splitting code into modules (`app.js` for routes, `database.js` for database logic) so each file has a single responsibility.
6. **HTTP Status Codes** — Numeric codes that tell the client whether the request succeeded (2xx), had client errors (4xx), or server errors (5xx).
7. **Middleware** — Functions that run before your route handlers (e.g., `express.json()` parses JSON request bodies).

---

_This project was built as part of the Backend Development Fundamentals course at Aurora._

