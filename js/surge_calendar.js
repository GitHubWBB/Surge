/**
 * Surge 脚本: 万年历及详细黄历 (增强版)
 * 适配: 支持面板(Widget)与定时通知(Cron)
 */

async function getCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate();
    const url = `https://www.rili.com.cn/rili/json/pc_wnl/<LaTex>${year}/$</LaTex>{month}.js`;

    try {
        const response = await $http.get(url);
        let data = response.body;
        let startIdx = data.indexOf('{');
        let endIdx = data.lastIndexOf('}');
        if (startIdx === -1 || endIdx === -1) throw new Error("数据格式错误");
        
        let jsonData = JSON.parse(data.substring(startIdx, endIdx + 1));
        let info = jsonData.data.find(item => item.nian === year && item.yue === (now.getMonth() + 1) && item.ri === day);
        
        if (info) {
            let title = `${year}年${month}月${day}日 <LaTex>${info.dddd}`;
            let subTitle = `【$</LaTex>{info.shengxiao}】农历${info.n_yueri}`;
            let detail = `干支: <LaTex>${info.gz_nian} $</LaTex>{info.gz_yue} ${info.gz_ri}\n`;
            
            let jqName = info.jieqi_link ? info.jieqi_link.replace(/<[^>]+>/g, '') : "无";
            let jqNextName = info.jieqi_next_link ? info.jieqi_next_link.replace(/<[^>]+>/g, '') : "无";
            detail += `节气: ${jqName}第${info.jieqi_pass}天，距${jqNextName}还有${info.jieqi_next}天\n`;
            
            let xzName = info.xingzuo_link ? info.xingzuo_link.replace(/<[^>]+>/g, '') : "";
            detail += `星座: ${xzName}  月相: ${info.yuexiang}\n星宿: ${info.xingxiu}\n`;
            detail += `五行: ${info.wx_nian}(年) ${info.wx_yue}(月) ${info.wx_ri}(日)\n`;
            
            let festival = info.jie ? info.jie.replace(/<[^>]+>/g, '').trim() : "";
            if (festival) detail += `节日: ${festival}\n`;
            
            detail += `━━━━━━━━━━━━━━━\n✅ 宜: ${info.yi.join(' ')}\n❌ 忌: ${info.ji.join(' ')}`;
            
            return { title, subTitle, detail };
        }
    } catch (e) {
        return { title: "万年历", subTitle: "获取失败", detail: e.message };
    }
}

(async () => {
    const res = await getCalendar();
    
    if (typeof $widget !== 'undefined') {
        // 面板模式：必须通过 $done 返回一个对象
        $done({
            title: res.title,
            content: res.subTitle + '\n' + res.detail,
            icon: "calendar.circle.fill",
            "icon-color": "#FF2D55"
        });
    } else {
        // 定时通知模式
        <LaTex>$notification.post(res.title, res.subTitle, res.detail);
        $</LaTex>done();
    }
})();
