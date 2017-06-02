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
app.use(express.static(__dirname + '/../views'));
app.use(express.static(__dirname + '/../scripts'));
app.use('/bootstrap', express.static(path.join(__dirname + '/../styles/framework/bootstrap-3.3.7/')));
app.use('/scripts', express.static(path.join(__dirname + '/../scripts/')));
app.use('/styles', express.static(path.join(__dirname + '/../styles/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

let insert_table_name;

let port = process.env.PORT || 1337;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '528491',
    database: 'Comic-books'
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
    let containText = "'" + "%" + txt + "%" + "'";

    runGenerator(function*() {
        for (let i in tables) {
            let result = yield retrieveAttributes(tables[i]);
            for (let j in result) {
                if (queryString.length !== 0) {
                    queryString += " or ";
                }
                queryString += toTableName(tables[i]) + "." + result[j]["COLUMN_NAME"] + " like " + containText;
            }
        }

        connection.query("SELECT * FROM " + fromPart + " WHERE " + queryString + " LIMIT 500",
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
                        "attributes_name": attributes_name,
                        "rows": results
                    };
                    response.json(jsonFile);
                }
            });
    });
});

app.get('/constructed', function(request, response) {
    if (request.query.q === 'belgian') {
        connection.query("SELECT BG.name AS brand_groups FROM (SELECT BG.id, BG.name FROM Brand_Group BG JOIN Indicia_Publisher IP ON IP.publisher_id=BG.publisher_id WHERE IP.country_id IN (SELECT C.id FROM Country C WHERE C.name = 'Belgium')) AS BG GROUP BY BG.id ORDER BY COUNT(*) DESC LIMIT 15;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in Belgian query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'danish') {
        connection.query("SELECT P.id AS publisher_id, P.name AS publisher_name FROM Publisher P WHERE P.id IN (SELECT S.publisher_id FROM Series S WHERE S.country_id IN (SELECT C.id FROM Country C WHERE C.name = 'Denmark') AND S.publication_type_id IN ( SELECT SPT.id FROM Series_Publication_Type SPT WHERE SPT.name = 'book'));",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in Danish query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'swiss') {
        connection.query("SELECT S.name AS magazines_swiss_series_names FROM Series S WHERE S.country_id IN ( SELECT C.id FROM Country C WHERE C.name = 'Switzerland' ) AND S.publication_type_id IN ( SELECT PT.id FROM Series_Publication_Type PT WHERE PT.name = 'magazine');",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in Swiss query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === '1990') {
        connection.query("SELECT I.publication_date AS year, COUNT(*) AS number_of_issues FROM Issue I WHERE I.publication_date >= 1990 AND I.publication_date <=2017 GROUP BY I.publication_date;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Erreur ma gueule.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'dcComics') {
        connection.query("SELECT IP.name AS indicia_publisher, COUNT(DISTINCT(I.series_id)) AS number_of_series FROM Indicia_Publisher IP, Issue I WHERE IP.id = I.indicia_publisher_id AND IP.name LIKE '%dc comics%' GROUP BY IP.id ORDER BY COUNT(*) DESC;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in DC Comics query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'reprinted') {
        connection.query("SELECT DISTINCT S.title AS most_reprinted_stories FROM Story S JOIN ( SELECT SR.origin_id FROM story_reprint SR GROUP BY SR.origin_id ORDER BY COUNT(*) DESC ) AS SR ON S.id = SR.origin_id WHERE S.title <> 'NULL' LIMIT 10;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in reprinted query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'artist') {
        connection.query("SELECT DISTINCT A.name AS artists FROM Artist A, script S, pencils P, colors C WHERE S.story_id = P.story_id AND P.story_id = C.story_id  AND A.id = S.artist_id AND A.id = P.artist_id AND A.id = C.artist_id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in artist query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'batman') {
        connection.query("SELECT DISTINCT S.title AS stories FROM Story S WHERE S.feature NOT LIKE '%Batman%' AND S.id IN ( SELECT CS.story_id FROM Character_ C, Characters CS WHERE CS.character_id=C.id AND C.name='Batman' ) AND S.id NOT IN ( SELECT SR.target_id FROM story_reprint SR) AND S.title <> 'NULL';",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in batman query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'notFrequently') {
        connection.query("SELECT S.name AS series_names FROM Series S JOIN ( SELECT I.series_id FROM Issue I JOIN ( SELECT DISTINCT St.issue_id FROM Story St WHERE St.type_id <> ( SELECT St.type_id FROM Story St GROUP BY St.type_id ORDER BY COUNT(St.type_id) DESC LIMIT 1)) AS NEW_STORY ON I.id = NEW_STORY.issue_id) AS NEW_ISSUE ON S.id = NEW_ISSUE.series_id GROUP BY S.id ORDER BY COUNT(*) DESC LIMIT 15;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in notFrequently query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'withTypes') {
        connection.query("SELECT P.name AS publisher_names FROM Publisher P JOIN ( SELECT PUBL_TYPE.publisher_id, COUNT(*)  FROM ( SELECT S.publisher_id, PT.id FROM Series S, Series_Publication_Type PT WHERE S.publication_type_id = PT.id GROUP BY S.publisher_id , PT.id) AS PUBL_TYPE GROUP BY PUBL_TYPE.publisher_id HAVING COUNT(*) = ( SELECT COUNT(PT.id)  FROM Series_Publication_Type PT)) AS PUBL ON P.id = PUBL.publisher_id ORDER BY P.name ASC;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in withTypes query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'alanMoor') {
        connection.query("SELECT C.name AS alan_moore_most_reprinted_characters FROM Character_ C JOIN ( SELECT c.character_id FROM characters c JOIN ( SELECT s.story_id FROM script s JOIN ( SELECT A.id FROM Artist A WHERE A.name = 'Alan Moore' LIMIT 1) AS A ON s.artist_id=A.id) AS AM_STORIES ON c.story_id=AM_STORIES.story_id GROUP BY c.character_id ORDER BY COUNT(c.story_id) DESC LIMIT 10) AS MOST_REPR_CHAR ON C.id=MOST_REPR_CHAR.character_id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in alanMoor query.");
                    console.log(error.code);
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'natureRelated') {
        connection.query("SELECT DISTINCT A.name AS writers FROM Artist A JOIN ( SELECT SELECTED_STORIES.artist_id FROM ( SELECT s.story_id, s.artist_id FROM script s JOIN ( SELECT S.id FROM Story S WHERE S.genre LIKE '%nature%') AS S ON s.story_id = S.id) as SELECTED_STORIES JOIN pencils p ON SELECTED_STORIES.story_id = p.story_id WHERE SELECTED_STORIES.artist_id = p.artist_id) AS NATURE_ARTISTS ON A.id = NATURE_ARTISTS.artist_id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in natureRelated query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'three') {
        connection.query("SELECT P.name AS publisher, PL2.name AS language FROM Publisher P JOIN ( SELECT PL.publisher_id, L.name FROM Language L JOIN ( SELECT LANGUAGE_GROUPED.publisher_id, LANGUAGE_GROUPED.language_id, LANGUAGE_GROUPED.series_count FROM ( SELECT PUBL_LANGU.publisher_id, PUBL_LANGU.language_id, COUNT(*) AS series_count FROM ( SELECT S.publisher_id, S.language_id FROM Series S JOIN ( SELECT S.publisher_id FROM Series S GROUP BY S.publisher_id ORDER BY COUNT(*) DESC LIMIT 10) AS TOP_10_PUBL ON S.publisher_id = TOP_10_PUBL.publisher_id) AS PUBL_LANGU GROUP BY PUBL_LANGU.publisher_id, PUBL_LANGU.language_id ORDER BY PUBL_LANGU.publisher_id ASC, COUNT(*) DESC) AS LANGUAGE_GROUPED WHERE( SELECT COUNT(*) FROM( SELECT S.publisher_id, S.language_id, COUNT(*) AS language_by_publisher_count FROM Series S GROUP BY S.publisher_id, S.language_id) AS LANGUAGE_COUNT_BY_PUBLISHER WHERE LANGUAGE_COUNT_BY_PUBLISHER.publisher_id = LANGUAGE_GROUPED.publisher_id   AND series_count <= language_by_publisher_count) < 4) AS PL ON L.id = PL.language_id) AS PL2 ON P.id = PL2.publisher_id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in three query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'magazines') {
        connection.query("SELECT L.name as language, BY_LANGUAGE.number_of_stories FROM Language L JOIN ( SELECT MAG_ISSUES.language_id, COUNT(*) AS number_of_stories FROM Story St JOIN ( SELECT I.id AS issue_id, MAGAZINES.id AS series_id, MAGAZINES.language_id FROM Issue I JOIN ( SELECT S.id, S.language_id FROM Series S JOIN Series_Publication_Type SPT  ON S.publication_type_id = SPT.id WHERE SPT.name = 'magazine') AS MAGAZINES ON I.series_id = MAGAZINES.id) AS MAG_ISSUES ON St.issue_id = MAG_ISSUES.issue_id GROUP BY MAG_ISSUES.language_id HAVING number_of_stories >= 10000) AS BY_LANGUAGE ON L.id = BY_LANGUAGE.language_id ORDER BY BY_LANGUAGE.number_of_stories DESC;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in magazines query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'italian') {
        connection.query("SELECT ST.name AS story_type FROM Story_Type ST LEFT JOIN ( SELECT DISTINCT St.type_id FROM Story St JOIN ( SELECT I.id FROM Issue I JOIN ( SELECT MAGAZINES.id FROM Country C JOIN ( SELECT S.id, S.country_id FROM Series S JOIN Series_Publication_Type SPT ON S.publication_type_id = SPT.id WHERE SPT.name = 'magazine') AS MAGAZINES ON C.id=MAGAZINES.country_id WHERE C.name = 'Italy' ) AS ITALIAN_MAGAZINES ON I.series_id = ITALIAN_MAGAZINES.id ) AS IM_ISSUES ON St.issue_id = IM_ISSUES.id) AS STORIES ON ST.id = STORIES.type_id WHERE STORIES.type_id IS NULL;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in italian query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'cartoon') {
        connection.query("SELECT A.name AS writers FROM Artist A JOIN ( SELECT ARTIST_WITH_IP.artist_id FROM( SELECT s.artist_id, WITH_IP.indicia_publisher_id FROM script s JOIN ( SELECT I.indicia_publisher_id, CARTOON_STORIES.id FROM Issue I JOIN ( SELECT S.id, S.issue_id FROM Story S JOIN ( SELECT ST.id FROM Story_Type ST WHERE ST.name = 'cartoon' ) AS CARTOON_TYPE ON S.type_id = CARTOON_TYPE.id ) AS CARTOON_STORIES ON I.id = CARTOON_STORIES.issue_id ) AS WITH_IP ON s.story_id = WITH_IP.id GROUP BY s.artist_id, WITH_IP.indicia_publisher_id) AS ARTIST_WITH_IP GROUP BY ARTIST_WITH_IP.artist_id HAVING COUNT(*) > 1 ) AS ARTIST_WITH_MORE_THAN_ONE_IP ON A.id=ARTIST_WITH_MORE_THAN_ONE_IP.artist_id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in cartoon query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'brandIndicia') {
        connection.query("SELECT BG.id, BG.name, COUNT(*) as Numbers FROM Brand_Group BG, Indicia_Publisher IP WHERE IP.publisher_id=BG.publisher_id GROUP BY BG.id, BG.name ORDER BY COUNT(*) DESC LIMIT 10;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in brandIndicia query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'seriesLength') {
        connection.query("SELECT IP.name AS indicia_publisher, IP_AVG.average_series_length FROM Indicia_Publisher IP JOIN ( SELECT ISSUE_SERIES.indicia_publisher_id, AVG(ISSUE_SERIES.year_ended - ISSUE_SERIES.year_began) AS average_series_length FROM ( SELECT S.id AS series_id, I.id AS issue_id, S.year_began, S.year_ended, I.indicia_publisher_id FROM Series S JOIN Issue I ON I.series_id = S.id) AS ISSUE_SERIES JOIN Indicia_Publisher IP ON IP.id = ISSUE_SERIES.indicia_publisher_id GROUP BY ISSUE_SERIES.indicia_publisher_id) AS IP_AVG ON IP_AVG.indicia_publisher_id = IP.id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in seriesLength query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'singleIssue') {
        connection.query("SELECT IP.name AS indicia_publisher FROM Indicia_Publisher IP JOIN ( SELECT I.indicia_publisher_id FROM Issue I JOIN ( SELECT I.series_id FROM Issue I GROUP BY I.series_id HAVING COUNT(*) = 1 ) AS SINGLE_ISSUES ON I.series_id = SINGLE_ISSUES.series_id WHERE I.indicia_publisher_id IS NOT NULL GROUP BY I.indicia_publisher_id ORDER BY COUNT(*) DESC LIMIT 10 ) AS TOP_IPS ON IP.id = TOP_IPS.indicia_publisher_id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in singleIssue query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'scriptWriters') {
        connection.query("SELECT IP.name AS indicia_publisher FROM Indicia_Publisher IP JOIN ( SELECT DISTINCT I.indicia_publisher_id FROM Issue I JOIN ( SELECT St.issue_id FROM Story St JOIN ( SELECT s.story_id FROM script s GROUP BY s.story_id ORDER BY COUNT(*) DESC ) AS STORIES ON St.id = STORIES.story_id ) AS ISSUES ON I.id = ISSUES.issue_id WHERE I.indicia_publisher_id IS NOT NULL LIMIT 10) AS TOP_IPS ON IP.id = TOP_IPS.indicia_publisher_id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in scriptWriters query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'marvel') {
        connection.query("SELECT C.name as Marvel_heroes FROM Character_ C JOIN ( SELECT DISTINCT c.character_id FROM characters c JOIN ( SELECT St.id FROM Story St WHERE St.title LIKE '%Marvel%' AND (St.title LIKE '%DC %' OR St.title LIKE '% DC%' OR St.title LIKE '%DC/%') ) AS CROSSOVERS ON c.story_id = CROSSOVERS.id ) AS CHARACTERS ON C.id = CHARACTERS.character_id WHERE CHARACTERS.character_id IN ( SELECT DISTINCT c.character_id FROM characters c JOIN ( SELECT St.id FROM Story St WHERE St.title LIKE '%Marvel%' AND St.title NOT LIKE '%DC%' ) AS MARVEL_ST ON c.story_id = MARVEL_ST.id);",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in marvel query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'five') {
        connection.query("SELECT S.id AS series_id, S.name FROM Series S JOIN ( SELECT I.series_id, COUNT(*) FROM Issue I GROUP BY I.series_id ORDER BY COUNT(*) DESC LIMIT 5 ) AS SERIES ON S.id = SERIES.series_id;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in five query.");
                } else {
                    responseOfConstructedQuery(rows, fields, response);
                }
            });
    } else if (request.query.q === 'givenIssue') {
        connection.query("SELECT I.id AS issue_id, I.title AS issue_title, St.id AS most_reprinted_story_id, St.title AS most_reprinted_story, COUNT(*) AS number_of_reprints FROM Issue I, Story St, story_reprint sr WHERE I.id = 968363 AND St.id = sr.origin_id AND St.issue_id = I.id GROUP BY St.id ORDER BY COUNT(*) DESC LIMIT 1;",
            function(error, rows, fields) {
                if (error) {
                    console.log("Error in givenIssue query.");
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
    connection.query("INSERT INTO " + insert_table_name + " SET ?", request.body,
        function(error, results, fields) {
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

    connection.query("DELETE FROM " + insert_table_name + " WHERE " + partQuery + "",
        function(error, result, fields) {
            if (error) {
                console.log("Error when deleting a new tuple.");
            } else {
                console.log("DELETED!");
                const jsonFile = {
                    "affectedRows": result.affectedRows
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

app.use(function(req, res, next) {
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
    switch (table) {
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
        "table_name": fields[0].orgTable,
        "attributes_name": attributes_name,
        "rows": rows
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
    connection.query("SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='Comic-books' AND `TABLE_NAME`='" + table_name + "';",
        function(error, rows, fields) {
            if (error) {
                console.log("Error in insert query.");
            } else {
                let attributes_name = [];
                for (let i = 0; i < fields.length; i++) {
                    attributes_name.push(fields[i].name);
                }
                const jsonFile = {
                    "attributes_name": attributes_name,
                    "rows": rows
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
                queryString += i + "='" + body[i] + "'";
            } else {
                queryString += i + "= " + body[i] + "";
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
    return new Promise(function(resolve, reject) {
        connection.query("SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='Comic-books' AND `TABLE_NAME`='" + toTableName(table) + "';",
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
