var express = require('express');
var mysql = require('mysql');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static(__dirname+'/../views'));
app.use(express.static(__dirname+'/../scripts'));
app.use('/bootstrap', express.static(path.join(__dirname+'/../styles/framework/bootstrap-3.3.7/')));
app.use('/scripts', express.static(path.join(__dirname+'/../scripts/')));
app.use('/styles', express.static(path.join(__dirname+'/../styles/')));


var port = process.env.PORT || 1337;

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

/*app.get('/', function(request, response) {
    connection.query('SELECT I.publication_date, COUNT(*) FROM Issue I GROUP BY I.publication_date HAVING I.publication_date >= 1990;',
        function(error, rows, fields) {
            if (error) {
                console.log("Erreur ma gueule.");
            } else {
                console.log("Query success.");
                console.log(rows);
                response.json(rows);
            }
        });
});*/

var router = express.Router();

app.get('/', function(request, response) {
   response.sendFile('/index.html');
});

app.get('/constructed', function(request, response) {
    if (request.query.q ==='1990') {
        connection.query('SELECT I.publication_date, COUNT(*) FROM Issue I GROUP BY I.publication_date HAVING I.publication_date >= 1990;',
            function(error, rows, fields) {
                if (error) {
                    console.log("Erreur ma gueule.");
                } else {
                    console.log("Query success.");
                    console.log(rows);
                    response.json(rows);
                }
            });
    }
});

app.get('insertDelete.html', function(request, response) {
    response.sendFile('insertDelete.html');
});

app.get('about.html', function(request, response) {
    response.sendFile('about.html');
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, '404 page not found!');
});

app.listen(port);

