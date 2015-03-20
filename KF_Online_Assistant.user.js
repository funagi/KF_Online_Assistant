// ==UserScript==
// @name        KF Online助手
// @namespace   https://greasyfork.org/users/4514
// @author      喵拉布丁
// @homepage    https://greasyfork.org/scripts/8615
// @description KF Online必备！可在绯月Galgame上自动抽取神秘盒子、道具或卡片以及KFB捐款
// @include     http://2dgal.com/
// @include     http://2dgal.com/index.php*
// @include     http://*.2dgal.com/
// @include     http://*.2dgal.com/index.php*
// @version     2.1.0
// @grant       none
// @run-at      document-end
// ==/UserScript==
var Config = {
    autoDonationEnabled: true, //是否自动捐款，true：开启；false：关闭
    autoDrawSmboxEnabled: true, //是否自动抽取神秘盒子，true：开启；false：关闭
    autoDrawItemOrCardEnabled: true, //是否自动抽取道具或卡片，true：开启；false：关闭
    donationKfb: 1, //KFB捐款额度（最小1、最大5000，小数点将被舍去）
    favorSmboxNumbers: [],  //偏好的神秘盒子数字，例：[52,2,28,16]（按优先级排序），如设定的数字都不可用，则从剩余的盒子中随机抽选一个
    autoDrawItemOrCardType: 1, //1：抽取道具或卡片；2：只抽取道具
    showMsgDuration: 8,  //提示消息的显示时间（秒）
    autoRefreshEnabled: false,  //是否开启定时模式（需停留在首页），true：开启；false：关闭
    showRefreshModeTipsType: 'Auto',    //是否在首页的网页标题上显示定时模式的提示，Auto：停留一分钟后显示；Always：总是显示；Never：不显示
    //以下设置如非必要请勿修改：
    donationCookieName: 'pd_donation',   //标记已捐款的Cookie名称
    defDrawItemOrCardInterval: 480, //道具或卡片的默认抽奖间隔（分钟）
    completeRefreshInterval: 20, //抽取神秘盒子完成后页面的再刷新间隔（秒），用于在定时模式中进行判断，并非神秘盒子实际的抽奖间隔
    showRefreshModeTipsInterval: 1    //在网页标题上显示定时模式提示的更新间隔（分钟）
};

