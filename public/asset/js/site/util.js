
//////////////////////////////////////////

/*------------------------------------
 プラットフォーム判定
------------------------------------*/
const _ua = (function (u) {
  return {
    Tablet: (u.indexOf("windows") != -1 && u.indexOf("touch") != -1)
      || u.indexOf("ipad") != -1
      || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
      || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
      || u.indexOf("kindle") != -1
      || u.indexOf("silk") != -1
      || u.indexOf("playbook") != -1,
    Mobile: (u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
      || u.indexOf("iphone") != -1
      || u.indexOf("ipod") != -1
      || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
      || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
      || u.indexOf("blackberry") != -1
  };
})(window.navigator.userAgent.toLowerCase());


/*------------------------------------
 トレース
------------------------------------*/
const trace = function (xTxt) {
  console.log(xTxt);
  //window.console && console.log(xTxt);
};

/*------------------------------------
 GETパラメータの取得
------------------------------------*/
const getParamArgs = function () {
  const xResArray = null;
  const xQuery = window.location.search.substring(1);
  const xGetDatas = xQuery.split('&');
  if (xGetDatas.length > 0) {
    xResArray = {};
    for (const i = 0; i < xGetDatas.length; i++) {
      const xPos = xGetDatas[i].indexOf('=');
      if (xPos > 0) {
        const xKey = xGetDatas[i].substring(0, xPos);
        const xValue = xGetDatas[i].substring(xPos + 1);
        xValue = decodeURI(xValue);
        xResArray[xKey] = xValue;
      }
    }
  }
  return xResArray;
};


/*------------------------------------
 スムーススクロール
------------------------------------*/
const pageScroll = function (xAncar) {
  let xPos;
  const xHeight = $("#header").height();
  if (xAncar == "#top") {
    xPos = 0;
  } else if (xAncar != "#") {
    xPos = $(xAncar).offset().top - xHeight;
  }
  $('body,html').animate({ scrollTop: xPos }, "slow", 'swing');
};


//////////////////////////////////////////

/*------------------------------------
ページ幅チェック*/
const fsCheckPageMode = function () {
  if ($(window).width() <= 738) {
    $("html").addClass("modeN");
  } else {
    $("html").removeClass("modeN");
  }
};

/*------------------------------------
外部JSファイル動的読み込み
------------------------------------*/
const fsLoadJSfile = function (xUrl) {
  const xElm = document.createElement("script");
  xElm.type = "text/javascript";
  xElm.src = xUrl;
  xElm.onload = function () {
    trace("Load JS >>" + xUrl);
  };
  document.head.appendChild(xElm);
};

/*------------------------------------
配列のシャッフル
------------------------------------*/
/*const shuffleArray = function(xArray){
  const  m = xArray.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    xArray[m] = xArray[i];
    xArray[i] = xArray[m]
    //[xArray[m],xArray[i]] = [xArray[i],xArray[m]];
  }
  return xArray;
};*/

const shuffleArray = function (xArray) {
  for (const i = xArray.length - 1; i > 0; i = 0 | i - 1) {
    const j = 0 | Math.random() * (i + 1);
    const swap = xArray[i];
    xArray[i] = xArray[j];
    xArray[j] = swap;
  }
  return xArray;
};


/*------------------------------------
 イニシャライズ
------------------------------------*/

$(function () {

  if (_ua.Mobile) {
    $("html").addClass("sp");
  } else if (_ua.Tablet) {
    $("html").addClass("tb");
  } else {
    $("html").addClass("pc");
  }

  $("a[href^='#']").on("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const xAncar = $(this).attr("href");
    pageScroll(xAncar);
  });

  // メニューアコーディオン
  $('.js-menu__item__link').each(function () {
    $(this).on('click', function () {
      $(this).toggleClass('on');
      $("+.submenu", this).slideToggle();
      return false;
    });
  });

  $('#userName').on('click', function () {
    const height = $('#drowerMenu').css('height') * 1;

    if ($('#userMenuItem').css('display') === 'none') {
      $('#drowerMenu').css({ top: '130px', height: height - 80 + 'px' });
    } else {
      $('#drowerMenu').css({ top: '50px', height: height + 80 + 'px' });
    }

    $('#userMenuItem').slideToggle();
  });


  $.datepicker.regional.ja = {
    closeText: "閉じる",
    prevText: "<前",
    nextText: "次>",
    currentText: "今日",
    monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    dayNames: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
    dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
    dayNamesMin: ["日", "月", "火", "水", "木", "金", "土"],
    weekHeader: "週",
    dateFormat: "yy/mm/dd",
    firstDay: 0,
    isRTL: false,
    showMonthAfterYear: true,
    yearSuffix: "年"
  };
  $.datepicker.setDefaults($.datepicker.regional.ja);

  $('#callender').datepicker();
});


/*------------------------------------

 SNS Share Action

------------------------------------*/
const fsDoShareSNS = function (xTmpPath) {
  //const xLocation = $("link[name='canonical']").attr("href");
  const xLocation = location.href;
  xTmpPath = xTmpPath.replace("/https://tomei-info.com/odawara/ukaiitabi//g", xLocation);
  window.open(xTmpPath, '_blank', 'width=600, height=600, menubar=no, toolbar=no, scrollbars=yes');
};

const fsShareTweet = function (evt) {
  evt.preventDefault();
  evt.stopPropagation();
  const xDiscription = $("meta[name='twitter:description']").attr("content");
  trace(xDiscription);
  const xTmpPath = "https://twitter.com/intent/tweet?url=https://tomei-info.com/odawara/ukaiitabi/&text=" + encodeURIComponent(xDiscription);
  fsDoShareSNS(xTmpPath);
};

const fsShareFacebook = function (evt) {
  evt.preventDefault();
  evt.stopPropagation();
  const xDiscription = $("meta[name='og:description']").attr("content");
  trace(xDiscription);
  const xTmpPath = "https://www.facebook.com/sharer/sharer.php?u=https://tomei-info.com/odawara/ukaiitabi/&t=" + encodeURIComponent(xDiscription);
  fsDoShareSNS(xTmpPath);
};

