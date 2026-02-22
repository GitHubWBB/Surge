/**
 * Surge 脚本：通用时间差计算
 * 严格适配面板与定时通知
 */

// 1. 鲁棒的参数解析
let targetTimeStr = "";
if (typeof <LaTex>$argument !== "undefined" && $</LaTex>argument) {
    // 处理 "date=2026-01-01 00:00:00" 格式
    const match = <LaTex>$argument.match(/date=(.+)$</LaTex>/);
    targetTimeStr = match ? match[1] : $argument;
}

const now = new Date();
const target = new Date(targetTimeStr);

// 2. 时间差计算函数
function formatDiff(ms) {
    const isPast = ms < 0;
    const absMs = Math.abs(ms);
    const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absMs % (1000 * 60)) / 1000);
    
    let result = "";
    if (days > 0) result += `${days}天 `;
    if (hours > 0 || days > 0) result += `${hours}小时 `;
    result += `${minutes}分 ${seconds}秒`;
    
    return { text: result, isPast: isPast };
}

// 3. 逻辑执行与返回
(function() {
    try {
        if (!targetTimeStr || isNaN(target.getTime())) {
            const errorText = !targetTimeStr ? "未设置日期" : `无效日期: <LaTex>${targetTimeStr}`;
            if (typeof $</LaTex>panel !== "undefined") {
                $done({
                    title: "时间差计算",
                    content: errorText,
                    icon: "exclamationmark.triangle",
                    "icon-color": "#FF9500"
                });
            } else {
                $notification.post("时间差插件", "配置错误", errorText);
                $done();
            }
            return;
        }

        const diff = target.getTime() - now.getTime();
        const formatted = formatDiff(diff);
        const prefix = formatted.isPast ? "已过去: " : "剩余时间: ";
        const displayContent = `<LaTex>${prefix}$</LaTex>{formatted.text}\n目标: <LaTex>${targetTimeStr}`;

        if (typeof $</LaTex>panel !== "undefined") {
            // 面板返回：必须包含 title 和 content 字段
            $done({
                title: "时间差计算",
                content: displayContent,
                icon: "timer",
                "icon-color": formatted.isPast ? "#FF3B30" : "#34C759"
            });
        } else {
            // 定时任务通知
            $notification.post("时间差提醒", `目标: <LaTex>${targetTimeStr}`, displayContent);
            $</LaTex>done();
        }
    } catch (e) {
        console.log("脚本执行异常: " + e);
        $done({ title: "脚本错误", content: e.message });
    }
})();
