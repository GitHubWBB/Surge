/**
 * ⚽世界杯·分组排名
 * Surge type=generic | 12组完整积分榜，API实时 + 静态备用
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
  "United States of America":"USA","Korea DPR":"South Korea",
  "Turkey":"Turkiye","Congo DR":"DR Congo","Curaçao":"Curacao",
  "Bosnia-H.":"Bosnia","Czech Republic":"Czechia"
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

// ===== 静态积分榜 (API快照 6/19 MD2进行中) =====
var STATIC = {
  A:[{t:"Mexico",p:2,w:2,d:0,l:0,gf:3,ga:0,gd:3,pt:6},{t:"South Korea",p:2,w:1,d:0,l:1,gf:2,ga:2,gd:0,pt:3},{t:"Czechia",p:2,w:0,d:1,l:1,gf:2,ga:3,gd:-1,pt:1},{t:"South Africa",p:2,w:0,d:1,l:1,gf:1,ga:3,gd:-2,pt:1}],
  B:[{t:"Canada",p:2,w:1,d:1,l:0,gf:7,ga:1,gd:6,pt:4},{t:"Switzerland",p:2,w:1,d:1,l:0,gf:5,ga:2,gd:3,pt:4},{t:"Bosnia",p:2,w:0,d:1,l:1,gf:2,ga:5,gd:-3,pt:1},{t:"Qatar",p:2,w:0,d:1,l:1,gf:1,ga:7,gd:-6,pt:1}],
  C:[{t:"Scotland",p:1,w:1,d:0,l:0,gf:1,ga:0,gd:1,pt:3},{t:"Morocco",p:1,w:0,d:1,l:0,gf:1,ga:1,gd:0,pt:1},{t:"Brazil",p:1,w:0,d:1,l:0,gf:1,ga:1,gd:0,pt:1},{t:"Haiti",p:1,w:0,d:0,l:1,gf:0,ga:1,gd:-1,pt:0}],
  D:[{t:"USA",p:1,w:1,d:0,l:0,gf:4,ga:1,gd:3,pt:3},{t:"Australia",p:1,w:1,d:0,l:0,gf:2,ga:0,gd:2,pt:3},{t:"Turkiye",p:1,w:0,d:0,l:1,gf:0,ga:2,gd:-2,pt:0},{t:"Paraguay",p:1,w:0,d:0,l:1,gf:1,ga:4,gd:-3,pt:0}],
  E:[{t:"Germany",p:1,w:1,d:0,l:0,gf:7,ga:1,gd:6,pt:3},{t:"Ivory Coast",p:1,w:1,d:0,l:0,gf:1,ga:0,gd:1,pt:3},{t:"Ecuador",p:1,w:0,d:0,l:1,gf:0,ga:1,gd:-1,pt:0},{t:"Curacao",p:1,w:0,d:0,l:1,gf:1,ga:7,gd:-6,pt:0}],
  F:[{t:"Sweden",p:1,w:1,d:0,l:0,gf:5,ga:1,gd:4,pt:3},{t:"Japan",p:1,w:0,d:1,l:0,gf:2,ga:2,gd:0,pt:1},{t:"Netherlands",p:1,w:0,d:1,l:0,gf:2,ga:2,gd:0,pt:1},{t:"Tunisia",p:1,w:0,d:0,l:1,gf:1,ga:5,gd:-4,pt:0}],
  G:[{t:"New Zealand",p:1,w:0,d:1,l:0,gf:2,ga:2,gd:0,pt:1},{t:"Iran",p:1,w:0,d:1,l:0,gf:2,ga:2,gd:0,pt:1},{t:"Belgium",p:1,w:0,d:1,l:0,gf:1,ga:1,gd:0,pt:1},{t:"Egypt",p:1,w:0,d:1,l:0,gf:1,ga:1,gd:0,pt:1}],
  H:[{t:"Uruguay",p:1,w:0,d:1,l:0,gf:1,ga:1,gd:0,pt:1},{t:"Saudi Arabia",p:1,w:0,d:1,l:0,gf:1,ga:1,gd:0,pt:1},{t:"Spain",p:1,w:0,d:1,l:0,gf:0,ga:0,gd:0,pt:1},{t:"Cape Verde",p:1,w:0,d:1,l:0,gf:0,ga:0,gd:0,pt:1}],
  I:[{t:"Norway",p:1,w:1,d:0,l:0,gf:4,ga:1,gd:3,pt:3},{t:"France",p:1,w:1,d:0,l:0,gf:3,ga:1,gd:2,pt:3},{t:"Senegal",p:1,w:0,d:0,l:1,gf:1,ga:3,gd:-2,pt:0},{t:"Iraq",p:1,w:0,d:0,l:1,gf:1,ga:4,gd:-3,pt:0}],
  J:[{t:"Argentina",p:1,w:1,d:0,l:0,gf:3,ga:0,gd:3,pt:3},{t:"Austria",p:1,w:1,d:0,l:0,gf:3,ga:1,gd:2,pt:3},{t:"Jordan",p:1,w:0,d:0,l:1,gf:1,ga:3,gd:-2,pt:0},{t:"Algeria",p:1,w:0,d:0,l:1,gf:0,ga:3,gd:-3,pt:0}],
  K:[{t:"Colombia",p:1,w:1,d:0,l:0,gf:3,ga:1,gd:2,pt:3},{t:"DR Congo",p:1,w:0,d:1,l:0,gf:1,ga:1,gd:0,pt:1},{t:"Portugal",p:1,w:0,d:1,l:0,gf:1,ga:1,gd:0,pt:1},{t:"Uzbekistan",p:1,w:0,d:0,l:1,gf:1,ga:3,gd:-2,pt:0}],
  L:[{t:"England",p:1,w:1,d:0,l:0,gf:4,ga:2,gd:2,pt:3},{t:"Ghana",p:1,w:1,d:0,l:0,gf:1,ga:0,gd:1,pt:3},{t:"Panama",p:1,w:0,d:0,l:1,gf:0,ga:1,gd:-1,pt:0},{t:"Croatia",p:1,w:0,d:0,l:1,gf:2,ga:4,gd:-2,pt:0}]
};

function pad(s,n) { while(String(s).length<n) s=" "+s; return String(s); }
function padR(s,n) { while(String(s).length<n) s=s+" "; return String(s).substring(0,n); }

// ===== API 渲染 =====
function renderApi(json) {
  if (!json.standings || json.standings.length === 0) { renderStatic(); return; }
  var lines = [];
  for (var s = 0; s < json.standings.length; s++) {
    var st = json.standings[s];
    if (st.type !== "TOTAL") continue;
    var grp = (st.group||"").replace("GROUP ","").replace("Group ","");
    var tbl = st.table || [];
    lines.push("━ "+grp+"组 ━");
    lines.push(" 球队   赛 胜 平 负 进 失 净 分");
    for (var t = 0; t < tbl.length; t++) {
      var r = tbl[t];
      var name = norm(r.team.name);
      var flag = FLAGS[name]||"🏳️";
      var cn = CN[name] || r.team.shortName || name;
      var gd = r.goalDifference;
      var gdStr = (gd>0?"+":"")+gd;
      var qual = t < 2 ? "✓" : " ";
      lines.push(qual+flag+padR(cn,4)+" "+
        pad(r.playedGames,2)+" "+pad(r.won,2)+" "+pad(r.draw,2)+" "+pad(r.lost,2)+
        " "+pad(r.goalsFor,2)+" "+pad(r.goalsAgainst,2)+" "+pad(gdStr,3)+" "+pad(r.points,2));
    }
    lines.push("");
  }
  lines.push("✓ = 小组前两名出线");
  $done({title:"⚽世界杯·分组排名", content:lines.join("\n"), icon:"list.number", "icon-color":"#007AFF"});
}

// ===== 静态渲染 =====
function renderStatic() {
  var groupKeys = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  var lines = [];
  for (var g = 0; g < groupKeys.length; g++) {
    var k = groupKeys[g];
    var teams = STATIC[k];
    lines.push("━ "+k+"组 ━");
    lines.push(" 球队   赛 胜 平 负 进 失 净 分");
    for (var t = 0; t < teams.length; t++) {
      var r = teams[t];
      var flag = FLAGS[r.t]||"🏳️";
      var cn = CN[r.t] || r.t;
      var gdStr = (r.gd>0?"+":"")+r.gd;
      var qual = t < 2 ? "✓" : " ";
      lines.push(qual+flag+padR(cn,4)+" "+
        pad(r.p,2)+" "+pad(r.w,2)+" "+pad(r.d,2)+" "+pad(r.l,2)+
        " "+pad(r.gf,2)+" "+pad(r.ga,2)+" "+pad(gdStr,3)+" "+pad(r.pt,2));
    }
    lines.push("");
  }
  lines.push("✓ = 小组前两名出线");
  $done({title:"⚽世界杯·分组排名", content:lines.join("\n"), icon:"list.number", "icon-color":"#007AFF"});
}

// ===== 主入口 =====
if (apiKey) {
  $httpClient.get({
    url:"https://api.football-data.org/v4/competitions/WC/standings",
    headers:{"X-Auth-Token":apiKey}
  }, function(err,resp,data) {
    if (!err && data) {
      try { renderApi(JSON.parse(data)); return; } catch(e) {}
    }
    renderStatic();
  });
} else {
  renderStatic();
}
