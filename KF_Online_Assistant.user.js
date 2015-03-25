// ==UserScript==
// @name        KF Online助手
// @namespace   https://greasyfork.org/users/4514
// @author      喵拉布丁
// @homepage    https://greasyfork.org/scripts/8615
// @description KF Online必备！可在绯月Galgame上自动抽取神秘盒子、道具或卡片以及KFB捐款，并可使用各种方便的功能，更多功能开发中……
// @include     http://2dgal.com/*
// @include     http://*.2dgal.com/*
// @version     2.4.0
// @grant       none
// @run-at      document-end
// @license     MIT
// ==/UserScript==
/**
 * 配置类
 */
// （注意：请到设置界面里修改相应设置，如非必要请勿在代码里修改）
var Config = {
    // 是否自动KFB捐款，true：开启；false：关闭
    autoDonationEnabled: false,
    // KFB捐款额度（取值范围在1-5000之间，小数点将被舍去）
    donationKfb: 1,
    // 是否自动抽取神秘盒子，true：开启；false：关闭
    autoDrawSmboxEnabled: false,
    // 偏好的神秘盒子数字，例：[52,1,28,400]（以英文逗号分隔，按优先级排序），如设定的数字都不可用，则从剩余的盒子中随机抽选一个，如无需求可留空
    favorSmboxNumbers: [],
    // 是否自动抽取道具或卡片，true：开启；false：关闭
    autoDrawItemOrCardEnabled: false,
    // 抽取道具或卡片的方式，1：抽取道具或卡片；2：只抽取道具
    autoDrawItemOrCardType: 1,
    // 是否开启定时模式（开启定时模式后需停留在首页，需要刷新页面才可生效），true：开启；false：关闭
    autoRefreshEnabled: false,
    // 在首页的网页标题上显示定时模式提示的方案，auto：停留一分钟后显示；always：总是显示；never：不显示
    showRefreshModeTipsType: 'auto',
    // 默认提示消息的持续时间（秒）
    defShowMsgDuration: 10,
    // 是否开启去除首页已读at高亮提示的功能，true：开启；false：关闭
    hideMarkReadAtTipsEnabled: true,

    /* 以下设置如非必要请勿修改： */
    // 神秘盒子的默认抽奖间隔（分钟）
    defDrawSmboxInterval: 300,
    // 道具或卡片的默认抽奖间隔（分钟）
    defDrawItemOrCardInterval: 480,
    // 抽取神秘盒子完成后页面的再刷新间隔（秒），用于在定时模式中进行判断，并非是定时刷新模式的实际间隔时间
    completeRefreshInterval: 20,
    // 在网页标题上显示定时模式提示的更新间隔（分钟）
    showRefreshModeTipsInterval: 1,
    // 标记已去除首页已读at高亮提示的Cookie有效期（天）
    hideMarkReadAtTipsExpires: 3,
    // 标记已KFB捐款的Cookie名称
    donationCookieName: 'pd_donation',
    // 标记已抽取神秘盒子的Cookie名称
    drawSmboxCookieName: 'pd_draw_smbox',
    // 标记已抽取道具或卡片的Cookie名称
    drawItemOrCardCookieName: 'pd_draw_item_or_card',
    // 标记已去除首页已读at高亮提示的Cookie名称
    hideMarkReadAtTipsCookieName: 'pd_hide_mark_read_at_tips'
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
     * @param {string} [prefix] Cookie名称前缀，留空则表示使用{@link KFOL.uid}前缀
     */
    setCookie: function (name, value, date, prefix) {
        document.cookie = '{0}{1}={2}{3};path=/;'
            .replace('{0}', typeof prefix === 'undefined' || prefix === null ? KFOL.uid + '_' : prefix)
            .replace('{1}', name)
            .replace('{2}', encodeURI(value))
            .replace('{3}', !date ? '' : ';expires=' + date.toUTCString());
    },

    /**
     * 获取Cookie
     * @param {string} name Cookie名称
     * @param {string} [prefix] Cookie名称前缀，留空则表示使用{@link KFOL.uid}前缀
     * @returns {?string} Cookie值
     */
    getCookie: function (name, prefix) {
        var regex = new RegExp('(^| ){0}{1}=([^;]*)(;|$)'
                .replace('{0}', typeof prefix === 'undefined' || prefix === null ? KFOL.uid + '_' : prefix)
                .replace('{1}', name)
        );
        var matches = document.cookie.match(regex);
        if (!matches) return null;
        else return decodeURI(matches[2]);
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
     * 获取在当前时间的基础上的指定（相对）时间量的Date对象
     * @param {string} value 指定（相对）时间量，+或-：之后或之前（相对于当前时间）；无符号：绝对值；Y：完整年份；y：年；M：月；d：天；h：小时；m：分；s：秒；ms：毫秒
     * @returns {?Date} 指定（相对）时间量的Date对象
     * @example
     * Tools.getDate('+2y') 获取2年后的Date对象
     * Tools.getDate('+3M') 获取3个月后的Date对象
     * Tools.getDate('-4d') 获取4天前的Date对象
     * Tools.getDate('5h') 获取今天5点的Date对象（其它时间量与当前时间一致）
     * Tools.getDate('2015Y') 获取年份为2015年的Date对象
     */
    getDate: function (value) {
        var date = new Date();
        var matches = /^(-|\+)?(\d+)([a-zA-Z]{1,2})$/.exec(value);
        if (!matches) return null;
        var flag = typeof matches[1] === 'undefined' ? 0 : (matches[1] === '+' ? 1 : -1);
        var increment = flag === -1 ? -parseInt(matches[2]) : parseInt(matches[2]);
        var unit = matches[3];
        switch (unit) {
            case 'Y':
                date.setFullYear(increment);
                break;
            case 'y':
                date.setYear(flag === 0 ? increment : date.getYear() + increment);
                break;
            case 'M':
                date.setMonth(flag === 0 ? increment : date.getMonth() + increment);
                break;
            case 'd':
                date.setDate(flag === 0 ? increment : date.getDate() + increment);
                break;
            case 'h':
                date.setHours(flag === 0 ? increment : date.getHours() + increment);
                break;
            case 'm':
                date.setMinutes(flag === 0 ? increment : date.getMinutes() + increment);
                break;
            case 's':
                date.setSeconds(flag === 0 ? increment : date.getSeconds() + increment);
                break;
            case 'ms':
                date.setMilliseconds(flag === 0 ? increment : date.getMilliseconds() + increment);
                break;
            default:
                return null;
        }
        return date;
    },

    /**
     * 获取当前域名的URL
     * @returns {string} 当前域名的URL
     */
    getHostNameUrl: function () {
        return '{0}//{1}/'.replace('{0}', location.protocol).replace('{1}', location.host);
    },

    /**
     * 获取B对象中与A对象拥有同样字段并且值不同的新对象
     * @param {Object} a 对象A
     * @param {Object} b 对象B
     * @returns {Object} 新的对象
     */
    getDifferentValueOfObject: function (a, b) {
        var c = {};
        if ($.type(a) !== 'object' || $.type(b) !== 'object') return c;
        $.each(b, function (index, key) {
            if (typeof a[index] !== 'undefined') {
                if (!Tools.deepEqual(a[index], key)) c[index] = key;
            }
        });
        return c;
    },

    /**
     * 深度比较两个对象是否相等
     * @param {*} a
     * @param {*} b
     * @returns {boolean} 是否相等
     */
    deepEqual: function (a, b) {
        if (a === b) return true;
        if ($.type(a) !== $.type(b)) return false;
        if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;
        if ($.isArray(a) && $.isArray(b) || $.type(a) === 'object' && $.type(b) === 'object') {
            if (a.length !== b.length) return false;
            var c = $.extend($.isArray(a) ? [] : {}, a, b);
            for (var i in c) {
                if (typeof a[i] === 'undefined' || typeof b[i] === 'undefined') return false;
                if (!Tools.deepEqual(a[i], b[i])) return false;
            }
            return true;
        }
        return false;
    },

    /**
     * 获取URL中的指定参数
     * @param {string} name 参数名称
     * @returns {?string} URL中的指定参数
     */
    getUrlParam: function (name) {
        var regex = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
        var matches = location.search.substr(1).match(regex);
        if (matches) return decodeURI(matches[2]);
        else return null;
    }
};

/**
 * 设置对话框类
 */
var ConfigDialog = {
    // 保存设置的键值名称
    configName: 'pd_config',
    // 默认的Config对象
    defConfig: {},

    /**
     * 初始化
     */
    init: function () {
        $.extend(ConfigDialog.defConfig, Config);
        ConfigDialog.readConfig();
    },

    /**
     * 显示设置对话框
     */
    show: function () {
        var $configBox = $('#pd_cfg_box');
        if ($configBox.length > 0) return;
        var html = [
            '<div id="pd_cfg_box">',
            '  <h1>KF Online助手设置<span>×</span></h1>',
            '  <div class="pd_cfg_main">',
            '    <fieldset>',
            '      <legend><input id="pd_cfg_auto_donation_enabled" type="checkbox" value="true" /> 自动KFB捐款</legend>',
            '      <label>KFB捐款额度<input id="pd_cfg_donation_kfb" maxlength="4" style="width:50px" type="text" value="1" />',
            '<a class="pd_cfg_tips" href="#" title="取值范围在1-5000之间，小数点将被舍去">[?]</a></label>',
            '    </fieldset>',
            '    <fieldset>',
            '      <legend><input id="pd_cfg_auto_draw_smbox_enabled" type="checkbox" /> 自动抽取神秘盒子</legend>',
            '      <label>偏好的神秘盒子数字<input id="pd_cfg_favor_smbox_numbers" style="width:200px" type="text" />',
            '<a class="pd_cfg_tips" href="#" title="例：52,1,28,400（以英文逗号分隔，按优先级排序），如设定的数字都不可用，则从剩余的盒子中随机抽选一个，如无需求可留空">',
            '[?]</a></label>',
            '    </fieldset>',
            '    <fieldset>',
            '      <legend><input id="pd_cfg_auto_draw_item_or_card_enabled" type="checkbox" /> 自动抽取道具或卡片</legend>',
            '      <label>抽取方式<select id="pd_cfg_auto_draw_item_or_card_type"><option value="1">抽道具或卡片</option>',
            '<option value="2">只抽道具</option></select></label>',
            '    </fieldset>',
            '    <fieldset>',
            '      <legend><input id="pd_cfg_auto_refresh_enabled" type="checkbox" /> 定时模式 ',
            '<a class="pd_cfg_tips" href="#" title="开启定时模式后需停留在首页，需要刷新页面才可生效">[?]</a></legend>',
            '      <label>标题提示方案<select id="pd_cfg_show_refresh_mode_tips_type"><option value="auto">停留一分钟后显示</option>',
            '<option value="always">总是显示</option><option value="never">不显示</option></select>',
            '<a class="pd_cfg_tips" href="#" title="在首页的网页标题上显示定时模式提示的方案">[?]</a></label>',
            '    </fieldset>',
            '    <fieldset>',
            '      <legend>其它设置</legend>',
            '      <label>默认提示消息的持续时间<input id="pd_cfg_def_show_msg_duration" maxlength="5" style="width:50px" type="text" value="10" />秒 ',
            '<a class="pd_cfg_tips" href="#" title="设置为-1表示永久显示，默认值：10">[?]</a></label><br />',
            '      <label><input id="pd_cfg_hide_mark_read_at_tips_enabled" type="checkbox" checked="checked" />去除首页已读@高亮提示 ',
            '<a class="pd_cfg_tips" href="#" title="点击有人@你的按钮后，高亮边框将被去除；当无人@你时，将加上最近无人@你的按钮">[?]</a></label>',
            '    </fieldset>',
            '  </div>',
            '  <div class="pd_cfg_btns">',
            '    <span class="pd_cfg_about"><a target="_blank" href="https://greasyfork.org/zh-CN/scripts/8615">By 喵拉布丁</a></span>',
            '    <button id="pd_cfg_ok">确定</button><button id="pd_cfg_cancel">取消</button><button id="pd_cfg_default">默认值</button>',
            '  </div>',
            '</div>'
        ].join('');
        $('body').append(html);
        var resizeBox = function () {
            var $box = $('#pd_cfg_box');
            if ($box.length == 0) return;
            $box.css('top', $(window).height() / 2 - $box.height() / 2)
                .css('left', $(window).width() / 2 - $box.width() / 2);
        };
        resizeBox();
        $configBox = $('#pd_cfg_box');
        $configBox.find('h1 span, #pd_cfg_cancel').click(ConfigDialog.close)
            .end().find('.pd_cfg_tips').click(function () {
                return false;
            });
        $('#pd_cfg_ok').click(function () {
            if (!ConfigDialog.verify()) return;
            var oriAutoRefreshEnabled = Config.autoRefreshEnabled;
            var options = ConfigDialog.getValue();
            options = ConfigDialog.getNormalizationConfig(options);
            Config = $.extend({}, Config, options);
            ConfigDialog.writeConfig();
            ConfigDialog.close();
            if (oriAutoRefreshEnabled !== options.autoRefreshEnabled) {
                if (window.confirm('你已修改了定时模式的设置，需要刷新页面才能生效，是否立即刷新？')) {
                    location.reload();
                }
            }
        });
        $('#pd_cfg_default').click(function () {
            if (window.confirm('是否重置所有设置？')) {
                ConfigDialog.clearConfig();
                alert('设置已重置');
                location.reload();
            }
        });
        $(window).on('resize.pd_cfg_box', resizeBox)
            .on('keydown.pd_cfg_box', function (event) {
                if (event.key == 'Enter') {
                    $('#pd_cfg_ok').click();
                }
                else if (event.key == 'Esc' || event.key == 'Escape') {
                    $('#pd_cfg_cancel').click();
                }
            });
        ConfigDialog.setValue();
    },

    /**
     * 关闭设置对话框
     */
    close: function () {
        $('#pd_cfg_box').remove();
        $(window).off('resize.pd_cfg_box').off('keydown.pd_cfg_box');
    },

    /**
     * 设置对话框中的字段值
     */
    setValue: function () {
        $('#pd_cfg_auto_donation_enabled').prop('checked', Config.autoDonationEnabled);
        $('#pd_cfg_donation_kfb').val(Config.donationKfb);
        $('#pd_cfg_auto_draw_smbox_enabled').prop('checked', Config.autoDrawSmboxEnabled);
        $('#pd_cfg_favor_smbox_numbers').val(Config.favorSmboxNumbers.join(','));
        $('#pd_cfg_auto_draw_item_or_card_enabled').prop('checked', Config.autoDrawItemOrCardEnabled);
        $('#pd_cfg_auto_draw_item_or_card_type').val(Config.autoDrawItemOrCardType);
        $('#pd_cfg_auto_refresh_enabled').prop('checked', Config.autoRefreshEnabled);
        $('#pd_cfg_show_refresh_mode_tips_type').val(Config.showRefreshModeTipsType.toLowerCase());
        $('#pd_cfg_def_show_msg_duration').val(Config.defShowMsgDuration);
        $('#pd_cfg_hide_mark_read_at_tips_enabled').prop('checked', Config.hideMarkReadAtTipsEnabled);
    },

    /**
     * 获取对话框中字段值的Config对象
     * @returns {Config} 字段值的Config对象
     */
    getValue: function () {
        var options = {};
        options.autoDonationEnabled = $('#pd_cfg_auto_donation_enabled').prop('checked');
        options.donationKfb = parseInt($.trim($('#pd_cfg_donation_kfb').val()));
        options.autoDrawSmboxEnabled = $('#pd_cfg_auto_draw_smbox_enabled').prop('checked');
        options.favorSmboxNumbers = $.trim($('#pd_cfg_favor_smbox_numbers').val()).split(',');
        options.autoDrawItemOrCardEnabled = $('#pd_cfg_auto_draw_item_or_card_enabled').prop('checked');
        options.autoDrawItemOrCardType = parseInt($('#pd_cfg_auto_draw_item_or_card_type').val());
        options.autoRefreshEnabled = $('#pd_cfg_auto_refresh_enabled').prop('checked');
        options.showRefreshModeTipsType = $('#pd_cfg_show_refresh_mode_tips_type').val();
        options.defShowMsgDuration = parseInt($.trim($('#pd_cfg_def_show_msg_duration').val()));
        options.hideMarkReadAtTipsEnabled = $('#pd_cfg_hide_mark_read_at_tips_enabled').prop('checked');
        return options;
    },

    /**
     * 验证设置是否正确
     * @returns {boolean} 是否验证通过
     */
    verify: function () {
        var $txtDonationKfb = $('#pd_cfg_donation_kfb');
        var donationKfb = $.trim($txtDonationKfb.val());
        if (!$.isNumeric(donationKfb)) {
            alert('KFB捐款额度格式不正确');
            $txtDonationKfb.select();
            $txtDonationKfb.focus();
            return false;
        }
        if (parseInt(donationKfb) <= 0 || parseInt(donationKfb) > 5000) {
            alert('KFB捐款额度的取值范围在1-5000之间');
            $txtDonationKfb.select();
            $txtDonationKfb.focus();
            return false;
        }

        var $txtFavorSmboxNumbers = $('#pd_cfg_favor_smbox_numbers');
        var favorSmboxNumbers = $.trim($txtFavorSmboxNumbers.val());
        if (favorSmboxNumbers) {
            if (!/^\d+(,\d+)*$/.test(favorSmboxNumbers)) {
                alert('偏好的神秘盒子数字格式不正确');
                $txtFavorSmboxNumbers.select();
                $txtFavorSmboxNumbers.focus();
                return false;
            }
            if (/(\b\d{4,}\b|\b0+\b|\b[05-9]\d{2}\b|\b4\d[1-9]\b)/.test(favorSmboxNumbers)) {
                alert('每个神秘盒子数字的取值范围在1-400之间');
                $txtFavorSmboxNumbers.select();
                $txtFavorSmboxNumbers.focus();
                return false;
            }
        }

        var $txtDefShowMsgDuration = $('#pd_cfg_def_show_msg_duration');
        var defShowMsgDuration = $.trim($txtDefShowMsgDuration.val());
        if (!$.isNumeric(defShowMsgDuration) || parseInt(defShowMsgDuration) < -1) {
            alert('默认提示消息的持续时间格式不正确');
            $txtDefShowMsgDuration.select();
            $txtDefShowMsgDuration.focus();
            return false;
        }

        return true;
    },

    /**
     * 获取经过规范化的Config对象
     * @param {Config} options 待处理的Config对象
     * @returns {Config} 经过规范化的Config对象
     */
    getNormalizationConfig: function (options) {
        var settings = {};
        var defConfig = ConfigDialog.defConfig;
        if ($.type(options) !== 'object') return settings;
        settings.autoDonationEnabled = typeof options.autoDonationEnabled === 'boolean' ?
            options.autoDonationEnabled : Config.autoDonationEnabled;
        if (typeof options.donationKfb !== 'undefined') {
            var donationKfb = parseInt(options.donationKfb);
            if ($.isNumeric(donationKfb) && donationKfb > 0 && donationKfb <= 5000)
                settings.donationKfb = donationKfb;
            else settings.donationKfb = defConfig.donationKfb;
        }
        settings.autoDrawSmboxEnabled = typeof options.autoDrawSmboxEnabled === 'boolean' ?
            options.autoDrawSmboxEnabled : Config.autoDrawSmboxEnabled;
        if (typeof options.favorSmboxNumbers !== 'undefined') {
            if ($.isArray(options.favorSmboxNumbers)) {
                settings.favorSmboxNumbers = [];
                for (var i in options.favorSmboxNumbers) {
                    var num = parseInt(options.favorSmboxNumbers[i]);
                    if (num >= 1 && num <= 400) settings.favorSmboxNumbers.push(num);
                }
            }
            else settings.favorSmboxNumbers = defConfig.favorSmboxNumbers;
        }
        settings.autoDrawItemOrCardEnabled = typeof options.autoDrawItemOrCardEnabled === 'boolean' ?
            options.autoDrawItemOrCardEnabled : Config.autoDrawItemOrCardEnabled;
        if (typeof options.autoDrawItemOrCardType !== 'undefined') {
            var autoDrawItemOrCardType = parseInt(options.autoDrawItemOrCardType);
            if (autoDrawItemOrCardType >= 1 && autoDrawItemOrCardType <= 2)
                settings.autoDrawItemOrCardType = autoDrawItemOrCardType;
            else settings.autoDrawItemOrCardType = defConfig.autoDrawItemOrCardType;
        }
        settings.autoRefreshEnabled = typeof options.autoRefreshEnabled === 'boolean' ?
            options.autoRefreshEnabled : Config.autoRefreshEnabled;
        if (typeof options.showRefreshModeTipsType !== 'undefined') {
            var showRefreshModeTipsType = $.trim(options.showRefreshModeTipsType).toLowerCase();
            var allowTypes = ['auto', 'always', 'never'];
            if (showRefreshModeTipsType !== '' && $.inArray(showRefreshModeTipsType, allowTypes))
                settings.showRefreshModeTipsType = showRefreshModeTipsType;
            else settings.showRefreshModeTipsType = defConfig.showRefreshModeTipsType;
        }
        if (typeof options.defShowMsgDuration !== 'undefined') {
            var defShowMsgDuration = parseInt(options.defShowMsgDuration);
            if ($.isNumeric(defShowMsgDuration) && defShowMsgDuration >= -1)
                settings.defShowMsgDuration = defShowMsgDuration;
            else settings.defShowMsgDuration = defConfig.defShowMsgDuration;
        }
        settings.hideMarkReadAtTipsEnabled = typeof options.hideMarkReadAtTipsEnabled === 'boolean' ?
            options.hideMarkReadAtTipsEnabled : Config.hideMarkReadAtTipsEnabled;
        return settings;
    },

    /**
     * 读取设置
     */
    readConfig: function () {
        var options = localStorage[ConfigDialog.configName];
        if (!options) return;
        try {
            options = JSON.parse(localStorage[ConfigDialog.configName]);
        }
        catch (ex) {
            return;
        }
        if (!options || $.type(options) !== 'object' || $.isEmptyObject(options)) return;
        //console.log(options);
        options = ConfigDialog.getNormalizationConfig(options);
        Config = $.extend({}, Config, options);
    },

    /**
     * 写入设置
     */
    writeConfig: function () {
        var options = Tools.getDifferentValueOfObject(ConfigDialog.defConfig, Config);
        localStorage[ConfigDialog.configName] = JSON.stringify(options);
        //console.log(options);
    },

    /**
     * 清空设置
     */
    clearConfig: function () {
        localStorage.removeItem(ConfigDialog.configName);
    }
};

/**
 * 道具转换能量类
 */
var ConvertItemToEnergy = {
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
        var energyNum = ConvertItemToEnergy.getEnergyNumByLevel(settings.level);
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
                            msg: '<strong>共有<em>{0}</em>个道具成功转换为能量</strong><i>能量<em>+{1}</em></i>'
                                .replace('{0}', successNum)
                                .replace('{1}', successEnergyNum),
                            duration: -1
                        });
                        if (settings.type === 1) {
                            ConvertItemToEnergy.setAllClickDisable(false);
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
                var safeId = KFOL.getSafeId();
                if (!safeId) return;
                var $itemLine = $(this).parent().parent(),
                    itemLevel = parseInt($itemLine.children().eq(0).text()),
                    itemName = $itemLine.children().eq(1).text(),
                    itemUsedNum = parseInt($itemLine.children().eq(2).text()),
                    listUrl = $itemLine.children().eq(4).find('a').attr('href');
                if (!itemUsedNum) {
                    alert('本级没有已使用的道具');
                    ConvertItemToEnergy.setAllClickDisable(false);
                    return;
                }
                if (window.confirm('你要转换的是Lv.{0}：{1}，是否转换本级全部已使用的道具为能量？'
                            .replace('{0}', itemLevel)
                            .replace('{1}', itemName)
                    )
                ) {
                    ConvertItemToEnergy.setAllClickDisable(true);
                    $('.pd_pop_box').remove();
                    if (!listUrl || !/kf_fw_ig_renew\.php\?lv=\d+/.test(listUrl)) return;
                    KFOL.showWaitMsg('正在获取本级已使用道具列表，请稍后...');
                    $.get(listUrl, function (html) {
                        $('.pd_pop_box').remove();
                        var matches = html.match(/kf_fw_ig_my\.php\?pro=\d+/gi);
                        if (!matches) {
                            alert('本级没有已使用的道具');
                            ConvertItemToEnergy.setAllClickDisable(false);
                            return;
                        }
                        console.log('转换本级全部已使用的道具为能量Start，转换道具数量：' + matches.length);
                        KFOL.showWaitMsg('<strong>正在转换能量中...</strong><i>剩余数量:<em id="pd_remaining_num">{0}</em></i>'
                            .replace('{0}', matches.length));
                        ConvertItemToEnergy.convertItemsToEnergy({
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

/**
 * KF Online主类
 */
var KFOL = {
    // 用户ID
    uid: 0,
    // 用户名
    userName: '',
    // 是否位于首页
    isInHomePage: false,

    /**
     * 获取Uid和用户名
     * @returns {boolean} 是否获取成功
     */
    getUidAndUserName: function () {
        var $user = $('a[href^="profile.php?action=show&uid="]');
        if ($user.length === 0) return false;
        KFOL.userName = $user.text();
        var matches = /&uid=(\d+)/.exec($user.attr('href'));
        if (!matches) return false;
        KFOL.uid = matches[1];
        return true;
    },

    /**
     * 添加CSS样式
     */
    appendCss: function () {
        $('head').append(['<style type="text/css">',
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
            '.pd_pop_tips em { font-weight: 700; color:#FF6600; padding: 0 5px; }',
            '.pd_pop_tips a { font-weight: bold; margin-left: 15px; }',
            '.pd_pop_tips .pd_highlight { font-weight: bold; color: #FF0000; }',
            '.pd_pop_tips .pd_notice { font-style: italic; color: #666; }',
            '.readlou .pd_goto_link { color: #000; }',
            '.readlou .pd_goto_link:hover { color: #51D; }',

            /* 设置对话框 */
            '#pd_cfg_box { position: fixed; width: 400px; border: 1px solid #9191FF; }',
            '#pd_cfg_box h1 {text-align: center; font-size: 14px; background-color: #9191FF; color: #FFF; line-height: 2em; margin: 0; padding-left: 20px; }',
            '#pd_cfg_box h1 span { float: right; cursor: pointer; padding: 0 10px; }',
            '.pd_cfg_main { background-color: #FCFCFC; padding: 0 5px; font-size: 12px; line-height: 1.8em; max-height: 600px; overflow: auto; }',
            '.pd_cfg_main fieldset { border: 1px solid #CCCCFF; }',
            '.pd_cfg_main legend { font-weight: bold; }',
            '.pd_cfg_main input { vertical-align: middle; }',
            '.pd_cfg_main input[type="text"] { height: 18px; line-height: 18px; }',
            '.pd_cfg_main input[type="text"]:focus { border-color: #7EB4EA; }',
            '.pd_cfg_main label input, .pd_cfg_main label select { margin: 0 5px; }',
            '.pd_cfg_main .pd_cfg_tips { text-decoration: none; }',
            '.pd_cfg_main .pd_cfg_tips:hover { color: #FF0000; }',
            '.pd_cfg_btns { background-color: #FCFCFC; text-align: right; padding: 5px; }',
            '.pd_cfg_btns button { width: 80px; margin-left: 5px; }',
            '.pd_cfg_about { float: left; line-height: 24px; margin-left: 5px; }',
            '</style>'].join(''));
    },

    /**
     * 显示提示消息
     * @param {(string|Object)} options 提示消息或设置对象
     * @param {string} [options.msg] 提示消息
     * @param {number} [options.duration={@link Config.defShowMsgDuration}] 提示消息持续时间（秒），-1为永久显示
     * @param {boolean} [options.clickable=true] 消息框可否手动点击消除
     * @param {number} [duration] 提示消息持续时间（秒），-1为永久显示
     * @example
     * KFOL.showMsg('<strong>抽取道具或卡片</strong><i>道具<em>+1</em></i>');
     * KFOL.showMsg({msg: '<strong>抽取神秘盒子</strong><i>KFB<em>+8</em></i>', duration: 20, clickable: false});
     */
    showMsg: function (options, duration) {
        var settings = {
            msg: '',
            duration: Config.defShowMsgDuration,
            clickable: true
        };
        if ($.type(options) === 'object') {
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
            }).find('a').click(function (event) {
                event.stopPropagation();
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
            Tools.setCookie(Config.donationCookieName, 1, Tools.getMidnightHourDate(1));
            var msg = '<strong>捐款<em>{0}</em>KFB</strong>'.replace('{0}', Config.donationKfb);
            var matches = /捐款获得(\d+)经验值(?:.*?补偿期.*?\+(\d+)KFB.*?(\d+)成长经验)?/i.exec(html);
            if (!matches) {
                if (/KFB不足。<br \/>/.test(html)) {
                    msg += '<i class="pd_notice">KFB不足</i><a target="_blank" href="kf_growup.php">手动捐款</a>';
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
                Tools.setCookie(Config.drawSmboxCookieName, 1, Tools.getDate('+' + Config.defDrawSmboxInterval + 'm')
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
            Tools.setCookie(Config.drawItemOrCardCookieName, 1, Tools.getDate('+' + Config.defDrawItemOrCardInterval + 'm')
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
     * 获取用户的SafeID
     * @returns {string} 用户的SafeID
     */
    getSafeId: function () {
        var safeId = /safeid=(\w+)/i.exec($('a[href*="safeid="]').attr('href'));
        safeId = safeId ? safeId[1] : 0;
        if (!safeId) return '';
        else return safeId;
    },

    /**
     * 添加设置对话框的链接
     */
    appendConfigDialogLink: function () {
        var $logout = $('a[href^="login.php?action=quit"]').eq(0);
        if ($logout.length == 0) return;
        $('<a href="#">助手设置</a><span style="margin:0 4px">|</span>').insertBefore($logout)
            .click(function (event) {
                event.preventDefault();
                ConfigDialog.show();
            });
    },

    /**
     * 校准自动抽奖相关Cookies的有效期
     */
    adjustCookiesExpires: function () {
        var matches, minutes, date;
        if (parseInt(Tools.getCookie(Config.drawSmboxCookieName)) === 1) {
            matches = /神秘盒子\(剩余(\d+)分钟\)/.exec($('a[href="kf_smbox.php"]:contains("神秘盒子(剩余")').text());
            if (matches) {
                minutes = parseInt(matches[1]);
                Tools.setCookie(Config.drawSmboxCookieName, 2, Tools.getDate('+' + (minutes + 1) + 'm'));
            }
        }
        if (parseInt(Tools.getCookie(Config.drawItemOrCardCookieName)) === 1) {
            matches = /道具卡片\(剩余(\d+)分钟\)/.exec($('a[href="kf_fw_ig_one.php"]:contains("道具卡片(剩余")').text());
            if (matches) {
                minutes = parseInt(matches[1]);
                Tools.setCookie(Config.drawItemOrCardCookieName, 2, Tools.getDate('+' + (minutes + 1) + 'm'));
            }
        }
    },

    /**
     * 处理首页已读at高亮提示
     */
    handleMarkReadAtTips: function () {
        var $atTips = $('a[href^="guanjianci.php?gjc="]');
        if ($atTips.length > 0) {
            var cookieText = Tools.getCookie(Config.hideMarkReadAtTipsCookieName);
            var atTipsText = $atTips.text();
            if (cookieText) {
                if (cookieText === atTipsText) {
                    $atTips.removeClass('indbox5').addClass('indbox6');
                    return;
                }
            }
            $atTips.click(function () {
                Tools.setCookie(Config.hideMarkReadAtTipsCookieName, atTipsText,
                    Tools.getDate('+' + Config.hideMarkReadAtTipsExpires + 'd')
                );
                $(this).removeClass('indbox5').addClass('indbox6');
            });
        }
        else {
            var html = ('<div style="width:300px;"><a href="guanjianci.php?gjc={0}" target="_blank" class="indbox6">最近无人@你</a>' +
            '<br /><div class="line"></div><div class="c"></div></div><div class="line"></div>')
                .replace('{0}', encodeURI(KFOL.userName));
            $('a[href="kf_vmember.php"]:contains("VIP会员")').parent().before(html);
        }
    },

    /**
     * 为帖子里的每个楼层添加跳转链接
     */
    addFloorGotoLink: function () {
        $('.readlou > div:nth-child(2) > span').each(function () {
            $this = $(this);
            var floorText = $this.text();
            if (!/^\d+楼$/.test(floorText)) return;
            var linkName = $this.closest('.readlou').prev().attr('name');
            if (!linkName || !/^\d+$/.test(linkName)) return;
            $this.html('<a class="pd_goto_link" href="#">{0}</a>'.replace('{0}', floorText));
            $this.find('a').click(function (event) {
                event.preventDefault();
                window.prompt('本层的跳转链接（请按Ctrl+C复制）：',
                    '{0}read.php?tid={1}&spid={2}'
                        .replace('{0}', Tools.getHostNameUrl())
                        .replace('{1}', Tools.getUrlParam('tid'))
                        .replace('{2}', linkName)
                );
            });
        });

    },

    /**
     * 初始化
     */
    init: function () {
        if (typeof jQuery === 'undefined') return;
        if (location.pathname === '/' || location.pathname === '/index.php')
            KFOL.isInHomePage = true;
        if (location.pathname === '/read.php') KFOL.addFloorGotoLink();
        KFOL.getUidAndUserName();
        if (!KFOL.uid) return;
        console.log('KF Online助手启动');
        KFOL.appendCss();
        ConfigDialog.init();
        KFOL.appendConfigDialogLink();

        if (KFOL.isInHomePage) {
            KFOL.adjustCookiesExpires();
            if (Config.hideMarkReadAtTipsEnabled) KFOL.handleMarkReadAtTips();
        }
        if (Config.autoDonationEnabled && !Tools.getCookie(Config.donationCookieName)) {
            KFOL.donation();
        }

        var isDrawSmboxStarted = false;
        var autoDrawItemOrCardAvailable = Config.autoDrawItemOrCardEnabled &&
            (KFOL.isInHomePage ? $('a[href="kf_fw_ig_one.php"]:contains("道具卡片(现在可以抽取)")').length > 0 :
                !Tools.getCookie(Config.drawItemOrCardCookieName)
            );
        if (Config.autoDrawSmboxEnabled) {
            if (KFOL.isInHomePage ? $('a[href="kf_smbox.php"]:contains("神秘盒子(现在可以抽取)")').length > 0 :
                    !Tools.getCookie(Config.drawSmboxCookieName)
            ) {
                isDrawSmboxStarted = true;
                KFOL.drawSmbox(autoDrawItemOrCardAvailable);
            }
        }

        if (autoDrawItemOrCardAvailable && !isDrawSmboxStarted) {
            KFOL.drawItemOrCard();
        }

        if (/\/kf_fw_ig_renew\.php$/i.test(location.href)) {
            ConvertItemToEnergy.convertAllItemsToEnergy();
        }

        if (Config.autoRefreshEnabled) {
            if (KFOL.isInHomePage) KFOL.autoRefresh();
        }
        console.log('KF Online助手加载完毕');
    }
};

KFOL.init();