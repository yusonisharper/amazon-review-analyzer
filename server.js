const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: 'aaa123', // replace with your MySQL password
    database: 'my_db' // replace with your database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

///////////////////////////////////// start here/////////////////////////////////////////////
app.get('/', (req, res) => {
    res.redirect('index.html');
})

// get reviews that contains keywords
app.get('/reviews/:rating/:counts/text=:text', (req, res) => {
    const rating = req.params.rating;
    const count = req.params.counts;
    const text = req.params.text;
    let sqlQuery = `SELECT * FROM reviews  `;
    if (rating >= 1 && rating <= 5) sqlQuery += 'where reviews.rating = ' + rating + ' ';
    sqlQuery += "and reviews.text LIKE '%" + text+ "%'";
    if (count >= 1 && count <= 10000) sqlQuery += 'LIMIT ' + count + ' ';
    sqlQuery += ';';
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.json(results);
    });
})

// get review list base on rating given specific size (count)
app.get('/reviews/:rating/:counts', (req, res) => {
    const rating = req.params.rating;
    const count = req.params.counts;
    let sqlQuery = `
    SELECT reviews.*, products.images AS product_images
    FROM reviews
    JOIN products ON reviews.parent_asin = products.parent_asin 
    `;
    if (rating >= 1 && rating <= 5) sqlQuery += 'where reviews.rating = ' + rating + ' ';
    if (count >= 1 && count <= 10000) sqlQuery += 'LIMIT ' + count + ' ';
    sqlQuery += ';';
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.json(results);
    });
})

// get product list given specific size (count)
app.get('/products/count/:count', (req, res) => {
    const count = req.params.count;
    let sqlQuery = 'SELECT * FROM products ';
    if (count >= 1 && count <= 10000) sqlQuery += 'LIMIT ' + count + ';';
    console.log(sqlQuery);
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.json(results);
    });
})

// get product reviews given asin
app.get('/products/:asin/reviews', (req, res) => {
    const asin = req.params.asin;
    let sqlQuery = "SELECT * FROM reviews where parent_asin = '" + asin + "';";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.json(results);
    });
})

// get product reviews given specific keyword
app.get('/products/reviews/:keyword', (req, res) => {
    const keyword = req.params.keyword;
    let sqlQuery = "SELECT * FROM reviews where text LIKE '%" + keyword + "%';";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.json(results);
    });
})

// get products using asin, should only return one or zero
app.get('/products/:asin', (req, res) => {
    const asin = req.params.asin;
    let sqlQuery = "SELECT * FROM products where parent_asin = '" + asin + "';";
    console.log(sqlQuery);
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.json(results);
    });
})

// get Two-word keywords List base on rating given specific size (count)
app.get('/keywords/2/:rating/:counts', (req, res) => {
    const rating = req.params.rating;
    const count = req.params.counts;
    let sqlQuery = 'SELECT * FROM rating_' + rating + '_twokeywords ';
    sqlQuery += 'ORDER BY count DESC ';
    if (count >= 1 && count <= 10000) sqlQuery += 'LIMIT ' + count + ' ';
    sqlQuery += ';';
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.json(results);
    });
})

// get keywords List base on rating given specific size (count)
app.get('/keywords/1/:rating/:counts', (req, res) => {
    const rating = req.params.rating;
    const count = req.params.counts;
    let sqlQuery = 'SELECT * FROM rating_' + rating + '_keywords ';
    sqlQuery += 'ORDER BY count DESC ';
    if (count >= 1 && count <= 10000) sqlQuery += 'LIMIT ' + count + ' ';
    sqlQuery += ';';
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.json(results);
    });
})

app.listen(port, () => console.log(`app listening on ${port}`))

