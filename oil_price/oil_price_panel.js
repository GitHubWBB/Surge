/**
 * Surge 油价查询面板脚本
 * 数据来源：本地宝 (bendibao.com)
 * 支持：面板显示 + 定时通知
 */

// ============ 参数解析 ============
const arg = $argument || "";
let city = "cd";
let fuel = "92";
let notify = "false"; // 是否为通知模式

if (arg) {
  try {
    const params = JSON.parse(arg);
    if (params.city) city = params.city;
    if (params.fuel) fuel = String(params.fuel);
    if (params.notify) notify = params.notify;
  } catch (e) {
    arg.split("&").forEach(pair => {
      const [k, v] = pair.split("=");
      if (k === "city" && v) city = v;
      if (k === "fuel" && v) fuel = v;
      if (k === "notify" && v) notify = v;
    });
  }
}

const isNotify = notify === "true";

const fuelNames = {
  "0": "0号柴油",
  "89": "89号汽油",
  "92": "92号汽油",
  "95": "95号汽油",
  "-10": "-10号柴油",
  "-20": "-20号柴油"
};

const url = `https://${city}.bendibao.com/news/youjiachaxun/`;

$httpClient.get(url, function (error, response, data) {
  if (error) {
    handleError(error);
    return;
  }

  try {
    const result = parseOilPrice(data, fuel);
    if (isNotify) {
      sendNotification(result);
    } else {
      $done(result);
    }
  } catch (e) {
    handleError(e.message);
  }
});

function handleError(msg) {
  if (isNotify) {
    $notification.post("⛽ 油价查询", "获取失败", msg);
    $done();
  } else {
    $done({
      title: "⛽ 油价查询",
      content: `❌ 获取失败\n${msg}`
    });
  }
}

function sendNotification(result) {
  const lines = result.content.split('\n');
  const title = result.title;
  // 取前3行作为通知内容
  const body = lines.slice(0, 3).join('\n');
  $notification.post("⛽ " + title, "", body);
  $done();
}

function parseOilPrice(html, targetFuel) {
  const allPrices = parseCurrentPrices(html);
  const history = parseHistoryPrices(html, targetFuel);
  const nextDate = parseNextAdjustDate(html);

  const currentPrice = allPrices[targetFuel];
  const currentLabel = fuelNames[targetFuel] || targetFuel + "号";

  if (!currentPrice && history.length === 0) {
    return {
      title: "⛽ 油价查询",
      content: `⚠️ 未找到 ${currentLabel} 数据\n请检查城市缩写: ${city}`
    };
  }

  let content = "";

  // 当前价格（带图标）
  if (currentPrice) {
    const change = currentPrice.change;
    const changeStr = change > 0 
      ? `📈 +${change.toFixed(2)}` 
      : change < 0 
        ? `📉 ${change.toFixed(2)}` 
        : `➖ 0.00`;
    content += `⛽ ${currentLabel}: ¥${currentPrice.price.toFixed(2)}/L ${changeStr}\n`;
  }

  // 下次调价
  if (nextDate) {
    const daysLeft = daysUntil(nextDate);
    content += `📅 下次调价: ${nextDate} (${daysLeft}天后)\n`;
  }

  content += "─────────────────\n";

  // ASCII 趋势图
  if (history.length >= 2) {
    content += generateAsciiChart(history);
    content += "─────────────────\n";
  }

  // 全部油品价格（紧凑格式）
  const fuelOrder = ["0", "89", "92", "95", "-10", "-20"];
  let priceList = [];
  fuelOrder.forEach(f => {
    if (allPrices[f]) {
      const name = fuelNames[f] || f;
      const ch = allPrices[f].change;
      const arrow = ch > 0 ? "🔴" : ch < 0 ? "🟢" : "⚪";
      priceList.push(`${arrow}${name}:¥${allPrices[f].price.toFixed(2)}`);
    }
  });
  if (priceList.length > 0) {
    content += priceList.join("  ");
  }

  return {
    title: `⛽ ${getCityName(city)}油价`,
    content: content.trim()
  };
}

function parseCurrentPrices(html) {
  const prices = {};
  const firstTableEnd = html.indexOf('</table>');
  const searchArea = firstTableEnd > -1 ? html.substring(0, firstTableEnd) : html;
  const regex = /(\d+号汽油|0号柴油|[﹣\-]?\d+号柴油)[\s\S]*?(\d+\.\d+)元\/升[\s\S]*?([+\-\s]\s*\d+\.\d+)元\/升/g;
  let match;

  while ((match = regex.exec(searchArea)) !== null) {
    const name = match[1].replace(/[﹣]/g, "-");
    const price = parseFloat(match[2]);
    const changeStr = match[3].replace(/\s/g, "");
    const change = parseFloat(changeStr);
    const key = extractFuelKey(name);
    if (key && !prices[key]) {
      prices[key] = { price, change };
    }
  }

  return prices;
}

