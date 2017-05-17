/**
 *
 * SERVER
 *
 */

const express = require('express');
const mysql = require('mysql');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(__dirname+'/../views'));
app.use(express.static(__dirname+'/../scripts'));
app.use('/bootstrap', express.static(path.join(__dirname+'/../styles/framework/bootstrap-3.3.7/')));
app.use('/scripts', express.static(path.join(__dirname+'/../scripts/')));
app.use('/styles', express.static(path.join(__dirname+'/../styles/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

let insert_table_name;

let port = process.env.PORT || 1337;

const connection = mysql.createConnection({
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

const router = express.Router();

/**
 * Response to GET and POST http requests
 */

app.get('/', function(request, response) {
    response.sendFile('/index.html');
});

app.post('/search', function(request, response) {
    const fromPart = createSearchFromPart(request.body.tables);
    const tables = request.body.tables;
    const txt = request.body.txt;
    let queryString = "";
    let containText = "'"+"%"+txt+"%"+"'";

    runGenerator(function* () {
        for (let i in tables) {
            let result = yield retrieveAttributes(tables[i]);
            for (let j in result) {
                if (queryString.length !== 0) {
                    queryString += " or ";
                }
                queryString += toTableName(tables[i])+"."+result[j]["COLUMN_NAME"]+" like "+containText;
            }
        }

        connection.query("SELECT * FROM "+fromPart+" WHERE "+queryString+" LIMIT 500",
            function(error, results, fields) {
                if (error) {
                    console.log("Error in the main Search query.");
                    console.log(error.code);
                } else {
                    let attributes_name = [];
                    for (let i = 0; i < fields.length; i++) {
                        attributes_name.push(fields[i].name);
                    }
                    const jsonFile = {
                        "attributes_name" : attributes_name,
                        "rows" : results
                    };
                    response.json(jsonFile);
                }
            });
    });
});

app.get('/constructed', function(request, response) {
    if (request.query.q === 'belgian') {
        connection.query("SELECT BG.name, COUNT(*) FROM (SELECT BG.id, BG.name FROM Brand_Group BG JOIN Indicia_Publisher IP ON IP.publisher_id=BG.publisher_id WHERE IP.country_id IN (SELECT C.id FROM Country C WHERE C.name = 'Belgium')) AS BG GROUP BY BG.id ORDER BY COUNT(*) DESC;",
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
    } else if (request.query.q === 'notFrequently') {

    } else if (request.query.q === 'withTypes') {

    } else if (request.query.q === 'alanMoor') {

    } else if (request.query.q === 'natureRelated') {

    } else if (request.query.q === 'three') {

    } else if (request.query.q === 'magazines') {

    } else if (request.query.q === 'italian') {

    } else if (request.query.q === 'cartoon') {

    } else if (request.query.q === 'brandIndicia') {

    } else if (request.query.q === 'seriesLength') {

    } else if (request.query.q === 'singleIssue') {

    } else if (request.query.q === 'scriptWriters') {

    } else if (request.query.q === 'marvel') {

    } else if (request.query.q === 'five') {

    } else if (request.query.q === 'givenIssue') {

    }
    }
);

app.get('insertDelete.html', function(request, response) {
    response.sendFile('insertDelete.html');
});

app.get('/insert', function(request, response) {
   if (request.query.q === '0') {
       insert_table_name = "Artist";
       responseInsertQuery(response, "Artist")
   } else if (request.query.q === '1') {
       insert_table_name = "Brand_Group";
       responseInsertQuery(response, "Brand_Group");
   } else if (request.query.q === '2') {
       insert_table_name = "Character_";
       responseInsertQuery(response, "Character_");
   } else if (request.query.q === '3') {
       insert_table_name = "characters";
       responseInsertQuery(response, "characters");
   } else if (request.query.q === '4') {
       insert_table_name = "colors";
       responseInsertQuery(response, "colors");
   } else if (request.query.q === '5') {
       insert_table_name = "Country";
       responseInsertQuery(response, "Country");
   } else if (request.query.q === '6') {
       insert_table_name = "Indicia_Publisher";
       responseInsertQuery(response, "Indicia_Publisher");
   } else if (request.query.q === '7') {
       insert_table_name = "inks";
       responseInsertQuery(response, "inks");
   } else if (request.query.q === '8') {
       insert_table_name = "Issue";
       responseInsertQuery(response, "Issue");
   } else if (request.query.q === '9') {
       insert_table_name = "issue_reprint";
       responseInsertQuery(response, "issue_reprint");
   } else if (request.query.q === '10') {
       insert_table_name = "Language";
       responseInsertQuery(response, "Language");
   } else if (request.query.q === '11') {
       insert_table_name = "pencils";
       responseInsertQuery(response, "pencils");
   } else if (request.query.q === '12') {
       insert_table_name = "Publisher";
       responseInsertQuery(response, "Publisher");
   } else if (request.query.q === '13') {
       insert_table_name = "script";
       responseInsertQuery(response, "script");
   } else if (request.query.q === '14') {
       insert_table_name = "Series";
       responseInsertQuery(response, "Series");
   } else if (request.query.q === '15') {
       insert_table_name = "Series_Publication_Type";
       responseInsertQuery(response, "Series_Publication_Type");
   } else if (request.query.q === '16') {
       insert_table_name = "Story";
       responseInsertQuery(response, "Story");
   } else if (request.query.q === '17') {
       insert_table_name = "story_reprint";
       responseInsertQuery(response, "story_reprint");
   } else if (request.query.q === '18') {
       insert_table_name = "Story_Type";
       responseInsertQuery(response, "Story_Type");
   }
});

app.post('/insert/data', function(request, response) {
    connection.query("INSERT INTO "+insert_table_name +" SET ?", request.body,
    function (error, results, fields) {
        if (error) {
            console.log("Error when inserting a new tuple.");
            console.log(error.code);
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    response.status(502).send("Duplicate");
                    break;
                case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
                    response.status(502).send("Type");
                    break;
                default:
                    response.status(404).send("zut");
            }
        } else {
            console.log("COOL");
            response.status(200).send("OK");
        }
    });
});

app.post('/delete/data', function(request, response) {
    let partQuery = createEndOfDeleteQuery(request.body);
    connection.query("set FOREIGN_KEY_CHECKS=0;", function(error, result, fields) {
        if (error) {
            throw error;
        }
    });

    connection.query("DELETE FROM "+ insert_table_name +" WHERE "+partQuery+"",
    function (error, result, fields) {
        if (error) {
            console.log("Error when deleting a new tuple.");
        } else {
            console.log("DELETED!");
            const jsonFile = {
                "affectedRows" : result.affectedRows
            };
            response.json(jsonFile);
        }
    });

    connection.query("set FOREIGN_KEY_CHECKS=1;", function(error, result, fields) {
        if (error) {
            console.log("pipi");
            throw error;
        }
    });
});

app.get('about.html', function(request, response) {
    response.sendFile('about.html');
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, '404 page not found!');
});

app.listen(port);

/**
 * UTILITY FUNCTION
 */

/**
 * Create the String for the 'FROM' part of the Search query
 *
 * @param tables
 * @returns {string}
 */
function createSearchFromPart(tables) {
    let queryString = "";

    for (let i in tables) {
        if (queryString.length !== 0) {
            queryString += ", ";
        }
        queryString += toTableName(tables[i]);
    }
    return queryString;
}

/**
 * From index to table name
 *
 * @param table
 * @returns {*}
 */
function toTableName(table) {
    switch(table) {
        case '0':
            return "Artist";
            break;
        case '1':
            return "Brand_Group";
            break;
        case '2':
            return "Character_";
            break;
        case '3':
            return "characters";
            break;
        case '4':
            return "colors";
            break;
        case '5':
            return "Country";
            break;
        case '6':
            return "Indicia_Publisher";
            break;
        case '7':
            return "inks";
            break;
        case '8':
            return "Issue";
            break;
        case '9':
            return "issue_reprint";
            break;
        case '10':
            return "Language";
            break;
        case '11':
            return "pencils";
            break;
        case '12':
            return "Publisher";
            break;
        case '13':
            return "script";
            break;
        case '14':
            return "Series";
            break;
        case '15':
            return "Series_Publication_Type";
            break;
        case '16':
            return "Story";
            break;
        case '17':
            return "story_reprint";
            break;
        case '18':
            return "Story_Type";
            break;
        default:
            return "";
    }
}

/**
 * Handle the response of the constructed query, create the JSON file and send it to the client
 *
 * @param rows
 * @param fields
 * @param response
 */
function responseOfConstructedQuery(rows, fields, response) {
    let attributes_name = [];
    for (let i = 0; i < fields.length; i++) {
        attributes_name.push(fields[i].name);
    }
    const jsonFile = {
        "table_name" : fields[0].orgTable,
        "attributes_name" : attributes_name,
        "rows" : rows
    };
    response.json(jsonFile);
}

/**
 * Handle the response the insert query, create the JSON file and send it to the client
 *
 * @param response
 * @param table_name
 */
function responseInsertQuery(response, table_name) {
    connection.query("SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='Comic-books' AND `TABLE_NAME`='"+ table_name +"';",
        function (error, rows, fields) {
            if (error) {
                console.log("Error in insert query.");
            } else {
                let attributes_name = [];
                for (let i = 0; i < fields.length; i++) {
                    attributes_name.push(fields[i].name);
                }
                const jsonFile = {
                    "attributes_name" : attributes_name,
                    "rows" : rows
                };
                response.json(jsonFile);
            }
        });
}

/**
 * Create dynamically the 'WHERE' part of the delete query
 *
 * @param body       the request body
 * @returns {string}
 */
function createEndOfDeleteQuery(body) {
    let queryString = "";

    for (let i in body) {

        if (body[i].length !== 0) {
            if (queryString.length !== 0) {
                queryString += " and ";
            }
            let value = parseInt(body[i]);
            if (isNaN(value)) {
                queryString += i +"='"+ body[i] +"'";
            } else {
                queryString += i +"= "+body[i] +"";
            }
        }
    }
    return queryString;
}

/**
 * retrieve the attributes of a given table using a Promise object
 *
 * @param table
 * @returns {Promise}
 */
function retrieveAttributes(table) {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='Comic-books' AND `TABLE_NAME`='"+ toTableName(table) +"';",
            function(error, result, fields) {
                if (error) {
                    console.log("Error in createSearchWherePart function.");
                    reject(error.code);
                } else {
                    resolve(result);
                }
            });
    });
}

/**
 * Function to control the generator function's iterator
 *
 * @param g    generator function
 */
function runGenerator(g) {
    let iterator = g();
    (function iterate(message) {
        let ret = iterator.next(message);

        if (!ret.done) {
            ret.value.then(iterate);
        }
    })();
}