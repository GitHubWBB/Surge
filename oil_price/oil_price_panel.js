/**
 * Surge 油价查询面板脚本
 * 数据来源：本地宝 (bendibao.com)
 * 支持：面板显示 + 定时通知
 */

// 参数解析函数
function getParams(param) {
  if (!param) return {};
  try {
    return JSON.parse(param);
  } catch (e) {
    return Object.fromEntries(
      param
        .split("&")
        .map((item) => item.split("="))
        .map(([k, v]) => [k, decodeURIComponent(v || "")])
    );
  }
}

const params = getParams($argument);
const city = params.city || "cd";
const fuel = params.fuel || "95";
const isNotify = params.notify === "true";
const icon = params.icon || "fuelpump.fill";
const iconColor = params.color || "#FF3B30";

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
    const result = parseOilPrice(data, fuel, city, icon, iconColor);
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
      content: `❌ 获取失败\n${msg}`,
      icon: icon,
      "icon-color": iconColor
    });
  }
}

function sendNotification(result) {
  const title = result.title;
  const body = result.content
    .replace(/--------------------\n/g, "\n")
    .replace(/\n+/g, "\n")
    .trim();
  $notification.post("⛽ " + title, "", body);
  $done();
}

function parseOilPrice(html, targetFuel, cityCode, icon, iconColor) {
  const allPrices = parseCurrentPrices(html);
  const history = parseHistoryPrices(html, targetFuel);
  const nextDate = parseNextAdjustDate(html);

  const currentPrice = allPrices[targetFuel];
  const currentLabel = fuelNames[targetFuel] || targetFuel + "号";

  if (!currentPrice && history.length === 0) {
    return {
      title: "⛽ 油价查询",
      content: `⚠️ 未找到 ${currentLabel} 数据\n请检查城市缩写: ${cityCode}`,
      icon: icon,
      "icon-color": iconColor
    };
  }

  let content = "";

  if (currentPrice) {
    const change = currentPrice.change;
    const changeIcon = change > 0 ? "📈" : change < 0 ? "📉" : "➖";
    const changeVal = change > 0 ? `+${change.toFixed(2)}` : change < 0 ? `${change.toFixed(2)}` : "0.00";
    content += `⛽ 关注油号: ${currentLabel}\n`;
    content += `💰 当前价格: ¥${currentPrice.price.toFixed(2)}/升\n`;
    content += `${changeIcon} 涨跌幅度: ${changeVal}\n`;
  }

  if (nextDate) {
    content += `--------------------\n`;
    const daysLeft = daysUntil(nextDate);
    content += `📅 下次调价: ${nextDate} (${daysLeft}天后)\n`;
  }

  if (history.length >= 2) {
    content += `--------------------\n`;
    content += generateAsciiChart(history);
  }

  const fuelOrder = ["0", "89", "92", "95", "-10", "-20"];
  content += `--------------------\n`;
  content += `📋 全部油品:\n`;
  fuelOrder.forEach(f => {
    if (allPrices[f]) {
      const name = fuelNames[f] || f;
      const ch = allPrices[f].change;
      const dot = ch > 0 ? "🔴" : ch < 0 ? "🟢" : "⚪";
      const val = ch > 0 ? `+${ch.toFixed(2)}` : ch < 0 ? `${ch.toFixed(2)}` : "0.00";
      const price = allPrices[f].price.toFixed(2);
      const nameAligned = padLeft(name, 6);
      content += `${dot} ${nameAligned}: ¥${price} (${val})\n`;
    }
  });

  return {
    title: `${getCityName(cityCode)}油价`,
    content: content.trim(),
    icon: icon,
    "icon-color": iconColor
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
  const dataCount = Math.min(prices.length, 6);
  const displayPrices = prices.slice(-6);
  const displayHistory = history.slice(-6);

  const chartHeight = 5;
  const chartWidth = 12;

  let chart = `📊 价格趋势: (${displayHistory[0].date} ~ ${displayHistory[displayHistory.length-1].date})\n`;

  const canvas = [];
  for (let i = 0; i < chartHeight; i++) {
    canvas.push(new Array(chartWidth).fill(" "));
  }

  const xPositions = [];
  if (dataCount === 1) {
    xPositions.push(Math.floor(chartWidth / 2));
  } else {
    for (let i = 0; i < dataCount; i++) {
      xPositions.push(Math.round(i * (chartWidth - 1) / (dataCount - 1)));
    }
  }

  for (let i = 0; i < dataCount; i++) {
    const x = xPositions[i];
    const price = displayPrices[i];
    
    let y = 0;
    if (price >= 10.5) y = 0;
    else if (price >= 9.5) y = 1;
    else if (price >= 8.5) y = 2;
    else if (price >= 7.5) y = 3;
    else y = 4;
    
    canvas[y][x] = "●";

    if (i < dataCount - 1) {
      const nextX = xPositions[i + 1];
      for (let cx = x + 1; cx < nextX; cx++) {
        canvas[y][cx] = "─";
      }
    }
  }

  for (let row = 0; row < chartHeight; row++) {
    chart += "│";
    for (let col = 0; col < chartWidth; col++) {
      chart += canvas[row][col];
    }
    chart += "\n";
  }

  chart += "└";
  for (let i = 0; i < chartWidth; i++) {
    chart += "─";
  }
  chart += "\n";

  const lastPrice = displayPrices[displayPrices.length - 1];
  const firstPrice = displayPrices[0];
  const diff = lastPrice - firstPrice;
  const trend = diff > 0 ? "📈 总体趋势: 上涨" : diff < 0 ? "📉 总体趋势: 下降" : "➖ 总体趋势: 持平";
  chart += `${trend} ¥${Math.abs(diff).toFixed(2)}\n`;

  return chart;
}

function padLeft(str, len) {
  while (String(str).length < len) str = " " + str;
  return String(str);
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
