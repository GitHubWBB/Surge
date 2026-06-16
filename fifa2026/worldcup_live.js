/**
 * ⚽世界杯·实时比分
 * Surge type=generic | 只显示当天：进行中/即将开始/已结束
 */
var apiKey = "";
if (typeof $argument !== "undefined" && $argument) {
  var _a = $argument.split("&");
  for (var _i = 0; _i < _a.length; _i++) {
    var _kv = _a[_i].split("=");
    if (_kv[0] === "api_key") apiKey = decodeURIComponent(_kv[1] || "");
  }
}
var API_MAP = {"Korea Republic":"South Korea","Bosnia-Herzegovina":"Bosnia & Herzegovina","Cape Verde Islands":"Cape Verde","United States":"USA","United States of America":"USA"};
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

// 获取北京时间当前日期
var now = new Date();
if (now.getUTCHours() + 8 - now.getHours() !== 0 && now.getUTCHours() + 8 - now.getHours() !== 24 && now.getUTCHours() + 8 - now.getHours() !== -16) {
  now = new Date(Date.now() + 8*3600000);
}
// todayBJ = 北京今天, tmrwBJ = 北京明天
var todayBJ = now.getUTCFullYear()+"-"+String(now.getUTCMonth()+1).padStart(2,"0")+"-"+String(now.getUTCDate()).padStart(2,"0");
var tmrwBJ = new Date(now.getTime()+86400000);
var tmrwS = tmrwBJ.getUTCFullYear()+"-"+String(tmrwBJ.getUTCMonth()+1).padStart(2,"0")+"-"+String(tmrwBJ.getUTCDate()).padStart(2,"0");

// API 按 UTC 日期过滤，北京时间今天 = UTC(昨天16:00 ~ 今天16:00)
// 所以查 UTC 今天~明天，再用北京时间二次过滤
if (apiKey) {
  $httpClient.get({url:"https://api.football-data.org/v4/competitions/WC/matches?dateFrom="+todayBJ+"&dateTo="+tmrwS, headers:{"X-Auth-Token":apiKey}}, function(err,resp,data) {
    if (err || !data) { renderEmpty(); return; }
    try {
      var json = JSON.parse(data);
      if (!json.matches || json.matches.length===0) { renderEmpty(); return; }
      // 只保留北京时间今天的比赛
      var todayMatches = [];
      for (var i=0; i<json.matches.length; i++) {
        var bjDate = getBJDate(json.matches[i].utcDate);
        if (bjDate === todayBJ) todayMatches.push(json.matches[i]);
      }
      if (todayMatches.length === 0) { renderEmpty(); return; }
      renderApi(todayMatches);
    } catch(e) { renderEmpty(); }
  });
} else {
  renderEmpty();
}

// 将 UTC 时间字符串转为北京时间日期字符串 YYYY-MM-DD
function getBJDate(utcStr) {
  var d = new Date(utcStr);
  var bj = new Date(d.getTime() + 8*3600000);
  return bj.getUTCFullYear()+"-"+String(bj.getUTCMonth()+1).padStart(2,"0")+"-"+String(bj.getUTCDate()).padStart(2,"0");
}

// 将 UTC 时间字符串转为北京时间 {h, m, ms}
function bjStr(utc) {
  var d = new Date(utc);
  var h = (d.getUTCHours() + 8) % 24;
  var m = d.getUTCMinutes();
  return {h: h, m: m, getTime: function(){ return d.getTime(); }};
}

function renderApi(matches) {
  var live = [], upcoming = [], finished = [];
  for (var i=0; i<matches.length; i++) {
    var m = matches[i];
    var bj = bjStr(m.utcDate);
    var hh = String(bj.h).padStart(2,"0"), mm = String(bj.m).padStart(2,"0");
    var t = hh+":"+mm;
    var ht = norm(m.homeTeam.name), at = norm(m.awayTeam.name);
    var hf = FLAGS[ht]||"🏳️", af = FLAGS[at]||"🏳️";
    var hc = CN[ht]||ht, ac = CN[at]||at;
    var grp = (m.group||"").replace("GROUP_","");

    if (m.status === "IN_PLAY" || m.status === "PAUSED") {
      var hs = m.score.fullTime.home !== null ? m.score.fullTime.home : "?";
      var as2 = m.score.fullTime.away !== null ? m.score.fullTime.away : "?";
      live.push("🔴 "+hf+hc+" "+hs+"-"+as2+" "+af+ac+" "+t+" ["+grp+"]");
    } else if (m.status === "FINISHED") {
      var hs = m.score.fullTime.home, as2 = m.score.fullTime.away;
      finished.push("✅ "+hf+hc+" "+hs+"-"+as2+" "+af+ac+" ["+grp+"]");
    } else if (m.status === "TIMED" || m.status === "SCHEDULED") {
      var mins = Math.round((bj.getTime()-now.getTime())/60000);
      var tag = mins > 0 && mins <= 120 ? " ("+mins+"分钟后)" : "";
      upcoming.push("⏰ "+t+" "+hf+hc+" vs "+af+ac+" ["+grp+"]"+tag);
    }
  }

  var lines = [];
  if (live.length > 0) {
    lines.push("🔴 进行中");
    for(var i=0;i<live.length;i++) lines.push(live[i]);
    lines.push("");
  }
  if (upcoming.length > 0) {
    lines.push("⏰ 未开始");
    for(var i=0;i<upcoming.length;i++) lines.push(upcoming[i]);
    lines.push("");
  }
  if (finished.length > 0) {
    lines.push("✅ 已结束");
    for(var i=0;i<finished.length;i++) lines.push(finished[i]);
  }

  if (lines.length === 0) { renderEmpty(); return; }

  $done({
    title: "⚽世界杯·实时比分",
    content: lines.join("\n").trim(),
    icon: "sportscourt.fill", "icon-color": "#FF3B30"
  });
}

function renderEmpty() {
  $done({
    title: "⚽世界杯·实时比分",
    content: "今日暂无比赛\n\n小组赛 6/12-6/28\n决赛 7/20 03:00",
    icon: "sportscourt.fill", "icon-color": "#8E8E93"
  });
}
