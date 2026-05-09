/**
 * Surge 油价查询面板脚本
 * 数据来源：本地宝 (bendibao.com)
 *
 * 使用方法：
 *   通过 $argument 传入参数，格式为 JSON 或 key=value&key=value
 *   参数说明：
 *     city   - 城市缩写，默认 cd (成都)。可选: bj, sh, gz, sz, my, pzh 等
 *     fuel   - 关注的油品，默认 92 (92号汽油)。可选: 0, 89, 92, 95, -10, -20
 *     cron   - cron 表达式，默认 "0 8 * * *" (每天8点)
 *
 * 城市缩写对照表：
 *   北京=bj, 上海=sh, 广州=gz, 深圳=sz, 成都=cd, 绵阳=my,
 *   攀枝花=pzh, 阿坝=ab, 甘孜=ganzi, 凉山=liangshan
 *
 * 示例 $argument:
 *   {"city":"cd","fuel":"92"}
 *   city=sh&fuel=95
 */

// ============ 参数解析 ============
const arg = $argument || "";
let city = "cd";
let fuel = "92";

if (arg) {
  // 尝试 JSON 解析
  try {
    const params = JSON.parse(arg);
    if (params.city) city = params.city;
    if (params.fuel) fuel = String(params.fuel);
  } catch (e) {
    // 尝试 key=value 解析
    arg.split("&").forEach(pair => {
      const [k, v] = pair.split("=");
      if (k === "city" && v) city = v;
      if (k === "fuel" && v) fuel = v;
    });
  }
}

// 油品名称映射
const fuelNames = {
  "0": "0号柴油",
  "89": "89号汽油",
  "92": "92号汽油",
  "95": "95号汽油",
  "-10": "-10号柴油",
  "-20": "-20号柴油"
};

const fuelLabel = fuelNames[fuel] || fuel + "号";

// ============ 数据抓取 ============
const url = `https://${city}.bendibao.com/news/youjiachaxun/`;

$httpClient.get(url, function (error, response, data) {
  if (error) {
    $done({
      title: "⛽ 油价查询",
      content: `❌ 获取数据失败\n${error}`,
      style: "error"
    });
    return;
  }

  try {
    const result = parseOilPrice(data, fuel);
    $done(result);
  } catch (e) {
    $done({
      title: "⛽ 油价查询",
      content: `❌ 解析失败\n${e.message}`,
      style: "error"
    });
  }
});

// ============ 解析逻辑 ============
function parseOilPrice(html, targetFuel) {
  // 解析所有油品当前价格
  const allPrices = parseCurrentPrices(html);
  // 解析目标油品历史价格
  const history = parseHistoryPrices(html, targetFuel);
  // 解析下次调价日期
  const nextDate = parseNextAdjustDate(html);

  const currentPrice = allPrices[targetFuel];
  const currentLabel = fuelNames[targetFuel] || targetFuel + "号";

  if (!currentPrice && history.length === 0) {
    return {
      title: "⛽ 油价查询",
      content: `⚠️ 未找到 ${currentLabel} 数据\n请检查城市缩写: ${city}`,
      style: "alert"
    };
  }

  // 构建面板内容
  let content = "";

  // 当前价格
  if (currentPrice) {
    const change = currentPrice.change;
    const changeStr = change > 0 ? `🔺 +${change.toFixed(2)}` : change < 0 ? `🔻 ${change.toFixed(2)}` : "➖ 0.00";
    content += `${currentLabel}: ¥${currentPrice.price.toFixed(2)}/升 ${changeStr}\n`;
  }

  // 下次调价
  if (nextDate) {
    const daysLeft = daysUntil(nextDate);
    content += `⏰ 下次调价: ${nextDate} (${daysLeft}天后)\n`;
  }

  // ASCII 趋势图
  if (history.length >= 2) {
    content += "\n" + generateAsciiChart(history, currentLabel);
  }

  // 全部油品价格
  const fuelOrder = ["0", "89", "92", "95", "-10", "-20"];
  let priceList = "";
  fuelOrder.forEach(f => {
    if (allPrices[f]) {
      const name = fuelNames[f] || f;
      const ch = allPrices[f].change;
      const arrow = ch > 0 ? "↑" : ch < 0 ? "↓" : "-";
      priceList += `${name}: ¥${allPrices[f].price.toFixed(2)} ${arrow}${Math.abs(ch).toFixed(2)}\n`;
    }
  });
  if (priceList) {
    content += "\n📋 全部油品:\n" + priceList.trim();
  }

  return {
    title: `⛽ ${getCityName(city)}油价`,
    content: content.trim(),
    icon: "fuelpump",
    "icon-color": "#FF9500"
  };
}

