/**
 * 油价查询脚本 for Surge
 * 数据来源: 本地宝 (bendibao.com)
 * 功能: 面板显示 + 定时通知
 * 
 * 使用方法:
 * 1. 面板模式: 配置Panel脚本
 * 2. 通知模式: 配置Cron脚本
 * 
 * 可配置参数:
 * - oil_city: 城市代码 (如 cd, bj, sh, gz, sz 等)
 * - notify_cron: 定时通知的cron表达式 (默认: 0 9 * * * 每天9点)
 * - notify_only_change: 仅在油价调整时通知 (默认: false)
 */

const $ = new API("油价查询");

// ==================== 配置区域 ====================
const CONFIG = {
    // 城市代码: cd(成都), bj(北京), sh(上海), gz(广州), sz(深圳), cq(重庆) 等
    city: $.getVal('oil_city', 'cd'),
    
    // 关注的城市名称（用于显示）
    cityName: '',
    
    // 仅在油价调整时通知
    notifyOnlyOnChange: $.getVal('notify_only_change', 'false') === 'true',
    
    // 上次油价（用于比较）
    lastPrices: $.getVal('last_oil_prices', '{}'),
    
    // 调试模式
    debug: false
};

// 城市名称映射
const CITY_NAMES = {
    'cd': '成都',
    'bj': '北京',
    'sh': '上海',
    'gz': '广州',
    'sz': '深圳',
    'cq': '重庆',
    'hz': '杭州',
    'nj': '南京',
    'wh': '武汉',
    'tj': '天津',
    'zz': '郑州',
    'cs': '长沙',
    'qd': '青岛',
    'suzhou': '苏州',
    'dg': '东莞',
    'fs': '佛山'
};

// ==================== 主程序 ====================
(async () => {
    try {
        CONFIG.cityName = CITY_NAMES[CONFIG.city] || CONFIG.city.toUpperCase();
        
        $.log(`开始获取 ${CONFIG.cityName} 油价信息...`);
        
        const oilData = await fetchOilPrice();
        
        if (!oilData || !oilData.prices || oilData.prices.length === 0) {
            throw new Error('未能获取到油价数据');
        }
        
        $.log(`成功获取 ${oilData.prices.length} 条油价数据`);
        
        // 保存当前油价用于下次比较
        const currentPricesJson = JSON.stringify(oilData.prices);
        const lastPricesJson = CONFIG.lastPrices;
        
        // 判断是否为cron执行（定时通知模式）
        const isCron = typeof $trigger !== 'undefined' && $trigger === 'cron';
        
        if (isCron) {
            // 定时通知模式
            await handleCronNotification(oilData, currentPricesJson !== lastPricesJson);
        } else {
            // 面板模式
            await handlePanelDisplay(oilData);
        }
        
        // 保存当前油价
        $.setVal('last_oil_prices', currentPricesJson);
        
    } catch (error) {
        $.log(`错误: ${error.message || error}`);
        
        const isCron = typeof $trigger !== 'undefined' && $trigger === 'cron';
        
        if (isCron) {
            // 定时通知错误 - 静默处理
        } else {
            // 面板错误显示
            const panel = {
                title: '⛽ 油价查询',
                content: `获取失败: ${error.message || error}`,
                icon: 'fuel.pump.fill',
                'icon-color': '#FF3B30'
            };
            $.done(panel);
            return;
        }
    }
    
    $.done();
})();

// ==================== 数据获取 ====================
function fetchOilPrice() {
    return new Promise((resolve, reject) => {
        const url = `https://${CONFIG.city}.bendibao.com/news/youjiachaxun/`;
        
        const headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
        };
        
        const options = { url, headers };
        
        $.httpClient.get(options, (error, response, body) => {
            if (error) {
                reject(`请求失败: ${error}`);
                return;
            }
            
            const status = response?.status || response?.statusCode;
            
            if (status !== 200) {
                reject(`HTTP ${status}`);
                return;
            }
            
            if (!body) {
                reject('返回内容为空');
                return;
            }
            
            try {
                const data = parseOilData(body);
                resolve(data);
            } catch (e) {
                reject(`解析失败: ${e.message}`);
            }
        });
    });
}

// ==================== 数据解析 ====================
function parseOilData(html) {
    const data = {
        prices: [],
        updateTime: '',
        nextAdjustTime: '',
        adjustDates: []
    };
    
    // 解析油价表格数据 - 方案1: 严格模式
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
    
    // 方案2: 宽松模式（如果方案1没有结果）
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
    const updatePattern = /油价更新于\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}|24:00)/i;
    const updateMatch = html.match(updatePattern);
    if (updateMatch) {
        data.updateTime = `${updateMatch[1]} ${updateMatch[2]}`;
    }
    
    // 解析下次调整时间
    const nextAdjustPattern = /下次调整时间为\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}|24:00)/i;
    const nextAdjustMatch = html.match(nextAdjustPattern);
    if (nextAdjustMatch) {
        data.nextAdjustTime = `${nextAdjustMatch[1]} ${nextAdjustMatch[2]}`;
    }
    
    return data;
}

