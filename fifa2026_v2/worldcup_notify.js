/**
 * 2026 FIFA 世界杯 - 定时通知 v4
 * Surge type=cron | API模式: 赛前30分钟 + 赛后比分+进球详情 | 时区修复+API错误处理
 */
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

var API_MAP = {
  "Korea Republic":"South Korea","Bosnia-Herzegovina":"Bosnia",
  "Cape Verde Islands":"Cape Verde","United States":"USA",
  "United States of America":"USA","Turkey":"Turkiye",
  "Congo DR":"DR Congo","Curaçao":"Curacao",
  "Bosnia-H.":"Bosnia","Czech Republic":"Czechia"
};
function norm(n) { return API_MAP[n] || n; }

var FLAGS = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Bosnia":"🇧🇦","Qatar":"🇶🇦","Switzerland":"[CH]",
  "USA":"🇺🇸","Paraguay":"🇵🇾","Brazil":"🇧🇷","Morocco":"🇲🇦",
  "Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Australia":"🇦🇺","Turkiye":"🇹🇷",
  "Germany":"🇩🇪","Curacao":"🇨🇼","Netherlands":"🇳🇱","Japan":"🇯🇵",
  "Ivory Coast":"🇨🇮","Ecuador":"🇪🇨","Sweden":"🇸🇪","Tunisia":"🇹🇳",
  "Spain":"🇪🇸","Cape Verde":"🇨🇻","Belgium":"🇧🇪","Egypt":"🇪🇬",
  "Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","Iran":"🇮🇷","New Zealand":"🇳🇿",
  "France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴",
  "Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹","Jordan":"🇯🇴",
  "Portugal":"🇵🇹","DR Congo":"🇨🇩","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷",
  "Ghana":"🇬🇭","Panama":"🇵🇦","Uzbekistan":"🇺🇿","Colombia":"🇨🇴"
};
var CN = {
  "Mexico":"墨西哥","South Africa":"南非","South Korea":"韩国","Czechia":"捷克",
  "Canada":"加拿大","Bosnia":"波黑","Qatar":"卡塔尔","Switzerland":"瑞士",
  "USA":"美国","Paraguay":"巴拉圭","Brazil":"巴西","Morocco":"摩洛哥",
  "Haiti":"海地","Scotland":"苏格兰","Australia":"澳大利亚","Turkiye":"土耳其",
  "Germany":"德国","Curacao":"库拉索","Netherlands":"荷兰","Japan":"日本",
  "Ivory Coast":"科特迪瓦","Ecuador":"厄瓜多尔","Sweden":"瑞典","Tunisia":"突尼斯",
  "Spain":"西班牙","Cape Verde":"佛得角","Belgium":"比利时","Egypt":"埃及",
  "Saudi Arabia":"沙特","Uruguay":"乌拉圭","Iran":"伊朗","New Zealand":"新西兰",
  "France":"法国","Senegal":"塞内加尔","Iraq":"伊拉克","Norway":"挪威",
  "Argentina":"阿根廷","Algeria":"阿尔及利亚","Austria":"奥地利","Jordan":"约旦",
  "Portugal":"葡萄牙","DR Congo":"刚果民主","England":"英格兰","Croatia":"克罗地亚",
  "Ghana":"加纳","Panama":"巴拿马","Uzbekistan":"乌兹别克","Colombia":"哥伦比亚"
};

