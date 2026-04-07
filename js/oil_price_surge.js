/*
 * Surge Oil Price Script
 * 获取成都本地宝油价信息，并格式化输出，支持面板显示和定时通知。
 * 使用 Surge 的 $httpClient 进行网络请求，并使用正则表达式解析 HTML。
 */

const URL = 'https://cd.bendibao.com/news/youjiachaxun/';

async function getOilPriceData() {
    return new Promise((resolve, reject) => {
        $httpClient.get(URL, function(error, response, data) {
            if (error) {
                console.log(`$httpClient error: ${error}`);
                reject(error);
                return;
            }

            if (response.status !== 200) {
                console.log(`HTTP status error: ${response.status}`);
                reject(new Error(`HTTP status ${response.status}`));
                return;
            }

            let oilPrices = [];
            let updateTime = '';
            let nextAdjustmentTime = '';
            let adjustmentCalendar = [];

            // 提取当前油价数据
            const priceRegex = /<tr>\s*<td>(.*?号柴油|.*?号汽油)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td[^>]*><a[^>]*>>\s*<\/a><\/td>\s*<\/tr>/g;
            let match;
            while ((match = priceRegex.exec(data)) !== null) {
                oilPrices.push({
                    name: match[1].trim(),
                    price: match[2].trim(),
                    change: match[3].trim()
                });
            }

            // 提取更新时间和下次调整时间
            const timeRegex = /以上油价更新于(\d{4}-\d{2}-\d{2} \d{2}:\d{2})； 油价下次调整时间为(\d{4}-\d{2}-\d{2} \d{2}:\d{2})；/;
            const timeMatch = data.match(timeRegex);
            if (timeMatch) {
                updateTime = timeMatch[1];
                nextAdjustmentTime = timeMatch[2];
            }

            // 提取油价调整日历
            const calendarSectionRegex = /2026年油价调整日历\s*(?:<ul[^>]*>\s*(?:<li[^>]*>.*?<\/li>\s*)*<\/ul>\s*){0,3}/s;
            const calendarSectionMatch = data.match(calendarSectionRegex);

            if (calendarSectionMatch) {
                const calendarContent = calendarSectionMatch[0];
                const calendarItemRegex = /(\d{1,2}月\d{1,2}日)\s*(星期[一二三四五六日])/g;
                let itemMatch;
                while ((itemMatch = calendarItemRegex.exec(calendarContent)) !== null) {
                    adjustmentCalendar.push({
                        date: itemMatch[1].trim(),
                        dayOfWeek: itemMatch[2].trim()
                    });
                }
            }

            resolve({
                oilPrices,
                updateTime,
                nextAdjustmentTime,
                adjustmentCalendar
            });
        });
    });
}

async function main() {
    try {
        const data = await getOilPriceData();

        if (!data || data.oilPrices.length === 0) {
            $done();
            return;
        }

        let panelContent = '🚗 成都油价速览\n';
        data.oilPrices.forEach(item => {
            panelContent += `${item.name}: ${item.price} (${item.change})\n`;
        });
        panelContent += `更新: ${data.updateTime}\n`;
        panelContent += `下次调整: ${data.nextAdjustmentTime}\n\n`;

        if (data.adjustmentCalendar.length > 0) {
            panelContent += '📅 油价调整日历 (部分)\n';
            // 只显示最近几条调整日历，避免面板过长
            data.adjustmentCalendar.slice(0, 5).forEach(item => {
                panelContent += `${item.date} ${item.dayOfWeek}\n`;
            });
        }

        // Surge 面板显示
        $done({
            title: '成都油价',
            content: panelContent,
            icon: 'fuelpump.fill'
        });

        // 定时通知
        if (typeof $notification !== 'undefined' && typeof $script !== 'undefined' && $script.isCron) {
            let notificationBody = '';
            data.oilPrices.forEach(item => {
                notificationBody += `${item.name}: ${item.price} (${item.change})\n`;
            });
            notificationBody += `下次调整: ${data.nextAdjustmentTime}`;
            $notification.post('油价提醒', '成都油价更新', notificationBody);
        }

    } catch (e) {
        console.log(`Script error: ${e.message}`);
        $done();
    }
}

main();