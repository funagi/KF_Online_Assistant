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
// @version     2.2.0-dev
// @grant       none
// @run-at      document-end
// @license     MIT
// ==/UserScript==
/**
 * 配置类
 */
var Config = {
    // 是否自动捐款，true：开启；false：关闭
    autoDonationEnabled: true,
    // 是否自动抽取神秘盒子，true：开启；false：关闭
    autoDrawSmboxEnabled: true,
    // 是否自动抽取道具或卡片，true：开启；false：关闭
    autoDrawItemOrCardEnabled: true,
    // KFB捐款额度（最小1、最大5000，小数点将被舍去）
    donationKfb: 1,
    // 偏好的神秘盒子数字，例：[52,2,28,16]（按优先级排序），如设定的数字都不可用，则从剩余的盒子中随机抽选一个
    favorSmboxNumbers: [],
    // 1：抽取道具或卡片；2：只抽取道具
    autoDrawItemOrCardType: 1,
    // 提示消息的显示时间（秒）
    defShowMsgDuration: 8,
    // 是否开启定时模式（需停留在首页），true：开启；false：关闭
    autoRefreshEnabled: true,
    // 是否在首页的网页标题上显示定时模式的提示，Auto：停留一分钟后显示；Always：总是显示；Never：不显示
    showRefreshModeTipsType: 'Auto',

    /* 以下设置如非必要请勿修改： */
    // 标记已捐款的Cookie名称
    donationCookieName: 'pd_donation',
    // 道具或卡片的默认抽奖间隔（分钟）
    defDrawItemOrCardInterval: 480,
    // 抽取神秘盒子完成后页面的再刷新间隔（秒），用于在定时模式中进行判断
    completeRefreshInterval: 20,
    // 在网页标题上显示定时模式提示的更新间隔（分钟）
    showRefreshModeTipsInterval: 1
};

/**
 * 工具类
 */
var Tools = {
    /**
     * 设置Cookie
     * @param {string} name Cookie名称
     * @param {*} value Cookie值
     * @param {?Date} [date] Cookie有效期，为空则表示有效期为浏览器进程关闭
     */
    setCookie: function (name, value, date) {
        document.cookie = name + '=' + escape(value) + (!date ? '' : ';expires=' + date.toGMTString()) + ';path=/;';
    },

    /**
     * 获取Cookie
     * @param {string} name Cookie名称
     * @returns {?string} Cookie值
     */
    getCookie: function (name) {
        var arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
        if (arr !== null) return unescape(arr[2]);
        else return null;
    },

    /**
     * 获取距今N天的零时整点的Date对象
     * @param {number} days 距今的天数
     * @returns {Date} 距今N天的零时整点的Date对象
     */
    getMidnightHourDate: function (days) {
        var date = new Date();
        date.setDate(date.getDate() + days);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    },

    /**
     * 获取Cookie名称前缀
     * @returns {string} Cookie名称前缀
     */
    getCookiePrefix: function () {
        return !KFOL.uid ? '' : KFOL.uid + '_';
    },

    /**
     * 获取当前域名的URL
     * @returns {string} 当前域名的URL
     */
    getHostNameUrl: function () {
        return '{0}//{1}/'.replace('{0}', location.protocol).replace('{1}', location.host);
    }
};

/**
 * KF Online主类
 */
