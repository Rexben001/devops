const express = require("express");
const cors = require("cors");
const app = express();

// Enable cors security headers
app.use(cors());

// add an express method to parse the POST method
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// home page
app.get("/", (req, res) => {
  res.send("Hi There");
});
// home page
app.get("/metrics", (req, res) => {
  res.send("Send metrics");
});

// get all of the books in the database

app.listen("3001", () => {
  console.log("Node running on PORT: " + process.env.PORT);
});
