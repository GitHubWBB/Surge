/**
 * 2026 FIFA 世界杯 - 实时比分面板
 *
 * Surge 面板脚本：显示当前正在进行和即将进行的比赛
 * 实时比分 + 进球球员 + 比赛状态
 */

var FLAGS = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Bosnia & Herzegovina":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭",
  "USA":"🇺🇸","Paraguay":"🇵🇾","Brazil":"🇧🇷","Morocco":"🇲🇦",
  "Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Australia":"🇦🇺","Türkiye":"🇹🇷",
  "Germany":"🇩🇪","Curaçao":"🇨🇼","Netherlands":"🇳🇱","Japan":"🇯🇵",
  "Ivory Coast":"🇨🇮","Ecuador":"🇪🇨","Sweden":"🇸🇪","Tunisia":"🇹🇳",
  "Spain":"🇪🇸","Cape Verde":"🇨🇻","Belgium":"🇧🇪","Egypt":"🇪🇬",
  "Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","Iran":"🇮🇷","New Zealand":"🇳🇿",
  "France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴",
  "Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹","Jordan":"🇯🇴",
  "Portugal":"🇵🇹","DR Congo":"🇨🇩","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷",
  "Ghana":"🇬🇭","Panama":"🇵🇦","Uzbekistan":"🇺🇿","Colombia":"🇨🇴",
};
var CN = {
  "Mexico":"墨西哥","South Africa":"南非","South Korea":"韩国","Czechia":"捷克",
  "Canada":"加拿大","Bosnia & Herzegovina":"波黑","Qatar":"卡塔尔","Switzerland":"瑞士",
  "USA":"美国","Paraguay":"巴拉圭","Brazil":"巴西","Morocco":"摩洛哥",
  "Haiti":"海地","Scotland":"苏格兰","Australia":"澳大利亚","Türkiye":"土耳其",
  "Germany":"德国","Curaçao":"库拉索","Netherlands":"荷兰","Japan":"日本",
  "Ivory Coast":"科特迪瓦","Ecuador":"厄瓜多尔","Sweden":"瑞典","Tunisia":"突尼斯",
  "Spain":"西班牙","Cape Verde":"佛得角","Belgium":"比利时","Egypt":"埃及",
  "Saudi Arabia":"沙特阿拉伯","Uruguay":"乌拉圭","Iran":"伊朗","New Zealand":"新西兰",
  "France":"法国","Senegal":"塞内加尔","Iraq":"伊拉克","Norway":"挪威",
  "Argentina":"阿根廷","Algeria":"阿尔及利亚","Austria":"奥地利","Jordan":"约旦",
  "Portugal":"葡萄牙","DR Congo":"刚果民主","England":"英格兰","Croatia":"克罗地亚",
  "Ghana":"加纳","Panama":"巴拿马","Uzbekistan":"乌兹别克斯坦","Colombia":"哥伦比亚",
};

