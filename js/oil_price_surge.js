/**
 * 油价查询脚本 for Surge
 * 数据来源: 本地宝 (bendibao.com)
 * 
 * 参数:
 * - city: 城市代码 (默认: cd)
 * - onlychange: 仅在变化时通知 (默认: false)
 */

// ==================== 解析参数 ====================
var city = 'cd';
var onlychange = false;

console.log('[油价查询] $argument: ' + (typeof $argument !== 'undefined' ? $argument : 'undefined'));

if (typeof $argument !== 'undefined' && $argument) {
    var args = $argument.split('&');
    console.log('[油价查询] 解析参数: ' + JSON.stringify(args));
    for (var i = 0; i < args.length; i++) {
        var kv = args[i].split('=');
        console.log('[油价查询] 参数' + i + ': ' + kv[0] + '=' + kv[1]);
        if (kv.length === 2) {
            if (kv[0] === 'city') city = kv[1];
            if (kv[0] === 'onlychange') onlychange = kv[1] === 'true';
        }
    }
}

// ==================== 城市名称映射 ====================
var cityNames = {
    'cd': '成都', 'bj': '北京', 'sh': '上海', 'gz': '广州', 'sz': '深圳',
    'cq': '重庆', 'hz': '杭州', 'nj': '南京', 'wh': '武汉', 'tj': '天津',
    'zz': '郑州', 'cs': '长沙', 'qd': '青岛', 'suzhou': '苏州',
    'dg': '东莞', 'fs': '佛山'
};

var cityName = cityNames[city] || city.toUpperCase();

console.log('[油价查询] 城市: ' + cityName + ', 仅变化通知: ' + onlychange);

// ==================== 判断执行模式 ====================
var isCron = false;
try {
    isCron = (typeof $trigger !== 'undefined' && $trigger === 'cron');
} catch (e) {}

console.log('[油价查询] 执行模式: ' + (isCron ? '定时任务' : '面板'));

// ==================== 主程序 ====================
var url = 'https://' + city + '.bendibao.com/news/youjiachaxun/';
console.log('[油价查询] 请求URL: ' + url);

// 发送请求
$httpClient.get({
    url: url,
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
    }
}, function(error, response, body) {
    console.log('[油价查询] 请求回调触发');
    
    // 检查错误
    if (error) {
        console.log('[油价查询] 请求错误: ' + error);
        handleError('请求失败: ' + error);
        return;
    }
    
    // 检查响应
    if (!response) {
        console.log('[油价查询] 响应为空');
        handleError('响应为空');
        return;
    }
    
    // 获取状态码
    var status = response.status || response.statusCode;
    console.log('[油价查询] HTTP状态码: ' + status);
    
    if (status !== 200) {
        handleError('HTTP ' + status);
        return;
    }
    
    if (!body) {
        handleError('返回内容为空');
        return;
    }
    
    console.log('[油价查询] 响应长度: ' + body.length);
    
    // 解析数据
    var data = parseOilData(body);
    
    if (!data.prices || data.prices.length === 0) {
        handleError('未能解析到油价数据');
        return;
    }
    
    console.log('[油价查询] 成功解析 ' + data.prices.length + ' 条油价数据');
    
    // 根据模式处理
    if (isCron) {
        handleCron(data);
    } else {
        handlePanel(data);
    }
});

// ==================== 错误处理 ====================
function handleError(msg) {
    console.log('[油价查询] 错误: ' + msg);
    if (isCron) {
        $done();
    } else {
        $done({
            title: '⛽ 油价查询',
            content: '获取失败: ' + msg,
            icon: 'fuel.pump.fill',
            'icon-color': '#FF3B30'
        });
    }
}

// ==================== 数据解析 ====================
function parseOilData(html) {
    var data = {
        prices: [],
        updateTime: '',
        nextAdjustTime: ''
    };
    
    // 解析油价
    var pattern = /(0号柴油|89号汽油|92号汽油|95号汽油|98号汽油|[\-–]10号柴油|[\-–]20号柴油)[\s\S]*?([\d.]+)\s*元\/升[\s\S]*?([\-+\s]*[\d.]+)\s*元\/升/gi;
    
    var match;
    var seen = {};
    while ((match = pattern.exec(html)) !== null) {
        var type = match[1].trim();
        if (seen[type]) continue;
        seen[type] = true;
        
        var price = match[2].trim();
        var change = match[3].trim().replace(/\s+/g, '');
        
        data.prices.push({
            type: type,
            price: price + '元/升',
            change: change + '元/升',
            isUp: change.charAt(0) === '+',
            isDown: change.charAt(0) === '-'
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
function handlePanel(data) {
    var mainTypes = ['92号汽油', '95号汽油', '0号柴油'];
    var lines = [];
    
    for (var i = 0; i < mainTypes.length; i++) {
        var type = mainTypes[i];
        var p = null;
        for (var j = 0; j < data.prices.length; j++) {
            if (data.prices[j].type.indexOf(type) >= 0) {
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
    
    console.log('[油价查询] 面板内容:\n' + content);
    
    $done({
        title: '⛽ ' + cityName + '油价',
        content: content,
        icon: 'fuel.pump.fill',
        'icon-color': '#007AFF'
    });
}

// ==================== 定时通知 ====================
function handleCron(data) {
    // 检查是否需要通知
    if (onlychange) {
        var lastPrices = '';
        try {
            lastPrices = $persistentStore.read('oil_last_prices') || '';
        } catch (e) {}
        
        var currentPrices = JSON.stringify(data.prices);
        
        if (lastPrices === currentPrices) {
            console.log('[油价查询] 油价未变化，跳过通知');
            $done();
            return;
        }
        
        try {
            $persistentStore.write(currentPrices, 'oil_last_prices');
        } catch (e) {}
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
    
    console.log('[油价查询] 发送通知');
    
    $notification.post(
        '⛽ ' + cityName + '油价信息',
        data.updateTime ? '更新于 ' + data.updateTime : '',
        body
    );
    
    $done();
}

// ==================== 工具函数 ====================
function calculateDays(dateStr) {
    try {
        var m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return null;
        
        var target = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        
        var diff = target - today;
        var days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    } catch (e) {
        return null;
    }
}
