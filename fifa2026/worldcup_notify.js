/**
 * 2026 FIFA 世界杯 - 定时通知脚本
 * Surge type=cron 脚本
 * 功能：赛前30分钟提醒 + 赛果推送 + 每日8点赛程摘要
 */

// ===== 参数解析 =====
var apiKey = "";
var remindBefore = 30;
if (typeof $argument !== "undefined" && $argument) {
  var _a = $argument.split("&");
  for (var _i = 0; _i < _a.length; _i++) {
    var _kv = _a[_i].split("=");
    if (_kv[0] === "api_key") apiKey = decodeURIComponent(_kv[1] || "");
    if (_kv[0] === "remind_before") remindBefore = parseInt(decodeURIComponent(_kv[1] || "30"));
  }
}

var API_MAP = {"Korea Republic":"South Korea","Bosnia-Herzegovina":"Bosnia & Herzegovina","Cape Verde Islands":"Cape Verde"};
function norm(n) { return API_MAP[n] || n; }

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

// 静态赛程备用（当 API 不可用时）
var MATCHES = [
  {id:1,g:"A",h:"Mexico",a:"South Africa",d:"2026-06-11T15:00"},{id:2,g:"A",h:"South Korea",a:"Czechia",d:"2026-06-11T22:00"},
  {id:3,g:"B",h:"Canada",a:"Bosnia & Herzegovina",d:"2026-06-12T15:00"},{id:4,g:"D",h:"USA",a:"Paraguay",d:"2026-06-12T21:00"},
  {id:5,g:"B",h:"Qatar",a:"Switzerland",d:"2026-06-13T15:00"},{id:6,g:"C",h:"Brazil",a:"Morocco",d:"2026-06-13T18:00"},
  {id:7,g:"C",h:"Haiti",a:"Scotland",d:"2026-06-13T21:00"},{id:8,g:"D",h:"Australia",a:"Türkiye",d:"2026-06-14T00:00"},
  {id:9,g:"E",h:"Germany",a:"Curaçao",d:"2026-06-14T13:00"},{id:10,g:"F",h:"Netherlands",a:"Japan",d:"2026-06-14T16:00"},
  {id:11,g:"E",h:"Ivory Coast",a:"Ecuador",d:"2026-06-14T19:00"},{id:12,g:"F",h:"Sweden",a:"Tunisia",d:"2026-06-14T22:00"},
  {id:13,g:"H",h:"Spain",a:"Cape Verde",d:"2026-06-15T12:00"},{id:14,g:"G",h:"Belgium",a:"Egypt",d:"2026-06-15T15:00"},
  {id:15,g:"H",h:"Saudi Arabia",a:"Uruguay",d:"2026-06-15T18:00"},{id:16,g:"G",h:"Iran",a:"New Zealand",d:"2026-06-15T21:00"},
  {id:17,g:"I",h:"France",a:"Senegal",d:"2026-06-16T15:00"},{id:18,g:"I",h:"Iraq",a:"Norway",d:"2026-06-16T18:00"},
  {id:19,g:"J",h:"Argentina",a:"Algeria",d:"2026-06-16T21:00"},{id:20,g:"J",h:"Austria",a:"Jordan",d:"2026-06-17T00:00"},
  {id:21,g:"K",h:"Portugal",a:"DR Congo",d:"2026-06-17T13:00"},{id:22,g:"L",h:"England",a:"Croatia",d:"2026-06-17T16:00"},
  {id:23,g:"L",h:"Ghana",a:"Panama",d:"2026-06-17T19:00"},{id:24,g:"K",h:"Uzbekistan",a:"Colombia",d:"2026-06-17T22:00"},
  {id:25,g:"A",h:"Czechia",a:"South Africa",d:"2026-06-18T12:00"},{id:26,g:"B",h:"Switzerland",a:"Bosnia & Herzegovina",d:"2026-06-18T15:00"},
  {id:27,g:"B",h:"Canada",a:"Qatar",d:"2026-06-18T18:00"},{id:28,g:"A",h:"Mexico",a:"South Korea",d:"2026-06-18T21:00"},
  {id:29,g:"D",h:"USA",a:"Australia",d:"2026-06-19T15:00"},{id:30,g:"C",h:"Scotland",a:"Morocco",d:"2026-06-19T18:00"},
  {id:31,g:"C",h:"Brazil",a:"Haiti",d:"2026-06-19T20:30"},{id:32,g:"D",h:"Türkiye",a:"Paraguay",d:"2026-06-19T23:00"},
  {id:33,g:"F",h:"Netherlands",a:"Sweden",d:"2026-06-20T13:00"},{id:34,g:"E",h:"Germany",a:"Ivory Coast",d:"2026-06-20T16:00"},
  {id:35,g:"E",h:"Ecuador",a:"Curaçao",d:"2026-06-20T20:00"},{id:36,g:"F",h:"Tunisia",a:"Japan",d:"2026-06-21T00:00"},
  {id:37,g:"H",h:"Spain",a:"Saudi Arabia",d:"2026-06-21T12:00"},{id:38,g:"G",h:"Belgium",a:"Iran",d:"2026-06-21T15:00"},
  {id:39,g:"H",h:"Uruguay",a:"Cape Verde",d:"2026-06-21T18:00"},{id:40,g:"G",h:"New Zealand",a:"Egypt",d:"2026-06-21T21:00"},
  {id:41,g:"J",h:"Argentina",a:"Austria",d:"2026-06-22T13:00"},{id:42,g:"I",h:"France",a:"Iraq",d:"2026-06-22T17:00"},
  {id:43,g:"I",h:"Norway",a:"Senegal",d:"2026-06-22T20:00"},{id:44,g:"J",h:"Jordan",a:"Algeria",d:"2026-06-22T23:00"},
  {id:45,g:"K",h:"Portugal",a:"Uzbekistan",d:"2026-06-23T13:00"},{id:46,g:"L",h:"England",a:"Ghana",d:"2026-06-23T16:00"},
  {id:47,g:"L",h:"Panama",a:"Croatia",d:"2026-06-23T19:00"},{id:48,g:"K",h:"Colombia",a:"DR Congo",d:"2026-06-23T22:00"},
  {id:49,g:"B",h:"Switzerland",a:"Canada",d:"2026-06-24T15:00"},{id:50,g:"B",h:"Bosnia & Herzegovina",a:"Qatar",d:"2026-06-24T15:00"},
  {id:51,g:"C",h:"Scotland",a:"Brazil",d:"2026-06-24T18:00"},{id:52,g:"C",h:"Morocco",a:"Haiti",d:"2026-06-24T18:00"},
  {id:53,g:"A",h:"Czechia",a:"Mexico",d:"2026-06-24T21:00"},{id:54,g:"A",h:"South Africa",a:"South Korea",d:"2026-06-24T21:00"},
  {id:55,g:"E",h:"Curaçao",a:"Ivory Coast",d:"2026-06-25T16:00"},{id:56,g:"E",h:"Ecuador",a:"Germany",d:"2026-06-25T16:00"},
  {id:57,g:"F",h:"Japan",a:"Sweden",d:"2026-06-25T19:00"},{id:58,g:"F",h:"Tunisia",a:"Netherlands",d:"2026-06-25T19:00"},
  {id:59,g:"D",h:"Türkiye",a:"USA",d:"2026-06-25T22:00"},{id:60,g:"D",h:"Paraguay",a:"Australia",d:"2026-06-25T22:00"},
  {id:61,g:"I",h:"Norway",a:"France",d:"2026-06-26T15:00"},{id:62,g:"I",h:"Senegal",a:"Iraq",d:"2026-06-26T15:00"},
  {id:63,g:"H",h:"Cape Verde",a:"Saudi Arabia",d:"2026-06-26T20:00"},{id:64,g:"H",h:"Uruguay",a:"Spain",d:"2026-06-26T20:00"},
  {id:65,g:"G",h:"Egypt",a:"Iran",d:"2026-06-26T23:00"},{id:66,g:"G",h:"New Zealand",a:"Belgium",d:"2026-06-26T23:00"},
  {id:67,g:"L",h:"Panama",a:"England",d:"2026-06-27T17:00"},{id:68,g:"L",h:"Croatia",a:"Ghana",d:"2026-06-27T17:00"},
  {id:69,g:"K",h:"Colombia",a:"Portugal",d:"2026-06-27T19:30"},{id:70,g:"K",h:"DR Congo",a:"Uzbekistan",d:"2026-06-27T19:30"},
  {id:71,g:"J",h:"Algeria",a:"Austria",d:"2026-06-27T22:00"},{id:72,g:"J",h:"Jordan",a:"Argentina",d:"2026-06-27T22:00"},
];

