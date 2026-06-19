/**
 * ⚽世界杯·统计信息
 * Surge type=generic | 进球/助攻/黄牌/红牌 四大统计
 * 数据来源: football-data.org API + Bing 静态备用
 */
var apiKey = "";
if (typeof $argument !== "undefined" && $argument) {
  var _a = $argument.split("&");
  for (var _i = 0; _i < _a.length; _i++) {
    var _kv = _a[_i].split("=");
    if (_kv[0] === "api_key") apiKey = decodeURIComponent(_kv[1] || "");
  }
}

var API_MAP = {
  "Korea Republic":"South Korea","Bosnia-Herzegovina":"Bosnia",
  "Cape Verde Islands":"Cape Verde","United States":"USA",
  "United States of America":"USA"
};
function norm(n) { return API_MAP[n] || n; }

var FLAGS = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Bosnia":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭",
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

// ===== 静态数据 (Bing 快照 6/20) =====

// 进球榜
var STATIC_GOALS = [
  {n:"戴维·乔纳森",t:"Canada",g:3},
  {n:"梅西",t:"Argentina",g:3},
  {n:"哈维茨",t:"Germany",g:2},
  {n:"赛勒·拉琳",t:"Canada",g:2},
  {n:"曼赞比",t:"Switzerland",g:2},
  {n:"姆巴佩",t:"France",g:2},
  {n:"吉斯特",t:"New Zealand",g:2},
  {n:"凯恩",t:"England",g:2},
  {n:"巴洛贡",t:"USA",g:2},
  {n:"阿亚里",t:"Sweden",g:2},
  {n:"哈兰德",t:"Norway",g:2}
];

// 助攻榜
var STATIC_ASSISTS = [
  {n:"基米希",t:"Germany",a:2},
  {n:"格雷文伯奇",t:"Netherlands",a:2},
  {n:"伍德",t:"New Zealand",a:2},
  {n:"昂达夫",t:"Germany",a:2},
  {n:"伊萨克",t:"Sweden",a:2}
];

// 黄牌榜
var STATIC_YELLOW = [
  {n:"莫科埃纳",t:"South Africa",c:2}
];

// 红牌榜
var STATIC_RED = [
  {n:"蒙特斯",t:"Mexico",c:1},
  {n:"马西波",t:"Qatar",c:1},
  {n:"艾哈迈德",t:"Qatar",c:1},
  {n:"穆哈雷维奇",t:"Bosnia",c:1},
  {n:"斯菲弗罗",t:"South Africa",c:1},
  {n:"次瓦内",t:"South Africa",c:1}
];

// ===== 格式化 =====
function fmtPlayer(flag, cn, name, val, label) {
  return " " + flag + " " + cn + " " + name + " " + val + label;
}

// ===== 静态渲染 =====
function renderStatic() {
  var lines = [];

  // ⚽ 进球
  lines.push("━━ ⚽进球 ━━");
  for (var i = 0; i < STATIC_GOALS.length; i++) {
    var s = STATIC_GOALS[i];
    var flag = FLAGS[s.t]||"🏳️";
    var cn = CN[s.t]||s.t;
    var rank = String(i+1); if (rank.length < 2) rank = " " + rank;
    var pen = s.pen ? " (点"+s.pen+")" : "";
    lines.push(rank+". "+flag+cn+" "+s.n+" "+s.g+"球"+pen);
  }

  lines.push("");

  // 🅰️ 助攻
  lines.push("━━ 🅰️助攻 ━━");
  for (var i = 0; i < STATIC_ASSISTS.length; i++) {
    var s = STATIC_ASSISTS[i];
    var flag = FLAGS[s.t]||"🏳️";
    var cn = CN[s.t]||s.t;
    var rank = String(i+1); if (rank.length < 2) rank = " " + rank;
    lines.push(rank+". "+flag+cn+" "+s.n+" "+s.a+"次");
  }

  lines.push("");

  // 🟨 黄牌
  lines.push("━━ 🟨黄牌 ━━");
  if (STATIC_YELLOW.length === 0) {
    lines.push(" 暂无数据");
  } else {
    for (var i = 0; i < STATIC_YELLOW.length; i++) {
      var s = STATIC_YELLOW[i];
      var flag = FLAGS[s.t]||"🏳️";
      var cn = CN[s.t]||s.t;
      lines.push(" "+flag+cn+" "+s.n+" "+s.c+"张");
    }
    lines.push(" (其余球员各1张)");
  }

  lines.push("");

  // 🟥 红牌
  lines.push("━━ 🟥红牌 ━━");
  for (var i = 0; i < STATIC_RED.length; i++) {
    var s = STATIC_RED[i];
    var flag = FLAGS[s.t]||"🏳️";
    var cn = CN[s.t]||s.t;
    lines.push(" "+flag+cn+" "+s.n+" "+s.c+"张");
  }

  lines.push("");
  lines.push("📊 数据更新: 6月20日");

  $done({
    title: "⚽世界杯·统计信息",
    content: lines.join("\n"),
    icon: "chart.bar.fill", "icon-color": "#FF9500"
  });
}

