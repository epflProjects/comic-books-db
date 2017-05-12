/**
 * Constructed Query
 */

function constructedQuery() {
    if ($(event.target).is("#given_search_brand_group")) {
        queryResult('belgian');
    } else if ($(event.target).is("#given_search_danish_publishers")) {
        queryResult('danish');
    } else if ($(event.target).is("#given_search_swiss_series")) {
        queryResult('swiss');
    } else if ($(event.target).is("#given_search_since_1990")) {
        queryResult('1990');
    } else if ($(event.target).is("#given_search_DC_comics")) {
        queryResult('dcComics');
    } else if ($(event.target).is("#given_search_10_most_reprinted")) {
        queryResult('reprinted');
    } else if ($(event.target).is("#given_search_artists")) {
        queryResult('artist');
    } else if ($(event.target).is("#given_search_Batman_non_reprinted")) {
        queryResult('batman');
    }
}

function queryResult(httpQuery) {
    // "clean" the table
    $("#output_table tr").each(function() {
        this.remove();
    });
    $("#output_table th").each(function() {
        this.remove();
    });
    $("#output_table td").each(function() {
        this.remove();
    });

    $.get('constructed?q='+httpQuery, function(data) {
        const table = $("#output_table");
        let stringToAppend;

        table.append("<thead>");
        stringToAppend = "<tr>";
        for (let i in data.attributes_name) {
            stringToAppend += "<th>"+data.attributes_name[i]+"</th>";
        }
        stringToAppend += "</tr>";
        table.append(stringToAppend);
        table.append("</thead>");

        for (let i in data.rows) {
            stringToAppend = "<tr>";
            for (let j in data.attributes_name) {
                stringToAppend += "<td>"+data.rows[i][data.attributes_name[j]]+"</td>";
            }
            stringToAppend += "</tr>";
            table.append(stringToAppend);
        }
    });
}