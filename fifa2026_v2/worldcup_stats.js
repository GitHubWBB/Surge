/**
 * ⚽世界杯·统计信息 v3
 * Surge type=generic | 完全匹配Bing格式 | 进球/助攻/黄牌/红牌
 * API: football-data.org 进球+助攻 | 黄牌+红牌: 静态Bing数据
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
  "Canada":"🇨🇦","Bosnia":"🇧🇦","Qatar":"🇶🇦","Switzerland":"CH",
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

// 黄牌 (Bing完整数据)
var STATIC_YELLOW = [
  {n:"莫科埃纳，特博霍",t:"South Africa",v:2},
  {n:"弗兰克 凯西",t:"Ivory Coast",v:1},
  {n:"迭戈，戈麦斯",t:"Paraguay",v:1},
  {n:"托马斯，阿劳霍",t:"Portugal",v:1},
  {n:"阿尔米隆，米格尔",t:"Paraguay",v:1},
  {n:"恩科西纳蒂 西比西",t:"South Africa",v:1},
  {n:"杰克逊 波罗佐",t:"Ecuador",v:1},
  {n:"德福杰洛尔斯 吕克",t:"Canada",v:1},
  {n:"贝纳多，席尔瓦",t:"Portugal",v:1},
  {n:"罗杰·伊巴内斯·达·席尔瓦",t:"Brazil",v:1},
  {n:"卡斯特纳 提磨蒂",t:"Belgium",v:1},
  {n:"艾丁 哲科",t:"Bosnia",v:1},
  {n:"迪迪克 阿玛",t:"Bosnia",v:1},
  {n:"姆本巴 尚塞尔",t:"DR Congo",v:1},
  {n:"马哈茂德 阿布纳达",t:"Qatar",v:1},
  {n:"阿提亚，马尔万",t:"Egypt",v:1},
  {n:"基赫 李",t:"South Korea",v:1},
  {n:"让里克纳，贝勒加德",t:"Haiti",v:1},
  {n:"塞科 福法纳",t:"Ivory Coast",v:1},
  {n:"孟菲斯 德帕伊",t:"Netherlands",v:1},
  {n:"约沃 卢基奇",t:"Bosnia",v:1},
  {n:"卡塞雷斯 何塞",t:"Paraguay",v:1},
  {n:"柯蒂斯，芬德利",t:"Scotland",v:1},
  {n:"扎伊德 塔希纳",t:"Iraq",v:1},
  {n:"尼古拉 卡蒂奇",t:"Bosnia",v:1},
  {n:"泰勒 亚当斯",t:"USA",v:1},
  {n:"米奇 范德文",t:"Netherlands",v:1},
  {n:"古铁雷斯 布莱恩",t:"Mexico",v:1},
  {n:"卡洛斯 哈维",t:"Panama",v:1},
  {n:"拉迪斯拉夫Krejci",t:"Czechia",v:1},
  {n:"丹尼斯 扎卡里亚",t:"Switzerland",v:1},
  {n:"拉尼 赫迪拉",t:"Tunisia",v:1},
  {n:"克利森西奥 萨默维尔",t:"Netherlands",v:1},
  {n:"阿克冈，雅努斯",t:"Turkiye",v:1},
  {n:"塞萨尔 布莱克曼",t:"Panama",v:1},
  {n:"佩德里",t:"Spain",v:1},
  {n:"艾伦 希基",t:"Scotland",v:1},
  {n:"塔伦特 姆巴塔",t:"South Africa",v:1},
  {n:"约翰 莫希卡",t:"Colombia",v:1},
  {n:"尼尔森 塞梅多",t:"Portugal",v:1},
  {n:"马塞尔 萨比策",t:"Austria",v:1},
  {n:"阿卜杜勒莱",t:"Saudi Arabia",v:1},
  {n:"肯尼 麦克利安",t:"Scotland",v:1},
  {n:"科尼利厄斯 德里克",t:"Canada",v:1},
  {n:"卡塞米罗",t:"Brazil",v:1},
  {n:"约翰斯顿 阿里斯特尔",t:"Canada",v:1},
  {n:"艾哈迈德 阿布 埃尔福图",t:"Egypt",v:1},
  {n:"马克西姆 德·库珀",t:"Belgium",v:1},
  {n:"埃赫桑 哈吉-萨菲",t:"Iran",v:1},
  {n:"尼科 伊尔维迪",t:"Switzerland",v:1},
  {n:"厄尔梅丁 德米罗维奇",t:"Bosnia",v:1}
];

// 红牌 (Bing完整数据)
var STATIC_RED = [
  {n:"塞萨尔省蒙特斯",t:"Mexico",v:1},
  {n:"马西波",t:"Qatar",v:1},
  {n:"霍姆 艾哈迈德",t:"Qatar",v:1},
  {n:"塔里克，穆哈雷维奇",t:"Bosnia",v:1},
  {n:"西特霍尔 斯菲弗罗",t:"South Africa",v:1},
  {n:"提姆巴 次瓦内",t:"South Africa",v:1}
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
  var goalLines = renderSection("⚽进球", goals, "");
  for (var i=0;i<goalLines.length;i++) lines.push(goalLines[i]);
  lines.push("");
  var assistLines = renderSection("🅰️助攻", assists, "");
  for (var i=0;i<assistLines.length;i++) lines.push(assistLines[i]);
  lines.push("");
  var yellowLines = renderSection("🟨黄牌", STATIC_YELLOW, "");
  for (var i=0;i<yellowLines.length;i++) lines.push(yellowLines[i]);
  lines.push("");
  var redLines = renderSection("🟥红牌", STATIC_RED, "");
  for (var i=0;i<redLines.length;i++) lines.push(redLines[i]);

  $done({title:"⚽世界杯·统计信息", content:lines.join("\n"), icon:"chart.bar.fill", "icon-color":"#FF9500"});
}

function renderStatic() {
  var lines = [];
  var g = renderSection("⚽进球", STATIC_GOALS, "");
  for (var i=0;i<g.length;i++) lines.push(g[i]);
  lines.push("");
  var a = renderSection("🅰️助攻", STATIC_ASSISTS, "");
  for (var i=0;i<a.length;i++) lines.push(a[i]);
  lines.push("");
  var y = renderSection("🟨黄牌", STATIC_YELLOW, "");
  for (var i=0;i<y.length;i++) lines.push(y[i]);
  lines.push("");
  var r = renderSection("🟥红牌", STATIC_RED, "");
  for (var i=0;i<r.length;i++) lines.push(r[i]);

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
