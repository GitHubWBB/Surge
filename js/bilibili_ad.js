/**
 * Bilibili 去广告脚本
 * 适配 Surge / Loon / Quantumult X
 */

let body = $response.body;
if (!body) $done({});

try {
    let obj = JSON.parse(body);
    const url = $request.url;

    // 1. 首页推荐流去广告
    if (url.indexOf("/x/feed/index") !== -1 || url.indexOf("/x/v2/feed/index") !== -1) {
        if (obj.data && obj.data.items) {
            obj.data.items = obj.data.items.filter(item => {
                // 过滤广告卡片
                if (item.card_goto === "ad" || item.card_type === "ad") return false;
                if (item.ad_info) return false;
                if (item.business_card && item.business_card.is_ad) return false;
                return true;
            });
        }
    }

    // 2. 视频详情页相关推荐去广告
    else if (url.indexOf("/x/player/related") !== -1 || url.indexOf("/x/player/wbi/related") !== -1) {
        if (obj.data && obj.data.length) {
            obj.data = obj.data.filter(item => !item.is_ad);
        }
    }

    // 3. 搜索结果去广告
    else if (url.indexOf("/x/web-interface/search/type") !== -1 || url.indexOf("/x/web-interface/search/all") !== -1) {
        if (obj.data && obj.data.result) {
            obj.data.result = obj.data.result.filter(item => !item.is_ad);
        }
    }

    // 4. 动态/动态推荐去广告
    else if (url.indexOf("/x/polymer/web-dynamic/v1/feed/all") !== -1 || url.indexOf("/x/polymer/web-dynamic/v1/feed/space") !== -1) {
        if (obj.data && obj.data.items) {
            obj.data.items = obj.data.items.filter(item => !item.ad);
        }
    }

    // 5. 番剧相关
    else if (url.indexOf("/pgc/player/web/playurl") !== -1 || url.indexOf("/x/player/playurl") !== -1) {
        if (obj.data && obj.data.dash && obj.data.dash.duration) {
            // 移除视频广告相关信息
        }
    }

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}
