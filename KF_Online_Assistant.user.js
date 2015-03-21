// ==UserScript==
// @name        KF Online助手
// @namespace   https://greasyfork.org/users/4514
// @author      喵拉布丁
// @homepage    https://greasyfork.org/scripts/8615
// @description KF Online必备！可在绯月Galgame上自动抽取神秘盒子、道具或卡片以及KFB捐款
// @include     http://2dgal.com/*
// @include     http://*.2dgal.com/*
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
    // 抽取道具或卡片的类型，1：抽取道具或卡片；2：只抽取道具
    autoDrawItemOrCardType: 1,
    // 提示消息的显示时间（秒）
    defShowMsgDuration: 10,
    // 是否开启定时模式（需停留在首页），true：开启；false：关闭
    autoRefreshEnabled: false,
    // 是否在首页的网页标题上显示定时模式的提示，Auto：停留一分钟后显示；Always：总是显示；Never：不显示
    showRefreshModeTipsType: 'Auto',

    /* 以下设置如非必要请勿修改： */
    // 神秘盒子的默认抽奖间隔（分钟）
    defDrawSmboxInterval: 300,
    // 道具或卡片的默认抽奖间隔（分钟）
    defDrawItemOrCardInterval: 480,
    // 抽取神秘盒子完成后页面的再刷新间隔（秒），用于在定时模式中进行判断
    completeRefreshInterval: 20,
    // 在网页标题上显示定时模式提示的更新间隔（分钟）
    showRefreshModeTipsInterval: 1,
    // 标记已捐款的Cookie名称
    donationCookieName: 'pd_donation',
    // 标记已抽取神秘盒子的Cookie名称
    drawSmboxCookieName: 'pd_draw_smbox',
    // 标记已抽取道具或卡片的Cookie名称
    drawItemOrCardCookieName: 'pd_draw_item_or_card'
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
     * 获取Cookie名称前缀
     * @returns {string} Cookie名称前缀
     */
    getCookiePrefix: function () {
        return !KFOL.uid ? '' : KFOL.uid + '_';
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
     * 获取指定时间量之后的Date对象
     * @param {number} seconds 时间量（秒）
     * @returns {Date} 指定时间量之后的Date对象
     */
    getAfterDate: function (seconds) {
        var date = new Date();
        date.setSeconds(seconds);
        return date;
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
            '.pd_pop_tips .pd_notice { font-style: italic; color: #666; }',
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
            $popTips.css('cursor', 'pointer').click(function () {
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
     * 显示等待消息
     * @param {string} msg 等待消息
     */
    showWaitMsg: function (msg) {
        KFOL.showMsg({msg: msg, duration: -1, clickable: false});
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
            var msg = '<strong>捐款<em>{0}</em>KFB</strong>'.replace('{0}', Config.donationKfb);
            var matches = /捐款获得(\d+)经验值(?:.*?补偿期.*?\+(\d+)KFB.*?(\d+)成长经验)?/i.exec(html);
            if (!matches) {
                if (/KFB不足。<br \/>/.test(html)) {
                    msg += '<i class="pd_notice">KFB不足</i>';
                }
                else {
                    KFOL.showFormatLog('KFB捐款', html);
                    return;
                }
            }
            else {
                msg += '<i>经验值<em>+{0}</em></i>'.replace('{0}', matches[1]);
                if (typeof matches[2] !== 'undefined' && typeof matches[3] !== 'undefined') {
                    msg += '<i style="margin-left:5px">(补偿期:</i><i>KFB<em>+{0}</em></i><i>经验值<em>+{1}</em>)</i>'
                        .replace('{0}', matches[2])
                        .replace('{1}', matches[3]);
                }
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
                Tools.setCookie(Tools.getCookiePrefix() + Config.drawSmboxCookieName, 1,
                    Tools.getAfterDate(Config.defDrawSmboxInterval * 60)
                );
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
            }, 'html');
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
            Tools.setCookie(Tools.getCookiePrefix() + Config.drawItemOrCardCookieName, 1,
                Tools.getAfterDate(Config.defDrawItemOrCardInterval * 60)
            );
            KFOL.showFormatLog('抽取道具或卡片', html);
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
            else if (/运气不太好，这次没中/i.test(html)) {
                msg += '<i class="pd_notice">没有收获</i>';
            }
            else {
                return;
            }
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
        var titleInterval = interval === Config.completeRefreshInterval ? interval : parseInt(interval / 60);
        var unit = interval === Config.completeRefreshInterval ? '秒' : '分钟';
        console.log('定时模式启动，下一次刷新间隔为：{0}{1}'
                .replace('{0}', titleInterval)
                .replace('{1}', unit)
        );
        if (Config.showRefreshModeTipsType.toLowerCase() !== 'never') {
            var title = document.title;
            var showRefreshModeTips = function () {
                document.title = '{0} (定时模式：{1}{2})'
                    .replace('{0}', title)
                    .replace('{1}', titleInterval)
                    .replace('{2}', unit);
                titleInterval -= 1;
            };
            if (Config.showRefreshModeTipsType.toLowerCase() === 'always' || interval === Config.completeRefreshInterval)
                showRefreshModeTips();
            else titleInterval -= 1;
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
            (KFOL.isInHomePage ? $('a[href="kf_fw_ig_one.php"]:contains("道具卡片(现在可以抽取)")').length > 0 :
                !Tools.getCookie(Tools.getCookiePrefix() + Config.drawItemOrCardCookieName)
            );
        if (Config.autoDrawSmboxEnabled) {
            if (KFOL.isInHomePage ? $('a[href="kf_smbox.php"]:contains("神秘盒子(现在可以抽取)")').length > 0 :
                    !Tools.getCookie(Tools.getCookiePrefix() + Config.drawSmboxCookieName)
            ) {
                isDrawSmboxStarted = true;
                KFOL.drawSmbox(autoDrawItemOrCardAvailable);
            }
        }

        if (autoDrawItemOrCardAvailable && !isDrawSmboxStarted) {
            KFOL.drawItemOrCard();
        }

        if (/\/kf_fw_ig_renew\.php$/i.test(location.href)) {
            ItemToEnergy.convertAllItemsToEnergy();
        }

        if (Config.autoRefreshEnabled) {
            if (KFOL.isInHomePage) KFOL.autoRefresh();
        }
    }
};

/**
 * 道具转换能量类
 */
var ItemToEnergy = {
    /**
     * 转换指定的道具为能量
     * @param {Object} options 设置项
     * @param {number} options.type 转换类型，1：转换本级全部已使用的道具为能量；2：转换本级部分已使用的道具为能量
     * @param {string[]} options.urlList 指定的道具Url列表
     * @param {string} options.safeId 用户的SafeID
     * @param {number} options.level 道具等级
     * @param {Object} [options.$itemLine] 当前转换道具所在的表格行
     */
    convertItemsToEnergy: function (options) {
        var settings = {
            type: 1,
            urlList: [],
            safeId: '',
            level: 1,
            $itemLine: null
        };
        $.extend(settings, options);
        var successNum = 0;
        var energyNum = ItemToEnergy.getEnergyNumByLevel(settings.level);
        $.each(settings.urlList, function (index, key) {
            var id = /pro=(\d+)/i.exec(key);
            id = id ? id[1] : 0;
            if (!id) return;
            var url = 'kf_fw_ig_doit.php?tomp={0}&id={1}'
                .replace('{0}', settings.safeId)
                .replace('{1}', id);
            $(document).queue('ConvertItemToEnergy', function () {
                $.get(url, function (html) {
                    KFOL.showFormatLog('转换道具能量', html);
                    if (/转换为了\s*\d+\s*点能量/i.test(html) || /提交速度过快/i.test(html)) {
                        successNum++;
                    }
                    $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    if (index === settings.urlList.length - 1) {
                        $('.pd_pop_box').remove();
                        var successEnergyNum = successNum * energyNum;
                        console.log('共有{0}个道具成功转换为能量，能量+{1}'
                                .replace('{0}', successNum)
                                .replace('{1}', successEnergyNum)
                        );
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>个道具成功转换为能量</strong><i>能量+<em>{1}</em></i>'
                                .replace('{0}', successNum)
                                .replace('{1}', successEnergyNum),
                            duration: -1
                        });
                        if (settings.type === 1) {
                            ItemToEnergy.setAllClickDisable(false);
                            var $itemUsed = settings.$itemLine.children().eq(2);
                            $itemUsed.text(parseInt($itemUsed.text()) - successNum);
                            var $totalEnergyNum = $('.kf_fw_ig1 td:contains("道具恢复能量")').find('span');
                            if ($totalEnergyNum.length === 1) {
                                $totalEnergyNum.text(parseInt($totalEnergyNum.text()) + successEnergyNum);
                            }
                        }
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('ConvertItemToEnergy');
                    }, 500);
                }, 'html');
            });
        });
        $(document).dequeue('ConvertItemToEnergy');
    },

    /**
     * 获得指定道具等级可得到的能量点
     * @param {number} level 道具等级
     * @returns {number} 能量点
     */
    getEnergyNumByLevel: function (level) {
        switch (level) {
            case 1:
                return 2;
            case 2:
                return 10;
            case 3:
                return 50;
            case 4:
                return 300;
            case 5:
                return 2000;
        }
    },

    /**
     * 禁止所有转换道具能量链接的点击
     * @param {boolean} disable 是否禁止
     */
    setAllClickDisable: function (disable) {
        $links = $('.kf_fw_ig1 a:contains("全部转换本级已使用道具为能量")');
        if (disable) $links.data('disable', true);
        else $links.removeData('disable');
    },

    /**
     * 转换本级全部已使用的道具为能量
     */
    convertAllItemsToEnergy: function () {
        $('.kf_fw_ig1 td:nth-child(4):contains("全部转换本级已使用道具为能量")').each(function (i) {
            $(this).html('<a href="#">全部转换本级已使用道具为能量</a>').find('a').click(function (event) {
                event.preventDefault();
                if ($(this).data('disable')) return;
                var safeId = /safeid=(\w+)/i.exec($('a[href^="kf_fw_card_pk.php?safeid="]').attr('href'));
                safeId = safeId ? safeId[1] : 0;
                if (!safeId) return;
                var $itemLine = $(this).parent().parent(),
                    itemLevel = parseInt($itemLine.children().eq(0).text()),
                    itemName = $itemLine.children().eq(1).text(),
                    itemUsedNum = parseInt($itemLine.children().eq(2).text()),
                    listUrl = $itemLine.children().eq(4).find('a').attr('href');
                if (!itemUsedNum) {
                    alert('本级没有已使用的道具');
                    ItemToEnergy.setAllClickDisable(false);
                    return;
                }
                if (window.confirm('你要转换的是Lv.{0}：{1}，是否转换本级全部已使用的道具为能量？'
                            .replace('{0}', itemLevel)
                            .replace('{1}', itemName)
                    )
                ) {
                    ItemToEnergy.setAllClickDisable(true);
                    $('.pd_pop_box').remove();
                    if (!listUrl || !/kf_fw_ig_renew\.php\?lv=\d+/.test(listUrl)) return;
                    KFOL.showWaitMsg('正在获取本级已使用道具列表，请稍后...');
                    $.get(listUrl, function (html) {
                        $('.pd_pop_box').remove();
                        var matches = html.match(/kf_fw_ig_my\.php\?pro=\d+/gi);
                        if (!matches) {
                            alert('本级没有已使用的道具');
                            ItemToEnergy.setAllClickDisable(false);
                            return;
                        }
                        console.log('转换本级全部已使用的道具为能量Start，转换道具数量：' + matches.length);
                        KFOL.showWaitMsg('<strong>正在转换能量中...</strong><i>剩余数量:<em id="pd_remaining_num">{0}</em></i>'
                            .replace('{0}', matches.length));
                        ItemToEnergy.convertItemsToEnergy({
                            type: 1,
                            urlList: matches,
                            safeId: safeId,
                            level: itemLevel,
                            $itemLine: $itemLine
                        });
                    }, 'html');
                }
            });
        });
    }
};

KFOL.init();