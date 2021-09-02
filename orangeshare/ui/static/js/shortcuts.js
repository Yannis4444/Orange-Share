$(function () {
    let qrcodes = $(".qrcode")

    for (let i = 0; i < qrcodes.length; i++) {
        let qrcode = $($(qrcodes[i])[0]);

        qrcode.append($("<a id='" + qrcode.data("url") + "' href='" + qrcode.data("url") + "'>"));
        new QRCode(qrcode.data("url")).makeCode(qrcode.data("url"));

        // add button
        qrcode.append(function() {
            let button = $("<span class='download'>Download</span>");
            button.on("click", function () {
                qrcode.toggleClass("active");
                if (qrcode.hasClass("active")) {
                    button.html("Close");
                } else {
                    button.html("Download");
                }
            });
            return button;
        });
    }
});