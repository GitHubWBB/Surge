/**
 * Surge Script: Time Difference Calculation
 */

var targetTimeStr = "";
if (typeof <LaTex>$argument !== "undefined" && $</LaTex>argument) {
    if (<LaTex>$argument.indexOf("date=") !== -1) {
        targetTimeStr = $</LaTex>argument.split("date=")[1];
    } else {
        targetTimeStr = $argument;
    }
}

var now = new Date();
var target = new Date(targetTimeStr);

function formatDiff(ms) {
    var isPast = ms < 0;
    var absMs = Math.abs(ms);
    var days = Math.floor(absMs / (1000 * 60 * 60 * 24));
    var hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((absMs % (1000 * 60)) / 1000);
    var res = "";
    if (days > 0) res += days + "天 ";
    if (hours > 0 || days > 0) res += hours + "小时 ";
    res += minutes + "分 " + seconds + "秒";
    return { text: res, isPast: isPast };
}

if (!targetTimeStr || isNaN(target.getTime())) {
    var err = !targetTimeStr ? "未设置日期" : "日期格式错误";
    if (typeof <LaTex>$panel !== "undefined") {
        $</LaTex>done({ title: "时间差插件", content: err, icon: "timer", "icon-color": "#FF9500" });
    } else {
        $notification.post("时间差插件", "配置错误", err);
        $done();
    }
} else {
    var diff = target.getTime() - now.getTime();
    var f = formatDiff(diff);
    var p = f.isPast ? "已过去: " : "剩余时间: ";
    var content = p + f.text + "\n目标: " + targetTimeStr;

    if (typeof <LaTex>$panel !== "undefined") {
        $</LaTex>done({
            title: "时间差计算",
            content: content,
            icon: "timer",
            "icon-color": f.isPast ? "#FF3B30" : "#34C759"
        });
    } else {
        $notification.post("时间提醒", "目标: " + targetTimeStr, content);
        $done();
    }
}
