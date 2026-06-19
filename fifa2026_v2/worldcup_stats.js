/**
 * ⚽世界杯·统计信息 v4
 * Surge type=generic | 进球榜+助攻榜 | API实时 + 静态Bing备用
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

// ===== Bing 完整静态数据（中文名 + 球队 + 数值） =====

// 进球数 (Bing完整数据)
var STATIC_GOALS = [
  {n:"戴维 乔纳森",t:"Canada",v:3},
  {n:"莱昂内尔 梅西",t:"Argentina",v:3},
  {n:"凯耶 哈维茨",t:"Germany",v:2},
  {n:"拉琳 赛勒",t:"Canada",v:2},
  {n:"约翰，曼赞比",t:"Switzerland",v:2},
  {n:"基利安，姆巴佩",t:"France",v:2},
  {n:"以利亚 吉斯特",t:"New Zealand",v:2},
  {n:"哈里 卡内",t:"England",v:2},
  {n:"福拉林 巴洛贡",t:"USA",v:2},
  {n:"亚辛 阿亚里",t:"Sweden",v:2},
  {n:"埃尔灵 哈兰",t:"Norway",v:2}
];

// 助攻 (Bing完整数据)
var STATIC_ASSISTS = [
  {n:"约书亚基米希",t:"Germany",v:2},
  {n:"瑞安 格雷文伯奇",t:"Netherlands",v:2},
  {n:"克里斯 伍德",t:"New Zealand",v:2},
  {n:"德尼兹，昂达夫",t:"Germany",v:2},
  {n:"亚历山大 伊萨克",t:"Sweden",v:2},
  {n:"佩塔尔，苏克",t:"Croatia",v:1},
  {n:"尼古拉斯 冈萨雷斯",t:"Argentina",v:1},
  {n:"奥利斯，迈克尔",t:"France",v:1},
  {n:"伊万 佩里西奇",t:"Croatia",v:1},
  {n:"库纳埃尔南德斯",t:"Colombia",v:1},
  {n:"罗伯托 阿尔瓦拉多",t:"Mexico",v:1},
  {n:"布拉西姆 迪亚斯",t:"Morocco",v:1},
  {n:"罗德里格·哈维尔·德·保罗",t:"Argentina",v:1},
  {n:"艾略特 安德森",t:"England",v:1},
  {n:"李，康仁",t:"South Korea",v:1},
  {n:"小川航基",t:"Japan",v:1},
  {n:"布鲁诺 吉马良斯",t:"Brazil",v:1},
  {n:"大久保 择生",t:"Japan",v:1},
  {n:"大卫，普罗米斯",t:"Canada",v:1},
  {n:"克里斯蒂安 普利希奇",t:"USA",v:1}
];

// ===== API球员中文名映射 =====
var CN_PLAYER = {
  "Jonathan David":"戴维 乔纳森","Lionel Messi":"莱昂内尔 梅西",
  "Kai Havertz":"凯耶 哈维茨","Laryea Sile":"拉琳 赛勒",
  "John Manzambi":"约翰，曼赞比","Kylian Mbappé":"基利安，姆巴佩",
  "Elijah Just":"以利亚 吉斯特","Harry Kane":"哈里 卡内",
  "Folarin Balogun":"福拉林 巴洛贡","Yasin Ayari":"亚辛 阿亚里",
  "Erling Haaland":"埃尔灵 哈兰","Joshua Kimmich":"约书亚基米希",
  "Ryan Gravenberch":"瑞安 格雷文伯奇","Chris Wood":"克里斯 伍德",
  "Deniz Undav":"德尼兹，昂达夫","Alexander Isak":"亚历山大 伊萨克"
};

// ===== 渲染函数 =====
function renderSection(title, items, unit) {
  var lines = ["━━ "+title+" ━━"];
  for (var i = 0; i < items.length; i++) {
    var s = items[i];
    var flag = FLAGS[s.t]||"🏳️";
    var cn = CN[s.t]||s.t;
    lines.push(" "+flag+cn+" "+s.n+" "+s.v+unit);
  }
  return lines;
}

function renderApiStats(json) {
  if (!json.scorers || json.scorers.length === 0) { renderStatic(); return; }
  var sc = json.scorers;

  // ⚽ 进球 (API数据，中文名映射)
  var goalLimit = Math.min(sc.length, 15);
  var goals = [];
  for (var i = 0; i < goalLimit; i++) {
    var s = sc[i];
    var name = CN_PLAYER[s.player.name] || s.player.name;
    var tn = norm(s.team.name);
    goals.push({n:name, t:tn, v:s.goals||0});
  }

  // 🅰️ 助攻 (API数据)
  var assistArr = [];
  for (var i = 0; i < sc.length; i++) {
    if (sc[i].assists && sc[i].assists > 0) assistArr.push(sc[i]);
  }
  assistArr.sort(function(a,b){ return (b.assists||0)-(a.assists||0); });
  var aLimit = Math.min(assistArr.length, 20);
  var assists = [];
  for (var i = 0; i < aLimit; i++) {
    var s = assistArr[i];
    var name = CN_PLAYER[s.player.name] || s.player.name;
    var tn = norm(s.team.name);
    assists.push({n:name, t:tn, v:s.assists||0});
  }

  var lines = [];
  var goalLines = renderSection("⚽进球", goals, "球");
  for (var i=0;i<goalLines.length;i++) lines.push(goalLines[i]);
  lines.push("");
  var assistLines = renderSection("🅰️助攻", assists, "次");
  for (var i=0;i<assistLines.length;i++) lines.push(assistLines[i]);

  $done({title:"⚽世界杯·统计信息", content:lines.join("\n"), icon:"chart.bar.fill", "icon-color":"#FF9500"});
}

function renderStatic() {
  var lines = [];
  var g = renderSection("⚽进球", STATIC_GOALS, "球");
  for (var i=0;i<g.length;i++) lines.push(g[i]);
  lines.push("");
  var a = renderSection("🅰️助攻", STATIC_ASSISTS, "次");
  for (var i=0;i<a.length;i++) lines.push(a[i]);

  $done({title:"⚽世界杯·统计信息", content:lines.join("\n"), icon:"chart.bar.fill", "icon-color":"#FF9500"});
}

// ===== 主入口 =====
if (apiKey) {
  $httpClient.get({
    url: "https://api.football-data.org/v4/competitions/WC/scorers?limit=30",
    headers: {"X-Auth-Token": apiKey}
  }, function(err, resp, data) {
    if (!err && data) {
      try { renderApiStats(JSON.parse(data)); return; } catch(e) {}
    }
    renderStatic();
  });
} else {
  renderStatic();
}