var MATCHES = [
  {id:1,g:"A",h:"Mexico",a:"South Africa",d:"2026-06-11T15:00"},
  {id:2,g:"A",h:"South Korea",a:"Czechia",d:"2026-06-11T22:00"},
  {id:3,g:"B",h:"Canada",a:"Bosnia & Herzegovina",d:"2026-06-12T15:00"},
  {id:4,g:"D",h:"USA",a:"Paraguay",d:"2026-06-12T21:00"},
  {id:5,g:"B",h:"Qatar",a:"Switzerland",d:"2026-06-13T15:00"},
  {id:6,g:"C",h:"Brazil",a:"Morocco",d:"2026-06-13T18:00"},
  {id:7,g:"C",h:"Haiti",a:"Scotland",d:"2026-06-13T21:00"},
  {id:8,g:"D",h:"Australia",a:"Türkiye",d:"2026-06-14T00:00"},
  {id:9,g:"E",h:"Germany",a:"Curaçao",d:"2026-06-14T13:00"},
  {id:10,g:"F",h:"Netherlands",a:"Japan",d:"2026-06-14T16:00"},
  {id:11,g:"E",h:"Ivory Coast",a:"Ecuador",d:"2026-06-14T19:00"},
  {id:12,g:"F",h:"Sweden",a:"Tunisia",d:"2026-06-14T22:00"},
  {id:13,g:"H",h:"Spain",a:"Cape Verde",d:"2026-06-15T12:00"},
  {id:14,g:"G",h:"Belgium",a:"Egypt",d:"2026-06-15T15:00"},
  {id:15,g:"H",h:"Saudi Arabia",a:"Uruguay",d:"2026-06-15T18:00"},
  {id:16,g:"G",h:"Iran",a:"New Zealand",d:"2026-06-15T21:00"},
  {id:17,g:"I",h:"France",a:"Senegal",d:"2026-06-16T15:00"},
  {id:18,g:"I",h:"Iraq",a:"Norway",d:"2026-06-16T18:00"},
  {id:19,g:"J",h:"Argentina",a:"Algeria",d:"2026-06-16T21:00"},
  {id:20,g:"J",h:"Austria",a:"Jordan",d:"2026-06-17T00:00"},
  {id:21,g:"K",h:"Portugal",a:"DR Congo",d:"2026-06-17T13:00"},
  {id:22,g:"L",h:"England",a:"Croatia",d:"2026-06-17T16:00"},
  {id:23,g:"L",h:"Ghana",a:"Panama",d:"2026-06-17T19:00"},
  {id:24,g:"K",h:"Uzbekistan",a:"Colombia",d:"2026-06-17T22:00"},
  {id:25,g:"A",h:"Czechia",a:"South Africa",d:"2026-06-18T12:00"},
  {id:26,g:"B",h:"Switzerland",a:"Bosnia & Herzegovina",d:"2026-06-18T15:00"},
  {id:27,g:"B",h:"Canada",a:"Qatar",d:"2026-06-18T18:00"},
  {id:28,g:"A",h:"Mexico",a:"South Korea",d:"2026-06-18T21:00"},
  {id:29,g:"D",h:"USA",a:"Australia",d:"2026-06-19T15:00"},
  {id:30,g:"C",h:"Scotland",a:"Morocco",d:"2026-06-19T18:00"},
  {id:31,g:"C",h:"Brazil",a:"Haiti",d:"2026-06-19T20:30"},
  {id:32,g:"D",h:"Türkiye",a:"Paraguay",d:"2026-06-19T23:00"},
  {id:33,g:"F",h:"Netherlands",a:"Sweden",d:"2026-06-20T13:00"},
  {id:34,g:"E",h:"Germany",a:"Ivory Coast",d:"2026-06-20T16:00"},
  {id:35,g:"E",h:"Ecuador",a:"Curaçao",d:"2026-06-20T20:00"},
  {id:36,g:"F",h:"Tunisia",a:"Japan",d:"2026-06-21T00:00"},
  {id:37,g:"H",h:"Spain",a:"Saudi Arabia",d:"2026-06-21T12:00"},
  {id:38,g:"G",h:"Belgium",a:"Iran",d:"2026-06-21T15:00"},
  {id:39,g:"H",h:"Uruguay",a:"Cape Verde",d:"2026-06-21T18:00"},
  {id:40,g:"G",h:"New Zealand",a:"Egypt",d:"2026-06-21T21:00"},
  {id:41,g:"J",h:"Argentina",a:"Austria",d:"2026-06-22T13:00"},
  {id:42,g:"I",h:"France",a:"Iraq",d:"2026-06-22T17:00"},
  {id:43,g:"I",h:"Norway",a:"Senegal",d:"2026-06-22T20:00"},
  {id:44,g:"J",h:"Jordan",a:"Algeria",d:"2026-06-22T23:00"},
  {id:45,g:"K",h:"Portugal",a:"Uzbekistan",d:"2026-06-23T13:00"},
  {id:46,g:"L",h:"England",a:"Ghana",d:"2026-06-23T16:00"},
  {id:47,g:"L",h:"Panama",a:"Croatia",d:"2026-06-23T19:00"},
  {id:48,g:"K",h:"Colombia",a:"DR Congo",d:"2026-06-23T22:00"},
  {id:49,g:"B",h:"Switzerland",a:"Canada",d:"2026-06-24T15:00"},
  {id:50,g:"B",h:"Bosnia & Herzegovina",a:"Qatar",d:"2026-06-24T15:00"},
  {id:51,g:"C",h:"Scotland",a:"Brazil",d:"2026-06-24T18:00"},
  {id:52,g:"C",h:"Morocco",a:"Haiti",d:"2026-06-24T18:00"},
  {id:53,g:"A",h:"Czechia",a:"Mexico",d:"2026-06-24T21:00"},
  {id:54,g:"A",h:"South Africa",a:"South Korea",d:"2026-06-24T21:00"},
  {id:55,g:"E",h:"Curaçao",a:"Ivory Coast",d:"2026-06-25T16:00"},
  {id:56,g:"E",h:"Ecuador",a:"Germany",d:"2026-06-25T16:00"},
  {id:57,g:"F",h:"Japan",a:"Sweden",d:"2026-06-25T19:00"},
  {id:58,g:"F",h:"Tunisia",a:"Netherlands",d:"2026-06-25T19:00"},
  {id:59,g:"D",h:"Türkiye",a:"USA",d:"2026-06-25T22:00"},
  {id:60,g:"D",h:"Paraguay",a:"Australia",d:"2026-06-25T22:00"},
  {id:61,g:"I",h:"Norway",a:"France",d:"2026-06-26T15:00"},
  {id:62,g:"I",h:"Senegal",a:"Iraq",d:"2026-06-26T15:00"},
  {id:63,g:"H",h:"Cape Verde",a:"Saudi Arabia",d:"2026-06-26T20:00"},
  {id:64,g:"H",h:"Uruguay",a:"Spain",d:"2026-06-26T20:00"},
  {id:65,g:"G",h:"Egypt",a:"Iran",d:"2026-06-26T23:00"},
  {id:66,g:"G",h:"New Zealand",a:"Belgium",d:"2026-06-26T23:00"},
  {id:67,g:"L",h:"Panama",a:"England",d:"2026-06-27T17:00"},
  {id:68,g:"L",h:"Croatia",a:"Ghana",d:"2026-06-27T17:00"},
  {id:69,g:"K",h:"Colombia",a:"Portugal",d:"2026-06-27T19:30"},
  {id:70,g:"K",h:"DR Congo",a:"Uzbekistan",d:"2026-06-27T19:30"},
  {id:71,g:"J",h:"Algeria",a:"Austria",d:"2026-06-27T22:00"},
  {id:72,g:"J",h:"Jordan",a:"Argentina",d:"2026-06-27T22:00"},
];

