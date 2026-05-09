/*
Surge 油价查询｜本地宝通用版
已修复：undefined is not an object (evaluating res.status)
完全兼容 Surge 原生 $httpClient 回调写法
支持：参数化、ASCII趋势图、历史、通知
*/

// 解析参数
const args = Object.fromEntries(
  ($argument || "").split("&").map(s => s.split("=")).map(([k, v]) => [decodeURIComponent(k), decodeURIComponent(v)])
);

const config = {
  city: args.city || "cd",
  focusFuel: args.focusFuel || "92号汽油",
  historyLen: parseInt(args.historyLen || "6"),
  onlyChange: args.onlyChange === "true",
  notify: args.notify !== "false"
};

const STORE = {
  panel: "oil_price_panel",
  history: "oil_price_history",
  lastPrice: "oil_price_last"
};

const url = `https://${config.city}.bendibao.com/news/youjiachaxun/`;
const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
};

// ASCII 趋势图
function makeAsciiTrend(history, fuel) {
  const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const prices = history
    .map(h => h.oils.find(x => x.type === fuel))
    .filter(Boolean)
    .map(x => parseFloat(x.price));
  if (prices.length < 2) return "📊 趋势数据不足";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 0.01;
  const line = prices
    .map(p => bars[Math.floor(((p - min) / range) * (bars.length - 1))])
    .join("");
  const diff = (prices.at(-1) - prices[0]).toFixed(2);
  return `${fuel} ${line} ${diff >= 0 ? "📈" : "📉"} ${diff}`;
}

// =======================  Surge 原生回调写法（修复核心） =======================
$httpClient.get({ url, headers }, function (error, response, body) {
  if (error || !response) {
    const msg = "请求失败：网络异常";
    if (config.notify) $notification.post("油价查询", "", msg);
    $done({
      title: "油价查询",
      content: $persistentStore.read(STORE.panel) || msg
    });
    return;
  }

  if (response.status !== 200) {
    const msg = `请求失败：状态码 ${response.status}`;
    if (config.notify) $notification.post("油价查询", "", msg);
    $done({
      title: "油价查询",
      content: $persistentStore.read(STORE.panel) || msg
    });
    return;
  }

  try {
    const html = body;
    const now = new Date();
    const y = now.getFullYear();

    // 解析油价
    const oilReg = /<tr>\s*<td>(.+?)<\/td>\s*<td>(.+?)<\/td>\s*<td>(.+?)<\/td>/g;
    const oils = [];
    let m;
    while ((m = oilReg.exec(html)) !== null) {
      const type = m[1].trim();
      const price = m[2].trim().replace("元/升", "");
      const change = m[3].trim();
      if (type.includes("汽油") || type.includes("柴油")) {
        oils.push({ type, price, change });
      }
    }

    if (oils.length === 0) throw new Error("未获取到油价数据");

    // 解析调价日
    const dateReg = /(\d+月\d+日)\s*(星期.+?)\</g;
    const dates = [];
    while ((m = dateReg.exec(html)) !== null) {
      const dateText = m[1];
      const week = m[2];
      const [mo, d] = dateText.replace(/[月日]/g, "-").split("-").map(Number);
      dates.push({
        text: `${dateText} ${week}`,
        date: new Date(y, mo - 1, d)
      });
    }

    const nextDate = dates.find(x => x.date > now);
    const nextText = nextDate ? nextDate.text : "暂无";

    // 历史数据
    let history = [];
    try {
      history = JSON.parse($persistentStore.read(STORE.history) || "[]");
    } catch (_) {}

    const currentPrice = oils.find(x => x.type === config.focusFuel)?.price;
    const lastPrice = $persistentStore.read(STORE.lastPrice);
    const changed = currentPrice && currentPrice !== lastPrice;

    // 更新历史
    if (changed) {
      history.push({ time: now.toISOString(), oils });
      if (history.length > config.historyLen) history.shift();
      $persistentStore.write(JSON.stringify(history), STORE.history);
      $persistentStore.write(currentPrice, STORE.lastPrice);

      if (config.notify && (!config.onlyChange || changed)) {
        const f = oils.find(x => x.type === config.focusFuel);
        $notification.post(
          "油价已更新",
          `${config.city.toUpperCase()} · ${f.type}`,
          `${f.price} 元/升 ${f.change}`
        );
      }
    }

    // 生成面板
    const trend = makeAsciiTrend(history, config.focusFuel);
    let content = `🏷️ ${config.city.toUpperCase()} 油价\n`;
    content += `${trend}\n`;
    content += "——————————————\n";
    oils.forEach(o => {
      const icon = o.change.includes("-") ? "📉" : "📈";
      content += `${o.type}：${o.price} ${icon} ${o.change}\n`;
    });
    content += "——————————————\n";
    content += `📅 下次调价：${nextText}`;

    $persistentStore.write(content, STORE.panel);
    $done({ title: `${config.city.toUpperCase()} 油价`, content });

  } catch (e) {
    const msg = `解析异常：${e.message}`;
    if (config.notify) $notification.post("油价查询", "", msg);
    $done({
      title: "油价查询",
      content: $persistentStore.read(STORE.panel) || msg
    });
  }
});
