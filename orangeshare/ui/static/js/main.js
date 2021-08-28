function openDownload(event) {
    $("#download").addClass("active");
    console.log(event.target.dataset.name);
    console.log(event.target.dataset.url);

    $("#downloadHeader").html(event.target.dataset.name);
    $("#downloadLink").attr("href", event.target.dataset.url);

    // https://davidshimjs.github.io/qrcodejs/
    var qrcode = new QRCode("qrcode");
    qrcode.makeCode(event.target.dataset.url);
}
function closeDownload() {
    $("#download").removeClass("active");
}
