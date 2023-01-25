// TODO: sanitize user, message etc.

class Backend {
    static sendMessage(command, host = null, data = {}, callback = (message) => {
    }) {
        console.log("sending '" + command + "' message for host '" + host + "': ", data);
        astilectron.sendMessage(JSON.stringify({
            UICommand: command,
            Host: host,
            Data: (typeof data == 'string') ? data : JSON.stringify(data)
        }), callback);
    }

    static enableAutoClose() {
        Backend.sendMessage("enableAutoClose");
    }

    static disableAutoClose() {
        Backend.sendMessage("disableAutoClose");
    }

    static exit() {
        Backend.sendMessage("exit");
    }

    static sendText(text) {
        console.log("Sending text:", text);
        Backend.sendMessage("sendText", selectedConnection.host, text, () => {
            home();
            Notification("Sent Text to " + selectedConnection.name);
        });
    }

    static openUrl(url) {
        console.log("Opening URL:", url);
        Backend.sendMessage("openURL", null, url);
    }

    static sendFiles(fileList) {
        // TODO: actually send files
        // TODO: ask for confirmation? (show selected files in box, click button below)
        // TODO: show small notification on the bottom after sending something
        // TODO: spinner when sending any content

        console.log("Sending files:", fileList);
        Backend.sendMessage("sendFiles", selectedConnection.host, JSON.stringify(fileList), () => {
            home();
            Notification("Sent File(s) to " + selectedConnection.name)
        });
    }
}

function getUserContainer(user) {
    // TODO: hide if empty
    let containers = $("#connectionList [data-user-id=\"" + user.ID + "\"] .connections");
    if (containers.length > 0) {
        return containers;
    }

    let container = $("<div class='connections'></div>");
    $("#connectionList").append(
        $("<div class='user' data-user-id='" + user.ID + "'><div class='userinfo'><label class='username ellipsis' title='" + user.Username + "'>" + user.Username + "</label><span class='email ellipsis' title='" + user.Email + "'>" + user.Email + "</span></div></div>").append(container)
    );

    return container
}

let connections = {}
let selectedConnection = null;

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

        this.element.click(() => {
            selectedConnection = this;
            $("#sendDialogDevice").html(this.name);
            $("#sendDialog")
                .removeClass("hidden")
                .removeClass("showText")
                .find("textarea").val("");
            Backend.disableAutoClose();
        });

        userContainer.append(this.element);
    }
}

function isValidHttpUrl(string) {
    // https://stackoverflow.com/a/43467144/13174921
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

class Message {
    constructor(data) {
        console.log("New Message:", data)
        this.timestamp = data.Timestamp;
        // TODO: get an actual user
        this.user = "some user";
    }

    addToList(element) {
        $("#receivedList")
            .prepend(element)
            .scrollTop();

        // add small badge to tab
        $(".tabs .receive:not(.active)").addClass("badge");
    }
}

class TextMessage extends Message {
    // TODO: inheritance for different types
    constructor(data) {
        super(data);

        this.text = data.Text;
        this.isUrl = isValidHttpUrl(this.text);

        // TODO: device name would be better
        Notification("Received Text from " + this.user);

        this.addListElement();
    }

    addListElement() {
        let element = $("<div class='message text'></div>")
            .append(
                // https://tablericons.com/ 40px 1px
                (
                    this.isUrl ? $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-link\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                        "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                        "  <path d=\"M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5\" />\n" +
                        "  <path d=\"M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5\" />\n" +
                        "</svg>") : $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-align-left\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                        "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                        "  <line x1=\"4\" y1=\"6\" x2=\"20\" y2=\"6\" />\n" +
                        "  <line x1=\"4\" y1=\"12\" x2=\"14\" y2=\"12\" />\n" +
                        "  <line x1=\"4\" y1=\"18\" x2=\"18\" y2=\"18\" />\n" +
                        "</svg>")
                ),
                $("<label class='title ellipsis'>" + this.text + "</label>"),
                $("<label class='user ellipsis'>" + this.user + "</label>"),
                $("<label class='time'>" + dateToString(this.timestamp) + "</label>")
            ).click(() => {
                if (this.isUrl) {
                    Backend.openUrl(this.text)
                } else {
                    navigator.clipboard.writeText(this.text);
                    Notification("Text copied to clipbard")
                }
            });
        // TODO: context menu with further options
        //       maybe setting for default action

        this.addToList(element);
    }
}

class FilesMessage extends Message {
    // TODO: inheritance for different types
    constructor(data) {
        super(data);

        this.filename = data.Filename;

        // TODO: device name would be better
        Notification("Received File(s) from " + this.user);

        this.addListElement(data.PreviewImage);
    }

    getImage(previewImage) {
        // https://tablericons.com/ 32px 1px
        if (previewImage !== "") {
            return $('<span class="icon preview"></span>')
                .css({"background-image": "url(" + previewImage + ")"});
        } else {
            // TODO: different icons for different types / folders / multiple files
            return $("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-file\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"#000000\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n" +
                "  <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
                "  <path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n" +
                "  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n" +
                "</svg>");
        }
    }

