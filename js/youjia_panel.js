/**
 * 油价查询面板 - 单一油号趋势版
 * 数据来源: 本地宝 (bendibao.com)
 * 
 * 参数:
 * - city: 城市代码 (默认: cd)
 * - type: 油号类型 (默认: 95号汽油)
 */

// ==================== 解析参数 ====================
var city = 'cd';
var oilType = '95号汽油';

if (typeof $argument !== 'undefined' && $argument) {
    var args = $argument.split('&');
    for (var i = 0; i < args.length; i++) {
        var kv = args[i].split('=');
        if (kv.length === 2) {
            if (kv[0] === 'city') city = kv[1];
            if (kv[0] === 'type') oilType = decodeURIComponent(kv[1]);
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

// ==================== 读取历史数据 ====================
var historyData = [];
try {
    var saved = $persistentStore.read('oil_history_' + city + '_' + oilType);
    if (saved) {
        historyData = JSON.parse(saved);
    }
} catch (e) {}

// ==================== 发送请求 ====================
var url = 'https://' + city + '.bendibao.com/news/youjiachaxun/';

$httpClient.get({
    url: url,
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
    }
}, function(error, response, body) {
    if (error || !response || (response.status || response.statusCode) !== 200 || !body) {
        showError('获取失败');
        return;
    }
    
    var data = parseOilData(body);
    
    if (!data.currentPrice) {
        showError('未找到' + oilType + '价格');
        return;
    }
    
    // 更新历史数据
    updateHistory(data.currentPrice);
    
    // 显示面板
    showPanel(data);
});

// ==================== 解析数据 ====================
function parseOilData(html) {
    var data = {
        currentPrice: null,
        change: 0,
        updateTime: '',
        nextAdjustTime: ''
    };
    
    // 匹配指定油号的价格
    var patterns = [
        new RegExp('(' + oilType.replace(/[号\-]/g, '[号\\\\-]?') + ')[\\s\\S]*?([\\d.]+)\\s*元/升[\\s\\S]*?([\\-+\\s]*[\\d.]+)\\s*元/升', 'i'),
        new RegExp('(' + oilType.replace('号', '') + ')[\\s\\S]*?([\\d.]+)\\s*元/升[\\s\\S]*?([\\-+\\s]*[\\d.]+)\\s*元/升', 'i')
    ];
    
    for (var i = 0; i < patterns.length; i++) {
        var match = html.match(patterns[i]);
        if (match) {
            data.currentPrice = parseFloat(match[2]);
            data.change = parseFloat(match[3].replace(/\s+/g, '')) || 0;
            break;
        }
    }
    
    // 解析更新时间
    var updateMatch = html.match(/更新于\s*(\d{4}-\d{2}-\d{2})\s*<[^>]*>\s*(\d{2}:\d{2}|24:00)/i);
    if (updateMatch) {
        data.updateTime = updateMatch[1];
    }
    
    // 解析下次调整时间
    var nextMatch = html.match(/下次调整时间为\s*(\d{4}-\d{2}-\d{2})\s*<[^>]*>\s*(\d{2}:\d{2}|24:00)/i);
    if (nextMatch) {
        data.nextAdjustTime = nextMatch[1];
    }
    
    return data;
}

// ==================== 更新历史数据 ====================
function updateHistory(price) {
    var today = new Date().toISOString().split('T')[0];
    
    // 检查今天是否已记录
    var exists = false;
    for (var i = 0; i < historyData.length; i++) {
        if (historyData[i].date === today) {
            historyData[i].price = price;
            exists = true;
            break;
        }
    }
    
    if (!exists) {
        historyData.push({
            date: today,
            price: price
        });
    }
    
    // 只保留最近15条（拉满宽度）
    if (historyData.length > 15) {
        historyData = historyData.slice(-15);
    }
    
    // 保存
    try {
        $persistentStore.write(JSON.stringify(historyData), 'oil_history_' + city + '_' + oilType);
    } catch (e) {}
}

// ==================== 生成趋势图 ====================
function generateTrend() {
    if (historyData.length < 2) {
        return { chart: '  (数据不足)', prices: '' };
    }
    
    var prices = [];
    for (var i = 0; i < historyData.length; i++) {
        prices.push(historyData[i].price);
    }
    
    var min = Math.min.apply(null, prices);
    var max = Math.max.apply(null, prices);
    var range = max - min || 1;
    
    // 趋势图字符 (使用更宽的字符集)
    var chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    var chart = '';
    
    for (var i = 0; i < prices.length; i++) {
        var idx = Math.floor((prices[i] - min) / range * (chars.length - 1));
        chart += chars[idx];
    }
    
    // 生成价格数值显示（取几个关键点）
    var priceStr = '';
    var step = Math.ceil(prices.length / 5);
    for (var i = 0; i < prices.length; i += step) {
        priceStr += prices[i].toFixed(2) + ' ';
    }
    priceStr += prices[prices.length - 1].toFixed(2);
    
    return { chart: chart, prices: priceStr.trim() };
}

// ==================== 显示面板 ====================
function showPanel(data) {
    var lines = [];
    
    // 第一行：油号 + 当前价格 + 涨跌
    var priceStr = data.currentPrice.toFixed(2) + '元/升';
    var changeStr = '';
    var iconColor = '#007AFF';
    
    if (data.change > 0) {
        changeStr = '↑ +' + data.change.toFixed(2);
        iconColor = '#FF3B30';
    } else if (data.change < 0) {
        changeStr = '↓ ' + data.change.toFixed(2);
        iconColor = '#34C759';
    } else {
        changeStr = '− 0.00';
    }
    
    lines.push(oilType + ' ' + priceStr + ' ' + changeStr);
    
    // 趋势图（拉满宽度）
    var trend = generateTrend();
    lines.push(trend.chart);
    
    // 历史价格数值
    if (trend.prices) {
        lines.push(trend.prices);
    }
    
    // 分隔线
    lines.push('─────────────────────');
    
    // 时间信息
    var timeLine = '';
    if (data.updateTime) {
        timeLine += '📅' + data.updateTime;
    }
    if (data.nextAdjustTime) {
        var days = calculateDays(data.nextAdjustTime);
        timeLine += '  ⏰' + data.nextAdjustTime;
        if (days !== null) {
            timeLine += '(' + days + '天)';
        }
    }
    if (timeLine) {
        lines.push(timeLine);
    }
    
    // 标题只显示城市（图标在左边）
    $done({
        title: cityName,
        content: lines.join('\n'),
        icon: 'fuel.pump.fill',
        'icon-color': iconColor
    });
}

// ==================== 显示错误 ====================
function showError(msg) {
    $done({
        title: cityName,
        content: msg,
        icon: 'fuel.pump.fill',
        'icon-color': '#FF3B30'
    });
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
