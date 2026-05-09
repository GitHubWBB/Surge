/*
Surge 油价查询｜本地宝通用版
支持：多城市、参数化、ASCII趋势图、历史记录、仅调价通知
适配 Surge #!arguments + {{{}}} 变量注入
*/

// 解析 &key=value 参数
const args = Object.fromEntries(
  $argument.split('&').map(s => s.split('=').map(i => decodeURIComponent(i)))
);
const config = {
  city: args.city || 'cd',
  focusFuel: args.focusFuel || '92号汽油',
  historyLen: parseInt(args.historyLen || '6'),
  onlyChange: args.onlyChange === 'true',
  notify: args.notify !== 'false'
};

const STORE = {
  panel: 'oil_price_panel',
  history: 'oil_price_history',
  lastPrice: 'oil_price_last'
};

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const url = `https://${config.city}.bendibao.com/news/youjiachaxun/`;

// 生成 ASCII 迷你趋势图 ▁▂▃▄▅▆▇█
function makeAsciiTrend(history, fuel) {
  const bars = ['▁','▂','▃','▄','▅','▆','▇','█'];
  const prices = history.map(h=>{
    const f = h.oils.find(x=>x.type===fuel);
    return f ? parseFloat(f.price) : null;
  }).filter(Boolean);
  if(prices.length<2) return '📊 暂无足够历史数据';
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max-min||0.01;
  const line = prices.map(p=>bars[Math.floor(((p-min)/range)*(bars.length-1))]).join('');
  const diff = (prices.at(-1)-prices[0]).toFixed(2);
  return `${fuel} 趋势: ${line} ${diff>=0?'📈':'📉'} ${diff>0?'+':''}${diff}元/升`;
}

(async ()=>{
  try{
    const res = await $httpClient.get({url,headers:{'User-Agent':UA}});
    if(res.status!==200) throw new Error(`请求异常 ${res.status}`);
    const html = res.body;
    const now = new Date();
    const y = now.getFullYear();

    // 解析油价
    const oilReg = /<tr>\s*<td>(.+?)<\/td>\s*<td>(.+?)<\/td>\s*<td>(.+?)<\/td>/g;
    const oils = [];
    let m;
    while((m=oilReg.exec(html))!==null){
      const type = m[1].trim();
      const price = m[2].trim().replace('元/升','');
      const change = m[3].trim();
      if(/(汽油|柴油)/.test(type)) oils.push({type,price,change});
    }
    if(!oils.length) throw new Error('未读取到油价');

    // 解析下次调价
    const dateReg = /(\d+月\d+日)\s+(星期.+?)/g;
    const dates = [];
    while((m=dateReg.exec(html))!==null){
      const [mo,d] = m[1].replace(/[月日]/g,'-').split('-').map(Number);
      dates.push({text:m[1]+' '+m[2], date:new Date(y,mo-1,d)});
    }
    const next = dates.find(d=>d.date>now);

    // 历史记录
    let history = [];
    try{ history = JSON.parse($persistentStore.read(STORE.history)||'[]'); }catch{}
    const lastRec = history.at(-1);
    const curr92 = oils.find(x=>x.type===config.focusFuel)?.price;
    const last92 = $persistentStore.read(STORE.lastPrice);
    const isChange = curr92!==last92;

    // 新增历史
    if(isChange){
      history.push({time:now.toISOString(),oils});
      if(history.length>config.historyLen) history.shift();
      $persistentStore.write(JSON.stringify(history),STORE.history);
      $persistentStore.write(curr92,STORE.lastPrice);

      // 调价通知
      if(config.notify && (!config.onlyChange || isChange)){
        const f = oils.find(x=>x.type===config.focusFuel);
        $notification.post('油价更新',`${config.city.toUpperCase()}｜${f?.type}`,`${f?.price}元/升 ${f?.change}`);
      }
    }

    // ASCII趋势
    const trend = makeAsciiTrend(history, config.focusFuel);

    // 面板文本
    let txt = `🏷️ ${config.city.toUpperCase()} 油价｜${now.getMonth()+1}/${now.getDate()}\n`;
    txt += `${trend}\n`;
    txt += '——————————————\n';
    oils.forEach(o=>{
      const icon = o.change.startsWith('-')?'📉':'📈';
      txt += `${o.type}: ${o.price}元/升 ${icon} ${o.change}\n`;
    });
    txt += '——————————————\n';
    txt += `📅 下次调价: ${next?.text||'暂无'}\n`;

    $persistentStore.write(txt,STORE.panel);
    $done({title:`${config.city.toUpperCase()}油价`,content:txt});

  }catch(e){
    const err = `异常: ${e.message}`;
    if(config.notify) $notification.post('油价查询失败','',err);
    $done({title:'油价查询',content:$persistentStore.read(STORE.panel)||err});
  }
})();
