/**
 * Surge 脚本: 万年历及详细黄历
 * 适配: 面板(Panel) 与 定时任务(Cron)
 */

const now = new Date();
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate();
const url = `https://www.rili.com.cn/rili/json/pc_wnl/${year}/${month}.js`;

$httpClient.get(url, function(error, response, data ) {
    if (error) {
        $done({
            title: "万年历",
            content: "网络请求失败: " + error,
            icon: "exclamationmark.triangle.fill"
        });
        return;
    }

    try {
        let startIdx = data.indexOf('{');
        let endIdx = data.lastIndexOf('}');
        if (startIdx === -1 || endIdx === -1) throw new Error("数据格式错误");
        
        let jsonData = JSON.parse(data.substring(startIdx, endIdx + 1));
        let info = jsonData.data.find(item => item.nian === year && item.yue === (now.getMonth() + 1) && item.ri === day);
        
        if (info) {
            let title = `${year}年${month}月${day}日 ${info.dddd}`;
            let subTitle = `【${info.shengxiao}】农历${info.n_yueri}`;
            let detail = `干支: ${info.gz_nian} ${info.gz_yue} ${info.gz_ri}\n`;
            
            let jqName = info.jieqi_link ? info.jieqi_link.replace(/<[^>]+>/g, '') : "无";
            let jqNextName = info.jieqi_next_link ? info.jieqi_next_link.replace(/<[^>]+>/g, '') : "无";
            detail += `节气: ${jqName}第${info.jieqi_pass}天，距${jqNextName}还有${info.jieqi_next}天\n`;
            
            let xzName = info.xingzuo_link ? info.xingzuo_link.replace(/<[^>]+>/g, '') : "";
            detail += `星座: ${xzName}  月相: ${info.yuexiang}\n星宿: ${info.xingxiu}\n`;
            detail += `五行: ${info.wx_nian}(年) ${info.wx_yue}(月) ${info.wx_ri}(日)\n`;
            
            let festival = info.jie ? info.jie.replace(/<[^>]+>/g, '').trim() : "";
            if (festival) detail += `节日: ${festival}\n`;
            
            detail += `━━━━━━━━━━━━━━━\n✅ 宜: ${info.yi.join(' ')}\n❌ 忌: ${info.ji.join(' ')}`;
            
            // 针对定时任务发送通知
            if (typeof $cronexp !== "undefined" || (typeof $script !== "undefined" && $script.type === "cron")) {
                $notification.post(title, subTitle, detail);
            }

            // 面板模式返回对象
            $done({
                title: title,
                content: subTitle + "\n" + detail,
                icon: "calendar.circle.fill",
                "icon-color": "#FF2D55"
            });
        } else {
            throw new Error("未找到今日数据");
        }
    } catch (e) {
        $done({
            title: "万年历",
            content: "解析失败: " + e.message,
            icon: "exclamationmark.triangle.fill"
        });
    }
});
