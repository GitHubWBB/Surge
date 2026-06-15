/**
 * ⚽世界杯.射手榜
 * Surge type=generic | 进球/助攻排行
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

if (apiKey) {
  $httpClient.get({url:"https://api.football-data.org/v4/competitions/WC/scorers?limit=20", headers:{"X-Auth-Token":apiKey}}, function(err,resp,data) {
    if (!err && data) { try { renderApi(JSON.parse(data)); return; } catch(e) {} }
    renderStatic();
  });
} else { renderStatic(); }

function renderApi(json) {
  if (!json.scorers || json.scorers.length===0) { renderStatic(); return; }
  var lines = ["⚽ 射手榜 TOP "+Math.min(json.scorers.length,20)+"\n"];
  var sc = json.scorers;
  for (var i=0;i<Math.min(sc.length,20);i++) {
    var s = sc[i];
    var name = s.player.name||"?";
    var tn = norm(s.team.name);
    var flag = FLAGS[tn]||"🏳️";
    var cn = CN[tn]||tn;
    var g = s.goals||0, a = s.assists||0, p = s.penalties||0;
    var penStr = p>0?" (点"+p+")":"";
    var rank = String(i+1);
    if(rank.length<2) rank=" "+rank;
    lines.push(rank+". "+flag+cn+" "+name+"  ⚽"+g+" 🅰️"+a+penStr);
  }
  $done({title:"⚽世界杯.射手榜", content:lines.join("\n"), icon:"figure.soccer", "icon-color":"#FF9500"});
}

function renderStatic() {
  var lines = ["⚽ 射手榜\n","🔜 比赛进行中，射手榜即将更新\n","🏅 热门射手:"];
  lines.push("  🇫🇷 姆巴佩 Mbappé");
  lines.push("  🇦🇷 阿尔瓦雷斯 Álvarez");
  lines.push("  🇧🇷 维尼修斯 Vinícius Jr");
  lines.push("  🏴󠁧󠁢󠁥󠁮󠁧󠁿 凯恩 Kane");
  lines.push("  🇩🇪 穆西亚拉 Musiala");
  lines.push("  🇪🇸 亚马尔 Yamal");
  lines.push("  🇵🇹 C·罗纳尔多 Ronaldo");
  $done({title:"⚽世界杯.射手榜", content:lines.join("\n"), icon:"figure.soccer", "icon-color":"#FF9500"});
}
