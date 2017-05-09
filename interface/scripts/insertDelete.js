$(document).ready(function () {
    $("#insert_search_by").change(function () {
        var dropdownValue = parseInt(jQuery(this).val());

        getFormElements(dropdownValue, true);

        $("#insert_form").submit(function (e) {
            e.preventDefault();
            $.ajax({
                data: $(this).serialize(),
                type: 'POST',
                url: '/insert/data',
                success: function (response) {
                    console.log(response);
                }
            })

        });
    });

    $("#delete_search_by").change(function () {
        var dropdownValue = parseInt(jQuery(this).val());

        getFormElements(dropdownValue, false);
    })
});

function getFormElements(tableNumber, insert) {
    if (insert) {
        // clean the last form
        $("#insert_form label").each(function() {
            this.remove();
        });
        $("#insert_form input").each(function() {
            this.remove();
        });
        $("#insert_form br").each(function() {
            this.remove();
        });
        $("#insert_form button").each(function() {
            this.remove();
        });

        $.get('insert?q='+tableNumber, function(data) {
            var form = $("#insert_form");
            console.log(data);
            for (var i in data.rows) {
                form.append("<label>"+ data.rows[i][data.attributes_name[0]] +"</label><input class='form-control' name='"+data.rows[i][data.attributes_name[0]]+"' type='txt' required>")
            }
            form.append("<br>");
            form.append('<button class="btn btn-info " id="insert_button" type="submit"><span class="glyphicon glyphicon-pencil"></span> Insert </button>');
        });
    } else {
        // clean the last form
        $("#delete_form label").each(function() {
            this.remove();
        });
        $("#delete_form input").each(function() {
            this.remove();
        });
        $("#delete_form br").each(function() {
            this.remove();
        });
        $("#delete_form button").each(function() {
            this.remove();
        });

        $.get('insert?q='+tableNumber, function(data) {
            var form = $("#delete_form");
            console.log(data);
            for (var i in data.rows) {
                form.append("<label>"+ data.rows[i][data.attributes_name[0]] +"</label><input class='form-control' name='"+data.rows[i][data.attributes_name[0]]+"' type='txt' required>")
            }
            form.append("<br>");
            form.append('<button class="btn btn-info " id="insert_button" type="submit"><span class="glyphicon glyphicon-pencil"></span> Insert </button>');
        });
    }
}

