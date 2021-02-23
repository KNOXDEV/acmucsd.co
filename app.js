const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

const app = express();
app.use('/static', express.static('./static'));
app.get('/:path', (req, res) => {
    const path = `${__dirname}/${req.params.path}.html`
    if(fs.existsSync(path))
        res.sendFile(path);
    else
        res.redirect('/');
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use(bodyParser.urlencoded({extended: true}));

const db = new sqlite3.Database(':memory:');
db.serialize(function() {
    // level one
  db.run("CREATE TABLE user (email TEXT, password TEXT, name TEXT)");
  db.run("INSERT INTO user VALUES ('acm@ucsd.edu', 'acmrocks', 'App Administrator')");

  // level two
  db.run("CREATE TABLE user2 (email TEXT, password TEXT, name TEXT)");
  db.run("INSERT INTO user2 VALUES ('acm@ucsd.edu', '11ca892ec6d0ed1e18daedb12ef4eee8', 'App Administrator')");
});

// level one: basic short-circuiting
app.post('/login', function (req, res) {
    const email = req.body.email; // a valid email is acm@ucsd.edu
    const password = req.body.password; // a valid password is acmrocks
    const query = "SELECT name FROM user where email = '" + email + "' and password = '" + password + "'";

    console.log('query: ' + query);

    db.get(query, function(err, row) {
        if(err) {
            console.log('ERROR', err);
            res.redirect("/#error");
        } else if (!row) {
            res.redirect("/#unauthorized");
        } else {
            res.redirect("/success#" + '1');
        }
    });
});

// level two: hashed passwords
app.post('/login2', function (req, res) {
    const email = req.body.email; // a valid email is acm@ucsd.edu
    const password = md5(req.body.password); // a valid password is acmrocks
    const query = "SELECT name FROM user2 where email = '" + email + "' and password = '" + password + "'";

    console.log('query: ' + query);

    db.get(query, function(err, row) {
        if(err) {
            console.log('ERROR', err);
            res.redirect("/level2#error");
        } else if (!row) {
            res.redirect("/level2#unauthorized");
        } else {
            res.redirect("/success#" + '2');
        }
    });
});

app.listen(80);