// ============ HTML 解析函数 ============

/**
 * 解析当前所有油品价格
 */
function parseCurrentPrices(html) {
  const prices = {};
  // 只取第一个价格表格区域（当前价格），避免匹配到历史数据
  // 找到第一个表格结束位置作为边界
  const firstTableEnd = html.indexOf('</table>');
  const searchArea = firstTableEnd > -1 ? html.substring(0, firstTableEnd) : html;

  // 匹配燃油标号和价格的模式
  // 格式: 92号汽油 8.81元/升 + 0.26元/升
  const regex = /(\d+号汽油|0号柴油|[﹣\-]?\d+号柴油)[\s\S]*?(\d+\.\d+)元\/升[\s\S]*?([+\-\s]\s*\d+\.\d+)元\/升/g;
  let match;

  while ((match = regex.exec(searchArea)) !== null) {
    const name = match[1].replace(/[﹣]/g, "-");
    const price = parseFloat(match[2]);
    let changeStr = match[3].replace(/\s/g, "");
    const change = parseFloat(changeStr);

    // 提取油品key
    const key = extractFuelKey(name);
    if (key && !prices[key]) {
      prices[key] = { price, change };
    }
  }

  return prices;
}

/**
 * 解析指定油品的历史价格
 * 网页中历史数据按油品分组排列，每种油品连续排列所有日期的数据
 * 顺序为: 0号柴油, 89号汽油, 92号汽油, 95号汽油, -10号柴油, -20号柴油
 */
function parseHistoryPrices(html, targetFuel) {
  const history = [];

  // 找到历史数据区域（第一个 tab_con_new）
  const tabIdx = html.indexOf('tab_con_new');
  if (tabIdx === -1) return history;
  const tabArea = html.substring(tabIdx);

  // 提取所有 (日期, 价格) 对
  const regex = /(\d{1,2}月\d{1,2}日)[\s\S]*?(\d+\.\d+)元\/升/g;
  let match;
  const allEntries = [];
  while ((match = regex.exec(tabArea)) !== null) {
    allEntries.push({
      date: match[1],
      price: parseFloat(match[2])
    });
  }

  // 确定每种油品有多少条记录
  // 通过找到日期重复的位置来确定分组大小
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

  // 确定目标油品的分组索引
  const fuelOrder = ["0", "89", "92", "95", "-10", "-20"];
  const fuelIndex = fuelOrder.indexOf(targetFuel);
  if (fuelIndex === -1) return history;

  // 提取目标油品的数据
  const start = fuelIndex * groupSize;
  const end = start + groupSize;
  for (let i = start; i < end && i < allEntries.length; i++) {
    history.push(allEntries[i]);
  }

  // 反转为从旧到新的顺序（网页中是从新到旧）
  return history.reverse();
}

/**
 * 解析下次调价日期
 */
function parseNextAdjustDate(html) {
  // 匹配 "2026-05-21" 或 "2026年5月21日" 格式
  const match = html.match(/油价下次调整时间为(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日]?)/);
  if (match) {
    return match[1].replace(/年/g, "年").replace(/-/g, "-");
  }
  return null;
}

/**
 * 从油品名称提取key
 */
