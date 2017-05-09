/**
 * MAIN
 */

$(document).ready(function () {
    $("#constructed_query_table").click(function() {
        constructedQuery();
    });

    $("#dropdown-menu a").click(function(e) {
        postSearch(e);
    });
});