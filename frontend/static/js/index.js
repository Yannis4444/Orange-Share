function changeTab(t) {
    $(".tabs span").removeClass("active");
    $(".tabs span:nth-child(" + (t + 1) + ")").addClass("active");
    $("#contentMover").css("margin-left", "-" + (t * 100) + "vw");
}

function toIsoString(date) {
    // return date.toLocaleTimeString();

    // https://stackoverflow.com/a/17415677/13174921
    let tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            return (num < 10 ? '0' : '') + num;
        };

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
}

function dateToString(timestamp) {
    // todo setting to switch
    return toIsoString(new Date(timestamp));
}

function PopUp(title, color = "blue", autoHide = 3000) {
    // colors: red, green, blue

    let popup = $("<div></div>")
        .append(
            $("<h1>" + title + "</h1>"),
            // $("<span class='close'></span>")
            //     .click(function () {
            //         popup.remove();
            //     }),
        );

    if (color !== null) {
        popup.addClass(color);
    }

    $("#popups").append(popup);

    let to;
    if (autoHide > 0) {
        to = setTimeout(function () {
            popup.remove();
        }, autoHide);
    }

    popup.on("mouseenter", function () {
        if (to !== undefined) {
            clearTimeout(to);
        }
    })

    popup.on("mouseleave", function () {
        to = setTimeout(function () {
            popup.remove();
        }, 1000);
    })
}

function closeFullscreenWindows() {
    $("#fullscreenWindows").html("");
}

class Connection {
    // TODO: check if already known
    constructor(data) {
        this.id = data.Connection.Instance.ID;
        this.name = data.Connection.Instance.Name;
        this.host = data.Connection.Host;
        this.deviceType = data.Connection.Instance.DeviceType;
    }

    getIcon() {
        if (this.deviceType.includes("iPhone")) {
            return $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-device-mobile\" width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                "  <rect x=\"7\" y=\"4\" width=\"10\" height=\"16\" rx=\"1\" />\n" +
                "  <line x1=\"11\" y1=\"5\" x2=\"13\" y2=\"5\" />\n" +
                "  <line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"17.01\" />\n" +
                "</svg>");
        } else if (this.deviceType.includes("iPad")) {
            return $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-device-tablet\" width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                "  <rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"1\" />\n" +
                "  <circle cx=\"12\" cy=\"17\" r=\"1\" />\n" +
                "</svg>");
        } else {
            return $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-device-laptop\" width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                "  <line x1=\"3\" y1=\"19\" x2=\"21\" y2=\"19\" />\n" +
                "  <rect x=\"5\" y=\"6\" width=\"14\" height=\"10\" rx=\"1\" />\n" +
                "</svg>");
        }
    }

    // the element to add to the page
    getElement() {
        let div = $("<div class='connection'></div>");
        let connection = this;

        div
            .append(
                $("<div class='name ellipsis' title='" + connection.name + "'><label>" + connection.name + "</label></div>"),
                $("<div class='host ellipsis'><label>" + connection.host + "</label></div>"),
                $("<div class='info ellipsis'><label>Lorem Ipsum</label></div>"),
                $("<div class='icon'></div>")
                    .append(connection.getIcon()),
                $("<div class='send'><div><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-upload\" width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                    "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                    "  <path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\" />\n" +
                    "  <polyline points=\"7 9 12 4 17 9\" />\n" +
                    "  <line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"16\" />\n" +
                    "</svg><label class='tooltip'>Sending</label></div></div>"),
                $("<div class=\'menu\'><div><span></span><span></span><span></span></div></div>")
            );

        return div;
    }
}

// any kind of received message
class ReceivedMessage {
    constructor(data) {
        this.id = data.ID;
        this.name = data.Name;
        this.timestamp = data.Timestamp;
    }

