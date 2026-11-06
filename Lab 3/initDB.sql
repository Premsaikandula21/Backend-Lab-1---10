-- ============================================================
-- Lab 3: Books Database Schema
-- Creates the 'books' table and inserts 10 sample records
-- ============================================================

-- Create the books table
-- NOTE: In Lab 2 the table was named 'book' (singular).
--       In Lab 3 we use 'books' (plural) which is the REST convention.
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price REAL NOT NULL,
    pages INTEGER
);

-- Insert 10 sample books with realistic prices and page counts
INSERT INTO books (title, author, price, pages) VALUES
    ('JavaScript: The Good Parts', 'Douglas Crockford', 350, 176),
    ('Python Crash Course', 'Eric Matthes', 480, 544),
    ('Java: The Complete Reference', 'Herbert Schildt', 650, 1248),
    ('Learning Python', 'Mark Lutz', 720, 1648),
    ('Eloquent JavaScript', 'Marijn Haverbeke', 400, 472),
    ('Clean Code', 'Robert C. Martin', 550, 464),
    ('The Pragmatic Programmer', 'Andrew Hunt', 500, 352),
    ('Introduction to Algorithms', 'Thomas H. Cormen', 850, 1312),
    ('Design Patterns', 'Erich Gamma', 600, 416),
    ('Node.js Design Patterns', 'Mario Casciaro', 580, 640);