function parseHistoryPrices(html, targetFuel) {
  const history = [];
  const tabIdx = html.indexOf('tab_con_new');
  if (tabIdx === -1) return history;
  const tabArea = html.substring(tabIdx);

  const regex = /(\d{1,2}月\d{1,2}日)[\s\S]*?(\d+\.\d+)元\/升/g;
  let match;
  const allEntries = [];
  while ((match = regex.exec(tabArea)) !== null) {
    allEntries.push({
      date: match[1],
      price: parseFloat(match[2])
    });
  }

  let groupSize = 0;
  const firstDate = allEntries[0] ? allEntries[0].date : null;
  if (firstDate) {
    for (let i = 1; i < allEntries.length; i++) {
      if (allEntries[i].date === firstDate) {
        groupSize = i;
        break;
      }
    }
  }
  if (groupSize === 0) groupSize = Math.floor(allEntries.length / 6);

  const fuelOrder = ["0", "89", "92", "95", "-10", "-20"];
  const fuelIndex = fuelOrder.indexOf(targetFuel);
  if (fuelIndex === -1) return history;

  const start = fuelIndex * groupSize;
  const end = start + groupSize;
  for (let i = start; i < end && i < allEntries.length; i++) {
    history.push(allEntries[i]);
  }

  return history.reverse();
}

function parseNextAdjustDate(html) {
  const match = html.match(/油价下次调整时间为(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日]?)/);
  if (match) {
    return match[1];
  }
  return null;
}

function extractFuelKey(name) {
  if (name.includes("0号柴油") && !name.includes("-")) return "0";
  if (name.includes("89号汽油")) return "89";
  if (name.includes("92号汽油")) return "92";
  if (name.includes("95号汽油")) return "95";
  if (name.includes("-10号柴油") || name.includes("﹣10号柴油")) return "-10";
  if (name.includes("-20号柴油") || name.includes("﹣20号柴油")) return "-20";
  return null;
}

function generateAsciiChart(history) {
  if (history.length < 2) return "";

  const prices = history.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const chartHeight = 4;
  const width = Math.min(prices.length * 2, 16);

  let chart = `📊 趋势 (${history[0].date}~${history[history.length-1].date}):\n`;
  chart += `${max.toFixed(0)} `;

  const canvas = [];
  for (let i = 0; i < chartHeight; i++) {
    canvas.push(new Array(width).fill(" "));
  }

  const step = prices.length > 1 ? (width - 1) / (prices.length - 1) : 0;
  const points = [];
  for (let i = 0; i < prices.length; i++) {
    const x = Math.round(i * step);
    const y = chartHeight - 1 - Math.round(((prices[i] - min) / range) * (chartHeight - 1));
    points.push({ x, y });
    canvas[y][x] = "●";
  }

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (curr.x > prev.x) {
      for (let x = prev.x + 1; x < curr.x; x++) {
        if (canvas[prev.y][x] === " ") canvas[prev.y][x] = "─";
      }
    }
  }

  for (let row = 0; row < chartHeight; row++) {
    const line = canvas[row].join("");
    if (row === 0) {
      chart += line + "\n";
    } else if (row === chartHeight - 1) {
      chart += `${min.toFixed(0)} ${line}\n`;
    } else {
      chart += `   ${line}\n`;
    }
  }

  return chart;
}

function getCityName(code) {
  const map = {
    bj: "北京", sh: "上海", gz: "广州", sz: "深圳",
    cd: "成都", my: "绵阳", pzh: "攀枝花", ab: "阿坝",
    ganzi: "甘孜", liangshan: "凉山",
    cq: "重庆", tj: "天津", nj: "南京", hz: "杭州",
    wh: "武汉", cs: "长沙", zz: "郑州", jn: "济南",
    xa: "西安", sy: "沈阳", dl: "大连",
    km: "昆明", gy: "贵阳", nn: "南宁", hk: "海口"
  };
  return map[code] || code.toUpperCase();
}

function daysUntil(dateStr) {
  try {
    let target;
    const dashMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (dashMatch) {
      target = new Date(parseInt(dashMatch[1]), parseInt(dashMatch[2]) - 1, parseInt(dashMatch[3]));
    } else {
      const cnMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (cnMatch) {
        target = new Date(parseInt(cnMatch[1]), parseInt(cnMatch[2]) - 1, parseInt(cnMatch[3]));
      } else {
        return "?";
      }
    }
    const now = new Date();
    const diff = target - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch (e) {
    return "?";
  }
}
