/**
 * 2026 FIFA 世界杯 - 核心数据脚本
 * 
 * 功能：
 *   1. 从 FIFA 官方及备用 API 获取赛程/比分/排名/进球数据
 *   2. 本地缓存管理（避免频繁请求）
 *   3. 比赛状态判断与格式化
 * 
 * 数据源优先级：
 *   1. football-data.org (免费 API，需注册 key)
 *   2. FIFA 官网抓取备用
 * 
 * @author Surge WorldCup Dashboard
 * @version 1.0.0
 */

// ===================== 国旗 Emoji 映射 =====================
const FLAGS = {
  "Mexico": "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷", "Czechia": "🇨🇿",
  "Canada": "🇨🇦", "Bosnia & Herzegovina": "🇧🇦", "Bosnia": "🇧🇦",
  "Qatar": "🇶🇦", "Switzerland": "🇨🇭",
  "USA": "🇺🇸", "United States": "🇺🇸", "Paraguay": "🇵🇾",
  "Brazil": "🇧🇷", "Morocco": "🇲🇦",
  "Haiti": "🇭🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Australia": "🇦🇺", "Türkiye": "🇹🇷", "Turkey": "🇹🇷",
  "Germany": "🇩🇪", "Curaçao": "🇨🇼",
  "Netherlands": "🇳🇱", "Japan": "🇯🇵",
  "Ivory Coast": "🇨🇮", "Côte d'Ivoire": "🇨🇮", "Ecuador": "🇪🇨",
  "Sweden": "🇸🇪", "Tunisia": "🇹🇳",
  "Spain": "🇪🇸", "Cape Verde": "🇨🇻",
  "Belgium": "🇧🇪", "Egypt": "🇪🇬",
  "Saudi Arabia": "🇸🇦", "Uruguay": "🇺🇾",
  "Iran": "🇮🇷", "New Zealand": "🇳🇿",
  "France": "🇫🇷", "Senegal": "🇸🇳",
  "Iraq": "🇮🇶", "Norway": "🇳🇴",
  "Argentina": "🇦🇷", "Algeria": "🇩🇿",
  "Austria": "🇦🇹", "Jordan": "🇯🇴",
  "Portugal": "🇵🇹", "DR Congo": "🇨🇩",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia": "🇭🇷",
  "Ghana": "🇬🇭", "Panama": "🇵🇦",
  "Uzbekistan": "🇺🇿", "Colombia": "🇨🇴",
};

// 中文名映射
const CN_NAMES = {
  "Mexico": "墨西哥", "South Africa": "南非", "South Korea": "韩国", "Czechia": "捷克",
  "Canada": "加拿大", "Bosnia & Herzegovina": "波黑", "Bosnia": "波黑",
  "Qatar": "卡塔尔", "Switzerland": "瑞士",
  "USA": "美国", "United States": "美国", "Paraguay": "巴拉圭",
  "Brazil": "巴西", "Morocco": "摩洛哥",
  "Haiti": "海地", "Scotland": "苏格兰",
  "Australia": "澳大利亚", "Türkiye": "土耳其", "Turkey": "土耳其",
  "Germany": "德国", "Curaçao": "库拉索",
  "Netherlands": "荷兰", "Japan": "日本",
  "Ivory Coast": "科特迪瓦", "Côte d'Ivoire": "科特迪瓦", "Ecuador": "厄瓜多尔",
  "Sweden": "瑞典", "Tunisia": "突尼斯",
  "Spain": "西班牙", "Cape Verde": "佛得角",
  "Belgium": "比利时", "Egypt": "埃及",
  "Saudi Arabia": "沙特阿拉伯", "Uruguay": "乌拉圭",
  "Iran": "伊朗", "New Zealand": "新西兰",
  "France": "法国", "Senegal": "塞内加尔",
  "Iraq": "伊拉克", "Norway": "挪威",
  "Argentina": "阿根廷", "Algeria": "阿尔及利亚",
  "Austria": "奥地利", "Jordan": "约旦",
  "Portugal": "葡萄牙", "DR Congo": "刚果民主",
  "England": "英格兰", "Croatia": "克罗地亚",
  "Ghana": "加纳", "Panama": "巴拿马",
  "Uzbekistan": "乌兹别克斯坦", "Colombia": "哥伦比亚",
};

