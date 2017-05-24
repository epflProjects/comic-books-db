/**
 *
 * CLIENT
 *
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
                    const table = $("#output_table");
                    if ($.fn.dataTable.isDataTable(table)) {
                        table.DataTable().destroy();
                        table.empty();
                    }
                    $("#output_table_head th").each(function () {
                        this.remove();
                    });
                    $("#output_table_body td").each(function () {
                        this.remove();
                    });
                    $("#output_table_head tr").each(function () {
                        this.remove();
                    });
                    $("#output_table_body tr").each(function () {
                        this.remove();
                    });
                    $("#output_table thead").each(function () {
                        this.remove();
                    });
                    $("#output_table tbody").each(function () {
                        this.remove();
                    });

                    table.append("<thead id='output_table_head'></thead>");
                    table.append("<tbody id='output_table_body'></tbody>");

                    const tableH = $("#output_table_head");
                    const tableB = $("#output_table_body");
                    let stringToAppend;

                    stringToAppend = "<tr>";
                    for (let i in response.attributes_name) {
                        stringToAppend += "<th>"+response.attributes_name[i]+"</th>";
                    }
                    stringToAppend += "</tr>";
                    tableH.append(stringToAppend);

                    for (let i in response.rows) {
                        stringToAppend = "<tr>";
                        for (let j in response.attributes_name) {
                            stringToAppend += "<td>"+response.rows[i][response.attributes_name[j]]+"</td>";
                        }
                        stringToAppend += "</tr>";
                        tableB.append(stringToAppend);
                    }

                    // Output Table Initialisation
                    $("#output_table").DataTable({
                        bSort:false,
                        paging: true,
                        _fixedHeader: true,
                        searching: false,
                        autoWidth: true,
                        bdeferRender: true,
                        bscrollCollapse: true,
                        scrollX: "50vh",
                        scrollY: "50vh",
                        scroller: true,
                        overflow: "auto",
                        aoColumnDefs: [
                            {"bSearchable": false, "aTargets": ['_all']},
                            {"bSortable": false, "aTargets": ['_all']} ]
                    });
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
