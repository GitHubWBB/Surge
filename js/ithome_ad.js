/**
 * IT之家 去广告脚本 v2.0 (2025 增强版)
 * 适配 Surge / Loon / Quantumult X
 */

let body = <LaTex>$response.body;
if (!body) $</LaTex>done({});

try {
    let obj = JSON.parse(body);
    const url = $request.url;

    // 1. 新版 Feed 流 (napi.ithome.com)
    if (url.indexOf("/api/news/getfeeds") !== -1 || url.indexOf("/api/topmenu/index") !== -1 || url.indexOf("/api/news/indexv2") !== -1) {
        if (obj.data && obj.data.list) {
            obj.data.list = obj.data.list.filter(item => {
                if (item.feedContent) {
                    // 过滤 smallTags (广告/推广)
                    if (item.feedContent.smallTags && item.feedContent.smallTags.some(tag => tag.text === "广告" || tag.text === "推广")) return false;
                    // 过滤广告标识位
                    if (item.feedContent.isAd === true || item.feedContent.aid) return false;
                    // 过滤轮播图中的广告
                    if (item.feedContent.focusNewsData) {
                        item.feedContent.focusNewsData = item.feedContent.focusNewsData.filter(n => !n.isAd && !n.aid);
                    }
                }
                return true;
            });
        }
    }
    // 2. 轮播图/列表页 (旧版 API)
    else if (url.indexOf("/json/slide/index") !== -1 || url.indexOf("/json/listpage/news") !== -1) {
        if (Array.isArray(obj)) obj = obj.filter(item => !item.isad && !item.aid);
        if (obj.newslist) obj.newslist = obj.newslist.filter(item => !item.aid && !item.isad);
    }
    // 3. 开屏广告
    else if (url.indexOf("/json/startpage/get") !== -1) {
        if (obj.iap) obj.iap = [];
        if (obj.list) obj.list = [];
        if (obj.data) obj.data = {};
    }

    <LaTex>$done({ body: JSON.stringify(obj) });
} catch (e) {
    $</LaTex>done({});
}