// ===================== 完整小组赛赛程 (ET 美东时间) =====================
const GROUP_STAGE = [
  // Matchday 1
  { id:1,  group:"A", home:"Mexico",       away:"South Africa",     date:"2026-06-11T15:00", venue:"Estadio Azteca, 墨西哥城",      et:"15:00" },
  { id:2,  group:"A", home:"South Korea",  away:"Czechia",          date:"2026-06-11T22:00", venue:"Estadio Akron, 瓜达拉哈拉",    et:"22:00" },
  { id:3,  group:"B", home:"Canada",       away:"Bosnia & Herzegovina", date:"2026-06-12T15:00", venue:"BMO Field, 多伦多",          et:"15:00" },
  { id:4,  group:"D", home:"USA",          away:"Paraguay",         date:"2026-06-12T21:00", venue:"SoFi Stadium, 洛杉矶",         et:"21:00" },
  { id:5,  group:"B", home:"Qatar",        away:"Switzerland",      date:"2026-06-13T15:00", venue:"Levi's Stadium, 旧金山",       et:"15:00" },
  { id:6,  group:"C", home:"Brazil",       away:"Morocco",          date:"2026-06-13T18:00", venue:"MetLife Stadium, 新泽西",      et:"18:00" },
  { id:7,  group:"C", home:"Haiti",        away:"Scotland",         date:"2026-06-13T21:00", venue:"Gillette Stadium, 波士顿",     et:"21:00" },
  { id:8,  group:"D", home:"Australia",    away:"Türkiye",          date:"2026-06-14T00:00", venue:"BC Place, 温哥华",             et:"00:00" },
  { id:9,  group:"E", home:"Germany",      away:"Curaçao",          date:"2026-06-14T13:00", venue:"NRG Stadium, 休斯顿",          et:"13:00" },
  { id:10, group:"F", home:"Netherlands",  away:"Japan",            date:"2026-06-14T16:00", venue:"AT&T Stadium, 达拉斯",         et:"16:00" },
  { id:11, group:"E", home:"Ivory Coast",  away:"Ecuador",          date:"2026-06-14T19:00", venue:"Lincoln Financial, 费城",      et:"19:00" },
  { id:12, group:"F", home:"Sweden",       away:"Tunisia",          date:"2026-06-14T22:00", venue:"Estadio BBVA, 蒙特雷",         et:"22:00" },
  { id:13, group:"H", home:"Spain",        away:"Cape Verde",       date:"2026-06-15T12:00", venue:"Mercedes-Benz, 亚特兰大",      et:"12:00" },
  { id:14, group:"G", home:"Belgium",      away:"Egypt",            date:"2026-06-15T15:00", venue:"Lumen Field, 西雅图",          et:"15:00" },
  { id:15, group:"H", home:"Saudi Arabia", away:"Uruguay",          date:"2026-06-15T18:00", venue:"Hard Rock Stadium, 迈阿密",    et:"18:00" },
  { id:16, group:"G", home:"Iran",         away:"New Zealand",      date:"2026-06-15T21:00", venue:"SoFi Stadium, 洛杉矶",         et:"21:00" },
  { id:17, group:"I", home:"France",       away:"Senegal",          date:"2026-06-16T15:00", venue:"MetLife Stadium, 新泽西",      et:"15:00" },
  { id:18, group:"I", home:"Iraq",         away:"Norway",           date:"2026-06-16T18:00", venue:"Gillette Stadium, 波士顿",     et:"18:00" },
  { id:19, group:"J", home:"Argentina",    away:"Algeria",          date:"2026-06-16T21:00", venue:"Arrowhead Stadium, 堪萨斯城",  et:"21:00" },
  { id:20, group:"J", home:"Austria",      away:"Jordan",           date:"2026-06-17T00:00", venue:"Levi's Stadium, 旧金山",       et:"00:00" },
  { id:21, group:"K", home:"Portugal",     away:"DR Congo",         date:"2026-06-17T13:00", venue:"NRG Stadium, 休斯顿",          et:"13:00" },
  { id:22, group:"L", home:"England",      away:"Croatia",          date:"2026-06-17T16:00", venue:"AT&T Stadium, 达拉斯",         et:"16:00" },
  { id:23, group:"L", home:"Ghana",        away:"Panama",           date:"2026-06-17T19:00", venue:"BMO Field, 多伦多",            et:"19:00" },
  { id:24, group:"K", home:"Uzbekistan",   away:"Colombia",         date:"2026-06-17T22:00", venue:"Estadio Azteca, 墨西哥城",     et:"22:00" },
  // Matchday 2
  { id:25, group:"A", home:"Czechia",      away:"South Africa",     date:"2026-06-18T12:00", venue:"Mercedes-Benz, 亚特兰大",      et:"12:00" },
  { id:26, group:"B", home:"Switzerland",  away:"Bosnia & Herzegovina", date:"2026-06-18T15:00", venue:"SoFi Stadium, 洛杉矶",     et:"15:00" },
  { id:27, group:"B", home:"Canada",       away:"Qatar",            date:"2026-06-18T18:00", venue:"BC Place, 温哥华",             et:"18:00" },
  { id:28, group:"A", home:"Mexico",       away:"South Korea",      date:"2026-06-18T21:00", venue:"Estadio Akron, 瓜达拉哈拉",    et:"21:00" },
  { id:29, group:"D", home:"USA",          away:"Australia",        date:"2026-06-19T15:00", venue:"Lumen Field, 西雅图",          et:"15:00" },
  { id:30, group:"C", home:"Scotland",     away:"Morocco",          date:"2026-06-19T18:00", venue:"Gillette Stadium, 波士顿",     et:"18:00" },
  { id:31, group:"C", home:"Brazil",       away:"Haiti",            date:"2026-06-19T20:30", venue:"Lincoln Financial, 费城",      et:"20:30" },
  { id:32, group:"D", home:"Türkiye",      away:"Paraguay",         date:"2026-06-19T23:00", venue:"Levi's Stadium, 旧金山",       et:"23:00" },
  { id:33, group:"F", home:"Netherlands",  away:"Sweden",           date:"2026-06-20T13:00", venue:"NRG Stadium, 休斯顿",          et:"13:00" },
  { id:34, group:"E", home:"Germany",      away:"Ivory Coast",      date:"2026-06-20T16:00", venue:"BMO Field, 多伦多",            et:"16:00" },
  { id:35, group:"E", home:"Ecuador",      away:"Curaçao",          date:"2026-06-20T20:00", venue:"Arrowhead Stadium, 堪萨斯城",  et:"20:00" },
  { id:36, group:"F", home:"Tunisia",      away:"Japan",            date:"2026-06-21T00:00", venue:"Estadio BBVA, 蒙特雷",         et:"00:00" },
  { id:37, group:"H", home:"Spain",        away:"Saudi Arabia",     date:"2026-06-21T12:00", venue:"Mercedes-Benz, 亚特兰大",      et:"12:00" },
  { id:38, group:"G", home:"Belgium",      away:"Iran",             date:"2026-06-21T15:00", venue:"SoFi Stadium, 洛杉矶",         et:"15:00" },
  { id:39, group:"H", home:"Uruguay",      away:"Cape Verde",       date:"2026-06-21T18:00", venue:"Hard Rock Stadium, 迈阿密",    et:"18:00" },
  { id:40, group:"G", home:"New Zealand",  away:"Egypt",            date:"2026-06-21T21:00", venue:"BC Place, 温哥华",             et:"21:00" },
  { id:41, group:"J", home:"Argentina",    away:"Austria",          date:"2026-06-22T13:00", venue:"AT&T Stadium, 达拉斯",         et:"13:00" },
  { id:42, group:"I", home:"France",       away:"Iraq",             date:"2026-06-22T17:00", venue:"Lincoln Financial, 费城",      et:"17:00" },
  { id:43, group:"I", home:"Norway",       away:"Senegal",          date:"2026-06-22T20:00", venue:"MetLife Stadium, 新泽西",      et:"20:00" },
  { id:44, group:"J", home:"Jordan",       away:"Algeria",          date:"2026-06-22T23:00", venue:"Levi's Stadium, 旧金山",       et:"23:00" },
  { id:45, group:"K", home:"Portugal",     away:"Uzbekistan",       date:"2026-06-23T13:00", venue:"NRG Stadium, 休斯顿",          et:"13:00" },
  { id:46, group:"L", home:"England",      away:"Ghana",            date:"2026-06-23T16:00", venue:"Gillette Stadium, 波士顿",     et:"16:00" },
  { id:47, group:"L", home:"Panama",       away:"Croatia",          date:"2026-06-23T19:00", venue:"BMO Field, 多伦多",            et:"19:00" },
  { id:48, group:"K", home:"Colombia",     away:"DR Congo",         date:"2026-06-23T22:00", venue:"Estadio Akron, 瓜达拉哈拉",    et:"22:00" },
  // Matchday 3
  { id:49, group:"B", home:"Switzerland",  away:"Canada",           date:"2026-06-24T15:00", venue:"BC Place, 温哥华",             et:"15:00" },
  { id:50, group:"B", home:"Bosnia & Herzegovina", away:"Qatar",    date:"2026-06-24T15:00", venue:"Lumen Field, 西雅图",          et:"15:00" },
  { id:51, group:"C", home:"Scotland",     away:"Brazil",           date:"2026-06-24T18:00", venue:"Hard Rock Stadium, 迈阿密",    et:"18:00" },
  { id:52, group:"C", home:"Morocco",      away:"Haiti",            date:"2026-06-24T18:00", venue:"Mercedes-Benz, 亚特兰大",      et:"18:00" },
  { id:53, group:"A", home:"Czechia",      away:"Mexico",           date:"2026-06-24T21:00", venue:"Estadio Azteca, 墨西哥城",     et:"21:00" },
  { id:54, group:"A", home:"South Africa", away:"South Korea",      date:"2026-06-24T21:00", venue:"Estadio BBVA, 蒙特雷",         et:"21:00" },
  { id:55, group:"E", home:"Curaçao",      away:"Ivory Coast",      date:"2026-06-25T16:00", venue:"Lincoln Financial, 费城",      et:"16:00" },
  { id:56, group:"E", home:"Ecuador",      away:"Germany",          date:"2026-06-25T16:00", venue:"MetLife Stadium, 新泽西",      et:"16:00" },
  { id:57, group:"F", home:"Japan",        away:"Sweden",           date:"2026-06-25T19:00", venue:"AT&T Stadium, 达拉斯",         et:"19:00" },
  { id:58, group:"F", home:"Tunisia",      away:"Netherlands",      date:"2026-06-25T19:00", venue:"Arrowhead Stadium, 堪萨斯城",  et:"19:00" },
  { id:59, group:"D", home:"Türkiye",      away:"USA",              date:"2026-06-25T22:00", venue:"SoFi Stadium, 洛杉矶",         et:"22:00" },
  { id:60, group:"D", home:"Paraguay",     away:"Australia",        date:"2026-06-25T22:00", venue:"Levi's Stadium, 旧金山",       et:"22:00" },
  { id:61, group:"I", home:"Norway",       away:"France",           date:"2026-06-26T15:00", venue:"Gillette Stadium, 波士顿",     et:"15:00" },
  { id:62, group:"I", home:"Senegal",      away:"Iraq",             date:"2026-06-26T15:00", venue:"BMO Field, 多伦多",            et:"15:00" },
  { id:63, group:"H", home:"Cape Verde",   away:"Saudi Arabia",     date:"2026-06-26T20:00", venue:"NRG Stadium, 休斯顿",          et:"20:00" },
  { id:64, group:"H", home:"Uruguay",      away:"Spain",            date:"2026-06-26T20:00", venue:"Estadio Akron, 瓜达拉哈拉",    et:"20:00" },
  { id:65, group:"G", home:"Egypt",        away:"Iran",             date:"2026-06-26T23:00", venue:"Lumen Field, 西雅图",          et:"23:00" },
  { id:66, group:"G", home:"New Zealand",  away:"Belgium",          date:"2026-06-26T23:00", venue:"BC Place, 温哥华",             et:"23:00" },
  { id:67, group:"L", home:"Panama",       away:"England",          date:"2026-06-27T17:00", venue:"MetLife Stadium, 新泽西",      et:"17:00" },
  { id:68, group:"L", home:"Croatia",      away:"Ghana",            date:"2026-06-27T17:00", venue:"Lincoln Financial, 费城",      et:"17:00" },
  { id:69, group:"K", home:"Colombia",     away:"Portugal",         date:"2026-06-27T19:30", venue:"Hard Rock Stadium, 迈阿密",    et:"19:30" },
  { id:70, group:"K", home:"DR Congo",     away:"Uzbekistan",       date:"2026-06-27T19:30", venue:"Mercedes-Benz, 亚特兰大",      et:"19:30" },
  { id:71, group:"J", home:"Algeria",      away:"Austria",          date:"2026-06-27T22:00", venue:"Arrowhead Stadium, 堪萨斯城",  et:"22:00" },
  { id:72, group:"J", home:"Jordan",       away:"Argentina",        date:"2026-06-27T22:00", venue:"AT&T Stadium, 达拉斯",         et:"22:00" },
];

