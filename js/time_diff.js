/**
 * Surge 脚本：通用时间差计算
 */

// 1. 解析参数
let targetTimeStr = "";
if (typeof <LaTex>$argument !== "undefined" && $</LaTex>argument) {
    // 兼容 "date=..." 格式和直接字符串格式
    targetTimeStr = <LaTex>$argument.indexOf("date=") !== -1 ? $</LaTex>argument.split("date=")[1] : $argument;
}

const now = new Date();
const target = new Date(targetTimeStr);

// 2. 格式化函数
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

// 3. 执行逻辑
try {
    if (!targetTimeStr || isNaN(target.getTime())) {
        const errorText = !targetTimeStr ? "未设置目标日期" : `无效日期: <LaTex>${targetTimeStr}`;
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
    } else {
        const diff = target.getTime() - now.getTime();
        const formatted = formatDiff(diff);
        const prefix = formatted.isPast ? "已过去: " : "剩余时间: ";
        const displayContent = `<LaTex>${prefix}$</LaTex>{formatted.text}\n目标: <LaTex>${targetTimeStr}`;

        if (typeof $</LaTex>panel !== "undefined") {
            // 必须返回 title 字段，否则面板可能显示为 Untitled
            $done({
                title: "时间差计算",
                content: displayContent,
                icon: "timer",
                "icon-color": formatted.isPast ? "#FF3B30" : "#34C759"
            });
        } else {
            // 定时通知
            $notification.post("时间差提醒", `目标: <LaTex>${targetTimeStr}`, displayContent);
            $</LaTex>done();
        }
    }
} catch (e) {
    console.log("脚本错误: " + e);
    $done({});
}
