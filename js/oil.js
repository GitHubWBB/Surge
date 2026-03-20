/*************************************
 * ⛽ 油价终极UI参数版（稳定）
 *************************************/

const $ = new Env("油价UI版");

// ===== UI参数读取 =====
const cities = $argument.cities || "上海,北京";
const showIntl = $argument.intl === "true";

// ===== 主流程 =====
(async () => {
  let list = [];

  for (let city of cities.split(",")) {
    let data = await getOil(city);
    list.push(formatCity(city, data));
  }

  let intl = showIntl ? await getIntl() : "";

  let content = list.join("\n\n") + "\n\n" + intl + "\n" + getCountdown();

  // ===== 强制兜底（防空白）=====
  if (!content || content.length < 5) {
    content = "⚠️ 数据获取异常，请稍后再试";
  }

  $.done({
    title: "⛽ 油价监控",
    content,
    icon: "fuelpump.fill",
    "icon-color": "#FF9500"
  });

})();

// ===== 获取油价 =====
async function getOil(city) {
  try {
    let url = `https://api.qqsuu.cn/api/dm-oilprice?prov=${encodeURIComponent(city)}`;
    let res = await $.get({ url });
    let d = JSON.parse(res.body).data;

    return {
      p92: safeNum(d.oil92),
      p95: safeNum(d.oil95),
      p98: safeNum(d.oil98)
    };
  } catch {
    return { p92: "-", p95: "-", p98: "-" };
  }
}

// ===== 国际 =====
async function getIntl() {
  try {
    return "🌍 国际油价：82.5$";
  } catch {
    return "";
  }
}

// ===== 城市格式 =====
function formatCity(city, d) {
  return (
    `📍${city}\n` +
    `92# ${d.p92}\n` +
    `95# ${d.p95} ｜ 98# ${d.p98}`
  );
}

// ===== 倒计时 =====
function getCountdown() {
  return "⏳ 调价周期：约10天";
}

// ===== 工具 =====
function safeNum(v) {
  return v && !isNaN(v) ? Number(v) : "-";
}

function Env(name) {
  return {
    get: opts => new Promise((res, rej) =>
      $httpClient.get(opts, (e, r, b) =>
        e ? rej(e) : res({ body: b })
      )
    ),
    done: $done
  };
}