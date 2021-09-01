class Device {
    constructor(name, id, data, open=false) {
        let outerDiv = $("<div></div>");

        let label = $("<label class='name' title='" + name + "'>" + name + "</label>")
        outerDiv.append(label);

        // https://tablericons.com/ 28px 1px
        let deleteButton = $("<label class=\"button delete\"></label>");
        deleteButton.on("click", function () {
            outerDiv.remove();
            $.post(
                "/api/devices/delete",
                {
                    "id": id
                },
                function(data) {
                }
            ).fail(function (response) {
                alert('Error: ' + response.responseText);
            });
        });
        deleteButton.append("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-trash\" width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#ffffff\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
            "  <line x1=\"4\" y1=\"7\" x2=\"20\" y2=\"7\" />\n" +
            "  <line x1=\"10\" y1=\"11\" x2=\"10\" y2=\"17\" />\n" +
            "  <line x1=\"14\" y1=\"11\" x2=\"14\" y2=\"17\" />\n" +
            "  <path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\" />\n" +
            "  <path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\" />\n" +
            "</svg>");
        outerDiv.append(deleteButton);

        let qrbutton = $("<label class='button qrcode'></label>");
        qrbutton.on("click", function (event) {
            let wasActive = event.delegateTarget.classList.contains("active");
            $("#devices .button.qrcode").removeClass("active");
            if (!wasActive) {
                event.delegateTarget.classList.add("active");
            }
        });
        setTimeout(function () {
            $("#devices .button.qrcode").removeClass("active");
            if (open) {
                qrbutton.addClass("active");
            }
        }, 200);
        qrbutton.append("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-qrcode\" width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#ffffff\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
            "        <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
            "        <rect x=\"4\" y=\"4\" width=\"6\" height=\"6\" rx=\"1\" />\n" +
            "        <line x1=\"7\" y1=\"17\" x2=\"7\" y2=\"17.01\" />\n" +
            "        <rect x=\"14\" y=\"4\" width=\"6\" height=\"6\" rx=\"1\" />\n" +
            "        <line x1=\"7\" y1=\"7\" x2=\"7\" y2=\"7.01\" />\n" +
            "        <rect x=\"4\" y=\"14\" width=\"6\" height=\"6\" rx=\"1\" />\n" +
            "        <line x1=\"17\" y1=\"7\" x2=\"17\" y2=\"7.01\" />\n" +
            "        <line x1=\"14\" y1=\"14\" x2=\"17\" y2=\"14\" />\n" +
            "        <line x1=\"20\" y1=\"14\" x2=\"20\" y2=\"14.01\" />\n" +
            "        <line x1=\"14\" y1=\"14\" x2=\"14\" y2=\"17\" />\n" +
            "        <line x1=\"14\" y1=\"20\" x2=\"17\" y2=\"20\" />\n" +
            "        <line x1=\"17\" y1=\"17\" x2=\"20\" y2=\"17\" />\n" +
            "        <line x1=\"20\" y1=\"17\" x2=\"20\" y2=\"20\" />\n" +
            "    </svg>")
        outerDiv.append(qrbutton);

        let qrcode = $("<div id='qr-" + Date.now() + "' class='qrcode'></div>");
        outerDiv.append(qrcode);

        $("#devices").append(outerDiv);

        new QRCode(qrcode[0].id).makeCode(data);
    }
}

function addNew(event) {
    let addNew = $("#addNew");

    if (!addNew.hasClass("active")) {
        // open
        addNew.addClass("active");
        $("#newDeviceName").select();
    } else {
        // send request for new one, get qr code content

        // TODO: handle no name

        addNew.removeClass("active");

        let name = $("#newDeviceName").val()

        $.post(
            "/api/devices/new",
            {
                "name": name
            },
            function(data) {
                new Device(name, data.id, data.qrcode, true);
            }
        ).fail(function (response) {
            alert('Error: ' + response.responseText);
        });
    }
}

function addNewInputEnter(event) {
    if (event.keyCode === 13) {
        addNew(event)
    }
}

function closeAddNew(event) {
    $("#addNew").removeClass("active");
}

$(function() {
    // load current devices
    $.get(
        "/api/devices",
        function(devices) {
            for (let id in devices) {
                new Device(devices[id].name, devices[id].id, devices[id].qrcode)
            }
        }
    ).fail(function (response) {
        alert('Error: ' + response.responseText);
    });
});