// 全部72场小组赛（北京时间）
var MATCHES = [
  {id:1,g:"A",h:"Mexico",a:"South Africa",d:"2026-06-12T03:00"},{id:2,g:"A",h:"South Korea",a:"Czechia",d:"2026-06-12T09:00"},
  {id:3,g:"B",h:"Canada",a:"Bosnia",d:"2026-06-13T03:00"},{id:4,g:"D",h:"USA",a:"Paraguay",d:"2026-06-13T09:00"},
  {id:5,g:"D",h:"Australia",a:"Turkiye",d:"2026-06-14T00:00"},{id:6,g:"B",h:"Qatar",a:"Switzerland",d:"2026-06-14T03:00"},
  {id:7,g:"C",h:"Brazil",a:"Morocco",d:"2026-06-14T06:00"},{id:8,g:"C",h:"Haiti",a:"Scotland",d:"2026-06-14T09:00"},
  {id:9,g:"E",h:"Germany",a:"Curacao",d:"2026-06-15T01:00"},{id:10,g:"F",h:"Netherlands",a:"Japan",d:"2026-06-15T04:00"},
  {id:11,g:"E",h:"Ivory Coast",a:"Ecuador",d:"2026-06-15T07:00"},{id:12,g:"F",h:"Sweden",a:"Tunisia",d:"2026-06-15T10:00"},
  {id:13,g:"H",h:"Spain",a:"Cape Verde",d:"2026-06-16T00:00"},{id:14,g:"G",h:"Belgium",a:"Egypt",d:"2026-06-16T03:00"},
  {id:15,g:"H",h:"Saudi Arabia",a:"Uruguay",d:"2026-06-16T06:00"},{id:16,g:"G",h:"Iran",a:"New Zealand",d:"2026-06-16T09:00"},
  {id:17,g:"I",h:"France",a:"Senegal",d:"2026-06-17T03:00"},{id:18,g:"I",h:"Iraq",a:"Norway",d:"2026-06-17T06:00"},
  {id:19,g:"J",h:"Argentina",a:"Algeria",d:"2026-06-17T09:00"},{id:20,g:"J",h:"Austria",a:"Jordan",d:"2026-06-17T12:00"},
  {id:21,g:"K",h:"Portugal",a:"DR Congo",d:"2026-06-18T01:00"},{id:22,g:"L",h:"England",a:"Croatia",d:"2026-06-18T04:00"},
  {id:23,g:"L",h:"Ghana",a:"Panama",d:"2026-06-18T07:00"},{id:24,g:"K",h:"Uzbekistan",a:"Colombia",d:"2026-06-18T10:00"},
  {id:25,g:"A",h:"Czechia",a:"South Africa",d:"2026-06-19T00:00"},{id:26,g:"B",h:"Switzerland",a:"Bosnia",d:"2026-06-19T03:00"},
  {id:27,g:"B",h:"Canada",a:"Qatar",d:"2026-06-19T06:00"},{id:28,g:"A",h:"Mexico",a:"South Korea",d:"2026-06-19T09:00"},
  {id:29,g:"D",h:"USA",a:"Australia",d:"2026-06-20T03:00"},{id:30,g:"C",h:"Scotland",a:"Morocco",d:"2026-06-20T06:00"},
  {id:31,g:"C",h:"Brazil",a:"Haiti",d:"2026-06-20T08:30"},{id:32,g:"D",h:"Turkiye",a:"Paraguay",d:"2026-06-20T11:00"},
  {id:33,g:"F",h:"Netherlands",a:"Sweden",d:"2026-06-21T01:00"},{id:34,g:"E",h:"Germany",a:"Ivory Coast",d:"2026-06-21T04:00"},
  {id:35,g:"E",h:"Ecuador",a:"Curacao",d:"2026-06-21T08:00"},{id:36,g:"F",h:"Tunisia",a:"Japan",d:"2026-06-21T12:00"},
  {id:37,g:"H",h:"Spain",a:"Saudi Arabia",d:"2026-06-22T00:00"},{id:38,g:"G",h:"Belgium",a:"Iran",d:"2026-06-22T03:00"},
  {id:39,g:"H",h:"Uruguay",a:"Cape Verde",d:"2026-06-22T06:00"},{id:40,g:"G",h:"New Zealand",a:"Egypt",d:"2026-06-22T09:00"},
  {id:41,g:"J",h:"Argentina",a:"Austria",d:"2026-06-23T01:00"},{id:42,g:"I",h:"France",a:"Iraq",d:"2026-06-23T05:00"},
  {id:43,g:"I",h:"Norway",a:"Senegal",d:"2026-06-23T08:00"},{id:44,g:"J",h:"Jordan",a:"Algeria",d:"2026-06-23T11:00"},
  {id:45,g:"K",h:"Portugal",a:"Uzbekistan",d:"2026-06-25T01:00"},{id:46,g:"L",h:"England",a:"Ghana",d:"2026-06-25T04:00"},
  {id:47,g:"L",h:"Panama",a:"Croatia",d:"2026-06-25T07:00"},{id:48,g:"A",h:"Czechia",a:"Mexico",d:"2026-06-25T09:00"},
  {id:49,g:"A",h:"South Africa",a:"South Korea",d:"2026-06-25T09:00"},{id:50,g:"K",h:"Colombia",a:"DR Congo",d:"2026-06-25T10:00"},
  {id:51,g:"B",h:"Switzerland",a:"Canada",d:"2026-06-26T03:00"},{id:52,g:"B",h:"Bosnia",a:"Qatar",d:"2026-06-26T03:00"},
  {id:53,g:"C",h:"Scotland",a:"Brazil",d:"2026-06-26T06:00"},{id:54,g:"C",h:"Morocco",a:"Haiti",d:"2026-06-26T06:00"},
  {id:55,g:"E",h:"Curacao",a:"Ivory Coast",d:"2026-06-27T04:00"},{id:56,g:"E",h:"Ecuador",a:"Germany",d:"2026-06-27T04:00"},
  {id:57,g:"F",h:"Japan",a:"Sweden",d:"2026-06-27T07:00"},{id:58,g:"F",h:"Tunisia",a:"Netherlands",d:"2026-06-27T07:00"},
  {id:59,g:"D",h:"Turkiye",a:"USA",d:"2026-06-27T10:00"},{id:60,g:"D",h:"Paraguay",a:"Australia",d:"2026-06-27T10:00"},
  {id:61,g:"I",h:"Norway",a:"France",d:"2026-06-28T03:00"},{id:62,g:"I",h:"Senegal",a:"Iraq",d:"2026-06-28T03:00"},
  {id:63,g:"H",h:"Cape Verde",a:"Saudi Arabia",d:"2026-06-28T08:00"},{id:64,g:"H",h:"Uruguay",a:"Spain",d:"2026-06-28T08:00"},
  {id:65,g:"G",h:"Egypt",a:"Iran",d:"2026-06-28T11:00"},{id:66,g:"G",h:"New Zealand",a:"Belgium",d:"2026-06-28T11:00"},
  {id:67,g:"L",h:"Panama",a:"England",d:"2026-06-29T05:00"},{id:68,g:"L",h:"Croatia",a:"Ghana",d:"2026-06-29T05:00"},
  {id:69,g:"K",h:"Colombia",a:"Portugal",d:"2026-06-29T07:30"},{id:70,g:"K",h:"DR Congo",a:"Uzbekistan",d:"2026-06-29T07:30"},
  {id:71,g:"J",h:"Algeria",a:"Austria",d:"2026-06-29T10:00"},{id:72,g:"J",h:"Jordan",a:"Argentina",d:"2026-06-29T10:00"}
];

