/**
 * ⚽世界杯.实时比分
 * Surge type=generic | 进行中/即将开始/已结束
 */
var apiKey = "";
if (typeof $argument !== "undefined" && $argument) {
  var _a = $argument.split("&");
  for (var _i = 0; _i < _a.length; _i++) {
    var _kv = _a[_i].split("=");
    if (_kv[0] === "api_key") apiKey = decodeURIComponent(_kv[1] || "");
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

// 直接用 API 获取实时比赛数据（时间统一北京时间）
var now = new Date(Date.now() + (480 + new Date().getTimezoneOffset()) * 60000);
var todayS = now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
var tmrw = new Date(now.getTime()+86400000);
var tmrwS = tmrw.getFullYear()+"-"+String(tmrw.getMonth()+1).padStart(2,"0")+"-"+String(tmrw.getDate()).padStart(2,"0");

if (apiKey) {
  $httpClient.get({url:"https://api.football-data.org/v4/competitions/WC/matches?dateFrom="+todayS+"&dateTo="+tmrwS, headers:{"X-Auth-Token":apiKey}}, function(err,resp,data) {
    if (err || !data) { renderEmpty(); return; }
    try {
      var json = JSON.parse(data);
      if (!json.matches || json.matches.length===0) { renderEmpty(); return; }
      renderApi(json.matches);
    } catch(e) { renderEmpty(); }
  });
} else {
  renderEmpty();
}

function bjStr(utc) {
  var d = new Date(utc);
  return new Date(d.getTime()+8*3600000); // UTC -> Beijing +8h
}

function renderApi(matches) {
  var live = [], upcoming = [], finished = [];
  for (var i=0; i<matches.length; i++) {
    var m = matches[i];
    var bj = bjStr(m.utcDate);
    var hh = String(bj.getHours()).padStart(2,"0"), mm = String(bj.getMinutes()).padStart(2,"0");
    var t = hh+":"+mm;
    var ht = norm(m.homeTeam.name), at = norm(m.awayTeam.name);
    var hf = FLAGS[ht]||"🏳️", af = FLAGS[at]||"🏳️";
    var hc = CN[ht]||ht, ac = CN[at]||at;
    var grp = (m.group||"").replace("GROUP_","");

    if (m.status === "IN_PLAY" || m.status === "PAUSED") {
      var hs = m.score.halfTime.home !== null ? m.score.halfTime.home : (m.score.fullTime.home !== null ? m.score.fullTime.home : "?");
      var as2 = m.score.halfTime.away !== null ? m.score.halfTime.away : (m.score.fullTime.away !== null ? m.score.fullTime.away : "?");
      live.push("🔴 "+hf+hc+" "+hs+"-"+as2+" "+af+ac+" ["+grp+"] "+t);
    } else if (m.status === "FINISHED") {
      var hs = m.score.fullTime.home, as2 = m.score.fullTime.away;
      finished.push("✅ "+hf+hc+" "+hs+"-"+as2+" "+af+ac+" ["+grp+"]");
    } else if (m.status === "TIMED" || m.status === "SCHEDULED") {
      var mins = Math.round((bj.getTime()-now.getTime())/60000);
      var tag = mins > 0 && mins < 120 ? " ("+mins+"min)" : "";
      upcoming.push("⏰ "+t+" "+hf+hc+" vs "+af+ac+" ["+grp+"]"+tag);
    }
  }

  var lines = [];
  if (live.length > 0) { lines.push("🔴 进行中 ("+live.length+")"); for(var i=0;i<live.length;i++) lines.push("  "+live[i]); lines.push(""); }
  if (upcoming.length > 0) { lines.push("⏰ 即将开始 ("+upcoming.length+")"); for(var i=0;i<upcoming.length;i++) lines.push("  "+upcoming[i]); lines.push(""); }
  if (finished.length > 0) { lines.push("✅ 已结束 ("+finished.length+")"); for(var i=0;i<finished.length;i++) lines.push("  "+finished[i]); lines.push(""); }

  if (lines.length === 0) { renderEmpty(); return; }

  $done({
    title: "⚽世界杯.实时比分",
    content: lines.join("\n").trim(),
    icon: "sportscourt.fill", "icon-color": "#FF3B30"
  });
}

function renderEmpty() {
  $done({
    title: "⚽世界杯.实时比分",
    content: "⚽ 今日暂无比赛\n\n📅 小组赛 6/12-6/28\n🏆 决赛 7/20 03:00",
    icon: "sportscourt.fill", "icon-color": "#8E8E93"
  });
}
