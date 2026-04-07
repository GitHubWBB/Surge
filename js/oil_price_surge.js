/**
 * 油价查询脚本 for Surge
 * 数据来源: 本地宝 (bendibao.com)
 * 
 * 参数:
 * - CITY: 城市代码 (默认: cd)
 * - ONLY_CHANGE: 仅在变化时通知 (默认: false)
 */

const $ = new API("油价查询");

// ==================== 解析参数 ====================
function getArgs() {
    const args = {};
    if (typeof $argument !== 'undefined' && $argument) {
        const pairs = $argument.split('&');
        for (let pair of pairs) {
            const [key, value] = pair.split('=');
            if (key && value) {
                args[key] = decodeURIComponent(value);
            }
        }
    }
    return args;
}

const ARGS = getArgs();

// ==================== 配置 ====================
const CONFIG = {
    city: ARGS.CITY || 'cd',
    onlyChange: ARGS.ONLY_CHANGE === 'true' || ARGS.ONLY_CHANGE === '1',
    cityName: ''
};

// 城市名称映射
const CITY_NAMES = {
    'cd': '成都', 'bj': '北京', 'sh': '上海', 'gz': '广州', 'sz': '深圳',
    'cq': '重庆', 'hz': '杭州', 'nj': '南京', 'wh': '武汉', 'tj': '天津',
    'zz': '郑州', 'cs': '长沙', 'qd': '青岛', 'suzhou': '苏州',
    'dg': '东莞', 'fs': '佛山'
};

CONFIG.cityName = CITY_NAMES[CONFIG.city] || CONFIG.city.toUpperCase();

$.log(`城市: ${CONFIG.cityName}, 仅变化通知: ${CONFIG.onlyChange}`);

// ==================== 主程序 ====================
(async () => {
    try {
        const url = `https://${CONFIG.city}.bendibao.com/news/youjiachaxun/`;
        
        $.log(`请求URL: ${url}`);
        
        const html = await httpGet(url);
        
        if (!html) {
            throw new Error('返回内容为空');
        }
        
        const data = parseOilData(html);
        
        if (!data.prices || data.prices.length === 0) {
            throw new Error('未能解析到油价数据');
        }
        
        $.log(`成功解析 ${data.prices.length} 条油价数据`);
        
        // 判断是否为cron执行
        const isCron = typeof $trigger !== 'undefined' && $trigger === 'cron';
        
        if (isCron) {
            handleCronNotification(data);
        } else {
            handlePanelDisplay(data);
        }
        
    } catch (error) {
        $.log(`错误: ${error.message || error}`);
        
        const isCron = typeof $trigger !== 'undefined' && $trigger === 'cron';
        
        if (!isCron) {
            $.done({
                title: '⛽ 油价查询',
                content: `获取失败: ${error.message || error}`,
                icon: 'fuel.pump.fill',
                'icon-color': '#FF3B30'
            });
        } else {
            $.done();
        }
    }
})();

// ==================== HTTP请求 ====================
function httpGet(url) {
    return new Promise((resolve, reject) => {
        const options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            }
        };
        
        $httpClient.get(options, (error, response, body) => {
            if (error) {
                reject(new Error(`请求失败: ${error}`));
                return;
            }
            
            const statusCode = response?.status || response?.statusCode;
            
            if (statusCode !== 200) {
                reject(new Error(`HTTP ${statusCode}`));
                return;
            }
            
            resolve(body);
        });
    });
}

