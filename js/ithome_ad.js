/**
 * IT之家 去广告脚本 for Surge
 */

let body = <LaTex>$response.body;
if (!body) {
    $</LaTex>done({});
} else {
    let obj = JSON.parse(body);
    const url = $request.url;

    // 1. 列表页广告 (旧版 API)
    if (url.includes("/json/listpage/news") || url.includes("/json/newslist/news")) {
        if (obj.newslist) {
            obj.newslist = obj.newslist.filter(item => !item.aid);
        }
    } 
    // 2. 轮播图广告
    else if (url.includes("/json/slide/index")) {
        if (Array.isArray(obj)) {
            obj = obj.filter(item => !item.isad);
        }
    } 
    // 3. 移动端网页/详情页推荐广告
    else if (url.includes("/api/news/newslistpageget")) {
        if (obj.Result) {
            obj.Result = obj.Result.filter(item => {
                if (item.NewsTips) {
                    return !item.NewsTips.some(tip => tip.TipName === "广告");
                }
                return true;
            });
        }
    } 
    // 4. 新版 Feed 流 (napi)
    else if (url.includes("/api/news/getfeeds") || url.includes("/api/topmenu/index")) {
        if (obj.data && obj.data.list) {
            obj.data.list = obj.data.list.filter(item => {
                // 过滤带有“广告”标签的项目
                if (item.feedContent && item.feedContent.smallTags) {
                    if (item.feedContent.smallTags.some(tag => tag.text === "广告")) {
                        return false;
                    }
                }
                // 过滤焦点新闻中的广告
                if (item.feedContent && item.feedContent.focusNewsData) {
                    item.feedContent.focusNewsData = item.feedContent.focusNewsData.filter(n => !n.isAd);
                }
                return true;
            });
        }
    }
    // 5. 开屏广告
    else if (url.includes("/json/startpage/get")) {
        if (obj.iap) obj.iap = [];
        if (obj.list) obj.list = [];
    }

    $done({ body: JSON.stringify(obj) });
}