function toBJ(etStr) {
  var p = etStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  var utcMs = Date.UTC(+p[1], +p[2]-1, +p[3], +p[4], +p[5]);
  return new Date(utcMs + 12 * 3600000);
}

(function () {
  var now = new Date();
  var apiKey = $persistentStore.get("wc2026_api_key") || "";

  // 获取当前进行中和最近结束的比赛
  var liveMatches = [];
  var recentFinished = [];
  var upcoming2h = [];

  for (var i = 0; i < MATCHES.length; i++) {
    var m = MATCHES[i];
    var bj = toBJ(m.d);
    var elapsed = now.getTime() - bj.getTime();
    var hh = String(bj.getHours()).padStart(2, "0");
    var mm = String(bj.getMinutes()).padStart(2, "0");

    // 比赛进行中 (开始后 2 小时内)
    if (elapsed > -5 * 60000 && elapsed < 2 * 3600000) {
      liveMatches.push({ m: m, time: hh + ":" + mm, ts: bj.getTime() });
    }
    // 最近 24 小时结束
    else if (elapsed > 0 && elapsed < 24 * 3600000) {
      recentFinished.push({ m: m, time: hh + ":" + mm, ts: bj.getTime() });
    }
    // 未来 2 小时
    else if (elapsed < 0 && elapsed > -2 * 3600000) {
      upcoming2h.push({ m: m, time: hh + ":" + mm, ts: bj.getTime(), minsUntil: Math.round(-elapsed / 60000) });
    }
  }

  if (apiKey) {
    var today = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0");
    var url = "https://api.football-data.org/v4/competitions/WC/matches?dateFrom=" + today + "&dateTo=" + today;
    $httpClient.get({ url: url, headers: { "X-Auth-Token": apiKey } }, function(error, response, data) {
      var apiData = null;
      if (!error && data) {
        try { apiData = JSON.parse(data); } catch(e) {}
      }
      renderLivePanel(liveMatches, recentFinished, upcoming2h, apiData);
    });
  } else {
    renderLivePanel(liveMatches, recentFinished, upcoming2h, null);
  }
})();

