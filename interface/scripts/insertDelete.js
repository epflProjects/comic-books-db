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
                    cleanAlert(true);

                    $("#insert_alert").append("<div class='alert alert-success alert-dismissible fade in'" +
                        "id='file_size_alert_window'>"
                        + "<a href='#' class='close' data-dismiss='alert' aria-label='close'>" + "&times;"
                        + "</a><strong>" + "Success! " + "</strong>" + "The tuple was inserted!"
                        + "</div>");
                },
                error: function (response) {
                    console.log(response.responseText);
                    cleanAlert(true);

                    switch(response.responseText) {
                        case "Duplicate":
                            $("#insert_alert").append("<div class='alert alert-warning alert-dismissible fade in'" +
                            "id='file_size_alert_window'>"
                            + "<a href='#' class='close' data-dismiss='alert' aria-label='close'>" + "&times;"
                            + "</a><strong>" + "Warning! " + "</strong>" + "The tuple already exists!"
                            + "</div>");
                            break;
                        default:
                            $("#insert_alert").append("<div class='alert alert-warning alert-dismissible fade in'" +
                                "id='file_size_alert_window'>"
                                + "<a href='#' class='close' data-dismiss='alert' aria-label='close'>" + "&times;"
                                + "</a><strong>" + "Warning! " + "</strong>" + "Something went wrong!"
                                + "</div>");
                    }
                }
            })

        });
    });

    $("#delete_search_by").change(function () {
        var dropdownValue = parseInt(jQuery(this).val());

        getFormElements(dropdownValue, false);

        $("#delete_form").submit(function (e) {
            e.preventDefault();
            $.ajax({
                data: $(this).serialize(),
                type: 'POST',
                url: '/delete/data',
                success: function (response) {
                    cleanAlert(false);

                    if (response.affectedRows === 0) {
                        $("#delete_alert").append("<div class='alert alert-info alert-dismissible fade in'" +
                            "id='file_size_alert_window'>"
                            + "<a href='#' class='close' data-dismiss='alert' aria-label='close'>" + "&times;"
                            + "</a><strong>" + "Info! " + "</strong>" + "The deletion affected no row."
                            + "</div>");
                    }else {
                        $("#delete_alert").append("<div class='alert alert-success alert-dismissible fade in'" +
                            "id='file_size_alert_window'>"
                            + "<a href='#' class='close' data-dismiss='alert' aria-label='close'>" + "&times;"
                            + "</a><strong>" + "Success! " + "</strong>" + "The deletion affected "+response.affectedRows+" rows."
                            + "</div>");
                    }
                },
                error: function (response) {
                    console.log(response.responseText);
                    cleanAlert(false);

                    switch(response.responseText) {
                        case "Duplicate":
                            $("#delete_alert").append("<div class='alert alert-warning alert-dismissible fade in'" +
                                "id='file_size_alert_window'>"
                                + "<a href='#' class='close' data-dismiss='alert' aria-label='close'>" + "&times;"
                                + "</a><strong>" + "Warning! " + "</strong>" + "The tuple already exists!"
                                + "</div>");
                            break;
                        default:
                            $("#delete_alert").append("<div class='alert alert-warning alert-dismissible fade in'" +
                                "id='file_size_alert_window'>"
                                + "<a href='#' class='close' data-dismiss='alert' aria-label='close'>" + "&times;"
                                + "</a><strong>" + "Warning! " + "</strong>" + "Something went wrong!"
                                + "</div>");
                    }
                }
            })

        });
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
                form.append("<label>"+ data.rows[i][data.attributes_name[0]] +"</label><input class='form-control' name='"+data.rows[i][data.attributes_name[0]]+"' type='txt'>")
            }
            form.append("<br>");
            form.append('<button class="btn btn-info " id="delete_button" type="submit"><span class="glyphicon glyphicon-pencil"></span> Delete </button>');
        });
    }
}

function cleanAlert(insert) {
    if (insert) {
        $("#insert_alert div").each(function() {
            this.remove();
        });
        $("#insert_alert a").each(function() {
            this.remove();
        });
        $("#insert_alert strong").each(function() {
            this.remove();
        });
    } else {
        $("#delete_alert div").each(function() {
            this.remove();
        });
        $("#delete_alert a").each(function() {
            this.remove();
        });
        $("#delete_alert strong").each(function() {
            this.remove();
        })
    }
}