// ===== API 渲染 (进球+助攻从 API, 牌从静态) =====
function renderApi(json) {
  if (!json.scorers || json.scorers.length === 0) { renderStatic(); return; }

  var sc = json.scorers;
  var limit = Math.min(sc.length, 15);
  var lines = [];

  // ⚽ 进球
  lines.push("━━ ⚽进球 TOP"+limit+" ━━");
  for (var i = 0; i < limit; i++) {
    var s = sc[i];
    var name = s.player.name || "?";
    var tn = norm(s.team.name);
    var flag = FLAGS[tn]||"🏳️";
    var cn = CN[tn]||tn;
    var g = s.goals || 0;
    var p = s.penalties || 0;
    var penStr = p > 0 ? " (点"+p+")" : "";
    var rank = String(i+1); if (rank.length < 2) rank = " " + rank;
    lines.push(rank+". "+flag+cn+" "+name+" "+g+"球"+penStr);
  }

  lines.push("");

  // 🅰️ 助攻 (从同一 API 数据取)
  var assistArr = [];
  for (var i = 0; i < sc.length; i++) {
    if (sc[i].assists && sc[i].assists > 0) {
      assistArr.push(sc[i]);
    }
  }
  assistArr.sort(function(a,b) { return (b.assists||0) - (a.assists||0); });
  var aLimit = Math.min(assistArr.length, 10);

  lines.push("━━ 🅰️助攻 TOP"+aLimit+" ━━");
  for (var i = 0; i < aLimit; i++) {
    var s = assistArr[i];
    var name = s.player.name || "?";
    var tn = norm(s.team.name);
    var flag = FLAGS[tn]||"🏳️";
    var cn = CN[tn]||tn;
    var a = s.assists || 0;
    var rank = String(i+1); if (rank.length < 2) rank = " " + rank;
    lines.push(rank+". "+flag+cn+" "+name+" "+a+"次");
  }

  lines.push("");

  // 🟨 黄牌 (使用静态数据)
  lines.push("━━ 🟨黄牌 ━━");
  if (STATIC_YELLOW.length === 0) {
    lines.push(" 暂无数据");
  } else {
    for (var i = 0; i < STATIC_YELLOW.length; i++) {
      var s = STATIC_YELLOW[i];
      var flag = FLAGS[s.t]||"🏳️";
      var cn = CN[s.t]||s.t;
      lines.push(" "+flag+cn+" "+s.n+" "+s.c+"张");
    }
    lines.push(" (其余球员各1张)");
  }

  lines.push("");

  // 🟥 红牌 (使用静态数据)
  lines.push("━━ 🟥红牌 ━━");
  for (var i = 0; i < STATIC_RED.length; i++) {
    var s = STATIC_RED[i];
    var flag = FLAGS[s.t]||"🏳️";
    var cn = CN[s.t]||s.t;
    lines.push(" "+flag+cn+" "+s.n+" "+s.c+"张");
  }

  $done({
    title: "⚽世界杯·统计信息",
    content: lines.join("\n"),
    icon: "chart.bar.fill", "icon-color": "#FF9500"
  });
}

// ===== 主入口 =====
if (apiKey) {
  $httpClient.get({
    url: "https://api.football-data.org/v4/competitions/WC/scorers?limit=30",
    headers: {"X-Auth-Token": apiKey}
  }, function(err, resp, data) {
    if (!err && data) {
      try { renderApi(JSON.parse(data)); return; } catch(e) {}
    }
    renderStatic();
  });
} else {
  renderStatic();
}
