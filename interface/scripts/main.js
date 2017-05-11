/**
 * MAIN
 */

$(document).ready(function () {
    $("#constructed_query_table").click(function() {
        constructedQuery();
    });

    $("#search_button").submit(function(e) {
        e.preventDefault();
        console.log("Enter in submit");
        var my_select = $('select[multiple].chosen-select-no-results').get(0);
        console.log(my_select);
    });

    $(".chosen-select-no-results").chosen({no_results_text: "Oops, nothing found!"});
});