function parseBJ(s) {
  var p = s.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return new Date(Date.UTC(+p[1],+p[2]-1,+p[3],+p[4],+p[5]) - 8*3600000);
}
function parseUtc(s) {
  var p = s.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!p) return new Date(0);
  return new Date(Date.UTC(+p[1],+p[2]-1,+p[3],+p[4],+p[5]));
}
function getBJNow() {
  return new Date(Date.now() + 8*3600000);
}
function fmtBJ(d) {
  return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0");
}
function fmtTime(s) { return s.substring(11,16); }
function displayName(eng) { return (FLAGS[eng]||"🏳️")+" "+(CN[eng]||eng); }

// ===== 通知去重 =====
var notified = {};
try { notified = JSON.parse($persistentStore.read("wc2026v3_notified") || "{}"); } catch(e) { notified = {}; }
function markNotified(key) { notified[key] = Date.now(); $persistentStore.write(JSON.stringify(notified), "wc2026v3_notified"); }
function isNotified(key) { return notified[key] !== undefined; }
var cutoff = Date.now() - 7*86400000;
var nKeys = Object.keys(notified);
for (var ci = 0; ci < nKeys.length; ci++) { if (notified[nKeys[ci]] < cutoff) delete notified[nKeys[ci]]; }
if (nKeys.length > 0) $persistentStore.write(JSON.stringify(notified), "wc2026v3_notified");

