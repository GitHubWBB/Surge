/**
 * Surge 脚本：通用时间差计算（支持面板与定时通知）
 * 参数 ($argument): 目标时间字符串，如 "2026-01-01 00:00:00"
 */

const targetTimeStr = $argument;
const now = new Date();
const target = new Date(targetTimeStr);

// 格式化时间差逻辑
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

// 检查参数有效性
if (!targetTimeStr || isNaN(target.getTime())) {
    const errorMsg = `无效参数: "${targetTimeStr || '空'}"。请使用 YYYY-MM-DD HH:mm:ss`;
    if (typeof <LaTex>$panel !== "undefined") {
        $</LaTex>done({ title: "时间差错误", content: errorMsg, icon: "exclamationmark.triangle", "icon-color": "#FF0000" });
    } else {
        $notification.post("时间差插件错误", "参数缺失或格式错误", errorMsg);
        $done();
    }
} else {
    const diff = target.getTime() - now.getTime();
    const formatted = formatDiff(diff);
    const prefix = formatted.isPast ? "已过去: " : "剩余时间: ";
    const content = `<LaTex>${prefix}$</LaTex>{formatted.text}\n目标: <LaTex>${targetTimeStr}`;

    if (typeof $</LaTex>panel !== "undefined") {
        // 面板模式：返回 JSON 供 Surge 面板渲染
        $done({
            title: "时间倒计时",
            content: content,
            icon: "timer",
            "icon-color": formatted.isPast ? "#FF3B30" : "#34C759"
        });
    } else {
        // 定时任务模式：发送系统通知
        $notification.post("时间差提醒", `目标: <LaTex>${targetTimeStr}`, content);
        $</LaTex>done();
    }
}
