/**
 * MAIN
 */

$(document).ready(function () {
    $("#constructed_query_table").click(function() {
        constructedQuery();
    });



    $(".chosen-select-no-results").chosen({no_results_text: "Oops, nothing found!"})


    var options = [];
    $("#dropdown-menu a").click(function(e) {
        //postSearch(e);var target = $(event.currentTarget);
        console.log("adfas");
        var target = $(e.currentTarget);
        var val = target.attr('data-value');
        console.log("asdf");
        console.log(val);
        var input = target.find('input');
        var index;

        if ((index = options.indexOf(val)) > -1) {
            options.slice(index, 1);
            setTimeout(function () {
                input.prop('checked', false)
            }, 0);
        } else {
            options.push(val);
            setTimeout(function () {
                input.prop('checked', true)
            }, 0);
        }

        $(e.target).blur();

        console.log(options);

        return false;

    });

    $("#search_button").submit(function(e) {
        e.preventDefault();
        console.log("caca");
        console.log(options);
    })
});