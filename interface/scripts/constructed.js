/**
 * Constructed Query
 */

/**
 * Take care of constructed query
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
    } else if ($(event.target).is("#given_search_highest_number")) {
        queryResult('notFrequently');
    } else if ($(event.target).is("#given_search_series_type")) {
        queryResult('withTypes');
    } else if ($(event.target).is("#given_search_ten_most_reprinted")) {
        queryResult('alanMoor');
    } else if ($(event.target).is("#given_search_nature_related")) {
        queryResult('natureRelated');
    } else if ($(event.target).is("#given_search_top_ten_publishers")) {
        queryResult('three');
    } else if ($(event.target).is("#given_search_more_10000")) {
        queryResult('magazines');
    } else if ($(event.target).is("#given_search_italian")) {
        queryResult('italian');
    } else if ($(event.target).is("#given_search_cartoon_stories")) {
        queryResult('cartoon');
    } else if ($(event.target).is("#given_search_brand_indicia")) {
        queryResult('brandIndicia');
    } else if ($(event.target).is("#given_search_series_length")) {
        queryResult('seriesLength');
    } else if ($(event.target).is("#given_search_single_issue")) {
        queryResult('singleIssue');
    } else if ($(event.target).is("#given_search_script_writers")) {
        queryResult('scriptWriters');
    } else if ($(event.target).is("#given_search_marvel_heroes")) {
        queryResult('marvel');
    } else if ($(event.target).is("#given_search_top_5")) {
        queryResult('five');
    } else if ($(event.target).is("#given_search_given_issue")) {
        queryResult('givenIssue');
    }
}

/**
 * Take care to send and receive a constructed query
 *
 * @param httpQuery
 */
function queryResult(httpQuery) {
    // "clean" the table
    const table = $("#output_table");
    if ($.fn.dataTable.isDataTable(table)) {
        table.DataTable().destroy();
        table.empty();
    }
    $("#output_table th").each(function() {
        this.remove();
    });
    $("#output_table td").each(function() {
        this.remove();
    });
    $("#output_table tr").each(function() {
        this.remove();
    });
    $("#output_table thead").each(function() {
        this.remove();
    });
    $("#output_table tbody").each(function() {
        this.remove();
    });

    $.get('constructed?q=' + httpQuery, function(data) {
        table.append("<thead id='output_table_head'></thead>");
        table.append("<tbody id='output_table_body'></tbody>");

        const tableH = $("#output_table_head");
        const tableB = $("#output_table_body");
        let stringToAppend;

        stringToAppend = "<tr>";
        for (let i in data.attributes_name) {
            stringToAppend += "<th>" + data.attributes_name[i] + "</th>";
        }
        stringToAppend += "</tr>";
        tableH.append(stringToAppend);
        for (let i in data.rows) {
            stringToAppend = "<tr>";
            for (let j in data.attributes_name) {
                stringToAppend += "<td>" + data.rows[i][data.attributes_name[j]] + "</td>";
            }
            stringToAppend += "</tr>";
            tableB.append(stringToAppend);
        }

        // Output Table Initialisation
        $("#output_table").DataTable({
            bSort: false,
            paging: true,
            _fixedHeader: true,
            searching: false,
            autoWidth: true,
            bdeferRender: true,
            bscrollCollapse: true,
            scrollX: "50vh",
            scrollY: "30vh",
            scroller: true,
            overflow: "auto",
            aoColumnDefs: [{
                    "bSearchable": false,
                    "aTargets": ['_all']
                },
                {
                    "bSortable": false,
                    "aTargets": ['_all']
                }
            ]
        });
    });
}
