function getUserContainer(user) {
    // TODO: hide if empty
    let containers = $("#connectionList [data-user-id=\"" + user.ID + "\"] .connections");
    if (containers.length > 0) {
        return containers[0];
    }

    let container = $("<div class='connections'></div>");
    $("#connectionList").append(
        $("<div class='user' data-user-id='" + user.ID + "'><div class='userinfo'><label class='username ellipsis' title='" + user.Username + "'>" + user.Username + "</label><span class='email ellipsis' title='" + user.Email + "'>" + user.Email + "</span></div></div>").append(container)
    );

    return container
}

let connections = {}

class Connection {
    constructor(data) {
        console.log("New connection:", data);
        connections[data.Instance.ID] = this;

        this.id = data.Instance.ID;

        this.initListElement();
        this.updateData(data);
    }

    getIcon() {
        // https://tablericons.com/ 32px 1.5px
        // https://github.com/golang/go/blob/master/src/go/build/syslist.go
        // TODO: better icons
        switch (this.deviceType.split("/")[0]) {
            case "android":
                return $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-brand-android\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                    "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                    "  <line x1=\"4\" y1=\"10\" x2=\"4\" y2=\"16\" />\n" +
                    "  <line x1=\"20\" y1=\"10\" x2=\"20\" y2=\"16\" />\n" +
                    "  <path d=\"M7 9h10v8a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-8a5 5 0 0 1 10 0\" />\n" +
                    "  <line x1=\"8\" y1=\"3\" x2=\"9\" y2=\"5\" />\n" +
                    "  <line x1=\"16\" y1=\"3\" x2=\"15\" y2=\"5\" />\n" +
                    "  <line x1=\"9\" y1=\"18\" x2=\"9\" y2=\"21\" />\n" +
                    "  <line x1=\"15\" y1=\"18\" x2=\"15\" y2=\"21\" />\n" +
                    "</svg>");
            case "ios":
                return $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-brand-apple\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                    "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                    "  <path d=\"M9 7c-3 0 -4 3 -4 5.5c0 3 2 7.5 4 7.5c1.088 -.046 1.679 -.5 3 -.5c1.312 0 1.5 .5 3 .5s4 -3 4 -5c-.028 -.01 -2.472 -.403 -2.5 -3c-.019 -2.17 2.416 -2.954 2.5 -3c-1.023 -1.492 -2.951 -1.963 -3.5 -2c-1.433 -.111 -2.83 1 -3.5 1c-.68 0 -1.9 -1 -3 -1z\" />\n" +
                    "  <path d=\"M12 4a2 2 0 0 0 2 -2a2 2 0 0 0 -2 2\" />\n" +
                    "</svg>");
            case "darwin":
            case "linux":
            case "windows":
                return $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-device-desktop\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                    "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                    "  <rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"1\" />\n" +
                    "  <line x1=\"7\" y1=\"20\" x2=\"17\" y2=\"20\" />\n" +
                    "  <line x1=\"9\" y1=\"16\" x2=\"9\" y2=\"20\" />\n" +
                    "  <line x1=\"15\" y1=\"16\" x2=\"15\" y2=\"20\" />\n" +
                    "</svg>");
            default:
                return $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-question-mark\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                    "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                    "  <path d=\"M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4\" />\n" +
                    "  <line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"19.01\" />\n" +
                    "</svg>");
        }
    }

    updateData(data) {
        this.host = data.Host;
        this.deviceType = data.Instance.DeviceType;
        this.name = data.Instance.Name;

        this.element.html([
            $("<div class='name ellipsis' title='" + this.name + "'><label>" + this.name + "</label></div>"),
            $("<div class='host ellipsis'><label>" + this.host + "</label></div>"),
            $("<div class='icon'></div>")
                .append(this.getIcon())
        ])
    }

    initListElement() {
        // TODO: get an actual user
        let userContainer = getUserContainer({
            ID: "abc123",
            Username: "some user",
            Email: "some@user.com"
        });

        this.element = $("<div class='connection'></div>")

        userContainer.append(this.element);
    }
}

function changeTab(t) {
    $(".tabs span").removeClass("active");
    $(".tabs span:nth-child(" + (t + 1) + ")").addClass("active");
    $("#contentMover").css("margin-left", "-" + (t * 100) + "vw");
}

function sendMessageToBackend(command, data = {}, callback = (message) => {
}) {
    console.log("sending '" + command + "' message: ", data);
    astilectron.sendMessage(JSON.stringify({
        Command: command,
        Data: JSON.stringify(data)
    }), callback());
}

function enableAutoClose() {
    sendMessageToBackend("enableAutoClose");
}

function disableAutoClose() {
    sendMessageToBackend("disableAutoClose");
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
    // TODO: setting to switch
    return toIsoString(new Date(timestamp));
}

function handleGoCommand(command) {
    console.log("Handling command:", command)
    switch (command) {
        case "home":
            // TODO: go home
            break;
        default:
            console.log("Unknown command received: '" + command + "'");
    }
}

function handleMessage(data) {
    console.log("Received message:", data)
}

function handleConnection(data) {
    let connectionData = data.Connection;
    if (connectionData.Instance.ID in connections) {
        connections[connectionData.Instance.ID].updateData(connectionData);
    } else {
        new Connection(connectionData)
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
                handleMessage(data);
                break;
            case "connection":
                handleConnection(data);
                break;
            default:
                console.log("Can't handle message:", data);
        }

        return "";
    });
})