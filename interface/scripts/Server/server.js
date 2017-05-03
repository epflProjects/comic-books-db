var express        = require('express');
var mysql      = require('mysql');

var app = express();

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '528491',
    database : 'Comic-books'
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

app.get('/', function(request, response) {
    connection.query('SELECT I.publication_date, COUNT(*) FROM Issue I GROUP BY I.publication_date HAVING I.publication_date >= 1990;',
        function(error, rows, fields) {
            if (error) {
                console.log("Erreur ma gueule.");
            } else {
                console.log("Query success.");
                console.log(rows);
            }
        });
});

app.listen(1337);

