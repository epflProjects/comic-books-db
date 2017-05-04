/**
 * MAIN
 */

$(document).ready(function () {
    $("#given_search_since_1990").click(function() {
        // "clean" the table
        $("#output_table td").each(function() {
            this.remove();
        });

        $.get('constructed?q=1990', function(data) {
            console.log(data);
            var table = $("#output_table");
            $.each(data, function(i, row) {
                table.append("<tr><td>"+ row.publication_date +"</td></tr>")
            })
        });
    });
});