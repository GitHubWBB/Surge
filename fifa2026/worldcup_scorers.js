/**
 * 2026 FIFA 世界杯 - 射手榜面板
 *
 * Surge 面板脚本：显示世界杯射手榜/进球数据
 * 支持 API 实时数据 + 降级静态展示
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

(function () {
  var apiKey = $persistentStore.get("wc2026_api_key") || "";

  if (apiKey) {
    var url = "https://api.football-data.org/v4/competitions/WC/scorers?limit=20";
    $httpClient.get({ url: url, headers: { "X-Auth-Token": apiKey } }, function(error, response, data) {
      if (!error && data) {
        try {
          var json = JSON.parse(data);
          renderApiScorers(json);
          return;
        } catch(e) {}
      }
      renderStaticScorers();
    });
  } else {
    renderStaticScorers();
  }
})();

function renderApiScorers(json) {
  if (!json.scorers || json.scorers.length === 0) {
    renderStaticScorers();
    return;
  }

  var lines = [];
  lines.push("⚽ 2026 世界杯射手榜\n");
  lines.push("  排名  球员              球队    进球  助攻");
  lines.push("  ─────────────────────────────────────────");

  var scorers = json.scorers;
  for (var i = 0; i < Math.min(scorers.length, 20); i++) {
    var s = scorers[i];
    var rank = String(i + 1).padStart(2, " ");
    var name = s.player.name || "Unknown";
    var teamName = s.team.name || "";
    var flag = FLAGS[teamName] || "🏳️";
    var goals = String(s.goals || 0).padStart(2, " ");
    var assists = String(s.assists || 0).padStart(2, " ");
    var penGoals = s.penalties || 0;
    var penStr = penGoals > 0 ? " (点球" + penGoals + ")" : "";

    lines.push("  " + rank + ".  " + padRight(name, 14) + " " + flag + " " +
      padRight(teamName, 10) + " " + goals + "    " + assists + penStr);
  }

  lines.push("\n📊 数据来源: football-data.org");

  $done({
    title: "⚽ 射手榜",
    content: lines.join("\n"),
  });
}

function renderStaticScorers() {
  var lines = [];
  lines.push("⚽ 2026 世界杯射手榜\n");
  lines.push("🔜 射手榜将在小组赛开赛后更新\n");
  lines.push("💡 配置 API Key 获取实时进球数据:");
  lines.push("");
  lines.push("  1️⃣ 访问 football-data.org 注册");
  lines.push("  2️⃣ 获取免费 API Key");
  lines.push("  3️⃣ 在 Surge 参数设置中填写:");
  lines.push("     Key: wc2026_api_key");
  lines.push("     Value: 你的 API Key");
  lines.push("");
  lines.push("🏅 热门射手预测:");
  lines.push("  🇫🇷 法国 - 姆巴佩 (Mbappé)");
  lines.push("  🇦🇷 阿根廷 - 梅西/阿尔瓦雷斯");
  lines.push("  🇧🇷 巴西 - 维尼修斯 (Vinícius Jr)");
  lines.push("  🏴󠁧󠁢󠁥󠁮󠁧󠁿 英格兰 - 凯恩 (Kane)");
  lines.push("  🇩🇪 德国 - 穆西亚拉 (Musiala)");
  lines.push("  🇪🇸 西班牙 - 亚马尔 (Yamal)");
  lines.push("  🇵🇹 葡萄牙 - C·罗纳尔多 (Ronaldo)");

  $done({
    title: "⚽ 射手榜",
    content: lines.join("\n"),
  });
}

function padRight(str, len) {
  while (str.length < len) str += " ";
  return str.substring(0, len);
}
