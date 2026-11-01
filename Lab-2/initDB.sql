-- Create the book table
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);

-- Insert nine sample books
INSERT INTO book (title, author, price, pages) VALUES
    ('The Pragmatic Programmer', 'Andrew Hunt', 550, 352),
    ('Introduction to Algorithms', 'Thomas H. Cormen', 800, 1312),
    ('Design Patterns', 'Erich Gamma', 600, 416),
    ('Structure and Interpretation of Computer Programs', 'Harold Abelson', 500, 657),
    ('Artificial Intelligence: A Modern Approach', 'Stuart Russell', 750, 1152),
    ('Deep Learning', 'Ian Goodfellow', 700, 800),
    ('The Art of Computer Programming', 'Donald Knuth', 900, 672),
    ('Code Complete', 'Steve McConnell', 480, 960),
    ('Refactoring', 'Martin Fowler', 520, 448);

