/*************************************
 * ⛽ 油价终极旗舰版
 *************************************/

const $ = new Env("油价旗舰");

// ===== 参数读取（核心优化）=====
const args = parseArgs();

function getConf(key, def) {
  return args[key] ?? $.getdata("oil_" + key) ?? def;
}

const CONFIG = {
  cities: getConf("cities", "上海,北京").split(","),
  notify: getConf("notify", "false"),
  intl: getConf("intl", "true"),
  chart: getConf("chart", "true")
};

// ===== 主流程 =====
(async () => {
  let results = [];

  for (let city of CONFIG.cities) {
    let data = await getOil(city);
    let trend = calcTrend(city, data);
    let history = saveHistory(city, data);

    results.push({ city, ...data, trend, history });
  }

  let intl = CONFIG.intl === "true" ? await getIntl() : null;
  let countdown = getCountdown();

  $.done(buildPanel(results, intl, countdown));

  if (CONFIG.notify === "true") {
    sendNotify(results, intl, countdown);
  }
})();

// ===== 国内油价 =====
async function getOil(city) {
  let url = `https://api.qqsuu.cn/api/dm-oilprice?prov=${encodeURIComponent(city)}`;
  let res = await $.get({ url });
  let d = JSON.parse(res.body).data;

  return {
    p92: Number(d.oil92),
    p95: Number(d.oil95)
  };
}

// ===== 国际油价 + 汇率 =====
async function getIntl() {
  try {
    let res = await $.get({ url: "https://api.exchangerate-api.com/v4/latest/USD" });
    let rate = JSON.parse(res.body).rates.CNY;

    let oil = await $.get({ url: "https://api.oilpriceapi.com/v1/prices/latest" });
    let price = JSON.parse(oil.body).data.price;

    return {
      usd: price,
      cny: (price * rate).toFixed(2)
    };
  } catch {
    return null;
  }
}

// ===== 趋势 =====
function calcTrend(city, data) {
  let key = "oil_cache_" + city;
  let old = JSON.parse($.getdata(key) || "{}");

  let diff = old.p92 ? data.p92 - old.p92 : 0;

  $.setdata(JSON.stringify(data), key);
  return diff;
}

// ===== 历史缓存（30条）=====
function saveHistory(city, data) {
  let key = "oil_hist_" + city;
  let arr = JSON.parse($.getdata(key) || "[]");

  arr.push(data.p92);
  if (arr.length > 30) arr.shift();

  $.setdata(JSON.stringify(arr), key);
  return arr;
}

// ===== 调价倒计时 =====
function getCountdown() {
  const base = new Date("2024-01-03T24:00:00");
  const now = new Date();
  const cycle = 10 * 24 * 3600 * 1000;

  let next = new Date(base.getTime() + Math.ceil((now - base) / cycle) * cycle);

  let diff = next - now;

  return {
    text: `${Math.floor(diff/86400000)}天${Math.floor(diff%86400000/3600000)}小时`,
    exact: formatTime(next)
  };
}

// ===== 预测（简单趋势模型）=====
function predict(history) {
  if (history.length < 2) return "⏸";

  let diff = history[history.length - 1] - history[0];

  if (diff > 0.3) return "📈上涨概率大";
  if (diff < -0.3) return "📉下跌概率大";
  return "⚖️震荡";
}

// ===== UI =====
function buildPanel(list, intl, countdown) {
  let content = "";

  list.forEach(r => {
    let arrow = r.trend > 0 ? "🔺" : r.trend < 0 ? "🔻" : "⏸";
    let pred = predict(r.history);

    content +=
      `📍${r.city}\n` +
      ` 92# ${r.p92} ${arrow}${r.trend.toFixed(2)}\n` +
      ` 95# ${r.p95}\n` +
      ` ${pred}\n\n`;
  });

  if (intl) {
    content += `🌍 ${intl.usd}$ ≈ ¥${intl.cny}\n`;
  }

  content += `⏳ ${countdown.text}\n🗓 ${countdown.exact}`;

  return {
    title: "⛽ 油价旗舰版",
    content,
    icon: "chart.line.uptrend.xyaxis",
    "icon-color": "#FF9500",
    url: buildChart(list)
  };
}

// ===== 图表 =====
function buildChart(list) {
  if (CONFIG.chart !== "true") return "";

  let labels = list[0].history.map((_, i) => i);
  let data = list[0].history;

  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
    type: "line",
    data: { labels, datasets: [{ data }] }
  }))}`;
}

// ===== 推送 =====
function sendNotify(list, intl, countdown) {
  let msg = list.map(r => `${r.city} ${r.p92}`).join("\n");
  msg += `\n⏳${countdown.text}`;

  $.notify("⛽油价", "", msg);
}

// ===== 参数解析 =====
function parseArgs() {
  if (!$argument) return {};
  return Object.fromEntries($argument.split("&").map(i => i.split("=")));
}

// ===== 工具 =====
function formatTime(d) {
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:00`;
}

function Env(name) {
  return {
    getdata: k => $persistentStore.read(k),
    setdata: (v, k) => $persistentStore.write(v, k),
    notify: $notification.post,
    get: opts => new Promise((res, rej) =>
      $httpClient.get(opts, (e, r, b) => e ? rej(e) : res({ body: b }))
    ),
    done: $done
  };
}