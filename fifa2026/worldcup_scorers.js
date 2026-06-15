/**
 * 2026 FIFA 世界杯 - 射手榜面板
 * Surge type=generic 面板脚本
 */

var apiKey = "";
if (typeof $argument !== "undefined" && $argument) {
  var _a = $argument.split("&");
  for (var _i = 0; _i < _a.length; _i++) {
    var _kv = _a[_i].split("=");
    if (_kv[0] === "api_key") apiKey = decodeURIComponent(_kv[1] || "");
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

if (apiKey) {
  $httpClient.get({ url: "https://api.football-data.org/v4/competitions/WC/scorers?limit=20", headers: { "X-Auth-Token": apiKey } }, function(error, response, data) {
    if (!error && data) {
      try { renderApiScorers(JSON.parse(data)); return; } catch(e) {}
    }
    renderStaticScorers();
  });
} else {
  renderStaticScorers();
}

function renderApiScorers(json) {
  if (!json.scorers || json.scorers.length === 0) { renderStaticScorers(); return; }

  var lines = ["⚽ 2026 世界杯射手榜\n"];
  lines.push("  #  球员            球队    进球 助攻");
  lines.push("  ────────────────────────────────────");

  var scorers = json.scorers;
  for (var i = 0; i < Math.min(scorers.length, 20); i++) {
    var s = scorers[i];
    var rank = String(i + 1);
    if (rank.length < 2) rank = " " + rank;
    var name = s.player.name || "?";
    var teamName = s.team.name || "";
    var flag = FLAGS[teamName] || "🏳️";
    var goals = String(s.goals || 0);
    if (goals.length < 2) goals = " " + goals;
    var assists = String(s.assists || 0);
    if (assists.length < 2) assists = " " + assists;
    var penStr = (s.penalties || 0) > 0 ? " (点球" + s.penalties + ")" : "";

    lines.push("  " + rank + ". " + padR(name, 14) + " " + flag + " " + padR(teamName, 10) + " " + goals + "   " + assists + penStr);
  }

  $done({
    title: "⚽ 射手榜",
    content: lines.join("\n"),
    icon: "figure.soccer", "icon-color": "#FF9500"
  });
}

function renderStaticScorers() {
  var lines = ["⚽ 2026 世界杯射手榜\n"];
  lines.push("🔜 射手榜将在比赛开始后更新\n");
  lines.push("💡 填写 API Key 获取实时进球数据:");
  lines.push("  1. 访问 football-data.org 注册");
  lines.push("  2. 获取免费 API Key");
  lines.push("  3. 在模块参数中填写 api_key\n");
  lines.push("🏅 热门射手预测:");
  lines.push("  🇫🇷 姆巴佩 (Mbappé)");
  lines.push("  🇦🇷 阿尔瓦雷斯 (Álvarez)");
  lines.push("  🇧🇷 维尼修斯 (Vinícius Jr)");
  lines.push("  🏴󠁧󠁢󠁥󠁮󠁧󠁿 凯恩 (Kane)");
  lines.push("  🇩🇪 穆西亚拉 (Musiala)");
  lines.push("  🇪🇸 亚马尔 (Yamal)");
  lines.push("  🇵🇹 C·罗纳尔多 (Ronaldo)");

  $done({
    title: "⚽ 射手榜",
    content: lines.join("\n"),
    icon: "figure.soccer", "icon-color": "#FF9500"
  });
}

function padR(str, len) {
  while (str.length < len) str += " ";
  return str.substring(0, len);
}
