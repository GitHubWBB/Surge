/**
 * ⚽世界杯·最近赛程
 * Surge type=generic | 昨天/今天/明天的赛程，已完成显示比分，状态图标区分
 */

// ===== 国旗 & 中文名映射 =====
var FLAGS = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Bosnia":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭",
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

// ===== 全部72场小组赛（北京时间） =====
// d: "YYYY-MM-DDTHH:MM" 北京时间
// h/a: 主队/客队英文名, g: 小组, hs/as: 主队/客队比分(null=未结束)
// st: "F"=已结束, "L"=进行中, "U"=未开始
var M = [
  // ===== MD1: 6月12-15日 =====
  // 6月12日 周五 (开幕日)
  {d:"2026-06-12T03:00",g:"A",h:"Mexico",a:"South Africa",hs:2,as:0,st:"F"},
  {d:"2026-06-12T09:00",g:"A",h:"South Korea",a:"Czechia",hs:2,as:1,st:"F"},
  // 6月13日 周六
  {d:"2026-06-13T03:00",g:"B",h:"Canada",a:"Bosnia",hs:1,as:1,st:"F"},
  {d:"2026-06-13T09:00",g:"D",h:"USA",a:"Paraguay",hs:4,as:1,st:"F"},
  // 6月14日 周日
  {d:"2026-06-14T00:00",g:"D",h:"Australia",a:"Turkiye",hs:2,as:0,st:"F"},
  {d:"2026-06-14T03:00",g:"B",h:"Qatar",a:"Switzerland",hs:1,as:1,st:"F"},
  {d:"2026-06-14T06:00",g:"C",h:"Brazil",a:"Morocco",hs:1,as:1,st:"F"},
  {d:"2026-06-14T09:00",g:"C",h:"Haiti",a:"Scotland",hs:0,as:1,st:"F"},
  // 6月15日 周一
  {d:"2026-06-15T01:00",g:"E",h:"Germany",a:"Curacao",hs:7,as:1,st:"F"},
  {d:"2026-06-15T04:00",g:"F",h:"Netherlands",a:"Japan",hs:2,as:2,st:"F"},
  {d:"2026-06-15T07:00",g:"E",h:"Ivory Coast",a:"Ecuador",hs:1,as:0,st:"F"},
  {d:"2026-06-15T10:00",g:"F",h:"Sweden",a:"Tunisia",hs:5,as:1,st:"F"},
  // 6月16日 周二
  {d:"2026-06-16T00:00",g:"H",h:"Spain",a:"Cape Verde",hs:0,as:0,st:"F"},
  {d:"2026-06-16T03:00",g:"G",h:"Belgium",a:"Egypt",hs:1,as:1,st:"F"},
  {d:"2026-06-16T06:00",g:"H",h:"Saudi Arabia",a:"Uruguay",hs:1,as:1,st:"F"},
  {d:"2026-06-16T09:00",g:"G",h:"Iran",a:"New Zealand",hs:2,as:2,st:"F"},
  // 6月17日 周三
  {d:"2026-06-17T03:00",g:"I",h:"France",a:"Senegal",hs:3,as:1,st:"F"},
  {d:"2026-06-17T06:00",g:"I",h:"Iraq",a:"Norway",hs:1,as:4,st:"F"},
  {d:"2026-06-17T09:00",g:"J",h:"Argentina",a:"Algeria",hs:3,as:0,st:"F"},
  {d:"2026-06-17T12:00",g:"J",h:"Austria",a:"Jordan",hs:3,as:1,st:"F"},
  // 6月18日 周四
  {d:"2026-06-18T01:00",g:"K",h:"Portugal",a:"DR Congo",hs:1,as:1,st:"F"},
  {d:"2026-06-18T04:00",g:"L",h:"England",a:"Croatia",hs:4,as:2,st:"F"},
  {d:"2026-06-18T07:00",g:"L",h:"Ghana",a:"Panama",hs:1,as:0,st:"F"},
  {d:"2026-06-18T10:00",g:"K",h:"Uzbekistan",a:"Colombia",hs:1,as:3,st:"F"},
  // ===== MD2: 6月19-24日 =====
  // 6月19日 周五
  {d:"2026-06-19T00:00",g:"A",h:"Czechia",a:"South Africa",hs:1,as:1,st:"F"},
  {d:"2026-06-19T03:00",g:"B",h:"Switzerland",a:"Bosnia",hs:4,as:1,st:"F"},
  {d:"2026-06-19T06:00",g:"B",h:"Canada",a:"Qatar",hs:6,as:0,st:"F"},
  {d:"2026-06-19T09:00",g:"A",h:"Mexico",a:"South Korea",hs:null,as:null,st:"U"},
  // 6月20日 周六
  {d:"2026-06-20T03:00",g:"D",h:"USA",a:"Australia",hs:null,as:null,st:"U"},
  {d:"2026-06-20T06:00",g:"C",h:"Scotland",a:"Morocco",hs:null,as:null,st:"U"},
  {d:"2026-06-20T08:30",g:"C",h:"Brazil",a:"Haiti",hs:null,as:null,st:"U"},
  {d:"2026-06-20T11:00",g:"D",h:"Turkiye",a:"Paraguay",hs:null,as:null,st:"U"},
  // 6月21日 周日
  {d:"2026-06-21T01:00",g:"F",h:"Netherlands",a:"Sweden",hs:null,as:null,st:"U"},
  {d:"2026-06-21T04:00",g:"E",h:"Germany",a:"Ivory Coast",hs:null,as:null,st:"U"},
  {d:"2026-06-21T08:00",g:"E",h:"Ecuador",a:"Curacao",hs:null,as:null,st:"U"},
  {d:"2026-06-21T12:00",g:"F",h:"Tunisia",a:"Japan",hs:null,as:null,st:"U"},
  // 6月22日 周一
  {d:"2026-06-22T00:00",g:"H",h:"Spain",a:"Saudi Arabia",hs:null,as:null,st:"U"},
  {d:"2026-06-22T03:00",g:"G",h:"Belgium",a:"Iran",hs:null,as:null,st:"U"},
  {d:"2026-06-22T06:00",g:"H",h:"Uruguay",a:"Cape Verde",hs:null,as:null,st:"U"},
  {d:"2026-06-22T09:00",g:"G",h:"New Zealand",a:"Egypt",hs:null,as:null,st:"U"},
  // 6月23日 周二
  {d:"2026-06-23T01:00",g:"J",h:"Argentina",a:"Austria",hs:null,as:null,st:"U"},
  {d:"2026-06-23T05:00",g:"I",h:"France",a:"Iraq",hs:null,as:null,st:"U"},
  {d:"2026-06-23T08:00",g:"I",h:"Norway",a:"Senegal",hs:null,as:null,st:"U"},
  {d:"2026-06-23T11:00",g:"J",h:"Jordan",a:"Algeria",hs:null,as:null,st:"U"},
  // ===== MD3: 6月25-29日 =====
  // 6月25日 周四
  {d:"2026-06-25T01:00",g:"K",h:"Portugal",a:"Uzbekistan",hs:null,as:null,st:"U"},
  {d:"2026-06-25T04:00",g:"L",h:"England",a:"Ghana",hs:null,as:null,st:"U"},
  {d:"2026-06-25T07:00",g:"L",h:"Panama",a:"Croatia",hs:null,as:null,st:"U"},
  {d:"2026-06-25T09:00",g:"A",h:"Czechia",a:"Mexico",hs:null,as:null,st:"U"},
  {d:"2026-06-25T09:00",g:"A",h:"South Africa",a:"South Korea",hs:null,as:null,st:"U"},
  {d:"2026-06-25T10:00",g:"K",h:"Colombia",a:"DR Congo",hs:null,as:null,st:"U"},
  // 6月26日 周五
  {d:"2026-06-26T03:00",g:"B",h:"Switzerland",a:"Canada",hs:null,as:null,st:"U"},
  {d:"2026-06-26T03:00",g:"B",h:"Bosnia",a:"Qatar",hs:null,as:null,st:"U"},
  {d:"2026-06-26T06:00",g:"C",h:"Scotland",a:"Brazil",hs:null,as:null,st:"U"},
  {d:"2026-06-26T06:00",g:"C",h:"Morocco",a:"Haiti",hs:null,as:null,st:"U"},
  // 6月27日 周六
  {d:"2026-06-27T04:00",g:"E",h:"Curacao",a:"Ivory Coast",hs:null,as:null,st:"U"},
  {d:"2026-06-27T04:00",g:"E",h:"Ecuador",a:"Germany",hs:null,as:null,st:"U"},
  {d:"2026-06-27T07:00",g:"F",h:"Japan",a:"Sweden",hs:null,as:null,st:"U"},
  {d:"2026-06-27T07:00",g:"F",h:"Tunisia",a:"Netherlands",hs:null,as:null,st:"U"},
  {d:"2026-06-27T10:00",g:"D",h:"Turkiye",a:"USA",hs:null,as:null,st:"U"},
  {d:"2026-06-27T10:00",g:"D",h:"Paraguay",a:"Australia",hs:null,as:null,st:"U"},
  // 6月28日 周日
  {d:"2026-06-28T03:00",g:"I",h:"Norway",a:"France",hs:null,as:null,st:"U"},
  {d:"2026-06-28T03:00",g:"I",h:"Senegal",a:"Iraq",hs:null,as:null,st:"U"},
  {d:"2026-06-28T08:00",g:"H",h:"Cape Verde",a:"Saudi Arabia",hs:null,as:null,st:"U"},
  {d:"2026-06-28T08:00",g:"H",h:"Uruguay",a:"Spain",hs:null,as:null,st:"U"},
  {d:"2026-06-28T11:00",g:"G",h:"Egypt",a:"Iran",hs:null,as:null,st:"U"},
  {d:"2026-06-28T11:00",g:"G",h:"New Zealand",a:"Belgium",hs:null,as:null,st:"U"},
  // 6月29日 周一
  {d:"2026-06-29T05:00",g:"L",h:"Panama",a:"England",hs:null,as:null,st:"U"},
  {d:"2026-06-29T05:00",g:"L",h:"Croatia",a:"Ghana",hs:null,as:null,st:"U"},
  {d:"2026-06-29T07:30",g:"K",h:"Colombia",a:"Portugal",hs:null,as:null,st:"U"},
  {d:"2026-06-29T07:30",g:"K",h:"DR Congo",a:"Uzbekistan",hs:null,as:null,st:"U"},
  {d:"2026-06-29T10:00",g:"J",h:"Algeria",a:"Austria",hs:null,as:null,st:"U"},
  {d:"2026-06-29T10:00",g:"J",h:"Jordan",a:"Argentina",hs:null,as:null,st:"U"}
];

