/**
 * 油价查询脚本 for Surge
 * 数据来源: 本地宝 (bendibao.com)
 * 
 * 参数:
 * - city: 城市代码 (默认: cd)
 * - onlychange: 仅在变化时通知 (默认: false)
 */

const $ = new API("油价查询");

// ==================== 解析参数 ====================
function getArgs() {
    var args = {};
    if (typeof $argument !== 'undefined' && $argument) {
        var pairs = $argument.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var parts = pair.split('=');
            if (parts.length === 2) {
                args[parts[0]] = decodeURIComponent(parts[1]);
            }
        }
    }
    return args;
}

var ARGS = getArgs();

// ==================== 配置 ====================
var CONFIG = {
    city: ARGS.city || 'cd',
    onlyChange: ARGS.onlychange === 'true' || ARGS.onlychange === '1',
    cityName: ''
};

// 城市名称映射
var CITY_NAMES = {
    'cd': '成都', 'bj': '北京', 'sh': '上海', 'gz': '广州', 'sz': '深圳',
    'cq': '重庆', 'hz': '杭州', 'nj': '南京', 'wh': '武汉', 'tj': '天津',
    'zz': '郑州', 'cs': '长沙', 'qd': '青岛', 'suzhou': '苏州',
    'dg': '东莞', 'fs': '佛山'
};

CONFIG.cityName = CITY_NAMES[CONFIG.city] || CONFIG.city.toUpperCase();

$.log('城市: ' + CONFIG.cityName + ', 仅变化通知: ' + CONFIG.onlyChange);

// ==================== 主程序 ====================
function main() {
    var url = 'https://' + CONFIG.city + '.bendibao.com/news/youjiachaxun/';
    
    $.log('请求URL: ' + url);
    
    httpGet(url, function(error, html) {
        if (error) {
            handleError(error);
            return;
        }
        
        if (!html) {
            handleError('返回内容为空');
            return;
        }
        
        var data = parseOilData(html);
        
        if (!data.prices || data.prices.length === 0) {
            handleError('未能解析到油价数据');
            return;
        }
        
        $.log('成功解析 ' + data.prices.length + ' 条油价数据');
        
        // 判断是否为cron执行
        var isCron = typeof $trigger !== 'undefined' && $trigger === 'cron';
        
        if (isCron) {
            handleCronNotification(data);
        } else {
            handlePanelDisplay(data);
        }
    });
}

function handleError(error) {
    $.log('错误: ' + error);
    
    var isCron = typeof $trigger !== 'undefined' && $trigger === 'cron';
    
    if (!isCron) {
        $.done({
            title: '⛽ 油价查询',
            content: '获取失败: ' + error,
            icon: 'fuel.pump.fill',
            'icon-color': '#FF3B30'
        });
    } else {
        $.done();
    }
}

// ==================== HTTP请求 ====================
function httpGet(url, callback) {
    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }
    };
    
    $httpClient.get(options, function(error, response, body) {
        if (error) {
            callback('请求失败: ' + error, null);
            return;
        }
        
        if (!response) {
            callback('响应为空', null);
            return;
        }
        
        var statusCode = response.status || response.statusCode;
        
        if (statusCode !== 200) {
            callback('HTTP ' + statusCode, null);
            return;
        }
        
        if (!body) {
            callback('返回内容为空', null);
            return;
        }
        
        callback(null, body);
    });
}

