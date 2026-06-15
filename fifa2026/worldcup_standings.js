/**
 * 2026 FIFA 世界杯 - 小组排名面板
 * 
 * Surge 面板脚本：显示各小组积分榜
 * 支持 API 实时数据 + 静态分组展示
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

// 读取用户选择展示的小组 (可通过 Surge 参数设置)
var targetGroup = $persistentStore.get("wc2026_panel_group") || "ALL";

(function () {
  var apiKey = $persistentStore.get("wc2026_api_key") || "";

  if (apiKey) {
    // 尝试从 API 获取实时积分榜
    var url = "https://api.football-data.org/v4/competitions/WC/standings";
    $httpClient.get({ url: url, headers: { "X-Auth-Token": apiKey } }, function(error, response, data) {
      if (!error && data) {
        try {
          var json = JSON.parse(data);
          renderApiStandings(json);
          return;
        } catch(e) {}
      }
      renderStaticStandings();
    });
  } else {
    renderStaticStandings();
  }
})();

// ===== 渲染 API 实时积分榜 =====
function renderApiStandings(json) {
  if (!json.standings || json.standings.length === 0) {
    renderStaticStandings();
    return;
  }

  var lines = [];
  lines.push("🏆 小组积分榜 (实时)\n");

  for (var s = 0; s < json.standings.length; s++) {
    var standing = json.standings[s];
    if (standing.type !== "TOTAL") continue;
    var group = standing.group || "";
    var groupLetter = group.replace("GROUP_", "").replace("Group ", "");

    if (targetGroup !== "ALL" && targetGroup !== groupLetter) continue;

    lines.push("━━━ " + groupLetter + " 组 ━━━");
    lines.push("  球队      赛  胜  平  负  得  失  净  分");

    var table = standing.table || [];
    for (var t = 0; t < table.length; t++) {
      var team = table[t];
      var name = CN[team.team.name] || team.team.name;
      var flag = FLAGS[team.team.name] || "🏳️";
      var played = String(team.playedGames).padStart(2, " ");
      var won = String(team.won).padStart(2, " ");
      var draw = String(team.draw).padStart(2, " ");
      var lost = String(team.lost).padStart(2, " ");
      var gf = String(team.goalsFor).padStart(2, " ");
      var ga = String(team.goalsAgainst).padStart(2, " ");
      var gd = (team.goalDifference >= 0 ? "+" : "") + String(team.goalDifference).padStart(2, " ");
      var pts = String(team.points).padStart(2, " ");
      lines.push("  " + flag + " " + padRight(name, 6) + " " +
        played + " " + won + " " + draw + " " + lost + " " + gf + " " + ga + " " + gd + " " + pts);
    }
    lines.push("");
  }

  $done({
    title: "📊 世界杯积分榜",
    content: lines.join("\n"),
  });
}

// ===== 渲染静态分组信息 =====
function renderStaticStandings() {
  var lines = [];
  lines.push("🏆 2026 世界杯 48 强分组\n");

  var groupKeys = Object.keys(GROUPS);
  for (var g = 0; g < groupKeys.length; g++) {
    var key = groupKeys[g];
    if (targetGroup !== "ALL" && targetGroup !== key) continue;

    var teams = GROUPS[key];
    lines.push("━ " + key + " 组 ━");
    for (var t = 0; t < teams.length; t++) {
      var flag = FLAGS[teams[t]] || "🏳️";
      var cn = CN[teams[t]] || teams[t];
      lines.push("  " + flag + " " + cn);
    }
    lines.push("");
  }

  lines.push("💡 配置 API Key 查看实时积分");
  lines.push("   注册: football-data.org");
  lines.push("   设置: 在 Surge 参数中填写 Key");

  $done({
    title: "📊 世界杯分组",
    content: lines.join("\n"),
  });
}

function padRight(str, len) {
  while (str.length < len) str += " ";
  return str;
}