// ===== 主逻辑 =====
var now = getBJNow();
var todayS = fmtBJ(now);

// API Key 校验
if (!apiKey || apiKey.length < 10) {
  // 每6小时提醒一次 Key 缺失
  var missingKey = "apikey_missing";
  if (!isNotified(missingKey)) {
    $notification.post("⚽ 世界杯通知", "未配置 API Key", "请在 Surge 模块设置中填入 football-data.org API Key，当前使用静态模式");
    markNotified(missingKey);
  }
  runStatic();
  $done();
} else {
  var yestS = fmtBJ(new Date(now.getTime() - 86400000));
  var tmrwS = fmtBJ(new Date(now.getTime() + 86400000));
  $httpClient.get({
    url: "https://api.football-data.org/v4/competitions/WC/matches?dateFrom="+yestS+"&dateTo="+tmrwS,
    headers: {"X-Auth-Token": apiKey}
  }, function(error, response, data) {
    if (error || !data) { runStatic(); $done(); return; }

    // 检查 HTTP 状态码
    var status = response.statusCode || 0;
    if (status === 429) {
      // 限速：静默降级，不打扰用户
      runStatic(); $done(); return;
    }
    if (status === 403 || status === 401) {
      // Key 无效或过期：每12小时提醒一次
      var badKey = "apikey_invalid";
      if (!isNotified(badKey)) {
        $notification.post("⚽ 世界杯通知", "API Key 无效或已过期", "HTTP "+status+" — 请检查 football-data.org API Key 设置");
        markNotified(badKey);
      }
      runStatic(); $done(); return;
    }
    if (status !== 200) {
      runStatic(); $done(); return;
    }

    try {
      var json = JSON.parse(data);
      if (!json.matches || json.matches.length === 0) { runStatic(); $done(); return; }
      processApiMatches(json.matches);
    } catch(e) { runStatic(); }
    $done();
  });
}

// ===== API 模式 =====
function processApiMatches(matches) {
  var hour = now.getUTCHours();
  var todayKey = "daily_" + todayS;

  // 过滤今天北京时间的比赛
  var todayMatches = [];
  for (var i = 0; i < matches.length; i++) {
    var bjD = new Date(parseUtc(matches[i].utcDate).getTime() + 8*3600000);
    if (fmtBJ(bjD) === todayS) todayMatches.push(matches[i]);
  }

  // 1. 每日8点赛程摘要
  if (hour === 8 && now.getUTCMinutes() < 10 && !isNotified(todayKey)) {
    if (todayMatches.length > 0) {
      var lines = [];
      for (var i = 0; i < todayMatches.length; i++) {
        var m = todayMatches[i];
        var bjD = new Date(parseUtc(m.utcDate).getTime() + 8*3600000);
        var hh = String(bjD.getUTCHours()).padStart(2,"0")+":"+String(bjD.getUTCMinutes()).padStart(2,"0");
        var ht = norm(m.homeTeam.name), at = norm(m.awayTeam.name);
        var grp = (m.group||"").replace("GROUP_","");
        lines.push("["+grp+"组] "+hh+" "+displayName(ht)+" vs "+displayName(at));
      }
      $notification.post("⚽ 今日赛程", "今日 "+todayMatches.length+" 场", lines.join("\n"));
    } else {
      $notification.post("⚽ 世界杯日报", "今日无比赛", "小组赛 6/12-6/29 | 决赛 7/20");
    }
    markNotified(todayKey);
    return;
  }

  // 2. 赛前30分钟提醒
  for (var i = 0; i < todayMatches.length; i++) {
    var m = todayMatches[i];
    var bjD = new Date(parseUtc(m.utcDate).getTime() + 8*3600000);
    var diffMin = (bjD.getTime() - now.getTime()) / 60000;
    if (diffMin > 0 && diffMin <= remindBefore && diffMin > (remindBefore - 10)) {
      var preKey = m.id + "_pre";
      if (!isNotified(preKey)) {
        var ht = norm(m.homeTeam.name), at = norm(m.awayTeam.name);
        var grp = (m.group||"").replace("GROUP_","");
        var hh = String(bjD.getUTCHours()).padStart(2,"0")+":"+String(bjD.getUTCMinutes()).padStart(2,"0");
        $notification.post(
          "⚽ 即将开赛 | "+grp+"组",
          displayName(ht)+" vs "+displayName(at),
          "⏰ "+hh+" 开球 | 约"+Math.round(diffMin)+"分钟后"
        );
        markNotified(preKey);
      }
    }
  }

  // 3. 赛后比分+进球详情通知
  for (var i = 0; i < matches.length; i++) {
    var m = matches[i];
    if (m.status !== "FINISHED") continue;
    var mid = "api_" + m.id;
    if (isNotified(mid)) continue;
    var ht = norm(m.homeTeam.name), at = norm(m.awayTeam.name);
    var hs = m.score.fullTime.home, as = m.score.fullTime.away;
    var grp = (m.group||"").replace("GROUP_","");
    // 进球详情（API可能不返回goals字段）
    var goalInfo = "";
    if (m.goals && m.goals.length > 0) {
      var gs = [];
      for (var g = 0; g < Math.min(m.goals.length, 8); g++) {
        if (m.goals[g].scorer && m.goals[g].minute) {
          gs.push(m.goals[g].scorer.name + " " + m.goals[g].minute + "'");
        }
      }
      if (gs.length > 0) goalInfo = "\n⚽ " + gs.join(" | ");
    }
    $notification.post(
      "⚽ 比赛结束 | "+grp+"组",
      displayName(ht)+" "+hs+" - "+as+" "+displayName(at),
      "全场比分"+goalInfo
    );
    markNotified(mid);
  }
}

