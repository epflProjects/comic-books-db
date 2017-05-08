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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// TODO On tente la variable globale
var insert_table_name

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
    if (request.query.q === 'belgian') {
        connection.query("SELECT BG.name FROM Brand_Group BG WHERE BG.publisher_id IN (SELECT P.id FROM Publisher P JOIN Indicia_Publisher IP ON IP.publisher_id=P.id WHERE IP.id IN (SELECT IP.id FROM Indicia_Publisher IP WHERE IP.country_id IN (SELECT C.id FROM Country C WHERE C.name = 'Belgium')));",
            function (error, rows, fields) {
                if (error) {
                    console.log("Error in Belgian query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'danish') {
        connection.query("SELECT P.id, P.name FROM Publisher P WHERE P.id IN (SELECT S.publisher_id FROM Series S WHERE S.country_id IN (SELECT C.id FROM Country C WHERE C.name = 'Denmark'));",
            function (error, rows, fields) {
                if (error) {
                    console.log("Error in Danish query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'swiss') {
        connection.query("SELECT S.name FROM Series S WHERE S.country_id IN (SELECT C.id FROM Country C WHERE C.name = 'Switzerland') AND S.publication_type_id IN (SELECT PT.id FROM Series_Publication_Type PT WHERE PT.name = 'magazine');",
            function (error, rows, fields) {
                if (error) {
                    console.log("Error in Swiss query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q ==='1990') {
        connection.query('SELECT I.publication_date, COUNT(*) FROM Issue I GROUP BY I.publication_date HAVING I.publication_date >= 1990;',
            function (error, rows, fields) {
                if (error) {
                    console.log("Erreur ma gueule.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'dcComics') {
        connection.query("SELECT IP.name FROM Indicia_Publisher IP JOIN Publisher P ON IP.publisher_id = P.id WHERE IP.name like '%dc comics%' AND IP.id IN (SELECT S.publisher_id FROM Series S GROUP BY S.publisher_id ORDER BY COUNT(*));",
            function (error, rows, fields) {
                if (error) {
                    console.log("Error in DC Comics query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'reprinted') {
        connection.query("SELECT S.title FROM Story S WHERE S.id IN (SELECT SR.origin_id FROM story_reprint SR GROUP BY SR.origin_id ORDER BY COUNT(*) DESC) AND S.title <> 'NULL' LIMIT 10;",
            function (error, rows, fields) {
                if (error) {
                    console.log("Error in reprinted query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'artist') {
        connection.query("SELECT A.name FROM Artist A WHERE A.id IN (SELECT DISTINCT S.artist_id FROM script S) AND A.id IN (SELECT DISTINCT P.artist_id FROM pencils P) AND A.id IN ( SELECT DISTINCT C.artist_id FROM colors C);",
            function (error, rows, fields) {
                if (error) {
                    console.log("Error in artist query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'batman') {
        connection.query("SELECT DISTINCT S.title FROM Story S WHERE S.feature<>'Batman' AND S.id IN (SELECT CS.story_id FROM Character_ C JOIN Characters CS ON (CS.character_id=C.id) WHERE C.name='Batman') AND S.id NOT IN (SELECT SR.origin_id FROM story_reprint SR);",
            function (error, rows, fields) {
                if (error) {
                    console.log("Error in batman query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    }
});

app.get('insertDelete.html', function(request, response) {
    response.sendFile('insertDelete.html');
});

app.get('/insert', function(request, response) {
   if (request.query.q === '0') {
       insert_table_name = "Artist";
       responseInsertQuery(response, "Artist")
   }
});

app.post('/insert/data', function(request, response) {
    console.log(request.body);
    var essai = "INSERT INTO Artist (id, name) VALUES (1001, 'Salope')";
    connection.query(essai/*"INSERT INTO "+insert_table_name +"SET ?", [request.body]*/,
    function (error, results, fields) {
        if (error) {
            console.log("Error when inserting a new tuple.");
            console.log(error.code);
        } else {
            console.log("COOL");
            // TODO TROUVER MOYEN DE REPONDRE AU CLIENT
        }
    })
});

app.get('about.html', function(request, response) {
    response.sendFile('about.html');
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, '404 page not found!');
});

app.listen(port);

// utility functions
function responseOfConstructedQuery(rows, fields, response) {
    console.log(fields.length);
    console.log("Query success.");
    var attributes_name = [];
    for (var i = 0; i < fields.length; i++) {
        attributes_name.push(fields[i].name);
    }
    var jsonFile = {
        "table_name" : fields[0].orgTable,
        "attributes_name" : attributes_name,
        "rows" : rows
    };
    response.json(jsonFile);
}

function responseInsertQuery(response, table_name) {
    connection.query("SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='Comic-books' AND `TABLE_NAME`='"+ table_name +"';",
        function (error, rows, fields) {
            if (error) {
                console.log("Error in insert query.");
            } else {
                var attributes_name = [];
                for (var i = 0; i < fields.length; i++) {
                    attributes_name.push(fields[i].name);
                }
                var jsonFile = {
                    "attributes_name" : attributes_name,
                    "rows" : rows
                };
                response.json(jsonFile);
            }
        });
}