// ==================== 数据解析 ====================
function parseOilData(html) {
    var data = {
        prices: [],
        updateTime: '',
        nextAdjustTime: ''
    };
    
    // 解析油价
    var pricePattern = /(0号柴油|89号汽油|92号汽油|95号汽油|98号汽油|[-–]10号柴油|[-–]20号柴油)[\s\S]*?([\d.]+)\s*元\/升[\s\S]*?([\-+\s]*[\d.]+)\s*元\/升/gi;
    
    var match;
    var seen = {};
    while ((match = pricePattern.exec(html)) !== null) {
        var type = match[1].trim();
        // 去重
        if (seen[type]) continue;
        seen[type] = true;
        
        var price = match[2].trim() + '元/升';
        var change = match[3].trim().replace(/\s+/g, '') + '元/升';
        
        data.prices.push({
            type: type,
            price: price,
            change: change,
            isUp: change.indexOf('+') === 0,
            isDown: change.indexOf('-') === 0
        });
    }
    
    // 解析更新时间
    var updateMatch = html.match(/更新于\s*(\d{4}-\d{2}-\d{2})\s*<[^>]*>\s*(\d{2}:\d{2}|24:00)/i);
    if (updateMatch) {
        data.updateTime = updateMatch[1] + ' ' + updateMatch[2];
    }
    
    // 解析下次调整时间
    var nextMatch = html.match(/下次调整时间为\s*(\d{4}-\d{2}-\d{2})\s*<[^>]*>\s*(\d{2}:\d{2}|24:00)/i);
    if (nextMatch) {
        data.nextAdjustTime = nextMatch[1] + ' ' + nextMatch[2];
    }
    
    return data;
}

// ==================== 面板显示 ====================
function handlePanelDisplay(data) {
    var mainTypes = ['92号汽油', '95号汽油', '0号柴油'];
    var lines = [];
    
    for (var i = 0; i < mainTypes.length; i++) {
        var type = mainTypes[i];
        var p = null;
        for (var j = 0; j < data.prices.length; j++) {
            if (data.prices[j].type.indexOf(type) !== -1) {
                p = data.prices[j];
                break;
            }
        }
        if (p) {
            var icon = p.isUp ? '📈' : p.isDown ? '📉' : '➡️';
            lines.push(type + ': ' + p.price + ' ' + icon + p.change.replace('元/升', ''));
        }
    }
    
    var content = lines.join('\n');
    
    if (data.updateTime) {
        content += '\n\n⏰ 更新: ' + data.updateTime;
    }
    
    if (data.nextAdjustTime) {
        var days = calculateDays(data.nextAdjustTime);
        content += '\n📅 下次: ' + data.nextAdjustTime;
        if (days !== null) content += ' (' + days + '天后)';
    }
    
    $.done({
        title: '⛽ ' + CONFIG.cityName + '油价',
        content: content,
        icon: 'fuel.pump.fill',
        'icon-color': '#007AFF'
    });
}

// ==================== 定时通知 ====================
function handleCronNotification(data) {
    // 检查是否需要通知
    if (CONFIG.onlyChange) {
        var lastPrices = $.getVal('last_prices', '');
        var currentPrices = JSON.stringify(data.prices);
        if (lastPrices === currentPrices) {
            $.log('油价未变化，跳过通知');
            $.done();
            return;
        }
        $.setVal('last_prices', currentPrices);
    }
    
    var body = '';
    for (var i = 0; i < data.prices.length; i++) {
        var p = data.prices[i];
        var icon = p.isUp ? '📈' : p.isDown ? '📉' : '➡️';
        body += p.type + ': ' + p.price + ' ' + icon + p.change.replace('元/升', '') + '\n';
    }
    
    if (data.nextAdjustTime) {
        var days = calculateDays(data.nextAdjustTime);
        body += '\n📅 下次调价: ' + data.nextAdjustTime;
        if (days !== null) body += ' (' + days + '天后)';
    }
    
    $.notify(
        '⛽ ' + CONFIG.cityName + '油价信息',
        data.updateTime ? '更新于 ' + data.updateTime : '',
        body
    );
    
    $.done();
}

// ==================== 工具函数 ====================
function calculateDays(dateStr) {
    try {
        var m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return null;
        
        var target = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        
        var days = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    } catch (e) {
        return null;
    }
}

// ==================== API封装 ====================
function API(name) {
    return {
        name: name,
        
        getVal: function(key, defaultVal) {
            defaultVal = defaultVal || '';
            var val = $persistentStore.read(key);
            return val !== undefined && val !== null ? val : defaultVal;
        },
        
        setVal: function(key, val) {
            return $persistentStore.write(val, key);
        },
        
        log: function(msg) {
            console.log('[' + name + '] ' + msg);
        },
        
        notify: function(title, subtitle, body) {
            $notification.post(title, subtitle, body);
        },
        
        done: function(obj) {
            $done(obj);
        }
    };
}

// 启动
main();