function toBJ(etStr) {
  var p = etStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return new Date(Date.UTC(+p[1], +p[2]-1, +p[3], +p[4], +p[5]) + 12 * 3600000);
}

// UTC -> 北京时间
function bjTime(utcStr) {
  return new Date(new Date(utcStr).getTime() + 8 * 3600000);
}

// 格式化时间为 HH:mm
function fmt(bj) {
  return String(bj.getHours()).padStart(2,"0") + ":" + String(bj.getMinutes()).padStart(2,"0");
}

// 格式化日期为 YYYY-MM-DD
function ds(d) {
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

// 显示名称
function displayName(engName) {
  return (FLAGS[engName]||"🏳️") + " " + (CN[engName]||engName);
}

// ===== 通知去重 =====
var notified = {};
try { notified = JSON.parse($persistentStore.read("wc2026_notified") || "{}"); } catch(e) { notified = {}; }

function markNotified(key) {
  notified[key] = Date.now();
  $persistentStore.write(JSON.stringify(notified), "wc2026_notified");
}

function isNotified(key) {
  return notified[key] !== undefined;
}

// 清理过期通知记录（超过7天的自动清理）
var cutoff = Date.now() - 7 * 86400000;
var keys = Object.keys(notified);
for (var ci = 0; ci < keys.length; ci++) {
  if (notified[keys[ci]] < cutoff) delete notified[keys[ci]];
}
if (keys.length > 0) $persistentStore.write(JSON.stringify(notified), "wc2026_notified");

// ===== 主逻辑 =====
var now = new Date(Date.now() + (480 + new Date().getTimezoneOffset()) * 60000);

if (apiKey) {
  // ===== API 模式：从 API 获取今天+明天数据，统一处理 =====
  var todayS = ds(now);
  var tmrw = new Date(now.getTime() + 86400000);
  var tmrwS = ds(tmrw);

  $httpClient.get({
    url: "https://api.football-data.org/v4/competitions/WC/matches?dateFrom=" + todayS + "&dateTo=" + tmrwS,
    headers: { "X-Auth-Token": apiKey }
  }, function(error, response, data) {
    if (error || !data) { runStatic(); $done(); return; }
    try {
      var json = JSON.parse(data);
      if (!json.matches || json.matches.length === 0) { runStatic(); $done(); return; }
      processApiMatches(json.matches, todayS);
    } catch(e) {
      runStatic();
    }
    $done();
  });
} else {
  runStatic();
  $done();
}

function processApiMatches(matches, todayS) {
  var hour = now.getHours();
  var todayKey = "daily_" + now.toDateString();

  // 分今天的比赛
  var todayMatches = [], tmrwMatches = [];
  for (var i = 0; i < matches.length; i++) {
    var m = matches[i];
    var bj = bjTime(m.utcDate);
    var d = ds(bj);
    if (d === todayS) todayMatches.push(m);
    else tmrwMatches.push(m);
  }

  // 1. 每日早8点赛程摘要
  if (hour === 8 && now.getMinutes() < 10 && !isNotified(todayKey)) {
    if (todayMatches.length > 0) {
      var lines = [];
      for (var i = 0; i < todayMatches.length; i++) {
        var m = todayMatches[i];
        var bj = bjTime(m.utcDate);
        var ht = norm(m.homeTeam.name), at = norm(m.awayTeam.name);
        var grp = (m.group||"").replace("GROUP_","");
        lines.push(fmt(bj) + " " + displayName(ht) + " vs " + displayName(at) + " [" + grp + "]");
      }
      $notification.post(
        "今日赛程",
        "今日共 " + todayMatches.length + " 场比赛",
        lines.join("\n")
      );
    } else {
      $notification.post("世界杯日报", "今日无比赛安排", "小组赛: 6/12-6/28 | 决赛: 7/20 03:00");
    }
    markNotified(todayKey);
    return;
  }

  // 2. 赛前提醒
  for (var i = 0; i < todayMatches.length; i++) {
    var m = todayMatches[i];
    var bj = bjTime(m.utcDate);
    var diffMs = bj.getTime() - now.getTime();
    var diffMin = diffMs / 60000;

    if (diffMin > 0 && diffMin <= remindBefore && diffMin > (remindBefore - 10)) {
      var preKey = m.id + "_pre";
      if (!isNotified(preKey)) {
        var ht = norm(m.homeTeam.name), at = norm(m.awayTeam.name);
        var grp = (m.group||"").replace("GROUP_","");
        $notification.post(
          "比赛即将开始",
          displayName(ht) + " vs " + displayName(at),
          "⏰ " + fmt(bj) + " 开球 | " + grp + "组 | 约" + Math.round(diffMin) + "分钟后"
        );
        markNotified(preKey);
      }
    }
  }

  // 3. 赛果推送
  for (var i = 0; i < matches.length; i++) {
    var m = matches[i];
    if (m.status !== "FINISHED") continue;
    var mid = "api_" + m.id;
    if (isNotified(mid)) continue;

    var ht = norm(m.homeTeam.name), at = norm(m.awayTeam.name);
    var hScore = m.score.fullTime.home;
    var aScore = m.score.fullTime.away;
    var grp = (m.group||"").replace("GROUP_","");

    var goalInfo = "";
    if (m.goals && m.goals.length > 0) {
      var gs = [];
      for (var g = 0; g < Math.min(m.goals.length, 6); g++) {
        gs.push(m.goals[g].scorer.name + " " + m.goals[g].minute + "'");
      }
      goalInfo = "\n进球: " + gs.join(", ");
    }

    $notification.post(
      "比赛结束 | " + grp + "组",
      displayName(ht) + " " + hScore + "-" + aScore + " " + displayName(at),
      "全场比分已出" + goalInfo
    );
    markNotified(mid);
  }
}

// ===== 无 API 时的备用逻辑 =====
function runStatic() {
  var hour = now.getHours();
  var todayKey = "daily_" + now.toDateString();

  // 每日早8点赛程摘要
  if (hour === 8 && now.getMinutes() < 10 && !isNotified(todayKey)) {
    var todayStr = ds(now);
    var todayMatches = [];
    for (var i = 0; i < MATCHES.length; i++) {
      var bj = toBJ(MATCHES[i].d);
      if (ds(bj) === todayStr) {
        todayMatches.push(MATCHES[i]);
      }
    }
    if (todayMatches.length > 0) {
      var lines = [];
      for (var i = 0; i < todayMatches.length; i++) {
        var m = todayMatches[i];
        var bj = toBJ(m.d);
        lines.push(fmt(bj) + " " + displayName(m.h) + " vs " + displayName(m.a) + " [" + m.g + "]");
      }
      $notification.post("今日赛程", "今日共 " + todayMatches.length + " 场比赛", lines.join("\n"));
    } else {
      $notification.post("世界杯日报", "今日无比赛安排", "小组赛: 6/12-6/28 | 决赛: 7/20 03:00");
    }
    markNotified(todayKey);
    return;
  }

  // 赛前提醒
  for (var i = 0; i < MATCHES.length; i++) {
    var m = MATCHES[i];
    var bjTime2 = toBJ(m.d);
    var diffMs = bjTime2.getTime() - now.getTime();
    var diffMin = diffMs / 60000;

    if (diffMin > 0 && diffMin <= remindBefore && diffMin > (remindBefore - 10)) {
      var preKey = m.id + "_pre";
      if (!isNotified(preKey)) {
        var grp = m.g;
        $notification.post(
          "比赛即将开始",
          displayName(m.h) + " vs " + displayName(m.a),
          "⏰ " + fmt(bjTime2) + " 开球 | " + grp + "组 | 约" + Math.round(diffMin) + "分钟后"
        );
        markNotified(preKey);
      }
    }
  }

  // 赛果（无 API 时按时间估算）
  for (var i = 0; i < MATCHES.length; i++) {
    var m = MATCHES[i];
    var elapsed = now.getTime() - toBJ(m.d).getTime();
    if (elapsed > 2 * 3600000 && elapsed < 2.5 * 3600000) {
      var endKey = m.id + "_ended";
      if (!isNotified(endKey)) {
        $notification.post(
          "比赛已结束",
          displayName(m.h) + " vs " + displayName(m.a),
          m.g + "组比赛已结束 | 配置 API Key 可查看比分"
        );
        markNotified(endKey);
      }
    }
  }
}
