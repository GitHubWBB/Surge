/**
 * ⚽世界杯·今日赛程
 * Surge type=generic | 显示今天+明天的比赛
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
var MATCHES = [
  {id:1,g:"A",h:"Mexico",a:"South Africa",d:"2026-06-11T15:00",v:"墨西哥城"},{id:2,g:"A",h:"South Korea",a:"Czechia",d:"2026-06-11T22:00",v:"瓜达拉哈拉"},
  {id:3,g:"B",h:"Canada",a:"Bosnia & Herzegovina",d:"2026-06-12T15:00",v:"多伦多"},{id:4,g:"D",h:"USA",a:"Paraguay",d:"2026-06-12T21:00",v:"洛杉矶"},
  {id:5,g:"B",h:"Qatar",a:"Switzerland",d:"2026-06-13T15:00",v:"旧金山"},{id:6,g:"C",h:"Brazil",a:"Morocco",d:"2026-06-13T18:00",v:"新泽西"},
  {id:7,g:"C",h:"Haiti",a:"Scotland",d:"2026-06-13T21:00",v:"波士顿"},{id:8,g:"D",h:"Australia",a:"Türkiye",d:"2026-06-14T00:00",v:"温哥华"},
  {id:9,g:"E",h:"Germany",a:"Curaçao",d:"2026-06-14T13:00",v:"休斯顿"},{id:10,g:"F",h:"Netherlands",a:"Japan",d:"2026-06-14T16:00",v:"达拉斯"},
  {id:11,g:"E",h:"Ivory Coast",a:"Ecuador",d:"2026-06-14T19:00",v:"费城"},{id:12,g:"F",h:"Sweden",a:"Tunisia",d:"2026-06-14T22:00",v:"蒙特雷"},
  {id:13,g:"H",h:"Spain",a:"Cape Verde",d:"2026-06-15T12:00",v:"亚特兰大"},{id:14,g:"G",h:"Belgium",a:"Egypt",d:"2026-06-15T15:00",v:"西雅图"},
  {id:15,g:"H",h:"Saudi Arabia",a:"Uruguay",d:"2026-06-15T18:00",v:"迈阿密"},{id:16,g:"G",h:"Iran",a:"New Zealand",d:"2026-06-15T21:00",v:"洛杉矶"},
  {id:17,g:"I",h:"France",a:"Senegal",d:"2026-06-16T15:00",v:"新泽西"},{id:18,g:"I",h:"Iraq",a:"Norway",d:"2026-06-16T18:00",v:"波士顿"},
  {id:19,g:"J",h:"Argentina",a:"Algeria",d:"2026-06-16T21:00",v:"堪萨斯城"},{id:20,g:"J",h:"Austria",a:"Jordan",d:"2026-06-17T00:00",v:"旧金山"},
  {id:21,g:"K",h:"Portugal",a:"DR Congo",d:"2026-06-17T13:00",v:"休斯顿"},{id:22,g:"L",h:"England",a:"Croatia",d:"2026-06-17T16:00",v:"达拉斯"},
  {id:23,g:"L",h:"Ghana",a:"Panama",d:"2026-06-17T19:00",v:"多伦多"},{id:24,g:"K",h:"Uzbekistan",a:"Colombia",d:"2026-06-17T22:00",v:"墨西哥城"},
  {id:25,g:"A",h:"Czechia",a:"South Africa",d:"2026-06-18T12:00",v:"亚特兰大"},{id:26,g:"B",h:"Switzerland",a:"Bosnia & Herzegovina",d:"2026-06-18T15:00",v:"洛杉矶"},
  {id:27,g:"B",h:"Canada",a:"Qatar",d:"2026-06-18T18:00",v:"温哥华"},{id:28,g:"A",h:"Mexico",a:"South Korea",d:"2026-06-18T21:00",v:"瓜达拉哈拉"},
  {id:29,g:"D",h:"USA",a:"Australia",d:"2026-06-19T15:00",v:"西雅图"},{id:30,g:"C",h:"Scotland",a:"Morocco",d:"2026-06-19T18:00",v:"波士顿"},
  {id:31,g:"C",h:"Brazil",a:"Haiti",d:"2026-06-19T20:30",v:"费城"},{id:32,g:"D",h:"Türkiye",a:"Paraguay",d:"2026-06-19T23:00",v:"旧金山"},
  {id:33,g:"F",h:"Netherlands",a:"Sweden",d:"2026-06-20T13:00",v:"休斯顿"},{id:34,g:"E",h:"Germany",a:"Ivory Coast",d:"2026-06-20T16:00",v:"多伦多"},
  {id:35,g:"E",h:"Ecuador",a:"Curaçao",d:"2026-06-20T20:00",v:"堪萨斯城"},{id:36,g:"F",h:"Tunisia",a:"Japan",d:"2026-06-21T00:00",v:"蒙特雷"},
  {id:37,g:"H",h:"Spain",a:"Saudi Arabia",d:"2026-06-21T12:00",v:"亚特兰大"},{id:38,g:"G",h:"Belgium",a:"Iran",d:"2026-06-21T15:00",v:"洛杉矶"},
  {id:39,g:"H",h:"Uruguay",a:"Cape Verde",d:"2026-06-21T18:00",v:"迈阿密"},{id:40,g:"G",h:"New Zealand",a:"Egypt",d:"2026-06-21T21:00",v:"温哥华"},
  {id:41,g:"J",h:"Argentina",a:"Austria",d:"2026-06-22T13:00",v:"达拉斯"},{id:42,g:"I",h:"France",a:"Iraq",d:"2026-06-22T17:00",v:"费城"},
  {id:43,g:"I",h:"Norway",a:"Senegal",d:"2026-06-22T20:00",v:"新泽西"},{id:44,g:"J",h:"Jordan",a:"Algeria",d:"2026-06-22T23:00",v:"旧金山"},
  {id:45,g:"K",h:"Portugal",a:"Uzbekistan",d:"2026-06-23T13:00",v:"休斯顿"},{id:46,g:"L",h:"England",a:"Ghana",d:"2026-06-23T16:00",v:"波士顿"},
  {id:47,g:"L",h:"Panama",a:"Croatia",d:"2026-06-23T19:00",v:"多伦多"},{id:48,g:"K",h:"Colombia",a:"DR Congo",d:"2026-06-23T22:00",v:"瓜达拉哈拉"},
  {id:49,g:"B",h:"Switzerland",a:"Canada",d:"2026-06-24T15:00",v:"温哥华"},{id:50,g:"B",h:"Bosnia & Herzegovina",a:"Qatar",d:"2026-06-24T15:00",v:"西雅图"},
  {id:51,g:"C",h:"Scotland",a:"Brazil",d:"2026-06-24T18:00",v:"迈阿密"},{id:52,g:"C",h:"Morocco",a:"Haiti",d:"2026-06-24T18:00",v:"亚特兰大"},
  {id:53,g:"A",h:"Czechia",a:"Mexico",d:"2026-06-24T21:00",v:"墨西哥城"},{id:54,g:"A",h:"South Africa",a:"South Korea",d:"2026-06-24T21:00",v:"蒙特雷"},
  {id:55,g:"E",h:"Curaçao",a:"Ivory Coast",d:"2026-06-25T16:00",v:"费城"},{id:56,g:"E",h:"Ecuador",a:"Germany",d:"2026-06-25T16:00",v:"新泽西"},
  {id:57,g:"F",h:"Japan",a:"Sweden",d:"2026-06-25T19:00",v:"达拉斯"},{id:58,g:"F",h:"Tunisia",a:"Netherlands",d:"2026-06-25T19:00",v:"堪萨斯城"},
  {id:59,g:"D",h:"Türkiye",a:"USA",d:"2026-06-25T22:00",v:"洛杉矶"},{id:60,g:"D",h:"Paraguay",a:"Australia",d:"2026-06-25T22:00",v:"旧金山"},
  {id:61,g:"I",h:"Norway",a:"France",d:"2026-06-26T15:00",v:"波士顿"},{id:62,g:"I",h:"Senegal",a:"Iraq",d:"2026-06-26T15:00",v:"多伦多"},
  {id:63,g:"H",h:"Cape Verde",a:"Saudi Arabia",d:"2026-06-26T20:00",v:"休斯顿"},{id:64,g:"H",h:"Uruguay",a:"Spain",d:"2026-06-26T20:00",v:"瓜达拉哈拉"},
  {id:65,g:"G",h:"Egypt",a:"Iran",d:"2026-06-26T23:00",v:"西雅图"},{id:66,g:"G",h:"New Zealand",a:"Belgium",d:"2026-06-26T23:00",v:"温哥华"},
  {id:67,g:"L",h:"Panama",a:"England",d:"2026-06-27T17:00",v:"新泽西"},{id:68,g:"L",h:"Croatia",a:"Ghana",d:"2026-06-27T17:00",v:"费城"},
  {id:69,g:"K",h:"Colombia",a:"Portugal",d:"2026-06-27T19:30",v:"迈阿密"},{id:70,g:"K",h:"DR Congo",a:"Uzbekistan",d:"2026-06-27T19:30",v:"亚特兰大"},
  {id:71,g:"J",h:"Algeria",a:"Austria",d:"2026-06-27T22:00",v:"堪萨斯城"},{id:72,g:"J",h:"Jordan",a:"Argentina",d:"2026-06-27T22:00",v:"达拉斯"},
];

function toBJ(s) {
  var p = s.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return new Date(Date.UTC(+p[1],+p[2]-1,+p[3],+p[4],+p[5]) + 12*3600000);
}
function ds(d) { return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0"); }

var now = new Date();
if (now.getUTCHours() + 8 - now.getHours() !== 0 && now.getUTCHours() + 8 - now.getHours() !== 24 && now.getUTCHours() + 8 - now.getHours() !== -16) {
  now = new Date(Date.now() + 8*3600000);
}
var todayS = ds(now);
var tmrw = new Date(now.getTime() + 86400000);
var tmrwS = ds(tmrw);

var todayM = [], tmrwM = [];
for (var i = 0; i < MATCHES.length; i++) {
  var m = MATCHES[i], bj = toBJ(m.d), d = ds(bj);
  var hh = String(bj.getUTCHours()).padStart(2,"0"), mm = String(bj.getUTCMinutes()).padStart(2,"0");
  var item = {m:m, time:hh+":"+mm, sort:bj.getUTCHours()*60+bj.getUTCMinutes(), ts:bj.getTime()};
  if (d === todayS) todayM.push(item);
  else if (d === tmrwS) tmrwM.push(item);
}
todayM.sort(function(a,b){return a.sort-b.sort;});
tmrwM.sort(function(a,b){return a.sort-b.sort;});

if (apiKey && (todayM.length + tmrwM.length) > 0) {
  var from = todayS, to = tmrwS;
  $httpClient.get({url:"https://api.football-data.org/v4/competitions/WC/matches?dateFrom="+from+"&dateTo="+to, headers:{"X-Auth-Token":apiKey}}, function(err,resp,data) {
    var scores = {};
    if (!err && data) {
      try { var j = JSON.parse(data); if(j.matches) for(var k=0;k<j.matches.length;k++) { var am=j.matches[k]; scores[norm(am.homeTeam.name)+"_"+norm(am.awayTeam.name)]={hs:am.score.fullTime.home!==null?am.score.fullTime.home:(am.score.halfTime.home!==null?am.score.halfTime.home:null),as:am.score.fullTime.away!==null?am.score.fullTime.away:(am.score.halfTime.away!==null?am.score.halfTime.away:null),st:am.status}; }} catch(e){}
    }
    render(todayM, tmrwM, scores);
  });
} else { render(todayM, tmrwM, {}); }

function fmtLine(item, scores) {
  var m = item.m, hF=FLAGS[m.h]||"🏳️", aF=FLAGS[m.a]||"🏳️", hC=CN[m.h]||m.h, aC=CN[m.a]||m.a;
  var icon = "⏰", sc = "";
  var mt = toBJ(m.d);
  if (now.getTime() > mt.getTime()+7200000) icon = "✅";
  else if (now.getTime() > mt.getTime()-300000) icon = "🔴";
  var key = m.h+"_"+m.a;
  if (scores[key] && scores[key].hs !== null) {
    sc = " ["+scores[key].hs+"-"+scores[key].as+"]";
    if (scores[key].st==="IN_PLAY") icon="🔴";
    else if (scores[key].st==="FINISHED") icon="✅";
  }
  return icon+" "+item.time+" "+hF+hC+" vs "+aF+aC+sc+" ["+m.g+"]";
}

function render(t, tm, sc) {
  if (t.length===0 && tm.length===0) {
    $done({title:"⚽世界杯·今日赛程", content:"今日和明日均无比赛\n\n📅 小组赛 6/12-6/28\n🏆 决赛 7/20 03:00", icon:"soccerball", "icon-color":"#8E8E93"});
    return;
  }
  var lines = [];
  if (t.length > 0) {
    lines.push("📅 今日 "+t.length+" 场");
    for (var i=0;i<t.length;i++) lines.push(fmtLine(t[i],sc));
  }
  if (tm.length > 0) {
    if (lines.length > 0) lines.push("");
    lines.push("📅 明日 "+tm.length+" 场");
    for (var i=0;i<tm.length;i++) lines.push(fmtLine(tm[i],sc));
  }
  $done({title:"⚽世界杯·今日赛程", content:lines.join("\n"), icon:"soccerball", "icon-color":"#34C759"});
}