// ==================== 数据解析 ====================
function parseOilData(html) {
    const data = {
        prices: [],
        updateTime: '',
        nextAdjustTime: ''
    };
    
    // 解析油价 - 方案1
    const pricePattern = /<tr[^>]*>\s*<td[^>]*>([^<]*(?:柴油|汽油))<\/td>\s*<td[^>]*>([\d.]+元\/升)<\/td>\s*<td[^>]*>([+-]?\s*[\d.]+元\/升)<\/td>/gi;
    
    let match;
    while ((match = pricePattern.exec(html)) !== null) {
        const type = match[1].trim();
        const price = match[2].trim();
        const change = match[3].trim().replace(/\s+/g, '');
        
        data.prices.push({
            type: type,
            price: price,
            change: change,
            isUp: change.startsWith('+'),
            isDown: change.startsWith('-')
        });
    }
    
    // 方案2
    if (data.prices.length === 0) {
        const altPattern = /(0号柴油|89号汽油|92号汽油|95号汽油|98号汽油|[-–]10号柴油|[-–]20号柴油)[^\d]*([\d.]+)\s*元\/升[^\d\-+]*([\-+]?\s*[\d.]+)\s*元\/升/gi;
        while ((match = altPattern.exec(html)) !== null) {
            const type = match[1].trim();
            const price = match[2].trim() + '元/升';
            const change = match[3].trim().replace(/\s+/g, '') + '元/升';
            
            data.prices.push({
                type: type,
                price: price,
                change: change,
                isUp: change.startsWith('+'),
                isDown: change.startsWith('-')
            });
        }
    }
    
    // 解析更新时间
    const updateMatch = html.match(/油价更新于\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}|24:00)/i);
    if (updateMatch) {
        data.updateTime = `${updateMatch[1]} ${updateMatch[2]}`;
    }
    
    // 解析下次调整时间
    const nextMatch = html.match(/下次调整时间为\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}|24:00)/i);
    if (nextMatch) {
        data.nextAdjustTime = `${nextMatch[1]} ${nextMatch[2]}`;
    }
    
    return data;
}

// ==================== 面板显示 ====================
function handlePanelDisplay(data) {
    const mainTypes = ['92号汽油', '95号汽油', '0号柴油'];
    const lines = [];
    
    for (const type of mainTypes) {
        const p = data.prices.find(x => x.type.includes(type));
        if (p) {
            const icon = p.isUp ? '📈' : p.isDown ? '📉' : '➡️';
            lines.push(`${type}: ${p.price} ${icon}${p.change.replace('元/升', '')}`);
        }
    }
    
    let content = lines.join('\n');
    
    if (data.updateTime) {
        content += `\n\n⏰ 更新: ${data.updateTime}`;
    }
    
    if (data.nextAdjustTime) {
        const days = calculateDays(data.nextAdjustTime);
        content += `\n📅 下次: ${data.nextAdjustTime}`;
        if (days !== null) content += ` (${days}天后)`;
    }
    
    $.done({
        title: `⛽ ${CONFIG.cityName}油价`,
        content: content,
        icon: 'fuel.pump.fill',
        'icon-color': '#007AFF'
    });
}

// ==================== 定时通知 ====================
function handleCronNotification(data) {
    // 检查是否需要通知
    if (CONFIG.onlyChange) {
        const lastPrices = $.getVal('last_prices', '');
        const currentPrices = JSON.stringify(data.prices);
        if (lastPrices === currentPrices) {
            $.log('油价未变化，跳过通知');
            $.done();
            return;
        }
        $.setVal('last_prices', currentPrices);
    }
    
    let body = '';
    for (const p of data.prices) {
        const icon = p.isUp ? '📈' : p.isDown ? '📉' : '➡️';
        body += `${p.type}: ${p.price} ${icon}${p.change.replace('元/升', '')}\n`;
    }
    
    if (data.nextAdjustTime) {
        const days = calculateDays(data.nextAdjustTime);
        body += `\n📅 下次调价: ${data.nextAdjustTime}`;
        if (days !== null) body += ` (${days}天后)`;
    }
    
    $.notify(
        `⛽ ${CONFIG.cityName}油价信息`,
        data.updateTime ? `更新于 ${data.updateTime}` : '',
        body
    );
    
    $.done();
}

// ==================== 工具函数 ====================
function calculateDays(dateStr) {
    try {
        const m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return null;
        
        const target = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const days = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    } catch (e) {
        return null;
    }
}

// ==================== API封装 ====================
function API(name) {
    return {
        name: name,
        
        getVal(key, defaultVal = '') {
            const val = $persistentStore.read(key);
            return val !== undefined && val !== null ? val : defaultVal;
        },
        
        setVal(key, val) {
            return $persistentStore.write(val, key);
        },
        
        log(msg) {
            console.log(`[${name}] ${msg}`);
        },
        
        notify(title, subtitle, body) {
            $notification.post(title, subtitle, body);
        },
        
        done(obj) {
            $done(obj);
        }
    };
}