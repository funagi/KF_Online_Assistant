// ==UserScript==
// @name        KF Online助手
// @namespace   https://greasyfork.org/users/4514
// @author      喵拉布丁
// @description KF Online必备！可在绯月Galgame上自动抽取神秘盒子、道具或卡片以及KFB捐款
// @include     http://*2dgal.com/
// @include     http://*2dgal.com/index.php
// @include     http://*2dgal.com/kf_smbox.php
// @include     http://*2dgal.com/kf_growup.php
// @include     http://*2dgal.com/kf_fw_ig_one.php
// @version     1.0.0
// @grant       none
// @run-at      document-end
// ==/UserScript==
var autoKfbEnabled = true;  //是否自动捐款
var autoSmboxEnabled = true;    //是否自动抽取神秘盒子
var autoItemOrCardEnabled = true;   //是否自动抽取道具或卡片
var autoItemOrCardType = 1; //1、抽取道具或卡片 2、只抽取道具
var kfb = 1;    //kfb捐款额度
var smboxCookieName = 'pd_smbox';   //标记已抽取神秘盒子的Cookie名称
var kfbCookieName = 'pd_kfb';   //标记已捐款的Cookie名称

function setCookie(name, value, date) {
    document.cookie = name + '=' + escape(value) + (!date ? '' : ';expires=' + date.toGMTString()) + ';path=/;';
}

function getCookie(name) {
    var arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
    if (arr != null)
        return unescape(arr[2]);
    return null;
}

function getCookiePrefix() {
    var href = $('a[href^="profile.php?action=show&uid="]').attr('href');
    if (!href)
        return '';
    var uid = /&uid=(\d+)/.exec(href);
    return uid ? uid[1] + '_' : '';
}

function getMidnightHourDate(days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

function goLink($node) {
    if ($node.length > 0)
        $node.get(0).click();
}

(function () {
    if (location.pathname == '/' || location.pathname == '/index.php') {
        if (autoSmboxEnabled) {
            var $link = $('a[href="kf_smbox.php"]:contains("神秘盒子(现在可以抽取)")');
            if ($link.length > 0) {
                if (getCookie(getCookiePrefix() + smboxCookieName))
                    setCookie(getCookiePrefix() + smboxCookieName, '');
                goLink($link);
            }
        }
        if (autoItemOrCardEnabled) {
            goLink($('a[href="kf_fw_ig_one.php"]:contains("道具卡片(现在可以抽取)")'));
        }
        if (autoKfbEnabled && !getCookie(getCookiePrefix() + kfbCookieName)) {
            var $link = $('a[href="kf_growup.php"]');
            $link.attr('target', '_blank');
            goLink($link);
        }
    }
    else if (location.pathname == '/kf_smbox.php') {
        if (autoSmboxEnabled && !getCookie(getCookiePrefix() + smboxCookieName)) {
            var date = new Date();
            date.setHours(date.getHours() + 5);
            setCookie(getCookiePrefix() + smboxCookieName, true, date);
            var $smboxes = $('a[href^="kf_smbox.php?box="]');
            goLink($smboxes.eq(Math.floor(Math.random() * $smboxes.length)));
        }
    }
    else if (location.pathname == '/kf_growup.php' && autoKfbEnabled) {
        if (!getCookie(getCookiePrefix() + kfbCookieName))
            setCookie(getCookiePrefix() + kfbCookieName, true, getMidnightHourDate(1));
        if ($('form:contains("(今天还未捐款)")').length > 0) {
            $('input[name="kfb"]').eq(0).val(kfb);
            $('input[name="submit"]').click();
        }
    }
    else if (location.pathname == '/kf_fw_ig_one.php' && autoItemOrCardEnabled) {
        if ($('.kf_fw_ig1 td:contains("距离下次抽奖还需：0分钟")').length > 0) {
            $('input[name="submit' + autoItemOrCardType + '"]').click();
        }
    }
})();