function extractFuelKey(name) {
  if (name.includes("0号柴油") && !name.includes("-")) return "0";
  if (name.includes("89号汽油")) return "89";
  if (name.includes("92号汽油")) return "92";
  if (name.includes("95号汽油")) return "95";
  if (name.includes("-10号柴油") || name.includes("﹣10号柴油")) return "-10";
  if (name.includes("-20号柴油") || name.includes("﹣20号柴油")) return "-20";
  return null;
}

// ============ ASCII 趋势图生成 ============
function generateAsciiChart(history, label) {
  if (history.length < 2) return "";

  const prices = history.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const chartHeight = 6;
  const width = Math.min(prices.length * 2, 30);

  // 生成图表行
  let chart = `📊 ${label}趋势 (${history[0].date} ~ ${history[history.length - 1].date})\n`;
  chart += `¥${max.toFixed(2)} ┤`;

  // 空白画布
  const canvas = [];
  for (let i = 0; i < chartHeight; i++) {
    canvas.push(new Array(width).fill(" "));
  }

  // 绘制数据点
  const step = prices.length > 1 ? (width - 1) / (prices.length - 1) : 0;
  const points = [];
  for (let i = 0; i < prices.length; i++) {
    const x = Math.round(i * step);
    const y = chartHeight - 1 - Math.round(((prices[i] - min) / range) * (chartHeight - 1));
    points.push({ x, y, price: prices[i], date: history[i].date });
    canvas[y][x] = "●";
  }

  // 连线
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (Math.abs(curr.x - prev.x) <= 1) {
      // 相邻点，用横线连接
      const minY = Math.min(prev.y, curr.y);
      const maxY = Math.max(prev.y, curr.y);
      for (let y = minY; y <= maxY; y++) {
        if (canvas[y][curr.x] === " ") {
          canvas[y][curr.x] = y < curr.y ? "│" : y > curr.y ? "│" : "─";
        }
      }
      // 横向连接
      if (prev.x !== curr.x) {
        for (let x = prev.x + 1; x < curr.x; x++) {
          if (canvas[prev.y][x] === " ") {
            canvas[prev.y][x] = "─";
          }
        }
      }
    } else {
      // 距离较远的点，用斜线
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let s = 1; s < steps; s++) {
        const ix = Math.round(prev.x + (dx * s) / steps);
        const iy = Math.round(prev.y + (dy * s) / steps);
        if (ix >= 0 && ix < width && iy >= 0 && iy < chartHeight) {
          if (canvas[iy][ix] === " ") {
            canvas[iy][ix] = "·";
          }
        }
      }
    }
  }

  // 渲染画布
  for (let row = 0; row < chartHeight; row++) {
    const line = canvas[row].join("");
    if (row === 0) {
      chart += line + "\n";
    } else if (row === chartHeight - 1) {
      chart += `¥${min.toFixed(2)} ┤` + line + "\n";
    } else {
      chart += "       │" + line + "\n";
    }
  }

  chart += "       └" + "─".repeat(width);

  // 最新价格标注
  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const diff = lastPrice - firstPrice;
  const trend = diff > 0 ? "📈 上涨" : diff < 0 ? "📉 下降" : "➖ 持平";
  chart += `\n当前: ¥${lastPrice.toFixed(2)} | 区间: ¥${min.toFixed(2)}~¥${max.toFixed(2)} | ${trend} ¥${Math.abs(diff).toFixed(2)}`;

  return chart;
}

// ============ 工具函数 ============
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCityName(code) {
  const map = {
    bj: "北京", sh: "上海", gz: "广州", sz: "深圳",
    cd: "成都", my: "绵阳", pzh: "攀枝花", ab: "阿坝",
    ganzi: "甘孜", liangshan: "凉山",
    cq: "重庆", tj: "天津", nj: "南京", hz: "杭州",
    wh: "武汉", cs: "长沙", zz: "郑州", jn: "济南",
    xa: "西安", cd2: "成都", sy: "沈阳", dl: "大连",
    km: "昆明", gy: "贵阳", nn: "南宁", hk: "海口"
  };
  return map[code] || code.toUpperCase();
}

function daysUntil(dateStr) {
  try {
    // 解析 "2026-05-21" 或 "2026年5月21日" 格式
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
