/**
 * ⚽世界杯·分组排名
 * Surge type=generic | 12组完整积分榜
 * 数据来源: football-data.org API
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

if (apiKey) {
  $httpClient.get({url:"https://api.football-data.org/v4/competitions/WC/standings", headers:{"X-Auth-Token":apiKey}}, function(err,resp,data) {
    if (!err && data) {
      try { renderApi(JSON.parse(data)); return; } catch(e) {}
    }
    renderStatic();
  });
} else {
  renderStatic();
}

function pad(s,n) { while(String(s).length<n) s=" "+s; return String(s); }
function padR(s,n) { while(String(s).length<n) s=s+" "; return String(s).substring(0,n); }

function renderApi(json) {
  if (!json.standings || json.standings.length===0) { renderStatic(); return; }

  var lines = [];
  for (var s=0; s<json.standings.length; s++) {
    var st = json.standings[s];
    if (st.type !== "TOTAL") continue;
    var grp = (st.group||"").replace("Group ","");
    var tbl = st.table || [];

    lines.push("━━━ "+grp+" 组 ━━━");
    // 表头
    lines.push("    球队     赛 胜 平 负 进 失 净 分");

    for (var t=0; t<tbl.length; t++) {
      var r = tbl[t];
      var name = norm(r.team.name);
      var flag = FLAGS[name]||"🏳️";
      var cn = CN[name]||r.team.shortName||name;
      var gd = r.goalDifference;
      var gdStr = (gd>0?"+":"")+gd;
      // 前两名出线标识
      var qual = t < 2 ? "✓" : " ";

      lines.push(qual+" "+flag+padR(cn,4)+" "+
        pad(r.playedGames,2)+" "+pad(r.won,2)+" "+pad(r.draw,2)+" "+pad(r.lost,2)+
        " "+pad(r.goalsFor,2)+" "+pad(r.goalsAgainst,2)+" "+pad(gdStr,3)+" "+pad(r.points,2));
    }
    lines.push("");
  }

  lines.push("✓ = 小组前两名出线");

  $done({
    title: "⚽世界杯·分组排名",
    content: lines.join("\n"),
    icon: "list.number", "icon-color": "#007AFF"
  });
}

function renderStatic() {
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

  var lines = ["🏆 2026 世界杯 48 强分组\n"];
  var keys = Object.keys(GROUPS);
  for (var g=0;g<keys.length;g++) {
    var k = keys[g], teams = GROUPS[k];
    lines.push("━ "+k+" 组 ━");
    for (var t=0;t<teams.length;t++) {
      lines.push("  "+(FLAGS[teams[t]]||"🏳️")+" "+(CN[teams[t]]||teams[t]));
    }
    lines.push("");
  }
  lines.push("💡 比赛进行中，积分即将更新...");

  $done({
    title: "⚽世界杯·分组排名",
    content: lines.join("\n"),
    icon: "list.number", "icon-color": "#007AFF"
  });
}