    createButtons(size = "small") {
        // sizes: small, large
        let message = this;

        switch (size) {
            case "small":
                return $("<div class='buttons small'></div>")
                    .append(
                        // https://tablericons.com/ 16px 2.5px
                        $("<span class='button'><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-maximize\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" stroke-width=\"2.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                            "  <path d=\"M4 8v-2a2 2 0 0 1 2 -2h2\" />\n" +
                            "  <path d=\"M4 16v2a2 2 0 0 0 2 2h2\" />\n" +
                            "  <path d=\"M16 4h2a2 2 0 0 1 2 2v2\" />\n" +
                            "  <path d=\"M16 20h2a2 2 0 0 0 2 -2v-2\" />\n" +
                            "</svg><label class='tooltip'>Open</label></span>")
                            .click((e) => {
                                message.open();
                                e.stopPropagation();
                            }),
                        $("<span class='button'><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-copy\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" stroke-width=\"2.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                            "  <rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\" />\n" +
                            "  <path d=\"M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2\" />\n" +
                            "</svg><label class='tooltip'>Clipboard</label></span>")
                            .click((e) => {
                                message.clipboard();
                                e.stopPropagation();
                            }),
                        $("<span class='button'><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-download\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" stroke-width=\"2.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                            "  <path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\" />\n" +
                            "  <polyline points=\"7 11 12 16 17 11\" />\n" +
                            "  <line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"16\" />\n" +
                            "</svg><label class='tooltip'>Save</label></span>")
                            .click((e) => {
                                message.save();
                                e.stopPropagation();
                            }),
                        $("<span class='button'><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-trash\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" stroke-width=\"2.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                            "  <line x1=\"4\" y1=\"7\" x2=\"20\" y2=\"7\" />\n" +
                            "  <line x1=\"10\" y1=\"11\" x2=\"10\" y2=\"17\" />\n" +
                            "  <line x1=\"14\" y1=\"11\" x2=\"14\" y2=\"17\" />\n" +
                            "  <path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\" />\n" +
                            "  <path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\" />\n" +
                            "</svg><label class='tooltip'>Delete</label></span>")
                            .click((e) => {
                                message.delete();
                                e.stopPropagation();
                            })
                    )
            case "large":
                return $("<div class='buttons large'></div>")
                    .append(
                        // https://tablericons.com/ 32px 1.5px
                        $("<span class='button'><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-maximize\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                            "  <path d=\"M4 8v-2a2 2 0 0 1 2 -2h2\" />\n" +
                            "  <path d=\"M4 16v2a2 2 0 0 0 2 2h2\" />\n" +
                            "  <path d=\"M16 4h2a2 2 0 0 1 2 2v2\" />\n" +
                            "  <path d=\"M16 20h2a2 2 0 0 0 2 -2v-2\" />\n" +
                            "</svg><label class='tooltip'>Open</label></span>")
                            .click((e) => {
                                message.open();
                                e.stopPropagation();
                            }),
                        $("<span class='button'><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-copy\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                            "  <rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\" />\n" +
                            "  <path d=\"M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2\" />\n" +
                            "</svg><label class='tooltip'>Clipboard</label></span>")
                            .click((e) => {
                                message.clipboard();
                                e.stopPropagation();
                            }),
                        $("<span class='button'><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-download\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                            "  <path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\" />\n" +
                            "  <polyline points=\"7 11 12 16 17 11\" />\n" +
                            "  <line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"16\" />\n" +
                            "</svg><label class='tooltip'>Save</label></span>")
                            .click((e) => {
                                message.save();
                                e.stopPropagation();
                            }),
                        $("<span class='button'><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-trash\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                            "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                            "  <line x1=\"4\" y1=\"7\" x2=\"20\" y2=\"7\" />\n" +
                            "  <line x1=\"10\" y1=\"11\" x2=\"10\" y2=\"17\" />\n" +
                            "  <line x1=\"14\" y1=\"11\" x2=\"14\" y2=\"17\" />\n" +
                            "  <path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\" />\n" +
                            "  <path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\" />\n" +
                            "</svg><label class='tooltip'>Delete</label></span>")
                            .click((e) => {
                                message.delete();
                                e.stopPropagation();
                            })
                    );
        }
    }

    // the element to add to the page
    getElement() {
        let div = $("<div class='message'></div>");
        let message = this;

        div
            .append(
                $("<div class='name ellipsis' title='" + message.name + "'><label>" + message.name + "</label></div>")
                    .click(() => {
                        message.viewFullscreen();
                    }),
                $("<div class='time ellipsis'><label>" + dateToString(message.timestamp) + "</label></div>"),
                message.createButtons("small")
            );

        return div;
    }

    createFullscreenWrapper() {
        // returns the view div to put stuff into
        closeFullscreenWindows();

        let div = $("<div class='message'></div>");
        let message = this;

        let view = $("<div class='view'></div>");

        div
            .append(
                $("<label class='close'>close</label>")
                    .click(() => {
                        closeFullscreenWindows();
                    }),
                $("<h1 class='ellipsis'>" + message.name + "</h1>"),
                view,
                message.createButtons("large")
            );

        $("#fullscreenWindows")
            .html("")
            .append(div);

        return view;
    }

    viewFullscreen() {
        let div = this.createFullscreenWrapper()
    }

    open() {
        PopUp("Open is not implemented for this type of message", "red");
    }

    clipboard() {
        PopUp("Clipboard is not implemented for this type of message", "red");
    }

    save() {
        PopUp("Save is not implemented for this type of message", "red");
    }

    delete() {
        closeFullscreenWindows();
    }
}

// any kind of received message
class ReceivedImage extends ReceivedMessage {
    constructor(data) {
        super(data);

        this.preview = data.PreviewImage;
    }

    // the element to add to the page
    getElement() {
        let div = super.getElement();
        let message = this;

        div
            .addClass("image")
            .append(
                $('<span class="preview"></span>')
                    .css({"background-image": "url(" + message.preview + ")"})
                    .click(() => {
                        message.viewFullscreen();
                    })
            );

        return div;
    }

    viewFullscreen() {
        let div = this.createFullscreenWrapper();
        let message = this;

        changeTab(1);

        div
            .addClass("image")
            .css({"background-image": "url(" + message.preview + ")"});
    }
}

$(document).ready(function () {

});

function handleGoCommand(command) {
    switch (command) {
        case "home":
            closeFullscreenWindows();
            break;
        default:
            console.log("Unknown command received: '" + command + "'");
    }
}

document.addEventListener('astilectron-ready', function () {
    // This will listen to messages sent by GO
    astilectron.onMessage(function (data) {
        switch (data.Type) {
            case "cmd":
                handleGoCommand(data.Command);
                break;
            case "message":
                let message = new ReceivedImage(data);
                $("#messages").append(message.getElement());
                message.viewFullscreen();
                break;
            case "connection":
                let connection = new Connection(data);
                $("#pairedConnections").append(connection.getElement());
                break;
            default:
                console.log("Can't handle command:");
                console.log(data);
        }


        return "";
    });
})