// ==================== 面板显示 ====================
async function handlePanelDisplay(data) {
    // 构建面板内容
    let content = '';
    
    // 主要油价（92号和95号汽油）
    const mainTypes = ['92号汽油', '95号汽油', '0号柴油'];
    const mainPrices = [];
    
    for (const type of mainTypes) {
        const priceInfo = data.prices.find(p => p.type.includes(type));
        if (priceInfo) {
            const changeIcon = priceInfo.isUp ? '📈' : priceInfo.isDown ? '📉' : '➡️';
            const changeText = priceInfo.change.replace('元/升', '');
            mainPrices.push(`${type}: ${priceInfo.price} ${changeIcon}${changeText}`);
        }
    }
    
    content = mainPrices.join('\n');
    
    // 添加时间信息
    if (data.updateTime) {
        content += `\n\n⏰ 更新: ${data.updateTime}`;
    }
    
    if (data.nextAdjustTime) {
        const daysUntil = calculateDaysUntil(data.nextAdjustTime);
        content += `\n📅 下次: ${data.nextAdjustTime}`;
        if (daysUntil !== null) {
            content += ` (${daysUntil}天后)`;
        }
    }
    
    // 构建面板
    const panel = {
        title: `⛽ ${CONFIG.cityName}油价`,
        content: content,
        icon: 'fuel.pump.fill',
        'icon-color': '#007AFF'
    };
    
    $.done(panel);
}

// ==================== 定时通知 ====================
async function handleCronNotification(data, hasChanged) {
    // 如果设置了仅在变化时通知，且价格未变化，则跳过
    if (CONFIG.notifyOnlyOnChange && !hasChanged) {
        $.log('油价未变化，跳过通知');
        return;
    }
    
    // 构建通知标题
    let title = `⛽ ${CONFIG.cityName}油价信息`;
    if (hasChanged) {
        title += ' [已更新]';
    }
    
    // 构建通知内容
    let subtitle = '';
    if (data.updateTime) {
        subtitle = `更新于 ${data.updateTime}`;
    }
    
    // 构建详细内容
    let body = '';
    
    // 显示所有油价
    for (const price of data.prices) {
        const changeIcon = price.isUp ? '📈' : price.isDown ? '📉' : '➡️';
        const changeText = price.change.replace('元/升', '');
        const sign = changeText.startsWith('+') ? '+' : changeText.startsWith('-') ? '' : '';
        body += `${price.type}: ${price.price} ${changeIcon}${sign}${changeText}\n`;
    }
    
    // 添加下次调整信息
    if (data.nextAdjustTime) {
        const daysUntil = calculateDaysUntil(data.nextAdjustTime);
        body += `\n📅 下次调价: ${data.nextAdjustTime}`;
        if (daysUntil !== null) {
            body += ` (${daysUntil}天后)`;
        }
    }
    
    // 发送通知
    $.notify(title, subtitle, body);
}

// ==================== 工具函数 ====================
function calculateDaysUntil(dateStr) {
    try {
        const dateMatch = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (!dateMatch) return null;
        
        const year = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        const day = parseInt(dateMatch[3]);
        
        const targetDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    } catch (e) {
        return null;
    }
}

// ==================== API 封装 ====================
function API(name = "未命名") {
    return new class {
        constructor(name) {
            this.name = name;
            this.isQX = typeof $task !== 'undefined';
            this.isLoon = typeof $loon !== 'undefined';
            this.isSurge = typeof $httpClient !== 'undefined' && !this.isLoon;
            this.isStash = typeof $environment !== 'undefined' && $environment['stash-version'];
        }

        getVal(key, defaultVal = '') {
            let val;
            if (this.isSurge || this.isLoon) {
                val = $persistentStore.read(key);
            } else if (this.isQX) {
                val = $prefs.valueForKey(key);
            }
            return val ?? defaultVal;
        }

        setVal(key, val) {
            if (this.isSurge || this.isLoon) {
                return $persistentStore.write(val, key);
            } else if (this.isQX) {
                return $prefs.setValueForKey(val, key);
            }
        }

        get httpClient() {
            return {
                get: (options, callback) => {
                    if (this.isQX) {
                        $task.fetch(options).then(
                            resp => callback(null, resp, resp.body),
                            reason => callback(reason.error, null, null)
                        );
                    } else if (this.isSurge || this.isLoon || this.isStash) {
                        $httpClient.get(options, callback);
                    }
                }
            };
        }

        notify(title, subtitle, message) {
            if (this.isQX) {
                $notify(title, subtitle, message);
            } else if (this.isSurge || this.isLoon || this.isStash) {
                $notification.post(title, subtitle, message);
            }
        }

        log(message) {
            console.log(`[${this.name}] ${message}`);
        }

        done(value = {}) {
            $done(value);
        }
    }(name);
}