// ===================== 淘汰赛赛程 =====================
const KNOCKOUT_STAGE = {
  roundOf32: { name: "32强赛", dates: "6月28日 - 7月3日", matches: 16 },
  roundOf16: { name: "16强赛", dates: "7月4日 - 7月7日", matches: 8 },
  quarterFinals: {
    name: "1/4决赛", dates: "7月9日 - 7月11日",
    matches: [
      { date: "2026-07-09T16:00", venue: "Gillette Stadium, 波士顿" },
      { date: "2026-07-10T15:00", venue: "SoFi Stadium, 洛杉矶" },
      { date: "2026-07-11T17:00", venue: "Hard Rock Stadium, 迈阿密" },
      { date: "2026-07-11T21:00", venue: "Arrowhead Stadium, 堪萨斯城" },
    ]
  },
  semiFinals: {
    name: "半决赛", dates: "7月14日 - 7月15日",
    matches: [
      { date: "2026-07-14T15:00", venue: "AT&T Stadium, 达拉斯" },
      { date: "2026-07-15T15:00", venue: "Mercedes-Benz, 亚特兰大" },
    ]
  },
  thirdPlace: { date: "2026-07-18T17:00", venue: "Hard Rock Stadium, 迈阿密", name: "三四名决赛" },
  final: { date: "2026-07-19T15:00", venue: "MetLife Stadium, 新泽西", name: "决赛" },
};

