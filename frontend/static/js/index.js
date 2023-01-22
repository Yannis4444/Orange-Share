function sendMessageToBackend(command, data={}, callback=(message) => {}) {
    console.log("sending '" + command + "' message: " + data);
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
                $("#messages").prepend(message.getElement());
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