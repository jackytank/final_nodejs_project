/*------------------------------



------------------------------*/

$(function () {
  $("#menuBtn").on("click", function (evt) {
    if ($("html").hasClass("pc")) {
      $("#drowerMenul").height($("body").height() - 50);
    }
    evt.preventDefault();
    evt.stopPropagation();
    $("body").toggleClass("menuonl");
  });

  $(".icn-mail").on("click", function (evt) {
    if ($("html").hasClass("pc")) {
      $("#drowerMenu").height($("body").height() - 50);
    }
    evt.preventDefault();
    evt.stopPropagation();
    $("body").toggleClass("menuon");
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  $(window).scroll(function (evt) {

  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  $(window).resize(function () {
  });

  if ($("html").hasClass("pc")) {
    $("#drowerMenu").height($("body").height() - 50);
  }

  $("#menuBtn").on("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    $("body").toggleClass("menuon");
  });
});

