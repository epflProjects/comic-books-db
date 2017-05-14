/**
 * CLIENT
 */

$(document).ready(function () {
    // Constructed Query
    $("#constructed_query_table").click(function() {
        constructedQuery();
    });

    // Search
    $("#search_button").click(function(e) {
        e.preventDefault();
        const selectedTables = $("#search_tables").chosen().val();
        const searchText = $("#search").val();
        const dataToSend = {"txt": searchText, "tables": selectedTables};
        if (searchText.length !== 0) {
            $.ajax({
                data: dataToSend,
                type: 'POST',
                url: 'search/',
                success: function (response) {
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

                    const table = $("#output_table");
                    let stringToAppend;

                    table.append("<thead>");
                    stringToAppend = "<tr>";
                    for (let i in response.attributes_name) {
                        stringToAppend += "<th>"+response.attributes_name[i]+"</th>";
                    }
                    stringToAppend += "</tr>";
                    table.append(stringToAppend);
                    table.append("</thead>");

                    for (let i in response.rows) {
                        stringToAppend = "<tr>";
                        for (let j in response.attributes_name) {
                            stringToAppend += "<td>"+response.rows[i][response.attributes_name[j]]+"</td>";
                        }
                        stringToAppend += "</tr>";
                        table.append(stringToAppend);
                    }
                },
                error: function(response) {
                    // TODO handle the errors
                    console.log(response);
                }
            });
        }
    });

    $(".chosen-select-no-results").chosen({no_results_text: "Oops, nothing found!"});
});