    addListElement(previewImage) {
        let element = $("<div class='message text'></div>")
            .append(
                this.getImage(previewImage),
                $("<label class='title ellipsis'>" + this.filename + "</label>"),
                $("<label class='user ellipsis'>" + this.user + "</label>"),
                $("<label class='time'>" + dateToString(this.timestamp) + "</label>")
            ).click(() => {
                // TODO: do something with the file
                Notification("Just imagine that something happened", "red");
            });
        // TODO: context menu with further options

        this.addToList(element);
    }
}

function changeTab(event, t) {
    event.target.classList.remove("badge");
    $(".tabs span").removeClass("active");
    $(".tabs span:nth-child(" + (t + 1) + ")").addClass("active");
    $("#contentMover").css("margin-left", "-" + (t * 100) + "vw");
}

function Notification(title, color = "blue", autoHide = 3000) {
    // colors: red, green, blue

    let popup = $("<div></div>")
        .append(
            $("<h1>" + title + "</h1>"),
        );

    if (color !== null) {
        popup.addClass(color);
    }

    $("#notifications").append(popup);

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

function getPos(ele){
    let x=0;
    let y=0;
    while(true){
        x += ele.offsetLeft;
        y += ele.offsetTop;
        if(ele.offsetParent === null){
            break;
        }
        ele = ele.offsetParent;
    }
    return [x, y];
}

let currentMenu = null;
function Menu(event, elements) {
    if (currentMenu !== null) {
        currentMenu.remove()
    }

    let pos = getPos(event.target);

    // TODO: check to not move out the window

    currentMenu = $("<div class='menu'></div>")
        .css("right",(window.innerWidth - (pos[0] + event.target.offsetWidth)) + "px")
        .css("top",pos[1] + event.target.offsetHeight + "px");

    elements.forEach((element, i) => {
        currentMenu.append(
            $("<label>" + element.label + "</label>")
                .click((e) => {
                    element.action(e);
                })
        );
    });

    $("body").append(currentMenu);

    event.stopPropagation();
}

function openMainMenu(event) {
    Menu(event, [
        {
            label: "Settings",
            action: () => {
                // TODO: open settings
                Notification("Settings not yet implemented", "red");
            }
        },
        {
            label: "Exit",
            action: () => {
                Backend.exit();
            }
        }
    ])
}

function toIsoString(date) {

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
    return new Date(timestamp).toLocaleString();
    // return toIsoString(new Date(timestamp));
}

function home() {
    $(".fullscreen").addClass("hidden");
    Backend.enableAutoClose();
}

// region sendDialog

function fileDialog(event) {
    var input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    // TODO: directories?
    // input.directory  = true;
    // input.webkitdirectory  = true;

    input.onchange = e => {
        // var file = e.target.files[0];
        // console.log(e.target);
        // console.log(e.target.files);

        let fileList = [];
        [...e.target.files].forEach((item, i) => {
            fileList.push(item.path);
        });
        Backend.sendFiles(fileList);
    }

    input.click();
}

function fileDropHandler(event) {
    // console.log('File(s) dropped', event);

    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();

    if (event.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        let fileList = [];
        [...event.dataTransfer.items].forEach((item, i) => {
            // console.log(event.dataTransfer.items);
            // If dropped items aren't files, reject them
            if (item.kind === 'file') {
                const file = item.getAsFile();
                // console.log(`… file[${i}].name = ${file.name}`);
                // console.log(file);
                fileList.push(file.path);
            }

        });
        Backend.sendFiles(fileList);
    } else {
        let fileList = [];
        // Use DataTransfer interface to access the file(s)
        [...event.dataTransfer.files].forEach((file, i) => {
            // console.log(`… file[${i}].name = ${file.name}`);
            // console.log(file);
            fileList.push(file.path);
        });
        Backend.sendFiles(fileList);
    }

    event.target.classList.remove("drag");
}

function fileDragOverHandler(event) {
    event.target.classList.add("drag");
    event.preventDefault();
}

function fileDragEndHandler(event) {
    event.target.classList.remove("drag");
    event.preventDefault();
}

function useClipboard(event) {
    // TODO: currently only works for text, better get content in backend
    // TODO: ask for confirmation
    Backend.sendText(require("electron").clipboard.readText());
}

function showTextInput(event) {
    $("#sendDialog").addClass("showText");
}

function sendTextInput(event) {
    // TODO: do not send empty text
    Backend.sendText($("#sendDialogTextInput").val());
}

// endregion

function handleGoCommand(command) {
    console.log("Handling command:", command)
    switch (command) {
        case "home":
            home();
            break;
        default:
            console.log("Unknown command received: '" + command + "'");
    }
}

function handleConnection(data) {
    let connectionData = data.Connection;
    if (connectionData.Instance.ID in connections) {
        connections[connectionData.Instance.ID].updateData(connectionData);
    } else {
        new Connection(connectionData);
    }
}

document.addEventListener('astilectron-ready', function () {
    // This will listen to messages sent by GO
    astilectron.onMessage(function (data) {
        switch (data.UICommand) {
            case "cmd":
                handleGoCommand(data.Data);
                break;
            case "textMessage":
                new TextMessage(data);
                break;
            case "filesMessage":
                // TODO
                new FilesMessage(data);
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

$( document ).ready(function() {
    $(document).click(() => {
        if (currentMenu !== null) {
            currentMenu.remove();
            currentMenu = null;
        }
    });
});