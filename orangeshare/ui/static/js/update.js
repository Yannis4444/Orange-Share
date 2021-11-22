function update(endpoint, elementID) {
    $(elementID)
        .addClass("loading")
        .removeClass("done");
    $.post(
        endpoint,
        {},
        function (data) {
            $(elementID)
                .removeClass("loading")
                .addClass("done")
                .attr("title", "Run Update Again");
        }
    ).fail(function (response) {
        $(elementID).removeClass("loading");
        alert('Error: ' + JSON.parse(response.responseText).message);
    });
}

function windowsUpdate() {
    update("/api/update/windows", "#windows_update");
}

function pipUpdate() {
    update("/api/update/pip", "#pip_update");
}

$(function () {
    // check if the newer version is met in a set interval
    // once the new version is reached, reload
    if (newer_version_available) {
        setInterval(() => {
            $.get(
                "/api/info/version",
                function (data) {
                    if (data.version === newer_version) {
                        window.location.reload(true);
                    }
                }
            ).fail(function (response) {
                console.log('Error while getting current version: ' + response.responseText);
            });
        }, 2000);
    }
});