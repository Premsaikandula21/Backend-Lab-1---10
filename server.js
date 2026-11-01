const express = require("express");

const app = express();

// Route 1: Home
app.get("/", (req, res) => {
  res.status(200).send("Welcome to my server!");
});

// Route 2: About
app.get("/about", (req, res) => {
  res.status(200).json({
    name: "K. Prem Sai",
    section: "CSE Gen_AI(2A)"
  });
});

// Route 3: Current date and time
app.get("/time", (req, res) => {
  res.status(200).send(new Date().toString());
});

// Route 4: Unknown paths
app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
