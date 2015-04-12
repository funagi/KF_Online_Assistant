// ==UserScript==
// @name        KF Online助手
// @namespace   https://greasyfork.org/users/4514
// @icon        https://raw.githubusercontent.com/miaolapd/KF_Online_Assistant/master/icon.png
// @author      喵拉布丁
// @homepage    https://greasyfork.org/scripts/8615
// @description KF Online必备！可在绯月Galgame上自动抽取神秘盒子、道具或卡片以及KFB捐款，并可使用各种方便的功能，更多功能开发中……
// @include     http://2dgal.com/*
// @include     http://*.2dgal.com/*
// @version     2.8.0-dev
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
    // KFB捐款额度，取值范围在1-5000的整数之间；可设置为百分比，表示捐款额度为当前收入的百分比（最多不超过5000KFB），例：80%
    donationKfb: '1',
    // 在当天的指定时间之后捐款（24小时制），例：22:30:00（注意不要设置得太接近零点，以免错过捐款）
    donationAfterTime: '00:05:00',
    // 在获得VIP资格后才进行捐款，如开启此选项，将只能在首页进行捐款，true：开启；false：关闭
    donationAfterVipEnabled: false,
    // 是否自动抽取神秘盒子，true：开启；false：关闭
    autoDrawSmboxEnabled: false,
    // 偏好的神秘盒子数字，例：[52,1,28,400]（以英文逗号分隔，按优先级排序），如设定的数字都不可用，则从剩余的盒子中随机抽选一个，如无需求可留空
    favorSmboxNumbers: [],
    // 是否不抽取会中头奖的神秘盒子（用于卡级，尚未验证是否确实可行），true：开启；false：关闭
    drawNonWinningSmboxEnabled: false,
    // 是否自动抽取道具或卡片，true：开启；false：关闭
    autoDrawItemOrCardEnabled: false,
    // 抽取道具或卡片的方式，1：抽取道具或卡片；2：只抽取道具
    autoDrawItemOrCardType: 1,
    // 是否将在自动抽取中获得的卡片转换为VIP时间，true：开启；false：关闭
    autoConvertCardToVipTimeEnabled: false,
    // 是否开启定时模式（开启定时模式后需停留在首页），true：开启；false：关闭
    autoRefreshEnabled: false,
    // 在首页的网页标题上显示定时模式提示的方案，auto：停留一分钟后显示；always：总是显示；never：不显示
    showRefreshModeTipsType: 'auto',
    // 默认提示消息的持续时间（秒）
    defShowMsgDuration: 10,
    // 是否开启去除首页已读at高亮提示的功能，true：开启；false：关闭
    hideMarkReadAtTipsEnabled: true,
    // 是否高亮首页的VIP身份标识，true：开启；false：关闭
    highlightVipEnabled: true,
    // 帖子每页楼层数量，用于电梯直达功能，如果修改了KF设置里的“文章列表每页个数”，请在此修改成相同的数目
    perPageFloorNum: 10,
    // 是否在帖子列表中高亮今日新发表帖子的发表时间，true：开启；false：关闭
    highlightNewPostEnabled: true,
    // 自定义本人的神秘颜色（包括帖子页面的ID显示颜色和楼层边框颜色，仅自己可见），例：#009CFF，如无需求可留空
    customMySmColor: '',

    /* 以下设置如非必要请勿修改： */
    // KFB捐款额度的最大值
    maxDonationKfb: 5000,
    // 神秘盒子的默认抽奖间隔（分钟）
    defDrawSmboxInterval: 300,
    // 道具或卡片的默认抽奖间隔（分钟）
    defDrawItemOrCardInterval: 480,
    // 抽取神秘盒子完成后的再刷新间隔（秒），用于在定时模式中进行判断，并非是定时模式的实际间隔时间
    drawSmboxCompleteRefreshInterval: 20,
    // 获取剩余抽奖时间失败后的重试间隔（分钟），用于定时模式
    errorRefreshInterval: 15,
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
    hideMarkReadAtTipsCookieName: 'pd_hide_mark_read_at_tips',
    // 存放将自动转换为VIP时间的卡片ID的Cookie名称
    convertCardToVipTimeCookieName: 'pd_convert_card_to_vip_time'
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
        var date = Tools.getDateByTime('00:00:00');
        date.setDate(date.getDate() + days);
        return date;
    },
    /**
     * 返回当天指定的时间的Date对象
     * @param {string} time 指定的时间（例：22:30:00）
     * @returns {Date} 修改后的Date对象
     */
    getDateByTime: function (time) {
        var date = new Date();
        var timeArr = time.split(':');
        if (timeArr[0]) date.setHours(parseInt(timeArr[0]));
        if (timeArr[1]) date.setMinutes(parseInt(timeArr[1]));
        if (timeArr[2]) date.setSeconds(parseInt(timeArr[2]));
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
            '<form>',
            '<div id="pd_cfg_box">',
            '  <h1>KF Online助手设置<span>×</span></h1>',
            '  <div class="pd_cfg_main">',
            '    <fieldset>',
            '      <legend><input id="pd_cfg_auto_donation_enabled" type="checkbox" value="true" />自动KFB捐款</legend>',
            '      <label>KFB捐款额度<input id="pd_cfg_donation_kfb" maxlength="4" style="width:35px" type="text" value="1" />',
            '<a class="pd_cfg_tips" href="#" title="取值范围在1-5000的整数之间；可设置为百分比，表示捐款额度为当前收入的百分比（最多不超过5000KFB），例：80%">[?]</a></label>',
            '      <label style="margin-left:10px">在<input id="pd_cfg_donation_after_time" maxlength="8" style="width:60px" type="text" value="00:05:00" />',
            '之后捐款 <a class="pd_cfg_tips" href="#" title="在当天的指定时间之后捐款（24小时制），例：22:30:00（注意不要设置得太接近零点，以免错过捐款）">[?]</a></label><br />',
            '      <label><input id="pd_cfg_donation_after_vip_enabled" type="checkbox" />在获得VIP后才进行捐款 ',
            '<a class="pd_cfg_tips" href="#" title="在获得VIP资格后才进行捐款，如开启此选项，将只能在首页进行捐款">[?]</a></label>',
            '    </fieldset>',
            '    <fieldset>',
            '      <legend><input id="pd_cfg_auto_draw_smbox_enabled" type="checkbox" />自动抽取神秘盒子</legend>',
            '      <label>偏好的神秘盒子数字<input id="pd_cfg_favor_smbox_numbers" style="width:200px" type="text" />',
            '<a class="pd_cfg_tips" href="#" title="例：52,1,28,400（以英文逗号分隔，按优先级排序），如设定的数字都不可用，则从剩余的盒子中随机抽选一个，如无需求可留空">',
            '[?]</a></label><br />',
            '      <label><input id="pd_cfg_draw_non_winning_smbox_enabled" type="checkbox" />不抽取会中头奖的神秘盒子 ',
            '<a class="pd_cfg_tips" href="#" title="抽取神秘盒子时，只抽取当前已被人点过的盒子（用于卡级，尚未验证是否确实可行）">[?]</a></label>',
            '    </fieldset>',
            '    <fieldset>',
            '      <legend><input id="pd_cfg_auto_draw_item_or_card_enabled" type="checkbox" />自动抽取道具或卡片</legend>',
            '      <label>抽取方式<select id="pd_cfg_auto_draw_item_or_card_type"><option value="1">抽道具或卡片</option>',
            '<option value="2">只抽道具</option></select></label><br />',
            '      <label><input id="pd_convert_card_to_vip_time_enabled" type="checkbox" />将抽到的卡片自动转换为VIP时间 ',
            '<a class="pd_cfg_tips" href="#" title="将在自动抽取中获得的卡片转换为VIP时间">[?]</a></label>',
            '    </fieldset>',
            '    <fieldset>',
            '      <legend><input id="pd_cfg_auto_refresh_enabled" type="checkbox" />定时模式 ',
            '<a class="pd_cfg_tips" href="#" title="开启定时模式后需停留在首页">[?]</a></legend>',
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
            '      <label style="margin-left:10px"><input id="pd_cfg_highlight_vip_enabled" type="checkbox" checked="checked" />高亮首页VIP标识 ',
            '<a class="pd_cfg_tips" href="#" title="如获得了VIP身份，首页的VIP标识将高亮显示">[?]</a></label><br />',
            '      <label>帖子每页楼层数量<select id="pd_cfg_per_page_floor_num"><option value="10">10</option>',
            '<option value="20">20</option><option value="30">30</option></select>',
            '<a class="pd_cfg_tips" href="#" title="用于电梯直达功能，如果修改了KF设置里的“文章列表每页个数”，请在此修改成相同的数目">[?]</a></label>',
            '      <label style="margin-left:10px"><input id="pd_cfg_highlight_new_post_enabled" type="checkbox" checked="checked" />高亮今日的新帖 ',
            '<a class="pd_cfg_tips" href="#" title="在帖子列表中高亮今日新发表帖子的发表时间">[?]</a></label><br />',
            '      <label>自定义本人的神秘颜色<input id="pd_cfg_custom_my_sm_color" maxlength="7" style="width:52px" type="text" />',
            '<input type="color" id="pd_cfg_custom_my_sm_color_select">',
            '<a class="pd_cfg_tips" href="#" title="自定义本人的神秘颜色（包括帖子页面的ID显示颜色和楼层边框颜色，仅自己可见），例：#009CFF，如无需求可留空">',
            '[?]</a></label>',
            '    </fieldset>',
            '  </div>',
            '  <div class="pd_cfg_btns">',
            '    <span class="pd_cfg_about"><a target="_blank" href="https://greasyfork.org/zh-CN/scripts/8615">By 喵拉布丁</a></span>',
            '    <button id="pd_cfg_ok">确定</button><button id="pd_cfg_cancel">取消</button><button id="pd_cfg_default">默认值</button>',
            '  </div>',
            '</div>',
            '</form>'
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
        $('#pd_cfg_default').click(function () {
            if (window.confirm('是否重置所有设置？')) {
                ConfigDialog.clearConfig();
                alert('设置已重置');
                location.reload();
            }
            return false;
        });
        $('#pd_cfg_custom_my_sm_color_select').change(function () {
            $('#pd_cfg_custom_my_sm_color').val($(this).val().toString().toUpperCase());
        });
        $('#pd_cfg_custom_my_sm_color').keyup(function () {
            var customMySmColor = $.trim($(this).val());
            if (/^#[0-9a-fA-F]{6}$/.test(customMySmColor)) {
                $('#pd_cfg_custom_my_sm_color_select').val(customMySmColor.toUpperCase());
            }
        });
        $(window).on('resize.pd_cfg_box', resizeBox)
            .on('keydown.pd_cfg_box', function (event) {
                if (event.key === 'Esc' || event.key === 'Escape') {
                    $('#pd_cfg_cancel').click();
                }
            });
        ConfigDialog.setValue();
        $configBox.parent().submit(function (event) {
            event.preventDefault();
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
        }).find('legend > input[type="checkbox"]').click(function () {
            var checked = $(this).prop('checked');
            $(this).parent().nextAll('label').find('input, select, textarea').prop('disabled', !checked);
        }).each(function () {
            $(this).triggerHandler('click');
        }).end().find('input[data-disabled]').click(function () {
            var checked = $(this).prop('checked');
            $($(this).data('disabled')).prop('disabled', !checked);
        }).each(function () {
            $(this).triggerHandler('click');
        });
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
        $('#pd_cfg_donation_after_time').val(Config.donationAfterTime);
        $('#pd_cfg_donation_after_vip_enabled').prop('checked', Config.donationAfterVipEnabled);
        $('#pd_cfg_auto_draw_smbox_enabled').prop('checked', Config.autoDrawSmboxEnabled);
        $('#pd_cfg_favor_smbox_numbers').val(Config.favorSmboxNumbers.join(','));
        $('#pd_cfg_draw_non_winning_smbox_enabled').prop('checked', Config.drawNonWinningSmboxEnabled);
        $('#pd_cfg_auto_draw_item_or_card_enabled').prop('checked', Config.autoDrawItemOrCardEnabled);
        $('#pd_cfg_auto_draw_item_or_card_type').val(Config.autoDrawItemOrCardType);
        $('#pd_convert_card_to_vip_time_enabled').prop('checked', Config.autoConvertCardToVipTimeEnabled);
        $('#pd_cfg_auto_refresh_enabled').prop('checked', Config.autoRefreshEnabled);
        $('#pd_cfg_show_refresh_mode_tips_type').val(Config.showRefreshModeTipsType.toLowerCase());
        $('#pd_cfg_def_show_msg_duration').val(Config.defShowMsgDuration);
        $('#pd_cfg_hide_mark_read_at_tips_enabled').prop('checked', Config.hideMarkReadAtTipsEnabled);
        $('#pd_cfg_highlight_vip_enabled').prop('checked', Config.highlightVipEnabled);
        $('#pd_cfg_per_page_floor_num').val(Config.perPageFloorNum);
        $('#pd_cfg_highlight_new_post_enabled').prop('checked', Config.highlightNewPostEnabled);
        $('#pd_cfg_custom_my_sm_color').val(Config.customMySmColor);
        if (Config.customMySmColor) $('#pd_cfg_custom_my_sm_color_select').val(Config.customMySmColor);
    },

    /**
     * 获取对话框中字段值的Config对象
     * @returns {Config} 字段值的Config对象
     */
    getValue: function () {
        var options = {};
        options.autoDonationEnabled = $('#pd_cfg_auto_donation_enabled').prop('checked');
        options.donationKfb = $.trim($('#pd_cfg_donation_kfb').val());
        options.donationKfb = $.isNumeric(options.donationKfb) ? parseInt(options.donationKfb) : options.donationKfb;
        options.donationAfterVipEnabled = $('#pd_cfg_donation_after_vip_enabled').prop('checked');
        options.donationAfterTime = $('#pd_cfg_donation_after_time').val();
        options.autoDrawSmboxEnabled = $('#pd_cfg_auto_draw_smbox_enabled').prop('checked');
        options.favorSmboxNumbers = $.trim($('#pd_cfg_favor_smbox_numbers').val()).split(',');
        options.drawNonWinningSmboxEnabled = $('#pd_cfg_draw_non_winning_smbox_enabled').prop('checked');
        options.autoDrawItemOrCardEnabled = $('#pd_cfg_auto_draw_item_or_card_enabled').prop('checked');
        options.autoDrawItemOrCardType = parseInt($('#pd_cfg_auto_draw_item_or_card_type').val());
        options.autoConvertCardToVipTimeEnabled = $('#pd_convert_card_to_vip_time_enabled').prop('checked');
        options.autoRefreshEnabled = $('#pd_cfg_auto_refresh_enabled').prop('checked');
        options.showRefreshModeTipsType = $('#pd_cfg_show_refresh_mode_tips_type').val();
        options.defShowMsgDuration = parseInt($.trim($('#pd_cfg_def_show_msg_duration').val()));
        options.hideMarkReadAtTipsEnabled = $('#pd_cfg_hide_mark_read_at_tips_enabled').prop('checked');
        options.highlightVipEnabled = $('#pd_cfg_highlight_vip_enabled').prop('checked');
        options.perPageFloorNum = $('#pd_cfg_per_page_floor_num').val();
        options.highlightNewPostEnabled = $('#pd_cfg_highlight_new_post_enabled').prop('checked');
        options.customMySmColor = $.trim($('#pd_cfg_custom_my_sm_color').val()).toUpperCase();
        return options;
    },

    /**
     * 验证设置是否正确
     * @returns {boolean} 是否验证通过
     */
    verify: function () {
        var $txtDonationKfb = $('#pd_cfg_donation_kfb');
        var donationKfb = $.trim($txtDonationKfb.val());
        if (/%$/.test(donationKfb)) {
            if (!/^1?\d?\d%$/.test(donationKfb)) {
                alert('KFB捐款额度格式不正确');
                $txtDonationKfb.select();
                $txtDonationKfb.focus();
                return false;
            }
            if (parseInt(donationKfb) <= 0 || parseInt(donationKfb) > 100) {
                alert('KFB捐款额度百分比的取值范围在1-100之间');
                $txtDonationKfb.select();
                $txtDonationKfb.focus();
                return false;
            }
        }
        else {
            if (!$.isNumeric(donationKfb)) {
                alert('KFB捐款额度格式不正确');
                $txtDonationKfb.select();
                $txtDonationKfb.focus();
                return false;
            }
            if (parseInt(donationKfb) <= 0 || parseInt(donationKfb) > Config.maxDonationKfb) {
                alert('KFB捐款额度的取值范围在1-{0}之间'.replace('{0}', Config.maxDonationKfb));
                $txtDonationKfb.select();
                $txtDonationKfb.focus();
                return false;
            }
        }

        var $txtDonationAfterTime = $('#pd_cfg_donation_after_time');
        var donationAfterTime = $txtDonationAfterTime.val();
        if (!/^(2[0-3]|[0-1][0-9]):[0-5][0-9]:[0-5][0-9]$/.test(donationAfterTime)) {
            alert('在指定时间之后捐款格式不正确');
            $txtDonationAfterTime.select();
            $txtDonationAfterTime.focus();
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

        var $txtCustomMySmColor = $('#pd_cfg_custom_my_sm_color');
        var customMySmColor = $.trim($txtCustomMySmColor.val());
        if (customMySmColor && !/^#[0-9a-fA-F]{6}$/.test(customMySmColor)) {
            alert('自定义本人的神秘颜色格式不正确，例：#009CFF');
            $txtCustomMySmColor.select();
            $txtCustomMySmColor.focus();
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
            var donationKfb = options.donationKfb;
            if ($.isNumeric(donationKfb) && donationKfb > 0 && donationKfb <= Config.maxDonationKfb)
                settings.donationKfb = parseInt(donationKfb);
            else if (/^1?\d?\d%$/.test(donationKfb) && parseInt(donationKfb) > 0 && parseInt(donationKfb) <= 100)
                settings.donationKfb = parseInt(donationKfb) + '%';
            else settings.donationKfb = defConfig.donationKfb;
        }
        if (typeof options.donationAfterTime !== 'undefined') {
            var donationAfterTime = options.donationAfterTime;
            if (/^(2[0-3]|[0-1][0-9]):[0-5][0-9]:[0-5][0-9]$/.test(donationAfterTime))
                settings.donationAfterTime = donationAfterTime;
            else settings.donationAfterTime = defConfig.donationAfterTime;
        }
        settings.donationAfterVipEnabled = typeof options.donationAfterVipEnabled === 'boolean' ?
            options.donationAfterVipEnabled : Config.donationAfterVipEnabled;
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
        settings.drawNonWinningSmboxEnabled = typeof options.drawNonWinningSmboxEnabled === 'boolean' ?
            options.drawNonWinningSmboxEnabled : Config.drawNonWinningSmboxEnabled;
        settings.autoDrawItemOrCardEnabled = typeof options.autoDrawItemOrCardEnabled === 'boolean' ?
            options.autoDrawItemOrCardEnabled : Config.autoDrawItemOrCardEnabled;
        if (typeof options.autoDrawItemOrCardType !== 'undefined') {
            var autoDrawItemOrCardType = parseInt(options.autoDrawItemOrCardType);
            if (autoDrawItemOrCardType >= 1 && autoDrawItemOrCardType <= 2)
                settings.autoDrawItemOrCardType = autoDrawItemOrCardType;
            else settings.autoDrawItemOrCardType = defConfig.autoDrawItemOrCardType;
        }
        settings.autoConvertCardToVipTimeEnabled = typeof options.autoConvertCardToVipTimeEnabled === 'boolean' ?
            options.autoConvertCardToVipTimeEnabled : Config.autoConvertCardToVipTimeEnabled;
        settings.autoRefreshEnabled = typeof options.autoRefreshEnabled === 'boolean' ?
            options.autoRefreshEnabled : Config.autoRefreshEnabled;
        if (typeof options.showRefreshModeTipsType !== 'undefined') {
            var showRefreshModeTipsType = $.trim(options.showRefreshModeTipsType).toLowerCase();
            var allowTypes = ['auto', 'always', 'never'];
            if (showRefreshModeTipsType !== '' && $.inArray(showRefreshModeTipsType, allowTypes) > -1)
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
        settings.highlightVipEnabled = typeof options.highlightVipEnabled === 'boolean' ?
            options.highlightVipEnabled : Config.highlightVipEnabled;
        if (typeof options.perPageFloorNum !== 'undefined') {
            var perPageFloorNum = parseInt(options.perPageFloorNum);
            if ($.inArray(perPageFloorNum, [10, 20, 30]) > -1)
                settings.perPageFloorNum = perPageFloorNum;
            else settings.perPageFloorNum = defConfig.perPageFloorNum;
        }
        settings.highlightNewPostEnabled = typeof options.highlightNewPostEnabled === 'boolean' ?
            options.highlightNewPostEnabled : Config.highlightNewPostEnabled;
        if (typeof options.customMySmColor !== 'undefined') {
            var customMySmColor = options.customMySmColor;
            if (/^#[0-9a-fA-F]{6}$/.test(customMySmColor))
                settings.customMySmColor = customMySmColor;
            else settings.customMySmColor = defConfig.customMySmColor;
        }
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
 * 道具类
 */
var Item = {
    /**
     * 转换指定的一系列道具为能量
     * @param {Object} options 设置项
     * @param {number} options.type 转换类型，1：转换本级全部已使用的道具为能量；2：转换本级部分已使用的道具为能量
     * @param {string[]} options.urlList 指定的道具Url列表
     * @param {string} options.safeId 用户的SafeID
     * @param {number} options.level 道具等级
     * @param {jQuery} [options.$itemLine] 当前转换道具所在的表格行（用于转换类型1）
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
        var energyNum = Item.getGainEnergyNumByLevel(settings.level);
        $(document).queue('ConvertItemsToEnergy', []);
        $.each(settings.urlList, function (index, key) {
            var id = /pro=(\d+)/i.exec(key);
            id = id ? id[1] : 0;
            if (!id) return;
            var url = 'kf_fw_ig_doit.php?tomp={0}&id={1}'
                .replace('{0}', settings.safeId)
                .replace('{1}', id);
            $(document).queue('ConvertItemsToEnergy', function () {
                $.get(url, function (html) {
                    KFOL.showFormatLog('转换道具能量', html);
                    if (/转换为了\s*\d+\s*点能量/i.test(html)) {
                        successNum++;
                    }
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    if (index === settings.urlList.length - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        var successEnergyNum = successNum * energyNum;
                        console.log('共有{0}个道具成功转换为能量，能量+{1}'
                                .replace('{0}', successNum)
                                .replace('{1}', successEnergyNum)
                        );
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>个道具成功转换为能量</strong><i>能量<em>+{1}</em></i>'
                                .replace('{0}', successNum)
                                .replace('{1}', successEnergyNum)
                            , duration: -1
                        });
                        if (settings.type === 2) {
                            $('.kf_fw_ig1:eq(1) input[type="checkbox"]:checked')
                                .closest('tr')
                                .hide('slow', function () {
                                    $(this).remove();
                                });
                        }
                        else {
                            var $itemUsed = settings.$itemLine.children().eq(2);
                            $itemUsed.text(parseInt($itemUsed.text()) - successNum);
                        }
                        var $totalEnergyNum = $('.kf_fw_ig1 td:contains("道具恢复能量")').find('span');
                        if ($totalEnergyNum.length === 1) {
                            $totalEnergyNum.text(parseInt($totalEnergyNum.text()) + successEnergyNum);
                        }
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('ConvertItemsToEnergy');
                    }, 500);
                }, 'html');
            });
        });
        $(document).dequeue('ConvertItemsToEnergy');
    },

    /**
     * 获得转换指定道具等级可获得的能量点
     * @param {number} level 道具等级
     * @returns {number} 能量点
     */
    getGainEnergyNumByLevel: function (level) {
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
     * 添加转换本级全部已使用的道具为能量的链接
     */
    addConvertAllItemsToEnergyLink: function () {
        $('.kf_fw_ig1:eq(1) td:contains("全部转换本级已使用道具为能量")').each(function (i) {
            $(this).html('<a href="#">全部转换本级已使用道具为能量</a>').find('a').click(function (event) {
                event.preventDefault();
                var safeId = KFOL.getSafeId();
                if (!safeId) return;
                var $itemLine = $(this).parent().parent(),
                    itemLevel = parseInt($itemLine.children().eq(0).text()),
                    itemName = $itemLine.children().eq(1).text(),
                    itemUsedNum = parseInt($itemLine.children().eq(2).text()),
                    urlList = $itemLine.children().eq(4).find('a').attr('href');
                if (!itemUsedNum) {
                    alert('本级没有已使用的道具');
                    return;
                }
                if (window.confirm('你要转换的是Lv.{0}：{1}，是否转换本级全部已使用的道具为能量？'
                            .replace('{0}', itemLevel)
                            .replace('{1}', itemName)
                    )
                ) {
                    KFOL.removePopTips($('.pd_pop_tips'));
                    if (!urlList || !/kf_fw_ig_renew\.php\?lv=\d+/.test(urlList)) return;
                    KFOL.showWaitMsg('正在获取本级已使用道具列表，请稍后...', true);
                    $.get(urlList, function (html) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        var matches = html.match(/kf_fw_ig_my\.php\?pro=\d+/gi);
                        if (!matches) {
                            alert('本级没有已使用的道具');
                            return;
                        }
                        console.log('转换本级全部已使用的道具为能量Start，转换道具数量：' + matches.length);
                        KFOL.showWaitMsg('<strong>正在转换能量中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                                .replace('{0}', matches.length)
                            , true);
                        Item.convertItemsToEnergy({
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
    },

    /**
     * 获得恢复指定道具等级所需的能量点
     * @param {number} level 道具等级
     * @returns {number} 能量点
     */
    getRestoreEnergyNumByLevel: function (level) {
        switch (level) {
            case 1:
                return 10;
            case 2:
                return 50;
            case 3:
                return 300;
            case 4:
                return 2000;
            case 5:
                return 10000;
        }
    },

    /**
     * 恢复指定的一系列道具
     * @param {Object} options 设置项
     * @param {number} options.type 恢复类型，1：恢复本级全部已使用的道具；2：恢复本级部分已使用的道具
     * @param {string[]} options.urlList 指定的道具Url列表
     * @param {string} options.safeId 用户的SafeID
     * @param {number} options.level 道具等级
     * @param {jQuery} [options.$itemLine] 当前恢复道具所在的表格行（用于恢复类型1）
     */
    restoreItems: function (options) {
        var settings = {
            type: 1,
            urlList: [],
            safeId: '',
            level: 1,
            $itemLine: null
        };
        $.extend(settings, options);
        var successNum = 0;
        var failNum = 0;
        var energyNum = Item.getRestoreEnergyNumByLevel(settings.level);
        $(document).queue('RestoreItems', []);
        $.each(settings.urlList, function (index, key) {
            var id = /pro=(\d+)/i.exec(key);
            id = id ? id[1] : 0;
            if (!id) return;
            var url = 'kf_fw_ig_doit.php?renew={0}&id={1}'
                .replace('{0}', settings.safeId)
                .replace('{1}', id);
            $(document).queue('RestoreItems', function () {
                $.get(url, function (html) {
                    KFOL.showFormatLog('恢复道具', html);
                    if (/该道具已经被恢复/i.test(html)) {
                        successNum++;
                    }
                    else if (/恢复失败/i.test(html)) {
                        failNum++;
                    }
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    if (index === settings.urlList.length - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        var successEnergyNum = successNum * energyNum;
                        console.log('共有{0}个道具恢复成功，共有{1}个道具恢复失败，能量-{2}'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum)
                                .replace('{2}', successEnergyNum)
                        );
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>个道具恢复成功，共有<em>{1}</em>个道具恢复失败</strong><i>能量<em>-{2}</em></i>'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum)
                                .replace('{2}', successEnergyNum)
                            , duration: -1
                        });
                        if (settings.type === 2) {
                            $('.kf_fw_ig1:eq(1) input[type="checkbox"]:checked')
                                .closest('tr')
                                .hide('slow', function () {
                                    $(this).remove();
                                });
                        }
                        var $totalEnergyNum = $('.kf_fw_ig1 td:contains("道具恢复能量")').find('span');
                        if ($totalEnergyNum.length === 1) {
                            $totalEnergyNum.text(parseInt($totalEnergyNum.text()) - successEnergyNum);
                        }
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('RestoreItems');
                    }, 500);
                }, 'html');
            });
        });
        $(document).dequeue('RestoreItems');
    },

    /**
     * 添加批量转换能量和恢复道具的按钮
     */
    addConvertEnergyAndRestoreItemsButton: function () {
        var safeId = KFOL.getSafeId();
        if (!safeId) return;
        var matches = /(\d+)级道具/.exec($('.kf_fw_ig1:eq(1) > tbody > tr > td:nth-child(2)').eq(0).text());
        if (!matches) return;
        var itemLevel = parseInt(matches[1]);
        $('.kf_fw_ig1:eq(1) > tbody > tr > td:last-child').each(function () {
            var matches = /kf_fw_ig_my\.php\?pro=(\d+)/.exec($(this).find('a').attr('href'));
            if (!matches) return;
            $(this).css('width', '500')
                .parent()
                .append('<td style="width:20px;padding-right:5px"><input class="pd_input" type="checkbox" value="{0}" /></td>'
                    .replace('{0}', matches[1])
            );
        });
        $('<div class="pd_item_btns"><button>转换能量</button><button>恢复道具</button><button>全选</button><button>反选</button></div>')
            .insertAfter('.kf_fw_ig1:eq(1)')
            .find('button:first-child')
            .click(function () {
                var urlList = [];
                $('.kf_fw_ig1:eq(1) input[type="checkbox"]:checked').each(function () {
                    urlList.push('kf_fw_ig_my.php?pro={0}'.replace('{0}', $(this).val()));
                });
                if (urlList.length === 0) return;
                if (!window.confirm('共选择了{0}个道具，是否转换为能量？'.replace('{0}', urlList.length))) return;
                KFOL.showWaitMsg('<strong>正在转换能量中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', urlList.length)
                    , true);
                Item.convertItemsToEnergy({
                    type: 2,
                    urlList: urlList,
                    safeId: safeId,
                    level: itemLevel
                });
            })
            .next()
            .click(function () {
                var urlList = [];
                $('.kf_fw_ig1:eq(1) input[type="checkbox"]:checked').each(function () {
                    urlList.push('kf_fw_ig_my.php?pro={0}'.replace('{0}', $(this).val()));
                });
                if (urlList.length === 0) return;
                var totalRequiredEnergyNum = urlList.length * Item.getRestoreEnergyNumByLevel(itemLevel);
                if (!window.confirm('共选择了{0}个道具，共需要{1}点恢复能量，是否恢复道具？'
                            .replace('{0}', urlList.length)
                            .replace('{1}', totalRequiredEnergyNum)
                    )
                ) return;
                var totalEnergyNum = parseInt($('.kf_fw_ig1 td:contains("道具恢复能量")').find('span').text());
                if (!totalEnergyNum || totalEnergyNum < totalRequiredEnergyNum) {
                    alert('所需恢复能量不足');
                    return;
                }
                KFOL.showWaitMsg('<strong>正在恢复道具中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', urlList.length)
                    , true);
                Item.restoreItems({
                    type: 2,
                    urlList: urlList,
                    safeId: safeId,
                    level: itemLevel
                });
            })
            .next()
            .click(function () {
                $('.kf_fw_ig1:eq(1) input[type="checkbox"]').prop('checked', true);
            })
            .next()
            .click(function () {
                $('.kf_fw_ig1:eq(1) input[type="checkbox"]').each(function () {
                    $(this).prop('checked', !$(this).prop('checked'));
                });
            });
    },

    /**
     * 统计批量神秘抽奖结果
     * @param {jQuery} $result 抽奖结果的jQuery对象
     */
    statBatchDrawSmResult: function ($result) {
        var totalNum = $result.children().length;
        KFOL.removePopTips($('.pd_pop_tips'));
        KFOL.showWaitMsg('<strong>正在统计数据中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                .replace('{0}', totalNum - 1)
            , true);
        var stat = {};
        var failNum = 0;
        $(document).queue('ItemStat', []);
        $result.find('li').each(function (index) {
            var url = $(this).find('a').attr('href');
            if (!/kf_fw_ig_my\.php\?pro=\d+/.test(url)) return;
            $(document).queue('ItemStat', function () {
                $.get(url, function (html) {
                    var matches = />道具名称：(.+?)<\/span>/.exec(html);
                    var itemName = '';
                    var itemLevel = 0;
                    if (matches) itemName = matches[1];
                    matches = /道具等级：(\d+)级道具/.exec(html);
                    if (matches) itemLevel = parseInt(matches[1]);
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    if (itemName !== '' && itemLevel !== 0) {
                        var key = 'Lv.{0}：{1}'.replace('{0}', itemLevel).replace('{1}', itemName);
                        if (typeof stat[key] === 'undefined') stat[key] = 1;
                        else stat[key] += 1;
                        $result.children().eq(index).append('（Lv.{0}：{1}）'.replace('{0}', itemLevel).replace('{1}', itemName));
                    }
                    else {
                        failNum++;
                        $result.children().eq(index).append('<span class="pd_notice">（未能获得预期的回应）</span>');
                    }
                    if (index === totalNum - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        var statArr = [];
                        for (var item in stat) {
                            statArr.push(item + '|' + stat[item]);
                        }
                        statArr.sort();
                        var resultStat = '', logStat = '';
                        for (var i in statArr) {
                            var arr = statArr[i].split('|');
                            if (arr.length < 2) continue;
                            if (resultStat !== '' && i % 4 === 0) resultStat += '<br />';
                            resultStat += '<i>{0}<em>+{1}</em></i>'.replace('{0}', arr[0]).replace('{1}', arr[1]);
                            logStat += '，{0}+{1}'.replace('{0}', arr[0]).replace('{1}', arr[1]);
                        }
                        if (resultStat !== '') {
                            console.log('神秘抽奖统计结果（共有{0}个道具未能统计成功）{1}'
                                    .replace('{0}', failNum)
                                    .replace('{1}', logStat)
                            );
                            $result.append('<li class="pd_result_stat"><b>统计结果{0}：</b><br />{1}</li>'
                                    .replace('{0}', failNum > 0 ?
                                        '<span class="pd_notice">（共有{0}个道具未能统计成功）</span>'.replace('{0}', failNum)
                                        : '')
                                    .replace('{1}', resultStat)
                            );
                        }
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('ItemStat');
                    }, 1000);
                }, 'html');
            });
        });
        $(document).dequeue('ItemStat');
    },

    /**
     * 添加批量神秘抽奖的按钮
     */
    addBatchDrawSmButton: function () {
        $('<form><span style="margin-left:20px;vertical-align:top"><input class="pd_input" style="width:35px" maxlength="5" type="text" />' +
        '<input class="pd_input" style="margin-left:5px;color:#0000FF;" type="submit" value="批量抽奖" /></span></form>')
            .appendTo('.kf_fw_ig1 > tbody > tr:last-child > td:last-child')
            .submit(function (event) {
                event.preventDefault();
                var safeId = KFOL.getSafeId();
                if (!safeId) return;
                var totalNum = parseInt($.trim($(this).find('input[type="text"]').val()));
                if (!totalNum || totalNum <= 0) return;
                var $maxDrawNumNode = $(this).parent().prev();
                var matches = /：(\d+)次/.exec($maxDrawNumNode.text());
                if (!matches) return;
                var maxDrawNum = parseInt(matches[1]);
                if (totalNum > maxDrawNum) {
                    alert('不能超过最大可用抽奖次数');
                    return;
                }
                if (!window.confirm('是否进行{0}次神秘抽奖？'.replace('{0}', totalNum))) return;
                KFOL.removePopTips($('.pd_pop_tips'));
                $('.kf_fw_ig1').parent().append('<ul class="pd_result"><li><strong>抽奖结果：</strong></li></ul>');
                var successNum = 0;
                KFOL.showWaitMsg('<strong>正在批量神秘抽奖中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', totalNum)
                    , true);
                $(document).queue('BatchDrawSm', []);
                $.each(new Array(totalNum), function (index) {
                    $(document).queue('BatchDrawSm', function () {
                        $.post('kf_fw_ig_smone.php?safeid=' + safeId,
                            {one: 1, submit: '点击这里抽奖'},
                            function (html) {
                                KFOL.showFormatLog('神秘抽奖', html);
                                var matches = /<a href="(kf_fw_ig_my\.php\?pro=\d+)">/.exec(html);
                                if (matches) {
                                    successNum++;
                                    var $remainingNum = $('#pd_remaining_num');
                                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                                    $('.pd_result').last().append('<li><b>第{0}次：</b>获得了一个<a target="_blank" href="{1}">道具</a></li>'
                                            .replace('{0}', index + 1)
                                            .replace('{1}', matches[1])
                                    );
                                }
                                if (index === totalNum - 1) {
                                    console.log('成功进行了{0}次神秘抽奖，道具+{1}'
                                            .replace('{0}', successNum)
                                            .replace('{1}', successNum)
                                    );
                                    KFOL.removePopTips($('.pd_pop_tips'));
                                    KFOL.showMsg('<strong>成功进行了<em>{0}</em>次神秘抽奖</strong><i>道具<em>+{1}</em></i>'
                                            .replace('{0}', successNum)
                                            .replace('{1}', successNum)
                                        , -1);
                                    $maxDrawNumNode.text('我可用的神秘抽奖次数：{0}次'.replace('{0}', maxDrawNum - successNum));
                                    if (successNum > 0) {
                                        $('<li><a href="#">统计数据</a></li>').appendTo($('.pd_result').last())
                                            .find('a')
                                            .click(function (event) {
                                                event.preventDefault();
                                                var $result = $(this).closest('.pd_result');
                                                $(this).parent().remove();
                                                Item.statBatchDrawSmResult($result);
                                            });
                                    }
                                }
                                window.setTimeout(function () {
                                    $(document).dequeue('BatchDrawSm');
                                }, 500);
                            }, 'html');
                    });
                });
                $(document).dequeue('BatchDrawSm');
            });
    },

    /**
     * 从使用道具的回应消息中获取积分数据
     * @param {number} typeId 道具类别ID
     * @param {string} response 使用道具的回应消息
     * @returns {Array} 积分数据，[0]：积分类别；[1]：积分值
     */
    getCreditsViaResponse: function (typeId, response) {
        var credits = [];
        var matches = null;
        switch (typeId) {
            case 1:
                matches = /恢复能量增加了\s*(\d+)\s*点/i.exec(response);
                if (matches) credits.push('能量', parseInt(matches[1]));
                break;
            case 2:
                matches = /(\d+)KFB/i.exec(response);
                if (matches) credits.push('KFB', parseInt(matches[1]));
                break;
            case 3:
                matches = /(\d+)KFB/i.exec(response);
                if (matches) credits.push('KFB', parseInt(matches[1]));
                break;
            case 4:
                matches = /(\d+)KFB/i.exec(response);
                if (matches) credits.push('KFB', parseInt(matches[1]));
                break;
            case 5:
                matches = /(\d+)KFB/i.exec(response);
                if (matches) credits.push('KFB', parseInt(matches[1]));
                break;
            case 6:
                matches = /(\d+)点贡献/i.exec(response);
                if (matches) credits.push('贡献', parseInt(matches[1]));
                break;
            case 11:
                matches = /(\d+)贡献/i.exec(response);
                if (matches) credits.push('贡献', parseInt(matches[1]));
                break;
            case 7:
                matches = /神秘提升了(\d+)级/i.exec(response);
                if (matches) credits.push('神秘', parseInt(matches[1]));
                break;
            case 8:
                matches = /贡献\+(\d+)/i.exec(response);
                var smMatches = /神秘等级\+(\d+)/i.exec(response);
                if (matches) credits.push('贡献', parseInt(matches[1]));
                else if (smMatches) credits.push('神秘', parseInt(smMatches[1]));
                break;
            case 12:
                matches = /(\d+)级神秘/i.exec(response);
                if (matches) credits.push('神秘', parseInt(matches[1]));
                break;
        }
        return credits;
    },

    /**
     * 使用指定的一系列道具
     * @param {Object} options 设置项
     * @param {number} options.type 使用类型，1：使用本级全部已使用的道具；2：使用本级部分已使用的道具
     * @param {string[]} options.urlList 指定的道具Url列表
     * @param {string} options.safeId 用户的SafeID
     * @param {jQuery} [options.$itemLine] 当前恢复道具所在的表格行（用于使用类型1）
     */
    useItems: function (options) {
        var settings = {
            type: 1,
            urlList: [],
            safeId: '',
            $itemLine: null
        };
        $.extend(settings, options);
        $('.kf_fw_ig1').parent().append('<ul class="pd_result"><li><strong>使用结果：</strong></li></ul>');
        var successNum = 0;
        $(document).queue('UseItems', []);
        $.each(settings.urlList, function (index, key) {
            var id = /pro=(\d+)/i.exec(key);
            id = id ? id[1] : 0;
            if (!id) return;
            var url = 'kf_fw_ig_doit.php?id={0}'.replace('{0}', id);
            $(document).queue('UseItems', function () {
                $.get(url, function (html) {
                    KFOL.showFormatLog('使用道具', html);
                    var matches = /<span style=".+?">(.+?)<\/span><br \/><a href=".+?">/i.exec(html);
                    if (matches && !/错误的物品编号/i.test(html)) {
                        successNum++;
                    }
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    $('.pd_result').last().append('<li><b>第{0}次：</b>{1}</li>'
                            .replace('{0}', index + 1)
                            .replace('{1}', matches ? matches[1] : '未能获得预期的回应')
                    );
                    if (index === settings.urlList.length - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        var typeId = parseInt(Tools.getUrlParam('lv'));
                        if (!typeId) return;
                        var stat = {};
                        $('.pd_result').last().find('li').not(':first-child').each(function () {
                            var credits = Item.getCreditsViaResponse(typeId, $(this).text());
                            if (credits.length > 0) {
                                if (typeof stat[credits[0]] === 'undefined')
                                    stat[credits[0]] = credits[1];
                                else
                                    stat[credits[0]] += credits[1];
                            }
                        });
                        var logStat = '', msgStat = '';
                        for (var creditsType in stat) {
                            logStat += '，{0}{1}{2}'
                                .replace('{0}', creditsType)
                                .replace('{1}', stat[creditsType] >= 0 ? '+' : '-')
                                .replace('{2}', stat[creditsType]);
                            msgStat += '<i>{0}<em>{1}{2}</em></i>'
                                .replace('{0}', creditsType)
                                .replace('{1}', stat[creditsType] >= 0 ? '+' : '-')
                                .replace('{2}', stat[creditsType]);
                        }
                        var resultStat = msgStat;
                        console.log('共有{0}个道具使用成功{1}'.replace('{0}', successNum).replace('{1}', logStat));
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>个道具使用成功{1}'
                                .replace('{0}', successNum)
                                .replace('{1}', msgStat)
                            , duration: -1
                        });
                        if (settings.type === 2) {
                            $('.kf_fw_ig1 input[type="checkbox"]:checked')
                                .closest('tr')
                                .hide('slow', function () {
                                    $(this).remove();
                                });
                        }
                        if (resultStat === '') resultStat = '<i>无</i>';
                        $('.pd_result').last().append('<li class="pd_result_stat"><b>统计结果：</b>{0}</li>'.replace('{0}', resultStat));
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('UseItems');
                    }, 500);
                }, 'html');
            });
        });
        $(document).dequeue('UseItems');
    },

    /**
     * 添加批量使用道具的按钮
     */
    addUseItemsButton: function () {
        var safeId = KFOL.getSafeId();
        if (!safeId) return;
        $('.kf_fw_ig1 > tbody > tr > td:last-child').each(function () {
            var matches = /kf_fw_ig_my\.php\?pro=(\d+)/.exec($(this).find('a').attr('href'));
            if (!matches) return;
            $(this).css('width', '163')
                .parent()
                .append('<td style="width:20px;padding-right:5px"><input class="pd_input" type="checkbox" value="{0}" /></td>'
                    .replace('{0}', matches[1])
            );
        });
        $('.kf_fw_ig1 > tbody > tr:lt(2)').find('td').attr('colspan', 5);
        $('<div class="pd_item_btns"><button>使用道具</button><button>全选</button><button>反选</button></div>')
            .insertAfter('.kf_fw_ig1')
            .find('button:first-child')
            .click(function () {
                var urlList = [];
                $('.kf_fw_ig1 input[type="checkbox"]:checked').each(function () {
                    urlList.push('kf_fw_ig_my.php?pro={0}'.replace('{0}', $(this).val()));
                });
                if (urlList.length === 0) return;
                if (!window.confirm('共选择了{0}个道具，是否批量使用道具？'.replace('{0}', urlList.length))) return;
                KFOL.showWaitMsg('<strong>正在使用道具中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', urlList.length)
                    , true);
                Item.useItems({
                    type: 2,
                    urlList: urlList,
                    safeId: safeId
                });
            })
            .next()
            .click(function () {
                $('.kf_fw_ig1 input[type="checkbox"]').prop('checked', true);
            })
            .next()
            .click(function () {
                $('.kf_fw_ig1 input[type="checkbox"]').each(function () {
                    $(this).prop('checked', !$(this).prop('checked'));
                });
            });
    }
};

/**
 * 卡片类
 */
var Card = {
    /**
     * 将指定的卡片转换为VIP时间
     * @param {number} cardId 指定的卡片ID
     */
    convertCardToVipTime: function (cardId) {
        if (!cardId || cardId < 0) return;
        var safeId = KFOL.getSafeId();
        if (!safeId) return;
        $.get('kf_fw_card_doit.php?do=recard&id={0}&safeid={1}'.replace('{0}', cardId).replace('{1}', safeId),
            function (html) {
                Tools.setCookie(Config.convertCardToVipTimeCookieName, '');
                KFOL.showFormatLog('将卡片转换为VIP时间', html);
                var matches = /增加(\d+)小时VIP时间(?:.*?获得(\d+)点恢复能量)?/i.exec(html);
                if (!matches) return;
                var msg = '<strong><em>1</em>张卡片被转换为VIP时间</strong><i>VIP小时<em>+{0}</em></i>'.replace('{0}', matches[1]);
                if (typeof matches[2] !== 'undefined') msg += '<i>能量<em>+{0}</em></i>'.replace('{0}', matches[2]);
                KFOL.showMsg(msg);
            }, 'html');
    }
};

/**
 * 银行类
 */
var Bank = {
    // 最低转账金额
    minTransferMoney: 20,

    /**
     * 验证批量转账的字段值是否正确
     * @returns {boolean} 是否正确
     */
    batchTransferVerify: function () {
        var $bankUsers = $('#pd_bank_users');
        var users = $bankUsers.val();
        if (!/^\s*\S+\s*$/m.test(users) || /^\s*:/m.test(users) || /:/.test(users) && /:(\D|$)/m.test(users)) {
            alert('用户列表格式不正确');
            $bankUsers.select();
            $bankUsers.focus();
            return false;
        }
        if (/^\s*\S+?:0*[0-1]?\d\s*$/m.test(users)) {
            alert('转帐金额不能小于{0}KFB'.replace('{0}', Bank.minTransferMoney));
            $bankUsers.select();
            $bankUsers.focus();
            return false;
        }
        var $bankMoney = $('#pd_bank_money');
        var money = parseInt($.trim($bankMoney.val()));
        if (/^\s*[^:]+\s*$/m.test(users)) {
            if (!$.isNumeric(money)) {
                alert('通用转账金额格式不正确');
                $bankMoney.select();
                $bankMoney.focus();
                return false;
            }
            else if (money < Bank.minTransferMoney) {
                alert('转帐金额不能小于{0}KFB'.replace('{0}', Bank.minTransferMoney));
                $bankMoney.select();
                $bankMoney.focus();
                return false;
            }
        }
        return true;
    },

    /**
     * 活期存款
     * @param {number} money 存款金额（KFB）
     * @param {number} cash 现金（KFB）
     * @param {number} currentDeposit 现有活期存款（KFB）
     */
    saveCurrentDeposit: function (money, cash, currentDeposit) {
        var $tips = KFOL.showWaitMsg('正在存款中...', true);
        $.post('hack.php?H_name=bank',
            {action: 'save', btype: 1, savemoney: money},
            function (html) {
                if (/完成存款/.test(html)) {
                    KFOL.showFormatLog('存款', html);
                    KFOL.removePopTips($tips);
                    console.log('共有{0}KFB存入活期账户'.replace('{0}', money));
                    var $account = $('.bank1 > tbody > tr:nth-child(2) > td:contains("当前所持：")');
                    $account.html($account.html().replace(/当前所持：-?\d+KFB/i,
                            '当前所持：{0}KFB'.replace('{0}', cash - money)
                        ).replace(/活期存款：-?\d+KFB/i,
                            '活期存款：{0}KFB'.replace('{0}', currentDeposit + money)
                        )
                    );
                    window.setTimeout(function () {
                        $(document).dequeue('Bank');
                    }, 5000);
                }
                else {
                    alert('存款失败');
                }
            }, 'html');
    },

    /**
     * 批量转账
     * @param {Array} users 用户列表
     * @param {string} msg 转帐附言
     * @param {boolean} isDeposited 是否已存款
     * @param {number} currentDeposit 现有活期存款
     */
    batchTransfer: function (users, msg, isDeposited, currentDeposit) {
        var successNum = 0, failNum = 0, successMoney = 0;
        $.each(users, function (index, key) {
            $(document).queue('Bank', function () {
                $.post('hack.php?H_name=bank',
                    {action: 'virement', pwuser: key[0], to_money: key[1], memo: msg},
                    function (html) {
                        KFOL.showFormatLog('批量转账', html);
                        var statMsg = '';
                        if (/完成转帐!<\/span>/.test(html)) {
                            successNum++;
                            successMoney += key[1];
                            statMsg = '<em>+{0}</em>'.replace('{0}', key[1]);
                        }
                        else {
                            failNum++;
                            if (/用户<b>.+?<\/b>不存在<br \/>/.test(html)) {
                                statMsg = '用户不存在';
                            }
                            else if (/您的存款不够支付转帐/.test(html)) {
                                statMsg = '存款不足';
                            }
                            else if (/转帐数目填写不正确/.test(html)) {
                                statMsg = '转帐金额不正确';
                            }
                            else if (/自己无法给自己转帐/.test(html)) {
                                statMsg = '无法给自己转帐';
                            }
                            else if (/\d+秒内不允许重新交易/.test(html)) {
                                statMsg = '提交速度过快';
                            }
                            else {
                                statMsg = '未能获得预期的回应';
                            }
                            statMsg = '<span class="pd_notice">({0})</span>'.replace('{0}', statMsg);
                        }
                        $('.pd_result').last().append('<li>{0}{1}</li>'.replace('{0}', key[0]).replace('{1}', statMsg));
                        var $remainingNum = $('#pd_remaining_num');
                        $remainingNum.text(parseInt($remainingNum.text()) - 1);
                        if (index === users.length - 1) {
                            KFOL.removePopTips($('.pd_pop_tips'));
                            var $account = $('.bank1 > tbody > tr:nth-child(2) > td:contains("活期存款：")');
                            $account.html($account.html().replace(/活期存款：-?\d+KFB/i,
                                    '活期存款：{0}KFB'.replace('{0}', currentDeposit - successMoney)
                                )
                            );
                            console.log('共有{0}名用户转账成功，共有{1}名用户转账失败，KFB-{2}'
                                    .replace('{0}', successNum)
                                    .replace('{1}', failNum)
                                    .replace('{2}', successMoney)
                            );
                            KFOL.showMsg('<strong>共有<em>{0}</em>名用户转账成功{1}</strong><i>KFB<em>-{2}</em></i>'
                                    .replace('{0}', successNum)
                                    .replace('{1}', failNum > 0 ? '，共有<em>{0}</em>名用户转账失败'.replace('{0}', failNum) : '')
                                    .replace('{2}', successMoney)
                            );
                        }
                        window.setTimeout(function () {
                            $(document).dequeue('Bank');
                        }, 5000);
                    }, 'html');
            });
        });
        if (!isDeposited) $(document).dequeue('Bank');
    },

    /**
     * 添加批量转账的按钮
     */
    addBatchTransferButton: function () {
        var html = [
            '<tr id="pd_bank_transfer">',
            '  <td style="vertical-align:top">使用说明：<br />每行一名用户，<br />如需单独设定金额，<br />可写为“用户名:金额”<br />（注意是<b>英文冒号</b>）<br />',
            '例子：<br /><pre style="border:1px solid #9999FF;padding:5px">张三\n李四:200\n王五:500\n信仰风</pre></td>',
            '  <td>',
            '  <form>',
            '    <div style="display:inline-block"><label>用户列表：<br />',
            '<textarea id="pd_bank_users" style="width:270px;height:250px;font-size:12px"></textarea></label></div>',
            '    <div style="display:inline-block;margin-left:10px;">',
            '      <label>通用转帐金额（如所有用户都已设定单独金额则可留空）：<br />',
            '<input class="pd_input" id="pd_bank_money" type="text" style="width:220px" maxlength="10" /></label><br />',
            '      <label style="margin-top:5px">转帐附言（可留空）：<br />',
            '<textarea id="pd_bank_msg" style="width:225px;height:206px;font-size:12px" id="pd_bank_users"></textarea></label>',
            '    </div>',
            '    <div><label><input class="pd_input" type="submit" value="批量转账" /></label> ',
            '（活期存款不足时，可自动进行存款；在正常情况下，批量转账金额不会从定期存款中扣除）</div>',
            '  </form>',
            '  </td>',
            '</tr>',
            ''
        ].join('');
        $(html).appendTo('.bank1 > tbody')
            .find('form')
            .submit(function (event) {
                event.preventDefault();
                KFOL.removePopTips($('.pd_pop_tips'));
                var cash = 0, currentDeposit = 0, fee = 0;
                var matches = /当前所持：(-?\d+)KFB/i.exec($('td:contains("当前所持：")').text());
                if (!matches) return;
                cash = parseInt(matches[1]);
                matches = /活期存款：(-?\d+)KFB/i.exec($('td:contains("活期存款：")').text());
                if (!matches) return;
                currentDeposit = parseInt(matches[1]);
                matches = /\(手续费(\d+)%\)/i.exec($('td:contains("(手续费")').text());
                if (!matches) return;
                fee = parseInt(matches[1]) / 100;
                if (!Bank.batchTransferVerify()) return;
                var commonMoney = parseInt($.trim($('#pd_bank_money').val()));
                if (!commonMoney) commonMoney = 0;
                var msg = $('#pd_bank_msg').val();
                var users = [];
                $.each($('#pd_bank_users').val().split('\n'), function (index, key) {
                    var line = $.trim(key);
                    if (!line) return;
                    if (line.indexOf(':') > -1) {
                        var arr = line.split(':');
                        if (arr.length < 2) return;
                        users.push([arr[0], parseInt(arr[1])]);
                    }
                    else {
                        users.push([line, commonMoney]);
                    }
                });
                if (users.length == 0) return;
                var totalMoney = 0;
                for (var i in users) {
                    totalMoney += users[i][1];
                }
                totalMoney = Math.floor(totalMoney * (1 + fee));
                if (!window.confirm('共计{0}名用户，总额{1}KFB，是否转账？'
                            .replace('{0}', users.length)
                            .replace('{1}', totalMoney)
                    )
                ) return;
                if (totalMoney > cash + currentDeposit) {
                    alert('资产不足');
                    return;
                }
                $(document).queue('Bank', []);
                var isDeposited = false;
                var difference = totalMoney - currentDeposit;
                if (difference > 0) {
                    if (window.confirm('你的活期存款不足，是否将差额{0}KFB存入银行？'.replace('{0}', difference))) {
                        isDeposited = true;
                        $(document).queue('Bank', function () {
                            Bank.saveCurrentDeposit(difference, cash, currentDeposit);
                            cash -= difference;
                            currentDeposit += difference;
                        });
                        $(document).dequeue('Bank');
                    }
                    else return;
                }
                KFOL.showWaitMsg('<strong>正在批量转账中，请耐心等待...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', users.length)
                    , true);
                $('#pd_bank_transfer > td:last-child').append('<ul class="pd_result pd_result_stat"><li><strong>转账结果：</strong></li></ul>');
                Bank.batchTransfer(users, msg, isDeposited, currentDeposit);
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
            '.pd_layer { position: fixed; width: 100%; height: 100%; left: 0; top: 0; }',
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
            '.pd_pop_tips em, .pd_result_stat em { font-weight: 700; color:#FF6600; padding: 0 5px; }',
            '.pd_pop_tips a { font-weight: bold; margin-left: 15px; }',
            '.pd_highlight { color: #FF0000 !important; }',
            '.pd_notice, .pd_pop_tips .pd_notice { font-style: italic; color: #666; }',
            '.pd_input, .pd_cfg_main input { vertical-align: middle; height: inherit; margin-right: 0; line-height: 22px; }',
            '.pd_input[type="text"], .pd_cfg_main input[type="text"] { height: 18px; line-height: 18px; }',
            '.pd_input:focus, .pd_cfg_main input[type="text"]:focus { border-color: #7EB4EA; }',
            '.readlou .pd_goto_link { color: #000; }',
            '.readlou .pd_goto_link:hover { color: #51D; }',
            '.pd_fast_goto_floor { margin-right: 5px; }',
            '.pages .pd_fast_goto_page { margin-left: 8px; }',
            '.pd_fast_goto_floor span:hover, .pd_fast_goto_page span:hover { color: #51D; cursor: pointer; text-decoration: underline; }',
            '.pd_item_btns { text-align: right; margin-top: 5px; }',
            '.pd_item_btns button { margin-left: 3px; }',
            '.pd_result { border: 1px solid #99F; padding: 5px; margin-top: 10px; line-height: 2em; }',
            '.pd_result_stat i { font-style: normal; margin-right: 10px; }',
            '.pd_result_stat .pd_notice { margin-left: 5px; }',

            /* 设置对话框 */
            '#pd_cfg_box { position: fixed; width: 400px; border: 1px solid #9191FF; }',
            '#pd_cfg_box h1 {text-align: center; font-size: 14px; background-color: #9191FF; color: #FFF; line-height: 2em; margin: 0; padding-left: 20px; }',
            '#pd_cfg_box h1 span { float: right; cursor: pointer; padding: 0 10px; }',
            '.pd_cfg_main { background-color: #FCFCFC; padding: 0 5px; font-size: 12px; line-height: 22px; max-height: 600px; overflow: auto; }',
            '.pd_cfg_main fieldset { border: 1px solid #CCCCFF; }',
            '.pd_cfg_main legend { font-weight: bold; }',
            '.pd_cfg_main label input, .pd_cfg_main legend input, .pd_cfg_main label select { margin: 0 5px; }',
            '.pd_cfg_main input[type="color"] { height: 18px; width: 30px; padding: 0; }',
            '.pd_cfg_main .pd_cfg_tips { text-decoration: none; cursor: help; }',
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
     * @param {boolean} [options.preventable=false] 是否阻止点击网页上的其它元素
     * @param {number} [duration] 提示消息持续时间（秒），-1为永久显示
     * @example
     * KFOL.showMsg('<strong>抽取道具或卡片</strong><i>道具<em>+1</em></i>');
     * KFOL.showMsg({msg: '<strong>抽取神秘盒子</strong><i>KFB<em>+8</em></i>', duration: 20, clickable: false});
     * @returns {jQuery} 消息框的jQuery对象
     */
    showMsg: function (options, duration) {
        var settings = {
            msg: '',
            duration: Config.defShowMsgDuration,
            clickable: true,
            preventable: false
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
            if (settings.preventable) $('<div class="pd_layer"></div>').appendTo('body');
            $popBox = $('<div class="pd_pop_box"></div>').appendTo('body');
        }
        var length = $popBox.data('length');
        length = length ? length : 0;
        var $popTips = $('<div class="pd_pop_tips">' + settings.msg + '</div>').appendTo($popBox);
        if (settings.clickable) {
            $popTips.css('cursor', 'pointer').click(function () {
                $(this).stop(true, true).fadeOut('slow', function () {
                    KFOL.removePopTips($(this));
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
                KFOL.removePopTips($(this));
            });
        }
        return $popTips;
    },

    /**
     * 显示等待消息
     * @param {string} msg 等待消息
     * @param {boolean} [preventable=false] 是否阻止点击网页上的其它元素
     * @returns {jQuery} 消息框的jQuery对象
     */
    showWaitMsg: function (msg, preventable) {
        return KFOL.showMsg({msg: msg, duration: -1, clickable: false, preventable: preventable === true});
    },

    /**
     * 移除指定的提示消息框
     * @param {jQuery} $popTips 指定的消息框节点
     */
    removePopTips: function ($popTips) {
        var $parent = $popTips.parent();
        $popTips.remove();
        if ($('.pd_pop_tips').length == 0) {
            $parent.remove();
            $('.pd_layer').remove();
        }
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
        if (Config.donationAfterVipEnabled) {
            if (!KFOL.isInHomePage) return;
            if ($('a[href="kf_vmember.php"]:contains("VIP会员(参与论坛获得的额外权限)")').length > 0) return;
        }
        var now = new Date();
        var date = Tools.getDateByTime(Config.donationAfterTime);
        if (now < date) return;
        console.log('KFB捐款Start');
        var donationSubmit = function (kfb) {
            $.post('kf_growup.php?ok=1', {kfb: kfb}, function (html) {
                var date = Tools.getDateByTime('02:00:00');
                if (new Date() > date) date = Tools.getMidnightHourDate(1);
                Tools.setCookie(Config.donationCookieName, 1, date);
                KFOL.showFormatLog('捐款{0}KFB'.replace('{0}', kfb), html);
                var msg = '<strong>捐款<em>{0}</em>KFB</strong>'.replace('{0}', kfb);
                var matches = /捐款获得(\d+)经验值(?:.*?补偿期.*?\+(\d+)KFB.*?(\d+)成长经验)?/i.exec(html);
                if (!matches) {
                    if (/KFB不足。<br \/>/.test(html)) {
                        msg += '<i class="pd_notice">KFB不足</i><a target="_blank" href="kf_growup.php">手动捐款</a>';
                    }
                    else return;
                }
                else {
                    msg += '<i>经验值<em>+{0}</em></i>'.replace('{0}', matches[1]);
                    if (typeof matches[2] !== 'undefined' && typeof matches[3] !== 'undefined') {
                        msg += '<i style="margin-left:5px">(补偿期:</i><i>KFB<em>+{0}</em></i><i>经验值<em>+{1}</em>)</i>'
                            .replace('{0}', matches[2])
                            .replace('{1}', matches[3]);
                    }
                }
                KFOL.showMsg(msg);
            }, 'html');
        };
        var donationKfb = Config.donationKfb;
        if (/%$/.test(donationKfb)) {
            $.get('profile.php?action=show&uid=' + KFOL.uid, function (html) {
                var matches = /论坛货币：(\d+)\s*KFB/i.exec(html);
                var income = 1;
                if (matches) income = parseInt(matches[1]);
                else console.log('KFB余额获取失败');
                donationKfb = parseInt(income * parseInt(donationKfb) / 100);
                donationKfb = donationKfb > 0 ? donationKfb : 1;
                donationKfb = donationKfb <= Config.maxDonationKfb ? donationKfb : Config.maxDonationKfb;
                donationSubmit(donationKfb);
            }, 'html');
        }
        else {
            donationSubmit(parseInt(donationKfb));
        }
    },

    /**
     * 抽取神秘盒子
     * @param {boolean} isAutoDrawItemOrCard 是否在抽取神秘盒子完毕之后自动抽取道具或卡片
     * @param {boolean} isAutoDonation 是否在抽取神秘盒子完毕之后自动捐款
     */
    drawSmbox: function (isAutoDrawItemOrCard, isAutoDonation) {
        console.log('抽取神秘盒子Start');
        $.get('kf_smbox.php', function (html) {
            if (!/kf_smbox\.php\?box=\d+&safeid=\w+/i.test(html)) {
                KFOL.showFormatLog('抽取神秘盒子', html);
                return;
            }
            var smboxNumber = 0;
            var url = '';
            if (Config.drawNonWinningSmboxEnabled) {
                var nonWinningMatches = html.match(/\d+(?=&safeid=)/gi);
                var nonWinningArr = [];
                for (var i = 1; i <= 400; i++) {
                    if ($.inArray(i.toString(), nonWinningMatches) === -1) {
                        nonWinningArr.push(i);
                        for (var j in Config.favorSmboxNumbers) {
                            if (i === Config.favorSmboxNumbers[j]) {
                                smboxNumber = i;
                                break;
                            }
                        }
                        if (smboxNumber > 0) break;
                    }
                }
                if (nonWinningArr.length > 0) {
                    if (!smboxNumber) {
                        smboxNumber = nonWinningArr[Math.floor(Math.random() * nonWinningArr.length)];
                    }
                    var safeIdMatches = html.match(/&safeid=(\w+)/i);
                    if (!safeIdMatches) return;
                    url = 'kf_smbox.php?box={0}&safeid={1}'.replace('{0}', smboxNumber).replace('{1}', safeIdMatches[1]);
                }
                else {
                    Tools.setCookie(Config.drawSmboxCookieName, 1, Tools.getDate('+15m'));
                    return;
                }
            }
            else {
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
            }
            $.get(url, function (html) {
                Tools.setCookie(Config.drawSmboxCookieName, 1, Tools.getDate('+' + Config.defDrawSmboxInterval + 'm'));
                KFOL.showFormatLog('抽取神秘盒子', html);
                if (isAutoDrawItemOrCard) KFOL.drawItemOrCard();
                if (isAutoDonation) {
                    window.setTimeout(KFOL.donation, 2000);
                }
                var kfbRegex = /获得了(\d+)KFB的奖励.*(\d+\|\d+)/i;
                var smRegex = /获得本轮的头奖/i;
                var msg = '<strong>抽取神秘盒子[<em>No.{0}</em>]</strong>'.replace('{0}', smboxNumber);
                if (kfbRegex.test(html)) {
                    var matches = kfbRegex.exec(html);
                    msg += '<i>KFB<em>+{0}</em></i><i class="pd_notice">({1})</i>'
                        .replace('{0}', matches[1])
                        .replace('{1}', matches[2]);
                }
                else if (smRegex.test(html)) {
                    msg += '<i class="pd_highlight" style="font-weight:bold">神秘<em>+1</em></i><a target="_blank" href="kf_smbox.php">查看头奖</a>';
                }
                else {
                    return;
                }
                KFOL.showMsg(msg);
                if (KFOL.isInHomePage) {
                    $('a[href="kf_smbox.php"].indbox5').removeClass('indbox5').addClass('indbox6');
                }
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
            Tools.setCookie(Config.drawItemOrCardCookieName, 1, Tools.getDate('+' + Config.defDrawItemOrCardInterval + 'm'));
            KFOL.showFormatLog('抽取道具或卡片', html);
            var itemRegex = /<a href="(kf_fw_ig_my\.php\?pro=\d+)">/i;
            var cardRegex = /<a href="(kf_fw_card_my\.php\?id=\d+)">/i;
            var msg = '<strong>抽取道具{0}</strong>'.replace('{0}', Config.autoDrawItemOrCardType === 2 ? '' : '或卡片');
            var matches = null;
            var type = 0;
            if (itemRegex.test(html)) {
                type = 1;
                matches = itemRegex.exec(html);
                msg += '<i>道具<em>+1</em></i><a target="_blank" href="{0}">查看道具</a>'
                    .replace('{0}', matches[1]);
            }
            else if (cardRegex.test(html)) {
                type = 2;
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
            if (KFOL.isInHomePage) {
                $('a[href="kf_fw_ig_one.php"].indbox5').removeClass('indbox5').addClass('indbox6');
            }
            if (type === 2) {
                if (!Config.autoConvertCardToVipTimeEnabled) return;
                var cardMatches = /id=(\d+)/i.exec(matches[1]);
                if (!cardMatches) return;
                Tools.setCookie(Config.convertCardToVipTimeCookieName, cardMatches[1], Tools.getDate('+1d'));
                Card.convertCardToVipTime(cardMatches[1]);
            }
        }, 'html');
    },

    /**
     * 获取定时刷新的最小间隔时间（秒）
     * @param {number} drawSmboxInterval 神秘盒子抽奖间隔（分钟）
     * @param {number} drawItemOrCardInterval 道具或卡片抽奖间隔（分钟）
     * @returns {number} 定时刷新的最小间隔时间（秒）
     */
    getMinRefreshInterval: function (drawSmboxInterval, drawItemOrCardInterval) {
        var donationInterval = -1;
        if (Config.autoDonationEnabled) {
            var donationTime = Tools.getDateByTime(Config.donationAfterTime);
            var now = new Date();
            if (!Tools.getCookie(Config.donationCookieName) && now <= donationTime) {
                donationInterval = parseInt((donationTime - now) / 1000);
            }
            else {
                donationTime.setDate(donationTime.getDate() + 1);
                donationInterval = parseInt((donationTime - now) / 1000);
            }
        }
        if (Config.autoDrawSmboxEnabled) {
            drawSmboxInterval *= 60;
            drawSmboxInterval = drawSmboxInterval === 0 ? Config.drawSmboxCompleteRefreshInterval : drawSmboxInterval;
        }
        else drawSmboxInterval = -1;
        if (Config.autoDrawItemOrCardEnabled) {
            drawItemOrCardInterval *= 60;
            drawItemOrCardInterval = drawItemOrCardInterval === 0 ? Config.defDrawItemOrCardInterval * 60 : drawItemOrCardInterval;
        }
        else drawItemOrCardInterval = -1;
        var minArr = [donationInterval, drawSmboxInterval, drawItemOrCardInterval];
        minArr.sort(function (a, b) {
            return a > b;
        });
        var min = -1;
        for (var i in minArr) {
            if (minArr[i] > -1) {
                min = minArr[i];
                break;
            }
        }
        if (min === -1) return -1;
        else return min === Config.drawSmboxCompleteRefreshInterval ? min : min + 60;
    },

    /**
     * 启动定时模式
     */
    startAutoRefreshMode: function () {
        var minutes = KFOL.getDrawSmboxAndItemOrCardRemainTime();
        var interval = KFOL.getMinRefreshInterval(minutes[0], minutes[1]);
        if (interval === -1) return;
        var title = document.title;
        var titleInterval = null;
        var showRefreshModeTips = function (interval, isShowTitle) {
            if (titleInterval) window.clearInterval(titleInterval);
            var showInterval = interval === Config.drawSmboxCompleteRefreshInterval ? interval : parseInt(interval / 60);
            var unit = interval === Config.drawSmboxCompleteRefreshInterval ? '秒' : '分钟';
            console.log('下一次刷新间隔为：{0}{1}'
                    .replace('{0}', showInterval)
                    .replace('{1}', unit)
            );
            if (Config.showRefreshModeTipsType.toLowerCase() !== 'never') {
                var showIntervalTitle = function () {
                    document.title = '{0} (定时模式：{1}{2})'
                        .replace('{0}', title)
                        .replace('{1}', showInterval)
                        .replace('{2}', unit);
                    showInterval -= 1;
                };
                if (isShowTitle || Config.showRefreshModeTipsType.toLowerCase() === 'always' ||
                    interval === Config.drawSmboxCompleteRefreshInterval)
                    showIntervalTitle();
                else showInterval -= 1;
                titleInterval = window.setInterval(showIntervalTitle, Config.showRefreshModeTipsInterval * 60 * 1000);
            }
        };
        var removeRefreshNotice = function () {
            var $refreshNotice = $('.pd_refresh_notice').parent();
            if ($refreshNotice.length > 0) {
                KFOL.removePopTips($refreshNotice);
            }
        };
        var handleError = function (XMLHttpRequest, textStatus) {
            console.log('获取剩余抽奖时间失败，错误信息：' + textStatus);
            removeRefreshNotice();
            KFOL.showMsg('<span class="pd_refresh_notice">获取剩余抽奖时间失败，将在<em>{0}</em>分钟后重试...</span>'
                    .replace('{0}', Config.errorRefreshInterval)
                , -1);
            window.setTimeout(checkRefreshInterval, Config.errorRefreshInterval * 60 * 1000);
            showRefreshModeTips(Config.errorRefreshInterval * 60, true);
        };
        var checkRefreshInterval = function () {
            removeRefreshNotice();
            KFOL.showWaitMsg('<span class="pd_refresh_notice">正在获取抽奖剩余时间...</span>');
            $.ajax({
                url: 'index.php',
                dataType: 'html',
                success: function (html) {
                    removeRefreshNotice();
                    var drawSmboxInterval = -1, drawItemOrCardInterval = -1;
                    var matches = /<a href="kf_smbox\.php".+?>神秘盒子\(剩余(\d+)分钟\)<\/a>/.exec(html);
                    if (matches) {
                        drawSmboxInterval = parseInt(matches[1]);
                    }
                    else if (/<a href="kf_smbox\.php".+?>神秘盒子\(现在可以抽取\)<\/a>/.test(html)) {
                        drawSmboxInterval = 0;
                    }
                    matches = /<a href="kf_fw_ig_one\.php".+?>道具卡片\(剩余(\d+)分钟\)<\/a>/.exec(html);
                    if (matches) {
                        drawItemOrCardInterval = parseInt(matches[1]);
                    }
                    else if (/<a href="kf_fw_ig_one\.php".+?>道具卡片\(现在可以抽取\)<\/a>/.test(html)) {
                        drawItemOrCardInterval = 0;
                    }
                    if (drawSmboxInterval === -1 || drawItemOrCardInterval === -1) {
                        handleError();
                        return;
                    }
                    var isDrawSmboxStarted = false;
                    var autoDrawItemOrCardAvailable = Config.autoDrawItemOrCardEnabled && drawItemOrCardInterval === 0;
                    var autoDonationAvailable = Config.autoDonationEnabled && !Tools.getCookie(Config.donationCookieName);
                    if (Config.autoDrawSmboxEnabled && drawSmboxInterval === 0) {
                        isDrawSmboxStarted = true;
                        KFOL.drawSmbox(autoDrawItemOrCardAvailable, autoDonationAvailable);
                    }
                    if (autoDrawItemOrCardAvailable && !isDrawSmboxStarted) {
                        KFOL.drawItemOrCard();
                    }
                    if (autoDonationAvailable && !isDrawSmboxStarted) {
                        KFOL.donation();
                    }
                    var interval = KFOL.getMinRefreshInterval(drawSmboxInterval, drawItemOrCardInterval);
                    if (interval === -1) {
                        if (titleInterval) window.clearInterval(titleInterval);
                        return;
                    }
                    window.setTimeout(checkRefreshInterval, interval * 1000);
                    showRefreshModeTips(interval, true);
                },
                error: handleError
            });
        };
        window.setTimeout(checkRefreshInterval, interval * 1000);
        showRefreshModeTips(interval);
    },

    /**
     * 获取用户的SafeID
     */
    getSafeId: function () {
        var matches = /safeid=(\w+)/i.exec($('a[href*="safeid="]').attr('href'));
        if (!matches) return '';
        else return matches[1];
    },

    /**
     * 添加设置对话框的链接
     */
    addConfigDialogLink: function () {
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
        var minutes = KFOL.getDrawSmboxAndItemOrCardRemainTime();
        if (parseInt(Tools.getCookie(Config.drawSmboxCookieName)) === 1) {
            if (minutes[0] > 0) {
                Tools.setCookie(Config.drawSmboxCookieName, 2, Tools.getDate('+' + (minutes[0] + 1) + 'm'));
            }
        }
        if (parseInt(Tools.getCookie(Config.drawItemOrCardCookieName)) === 1) {
            if (minutes[1] > 0) {
                Tools.setCookie(Config.drawItemOrCardCookieName, 2, Tools.getDate('+' + (minutes[1] + 1) + 'm'));
            }
        }
    },

    /**
     * 获取首页上显示的神秘盒子及道具卡片的抽奖剩余时间（分钟）
     * @returns {Array} 首页上显示的神秘盒子及道具卡片的抽奖剩余时间（分钟），[0]：神秘盒子剩余时间；[1]：道具或卡片剩余时间
     */
    getDrawSmboxAndItemOrCardRemainTime: function () {
        var minutes = [];
        var matches = /神秘盒子\(剩余(\d+)分钟\)/.exec($('a[href="kf_smbox.php"]:contains("神秘盒子(剩余")').text());
        if (matches) minutes.push(parseInt(matches[1]));
        else minutes.push(0);
        matches = /道具卡片\(剩余(\d+)分钟\)/.exec($('a[href="kf_fw_ig_one.php"]:contains("道具卡片(剩余")').text());
        if (matches) minutes.push(parseInt(matches[1]));
        else minutes.push(0);
        return minutes;
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
                Tools.setCookie(Config.hideMarkReadAtTipsCookieName,
                    atTipsText,
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
     * 高亮首页VIP会员提示
     */
    highlightVipTips: function () {
        $('a[href="kf_vmember.php"]:contains("VIP会员(剩余")').removeClass('indbox6').addClass('indbox5');
    },

    /**
     * 为帖子里的每个楼层添加跳转链接
     */
    addFloorGotoLink: function () {
        $('.readlou > div:nth-child(2) > span').each(function () {
            var $this = $(this);
            var floorText = $this.text();
            if (!/^\d+楼$/.test(floorText)) return;
            var linkName = $this.closest('.readlou').prev().attr('name');
            if (!linkName || !/^\d+$/.test(linkName)) return;
            var url = '{0}read.php?tid={1}&spid={2}'
                .replace('{0}', Tools.getHostNameUrl())
                .replace('{1}', Tools.getUrlParam('tid'))
                .replace('{2}', linkName);
            $this.html('<a class="pd_goto_link" href="{0}">{1}</a>'.replace('{0}', url).replace('{1}', floorText));
            $this.find('a').click(function (event) {
                event.preventDefault();
                window.prompt('本楼的跳转链接（请按Ctrl+C复制）：', url);
            });
        });
    },

    /**
     * 添加快速跳转到指定楼层的输入框
     */
    addFastGotoFloorInput: function () {
        $('<form><li class="pd_fast_goto_floor">电梯直达 <input class="pd_input" style="width:35px" type="text" maxlength="8" /> ' +
        '<span>楼</span></li></form>')
            .prependTo('.readlou:eq(0) > div:first-child > ul')
            .submit(function (event) {
                event.preventDefault();
                var floor = parseInt($.trim($(this).find('input').val()));
                if (!floor || floor <= 0) return;
                location.href = '{0}read.php?tid={1}&page={2}&floor={3}'
                    .replace('{0}', Tools.getHostNameUrl)
                    .replace('{1}', Tools.getUrlParam('tid'))
                    .replace('{2}', parseInt(floor / Config.perPageFloorNum) + 1)
                    .replace('{3}', floor);
            })
            .find('span')
            .click(function () {
                $(this).closest('form').submit();
            })
            .end()
            .closest('div').next()
            .css({'max-width': '530px', 'white-space': 'nowrap', 'overflow': 'hidden', 'text-overflow': 'ellipsis'});

    },

    /**
     * 将页面滚动到指定楼层
     */
    fastGotoFloor: function () {
        var floor = parseInt(Tools.getUrlParam('floor'));
        if (!floor || floor <= 0) return;
        var $floorNode = $('.readlou > div:nth-child(2) > span:contains("{0}楼")'.replace('{0}', floor));
        if ($floorNode.length == 0) return;
        var linkName = $floorNode.closest('.readlou').prev().attr('name');
        if (!linkName || !/^\d+$/.test(linkName)) return;
        location.hash = '#' + linkName;
    },

    /**
     * 添加快速跳转到指定页数的输入框
     */
    addFastGotoPageInput: function () {
        $('<li class="pd_fast_goto_page">跳至 <input class="pd_input" style="width:30px" type="text" maxlength="8" /> <span>页</span></li>')
            .appendTo('table > tbody > tr > td > div > ul.pages')
            .find('span')
            .click(function () {
                var page = parseInt($.trim($(this).prev('input').val()));
                if (!page || page <= 0) return;
                var fpage = parseInt(Tools.getUrlParam('fpage'));
                location.href = '{0}read.php?tid={1}&page={2}{3}'
                    .replace('{0}', Tools.getHostNameUrl)
                    .replace('{1}', Tools.getUrlParam('tid'))
                    .replace('{2}', page)
                    .replace('{3}', fpage ? '&fpage=' + fpage : '');
            })
            .end()
            .find('input')
            .keydown(function (event) {
                if (event.key === 'Enter') {
                    $(this).next('span').click();
                    return false;
                }
            });
    },

    /**
     * 高亮今日新发表帖子的发表时间
     */
    highlightNewPost: function () {
        $('.thread1 > tbody > tr > td:last-child').has('a.bl').each(function () {
            var html = $(this).html();
            if (/\|\s*\d{2}:\d{2}<br>\n.*\d{2}:\d{2}/.test(html)) {
                html = html.replace(/(\d{2}:\d{2})<br>/, '<span class="pd_highlight">$1</span><br />');
                $(this).html(html);
            }
        });
    },

    /**
     * 自定义本人的神秘颜色
     */
    customMySmColor: function () {
        if (!Config.customMySmColor) return;
        var my = $('.readidmsbottom > a[href="profile.php?action=show&uid={0}"]'.replace('{0}', KFOL.uid));
        if (my.length == 0) my = $('.readidmleft > a[href="profile.php?action=show&uid={0}"]'.replace('{0}', KFOL.uid));
        else my.css('color', Config.customMySmColor);
        my.closest('.readtext').css('border-color', Config.customMySmColor)
            .prev('.readlou').css('border-color', Config.customMySmColor)
            .next().next('.readlou').css('border-color', Config.customMySmColor);
    },

    /**
     * 初始化
     */
    init: function () {
        if (typeof jQuery === 'undefined') return;
        var startDate = new Date();
        console.log('KF Online助手启动');
        if (location.pathname === '/' || location.pathname === '/index.php')
            KFOL.isInHomePage = true;
        ConfigDialog.init();
        if (location.pathname === '/read.php') {
            KFOL.fastGotoFloor();
            KFOL.addFloorGotoLink();
            KFOL.addFastGotoFloorInput();
            //KFOL.addFastGotoPageInput();
        }
        else if (location.pathname === '/thread.php') {
            if (Config.highlightNewPostEnabled) KFOL.highlightNewPost();
        }
        KFOL.getUidAndUserName();
        if (!KFOL.uid) return;
        KFOL.appendCss();
        KFOL.addConfigDialogLink();

        if (KFOL.isInHomePage) {
            KFOL.adjustCookiesExpires();
            if (Config.hideMarkReadAtTipsEnabled) KFOL.handleMarkReadAtTips();
            if (Config.highlightVipEnabled) KFOL.highlightVipTips();
        }

        var isDrawSmboxStarted = false;
        var autoDrawItemOrCardAvailable = Config.autoDrawItemOrCardEnabled &&
            (KFOL.isInHomePage ? $('a[href="kf_fw_ig_one.php"]:contains("道具卡片(现在可以抽取)")').length > 0 :
                !Tools.getCookie(Config.drawItemOrCardCookieName)
            );
        var autoDonationAvailable = Config.autoDonationEnabled && !Tools.getCookie(Config.donationCookieName);
        if (Config.autoDrawSmboxEnabled) {
            if (KFOL.isInHomePage ? $('a[href="kf_smbox.php"]:contains("神秘盒子(现在可以抽取)")').length > 0 :
                    !Tools.getCookie(Config.drawSmboxCookieName)
            ) {
                isDrawSmboxStarted = true;
                KFOL.drawSmbox(autoDrawItemOrCardAvailable, autoDonationAvailable);
            }
        }

        if (autoDrawItemOrCardAvailable && !isDrawSmboxStarted) {
            KFOL.drawItemOrCard();
        }

        if (Config.autoDrawItemOrCardEnabled && Config.autoConvertCardToVipTimeEnabled) {
            var cardId = parseInt(Tools.getCookie(Config.convertCardToVipTimeCookieName));
            if (cardId > 0) Card.convertCardToVipTime(cardId);
        }

        if (autoDonationAvailable && !isDrawSmboxStarted) {
            KFOL.donation();
        }

        if (/\/kf_fw_ig_renew\.php$/i.test(location.href)) {
            Item.addConvertAllItemsToEnergyLink();
        }
        else if (/\/kf_fw_ig_renew\.php\?lv=\d+$/i.test(location.href)) {
            Item.addConvertEnergyAndRestoreItemsButton();
        }
        else if (/\/kf_fw_ig_my\.php\?lv=\d+$/i.test(location.href)) {
            Item.addUseItemsButton();
        }
        else if (location.pathname === '/kf_fw_ig_smone.php') {
            Item.addBatchDrawSmButton();
        }
        else if (location.pathname === '/read.php') {
            KFOL.customMySmColor();
        }
        else if (/\/hack\.php\?H_name=bank/i.test(location.href)) {
            Bank.addBatchTransferButton();
        }

        if (Config.autoRefreshEnabled) {
            if (KFOL.isInHomePage) KFOL.startAutoRefreshMode();
        }
        var endDate = new Date();
        console.log('KF Online助手加载完毕，加载耗时：{0}ms'.replace('{0}', endDate - startDate));
    }
};

KFOL.init();