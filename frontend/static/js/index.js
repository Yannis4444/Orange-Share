function changeTab(e, t) {
    $(".tabs span").removeClass("active");
    $(e.target).addClass("active");
    $("#contentMover").css("margin-left", "-" + (t * 100) + "vw");
}