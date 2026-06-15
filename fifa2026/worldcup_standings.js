/**
 * 2026 FIFA 世界杯 - 小组排名面板
 * Surge type=generic 面板脚本
 */

var apiKey = "";
var panelGroup = "ALL";
if (typeof $argument !== "undefined" && $argument) {
  var _a = $argument.split("&");
  for (var _i = 0; _i < _a.length; _i++) {
    var _kv = _a[_i].split("=");
    if (_kv[0] === "api_key") apiKey = decodeURIComponent(_kv[1] || "");
    if (_kv[0] === "panel_group") panelGroup = decodeURIComponent(_kv[1] || "ALL");
  }
}

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
var GROUPS = {
  A:["Mexico","South Africa","South Korea","Czechia"],
  B:["Canada","Bosnia & Herzegovina","Qatar","Switzerland"],
  C:["Brazil","Morocco","Haiti","Scotland"],
  D:["USA","Paraguay","Australia","Türkiye"],
  E:["Germany","Curaçao","Ivory Coast","Ecuador"],
  F:["Netherlands","Japan","Sweden","Tunisia"],
  G:["Belgium","Egypt","Iran","New Zealand"],
  H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I:["France","Senegal","Iraq","Norway"],
  J:["Argentina","Algeria","Austria","Jordan"],
  K:["Portugal","DR Congo","Uzbekistan","Colombia"],
  L:["England","Croatia","Ghana","Panama"],
};

if (apiKey) {
  $httpClient.get({ url: "https://api.football-data.org/v4/competitions/WC/standings", headers: { "X-Auth-Token": apiKey } }, function(error, response, data) {
    if (!error && data) {
      try { renderApiStandings(JSON.parse(data)); return; } catch(e) {}
    }
    renderStaticStandings();
  });
} else {
  renderStaticStandings();
}

function renderApiStandings(json) {
  if (!json.standings || json.standings.length === 0) { renderStaticStandings(); return; }

  var lines = ["🏆 小组积分榜 (实时)\n"];

  for (var s = 0; s < json.standings.length; s++) {
    var standing = json.standings[s];
    if (standing.type !== "TOTAL") continue;
    var groupLetter = (standing.group || "").replace("GROUP_", "").replace("Group ", "");

    if (panelGroup !== "ALL" && panelGroup !== groupLetter) continue;

    lines.push("━━━ " + groupLetter + " 组 ━━━");
    lines.push("  球队        赛 胜 平 负  得 失 净  分");

    var table = standing.table || [];
    for (var t = 0; t < table.length; t++) {
      var team = table[t];
      var name = CN[team.team.name] || team.team.name;
      var flag = FLAGS[team.team.name] || "🏳️";
      var gd = (team.goalDifference >= 0 ? "+" : "") + team.goalDifference;
      lines.push("  " + flag + " " + padR(name, 5) + "  " +
        team.playedGames + "  " + team.won + "  " + team.draw + "  " + team.lost +
        "  " + team.goalsFor + "  " + team.goalsAgainst + "  " + gd + "  " + team.points);
    }
    lines.push("");
  }

  $done({
    title: "📊 世界杯积分榜",
    content: lines.join("\n"),
    icon: "list.number", "icon-color": "#007AFF"
  });
}

function renderStaticStandings() {
  var lines = ["🏆 2026 世界杯 48 强分组\n"];

  var groupKeys = Object.keys(GROUPS);
  for (var g = 0; g < groupKeys.length; g++) {
    var key = groupKeys[g];
    if (panelGroup !== "ALL" && panelGroup !== key) continue;

    lines.push("━ " + key + " 组 ━");
    var teams = GROUPS[key];
    for (var t = 0; t < teams.length; t++) {
      lines.push("  " + (FLAGS[teams[t]] || "🏳️") + " " + (CN[teams[t]] || teams[t]));
    }
    lines.push("");
  }

  lines.push("💡 填写 API Key 查看实时积分");
  lines.push("   football-data.org 免费注册");

  $done({
    title: "📊 世界杯分组",
    content: lines.join("\n"),
    icon: "list.number", "icon-color": "#007AFF"
  });
}

function padR(str, len) {
  while (str.length < len) str += " ";
  return str;
}