var KFOL = {
    // 用户ID
    uid: 0,
    // 是否位于首页
    isInHomePage: false,

    /**
     * 获取Uid
     * @returns {number} Uid
     */
    getUid: function () {
        var href = $('a[href^="profile.php?action=show&uid="]').attr('href');
        if (!href) return null;
        var matches = /&uid=(\d+)/.exec(href);
        return matches ? matches[1] : 0;
    },

    /**
     * 添加CSS样式
     */
    appendCss: function () {
        $('head').append(['<style>',
            '.pd_pop_box { position: fixed; width: 100%; }',
            '.pd_pop_tips {',
            'border: 1px solid #6ca7c0; text-shadow: 0 0 3px rgba(0,0,0,0.1); border-radius: 3px; padding: 12px 40px; text-align: center;',
            'font-size: 14px; position: absolute; display: none; color: #333; background: #f8fcfe; background-repeat: no-repeat;',
            'background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f9fcfe), color-stop(25%, #f6fbfe), to(#eff7fc));',
            'background-image: -webkit-linear-gradient(#f9fcfe, #f6fbfe 25%, #eff7fc);',
            'background-image: -moz-linear-gradient(top, #f9fcfe, #f6fbfe 25%, #eff7fc);',
            'background-image: -o-linear-gradient(#f9fcfe, #f6fbfe 25%, #eff7fc);',
            'background-image: linear-gradient(#f9fcfe, #f6fbfe 25%, #eff7fc);',
            '}',
            '.pd_pop_tips strong { margin-right: 5px; }',
            '.pd_pop_tips i { font-style: normal; padding-left: 10px; }',
            '.pd_pop_tips em { font-weight: 700; color:#ff6600; padding: 0 5px; }',
            '.pd_pop_tips a { font-weight: bold; margin-left: 15px; }',
            '.pd_pop_tips .pd_highlight { font-weight: bold; color: #ff0000; }',
            '</style>'].join(''));
    },

    /**
     * 显示提示消息
     * @param {(string|Object)} options 提示消息或设置对象
     * @param {string} [options.msg] 提示消息
     * @param {number} [options.duration={@link Config.defShowMsgDuration}] 提示消息持续时间（秒），-1为永久显示
     * @param {boolean} [options.clickable=true] 消息框可否手动点击消除
     * @param {number} [duration] 提示消息持续时间（秒），-1为永久显示
     */
    showMsg: function (options, duration) {
        var settings = {
            msg: '',
            duration: Config.defShowMsgDuration,
            clickable: true
        };
        if (typeof options === 'object') {
            $.extend(settings, options);
        }
        else {
            settings.msg = options;
            settings.duration = typeof duration === 'undefined' ? Config.defShowMsgDuration : duration;
        }
        var $popBox = $('.pd_pop_box');
        var isFirst = $popBox.length == 0;
        if (isFirst) {
            $popBox = $('<div class="pd_pop_box"></div>').appendTo('body');
        }
        var length = $popBox.data('length');
        length = length ? length : 0;
        var $popTips = $('<div class="pd_pop_tips">' + settings.msg + '</div>').appendTo($popBox);
        if (settings.clickable) {
            $popTips.click(function () {
                $(this).stop(true, true).fadeOut('slow', function () {
                    KFOL.removePopTips(this);
                });
            });
        }
        $popBox.data('length', length + 1);
        var popTipsHeight = $popTips.outerHeight();
        var popTipsWidth = $popTips.outerWidth();
        if (isFirst) {
            $popBox.css('top', $(window).height() / 2 - popTipsHeight / 2);
        }
        else {
            $popBox.animate({'top': '-=' + popTipsHeight / 1.5});
        }
        $popTips.css('top', (popTipsHeight + 5) * length)
            .css('left', $(window).width() / 2 - popTipsWidth / 2)
            .fadeIn('slow');
        if (settings.duration !== -1) {
            $popTips.delay(settings.duration * 1000).fadeOut('slow', function () {
                KFOL.removePopTips(this);
            });
        }
    },

    /**
     * 移除指定的提示消息框
     * @param {Object} popTips 指定的消息框节点
     */
    removePopTips: function (popTips) {
        var $parent = $(popTips).parent();
        $(popTips).remove();
        if ($('.pd_pop_tips').length == 0) $parent.remove();
    },

    /**
     * 输出经过格式化后的控制台消息
     * @param {string} msgType 消息类别
     * @param {string} html 回应的HTML源码
     */
    showFormatLog: function (msgType, html) {
        var msg = '【{0}】回应：'.replace('{0}', msgType);
        var matches = /<span style=".+?">(.+?)<\/span><br \/><a href="(.+?)">/i.exec(html);
        if (matches) {
            msg += '{0}；跳转地址：{1}{2}'
                .replace('{0}', matches[1])
                .replace('{1}', Tools.getHostNameUrl())
                .replace('{2}', matches[2]);
        }
        else {
            msg += '未能获得预期的回应';
            //msg += '\n' + html;
        }
        console.log(msg);
    },

    /**
     * KFB捐款
     */
    donation: function () {
        console.log('KFB捐款Start');
        $.post('kf_growup.php?ok=1', {kfb: Config.donationKfb}, function (html) {
            Tools.setCookie(Tools.getCookiePrefix() + Config.donationCookieName, 1, Tools.getMidnightHourDate(1));
            var matches = /捐款获得(\d+)经验值(?:.*?补偿期.*?\+(\d+)KFB.*?(\d+)成长经验)?/i.exec(html);
            if (!matches) {
                KFOL.showFormatLog('KFB捐款', html);
                return;
            }
            var msg = '<strong>捐款<em>{0}</em>KFB</strong><i>经验值<em>+{1}</em></i>'
                .replace('{0}', Config.donationKfb)
                .replace('{1}', matches[1]);
            if (typeof matches[2] !== 'undefined' && typeof matches[3] !== 'undefined') {
                msg += '<i style="margin-left:5px">(补偿期:</i><i>KFB<em>+{0}</em></i><i>经验值<em>+{1}</em>)</i>'
                    .replace('{0}', matches[2])
                    .replace('{1}', matches[3]);
            }
            KFOL.showFormatLog('KFB捐款', html);
            KFOL.showMsg(msg);
        }, 'html');
    },

    /**
     * 抽取神秘盒子
     * @param {boolean} isAutoDrawItemOrCard 是否在抽取神秘盒子完毕之后自动抽取道具或卡片
     */
    drawSmbox: function (isAutoDrawItemOrCard) {
        console.log('抽取神秘盒子Start');
        $.get('kf_smbox.php', function (html) {
            if (!/kf_smbox\.php\?box=\d+&safeid=\w+/i.test(html)) {
                KFOL.showFormatLog('抽取神秘盒子', html);
                return;
            }
            var smboxNumber = 0;
            var url = '';
            for (var i in Config.favorSmboxNumbers) {
                var regex = new RegExp('kf_smbox\\.php\\?box=' + Config.favorSmboxNumbers[i] + '&safeid=\\w+', 'i');
                var favorMatches = regex.exec(html);
                if (favorMatches) {
                    smboxNumber = Config.favorSmboxNumbers[i];
                    url = favorMatches[0];
                    break;
                }
            }
            if (!url) {
                var matches = html.match(/kf_smbox\.php\?box=\d+&safeid=\w+/gi);
                if (!matches) return;
                url = matches[Math.floor(Math.random() * matches.length)];
                var numberMatches = /box=(\d+)/i.exec(url);
                smboxNumber = numberMatches ? numberMatches[1] : 0;
            }
            $.get(url, function (html) {
                if (isAutoDrawItemOrCard) KFOL.drawItemOrCard();
                var kfbRegex = /获得了(\d+)KFB的奖励/i;
                var smRegex = /获得本轮的头奖/i;
                var msg = '<strong>抽取神秘盒子[<em>No.{0}</em>]</strong>'.replace('{0}', smboxNumber);
                if (kfbRegex.test(html)) {
                    var matches = kfbRegex.exec(html);
                    msg += '<i>KFB<em>+{0}</em></i>'.replace('{0}', matches[1]);
                }
                else if (smRegex.test(html)) {
                    msg += '<i class="pd_highlight">神秘<em>+1</em></i><a target="_blank" href="kf_smbox.php">查看头奖</a>';
                }
                else {
                    KFOL.showFormatLog('抽取神秘盒子', html);
                    return;
                }
                KFOL.showFormatLog('抽取神秘盒子', html);
                KFOL.showMsg(msg);
            });
        }, 'html');
    },

    /**
     * 抽取道具或卡片
     */
    drawItemOrCard: function () {
        console.log('抽取道具或卡片Start');
        var param = {one: 1};
        if (Config.autoDrawItemOrCardType === 2) param.submit2 = '未抽到道具不要给我卡片';
        else param.submit1 = '正常抽奖20%道具80%卡片';
        $.post('kf_fw_ig_one.php', param, function (html) {
            var itemRegex = /<a href="(kf_fw_ig_my\.php\?pro=\d+)">/i;
            var cardRegex = /<a href="(kf_fw_card_my\.php\?id=\d+)">/i;
            var msg = '<strong>抽取道具{0}</strong>'.replace('{0}', Config.autoDrawItemOrCardType === 2 ? '' : '或卡片');
            var matches = null;
            if (itemRegex.test(html)) {
                matches = itemRegex.exec(html);
                msg += '<i>道具<em>+1</em></i><a target="_blank" href="{0}">查看道具</a>'
                    .replace('{0}', matches[1]);
            }
            else if (cardRegex.test(html)) {
                matches = cardRegex.exec(html);
                msg += '<i>卡片<em>+1</em></i><a target="_blank" href="{0}">查看卡片</a>'
                    .replace('{0}', matches[1]);
            }
            else {
                msg += '<i style="font-style: italic">没有收获</i>';
            }
            KFOL.showFormatLog('抽取道具或卡片', html);
            KFOL.showMsg(msg);
        }, 'html');
    },

    /**
     * 获取定时刷新的间隔时间（秒）
     * @returns {number} 定时刷新的间隔时间（秒）
     */
    getRefreshInterval: function () {
        var drawSmboxInterval = -1,
            drawItemOrCardInterval = -1,
            donationInterval = -1;
        var matches = /神秘盒子\(剩余(\d+)分钟\)/.exec($('a[href="kf_smbox.php"]:contains("神秘盒子(剩余")').text());
        if (!matches) {
            if ($('a[href="kf_smbox.php"]:contains("神秘盒子(现在可以抽取)")').length > 0) {
                return Config.completeRefreshInterval;
            }
        }
        else {
            drawSmboxInterval = parseInt(matches[1]);
        }
        matches = /道具卡片\(剩余(\d+)分钟\)/.exec($('a[href="kf_fw_ig_one.php"]:contains("道具卡片(剩余")').text());
        if (!matches) drawItemOrCardInterval = Config.defDrawItemOrCardInterval;
        else drawItemOrCardInterval = parseInt(matches[1]);
        var nextDay = Tools.getMidnightHourDate(1);
        var now = new Date();
        donationInterval = parseInt((nextDay - now) / 1000 / 60);
        var min = drawSmboxInterval < 0 ? drawItemOrCardInterval : drawSmboxInterval;
        min = min < drawItemOrCardInterval ? min : drawItemOrCardInterval;
        min = min < donationInterval ? min : donationInterval;
        return (min + 1) * 60;
    },

    /**
     * 定时刷新
     */
    autoRefresh: function () {
        var interval = KFOL.getRefreshInterval();
        window.setTimeout(function () {
            location.href = location.href;
        }, interval * 1000);
        var intervalText = interval === Config.completeRefreshInterval ? interval : parseInt(interval / 60);
        var unit = interval === Config.completeRefreshInterval ? '秒' : '分钟';
        console.log('定时模式启动，下一次刷新间隔为：{0}{1}'
                .replace('{0}', intervalText)
                .replace('{1}', unit)
        );
        if (Config.showRefreshModeTipsType.toLowerCase() !== 'never') {
            var title = document.title;
            var showRefreshModeTips = function () {
                document.title = '{0} (定时模式：{1}{2})'
                    .replace('{0}', title)
                    .replace('{1}', intervalText)
                    .replace('{2}', unit);
                intervalText -= 1;
            };
            if (Config.showRefreshModeTipsType.toLowerCase() === 'always' || interval === Config.completeRefreshInterval)
                showRefreshModeTips();
            else intervalText -= 1;
            window.setInterval(showRefreshModeTips, Config.showRefreshModeTipsInterval * 60 * 1000);
        }
    },

    /**
     * 初始化
     */
    init: function () {
        if (typeof jQuery === 'undefined') return;
        if (location.pathname === '/' || location.pathname === '/index.php')
            KFOL.isInHomePage = true;
        KFOL.uid = KFOL.getUid();
        if (!KFOL.uid) return;
        KFOL.appendCss();

        if (Config.autoDonationEnabled && !Tools.getCookie(Tools.getCookiePrefix() + Config.donationCookieName)) {
            KFOL.donation();
        }
        var isDrawSmboxStarted = false;
        var autoDrawItemOrCardAvailable = Config.autoDrawItemOrCardEnabled &&
            $('a[href="kf_fw_ig_one.php"]:contains("道具卡片(现在可以抽取)")').length > 0;
        if (Config.autoDrawSmboxEnabled) {
            if ($('a[href="kf_smbox.php"]:contains("神秘盒子(现在可以抽取)")').length > 0) {
                isDrawSmboxStarted = true;
                KFOL.drawSmbox(autoDrawItemOrCardAvailable);
            }
        }
        if (autoDrawItemOrCardAvailable && !isDrawSmboxStarted) {
            KFOL.drawItemOrCard();
        }
        if (Config.autoRefreshEnabled) {
            if (KFOL.isInHomePage) KFOL.autoRefresh();
        }
    }
};

KFOL.init();