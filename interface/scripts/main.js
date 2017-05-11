/**
 * MAIN
 */

$(document).ready(function () {
    $("#constructed_query_table").click(function() {
        constructedQuery();
    });

    $("#search_button").click(function(e) {
        e.preventDefault();
        var selectedTables = $("#search_tables").chosen().val();
        var searchText = $("#search").val();
        var dataToSend = {"txt": searchText, "tables": selectedTables};
        if (searchText.length !== 0) {
            $.ajax({
                data: dataToSend,
                type: 'POST',
                url: 'search/',
                success: function (response) {
                    console.log(response);
                },
                error: function(response) {
                    console.log(response);
                }
            });
        }
    });

    $(".chosen-select-no-results").chosen({no_results_text: "Oops, nothing found!"});
});