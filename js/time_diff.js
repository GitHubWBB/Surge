/**
 * Surge 脚本：通用时间差计算
 * 支持从 argument 中解析 date 参数
 */

// 解析参数：处理类似 "date=2026-01-01 00:00:00" 的格式
let targetTimeStr = "";
if (typeof <LaTex>$argument !== "undefined" && $</LaTex>argument) {
    if (<LaTex>$argument.indexOf("date=") !== -1) {
        targetTimeStr = $</LaTex>argument.split("date=")[1];
    } else {
        targetTimeStr = $argument;
    }
}

const now = new Date();
const target = new Date(targetTimeStr);

// 格式化时间差
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

// 结果输出
try {
    if (!targetTimeStr || isNaN(target.getTime())) {
        const errorText = !targetTimeStr ? "未设置目标日期" : `无效日期格式: <LaTex>${targetTimeStr}`;
        if (typeof $</LaTex>panel !== "undefined") {
            $done({ title: "时间差插件", content: errorText, icon: "exclamationmark.triangle", "icon-color": "#FF9500" });
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
            $done({
                title: "时间差计算",
                content: displayContent,
                icon: "timer",
                "icon-color": formatted.isPast ? "#FF3B30" : "#34C759"
            });
        } else {
            $notification.post("时间提醒", `目标: <LaTex>${targetTimeStr}`, displayContent);
            $</LaTex>done();
        }
    }
} catch (e) {
    $done();
}
