// Surge 无需API油价监控脚本
// 数据源: 实时抓取公开油价网页
// 功能: 国内省份油价 + 国际原油趋势 + 无需API Key

const params = getParams($argument);
const PROVINCE = params.provname || "jiangsu"; // 拼音首字母，如 jiangsu, shanghai, guangdong
const NOTIFICATION = params.notification === 'true';

// 数据源地址
const domesticUrl = `http://m.qiyoujiage.com/${PROVINCE}.shtml`;
const internationalUrl = `https://oilprice.com/`; // 备用或直接抓取行情页

async function main() {
  try {
    const domesticData = await fetchDomestic();
    const internationalData = await fetchInternational();
    
    let panelContent = [];
    let notificationContent = [];

    if (domesticData) {
      panelContent.push(`📍<LaTex>${domesticData.prov} 92#: $</LaTex>{domesticData.p92} | 95#: <LaTex>${domesticData.p95}`);
      notificationContent.push(`【$</LaTex>{domesticData.prov}油价】\n92#: <LaTex>${domesticData.p92}, 95#: $</LaTex>{domesticData.p95}\n更新: <LaTex>${domesticData.time}`);
    }

    if (internationalData) {
      panelContent.push(`🌎WTI: $</LaTex>{internationalData.wti} | Brent: ${internationalData.brent}`);
      notificationContent.push(`【国际原油】\nWTI: <LaTex>${internationalData.wti}, Brent: $</LaTex>{internationalData.brent}`);
    }

    const panelBody = {
      title: "⛽ 今日油价 (免API版)",
      content: panelContent.join('\n'),
      icon: params.icon || "fuelpump.fill",
      "icon-color": params.color || "#FF9500"
    };

    if (NOTIFICATION) {
      $notification.post("油价监控", "", notificationContent.join('\n'));
    }

    <LaTex>$done(panelBody);
  } catch (e) {
    $</LaTex>done({ title: "⛽ 油价监控", content: "获取失败: 请检查网络或省份拼音" });
  }
}

// 抓取国内油价逻辑
function fetchDomestic() {
  return new Promise((resolve) => {
    $httpClient.get(domesticUrl, (error, response, data) => {
      if (error || !data) return resolve(null);
      
      // 简单的正则匹配网页内容
      const provMatch = data.match(/<h2>(.*)油价<\/h2>/);
      const p92Match = data.match(/92号汽油<\/dt><dd>(.*)元/);
      const p95Match = data.match(/95号汽油<\/dt><dd>(.*)元/);
      const timeMatch = data.match(/<span>更新时间：(.*)<\/span>/);

      if (p92Match && p95Match) {
        resolve({
          prov: provMatch ? provMatch[1] : "本地",
          p92: p92Match[1],
          p95: p95Match[1],
          time: timeMatch ? timeMatch[1] : "刚刚"
        });
      } else {
        resolve(null);
      }
    });
  });
}

// 抓取国际油价逻辑 (示例从公开接口或网页简易获取)
function fetchInternational() {
  return new Promise((resolve) => {
    // 这里使用一个免KEY的公共行情聚合接口
    $httpClient.get("https://api.jiatou.com/oil/price", (error, response, data) => {
      if (error || !data) return resolve(null);
      try {
        const res = JSON.parse(data);
        resolve({
          wti: res.wti || "--",
          brent: res.brent || "--"
        });
      } catch (e) {
        resolve(null);
      }
    });
  });
}

function getParams(param) {
  if (!param) return {};
  return Object.fromEntries(param.split("&").map(i => i.split("=")).map(([k, v]) => [k, decodeURIComponent(v)]));
}

main();