// ===== 工具函数 =====
var WEEKDAYS = ["周日","周一","周二","周三","周四","周五","周六"];

function parseBJ(s) {
  var p = s.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return new Date(Date.UTC(+p[1],+p[2]-1,+p[3],+p[4],+p[5]) - 8*3600000);
}
function getBJNow() {
  var n = new Date();
  return new Date(n.getTime() + 8*3600000);
}
function fmtDate(d) {
  return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0");
}
function fmtDateCN(d) {
  return (d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日"+WEEKDAYS[d.getUTCDay()];
}
function fmtTime(s) {
  var p = s.match(/T(\d{2}):(\d{2})/);
  return p[1]+":"+p[2];
}
function getDateStr(s) {
  return s.substring(0,10);
}

// ===== 主逻辑 =====
var now = getBJNow();
var todayS = fmtDate(now);
var yestObj = new Date(now.getTime() - 86400000);
var yestS = fmtDate(yestObj);
var tmrwObj = new Date(now.getTime() + 86400000);
var tmrwS = fmtDate(tmrwObj);
var nowMs = now.getTime();

// 动态判断比赛状态
function getMatchStatus(m) {
  var matchUTC = parseBJ(m.d);
  var matchMs = matchUTC.getTime();
  var elapsed = nowMs - matchMs;
  if (m.st === "F" || (elapsed > 2*3600000 && m.hs !== null)) {
    return "F"; // 已结束
  } else if (elapsed > -300000 && elapsed < 7200000 && m.hs === null) {
    // 开赛前后120分钟内且无比分，可能是进行中
    if (elapsed > 0) return "L"; // 进行中
  }
  return "U"; // 未开始
}

// 按日期分组
var days = {};
for (var i = 0; i < M.length; i++) {
  var ds = getDateStr(M[i].d);
  if (ds === yestS || ds === todayS || ds === tmrwS) {
    if (!days[ds]) days[ds] = [];
    days[ds].push(M[i]);
  }
}

// 排序每天的场次
var dayKeys = [yestS, todayS, tmrwS];
for (var dk = 0; dk < dayKeys.length; dk++) {
  if (days[dayKeys[dk]]) {
    days[dayKeys[dk]].sort(function(a,b) {
      return a.d < b.d ? -1 : 1;
    });
  }
}

// 构建输出
var lines = [];
var dayLabels = {};
dayLabels[yestS] = "昨天";
dayLabels[todayS] = "今天";
dayLabels[tmrwS] = "明天";

for (var dk = 0; dk < dayKeys.length; dk++) {
  var key = dayKeys[dk];
  var matches = days[key];
  if (!matches || matches.length === 0) continue;

  // 日期标题行
  var bjDate = new Date(parseBJ(matches[0].d).getTime() + 8*3600000);
  lines.push("━━━ " + dayLabels[key] + " " + fmtDateCN(bjDate) + " ━━━");

  for (var mi = 0; mi < matches.length; mi++) {
    var m = matches[mi];
    var st = getMatchStatus(m);
    var hF = FLAGS[m.h] || "🏳️", aF = FLAGS[m.a] || "🏳️";
    var hC = CN[m.h] || m.h, aC = CN[m.a] || m.a;
    var time = fmtTime(m.d);

    if (st === "F") {
      // ✅ 已结束 — 显示比分
      lines.push("✅ " + hF+hC + " " + m.hs + "-" + m.as + " " + aF+aC + " ["+m.g+"组]");
    } else if (st === "L") {
      // 🔴 进行中
      lines.push("🔴 " + time + " " + hF+hC + " vs " + aF+aC + " ["+m.g+"组]");
    } else {
      // ⏰ 未开始 — 显示时间 + 倒计时
      var matchUTC = parseBJ(m.d);
      var mins = Math.round((matchUTC.getTime() - nowMs) / 60000);
      var tag = "";
      if (mins > 0 && mins <= 180) tag = " (" + mins + "分钟后)";
      lines.push("⏰ " + time + " " + hF+hC + " vs " + aF+aC + " ["+m.g+"组]" + tag);
    }
  }

  // 组间空行（非最后一天时）
  if (dk < dayKeys.length - 1 && days[dayKeys[dk+1]]) lines.push("");
}

if (lines.length === 0) {
  $done({
    title: "⚽世界杯·最近赛程",
    content: "近三天暂无比赛安排\n\n小组赛 6/14-6/29\n淘汰赛 7/1起\n决赛 7/20 03:00",
    icon: "soccerball", "icon-color": "#8E8E93"
  });
} else {
  $done({
    title: "⚽世界杯·最近赛程",
    content: lines.join("\n"),
    icon: "soccerball", "icon-color": "#34C759"
  });
}