function renderLivePanel(live, finished, upcoming, apiData) {
  var lines = [];

  // 实时比分
  if (live.length > 0) {
    lines.push("🔴 实时比分");
    for (var i = 0; i < live.length; i++) {
      var m = live[i].m;
      var score = getApiScore(m, apiData);
      lines.push("  " + (FLAGS[m.h]||"🏳️") + (CN[m.h]||m.h) +
        " " + score + " " +
        (FLAGS[m.a]||"🏳️") + (CN[m.a]||m.a) +
        " [" + m.g + "组]");
    }
    lines.push("");
  }

  // 即将开始
  if (upcoming.length > 0) {
    lines.push("⏰ 即将开始");
    for (var i = 0; i < upcoming.length; i++) {
      var m = upcoming[i].m;
      lines.push("  " + upcoming[i].time + " " +
        (FLAGS[m.h]||"🏳️") + (CN[m.h]||m.h) + " vs " +
        (FLAGS[m.a]||"🏳️") + (CN[m.a]||m.a) +
        " (" + upcoming[i].minsUntil + "分钟后) [" + m.g + "组]");
    }
    lines.push("");
  }

  // 最近结束
  if (finished.length > 0) {
    lines.push("✅ 今日已结束");
    for (var i = 0; i < finished.length; i++) {
      var m = finished[i].m;
      var score = getApiScore(m, apiData);
      lines.push("  " + (FLAGS[m.h]||"🏳️") + (CN[m.h]||m.h) +
        " " + score + " " +
        (FLAGS[m.a]||"🏳️") + (CN[m.a]||m.a) +
        " [" + m.g + "组]");
    }
    lines.push("");
  }

  if (live.length === 0 && upcoming.length === 0 && finished.length === 0) {
    lines.push("⚽ 今日暂无进行中的比赛");
    // 找下一个比赛日
    var now = new Date();
    for (var i = 0; i < MATCHES.length; i++) {
      var bj = toBJ(MATCHES[i].d);
      if (bj > now) {
        var hh = String(bj.getHours()).padStart(2, "0");
        var mm = String(bj.getMinutes()).padStart(2, "0");
        var mon = bj.getMonth() + 1;
        var day = bj.getDate();
        lines.push("\n📅 下一场: " + mon + "/" + day + " " + hh + ":" + mm);
        lines.push("  " + (FLAGS[MATCHES[i].h]||"🏳️") + (CN[MATCHES[i].h]||MATCHES[i].h) +
          " vs " +
          (FLAGS[MATCHES[i].a]||"🏳️") + (CN[MATCHES[i].a]||MATCHES[i].a));
        break;
      }
    }
  }

  $done({
    title: "🔴 世界杯实时",
    content: lines.join("\n"),
  });
}

function getApiScore(m, apiData) {
  if (!apiData || !apiData.matches) return "vs";
  for (var i = 0; i < apiData.matches.length; i++) {
    var am = apiData.matches[i];
    if ((am.homeTeam.name === m.h || CN[am.homeTeam.name] === CN[m.h]) &&
        (am.awayTeam.name === m.a || CN[am.awayTeam.name] === CN[m.a])) {
      var hs = am.score.fullTime.home !== null ? am.score.fullTime.home :
               (am.score.halfTime.home !== null ? am.score.halfTime.home : "?");
      var as = am.score.fullTime.away !== null ? am.score.fullTime.away :
               (am.score.halfTime.away !== null ? am.score.halfTime.away : "?");
      var minStr = am.minute ? " " + am.minute + "'" : "";
      return hs + " - " + as + minStr;
    }
  }
  return "vs";
}