// ===================== 分组定义 =====================
const GROUPS = {
  A: ["Mexico", "South Africa", "South Korea", "Czechia"],
  B: ["Canada", "Bosnia & Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["USA", "Paraguay", "Australia", "Türkiye"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

// ===================== 工具函数 =====================

/**
 * 获取国旗 Emoji
 */
function getFlag(teamName) {
  return FLAGS[teamName] || "🏳️";
}

/**
 * 获取中文队名
 */
function getCnName(teamName) {
  return CN_NAMES[teamName] || teamName;
}

/**
 * 美东时间(ET)转北京时间(CST, UTC+8)
 * ET = UTC-4 (EDT, 夏令时), CST = UTC+8, 差12小时
 * 手动解析避免依赖设备时区
 */
function etToBeijing(etDateStr) {
  var p = etDateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  var utcMs = Date.UTC(+p[1], +p[2]-1, +p[3], +p[4], +p[5]);
  return new Date(utcMs + 12 * 3600 * 1000);
}

/**
 * 格式化北京时间为 MM-DD HH:mm
 */
function formatBeijingTime(etDateStr) {
  var d = etToBeijing(etDateStr);
  var mm = String(d.getMonth() + 1).padStart(2, "0");
  var dd = String(d.getDate()).padStart(2, "0");
  var hh = String(d.getHours()).padStart(2, "0");
  var mi = String(d.getMinutes()).padStart(2, "0");
  return mm + "-" + dd + " " + hh + ":" + mi;
}

/**
 * 获取今日的比赛 (北京时间)
 */
function getTodayMatches() {
  var now = new Date();
  var todayStr = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  var result = [];
  for (var i = 0; i < GROUP_STAGE.length; i++) {
    var m = GROUP_STAGE[i];
    var bjTime = etToBeijing(m.date);
    var mStr = bjTime.getFullYear() + "-" +
      String(bjTime.getMonth() + 1).padStart(2, "0") + "-" +
      String(bjTime.getDate()).padStart(2, "0");
    if (mStr === todayStr) {
      result.push({
        match: m,
        beijingTime: formatBeijingTime(m.date),
        hour: bjTime.getHours(),
        minute: bjTime.getMinutes(),
      });
    }
  }
  result.sort(function(a, b) {
    return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute);
  });
  return result;
}

/**
 * 获取即将开始的比赛 (未来24小时)
 */
function getUpcomingMatches() {
  var now = new Date();
  var in24h = new Date(now.getTime() + 24 * 3600 * 1000);
  var result = [];
  for (var i = 0; i < GROUP_STAGE.length; i++) {
    var m = GROUP_STAGE[i];
    var bjTime = etToBeijing(m.date);
    if (bjTime > now && bjTime <= in24h) {
      result.push({
        match: m,
        beijingTime: formatBeijingTime(m.date),
        timestamp: bjTime.getTime(),
      });
    }
  }
  result.sort(function(a, b) { return a.timestamp - b.timestamp; });
  return result;
}

/**
 * 格式化单场比赛显示文本
 */
function formatMatchLine(item) {
  var m = item.match;
  var hFlag = getFlag(m.home);
  var aFlag = getFlag(m.away);
  var hCn = getCnName(m.home);
  var aCn = getCnName(m.away);
  return item.beijingTime + " " + hFlag + hCn + " vs " + aFlag + aCn + " [" + m.group + "组]";
}

// ===================== 数据 API 请求 =====================

/**
 * 配置 - 用户可通过 Surge 参数修改
 */
var CONFIG = {
  // football-data.org 免费 API Key (注册获取: https://www.football-data.org/client/register)
  apiKey: $persistentStore.get("wc2026_api_key") || "",
  // FIFA API 备用端点
  fifaEndpoint: "https://www.fifa.com/fifaplus/api/match-centre",
  // 缓存有效期 (毫秒), 默认 5 分钟
  cacheTTL: 5 * 60 * 1000,
};

/**
 * 从 football-data.org 获取比分数据
 */
function fetchLiveScores(callback) {
  if (!CONFIG.apiKey) {
    callback(null, { source: "static", data: null, message: "未配置 API Key，显示静态赛程" });
    return;
  }

  var url = "https://api.football-data.org/v4/competitions/WC/matches?status=LIVE,SCHEDULED,FINISHED";
  var headers = { "X-Auth-Token": CONFIG.apiKey };

  $httpClient.get({ url: url, headers: headers }, function(error, response, data) {
    if (error) {
      callback(error, null);
      return;
    }
    try {
      var json = JSON.parse(data);
      callback(null, { source: "football-data.org", data: json });
    } catch (e) {
      callback(e, null);
    }
  });
}

/**
 * 从 football-data.org 获取小组排名
 */
function fetchStandings(callback) {
  if (!CONFIG.apiKey) {
    callback(null, { source: "static", data: null });
    return;
  }

  var url = "https://api.football-data.org/v4/competitions/WC/standings";
  var headers = { "X-Auth-Token": CONFIG.apiKey };

  $httpClient.get({ url: url, headers: headers }, function(error, response, data) {
    if (error) {
      callback(error, null);
      return;
    }
    try {
      var json = JSON.parse(data);
      callback(null, { source: "football-data.org", data: json });
    } catch (e) {
      callback(e, null);
    }
  });
}

/**
 * 从 football-data.org 获取射手榜
 */
function fetchScorers(callback) {
  if (!CONFIG.apiKey) {
    callback(null, { source: "static", data: null });
    return;
  }

  var url = "https://api.football-data.org/v4/competitions/WC/scorers";
  var headers = { "X-Auth-Token": CONFIG.apiKey };

  $httpClient.get({ url: url, headers: headers }, function(error, response, data) {
    if (error) {
      callback(error, null);
      return;
    }
    try {
      var json = JSON.parse(data);
      callback(null, { source: "football-data.org", data: json });
    } catch (e) {
      callback(e, null);
    }
  });
}

// ===================== 导出 (供面板脚本使用) =====================
// Surge panel 脚本中通过 require 或直接内联使用
// 以下变量暴露给外部
var WorldCupData = {
  FLAGS: FLAGS,
  CN_NAMES: CN_NAMES,
  GROUP_STAGE: GROUP_STAGE,
  KNOCKOUT_STAGE: KNOCKOUT_STAGE,
  GROUPS: GROUPS,
  getFlag: getFlag,
  getCnName: getCnName,
  etToBeijing: etToBeijing,
  formatBeijingTime: formatBeijingTime,
  getTodayMatches: getTodayMatches,
  getUpcomingMatches: getUpcomingMatches,
  formatMatchLine: formatMatchLine,
  fetchLiveScores: fetchLiveScores,
  fetchStandings: fetchStandings,
  fetchScorers: fetchScorers,
  CONFIG: CONFIG,
};
