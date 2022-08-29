const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();

const { MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_HOST_IP } =
  process.env;

console.log({ MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_HOST_IP });

const { hostname } = new URL(MYSQL_HOST_IP);

// const HOST = MYSQL_HOST_IP.replace("tcp://", "").replace(":3306", "");
// // Add mysql database connection

console.log("hostname>>", hostname);
const db = mysql.createPool({
  host: hostname, // the host name MYSQL_DATABASE: node_mysql
  user: MYSQL_USER, // database user MYSQL_USER: MYSQL_USER
  password: MYSQL_PASSWORD, // database user password MYSQL_PASSWORD: MYSQL_PASSWORD
  database: MYSQL_DATABASE, // database name MYSQL_HOST_IP: mysql_db
});

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
app.get("/get", (req, res) => {
  const SelectQuery = " SELECT * FROM  books_reviews";
  db.query(SelectQuery, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// add a book to the database
app.post("/insert", (req, res) => {
  console.log("req>>>", req);
  const bookName = req.body.setBookName;
  const bookReview = req.body.setReview;

  const InsertQuery =
    "INSERT INTO books_reviews (book_name, book_review) VALUES (?, ?)";
  db.query(InsertQuery, [bookName, bookReview], (err, result) => {
    if (err) return res.send(err);
    return res.status(200).send({ result });
  });
});

// delete a book from the database
app.delete("/delete/:bookId", (req, res) => {
  const bookId = req.params.bookId;
  const DeleteQuery = "DELETE FROM books_reviews WHERE id = ?";
  db.query(DeleteQuery, bookId, (err, result) => {
    if (err) console.log(err);
    return res.status(200).send("Deleted");
  });
});

// update a book review
app.put("/update/:bookId", (req, res) => {
  const bookReview = req.body.reviewUpdate;
  const bookId = req.params.bookId;
  const UpdateQuery = "UPDATE books_reviews SET book_review = ? WHERE id = ?";
  db.query(UpdateQuery, [bookReview, bookId], (err, result) => {
    if (err) console.log(err);
    return res.status(200).send("Updated");
  });
});

app.listen("3001", () => {
  console.log("Node running on PORT: " + process.env.PORT);
});
