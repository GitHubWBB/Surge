/**
 * ⚽世界杯·统计信息 v6
 * Surge type=generic | 进球榜(API实时) + 助攻榜(ESPN数据) | 全中文
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

// ===== 球员中文名映射 =====
var CN_PLAYER = {
  // 进球榜
  "Lionel Messi":"梅西","Jonathan David":"乔纳森·戴维",
  "Cyle Larin":"拉林","Folarin Balogun":"巴洛贡",
  "Kai Havertz":"哈弗茨","Yasin Ayari":"阿亚里",
  "Elijah Just":"吉斯特","Kylian Mbappé":"姆巴佩",
  "Erling Haaland":"哈兰德","Harry Kane":"凯恩",
  "Johan Manzambi":"曼赞比",
  "Julián Quiñones":"基尼奥内斯","Raúl Jiménez":"希门尼斯",
  "Ladislav Krejčí":"克雷伊奇","In-beom Hwang":"黄仁范",
  "Hyun-Gyu Oh":"吴贤揆","Jovo Lukić":"卢基奇",
  "Mauricio":"毛里西奥","Gio Reyna":"雷纳",
  "Breel Embolo":"恩博洛","Boualem Khoukhi":"胡赫",
  "Ismael Saibari":"赛巴里","Vinicius Junior":"维尼修斯",
  "John McGinn":"麦金","Nestory Irankunda":"伊兰昆达",
  "Connor Metcalfe":"梅特卡夫","Felix Nmecha":"恩梅查",
  "Felix Kalu Nmecha":"恩梅查",
  "Livano Comenencia":"科梅嫩西亚","Nico Schlotterbeck":"施洛特贝克",
  "Jamal Musiala":"穆西亚拉","Nathaniel Brown":"布朗",
  "Deniz Undav":"温达夫","Virgil van Dijk":"范戴克",
  "Keito Nakamura":"中村敬斗","Crysencio Summerville":"萨默维尔",
  "Daichi Kamada":"镰田大地","Amad Diallo":"迪亚洛",
  "Alexander Isak":"伊萨克","Omar Rekik":"雷基克",
  "Viktor Gyökeres":"久凯赖什","Mattias Svanberg":"斯万贝里",
  "Emam Ashour":"阿舒尔","Abdulelah Al Amri":"阿姆里",
  "Maximiliano Araújo":"阿劳霍","Ramin Rezaeian":"雷扎伊安",
  "Mohammad Mohebi":"莫赫比","Bradley Barcola":"巴尔科拉",
  "Ibrahim Mbaye":"姆巴耶","Aymen Hussein":"侯赛因",
  "Leo Østigård":"奥斯蒂高","Luis Díaz":"路易斯·迪亚斯",
  "Ruben Vargas":"鲁文·巴尔加斯","Romanos Schmid":"施密德",
  "Romano Schmid":"施密德","Ali Olwan":"奥尔万",
  "Marko Arnautovic":"阿瑙托维奇","Joao Neves":"若昂·内维斯",
  "João Neves":"若昂·内维斯","Yoane Wissa":"维萨",
  "Martin Baturina":"巴图里纳","Abbosbek Fayzullaev":"法伊祖拉耶夫",
  "Abbasbek Fayzullaev":"法伊祖拉耶夫",
  "Petar Musa":"穆萨","Jude Bellingham":"贝林厄姆",
  "Marcus Rashford":"拉什福德","Caleb Yirenkyi":"伊伦基",
  "Daniel Muñoz":"穆尼奥斯","Jaminton Campaz":"坎帕斯",
  "Michal Sadílek":"萨迪莱克","Teboho Mokoena":"莫科埃纳",
  "Ermin Mahmic":"马赫米奇","Granit Xhaka":"扎卡",
  "Nathan-Dylan Saliba":"萨利巴","Luis Romo":"罗莫",
  // 助攻榜（ESPN数据中API未覆盖的球员）
  "Chris Wood":"克里斯·伍德","Joshua Kimmich":"基米希",
  "Ryan Gravenberch":"格拉芬贝赫","Petar Sučić":"苏契奇",
  "Amir Al-Ammari":"阿尔-阿马里","Florian Wirtz":"维尔茨",
  "Hannibal Mejbri":"汉尼拔","Noor Al-Rawabdeh":"拉瓦布德",
  "Michael Olise":"奥利塞","Wilfried Singo":"辛戈",
  "Lee Kang-In":"李刚仁","Alex Freeman":"弗里曼",
  "Elliot Anderson":"安德森","Roberto Alvarado":"阿尔瓦拉多",
  "Vladimír Coufal":"曹法尔","Adrien Rabiot":"拉比奥",
  "Rodrigo De Paul":"德保罗","Ivan Perišić":"佩里西奇",
  "Julio Enciso":"恩西索","Paul Okon-Engstler":"奥孔",
  "Sead Kolašinac":"科拉希纳茨","Malik Tillman":"蒂尔曼",
  "Martin Ødegaard":"厄德高","Gustavo Puerta":"普埃尔塔",
  "Bruno Guimarães":"布鲁诺","Érik Lira":"利拉",
  "Mohamed Salah":"萨拉赫","Takefusa Kubo":"久保建英",
  "Arthur Masuaku":"马苏亚库","David Møller Wolfe":"沃尔夫",
  "Declan Rice":"赖斯","Pedro Neto":"内托",
  "Brahim Díaz":"布拉希姆·迪亚斯","Xaver Schlager":"施拉格尔",
  "Christian Pulisic":"普利希奇","Nicolás González":"尼古拉斯·冈萨雷斯",
  "Promise David":"普罗米斯","Lucas Bergvall":"贝里瓦尔",
  "Bukayo Saka":"萨卡","Koki Ogawa":"小川航基",
  "Cucho Hernández":"库乔·埃尔南德斯","Iliman Ndiaye":"恩迪亚耶",
  "Mouhib Chamakh":"沙马赫"
};

// ===== 静态助攻榜 (ESPN 6/19) =====
var STATIC_ASSISTS = [
  {n:"克里斯·伍德",t:"New Zealand",v:2},
  {n:"伊萨克",t:"Sweden",v:2},
  {n:"基米希",t:"Germany",v:2},
  {n:"格拉芬贝赫",t:"Netherlands",v:2},
  {n:"温达夫",t:"Germany",v:2},
  {n:"苏契奇",t:"Croatia",v:1},{n:"阿尔-阿马里",t:"Iraq",v:1},
  {n:"维尔茨",t:"Germany",v:1},{n:"汉尼拔",t:"Tunisia",v:1},
  {n:"拉瓦布德",t:"Jordan",v:1},{n:"奥利塞",t:"France",v:1},
  {n:"辛戈",t:"Ivory Coast",v:1},{n:"李刚仁",t:"South Korea",v:1},
  {n:"久凯赖什",t:"Sweden",v:1},{n:"弗里曼",t:"USA",v:1},
  {n:"安德森",t:"England",v:1},{n:"雷扎伊安",t:"Iran",v:1},
  {n:"阿尔瓦拉多",t:"Mexico",v:1},{n:"曹法尔",t:"Czechia",v:1},
  {n:"拉比奥",t:"France",v:1},{n:"德保罗",t:"Argentina",v:1},
  {n:"佩里西奇",t:"Croatia",v:1},{n:"恩西索",t:"Paraguay",v:1},
  {n:"路易斯·迪亚斯",t:"Colombia",v:1},{n:"奥孔",t:"Australia",v:1},
  {n:"黄仁范",t:"South Korea",v:1},{n:"科拉希纳茨",t:"Bosnia",v:1},
  {n:"蒂尔曼",t:"USA",v:1},{n:"厄德高",t:"Norway",v:1},
  {n:"普埃尔塔",t:"Colombia",v:1},{n:"布鲁诺",t:"Brazil",v:1},
  {n:"利拉",t:"Mexico",v:1},{n:"萨拉赫",t:"Egypt",v:1},
  {n:"久保建英",t:"Japan",v:1},{n:"马苏亚库",t:"DR Congo",v:1},
  {n:"沃尔夫",t:"Norway",v:1},{n:"布朗",t:"Germany",v:1},
  {n:"赖斯",t:"England",v:1},{n:"内托",t:"Portugal",v:1},
  {n:"布拉希姆·迪亚斯",t:"Morocco",v:1},{n:"施拉格尔",t:"Austria",v:1},
  {n:"普利希奇",t:"USA",v:1},{n:"尼古拉斯·冈萨雷斯",t:"Argentina",v:1},
  {n:"普罗米斯",t:"Canada",v:1},{n:"贝里瓦尔",t:"Sweden",v:1},
  {n:"萨卡",t:"England",v:1},{n:"小川航基",t:"Japan",v:1},
  {n:"库乔·埃尔南德斯",t:"Colombia",v:1},{n:"恩迪亚耶",t:"Senegal",v:1},
  {n:"沙马赫",t:"Tunisia",v:1}
];

// ===== 渲染 =====
function fmtLine(flag, country, name, val, unit) {
  return " " + flag + country + " " + name + " " + val + unit;
}

function renderGoalsApi(json) {
  if (!json.scorers || json.scorers.length === 0) { renderStatic(); return; }
  var sc = json.scorers;

  // 进球榜
  var goals = [];
  for (var i = 0; i < sc.length; i++) {
    if ((sc[i].goals || 0) > 0) {
      var name = CN_PLAYER[sc[i].player.name] || sc[i].player.name;
      var tn = norm(sc[i].team.name);
      goals.push({n:name, t:tn, v:sc[i].goals});
    }
  }
  goals.sort(function(a,b){ return b.v - a.v; });

  var lines = [];
  lines.push("━━ ⚽ 进球榜 (" + goals.length + "人) ━━");
  for (var i = 0; i < goals.length; i++) {
    var g = goals[i];
    var flag = FLAGS[g.t] || "🏳️";
    var cn = CN[g.t] || g.t;
    lines.push(fmtLine(flag, cn, g.n, g.v, "球"));
  }
  lines.push("");
  // 助攻榜始终使用ESPN静态数据（API助攻覆盖不完整）
  lines.push("━━ 🅰️ 助攻榜 (" + STATIC_ASSISTS.length + "人) ━━");
  for (var i = 0; i < STATIC_ASSISTS.length; i++) {
    var a = STATIC_ASSISTS[i];
    var flag = FLAGS[a.t] || "🏳️";
    var cn = CN[a.t] || a.t;
    lines.push(fmtLine(flag, cn, a.n, a.v, "次"));
  }

  $done({title:"⚽世界杯·统计信息", content:lines.join("\n"), icon:"chart.bar.fill", "icon-color":"#FF9500"});
}

function renderStatic() {
  // 进球+助攻都使用静态数据
  var STATIC_GOALS = [
    {n:"梅西",t:"Argentina",v:3},{n:"乔纳森·戴维",t:"Canada",v:3},
    {n:"拉林",t:"Canada",v:2},{n:"巴洛贡",t:"USA",v:2},
    {n:"哈弗茨",t:"Germany",v:2},{n:"阿亚里",t:"Sweden",v:2},
    {n:"吉斯特",t:"New Zealand",v:2},{n:"姆巴佩",t:"France",v:2},
    {n:"哈兰德",t:"Norway",v:2},{n:"凯恩",t:"England",v:2},
    {n:"曼赞比",t:"Switzerland",v:2},
    {n:"基尼奥内斯",t:"Mexico",v:1},{n:"希门尼斯",t:"Mexico",v:1},
    {n:"克雷伊奇",t:"Czechia",v:1},{n:"黄仁范",t:"South Korea",v:1},
    {n:"吴贤揆",t:"South Korea",v:1},{n:"卢基奇",t:"Bosnia",v:1},
    {n:"毛里西奥",t:"Paraguay",v:1},{n:"雷纳",t:"USA",v:1},
    {n:"恩博洛",t:"Switzerland",v:1},{n:"胡赫",t:"Qatar",v:1},
    {n:"赛巴里",t:"Morocco",v:1},{n:"维尼修斯",t:"Brazil",v:1},
    {n:"麦金",t:"Scotland",v:1},{n:"伊兰昆达",t:"Australia",v:1},
    {n:"梅特卡夫",t:"Australia",v:1},{n:"恩梅查",t:"Germany",v:1},
    {n:"科梅嫩西亚",t:"Curacao",v:1},{n:"施洛特贝克",t:"Germany",v:1},
    {n:"穆西亚拉",t:"Germany",v:1},{n:"布朗",t:"Germany",v:1},
    {n:"温达夫",t:"Germany",v:1},{n:"范戴克",t:"Netherlands",v:1},
    {n:"中村敬斗",t:"Japan",v:1},{n:"萨默维尔",t:"Netherlands",v:1},
    {n:"镰田大地",t:"Japan",v:1},{n:"迪亚洛",t:"Ivory Coast",v:1},
    {n:"伊萨克",t:"Sweden",v:1},{n:"雷基克",t:"Tunisia",v:1},
    {n:"久凯赖什",t:"Sweden",v:1},{n:"斯万贝里",t:"Sweden",v:1},
    {n:"阿舒尔",t:"Egypt",v:1},{n:"阿姆里",t:"Saudi Arabia",v:1},
    {n:"阿劳霍",t:"Uruguay",v:1},{n:"雷扎伊安",t:"Iran",v:1},
    {n:"莫赫比",t:"Iran",v:1},{n:"巴尔科拉",t:"France",v:1},
    {n:"姆巴耶",t:"Senegal",v:1},{n:"侯赛因",t:"Iraq",v:1},
    {n:"奥斯蒂高",t:"Norway",v:1},{n:"施密德",t:"Austria",v:1},
    {n:"奥尔万",t:"Jordan",v:1},{n:"阿瑙托维奇",t:"Austria",v:1},
    {n:"若昂·内维斯",t:"Portugal",v:1},{n:"维萨",t:"DR Congo",v:1},
    {n:"巴图里纳",t:"Croatia",v:1},{n:"穆萨",t:"Croatia",v:1},
    {n:"贝林厄姆",t:"England",v:1},{n:"拉什福德",t:"England",v:1},
    {n:"伊伦基",t:"Ghana",v:1},{n:"穆尼奥斯",t:"Colombia",v:1},
    {n:"法伊祖拉耶夫",t:"Uzbekistan",v:1},{n:"路易斯·迪亚斯",t:"Colombia",v:1},
    {n:"坎帕斯",t:"Colombia",v:1},{n:"萨迪莱克",t:"Czechia",v:1},
    {n:"莫科埃纳",t:"South Africa",v:1},{n:"鲁文·巴尔加斯",t:"Switzerland",v:1},
    {n:"马赫米奇",t:"Bosnia",v:1},{n:"扎卡",t:"Switzerland",v:1},
    {n:"萨利巴",t:"Canada",v:1},{n:"罗莫",t:"Mexico",v:1}
  ];
  var lines = [];
  lines.push("━━ ⚽ 进球榜 (" + STATIC_GOALS.length + "人) ━━");
  for (var i = 0; i < STATIC_GOALS.length; i++) {
    var g = STATIC_GOALS[i];
    var flag = FLAGS[g.t] || "🏳️";
    var cn = CN[g.t] || g.t;
    lines.push(fmtLine(flag, cn, g.n, g.v, "球"));
  }
  lines.push("");
  lines.push("━━ 🅰️ 助攻榜 (" + STATIC_ASSISTS.length + "人) ━━");
  for (var i = 0; i < STATIC_ASSISTS.length; i++) {
    var a = STATIC_ASSISTS[i];
    var flag = FLAGS[a.t] || "🏳️";
    var cn = CN[a.t] || a.t;
    lines.push(fmtLine(flag, cn, a.n, a.v, "次"));
  }
  $done({title:"⚽世界杯·统计信息", content:lines.join("\n"), icon:"chart.bar.fill", "icon-color":"#FF9500"});
}

// ===== 主入口 =====
if (apiKey) {
  $httpClient.get({
    url: "https://api.football-data.org/v4/competitions/WC/scorers?limit=100",
    headers: {"X-Auth-Token": apiKey}
  }, function(err, resp, data) {
    if (!err && data && resp && resp.statusCode === 200) {
      try { renderGoalsApi(JSON.parse(data)); return; } catch(e) {}
    }
    renderStatic();
  });
} else {
  renderStatic();
}
