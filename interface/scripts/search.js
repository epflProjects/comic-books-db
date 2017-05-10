/**
 * SEARCH
 */
//var options = [];

function postSearch(event) {
    var target = $(event.currentTarget);
    var val = target.attr('data-value');
    console.log("asdf");
    console.log(value);
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

    $(event.target).blur();

    console.log(options);

    return false;
}