(function () {
    var uid = null;

    //设置Cookie
    var setCookie = function (name, value, date) {
        document.cookie = name + '=' + escape(value) + (!date ? '' : ';expires=' + date.toGMTString()) + ';path=/;';
    };

    //获取Cookie
    var getCookie = function (name) {
        var arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
        if (arr != null) return unescape(arr[2]);
        else return null;
    };

    //获取零时整点的Date对象
    var getMidnightHourDate = function (days) {
        var date = new Date();
        date.setDate(date.getDate() + days);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };

    //获取Uid
    var getUid = function () {
        var href = $('a[href^="profile.php?action=show&uid="]').attr('href');
        if (!href) return null;
        var uid = /&uid=(\d+)/.exec(href);
        return uid ? uid[1] : null;
    };

    //添加CSS样式
    var appendCss = function () {
        $('head').append(['<style>',
            '.pd_pop_tips {',
            'border: 1px solid #6ca7c0; text-shadow: 0 0 3px rgba(0,0,0,0.1); border-radius: 3px; padding: 12px 40px; font-size: 14px;',
            'text-align: center; position: fixed; display: none; color: #333; background: #f8fcfe; background-repeat: no-repeat;',
            'background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f9fcfe), color-stop(25%, #f6fbfe), to(#eff7fc));',
            'background-image: -webkit-linear-gradient(#f9fcfe, #f6fbfe 25%, #eff7fc);',
            'background-image: -moz-linear-gradient(top, #f9fcfe, #f6fbfe 25%, #eff7fc);',
            'background-image: -o-linear-gradient(#f9fcfe, #f6fbfe 25%, #eff7fc);',
            'background-image: linear-gradient(#f9fcfe, #f6fbfe 25%, #eff7fc);',
            '}',
            '.pd_pop_tips h1 { font-size: 14px; display: inline; margin-right: 5px; }',
            '.pd_pop_tips strong { font-weight: normal; padding-left: 10px; }',
            '.pd_pop_tips em { font-weight: 700; color:#ff6600; padding: 0 5px; }',
            '.pd_pop_tips a { font-weight: bold; margin-left: 15px; }',
            '.pd_pop_tips .pd_highlight { font-weight: bold; color: #ff0000; }',
            '</style>'].join(''));
    };

    //显示提示消息
    var showMsg = function (msg) {
        var length = $('.pd_pop_tips').length;
        var $popTip = $('<div class="pd_pop_tips">' + msg + '</div>').appendTo('body')
            .click(function () {
                $(this).stop(true, true).fadeOut('slow');
            });
        var popTipHeight = $popTip.outerHeight();
        var popTipWidth = $popTip.outerWidth();
        $popTip.css('top', $(window).height() / 2 - popTipHeight / 2 + (popTipHeight + 5) * length)
            .css('left', $(window).width() / 2 - popTipWidth / 2)
            .fadeIn('slow')
            .delay(Config.showMsgDuration * 1000)
            .fadeOut('slow');
    };

    //输出经过格式化后的控制台消息
    var showFormatLog = function (msgType, html) {
        var msg = '【{0}】回应：'.replace('{0}', msgType);
        var matches = /<span style=".+?">(.+?)<\/span><br \/><a href="(.+?)">/i.exec(html);
        if (matches) {
            msg += '{0}；跳转地址：{1}//{2}/{3}'
                .replace('{0}', matches[1])
                .replace('{1}', location.protocol)
                .replace('{2}', location.host)
                .replace('{3}', matches[2]);
        }
        else {
            msg += '未能获得预期的回应';
            //msg += '\n' + html;
        }
        console.log(msg);
    };

    //KFB捐款
    var donation = function () {
        console.log('KFB捐款Start');
        $.post('kf_growup.php?ok=1', {kfb: Config.donationKfb}, function (html) {
            setCookie(uid + '_' + Config.donationCookieName, 1, getMidnightHourDate(1));
            var matches = /捐款获得(\d+)经验值(?:.*?补偿期.*?\+(\d+)KFB.*?(\d+)成长经验)?/i.exec(html);
            if (!matches) {
                showFormatLog('KFB捐款', html);
                return;
            }
            var msg = '<h1>捐款<em>{0}</em>KFB</h1><strong>经验值<em>+{1}</em></strong>'
                .replace('{0}', Config.donationKfb)
                .replace('{1}', matches[1]);
            if (typeof matches[2] != 'undefined' && typeof matches[3] != 'undefined') {
                msg += '<strong style="margin-left:5px">(补偿期:</h1><strong>KFB<em>+{0}</em></strong><strong>经验值<em>+{1}</em>)</strong>'
                    .replace('{0}', matches[2])
                    .replace('{1}', matches[3]);
            }
            showFormatLog('KFB捐款', html);
            showMsg(msg);
        }, 'html');
    };

    //抽取神秘盒子
    var drawSmbox = function (isAutoDrawItemOrCard) {
        console.log('抽取神秘盒子Start');
        $.get('kf_smbox.php', function (html) {
            if (!/kf_smbox\.php\?box=\d+&safeid=\w+/i.test(html)) {
                showFormatLog('抽取神秘盒子', html);
                return;
            }
            var number = 0;
            var url = '';
            for (var i in Config.favorSmboxNumbers) {
                var regex = new RegExp('kf_smbox\\.php\\?box=' + Config.favorSmboxNumbers[i] + '&safeid=\\w+', 'i');
                var favorMatches = regex.exec(html);
                if (favorMatches) {
                    number = Config.favorSmboxNumbers[i];
                    url = favorMatches[0];
                    break;
                }
            }
            if (!url) {
                var matches = html.match(/kf_smbox\.php\?box=\d+&safeid=\w+/gi);
                if (!matches) return;
                url = matches[Math.floor(Math.random() * matches.length)];
                var numberMatches = /box=(\d+)/i.exec(url);
                number = numberMatches ? numberMatches[1] : 0;
            }
            $.get(url, function (html) {
                if (isAutoDrawItemOrCard) drawItemOrCard();
                var kfbRegex = /获得了(\d+)KFB的奖励/i;
                var smRegex = /获得本轮的头奖/i;
                var msg = '<h1>抽取神秘盒子[<em>No.{0}</em>]</h1>'.replace('{0}', number);
                if (kfbRegex.test(html)) {
                    var matches = kfbRegex.exec(html);
                    msg += '<strong>KFB<em>+{0}</em></strong>'.replace('{0}', matches[1]);
                }
                else if (smRegex.test(html)) {
                    msg += '<strong class="pd_highlight">神秘<em>+1</em></strong><a target="_blank" href="kf_smbox.php">查看头奖</a>';
                }
                else {
                    showFormatLog('抽取神秘盒子', html);
                    return;
                }
                showFormatLog('抽取神秘盒子', html);
                showMsg(msg);
            });
        }, 'html');
    };

    //抽取道具或卡片
    var drawItemOrCard = function () {
        console.log('抽取道具或卡片Start');
        var param = {one: 1};
        if (Config.autoDrawItemOrCardType == 2) param.submit2 = '未抽到道具不要给我卡片';
        else param.submit1 = '正常抽奖20%道具80%卡片';
        $.post('kf_fw_ig_one.php', param, function (html) {
            var itemRegex = /<a href="(kf_fw_ig_my\.php\?pro=\d+)">/i;
            var cardRegex = /<a href="(kf_fw_card_my\.php\?id=\d+)">/i;
            var msg = '<h1>抽取道具{0}</h1>'.replace('{0}', Config.autoDrawItemOrCardType == 2 ? '' : '或卡片');
            if (itemRegex.test(html)) {
                var matches = itemRegex.exec(html);
                msg += '<strong>道具<em>+1</em></strong><a target="_blank" href="{0}">查看道具</a>'
                    .replace('{0}', matches[1]);
            }
            else if (cardRegex.test(html)) {
                var matches = cardRegex.exec(html);
                msg += '<strong>卡片<em>+1</em></strong><a target="_blank" href="{0}">查看卡片</a>'
                    .replace('{0}', matches[1]);
            }
            else {
                msg += '<strong><i>没有收获</i></strong>';
            }
            showFormatLog('抽取道具或卡片', html);
            showMsg(msg);
        }, 'html');
    };

    //获取定时刷新的间隔时间（毫秒）
    var getRefreshInterval = function () {
        var drawSmboxInterval = -1,
            drawItemOrCardInterval = -1,
            donationInterval = -1;
        var matches = /神秘盒子\(剩余(\d+)分钟\)/.exec($('a[href="kf_smbox.php"]:contains("神秘盒子(剩余")').text());
        if (!matches) {
            if ($('a[href="kf_smbox.php"]:contains("神秘盒子(现在可以抽取)")').length > 0) {
                return Config.completeRefreshInterval * 1000;
            }
        }
        else {
            drawSmboxInterval = parseInt(matches[1]);
        }
        matches = /道具卡片\(剩余(\d+)分钟\)/.exec($('a[href="kf_fw_ig_one.php"]:contains("道具卡片(剩余")').text())
        if (!matches) drawItemOrCardInterval = Config.defDrawItemOrCardInterval;
        else drawItemOrCardInterval = parseInt(matches[1]);
        var nextDay = getMidnightHourDate(1);
        var now = new Date();
        donationInterval = parseInt((nextDay - now) / 1000 / 60);
        var min = drawSmboxInterval < 0 ? drawItemOrCardInterval : drawSmboxInterval;
        min = min < drawItemOrCardInterval ? min : drawItemOrCardInterval;
        min = min < donationInterval ? min : donationInterval;
        return (min * 60 + 5) * 1000;
    };

    //定时刷新
    var autoRefresh = function () {
        var interval = getRefreshInterval();
        window.setTimeout(function () {
            location.href = location.href;
        }, interval);
        interval = parseInt(interval / 1000);
        interval = interval == Config.completeRefreshInterval ? interval : parseInt(interval / 60);
        var unit = interval == Config.completeRefreshInterval ? '秒' : '分钟';
        console.log('定时模式启动，下一次刷新间隔为：{0}{1}'
                .replace('{0}', interval)
                .replace('{1}', unit)
        );
        if (Config.showRefreshModeTipsType.toLowerCase() != 'never') {
            var title = document.title;
            var showRefreshModeTips = function () {
                document.title = '{0} (定时模式：{1}{2})'
                    .replace('{0}', title)
                    .replace('{1}', interval)
                    .replace('{2}', unit);
                interval -= 1;
            };
            if (Config.showRefreshModeTipsType.toLowerCase() == 'always' || interval == Config.completeRefreshInterval)
                showRefreshModeTips();
            else interval -= 1;
            window.setInterval(showRefreshModeTips, Config.showRefreshModeTipsInterval * 60 * 1000);
        }
    };

    //初始化
    var init = function () {
        uid = getUid();
        if (!uid) return;
        appendCss();
        if (Config.autoDonationEnabled && !getCookie(uid + '_' + Config.donationCookieName)) {
            donation();
        }
        var isDrawSmboxStarted = false;
        var autoDrawItemOrCardAvailable = Config.autoDrawItemOrCardEnabled &&
            $('a[href="kf_fw_ig_one.php"]:contains("道具卡片(现在可以抽取)")').length > 0;
        if (Config.autoDrawSmboxEnabled) {
            if ($('a[href="kf_smbox.php"]:contains("神秘盒子(现在可以抽取)")').length > 0) {
                isDrawSmboxStarted = true;
                drawSmbox(autoDrawItemOrCardAvailable);
            }
        }
        if (autoDrawItemOrCardAvailable && !isDrawSmboxStarted) {
            drawItemOrCard();
        }
        if (Config.autoRefreshEnabled) {
            if (location.pathname == '/' || location.pathname == '/index.php')
                autoRefresh();
        }
    };

    init();
})();