// ===== 静态模式 =====
function runStatic() {
  var hour = now.getUTCHours();
  var todayKey = "daily_" + todayS;

  var todayMatches = [];
  for (var i = 0; i < MATCHES.length; i++) {
    if (MATCHES[i].d.substring(0,10) === todayS) todayMatches.push(MATCHES[i]);
  }

  if (hour === 8 && now.getUTCMinutes() < 10 && !isNotified(todayKey)) {
    if (todayMatches.length > 0) {
      var lines = [];
      for (var i = 0; i < todayMatches.length; i++) {
        var m = todayMatches[i];
        lines.push("["+m.g+"组] "+fmtTime(m.d)+" "+displayName(m.h)+" vs "+displayName(m.a));
      }
      $notification.post("⚽ 今日赛程", "今日 "+todayMatches.length+" 场", lines.join("\n"));
    } else {
      $notification.post("⚽ 世界杯日报", "今日无比赛", "小组赛 6/12-6/29 | 决赛 7/20");
    }
    markNotified(todayKey);
    return;
  }

  for (var i = 0; i < MATCHES.length; i++) {
    var m = MATCHES[i];
    var matchMs = parseBJ(m.d).getTime();
    var diffMin = (matchMs - now.getTime()) / 60000;
    if (diffMin > 0 && diffMin <= remindBefore && diffMin > (remindBefore - 10)) {
      var preKey = m.id + "_pre";
      if (!isNotified(preKey)) {
        $notification.post(
          "⚽ 即将开赛 | "+m.g+"组",
          displayName(m.h)+" vs "+displayName(m.a),
          "⏰ "+fmtTime(m.d)+" 开球 | 约"+Math.round(diffMin)+"分钟后"
        );
        markNotified(preKey);
      }
    }
  }

  for (var i = 0; i < MATCHES.length; i++) {
    var m = MATCHES[i];
    var elapsed = now.getTime() - parseBJ(m.d).getTime();
    if (elapsed > 2*3600000 && elapsed < 2.5*3600000) {
      var endKey = m.id + "_ended";
      if (!isNotified(endKey)) {
        $notification.post(
          "⚽ 比赛已结束 | "+m.g+"组",
          displayName(m.h)+" vs "+displayName(m.a),
          "配置 API Key 可查看比分和进球详情"
        );
        markNotified(endKey);
      }
    }
  }
}
