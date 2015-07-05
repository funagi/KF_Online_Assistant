// ==UserScript==
// @name        KF Online助手
// @namespace   https://greasyfork.org/users/4514
// @icon        https://raw.githubusercontent.com/miaolapd/KF_Online_Assistant/master/icon.png
// @author      喵拉布丁
// @homepage    https://greasyfork.org/scripts/8615
// @description KF Online必备！可在绯月Galgame上自动领取争夺奖励、抽取神秘盒子以及KFB捐款，并可使用各种便利的辅助功能，更多功能开发中……
// @include     http://2dgal.com/*
// @include     http://*.2dgal.com/*
// @include     http://9baka.com/*
// @include     http://*.9baka.com/*
// @version     3.8.0-dev
// @grant       none
// @run-at      document-end
// @license     MIT
// ==/UserScript==
// 版本号
var version = '3.8.0';
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
    // 是否自动领取争夺奖励，true：开启；false：关闭
    autoGetLootAwardEnabled: false,
    // 批量攻击的目标列表，格式：{攻击ID:次数}，例：{1:10,2:20}
    batchAttackList: {},
    // 是否自动抽取神秘盒子，true：开启；false：关闭
    autoDrawSmbox2Enabled: false,
    // 偏好的神秘盒子数字，例：[52,1,28,400]（以英文逗号分隔，按优先级排序），如设定的数字都不可用，则从剩余的盒子中随机抽选一个，如无需求可留空
    favorSmboxNumbers: [],
    // 是否开启定时模式（开启定时模式后需停留在首页），true：开启；false：关闭
    autoRefreshEnabled: false,
    // 在首页的网页标题上显示定时模式提示的方案，auto：停留一分钟后显示；always：总是显示；never：不显示
    showRefreshModeTipsType: 'auto',
    // 对首页上的有人@你的消息框进行处理的方案，no_highlight_1：取消已读提醒高亮，并在无提醒时补上消息框；no_highlight_2：取消已读提醒高亮；
    // hide_box_1：不显示已读提醒的消息框；hide_box_2：永不显示消息框；default：保持默认；at_change_to_cao：将@改为艹(其他和方式1相同)
    atTipsHandleType: 'no_highlight_1',
    // 是否在无VIP时去除首页的VIP标识高亮，true：开启；false：关闭
    hideNoneVipEnabled: true,
    // 是否在神秘等级升级后进行提醒，只在首页生效，true：开启；false：关闭
    smLevelUpAlertEnabled: false,
    // 在首页帖子链接旁显示快速跳转至页末的链接，true：开启；false：关闭
    homePageThreadFastGotoLinkEnabled: true,
    // 是否在帖子列表页面中显示帖子页数快捷链接，true：开启；false：关闭
    showFastGotoThreadPageEnabled: false,
    // 在帖子页数快捷链接中显示页数链接的最大数量
    maxFastGotoThreadPageNum: 5,
    // 帖子每页楼层数量，用于电梯直达和帖子页数快捷链接功能，如果修改了KF设置里的“文章列表每页个数”，请在此修改成相同的数目
    perPageFloorNum: 10,
    // 是否在帖子列表中高亮今日新发表帖子的发表时间，true：开启；false：关闭
    highlightNewPostEnabled: true,
    // 是否调整帖子内容宽度，使其保持一致，true：开启；false：关闭
    adjustThreadContentWidthEnabled: false,
    // 帖子内容字体大小，留空表示使用默认大小，推荐值：14
    threadContentFontSize: 0,
    // 自定义本人的神秘颜色（包括帖子页面的ID显示颜色和楼层边框颜色，仅自己可见），例：#009CFF，如无需求可留空
    customMySmColor: '',
    // 是否开启自定义各等级神秘颜色的功能，（包括帖子页面的ID显示颜色和楼层边框颜色，仅自己可见），true：开启；false：关闭
    customSmColorEnabled: false,
    // 自定义各等级神秘颜色的设置列表，例：[{min:'50',max:'100',color:'#009CFF'},{min:'800',max:'MAX',color:'#FF0000'}]
    customSmColorConfigList: [],
    // 是否将帖子中的绯月其它域名的链接修改为当前域名，true：开启；false：关闭
    modifyKFOtherDomainEnabled: false,
    // 是否在帖子页面开启多重回复和多重引用的功能，true：开启；false：关闭
    multiQuoteEnabled: true,
    // 是否在帖子页面开启批量购买帖子的功能，true：开启；false：关闭
    batchBuyThreadEnabled: true,
    // 默认提示消息的持续时间（秒）
    defShowMsgDuration: 10,
    // 日志保存天数
    logSaveDays: 10,
    // 在页面上方显示助手日志的链接，true：开启；false：关闭
    showLogLinkInPageEnabled: true,
    // 日志内容的排序方式，time：按时间顺序排序；type：按日志类别排序
    logSortType: 'time',
    // 日志统计范围类型，cur：显示当天统计结果；custom：显示距该日N天内的统计结果；all：显示全部统计结果
    logStatType: 'cur',
    // 显示距该日N天内的统计结果（用于日志统计范围）
    logStatDays: 7,
    // 是否为侧边栏添加快捷导航的链接，true：开启；false：关闭
    addSideBarFastNavEnabled: false,
    // 是否将侧边栏修改为和手机相同的平铺样式，true：开启；false：关闭
    modifySideBarEnabled: false,
    // 是否开启关注用户的功能，true：开启；false：关闭
    followUserEnabled: false,
    // 关注用户列表，例：['张三','李四','王五']
    followUserList: [],
    // 是否高亮所关注用户的首页帖子链接，true：开启；false：关闭
    highlightFollowUserThreadInHPEnabled: true,
    // 是否开启屏蔽用户的功能，true：开启；false：关闭
    blockUserEnabled: false,
    // 屏蔽用户列表，例：['张三','李四','王五']
    blockUserList: [],
    // 是否在当前收入满足指定额度之后自动将指定数额存入活期存款中，只会在首页触发，true：开启；false：关闭
    autoSaveCurrentDepositEnabled: false,
    // 在当前收入已满指定KFB额度之后自动进行活期存款，例：1000
    saveCurrentDepositAfterKfb: 0,
    // 将指定额度的KFB存入活期存款中，例：900；举例：设定已满1000存900，当前收入为2000，则自动存入金额为1800
    saveCurrentDepositKfb: 0,

    /* 以下设置如非必要请勿修改： */
    // KFB捐款额度的最大值
    maxDonationKfb: 5000,
    // 争夺的默认领取间隔（分钟）
    defLootInterval: 720,
    // 每回合攻击的最大次数
    maxAttackNum: 20,
    // 神秘盒子的默认抽奖间隔（分钟）
    defDrawSmboxInterval: 300,
    // 抽取神秘盒子完成后的再刷新间隔（秒），用于在定时模式中进行判断，并非是定时模式的实际间隔时间
    drawSmboxCompleteRefreshInterval: 20,
    // 获取剩余抽奖时间失败后的重试间隔（分钟），用于定时模式
    errorRefreshInterval: 1,
    // 在网页标题上显示定时模式提示的更新间隔（分钟）
    showRefreshModeTipsInterval: 1,
    // 标记已去除首页已读at高亮提示的Cookie有效期（天）
    hideMarkReadAtTipsExpires: 3,
    // ajax请求的默认间隔时间（毫秒）
    defAjaxInterval: 200,
    // 购买帖子提醒的最低售价（KFB）
    minBuyThreadWarningSell: 6,
    // 存储多重引用数据的LocalStorage名称
    multiQuoteStorageName: 'pd_multi_quote',
    // 领取争夺奖励临时日志名称
    getLootAwardTmpLogName: 'GetLootAward',
    // 标记已KFB捐款的Cookie名称
    donationCookieName: 'pd_donation',
    // 标记已领取争夺奖励的Cookie名称
    getLootAwardCookieName: 'pd_get_loot_award',
    // 标记已抽取神秘盒子的Cookie名称
    drawSmboxCookieName: 'pd_draw_smbox',
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
     * 获取指定Date对象的日期字符串
     * @param {?Date} [date] 指定Date对象，留空表示现在
     * @param {string} [separator='-'] 分隔符，留空表示使用“-”作为分隔符
     * @returns {string} 日期字符串
     */
    getDateString: function (date, separator) {
        date = date ? date : new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        return '{0}{3}{1}{3}{2}'
            .replace('{0}', date.getFullYear())
            .replace('{1}', month < 10 ? '0' + month : month)
            .replace('{2}', day < 10 ? '0' + day : day)
            .replace(/\{3\}/g, typeof separator !== 'undefined' ? separator : '-');
    },

    /**
     * 获取指定Date对象的时间字符串
     * @param {?Date} [date] 指定Date对象，留空表示现在
     * @param {string} [separator=':'] 分隔符，留空表示使用“:”作为分隔符
     * @param {boolean} [isShowSecond=true] 是否显示秒钟
     * @returns {string} 时间字符串
     */
    getTimeString: function (date, separator, isShowSecond) {
        date = date ? date : new Date();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var sep = typeof separator !== 'undefined' ? separator : ':';
        isShowSecond = $.type(isShowSecond) === 'boolean' ? isShowSecond : true;
        return '{0}{3}{1}{4}{2}'
            .replace('{0}', hour < 10 ? '0' + hour : hour)
            .replace('{1}', minute < 10 ? '0' + minute : minute)
            .replace('{2}', isShowSecond ? (second < 10 ? '0' + second : second) : '')
            .replace('{3}', sep)
            .replace('{4}', isShowSecond ? sep : '');
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
    },

    /**
     * 获取经过GBK编码后的字符串
     * @param {string} str 待编码的字符串
     * @returns {string} 经过GBK编码后的字符串
     */
    getGBKEncodeString: function (str) {
        var img = $('<img />').appendTo('body').get(0);
        img.src = 'nothing?sp=' + str;
        var encodeStr = img.src.split('nothing?sp=').pop();
        $(img).remove();
        return encodeStr;
    },

    /**
     * HTML转义编码
     * @param {string} str 待编码的字符串
     * @returns {string} 编码后的字符串
     */
    htmlEncode: function (str) {
        if (str.length === 0) return '';
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/ /g, '&nbsp;')
            .replace(/\'/g, '&#39;')
            .replace(/\"/g, '&quot;')
            .replace(/\n/g, '<br/>');
    },

    /**
     * HTML转义解码
     * @param {string} str 待解码的字符串
     * @returns {string} 解码后的字符串
     */
    htmlDecode: function (str) {
        if (str.length === 0) return '';
        return str.replace(/<br\/?>/gi, '\n')
            .replace(/&quot;/gi, '\"')
            .replace(/&#39;/gi, '\'')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&gt;/gi, '>')
            .replace(/&lt;/gi, '<')
            .replace(/&amp;/gi, '&');
    },

    /**
     * 关闭对话框
     * @param {string} boxId 对话框ID
     * @returns {boolean} 返回false
     */
    close: function (boxId) {
        $('#' + boxId).fadeOut('fast', function () {
            $(this).parent('form').remove();
        });
        $(window).off('resize.' + boxId);
        return false;
    },

    /**
     * 调整对话框的位置和大小
     * @param {string} boxId 对话框ID
     */
    resize: function (boxId) {
        var $box = $('#' + boxId);
        if ($box.length === 0) return;
        $box.find('.pd_cfg_main').css('max-height', $(window).height() - 80);
        $box.css('top', $(window).height() / 2 - $box.height() / 2)
            .css('left', $(window).width() / 2 - $box.width() / 2)
            .fadeIn('fast');
    },

    /**
     * 按Esc键关闭对话框
     * @param {string} boxId 对话框ID
     */
    escKeydown: function (boxId) {
        $('#' + boxId).keydown(function (event) {
            if (event.keyCode === 27) {
                return Tools.close(boxId);
            }
        });
    },

    /**
     * 获取指定对象的关键字列表
     * @param {Object} obj 指定对象
     * @param {number} [sortBy] 是否排序，0：不排序；1：升序；-1：降序
     * @returns {string[]} 关键字列表
     */
    getObjectKeyList: function (obj, sortBy) {
        var list = [];
        if ($.type(obj) !== 'object') return list;
        for (var key in obj) {
            list.push(key);
        }
        if (sortBy != 0) {
            list.sort(function (a, b) {
                return sortBy > 0 ? a > b : a < b;
            });
        }
        return list;
    },

    /**
     * 获取经过格式化的统计数字字符串
     * @param {number} num 待处理的数字
     * @returns {string} 经过格式化的数字字符串
     */
    getStatFormatNumber: function (num) {
        var result = '';
        if (num >= 0) result = '<em>+{0}</em>'.replace('{0}', num.toLocaleString());
        else result = '<ins>{0}</ins>'.replace('{0}', num.toLocaleString());
        return result;
    },

    /**
     * 检测浏览器是否为Opera
     * @returns {boolean} 是否为Opera
     */
    isOpera: function () {
        return typeof window.opera !== 'undefined';
    },

    /**
     * 比较神秘等级高低
     * @param {string} a
     * @param {string} b
     * @returns {number} 比较结果，-1：a小于b；0：a等于b；1：a大于b
     */
    compareSmLevel: function (a, b) {
        var x = a.toUpperCase() === 'MAX' ? 99999999 : parseInt(a);
        var y = b.toUpperCase() === 'MAX' ? 99999999 : parseInt(b);
        if (x > y) return 1;
        else if (x < y) return -1;
        else return 0;
    }
};

/**
 * 设置对话框类
 */
var ConfigDialog = {
    // 保存设置的键值名称
    name: 'pd_config',
    // 默认的Config对象
    defConfig: {},

    /**
     * 初始化
     */
    init: function () {
        $.extend(true, ConfigDialog.defConfig, Config);
        ConfigDialog.read();
    },

    /**
     * 显示设置对话框
     */
    show: function () {
        if ($('#pd_config').length > 0) return;
        ConfigDialog.read();
        var html =
            '<form>' +
            '<div id="pd_config" class="pd_cfg_box">' +
            '  <h1>KF Online助手设置<span>&times;</span></h1>' +
            '  <div class="pd_cfg_main">' +
            '    <div class="pd_cfg_nav"><a href="#">查看日志</a><a href="#">导入/导出设置</a></div>' +
            '    <div class="pd_cfg_panel">' +
            '      <fieldset>' +
            '        <legend><label><input id="pd_cfg_auto_donation_enabled" type="checkbox" />自动KFB捐款</label></legend>' +
            '        <label>KFB捐款额度<input id="pd_cfg_donation_kfb" maxlength="4" style="width:32px" type="text" />' +
            '<a class="pd_cfg_tips" href="#" title="取值范围在1-5000的整数之间；可设置为百分比，表示捐款额度为当前收入的百分比（最多不超过5000KFB），例：80%">[?]</a></label>' +
            '        <label style="margin-left:10px">在<input id="pd_cfg_donation_after_time" maxlength="8" style="width:55px" type="text" />' +
            '之后捐款 <a class="pd_cfg_tips" href="#" title="在当天的指定时间之后捐款（24小时制），例：22:30:00（注意不要设置得太接近零点，以免错过捐款）">[?]</a></label><br />' +
            '        <label><input id="pd_cfg_donation_after_vip_enabled" type="checkbox" />在获得VIP后才进行捐款 ' +
            '<a class="pd_cfg_tips" href="#" title="在获得VIP资格后才进行捐款，如开启此选项，将只能在首页进行捐款">[?]</a></label>' +
            '      </fieldset>' +
            '      <fieldset>' +
            '        <legend><label>争夺相关</legend>' +
            '        <label><input id="pd_cfg_auto_get_loot_award_enabled" type="checkbox" />自动领取争夺奖励 ' +
            '<a class="pd_cfg_tips" href="#" title="自动领取争夺奖励，请注意及时打怪">[?]</a></label>' +
            '      </fieldset>' +
            '      <fieldset>' +
            '        <legend><label><input id="pd_cfg_auto_draw_smbox_enabled" type="checkbox" />自动抽取神秘盒子 ' +
            '<a class="pd_cfg_tips" href="#" title="注意：抽取神秘盒子将延长争夺奖励的领取时间">[?]</a></label></legend>' +
            '        <label>偏好的神秘盒子数字<input placeholder="例: 52,1,28,400" id="pd_cfg_favor_smbox_numbers" style="width:180px" type="text" />' +
            '<a class="pd_cfg_tips" href="#" title="例：52,1,28,400（以英文逗号分隔，按优先级排序），如设定的数字都不可用，则从剩余的盒子中随机抽选一个，如无需求可留空">' +
            '[?]</a></label>' +
            '      </fieldset>' +
            '      <fieldset>' +
            '        <legend>首页相关</legend>' +
            '        <label>@提醒<select id="pd_cfg_at_tips_handle_type" style="width:130px"><option value="no_highlight_1">取消已读提醒高亮，并在无提醒时补上消息框</option>' +
            '<option value="no_highlight_2">取消已读提醒高亮</option><option value="hide_box_1">不显示已读提醒的消息框</option><option value="hide_box_2">永不显示消息框</option>' +
            '<option value="default">保持默认</option><option value="at_change_to_cao">将@改为艹(其他和方式1相同)</option></select>' +
            '<a class="pd_cfg_tips" href="#" title="对首页上的有人@你的消息框进行处理的方案">[?]</a></label>' +
            '        <label style="margin-left:10px"><input id="pd_cfg_hide_none_vip_enabled" type="checkbox" />无VIP时取消高亮 ' +
            '<a class="pd_cfg_tips" href="#" title="在无VIP时去除首页的VIP标识高亮">[?]</a></label><br />' +
            '        <label><input id="pd_cfg_sm_level_up_alert_enabled" type="checkbox" />神秘等级升级提醒 ' +
            '<a class="pd_cfg_tips" href="#" title="在神秘等级升级后进行提醒，只在首页生效">[?]</a></label>' +
            '        <label style="margin-left:10px"><input id="pd_cfg_home_page_thread_fast_goto_link_enabled" type="checkbox" />在首页帖子旁显示跳转链接 ' +
            '<a class="pd_cfg_tips" href="#" title="在首页帖子链接旁显示快速跳转至页末的链接">[?]</a></label>' +
            '      </fieldset>' +
            '      <fieldset>' +
            '        <legend>帖子列表页面相关</legend>' +
            '        <label><input id="pd_cfg_show_fast_goto_thread_page_enabled" type="checkbox" data-disabled="#pd_cfg_max_fast_goto_thread_page_num" />' +
            '显示帖子页数快捷链接 <a class="pd_cfg_tips" href="#" title="在帖子列表页面中显示帖子页数快捷链接">[?]</a></label>' +
            '        <label style="margin-left:10px">页数链接最大数量<input id="pd_cfg_max_fast_goto_thread_page_num" style="width:25px" maxlength="4" type="text" />' +
            '<a class="pd_cfg_tips" href="#" title="在帖子页数快捷链接中显示页数链接的最大数量">[?]</a></label><br />' +
            '        <label>帖子每页楼层数量<select id="pd_cfg_per_page_floor_num"><option value="10">10</option>' +
            '<option value="20">20</option><option value="30">30</option></select>' +
            '<a class="pd_cfg_tips" href="#" title="用于电梯直达和帖子页数快捷链接功能，如果修改了KF设置里的“文章列表每页个数”，请在此修改成相同的数目">[?]</a></label>' +
            '        <label style="margin-left:10px"><input id="pd_cfg_highlight_new_post_enabled" type="checkbox" />高亮今日的新帖 ' +
            '<a class="pd_cfg_tips" href="#" title="在帖子列表中高亮今日新发表帖子的发表时间">[?]</a></label>' +
            '      </fieldset>' +
            '      <fieldset>' +
            '        <legend>帖子页面相关</legend>' +
            '        <label><input id="pd_cfg_adjust_thread_content_width_enabled" type="checkbox" />调整帖子内容宽度 ' +
            '<a class="pd_cfg_tips" href="#" title="调整帖子内容宽度，使其保持一致">[?]</a></label>' +
            '        <label style="margin-left:10px">帖子内容字体大小<input id="pd_cfg_thread_content_font_size" maxlength="2" style="width:20px" type="text" />px ' +
            '<a class="pd_cfg_tips" href="#" title="帖子内容字体大小，留空表示使用默认大小，推荐值：14">[?]</a></label><br />' +
            '        <label>自定义本人的神秘颜色<input id="pd_cfg_custom_my_sm_color" maxlength="7" style="width:50px" type="text" />' +
            '<input style="margin-left:0" type="color" id="pd_cfg_custom_my_sm_color_select">' +
            '<a class="pd_cfg_tips" href="#" title="自定义本人的神秘颜色（包括帖子页面的ID显示颜色和楼层边框颜色，仅自己可见），例：#009CFF，如无需求可留空">[?]</a></label><br />' +
            '        <label><input id="pd_cfg_custom_sm_color_enabled" type="checkbox" />自定义各等级神秘颜色 ' +
            '<a class="pd_cfg_tips" href="#" title="自定义各等级神秘颜色（包括帖子页面的ID显示颜色和楼层边框颜色，仅自己可见），请点击详细设置自定义各等级颜色">[?]</a></label>' +
            '<a style="margin-left:10px" id="pd_cfg_custom_sm_color_config" href="#">详细设置&raquo;</a><br />' +
            '        <label><input id="pd_cfg_modify_kf_other_domain_enabled" type="checkbox" />将绯月其它域名的链接修改为当前域名 ' +
            '<a class="pd_cfg_tips" href="#" title="将帖子和短消息中的绯月其它域名的链接修改为当前域名">[?]</a></label><br />' +
            '        <label><input id="pd_cfg_multi_quote_enabled" type="checkbox" />开启多重引用功能 ' +
            '<a class="pd_cfg_tips" href="#" title="在帖子页面开启多重回复和多重引用功能">[?]</a></label>' +
            '        <label style="margin-left:10px"><input id="pd_cfg_batch_buy_thread_enabled" type="checkbox" />开启批量购买帖子功能 ' +
            '<a class="pd_cfg_tips" href="#" title="在帖子页面开启批量购买帖子的功能">[?]</a></label>' +
            '      </fieldset>' +
            '    </div>' +
            '    <div class="pd_cfg_panel">' +
            '      <fieldset>' +
            '        <legend>其它设置</legend>' +
            '        <label>默认提示消息的持续时间<input id="pd_cfg_def_show_msg_duration" maxlength="5" style="width:32px" type="text" />秒 ' +
            '<a class="pd_cfg_tips" href="#" title="设置为-1表示永久显示，默认值：10">[?]</a></label><br />' +
            '        <label>日志保存天数<input id="pd_cfg_log_save_days" maxlength="3" style="width:25px" type="text" />' +
            '<a class="pd_cfg_tips" href="#" title="默认值：10">[?]</a></label>' +
            '        <label style="margin-left:10px"><input id="pd_cfg_show_log_link_in_page_enabled" type="checkbox" />在页面上方显示日志链接 ' +
            '<a class="pd_cfg_tips" href="#" title="在论坛页面上方显示助手日志的链接">[?]</a></label><br />' +
            '        <label><input id="pd_cfg_add_side_bar_fast_nav_enabled" type="checkbox" />为侧边栏添加快捷导航 ' +
            '<a class="pd_cfg_tips" href="#" title="为侧边栏添加快捷导航的链接">[?]</a></label>' +
            '        <label style="margin-left:10px"><input id="pd_cfg_modify_side_bar_enabled" type="checkbox" />将侧边栏修改为平铺样式 ' +
            '<a class="pd_cfg_tips" href="#" title="将侧边栏修改为和手机相同的平铺样式">[?]</a></label>' +
            '      </fieldset>' +
            '      <fieldset>' +
            '        <legend><label><input id="pd_cfg_follow_user_enabled" type="checkbox" />关注用户 ' +
            '<a class="pd_cfg_tips" href="#" title="开启关注用户的功能，所关注的用户将被加注记号，可在下方或用户信息页面中添加或删除用户">[?]</a></label></legend>' +
            '        <div class="pd_cfg_user_list" id="pd_cfg_follow_user_list"></div>' +
            '        <label title="添加多个用户请用英文逗号分隔"><input style="width:200px" id="pd_cfg_add_follow_user" type="text" />' +
            '<a href="#">添加</a><a href="#" style="margin-left:7px">清除所有</a></label><br />' +
            '        <label><input id="pd_cfg_highlight_follow_user_thread_in_hp_enabled" type="checkbox" />高亮所关注用户的首页帖子链接 ' +
            '<a class="pd_cfg_tips" href="#" title="高亮所关注用户的首页帖子链接">[?]</a></label>' +
            '      </fieldset>' +
            '      <fieldset>' +
            '        <legend><label><input id="pd_cfg_block_user_enabled" type="checkbox" />屏蔽用户 ' +
            '<a class="pd_cfg_tips" href="#" title="开启屏蔽用户的功能，你将看不见所屏蔽用户的发言，可在下方或用户信息页面中添加或删除用户">[?]</a></label></legend>' +
            '        <div class="pd_cfg_user_list" id="pd_cfg_block_user_list"></div>' +
            '        <label title="添加多个用户请用英文逗号分隔"><input style="width:200px" id="pd_cfg_add_block_user" type="text" />' +
            '<a href="#">添加</a><a href="#" style="margin-left:7px">清除所有</a></label>' +
            '      </fieldset>' +
            '      <fieldset>' +
            '        <legend><label><input id="pd_cfg_auto_save_current_deposit_enabled" type="checkbox" />自动活期存款 ' +
            '<a class="pd_cfg_tips" href="#" title="在当前收入满足指定额度之后自动将指定数额存入活期存款中，只会在首页触发">[?]</a></label></legend>' +
            '        <label>在当前收入已满<input id="pd_cfg_save_current_deposit_after_kfb" maxlength="10" style="width:45px" type="text" />KFB之后 ' +
            '<a class="pd_cfg_tips" href="#" title="在当前收入已满指定KFB额度之后自动进行活期存款，例：1000">[?]</a></label><br />' +
            '        <label>将<input id="pd_cfg_save_current_deposit_kfb" maxlength="10" style="width:45px" type="text" />KFB存入活期存款 ' +
            '<a class="pd_cfg_tips" href="#" title="将指定额度的KFB存入活期存款中，例：900；举例：设定已满1000存900，当前收入为2000，则自动存入金额为1800">[?]</a></label>' +
            '      </fieldset>' +
            '    </div>' +
            '  </div>' +
            '  <div class="pd_cfg_btns">' +
            '    <span class="pd_cfg_about"><a target="_blank" href="https://greasyfork.org/zh-CN/scripts/8615">By 喵拉布丁</a> ' +
            '<span style="color:#666">(V{0})</span></span>'.replace('{0}', version) +
            '    <button>确定</button><button>取消</button><button>默认值</button>' +
            '  </div>' +
            '</div>' +
            '</form>';
        var $dialog = $(html).appendTo('body');

        $dialog.find('h1 > span, .pd_cfg_btns > button:eq(1)').click(function () {
            return Tools.close('pd_config');
        }).end().find('.pd_cfg_tips').click(function () {
            return false;
        }).end().find('.pd_cfg_btns > button:eq(2)').click(function (event) {
            event.preventDefault();
            if (window.confirm('是否重置所有设置？')) {
                ConfigDialog.clear();
                alert('设置已重置');
                location.reload();
            }
        }).end().find('.pd_cfg_nav > a:first-child').click(function (event) {
            event.preventDefault();
            Log.show();
        }).next().click(function (event) {
            event.preventDefault();
            ConfigDialog.showImportOrExportSettingDialog();
        });

        $('#pd_cfg_auto_use_item_names').keydown(function (event) {
            if (event.ctrlKey && (event.keyCode === 65 || event.keyCode === 97)) {
                event.preventDefault();
                $(this).children().each(function () {
                    $(this).prop('selected', true);
                });
            }
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

        $('#pd_cfg_custom_sm_color_config').click(function (event) {
            event.preventDefault();
            ConfigDialog.showCustomSmColorConfigDialog();
        });

        $('#pd_cfg_add_follow_user, #pd_cfg_add_block_user').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                $(this).next('a').click();
            }
        }).next('a').click(function (event) {
            event.preventDefault();
            var type = 1;
            if ($(this).prevAll().filter('#pd_cfg_add_block_user').length > 0) type = 2;
            ConfigDialog.addUserToFollowOrBlockList(type);
        }).next('a').click(function (event) {
            event.preventDefault();
            var type = 1;
            if ($(this).prevAll().filter('#pd_cfg_add_block_user').length > 0) type = 2;
            if (!window.confirm('是否清除所有用户？')) return;
            if (type === 2) {
                Config.blockUserList = [];
                $('#pd_cfg_block_user_list').empty();
            }
            else {
                Config.followUserList = [];
                $('#pd_cfg_follow_user_list').empty();
            }
        });

        ConfigDialog.setValue();
        $dialog.submit(function (event) {
            event.preventDefault();
            if (!ConfigDialog.verify()) return;
            var oriAutoRefreshEnabled = Config.autoRefreshEnabled;
            var options = ConfigDialog.getValue();
            options = ConfigDialog.getNormalizationConfig(options);
            $.extend(Config, options);
            ConfigDialog.write();
            Tools.close('pd_config');
            if (oriAutoRefreshEnabled !== options.autoRefreshEnabled) {
                if (window.confirm('你已修改了定时模式的设置，需要刷新页面才能生效，是否立即刷新？')) {
                    location.reload();
                }
            }
        }).find('legend input[type="checkbox"]').click(function () {
            var checked = $(this).prop('checked');
            if (Tools.isOpera())
                $(this).closest('fieldset').find('input, select, textarea, button').not('legend input').prop('disabled', !checked);
            else
                $(this).closest('fieldset').prop('disabled', !checked);
        }).each(function () {
            $(this).triggerHandler('click');
        }).end().find('input[data-disabled]').click(function () {
            var checked = $(this).prop('checked');
            $($(this).data('disabled')).prop('disabled', !checked);
        }).each(function () {
            $(this).triggerHandler('click');
        });

        Tools.resize('pd_config');
        Tools.escKeydown('pd_config');
        $(window).on('resize.pd_config', function () {
            Tools.resize('pd_config');
        });
    },

    /**
     * 显示导入或导出设置对话框
     */
    showImportOrExportSettingDialog: function () {
        if ($('#pd_im_or_ex_setting').length > 0) return;
        var html =
            '<form>' +
            '<div class="pd_cfg_box" id="pd_im_or_ex_setting">' +
            '  <h1>导入或导出设置<span>&times;</span></h1>' +
            '  <div class="pd_cfg_main">' +
            '    <div>' +
            '      <strong>导入设置：</strong>将设置内容粘贴到文本框中并点击保存按钮即可<br />' +
            '      <strong>导出设置：</strong>复制文本框里的内容并粘贴到文本文件里即可' +
            '    </div>' +
            '    <textarea id="pd_cfg_setting" style="width:420px;height:200px;word-break:break-all"></textarea>' +
            '  </div>' +
            '  <div class="pd_cfg_btns">' +
            '    <button>保存</button><button>取消</button>' +
            '  </div>' +
            '</div>' +
            '</form>';
        var $dialog = $(html).appendTo('body');
        $dialog.find('h1 > span').click(function () {
            return Tools.close('pd_im_or_ex_setting');
        }).end().find('.pd_cfg_tips').click(function () {
            return false;
        }).end().find('.pd_cfg_btns > button:first').click(function (event) {
            event.preventDefault();
            var options = $.trim($('#pd_cfg_setting').val());
            if (!options) return;
            try {
                options = JSON.parse(options);
            }
            catch (ex) {
                alert('设置有错误');
                return;
            }
            if (!options || $.type(options) !== 'object') {
                alert('设置有错误');
                return;
            }
            options = ConfigDialog.getNormalizationConfig(options);
            Config = $.extend(true, {}, ConfigDialog.defConfig, options);
            ConfigDialog.write();
            alert('设置已导入');
            location.reload();
        }).next('button').click(function () {
            return Tools.close('pd_im_or_ex_setting');
        });
        Tools.resize('pd_im_or_ex_setting');
        Tools.escKeydown('pd_im_or_ex_setting');
        $(window).on('resize.pd_im_or_ex_setting', function () {
            Tools.resize('pd_im_or_ex_setting');
        });
        $('#pd_cfg_setting').val(JSON.stringify(Tools.getDifferentValueOfObject(ConfigDialog.defConfig, Config))).select();
    },

    /**
     * 显示关注用户或屏蔽用户列表
     * @param {number} type 显示类别，1：关注用户；2：屏蔽用户
     */
    showFollowOrBlockUserList: function (type) {
        var userList = Config.followUserList;
        var $list = $('#pd_cfg_follow_user_list');
        if (type === 2) {
            userList = Config.blockUserList;
            $list = $('#pd_cfg_block_user_list');
        }
        $.each(userList, function (index, key) {
            $list.append('<span data-user="{0}">{0}<a href="#">&times;</a></span>'.replace(/\{0\}/g, key));
        });
        $list.on('click', 'a', function (event) {
            event.preventDefault();
            var $parent = $(this).parent();
            var user = $parent.data('user');
            var index = $.inArray(user, userList);
            $parent.fadeOut('fast', function () {
                $(this).remove();
            });
            if (index > -1) {
                userList.splice(index, 1);
            }
        });
    },

    /**
     * 添加用户到关注用户或屏蔽用户列表里
     * @param {number} type 显示类别，1：关注用户；2：屏蔽用户
     */
    addUserToFollowOrBlockList: function (type) {
        var userList = Config.followUserList;
        var $list = $('#pd_cfg_follow_user_list');
        var $input = $('#pd_cfg_add_follow_user');
        if (type === 2) {
            userList = Config.blockUserList;
            $list = $('#pd_cfg_block_user_list');
            $input = $('#pd_cfg_add_block_user');
        }
        var users = $.trim($input.val()).split(',');
        if (!users || $.trim(users[0]) === '') return;
        for (var i in users) {
            var user = $.trim(users[i]);
            if ($.inArray(user, userList) === -1) {
                userList.push(user);
                $list.append('<span data-user="{0}">{0}<a href="#">&times;</a></span>'.replace(/\{0\}/g, user));
            }
        }
        $input.val('');
    },

    /**
     * 显示自定义各等级神秘颜色设置对话框
     */
    showCustomSmColorConfigDialog: function () {
        if ($('#pd_custom_sm_color_config').length > 0) return;
        var html =
            '<form>' +
            '<div class="pd_cfg_box" id="pd_custom_sm_color_config">' +
            '  <h1>自定义各等级神秘颜色<span>&times;</span></h1>' +
            '  <div class="pd_cfg_main">' +
            '    <div style="border-bottom:1px solid #9191FF;margin-bottom:7px;padding-bottom:5px"><strong>示例' +
            '（<a target="_blank" href="http://www.35ui.cn/jsnote/peise.html">常用配色表</a> / <a target="_blank" href="read.php?tid=488016">其他人分享的配色方案</a>）：' +
            '</strong><br /><b>等级范围：</b>4-4 <b>颜色：</b><span style="color:#0000FF">#0000FF</span><br /><b>等级范围：</b>10-49 <b>颜色：</b>' +
            '<span style="color:#00FF00">#00FF00</span><br /><b>等级范围：</b>900-MAX <b>颜色：</b><span style="color:#FF0000">#FF0000</span></div>' +
            '    <ul id="pd_cfg_custom_sm_color_list"></ul>' +
            '    <div style="margin-top:5px" id="pd_cfg_custom_sm_color_add_btns"><a href="#">增加1个</a><a href="#" style="margin-left:7px">增加5个</a>' +
            '<a href="#" style="margin-left:7px">清除所有</a></div>' +
            '  </div>' +
            '  <div class="pd_cfg_btns">' +
            '    <span class="pd_cfg_about"><a href="#">导入/导出配色方案</a></span>' +
            '    <button>确定</button><button>取消</button>' +
            '  </div>' +
            '</div>' +
            '</form>';
        var $dialog = $(html).appendTo('body');
        $dialog.find('h1 > span').click(function () {
            return Tools.close('pd_custom_sm_color_config');
        }).end().find('.pd_cfg_tips').click(function () {
            return false;
        }).end().find('.pd_cfg_btns > button:last').click(function () {
            return Tools.close('pd_custom_sm_color_config');
        });

        $('#pd_cfg_custom_sm_color_list').on('keyup', '.pd_cfg_sm_color', function () {
            var $this = $(this);
            var color = $.trim($this.val());
            if (/^#[0-9a-fA-F]{6}$/.test(color)) {
                $this.next('input[type="color"]').val(color.toUpperCase());
            }
        }).on('change', 'input[type="color"]', function () {
            var $this = $(this);
            $this.prev('input').val($this.val().toString().toUpperCase());
        }).on('click', 'a', function (event) {
            event.preventDefault();
            $(this).closest('li').remove();
        });

        var getSmColorListLine = function (data) {
            if (!data) data = {};
            return ('<li><label>等级范围<input class="pd_cfg_sm_min" type="text" maxlength="5" style="width:30px" value="{0}" /></label>' +
            '<label>-<input class="pd_cfg_sm_max" type="text" maxlength="5" style="width:30px" value="{1}" /></label>' +
            '<label>颜色<input class="pd_cfg_sm_color" type="text" maxlength="7" style="width:50px" value="{2}" />' +
            '<input style="margin-left:0" type="color" value="{2}"></label> <a href="#">删除</a></li>')
                .replace('{0}', typeof data.min === 'undefined' ? '' : data.min)
                .replace('{1}', typeof data.max === 'undefined' ? '' : data.max)
                .replace(/\{2\}/g, typeof data.color === 'undefined' ? '' : data.color);
        };

        $('#pd_cfg_custom_sm_color_add_btns').find('a:lt(2)').click(function (event) {
            event.preventDefault();
            var num = 1;
            if ($(this).is('#pd_cfg_custom_sm_color_add_btns > a:eq(1)')) num = 5;
            for (var i = 1; i <= num; i++) {
                $('#pd_cfg_custom_sm_color_list').append(getSmColorListLine());
            }
            Tools.resize('pd_custom_sm_color_config');
        }).end().find('a:last').click(function (event) {
            event.preventDefault();
            if (window.confirm('是否清除所有设置？')) {
                $('#pd_cfg_custom_sm_color_list').empty();
                Tools.resize('pd_custom_sm_color_config');
            }
        });

        $('.pd_cfg_about a').click(function (event) {
            event.preventDefault();
            ConfigDialog.showImportOrExportSmColorConfigDialog();
        });

        var smColorHtml = '';
        $.each(Config.customSmColorConfigList, function (index, data) {
            smColorHtml += getSmColorListLine(data);
        });
        $('#pd_cfg_custom_sm_color_list').html(smColorHtml);

        $dialog.submit(function (event) {
            event.preventDefault();
            var list = [];
            var verification = true;
            $('#pd_cfg_custom_sm_color_list > li').each(function () {
                var $this = $(this);
                var $txtSmMin = $this.find('.pd_cfg_sm_min');
                var smMin = $.trim($txtSmMin.val()).toUpperCase();
                if (smMin === '') return;
                if (!/^(-?\d+|MAX)$/i.test(smMin)) {
                    verification = false;
                    $txtSmMin.select();
                    $txtSmMin.focus();
                    alert('等级范围格式不正确');
                    return false;
                }
                var $txtSmMax = $this.find('.pd_cfg_sm_max');
                var smMax = $.trim($txtSmMax.val()).toUpperCase();
                if (smMax === '') return;
                if (!/^(-?\d+|MAX)$/i.test(smMax)) {
                    verification = false;
                    $txtSmMax.select();
                    $txtSmMax.focus();
                    alert('等级范围格式不正确');
                    return false;
                }
                if (Tools.compareSmLevel(smMax, smMin) < 0) {
                    verification = false;
                    $txtSmMin.select();
                    $txtSmMin.focus();
                    alert('等级范围格式不正确');
                    return false;
                }
                var $txtSmColor = $this.find('.pd_cfg_sm_color');
                var smColor = $.trim($txtSmColor.val()).toUpperCase();
                if (smColor === '') return;
                if (!/^#[0-9a-fA-F]{6}$/.test(smColor)) {
                    verification = false;
                    $txtSmColor.select();
                    $txtSmColor.focus();
                    alert('颜色格式不正确');
                    return false;
                }
                list.push({min: smMin, max: smMax, color: smColor});
            });
            if (verification) {
                list.sort(function (a, b) {
                    return Tools.compareSmLevel(a.min, b.min) > 0;
                });
                Config.customSmColorConfigList = list;
                ConfigDialog.write();
                Tools.close('pd_custom_sm_color_config');
            }
        });

        Tools.resize('pd_custom_sm_color_config');
        Tools.escKeydown('pd_custom_sm_color_config');
        $(window).on('resize.pd_custom_sm_color_config', function () {
            Tools.resize('pd_custom_sm_color_config');
        });
    },

    /**
     * 显示导入或导出配色方案对话框
     */
    showImportOrExportSmColorConfigDialog: function () {
        if ($('#pd_im_or_ex_sm_color_config').length > 0) return;
        var html =
            '<form>' +
            '<div class="pd_cfg_box" id="pd_im_or_ex_sm_color_config">' +
            '  <h1>导入或导出配色方案<span>&times;</span></h1>' +
            '  <div class="pd_cfg_main">' +
            '    <div>' +
            '      <strong>导入配色方案：</strong>将设置内容粘贴到文本框中并点击保存按钮即可<br />' +
            '      <strong>导出配色方案：</strong>复制文本框里的内容并粘贴到文本文件里即可' +
            '    </div>' +
            '    <textarea id="pd_cfg_sm_color_config" style="width:420px;height:200px;word-break:break-all"></textarea>' +
            '  </div>' +
            '  <div class="pd_cfg_btns">' +
            '    <span class="pd_cfg_about"><a target="_blank" href="read.php?tid=488016">其他人分享的配色方案</a></span>' +
            '    <button>保存</button><button>取消</button>' +
            '  </div>' +
            '</div>' +
            '</form>';
        var $dialog = $(html).appendTo('body');
        $dialog.find('h1 > span').click(function () {
            return Tools.close('pd_im_or_ex_sm_color_config');
        }).end().find('.pd_cfg_tips').click(function () {
            return false;
        }).end().find('.pd_cfg_btns > button:first').click(function (event) {
            event.preventDefault();
            var options = $.trim($('#pd_cfg_sm_color_config').val());
            if (!options) return;
            try {
                options = JSON.parse(options);
            }
            catch (ex) {
                alert('配色方案有错误');
                return;
            }
            if (!options || $.type(options) !== 'array') {
                alert('配色方案有错误');
                return;
            }
            Config.customSmColorConfigList = options;
            ConfigDialog.write();
            alert('配色方案已导入');
            location.reload();
        }).next('button').click(function () {
            return Tools.close('pd_im_or_ex_sm_color_config');
        });
        Tools.resize('pd_im_or_ex_sm_color_config');
        Tools.escKeydown('pd_im_or_ex_sm_color_config');
        $(window).on('resize.pd_im_or_ex_sm_color_config', function () {
            Tools.resize('pd_im_or_ex_sm_color_config');
        });
        $('#pd_cfg_sm_color_config').val(JSON.stringify(Config.customSmColorConfigList)).select();
    },

    /**
     * 设置对话框中的字段值
     */
    setValue: function () {
        $('#pd_cfg_auto_donation_enabled').prop('checked', Config.autoDonationEnabled);
        $('#pd_cfg_donation_kfb').val(Config.donationKfb);
        $('#pd_cfg_donation_after_time').val(Config.donationAfterTime);
        $('#pd_cfg_donation_after_vip_enabled').prop('checked', Config.donationAfterVipEnabled);
        $('#pd_cfg_auto_get_loot_award_enabled').prop('checked', Config.autoGetLootAwardEnabled);
        $('#pd_cfg_auto_draw_smbox_enabled').prop('checked', Config.autoDrawSmbox2Enabled);
        $('#pd_cfg_favor_smbox_numbers').val(Config.favorSmboxNumbers.join(','));
        $('#pd_cfg_auto_refresh_enabled').prop('checked', Config.autoRefreshEnabled);
        $('#pd_cfg_show_refresh_mode_tips_type').val(Config.showRefreshModeTipsType.toLowerCase());
        $('#pd_cfg_at_tips_handle_type').val(Config.atTipsHandleType.toLowerCase());
        $('#pd_cfg_hide_none_vip_enabled').prop('checked', Config.hideNoneVipEnabled);
        $('#pd_cfg_sm_level_up_alert_enabled').prop('checked', Config.smLevelUpAlertEnabled);
        $('#pd_cfg_home_page_thread_fast_goto_link_enabled').prop('checked', Config.homePageThreadFastGotoLinkEnabled);
        $('#pd_cfg_show_fast_goto_thread_page_enabled').prop('checked', Config.showFastGotoThreadPageEnabled);
        $('#pd_cfg_max_fast_goto_thread_page_num').val(Config.maxFastGotoThreadPageNum);
        $('#pd_cfg_per_page_floor_num').val(Config.perPageFloorNum);
        $('#pd_cfg_highlight_new_post_enabled').prop('checked', Config.highlightNewPostEnabled);
        $('#pd_cfg_adjust_thread_content_width_enabled').prop('checked', Config.adjustThreadContentWidthEnabled);
        $('#pd_cfg_thread_content_font_size').val(Config.threadContentFontSize > 0 ? Config.threadContentFontSize : '');
        $('#pd_cfg_custom_my_sm_color').val(Config.customMySmColor);
        $('#pd_cfg_custom_sm_color_enabled').prop('checked', Config.customSmColorEnabled);
        $('#pd_cfg_modify_kf_other_domain_enabled').prop('checked', Config.modifyKFOtherDomainEnabled);
        $('#pd_cfg_multi_quote_enabled').prop('checked', Config.multiQuoteEnabled);
        $('#pd_cfg_batch_buy_thread_enabled').prop('checked', Config.batchBuyThreadEnabled);
        if (Config.customMySmColor) $('#pd_cfg_custom_my_sm_color_select').val(Config.customMySmColor);
        $('#pd_cfg_def_show_msg_duration').val(Config.defShowMsgDuration);
        $('#pd_cfg_log_save_days').val(Config.logSaveDays);
        $('#pd_cfg_show_log_link_in_page_enabled').prop('checked', Config.showLogLinkInPageEnabled);
        $('#pd_cfg_add_side_bar_fast_nav_enabled').prop('checked', Config.addSideBarFastNavEnabled);
        $('#pd_cfg_modify_side_bar_enabled').prop('checked', Config.modifySideBarEnabled);
        $('#pd_cfg_follow_user_enabled').prop('checked', Config.followUserEnabled);
        ConfigDialog.showFollowOrBlockUserList(1);
        $('#pd_cfg_highlight_follow_user_thread_in_hp_enabled').prop('checked', Config.highlightFollowUserThreadInHPEnabled);
        $('#pd_cfg_block_user_enabled').prop('checked', Config.blockUserEnabled);
        ConfigDialog.showFollowOrBlockUserList(2);
        $('#pd_cfg_auto_save_current_deposit_enabled').prop('checked', Config.autoSaveCurrentDepositEnabled);
        if (Config.saveCurrentDepositAfterKfb > 0) $('#pd_cfg_save_current_deposit_after_kfb').val(Config.saveCurrentDepositAfterKfb);
        if (Config.saveCurrentDepositKfb > 0) $('#pd_cfg_save_current_deposit_kfb').val(Config.saveCurrentDepositKfb);
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
        options.autoGetLootAwardEnabled = $('#pd_cfg_auto_get_loot_award_enabled').prop('checked');
        options.autoDrawSmbox2Enabled = $('#pd_cfg_auto_draw_smbox_enabled').prop('checked');
        options.favorSmboxNumbers = $.trim($('#pd_cfg_favor_smbox_numbers').val()).split(',');
        options.autoRefreshEnabled = $('#pd_cfg_auto_refresh_enabled').prop('checked');
        options.showRefreshModeTipsType = $('#pd_cfg_show_refresh_mode_tips_type').val();
        options.atTipsHandleType = $('#pd_cfg_at_tips_handle_type').val();
        options.hideNoneVipEnabled = $('#pd_cfg_hide_none_vip_enabled').prop('checked');
        options.smLevelUpAlertEnabled = $('#pd_cfg_sm_level_up_alert_enabled').prop('checked');
        options.homePageThreadFastGotoLinkEnabled = $('#pd_cfg_home_page_thread_fast_goto_link_enabled').prop('checked');
        options.showFastGotoThreadPageEnabled = $('#pd_cfg_show_fast_goto_thread_page_enabled').prop('checked');
        options.maxFastGotoThreadPageNum = parseInt($.trim($('#pd_cfg_max_fast_goto_thread_page_num').val()));
        options.perPageFloorNum = $('#pd_cfg_per_page_floor_num').val();
        options.highlightNewPostEnabled = $('#pd_cfg_highlight_new_post_enabled').prop('checked');
        options.adjustThreadContentWidthEnabled = $('#pd_cfg_adjust_thread_content_width_enabled').prop('checked');
        options.threadContentFontSize = parseInt($.trim($('#pd_cfg_thread_content_font_size').val()));
        options.customMySmColor = $.trim($('#pd_cfg_custom_my_sm_color').val()).toUpperCase();
        options.customSmColorEnabled = $('#pd_cfg_custom_sm_color_enabled').prop('checked');
        options.modifyKFOtherDomainEnabled = $('#pd_cfg_modify_kf_other_domain_enabled').prop('checked');
        options.multiQuoteEnabled = $('#pd_cfg_multi_quote_enabled').prop('checked');
        options.batchBuyThreadEnabled = $('#pd_cfg_batch_buy_thread_enabled').prop('checked');
        options.defShowMsgDuration = parseInt($.trim($('#pd_cfg_def_show_msg_duration').val()));
        options.logSaveDays = parseInt($.trim($('#pd_cfg_log_save_days').val()));
        options.showLogLinkInPageEnabled = $('#pd_cfg_show_log_link_in_page_enabled').prop('checked');
        options.addSideBarFastNavEnabled = $('#pd_cfg_add_side_bar_fast_nav_enabled').prop('checked');
        options.modifySideBarEnabled = $('#pd_cfg_modify_side_bar_enabled').prop('checked');
        options.followUserEnabled = $('#pd_cfg_follow_user_enabled').prop('checked');
        options.highlightFollowUserThreadInHPEnabled = $('#pd_cfg_highlight_follow_user_thread_in_hp_enabled').prop('checked');
        options.blockUserEnabled = $('#pd_cfg_block_user_enabled').prop('checked');
        options.autoSaveCurrentDepositEnabled = $('#pd_cfg_auto_save_current_deposit_enabled').prop('checked');
        options.saveCurrentDepositAfterKfb = parseInt($.trim($('#pd_cfg_save_current_deposit_after_kfb').val()));
        options.saveCurrentDepositKfb = parseInt($.trim($('#pd_cfg_save_current_deposit_kfb').val()));
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

        var $txtMaxFastGotoThreadPageNum = $('#pd_cfg_max_fast_goto_thread_page_num');
        var maxFastGotoThreadPageNum = $.trim($txtMaxFastGotoThreadPageNum.val());
        if (!$.isNumeric(maxFastGotoThreadPageNum) || parseInt(maxFastGotoThreadPageNum) <= 0) {
            alert('页数链接最大数量格式不正确');
            $txtMaxFastGotoThreadPageNum.select();
            $txtMaxFastGotoThreadPageNum.focus();
            return false;
        }

        var $txtThreadContentFontSize = $('#pd_cfg_thread_content_font_size');
        var threadContentFontSize = $.trim($txtThreadContentFontSize.val());
        if (threadContentFontSize && (isNaN(parseInt(threadContentFontSize)) || parseInt(threadContentFontSize) < 0)) {
            alert('帖子内容字体大小格式不正确');
            $txtThreadContentFontSize.select();
            $txtThreadContentFontSize.focus();
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

        var $txtDefShowMsgDuration = $('#pd_cfg_def_show_msg_duration');
        var defShowMsgDuration = $.trim($txtDefShowMsgDuration.val());
        if (!$.isNumeric(defShowMsgDuration) || parseInt(defShowMsgDuration) < -1) {
            alert('默认提示消息的持续时间格式不正确');
            $txtDefShowMsgDuration.select();
            $txtDefShowMsgDuration.focus();
            return false;
        }

        var $txtLogSaveDays = $('#pd_cfg_log_save_days');
        var logSaveDays = $.trim($txtLogSaveDays.val());
        if (!$.isNumeric(logSaveDays) || parseInt(logSaveDays) < 1) {
            alert('日志保存天数格式不正确');
            $txtLogSaveDays.select();
            $txtLogSaveDays.focus();
            return false;
        }

        var $txtSaveCurrentDepositAfterKfb = $('#pd_cfg_save_current_deposit_after_kfb');
        var $txtSaveCurrentDepositKfb = $('#pd_cfg_save_current_deposit_kfb');
        var saveCurrentDepositAfterKfb = parseInt($.trim($txtSaveCurrentDepositAfterKfb.val()));
        var saveCurrentDepositKfb = parseInt($.trim($txtSaveCurrentDepositKfb.val()));
        if (saveCurrentDepositAfterKfb || saveCurrentDepositKfb) {
            if (!saveCurrentDepositAfterKfb || saveCurrentDepositAfterKfb <= 0) {
                alert('自动活期存款满足额度格式不正确');
                $txtSaveCurrentDepositAfterKfb.select();
                $txtSaveCurrentDepositAfterKfb.focus();
                return false;
            }
            if (!saveCurrentDepositKfb || saveCurrentDepositKfb <= 0 || saveCurrentDepositKfb > saveCurrentDepositAfterKfb) {
                alert('想要存款的金额格式不正确');
                $txtSaveCurrentDepositKfb.select();
                $txtSaveCurrentDepositKfb.focus();
                return false;
            }
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
            options.autoDonationEnabled : defConfig.autoDonationEnabled;
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
            options.donationAfterVipEnabled : defConfig.donationAfterVipEnabled;
        settings.autoGetLootAwardEnabled = typeof options.autoGetLootAwardEnabled === 'boolean' ?
            options.autoGetLootAwardEnabled : defConfig.autoGetLootAwardEnabled;
        if (typeof options.batchAttackList !== 'undefined') {
            if ($.type(options.batchAttackList) === 'object') {
                settings.batchAttackList = {};
                var totalAttackNum = 0;
                for (var id in options.batchAttackList) {
                    var attackNum = parseInt(options.batchAttackList[id]);
                    if (!isNaN(attackNum) && attackNum > 0) {
                        settings.batchAttackList[parseInt(id)] = attackNum;
                        totalAttackNum += attackNum;
                    }
                }
                if (totalAttackNum > Config.maxAttackNum) settings.batchAttackList = defConfig.batchAttackList;
            }
            else settings.batchAttackList = defConfig.batchAttackList;
        }
        settings.autoDrawSmbox2Enabled = typeof options.autoDrawSmbox2Enabled === 'boolean' ?
            options.autoDrawSmbox2Enabled : defConfig.autoDrawSmbox2Enabled;
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
        settings.autoRefreshEnabled = typeof options.autoRefreshEnabled === 'boolean' ?
            options.autoRefreshEnabled : defConfig.autoRefreshEnabled;
        if (typeof options.showRefreshModeTipsType !== 'undefined') {
            var showRefreshModeTipsType = $.trim(options.showRefreshModeTipsType).toLowerCase();
            var allowTypes = ['auto', 'always', 'never'];
            if (showRefreshModeTipsType !== '' && $.inArray(showRefreshModeTipsType, allowTypes) > -1)
                settings.showRefreshModeTipsType = showRefreshModeTipsType;
            else settings.showRefreshModeTipsType = defConfig.showRefreshModeTipsType;
        }
        if (typeof options.atTipsHandleType !== 'undefined') {
            var atTipsHandleType = $.trim(options.atTipsHandleType).toLowerCase();
            var allowTypes = ['no_highlight_1', 'no_highlight_2', 'hide_box_1', 'hide_box_2', 'default', 'at_change_to_cao'];
            if (atTipsHandleType !== '' && $.inArray(atTipsHandleType, allowTypes) > -1)
                settings.atTipsHandleType = atTipsHandleType;
            else settings.atTipsHandleType = defConfig.atTipsHandleType;
        }
        settings.hideNoneVipEnabled = typeof options.hideNoneVipEnabled === 'boolean' ?
            options.hideNoneVipEnabled : defConfig.hideNoneVipEnabled;
        settings.smLevelUpAlertEnabled = typeof options.smLevelUpAlertEnabled === 'boolean' ?
            options.smLevelUpAlertEnabled : defConfig.smLevelUpAlertEnabled;
        settings.homePageThreadFastGotoLinkEnabled = typeof options.homePageThreadFastGotoLinkEnabled === 'boolean' ?
            options.homePageThreadFastGotoLinkEnabled : defConfig.homePageThreadFastGotoLinkEnabled;
        settings.showFastGotoThreadPageEnabled = typeof options.showFastGotoThreadPageEnabled === 'boolean' ?
            options.showFastGotoThreadPageEnabled : defConfig.showFastGotoThreadPageEnabled;
        if (typeof options.maxFastGotoThreadPageNum !== 'undefined') {
            var maxFastGotoThreadPageNum = parseInt(options.maxFastGotoThreadPageNum);
            if ($.isNumeric(maxFastGotoThreadPageNum) && maxFastGotoThreadPageNum > 0)
                settings.maxFastGotoThreadPageNum = maxFastGotoThreadPageNum;
            else settings.maxFastGotoThreadPageNum = defConfig.maxFastGotoThreadPageNum;
        }
        if (typeof options.perPageFloorNum !== 'undefined') {
            var perPageFloorNum = parseInt(options.perPageFloorNum);
            if ($.inArray(perPageFloorNum, [10, 20, 30]) > -1)
                settings.perPageFloorNum = perPageFloorNum;
            else settings.perPageFloorNum = defConfig.perPageFloorNum;
        }
        settings.highlightNewPostEnabled = typeof options.highlightNewPostEnabled === 'boolean' ?
            options.highlightNewPostEnabled : defConfig.highlightNewPostEnabled;
        settings.adjustThreadContentWidthEnabled = typeof options.adjustThreadContentWidthEnabled === 'boolean' ?
            options.adjustThreadContentWidthEnabled : defConfig.adjustThreadContentWidthEnabled;
        if (typeof options.threadContentFontSize !== 'undefined') {
            var threadContentFontSize = parseInt(options.threadContentFontSize);
            if (threadContentFontSize > 0) settings.threadContentFontSize = threadContentFontSize;
            else settings.threadContentFontSize = defConfig.threadContentFontSize;
        }
        if (typeof options.customMySmColor !== 'undefined') {
            var customMySmColor = options.customMySmColor;
            if (/^#[0-9a-fA-F]{6}$/.test(customMySmColor))
                settings.customMySmColor = customMySmColor;
            else settings.customMySmColor = defConfig.customMySmColor;
        }
        settings.customSmColorEnabled = typeof options.customSmColorEnabled === 'boolean' ?
            options.customSmColorEnabled : defConfig.customSmColorEnabled;
        if (typeof options.customSmColorConfigList !== 'undefined') {
            var customSmColorConfigList = options.customSmColorConfigList
            if ($.isArray(customSmColorConfigList)) {
                settings.customSmColorConfigList = [];
                $.each(customSmColorConfigList, function (index, data) {
                    if ($.type(data) === 'object' && $.type(data.min) === 'string' && $.type(data.max) === 'string' && $.type(data.color) === 'string' &&
                        /^(-?\d+|MAX)$/i.test(data.min) && /^(-?\d+|MAX)$/i.test(data.max) && /^#[0-9a-fA-F]{6}$/.test(data.color) &&
                        Tools.compareSmLevel(data.min, data.max) <= 0) {
                        settings.customSmColorConfigList.push(data);
                    }
                });
            }
            else settings.customSmColorConfigList = defConfig.customSmColorConfigList;
        }
        settings.modifyKFOtherDomainEnabled = typeof options.modifyKFOtherDomainEnabled === 'boolean' ?
            options.modifyKFOtherDomainEnabled : defConfig.modifyKFOtherDomainEnabled;
        settings.multiQuoteEnabled = typeof options.multiQuoteEnabled === 'boolean' ?
            options.multiQuoteEnabled : defConfig.multiQuoteEnabled;
        settings.batchBuyThreadEnabled = typeof options.batchBuyThreadEnabled === 'boolean' ?
            options.batchBuyThreadEnabled : defConfig.batchBuyThreadEnabled;
        if (typeof options.defShowMsgDuration !== 'undefined') {
            var defShowMsgDuration = parseInt(options.defShowMsgDuration);
            if ($.isNumeric(defShowMsgDuration) && defShowMsgDuration >= -1)
                settings.defShowMsgDuration = defShowMsgDuration;
            else settings.defShowMsgDuration = defConfig.defShowMsgDuration;
        }
        if (typeof options.logSaveDays !== 'undefined') {
            var logSaveDays = parseInt(options.logSaveDays);
            if (logSaveDays > 0) settings.logSaveDays = logSaveDays;
            else settings.logSaveDays = defConfig.logSaveDays;
        }
        settings.showLogLinkInPageEnabled = typeof options.showLogLinkInPageEnabled === 'boolean' ?
            options.showLogLinkInPageEnabled : defConfig.showLogLinkInPageEnabled;
        if (typeof options.logSortType !== 'undefined') {
            var logSortType = $.trim(options.logSortType).toLowerCase();
            var allowTypes = ['time', 'type'];
            if (logSortType !== '' && $.inArray(logSortType, allowTypes) > -1)
                settings.logSortType = logSortType;
            else settings.logSortType = defConfig.logSortType;
        }
        if (typeof options.logStatType !== 'undefined') {
            var logStatType = $.trim(options.logStatType).toLowerCase();
            var allowTypes = ['cur', 'custom', 'all'];
            if (logStatType !== '' && $.inArray(logStatType, allowTypes) > -1)
                settings.logStatType = logStatType;
            else settings.logStatType = defConfig.logStatType;
        }
        if (typeof options.logStatDays !== 'undefined') {
            var logStatDays = parseInt(options.logStatDays);
            if (logStatDays > 0) settings.logStatDays = logStatDays;
            else settings.logStatDays = defConfig.logStatDays;
        }
        settings.addSideBarFastNavEnabled = typeof options.addSideBarFastNavEnabled === 'boolean' ?
            options.addSideBarFastNavEnabled : defConfig.addSideBarFastNavEnabled;
        settings.modifySideBarEnabled = typeof options.modifySideBarEnabled === 'boolean' ?
            options.modifySideBarEnabled : defConfig.modifySideBarEnabled;
        settings.followUserEnabled = typeof options.followUserEnabled === 'boolean' ?
            options.followUserEnabled : defConfig.followUserEnabled;
        if (typeof options.followUserList !== 'undefined') {
            if ($.isArray(options.followUserList)) {
                settings.followUserList = [];
                for (var i in options.followUserList) {
                    var user = $.trim(options.followUserList[i]);
                    if (user) settings.followUserList.push(user);
                }
            }
            else settings.followUserList = defConfig.followUserList;
        }
        settings.highlightFollowUserThreadInHPEnabled = typeof options.highlightFollowUserThreadInHPEnabled === 'boolean' ?
            options.highlightFollowUserThreadInHPEnabled : defConfig.highlightFollowUserThreadInHPEnabled;
        settings.blockUserEnabled = typeof options.blockUserEnabled === 'boolean' ?
            options.blockUserEnabled : defConfig.blockUserEnabled;
        if (typeof options.blockUserList !== 'undefined') {
            if ($.isArray(options.blockUserList)) {
                settings.blockUserList = [];
                for (var i in options.blockUserList) {
                    var user = $.trim(options.blockUserList[i]);
                    if (user) settings.blockUserList.push(user);
                }
            }
            else settings.blockUserList = defConfig.blockUserList;
        }
        settings.autoSaveCurrentDepositEnabled = typeof options.autoSaveCurrentDepositEnabled === 'boolean' ?
            options.autoSaveCurrentDepositEnabled : defConfig.autoSaveCurrentDepositEnabled;
        if (typeof options.saveCurrentDepositAfterKfb !== 'undefined') {
            var saveCurrentDepositAfterKfb = parseInt(options.saveCurrentDepositAfterKfb);
            if (saveCurrentDepositAfterKfb > 0) settings.saveCurrentDepositAfterKfb = saveCurrentDepositAfterKfb;
            else settings.saveCurrentDepositAfterKfb = defConfig.saveCurrentDepositAfterKfb;
        }
        if (typeof options.saveCurrentDepositKfb !== 'undefined') {
            var saveCurrentDepositKfb = parseInt(options.saveCurrentDepositKfb);
            if (saveCurrentDepositKfb > 0 && saveCurrentDepositKfb <= settings.saveCurrentDepositAfterKfb)
                settings.saveCurrentDepositKfb = saveCurrentDepositKfb;
            else settings.saveCurrentDepositKfb = defConfig.saveCurrentDepositKfb;
        }
        return settings;
    },

    /**
     * 读取设置
     */
    read: function () {
        var options = localStorage[ConfigDialog.name];
        if (!options) return;
        try {
            options = JSON.parse(options);
        }
        catch (ex) {
            return;
        }
        if (!options || $.type(options) !== 'object' || $.isEmptyObject(options)) return;
        options = ConfigDialog.getNormalizationConfig(options);
        Config = $.extend(true, {}, ConfigDialog.defConfig, options);
    },

    /**
     * 写入设置
     */
    write: function () {
        var options = Tools.getDifferentValueOfObject(ConfigDialog.defConfig, Config);
        localStorage[ConfigDialog.name] = JSON.stringify(options);
    },

    /**
     * 清空设置
     */
    clear: function () {
        localStorage.removeItem(ConfigDialog.name);
    }
};

/**
 * 日志类
 */
var Log = {
    // 保存日志的键值名称
    name: 'pd_log',
    // 日志对象
    log: {},

    /**
     * 读取日志
     */
    read: function () {
        Log.log = {};
        var log = localStorage[Log.name + '_' + KFOL.uid];
        if (!log) return;
        try {
            log = JSON.parse(log);
        }
        catch (ex) {
            return;
        }
        if (!log || $.type(log) !== 'object') return;
        Log.log = log;
        Log.deleteOverdueLog();
    },

    /**
     * 写入日志
     */
    write: function () {
        localStorage[Log.name + '_' + KFOL.uid] = JSON.stringify(Log.log);
    },

    /**
     * 清除日志
     */
    clear: function () {
        localStorage.removeItem(Log.name + '_' + KFOL.uid);
    },

    /**
     * 删除过期日志
     */
    deleteOverdueLog: function () {
        var dateList = Tools.getObjectKeyList(Log.log, 1);
        var overdueDate = Tools.getDateString(Tools.getDate('-' + Config.logSaveDays + 'd'));
        var isDeleted = false;
        for (var i in dateList) {
            if (dateList[i] <= overdueDate) {
                delete Log.log[dateList[i]];
                isDeleted = true;
            }
            else break;
        }
        if (isDeleted) Log.write();
    },

    /**
     * 记录一条新日志
     * @param {string} type 日志类别
     * @param {string} action 行为
     * @param {Object} [options] 设置对象
     * @param {Object} [options.gain] 收获
     * @param {Object} [options.pay] 付出
     * @param {boolean} [options.notStat=false] 是否不参与统计
     */
    push: function (type, action, options) {
        var defaults = {
            time: 0,
            type: '',
            action: '',
            gain: {},
            pay: {},
            notStat: false
        };
        var settings = $.extend({}, defaults);
        if ($.type(options) === 'object') {
            $.extend(settings, options);
        }
        settings.type = type;
        settings.action = action;
        var date = new Date();
        settings.time = date.getTime();
        var today = Tools.getDateString(date);
        Log.read();
        if ($.type(Log.log[today]) !== 'array') Log.log[today] = [];
        Log.log[today].push(Tools.getDifferentValueOfObject(defaults, settings));
        Log.write();
    },

    /**
     * 显示日志对话框
     */
    show: function () {
        if ($('#pd_log').length > 0) return;
        Tools.close('pd_config');
        ConfigDialog.read();
        var html =
            '<form>' +
            '<div id="pd_log" class="pd_cfg_box">' +
            '  <h1>KF Online助手日志<span>&times;</span></h1>' +
            '  <div class="pd_cfg_main">' +
            '    <div class="pd_log_nav">' +
            '      <a class="pd_disabled_link" href="#">&lt;&lt;</a>' +
            '      <a style="padding:0 7px" class="pd_disabled_link" href="#">&lt;</a>' +
            '      <h2>暂无日志</h2>' +
            '      <a style="padding:0 7px" class="pd_disabled_link" href="#">&gt;</a>' +
            '      <a class="pd_disabled_link" href="#">&gt;&gt;</a>' +
            '    </div>' +
            '    <fieldset>' +
            '      <legend>日志内容</legend>' +
            '      <div>' +
            '        <strong>排序方式：</strong>' +
            '        <label title="按时间顺序排序"><input type="radio" name="pd_log_sort_type" value="time" checked="checked" />按时间</label>' +
            '        <label title="按日志类别排序"><input type="radio" name="pd_log_sort_type" value="type" />按类别</label>' +
            '      </div>' +
            '      <div class="pd_stat" id="pd_log_content">暂无日志</div>' +
            '    </fieldset>' +
            '    <fieldset>' +
            '      <legend>统计结果</legend>' +
            '      <div>' +
            '        <strong>统计范围：</strong>' +
            '        <label title="显示当天的统计结果"><input type="radio" name="pd_log_stat_type" value="cur" checked="checked" />当天</label>' +
            '        <label title="显示距该日N天内的统计结果"><input type="radio" name="pd_log_stat_type" value="custom" /></label>' +
            '<label title="显示距该日N天内的统计结果"><input id="pd_log_stat_days" type="text" style="width:22px" maxlength="3" />天内</label>' +
            '        <label title="显示全部统计结果"><input type="radio" name="pd_log_stat_type" value="all" />全部</label>' +
            '      </div>' +
            '      <div class="pd_stat" id="pd_log_stat">暂无日志</div>' +
            '    </fieldset>' +
            '  </div>' +
            '  <div class="pd_cfg_btns">' +
            '    <button>关闭</button><button>清除日志</button>' +
            '  </div>' +
            '</div>' +
            '</form>';
        var $dialog = $(html).appendTo('body');

        Log.read();
        var dateList = [];
        var curIndex = 0;
        if (!$.isEmptyObject(Log.log)) {
            dateList = Tools.getObjectKeyList(Log.log, 1);
            curIndex = dateList.length - 1;
            $dialog.find('.pd_log_nav h2').attr('title', '总共记录了{0}天的日志'.replace('{0}', dateList.length)).text(dateList[curIndex]);
            if (dateList.length > 1) {
                $dialog.find('.pd_log_nav > a:eq(0)').attr('title', dateList[0]).removeClass('pd_disabled_link');
                $dialog.find('.pd_log_nav > a:eq(1)').attr('title', dateList[curIndex - 1]).removeClass('pd_disabled_link');
            }
        }
        $dialog.find('.pd_log_nav a').click(function (event) {
            event.preventDefault();
            if ($(this).is('.pd_log_nav a:eq(0)')) {
                curIndex = 0;
            }
            else if ($(this).is('.pd_log_nav a:eq(1)')) {
                if (curIndex > 0) curIndex--;
                else return;
            }
            else if ($(this).is('.pd_log_nav a:eq(2)')) {
                if (curIndex < dateList.length - 1) curIndex++;
                else return;
            }
            else if ($(this).is('.pd_log_nav a:eq(3)')) {
                curIndex = dateList.length - 1;
            }
            $dialog.find('.pd_log_nav h2').text(dateList[curIndex]);
            Log.showLogContent(dateList[curIndex]);
            Log.showLogStat(dateList[curIndex]);
            if (curIndex > 0) {
                $dialog.find('.pd_log_nav > a:eq(0)').attr('title', dateList[0]).removeClass('pd_disabled_link');
                $dialog.find('.pd_log_nav > a:eq(1)').attr('title', dateList[curIndex - 1]).removeClass('pd_disabled_link');
            }
            else {
                $dialog.find('.pd_log_nav > a:lt(2)').removeAttr('title').addClass('pd_disabled_link');
            }
            if (curIndex < dateList.length - 1) {
                $dialog.find('.pd_log_nav > a:eq(2)').attr('title', dateList[curIndex - 1]).removeClass('pd_disabled_link');
                $dialog.find('.pd_log_nav > a:eq(3)').attr('title', dateList[dateList.length - 1]).removeClass('pd_disabled_link');
            }
            else {
                $dialog.find('.pd_log_nav > a:gt(1)').removeAttr('title').addClass('pd_disabled_link');
            }
        }).end().find('input[name="pd_log_sort_type"]').click(function () {
            Config.logSortType = $(this).val();
            ConfigDialog.write();
            Log.showLogContent(dateList[curIndex]);
        }).end().find('input[name="pd_log_stat_type"]').click(function () {
            Config.logStatType = $(this).val();
            ConfigDialog.write();
            Log.showLogStat(dateList[curIndex]);
        }).end().find('#pd_log_stat_days').keyup(function () {
            var days = parseInt($.trim($(this).val()));
            if (days > 0) {
                Config.logStatDays = days;
                ConfigDialog.write();
                $('input[name="pd_log_stat_type"][value="custom"]:not(:checked)').click();
                Log.showLogStat(dateList[curIndex]);
            }
        }).end().find('input[name="pd_log_sort_type"][value="{0}"]'.replace('{0}', Config.logSortType)).click()
            .end().find('input[name="pd_log_stat_type"][value="{0}"]'.replace('{0}', Config.logStatType)).click()
            .end().find('#pd_log_stat_days').val(Config.logStatDays);

        Tools.resize('pd_log');
        Tools.escKeydown('pd_log');
        $dialog.find('h1 > span, .pd_cfg_btns > button:first').focus().click(function () {
            return Tools.close('pd_log');
        }).next('button').click(function (event) {
            event.preventDefault();
            if (window.confirm('是否清除所有日志？')) {
                Log.clear();
                alert('日志已清除');
                location.reload();
            }
        });
        $(window).on('resize.pd_log', function () {
            Tools.resize('pd_log');
        });
    },

    /**
     * 显示指定日期的日志内容
     * @param {string} date 日志对象关键字
     */
    showLogContent: function (date) {
        if ($.type(Log.log[date]) !== 'array') return;
        var logList = Log.log[date];
        if (Config.logSortType === 'type') {
            var sortTypeList = ['捐款', '领取争夺奖励', '批量攻击', '抽取神秘盒子', '抽取道具或卡片', '使用道具', '恢复道具', '将道具转换为能量', '将卡片转换为VIP时间',
                '购买道具', '统计道具购买价格', '出售道具', '神秘抽奖', '统计神秘抽奖结果', '神秘等级升级', '批量转账', '购买帖子', '自动存款'];
            logList.sort(function (a, b) {
                return $.inArray(a.type, sortTypeList) > $.inArray(b.type, sortTypeList);
            });
        }
        else {
            logList.sort(function (a, b) {
                return a.time > b.time;
            });
        }
        var content = '';
        var curType = '';
        $.each(logList, function (index, key) {
            if (typeof key.time === 'undefined' || typeof key.type === 'undefined' || typeof key.action === 'undefined') return;
            var d = new Date(key.time);
            if (Config.logSortType === 'type') {
                if (curType !== key.type) {
                    content += '<h3>【{0}】</h3>'.replace('{0}', key.type);
                    curType = key.type;
                }
                content += '<p><b>{0}：</b>{1}'
                    .replace('{0}', Tools.getTimeString(d))
                    .replace('{1}', key.action.replace(/`([^`]+?)`/g, '<b style="color:#F00">$1</b>'));
            }
            else {
                content += '<p><b>{0} ({1})：</b><br />{2}'
                    .replace('{0}', Tools.getTimeString(d))
                    .replace('{1}', key.type)
                    .replace('{2}', key.action.replace(/`([^`]+?)`/g, '<b style="color:#F00">$1</b>'));
            }
            var stat = '';
            if ($.type(key.gain) === 'object' && !$.isEmptyObject(key.gain)) {
                stat += '，';
                for (var k in key.gain) {
                    if (k === 'item') {
                        for (var itemName in key.gain['item']) {
                            stat += '<i>{0}<em>+{1}</em></i>'.replace('{0}', itemName).replace('{1}', key.gain['item'][itemName].toLocaleString());
                        }
                    }
                    else {
                        stat += '<i>{0}<em>+{1}</em></i>'.replace('{0}', k).replace('{1}', key.gain[k].toLocaleString());
                    }
                }
            }
            if ($.type(key.pay) === 'object' && !$.isEmptyObject(key.pay)) {
                if (!stat) stat += '，';
                for (var k in key.pay) {
                    if (k === 'item') {
                        for (var itemName in key.pay['item']) {
                            stat += '<i>{0}<ins>{1}</ins></i>'.replace('{0}', itemName).replace('{1}', key.pay['item'][itemName].toLocaleString());
                        }
                    }
                    else {
                        stat += '<i>{0}<ins>{1}</ins></i>'.replace('{0}', k).replace('{1}', key.pay[k].toLocaleString());
                    }
                }
            }
            content += stat + '</p>';
        });
        $('#pd_log_content').html(content).prev('legend').text('日志内容 (共{0}项)'.replace('{0}', Log.log[date].length));
    },

    /**
     * 显示指定日期的日志统计结果
     * @param {string} date 日志对象关键字
     */
    showLogStat: function (date) {
        if ($.type(Log.log[date]) !== 'array') return;
        var log = {};
        if (Config.logStatType === 'custom') {
            var dateList = Tools.getObjectKeyList(Log.log, 1);
            var minDate = new Date(date);
            minDate.setDate(minDate.getDate() - Config.logStatDays + 1);
            minDate = Tools.getDateString(minDate);
            for (var k in dateList) {
                if (dateList[k] >= minDate && dateList[k] <= date) {
                    log[dateList[k]] = Log.log[dateList[k]];
                }
            }
        }
        else if (Config.logStatType === 'all') {
            log = Log.log;
        }
        else {
            log[date] = Log.log[date];
        }
        var income = {}, expense = {}, profit = {}, smBox = [];
        for (var d in log) {
            $.each(log[d], function (index, key) {
                if (key.notStat || typeof key.type === 'undefined') return;
                if ($.type(key.gain) === 'object') {
                    for (var k in key.gain) {
                        if (k === 'item' || k === '夺取KFB') continue;
                        if (typeof income[k] === 'undefined') income[k] = key.gain[k];
                        else income[k] += key.gain[k];
                    }
                    if (key.type === '抽取神秘盒子' && typeof key.gain['KFB'] !== 'undefined') {
                        smBox.push(key.gain['KFB']);
                    }
                }
                if ($.type(key.pay) === 'object') {
                    for (var k in key.pay) {
                        if (k === 'item' || k === '夺取KFB') continue;
                        if (typeof expense[k] === 'undefined') expense[k] = key.pay[k];
                        else expense[k] += key.pay[k];
                    }
                }
            });
        }
        var sortStatItemList = function (obj) {
            var sortTypeList = ['KFB', '经验值', '能量', 'VIP小时', '贡献', '神秘', '燃烧伤害', '命中', '闪避', '暴击比例', '暴击几率',
                '防御', '道具', '已使用道具', '有效道具', '无效道具', '卡片'];
            var list = Tools.getObjectKeyList(obj, 0);
            list.sort(function (a, b) {
                return $.inArray(a, sortTypeList) > $.inArray(b, sortTypeList);
            });
            return list;
        };
        var content = '';
        content += '<strong>收获：</strong>';
        sortStatItemList(income);
        $.each(sortStatItemList(income), function (index, key) {
            profit[key] = income[key];
            content += '<i>{0}<em>+{1}</em></i>'.replace('{0}', key).replace('{1}', income[key].toLocaleString());
        });
        content += '<br /><strong>付出：</strong>';
        $.each(sortStatItemList(expense), function (index, key) {
            if (typeof profit[key] === 'undefined') profit[key] = expense[key];
            else profit[key] += expense[key];
            content += '<i>{0}<ins>{1}</ins></i>'.replace('{0}', key).replace('{1}', expense[key].toLocaleString());
        });
        content += '<br /><strong>结余：</strong>';
        $.each(sortStatItemList(profit), function (index, key) {
            content += '<i>{0}{1}</i>'.replace('{0}', key).replace('{1}', Tools.getStatFormatNumber(profit[key]));
        });
        if (Config.autoDrawSmbox2Enabled) {
            var smBoxIncome = 0, minSmBox = 0, maxSmBox = 0;
            $.each(smBox, function (index, kfb) {
                smBoxIncome += kfb;
                if (index === 0) minSmBox = kfb;
                if (minSmBox > kfb) minSmBox = kfb;
                if (maxSmBox < kfb) maxSmBox = kfb;
            });
            content += ('<br /><strong>神秘盒子收获(KFB)：</strong><i>抽取次数<em>+{0}</em></i><i>合计<em>+{1}</em></i><i>平均值<em>+{2}</em></i>' +
            '<i>最小值<em>+{3}</em></i><i>最大值<em>+{4}</em></i>')
                .replace('{0}', smBox.length.toLocaleString())
                .replace('{1}', smBoxIncome.toLocaleString())
                .replace('{2}', smBox.length > 0 ? (smBoxIncome / smBox.length).toFixed(2).toLocaleString() : 0)
                .replace('{3}', minSmBox.toLocaleString())
                .replace('{4}', maxSmBox.toLocaleString());
        }
        $('#pd_log_stat').html(content);
    }
};

/**
 * 临时日志类
 */
var TmpLog = {
    // 保存临时日志的键值名称
    name: 'pd_tmp_log',
    // 临时日志对象
    log: {},

    /**
     * 读取临时日志
     */
    read: function () {
        TmpLog.log = {};
        var log = localStorage[TmpLog.name + '_' + KFOL.uid];
        if (!log) return;
        try {
            log = JSON.parse(log);
        }
        catch (ex) {
            return;
        }
        if (!log || $.type(log) !== 'object') return;
        TmpLog.log = log;
    },

    /**
     * 写入临时日志
     */
    write: function () {
        localStorage[TmpLog.name + '_' + KFOL.uid] = JSON.stringify(TmpLog.log);
    },

    /**
     * 获取指定名称的临时日志内容
     * @param {string} key 日志名称
     * @returns {*} 日志内容
     */
    getValue: function (key) {
        TmpLog.read();
        if (typeof TmpLog.log[key] !== 'undefined') return TmpLog.log[key];
        else return null;
    },

    /**
     * 设置指定名称的临时日志内容
     * @param {string} key 日志名称
     * @param {*} value 日志内容
     */
    setValue: function (key, value) {
        TmpLog.read();
        TmpLog.log[key] = value;
        TmpLog.write();
    },

    /**
     * 删除指定名称的临时日志
     * @param {string} key 日志名称
     */
    deleteValue: function (key) {
        TmpLog.read();
        if (typeof TmpLog.log[key] !== 'undefined') {
            delete TmpLog.log[key];
            TmpLog.write();
        }
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
     * @param {number} options.itemLevel 道具等级
     * @param {string} options.itemName 道具名称
     * @param {jQuery} [options.$itemLine] 当前转换道具所在的表格行（用于转换类型1）
     */
    convertItemsToEnergy: function (options) {
        var settings = {
            type: 1,
            urlList: [],
            safeId: '',
            itemLevel: 0,
            itemName: '',
            $itemLine: null
        };
        $.extend(settings, options);
        var successNum = 0;
        var energyNum = Item.getGainEnergyNumByLevel(settings.itemLevel);
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
                    KFOL.showFormatLog('将道具转换为能量', html);
                    if (/转换为了\s*\d+\s*点能量/i.test(html)) {
                        successNum++;
                    }
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    if (index === settings.urlList.length - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        var successEnergyNum = successNum * energyNum;
                        if (successNum > 0) {
                            Log.push('将道具转换为能量',
                                '共有`{0}`个【`Lv.{1}：{2}`】道具成功转换为能量'
                                    .replace('{0}', successNum)
                                    .replace('{1}', settings.itemLevel)
                                    .replace('{2}', settings.itemName),
                                {
                                    gain: {'能量': successEnergyNum},
                                    pay: {'已使用道具': -successNum}
                                }
                            );
                        }
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
                                .fadeOut('normal', function () {
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
                    }, Config.defAjaxInterval);
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
                            itemLevel: itemLevel,
                            itemName: itemName,
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
     * @param {number} options.itemLevel 道具等级
     * @param {string} options.itemName 道具名称
     * @param {jQuery} [options.$itemLine] 当前恢复道具所在的表格行（用于恢复类型1）
     */
    restoreItems: function (options) {
        var settings = {
            type: 1,
            urlList: [],
            safeId: '',
            itemLevel: 0,
            itemName: '',
            $itemLine: null
        };
        $.extend(settings, options);
        var successNum = 0;
        var failNum = 0;
        var energyNum = Item.getRestoreEnergyNumByLevel(settings.itemLevel);
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
                        Log.push('恢复道具',
                            '共有`{0}`个【`Lv.{1}：{2}`】道具恢复成功，共有`{3}`个道具恢复失败'
                                .replace('{0}', successNum)
                                .replace('{1}', settings.itemLevel)
                                .replace('{2}', settings.itemName)
                                .replace('{3}', failNum),
                            {
                                gain: {'道具': successNum},
                                pay: {'已使用道具': -(successNum + failNum), '能量': -successEnergyNum}
                            }
                        );
                        console.log('共有{0}个道具恢复成功，共有{1}个道具恢复失败，能量-{2}'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum)
                                .replace('{2}', successEnergyNum)
                        );
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>个道具恢复成功，共有<em>{1}</em>个道具恢复失败</strong><i>能量<ins>-{2}</ins></i>'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum)
                                .replace('{2}', successEnergyNum)
                            , duration: -1
                        });
                        if (settings.type === 2) {
                            $('.kf_fw_ig1:eq(1) input[type="checkbox"]:checked')
                                .closest('tr')
                                .fadeOut('normal', function () {
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
                    }, Config.defAjaxInterval);
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
        var $lastLine = $('.kf_fw_ig1:eq(1) > tbody > tr:last-child');
        var itemName = $lastLine.find('td:first-child').text();
        if (!itemName) return;
        var matches = /(\d+)级道具/.exec($lastLine.find('td:nth-child(2)').text());
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
                KFOL.removePopTips($('.pd_pop_tips'));
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
                    itemLevel: itemLevel,
                    itemName: itemName
                });
            })
            .next()
            .click(function () {
                KFOL.removePopTips($('.pd_pop_tips'));
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
                    itemLevel: itemLevel,
                    itemName: itemName
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
     * 从使用道具的回应消息中获取积分数据
     * @param {string} response 使用道具的回应消息
     * @param {number} itemTypeId 道具种类ID
     * @returns {Object|number} 积分对象，-1表示使用失败
     */
    getCreditsViaResponse: function (response, itemTypeId) {
        if (/错误的物品编号/.test(response) || /无法再使用/.test(response)) {
            return -1;
        }
        if (itemTypeId >= 7 && itemTypeId <= 12) {
            if (/成功！/.test(response)) {
                switch (itemTypeId) {
                    case 11:
                        return {'燃烧伤害': 1};
                    case 7:
                        return {'命中': 3, '闪避': 1};
                    case 8:
                        return {'暴击比例': 10};
                    case 12:
                        return {'命中': 1, '闪避': 3};
                    case 9:
                        return {'暴击几率': 3};
                    case 10:
                        return {'防御': 7};
                }
            }
        }
        else {
            var matches = null;
            matches = /恢复能量增加了\s*(\d+)\s*点/i.exec(response);
            if (matches) return {'能量': parseInt(matches[1])};
            matches = /(\d+)KFB/i.exec(response);
            if (matches) return {'KFB': parseInt(matches[1])};
            matches = /(\d+)点?贡献/i.exec(response);
            if (matches) return {'贡献': parseInt(matches[1])};
            matches = /贡献\+(\d+)/i.exec(response);
            if (matches) return {'贡献': parseInt(matches[1])};
        }
        return {};
    },

    /**
     * 使用指定的一系列道具
     * @param {Object} options 设置项
     * @param {number} options.type 使用类型，1：使用本级全部已使用的道具；2：使用本级部分已使用的道具
     * @param {string[]} options.urlList 指定的道具Url列表
     * @param {string} options.safeId 用户的SafeID
     * @param {number} options.itemLevel 道具等级
     * @param {number} options.itemTypeId 道具种类ID
     * @param {string} options.itemName 道具名称
     * @param {jQuery} [options.$itemLine] 当前恢复道具所在的表格行（用于使用类型1）
     */
    useItems: function (options) {
        var settings = {
            type: 1,
            urlList: [],
            safeId: '',
            itemLevel: 0,
            itemTypeId: 0,
            itemName: '',
            $itemLine: null
        };
        $.extend(settings, options);
        $('.kf_fw_ig1').parent().append('<ul class="pd_result"><li><strong>使用结果：</strong></li></ul>');
        var successNum = 0, failNum = 0;
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
                    if (matches && !/错误的物品编号/i.test(html) && !/无法再使用/i.test(html)) successNum++;
                    else failNum++;
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    $('.pd_result').last().append('<li><b>第{0}次：</b>{1}</li>'
                            .replace('{0}', index + 1)
                            .replace('{1}', matches ? matches[1] : '未能获得预期的回应')
                    );
                    if (index === settings.urlList.length - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        var stat = {'有效道具': 0, '无效道具': 0};
                        $('.pd_result').last().find('li').not(':first-child').each(function () {
                            var credits = Item.getCreditsViaResponse($(this).text(), settings.itemTypeId);
                            if (credits !== -1) {
                                if ($.isEmptyObject(credits)) stat['无效道具']++;
                                else stat['有效道具']++;
                                $.each(credits, function (index, credit) {
                                    if (typeof stat[index] === 'undefined')
                                        stat[index] = credit;
                                    else
                                        stat[index] += credit;
                                });
                            }
                        });
                        if (stat['有效道具'] === 0) delete stat['有效道具'];
                        else if (stat['无效道具'] === 0) delete stat['无效道具'];
                        if (successNum > 0) {
                            Log.push('使用道具',
                                '共有`{0}`个【`Lv.{1}：{2}`】道具使用成功{3}'
                                    .replace('{0}', successNum)
                                    .replace('{1}', settings.itemLevel)
                                    .replace('{2}', settings.itemName)
                                    .replace('{3}', failNum > 0 ? '，共有`{0}`个道具使用失败'.replace('{0}', failNum) : ''),
                                {
                                    gain: $.extend({}, stat, {'已使用道具': successNum}),
                                    pay: {'道具': -successNum}
                                }
                            );
                        }
                        var logStat = '', msgStat = '';
                        for (var creditsType in stat) {
                            logStat += '，{0}+{1}'
                                .replace('{0}', creditsType)
                                .replace('{1}', stat[creditsType]);
                            msgStat += '<i>{0}<em>+{1}</em></i>'
                                .replace('{0}', creditsType)
                                .replace('{1}', stat[creditsType]);
                        }
                        var resultStat = msgStat;
                        console.log('共有{0}个道具使用成功，共有{1}个道具使用失败{2}'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum)
                                .replace('{2}', logStat)
                        );
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>个道具使用成功{1}</strong>{2}'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum > 0 ? '，共有<em>{0}</em>个道具使用失败'.replace('{0}', failNum) : '')
                                .replace('{2}', msgStat)
                            , duration: -1
                        });
                        if (settings.type === 2) {
                            $('.kf_fw_ig1 input[type="checkbox"]:checked')
                                .closest('tr')
                                .fadeOut('normal', function () {
                                    $(this).remove();
                                });
                        }
                        $('.pd_result').last().append('<li class="pd_stat"><b>统计结果：</b>{0}</li>'.replace('{0}', resultStat));
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('UseItems');
                    }, Config.defAjaxInterval);
                }, 'html');
            });
        });
        $(document).dequeue('UseItems');
    },

    /**
     * 出售指定的一系列道具
     * @param {Object} options 设置项
     * @param {string[]} options.itemList 指定的道具ID列表
     * @param {string} options.safeId 用户的SafeID
     * @param {number} options.itemLevel 道具等级
     * @param {string} options.itemName 道具名称
     */
    sellItems: function (options) {
        var settings = {
            itemList: [],
            itemLevel: 0,
            itemName: ''
        };
        $.extend(settings, options);
        /**
         * 获取指定等级道具的出售所得
         * @param {number} itemLevel 道具等级
         * @returns {number} 出售所得
         */
        var getSellItemGain = function (itemLevel) {
            switch (itemLevel) {
                case 3:
                    return 300;
                case 4:
                    return 2000;
                case 5:
                    return 8000;
                default:
                    return 0;
            }
        };
        var successNum = 0, failNum = 0, totalGain = 0;
        $(document).queue('SellItems', []);
        $.each(settings.itemList, function (index, itemId) {
            var url = 'kf_fw_ig_shop.php?sell=yes&id={0}'.replace('{0}', itemId);
            $(document).queue('SellItems', function () {
                $.get(url, function (html) {
                    KFOL.showFormatLog('出售道具', html);
                    if (/出售成功/.test(html)) {
                        successNum++;
                        totalGain += getSellItemGain(settings.itemLevel);
                    }
                    else failNum++;
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    if (index === settings.itemList.length - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        if (successNum > 0) {
                            Log.push('出售道具',
                                '共有`{0}`个【`Lv.{1}：{2}`】道具出售成功'
                                    .replace('{0}', successNum)
                                    .replace('{1}', settings.itemLevel)
                                    .replace('{2}', settings.itemName),
                                {
                                    gain: {'KFB': totalGain},
                                    pay: {'道具': -successNum}
                                }
                            );
                        }
                        console.log('共有{0}个道具出售成功，共有{1}个道具出售失败，KFB+{2}'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum)
                                .replace('{2}', totalGain)
                        );
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>个道具出售成功{1}</strong><i>KFB<em>+{2}</em></i>'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum > 0 ? '，共有<em>{0}</em>个道具出售失败'.replace('{0}', failNum) : '')
                                .replace('{2}', totalGain)
                            , duration: -1
                        });
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('SellItems');
                    }, Config.defAjaxInterval);
                }, 'html');
            });
        });
        $(document).dequeue('SellItems');
    },

    /**
     * 添加批量购买和使用道具的按钮
     */
    addSellAndUseItemsButton: function () {
        var safeId = KFOL.getSafeId();
        if (!safeId) return;
        var $lastLine = $('.kf_fw_ig1 > tbody > tr:last-child');
        var itemName = $lastLine.find('td:first-child').text();
        if (!itemName) return;
        var matches = /(\d+)级道具/.exec($lastLine.find('td:nth-child(2)').text());
        if (!matches) return;
        var itemLevel = parseInt(matches[1]);
        var itemTypeId = parseInt(Tools.getUrlParam('lv'));
        if (!itemTypeId) return;
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
                KFOL.removePopTips($('.pd_pop_tips'));
                var urlList = [];
                $('.kf_fw_ig1 input[type="checkbox"]:checked').each(function () {
                    urlList.push('kf_fw_ig_my.php?pro={0}'.replace('{0}', $(this).val()));
                });
                if (urlList.length === 0) return;
                if (!window.confirm('共选择了{0}个道具，是否批量【使用】道具？'.replace('{0}', urlList.length))) return;
                KFOL.showWaitMsg('<strong>正在使用道具中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', urlList.length)
                    , true);
                Item.useItems({
                    type: 2,
                    urlList: urlList,
                    safeId: safeId,
                    itemLevel: itemLevel,
                    itemTypeId: itemTypeId,
                    itemName: itemName
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
        if (itemTypeId >= 7 && itemTypeId <= 12) {
            $('<button class="pd_highlight">出售道具</button>').prependTo('.pd_item_btns').click(function () {
                KFOL.removePopTips($('.pd_pop_tips'));
                var itemList = [];
                $('.kf_fw_ig1 input[type="checkbox"]:checked').each(function () {
                    itemList.push($(this).val());
                });
                if (itemList.length === 0) return;
                if (!window.confirm('共选择了{0}个道具，是否批量【出售】道具？'.replace('{0}', itemList.length))) return;
                KFOL.showWaitMsg('<strong>正在出售道具中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', itemList.length)
                    , true);
                Item.sellItems({
                    itemList: itemList,
                    itemLevel: itemLevel,
                    itemName: itemName
                });
            });
        }
    },

    /**
     * 统计批量购买道具的购买价格
     * @param {jQuery} $result 购买结果的jQuery对象
     */
    statBuyItemsPrice: function ($result) {
        var successNum = 0, failNum = 0, totalPrice = 0, minPrice = 0, maxPrice = 0, totalNum = $result.find('li > a').length;
        KFOL.showWaitMsg('<strong>正在统计购买价格中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                .replace('{0}', totalNum)
            , true);
        $(document).queue('StatBuyItemsPrice', []);
        $result.find('li > a').each(function (index) {
            var $this = $(this);
            var itemId = $this.data('id');
            if (!itemId) return;
            $(document).queue('StatBuyItemsPrice', function () {
                $.get('kf_fw_ig_my.php?pro=' + itemId, function (html) {
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    var matches = /从商店购买，购买价(\d+)KFB。<br>/i.exec(html);
                    if (matches) {
                        successNum++;
                        var price = parseInt(matches[1]);
                        totalPrice += price;
                        if (minPrice === 0) minPrice = price;
                        else if (price < minPrice) minPrice = price;
                        if (price > maxPrice) maxPrice = price;
                        $this.after('（购买价：<b class="pd_highlight">{0}</b>KFB）'.replace('{0}', price));
                    }
                    else {
                        failNum++;
                        $this.after('<span class="pd_notice">（未能获得预期的回应）</span>');
                    }
                    if (index === totalNum - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        if (successNum > 0) {
                            Log.push('统计道具购买价格', '共有`{0}`个道具统计成功{1}，总计价格：`{2}`，平均价格：`{3}`，最低价格：`{4}`，最高价格：`{5}`'
                                    .replace('{0}', successNum)
                                    .replace('{1}', failNum > 0 ? '（共有`{0}`个道具未能统计成功）'.replace('{0}', failNum) : '')
                                    .replace('{2}', totalPrice.toLocaleString())
                                    .replace('{3}', successNum > 0 ? (totalPrice / successNum).toFixed(2).toLocaleString() : 0)
                                    .replace('{4}', minPrice.toLocaleString())
                                    .replace('{5}', maxPrice.toLocaleString())
                                , {pay: {'KFB': -totalPrice}}
                            );
                        }
                        console.log('统计道具购买价格（KFB）（共有{0}个道具未能统计成功），统计成功数量：{1}，总计价格：{2}，平均价格：{3}，最低价格：{4}，最高价格：{5}'
                                .replace('{0}', failNum)
                                .replace('{1}', successNum)
                                .replace('{2}', totalPrice.toLocaleString())
                                .replace('{3}', successNum > 0 ? (totalPrice / successNum).toFixed(2).toLocaleString() : 0)
                                .replace('{4}', minPrice.toLocaleString())
                                .replace('{5}', maxPrice.toLocaleString())
                        );
                        $result.append(
                            ('<li class="pd_stat"><b>统计结果{0}：</b><br /><i>统计成功数量：<em>{1}</em></i><i>总计价格：<em>{2}</em></i>' +
                            '<i>平均价格：<em>{3}</em></i><i>最低价格：<em>{4}</em></i><i>最高价格：<em>{5}</em></i></li>')
                                .replace('{0}', failNum > 0 ? '<span class="pd_notice">（共有{0}个道具未能统计成功）</span>'.replace('{0}', failNum) : '')
                                .replace('{1}', successNum)
                                .replace('{2}', totalPrice.toLocaleString())
                                .replace('{3}', successNum > 0 ? (totalPrice / successNum).toFixed(2).toLocaleString() : 0)
                                .replace('{4}', minPrice.toLocaleString())
                                .replace('{5}', maxPrice.toLocaleString())
                        );
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('StatBuyItemsPrice');
                    }, Config.defAjaxInterval);
                }, 'html');
            });
        });
        $(document).dequeue('StatBuyItemsPrice');
    },

    /**
     * 添加批量购买道具的链接
     */
    addBatchBuyItemsLink: function () {
        $('.kf_fw_ig1 > tbody > tr > td:last-child > a').click(function () {
            var $this = $(this);
            var itemLevel = parseInt($this.closest('tr').find('td:first-child').text());
            if (!itemLevel) return;
            var itemName = $this.closest('tr').find('td:nth-child(2)').text();
            if (!itemName) return;
            if (!window.confirm(
                    '是否购买【Lv.{0}：{1}】道具？'
                        .replace('{0}', itemLevel)
                        .replace('{1}', itemName)
                )
            ) {
                return false;
            }
        });
        $('.kf_fw_ig1 > tbody > tr:gt(1)').each(function () {
            $(this).find('td:last-child').css('width', '110px').append('<a class="pd__batch_buy_items" style="margin-left:15px" href="#">批量购买</a>');
        });
        $('a.pd__batch_buy_items').click(function (event) {
            event.preventDefault();
            KFOL.removePopTips($('.pd_pop_tips'));
            var $this = $(this);
            var itemLevel = parseInt($this.closest('tr').find('td:first-child').text());
            if (!itemLevel) return;
            var itemName = $this.closest('tr').find('td:nth-child(2)').text();
            if (!itemName) return;
            var link = $this.prev('a').attr('href');
            if (!link) return;
            var num = parseInt($.trim(window.prompt('你要批量购买多少个【Lv.{0}：{1}】道具？'
                    .replace('{0}', itemLevel)
                    .replace('{1}', itemName)
                , 0)));
            if (isNaN(num) || num <= 0) return;
            KFOL.showWaitMsg('<strong>正在购买道具中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                    .replace('{0}', num)
                , true);
            $('.kf_fw_ig1').parent().append('<ul class="pd_result"><li><strong>购买结果：</strong></li></ul>');
            var successNum = 0;
            $(document).queue('BatchBuyItems', []);
            $.each(new Array(num), function (index) {
                $(document).queue('BatchBuyItems', function () {
                    $.get(link, function (html) {
                        KFOL.showFormatLog('购买道具', html);
                        var $remainingNum = $('#pd_remaining_num');
                        $remainingNum.text(parseInt($remainingNum.text()) - 1);
                        var isStop = false;
                        var matches = /<a href="kf_fw_ig_my\.php\?pro=(\d+)">/i.exec(html);
                        if (matches) {
                            successNum++;
                            $('.pd_result:last').append(
                                '<li>第{0}次：获得了<a target="_blank" href="kf_fw_ig_my.php?pro={1}" data-id="{1}">一个道具</a></li>'
                                    .replace('{0}', index + 1)
                                    .replace(/\{1\}/g, matches[1])
                            );
                        }
                        else if (/你需要持有该道具两倍市场价的KFB/i.test(html)) {
                            $('.pd_result:last').append('<li>第{0}次：你需要持有该道具两倍市场价的KFB，购买操作中止</li>'.replace('{0}', index + 1));
                            isStop = true;
                            $(document).queue('BatchBuyItems', []);
                        }
                        if (isStop || index === num - 1) {
                            KFOL.removePopTips($('.pd_pop_tips'));
                            Log.push('购买道具', '共有`{0}`个【`Lv.{1}：{2}`】道具购买成功'
                                    .replace('{0}', successNum)
                                    .replace('{1}', itemLevel)
                                    .replace('{2}', itemName)
                                , {'道具': successNum}
                            );
                            console.log('共有{0}个【Lv.{1}：{2}】道具购买成功'
                                    .replace('{0}', successNum)
                                    .replace('{1}', itemLevel)
                                    .replace('{2}', itemName)
                            );
                            KFOL.showMsg({
                                msg: '<strong>共有<em>{0}</em>个【<em>Lv.{1}</em>{2}】道具购买成功</strong>'
                                    .replace('{0}', successNum)
                                    .replace('{1}', itemLevel)
                                    .replace('{2}', itemName)
                                , duration: -1
                            });
                            $('<li><a href="#">统计购买价格</a></li>').appendTo('.pd_result:last')
                                .find('a').click(function (event) {
                                    event.preventDefault();
                                    var $result = $(this).closest('.pd_result');
                                    $(this).parent().remove();
                                    KFOL.removePopTips($('.pd_pop_tips'));
                                    Item.statBuyItemsPrice($result, successNum);
                                });
                        }
                        window.setTimeout(function () {
                            $(document).dequeue('BatchBuyItems');
                        }, Config.defAjaxInterval);
                    }, 'html');
                });
            });
            $(document).dequeue('BatchBuyItems');
        });
    }
};

/**
 * 卡片类
 */
var Card = {
    /**
     * 将指定的一系列卡片转换为VIP时间
     * @param {number[]} cardList 卡片ID列表
     * @param {string} safeId 用户的SafeID
     */
    convertCardsToVipTime: function (cardList, safeId) {
        var successNum = 0, failNum = 0, totalVipTime = 0, totalEnergy = 0;
        $(document).queue('ConvertCardsToVipTime', []);
        $.each(cardList, function (index, cardId) {
            var url = 'kf_fw_card_doit.php?do=recard&id={0}&safeid={1}'.replace('{0}', cardId).replace('{1}', safeId);
            $(document).queue('ConvertCardsToVipTime', function () {
                $.get(url, function (html) {
                    KFOL.showFormatLog('将卡片转换为VIP时间', html);
                    var matches = /增加(\d+)小时VIP时间(?:.*?获得(\d+)点恢复能量)?/i.exec(html);
                    if (matches) {
                        successNum++;
                        totalVipTime += parseInt(matches[1]);
                        if (typeof matches[2] !== 'undefined') totalEnergy += parseInt(matches[2]);
                    }
                    else failNum++;
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    if (index === cardList.length - 1) {
                        if (successNum > 0) {
                            Log.push('将卡片转换为VIP时间', '共有`{0}`张卡片成功为VIP时间'.replace('{0}', successNum),
                                {
                                    gain: {'VIP小时': totalVipTime, '能量': totalEnergy},
                                    pay: {'卡片': -successNum}
                                }
                            );
                        }
                        KFOL.removePopTips($('.pd_pop_tips'));
                        console.log('共有{0}张卡片转换成功，共有{1}张卡片转换失败，VIP小时+{2}，能量+{3}'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum)
                                .replace('{2}', totalVipTime)
                                .replace('{3}', totalEnergy)
                        );
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>张卡片转换成功{1}</strong><i>VIP小时<em>+{2}</em></i><i>能量<em>+{3}</em></i>'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum > 0 ? '，共有<em>{0}</em>张卡片转换失败'.replace('{0}', failNum) : '')
                                .replace('{2}', totalVipTime)
                                .replace('{3}', totalEnergy)
                            , duration: -1
                        });
                        $('.kf_fw_ig2 .pd_card_chk:checked')
                            .closest('td')
                            .fadeOut('normal', function () {
                                var $parent = $(this).parent();
                                $(this).remove();
                                if ($parent.children().length === 0) $parent.remove();
                            });
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('ConvertCardsToVipTime');
                    }, Config.defAjaxInterval);
                }, 'html');
            });
        });
        $(document).dequeue('ConvertCardsToVipTime');
    },

    /**
     * 添加开启批量模式的按钮
     */
    addStartBatchModeButton: function () {
        var safeId = KFOL.getSafeId();
        if (!safeId) return;
        if ($('.kf_fw_ig2 a[href^="kf_fw_card_my.php?id="]').length === 0) return;
        $('<div class="pd_item_btns"><button>开启批量模式</button></div>').insertAfter('.kf_fw_ig2')
            .find('button').click(function () {
                var $this = $(this);
                var $cardLines = $('.kf_fw_ig2 > tbody > tr:gt(2)');
                if ($this.text() === '开启批量模式') {
                    $this.text('关闭批量模式');
                    $cardLines.on('click', 'a', function (event) {
                        event.preventDefault();
                        $(this).next('.pd_card_chk').click();
                    }).find('td').has('a').each(function () {
                        var matches = /kf_fw_card_my\.php\?id=(\d+)/.exec($(this).find('a').attr('href'));
                        if (!matches) return;
                        $(this).css('position', 'relative')
                            .append('<input class="pd_card_chk" type="checkbox" value="{0}" />'
                                .replace('{0}', matches[1]));
                    });
                    var playedCardList = [];
                    $('.kf_fw_ig2 > tbody > tr:nth-child(2) > td').each(function () {
                        var matches = /kf_fw_card_my\.php\?id=(\d+)/.exec($(this).find('a').attr('href'));
                        if (!matches) return;
                        playedCardList.push(parseInt(matches[1]));
                    });
                    var uncheckPlayedCard = function () {
                        for (var i in playedCardList) {
                            $cardLines.find('td').has('a[href="kf_fw_card_my.php?id={0}"]'.replace('{0}', playedCardList[i]))
                                .find('input:checked').prop('checked', false);
                        }
                    };
                    $this.before('<label><input id="uncheckPlayedCard" type="checkbox" checked="checked" /> 不选已出战的卡片</label>' +
                    '<button>每类只保留一张</button><button>全选</button><button>反选</button><br /><button>转换为VIP时间</button>')
                        .prev()
                        .click(function () {
                            KFOL.removePopTips($('.pd_pop_tips'));
                            var cardList = [];
                            $cardLines.find('input:checked').each(function () {
                                cardList.push(parseInt($(this).val()));
                            });
                            if (cardList.length === 0) return;
                            if (!window.confirm('共选择了{0}张卡片，是否将卡片批量转换为VIP时间？'.replace('{0}', cardList.length))) return;
                            KFOL.showWaitMsg('<strong>正在批量转换中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                                    .replace('{0}', cardList.length)
                                , true);
                            Card.convertCardsToVipTime(cardList, safeId);
                        })
                        .prev()
                        .prev()
                        .click(function () {
                            $cardLines.find('input').each(function () {
                                $(this).prop('checked', !$(this).prop('checked'));
                            });
                            if ($('#uncheckPlayedCard').prop('checked')) uncheckPlayedCard();
                        })
                        .prev()
                        .click(function () {
                            $cardLines.find('input').prop('checked', true);
                            if ($('#uncheckPlayedCard').prop('checked')) uncheckPlayedCard();
                        })
                        .prev()
                        .click(function () {
                            $cardLines.find('input').prop('checked', true);
                            if ($('#uncheckPlayedCard').prop('checked')) uncheckPlayedCard();
                            var cardTypeList = [];
                            $cardLines.find('a > img').each(function () {
                                var src = $(this).attr('src');
                                if ($.inArray(src, cardTypeList) === -1) cardTypeList.push(src);
                            });
                            for (var i in cardTypeList) {
                                var $cardElems = $cardLines.find('td').has('img[src="{0}"]'.replace('{0}', cardTypeList[i]));
                                var totalNum = $cardElems.length;
                                var checkedNum = $cardElems.has('input:checked').length;
                                if (totalNum > 1) {
                                    if (totalNum === checkedNum) {
                                        $cardElems.eq(0).find('input:checked').prop('checked', false);
                                    }
                                }
                                else {
                                    $cardElems.find('input:checked').prop('checked', false);
                                }
                            }
                        });
                }
                else {
                    $this.text('开启批量模式');
                    $cardLines.off('click').find('.pd_card_chk').remove();
                    $this.prevAll().remove();
                }
            });
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
     * 给活期帐户存款
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
                    console.log('共有{0}KFB存入活期存款'.replace('{0}', money));
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
     * 从活期帐户取款
     * @param {number} money 取款金额（KFB）
     */
    drawCurrentDeposit: function (money) {
        var $tips = KFOL.showWaitMsg('正在取款中...', true);
        $.post('hack.php?H_name=bank',
            {action: 'draw', btype: 1, drawmoney: money},
            function (html) {
                KFOL.removePopTips($tips);
                if (/完成取款/.test(html)) {
                    KFOL.showFormatLog('取款', html);
                    console.log('从活期存款中取出了{0}KFB'.replace('{0}', money));
                    KFOL.showMsg('从活期存款中取出了<em>{0}</em>KFB'.replace('{0}', money), -1);
                }
                else if (/取款金额大于您的存款金额/.test(html)) {
                    KFOL.showMsg('取款金额大于当前活期存款金额', -1);
                }
                else if (/\d+秒内不允许重新交易/.test(html)) {
                    KFOL.showMsg('提交速度过快', -1);
                }
                else {
                    KFOL.showMsg('取款失败', -1);
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
                $.ajax({
                    url: 'hack.php?H_name=bank',
                    type: 'post',
                    data: '&action=virement&pwuser={0}&to_money={1}&memo={2}'
                        .replace('{0}', Tools.getGBKEncodeString(key[0]))
                        .replace('{1}', key[1])
                        .replace('{2}', Tools.getGBKEncodeString(msg))
                    ,
                    success: function (html) {
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
                            else if (/转账额度不足/.test(html)) {
                                statMsg = '转账额度不足';
                            }
                            else if (/当前等级无法使用该功能/.test(html)) {
                                statMsg = '当前等级无法使用转账功能';
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
                            if (successNum > 0) {
                                Log.push('批量转账', '共有`{0}`名用户转账成功'.replace('{0}', successNum), {pay: {'KFB': -successMoney}});
                            }
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
                            $('.pd_result').last().append('<li><b>共有<em>{0}</em>名用户转账成功{1}：</b>KFB<ins>-{2}</ins></li>'
                                    .replace('{0}', successNum)
                                    .replace('{1}', failNum > 0 ? '，共有<em>{0}</em>名用户转账失败'.replace('{0}', failNum) : '')
                                    .replace('{2}', successMoney)
                            );
                            KFOL.showMsg('<strong>共有<em>{0}</em>名用户转账成功{1}</strong><i>KFB<ins>-{2}</ins></i>'
                                    .replace('{0}', successNum)
                                    .replace('{1}', failNum > 0 ? '，共有<em>{0}</em>名用户转账失败'.replace('{0}', failNum) : '')
                                    .replace('{2}', successMoney)
                            );
                        }
                        window.setTimeout(function () {
                            $(document).dequeue('Bank');
                        }, 5000);
                    },
                    dataType: 'html'
                });
            });
        });
        if (!isDeposited) $(document).dequeue('Bank');
    },

    /**
     * 添加批量转账的按钮
     */
    addBatchTransferButton: function () {
        var html =
            '<tr id="pd_bank_transfer">' +
            '  <td style="vertical-align:top">使用说明：<br />每行一名用户，<br />如需单独设定金额，<br />可写为“用户名:金额”<br />（注意是<b>英文冒号</b>）<br />' +
            '例子：<br /><pre style="border:1px solid #9999FF;padding:5px">张三\n李四:200\n王五:500\n信仰风</pre></td>' +
            '  <td>' +
            '  <form>' +
            '    <div style="display:inline-block"><label>用户列表：<br />' +
            '<textarea class="pd_textarea" id="pd_bank_users" style="width:270px;height:250px"></textarea></label></div>' +
            '    <div style="display:inline-block;margin-left:10px;">' +
            '      <label>通用转帐金额（如所有用户都已设定单独金额则可留空）：<br />' +
            '<input class="pd_input" id="pd_bank_money" type="text" style="width:217px" maxlength="15" /></label><br />' +
            '      <label style="margin-top:5px">转帐附言（可留空）：<br />' +
            '<textarea class="pd_textarea" id="pd_bank_msg" style="width:225px;height:206px" id="pd_bank_users"></textarea></label>' +
            '    </div>' +
            '    <div><label><input class="pd_input" type="submit" value="批量转账" /></label>' +
            '<label><input style="margin-left:5px" class="pd_input" type="reset" value="重置" /></label> ' +
            '（活期存款不足时，可自动进行存款；在正常情况下，批量转账金额不会从定期存款中扣除）</div>' +
            '  </form>' +
            '  </td>' +
            '</tr>';
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
                if (users.length === 0) return;
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
                $('#pd_bank_transfer > td:last-child').append('<ul class="pd_result pd_stat"><li><strong>转账结果：</strong></li></ul>');
                Bank.batchTransfer(users, msg, isDeposited, currentDeposit);
            });
        var $account = $('.bank1 > tbody > tr:nth-child(2) > td:contains("可获利息：")');
        var accountHtml = $account.html();
        var matches = /可获利息：(\d+)\(/i.exec(accountHtml);
        if (matches) {
            var interest = parseInt(matches[1]);
            if (interest > 0) {
                $account.html(accountHtml.replace(/可获利息：\d+\(/i,
                        '可获利息：<b class="pd_highlight">{0}</b>('.replace('{0}', interest)
                    )
                );
            }
        }
    }
};

/**
 * 争夺类
 */
var Loot = {
    /**
     * 显示领取争夺奖励的时间
     */
    showGetLootAwardTime: function () {
        $('form[name="rvrc1"]').submit(function () {
            var gain = parseInt($('input[name="submit1"][value="已经可以领取KFB，请点击这里获取"]').parent('td').find('span:eq(0)').text());
            if (!isNaN(gain) && gain >= 0) {
                TmpLog.setValue(Config.getLootAwardTmpLogName, Tools.getDate('+' + Config.defLootInterval + 'm').getTime() + 10 * 1000);
                Log.push('领取争夺奖励', '领取争夺奖励', {gain: {'KFB': gain}});
            }
        });
        var $submit = $('input[name="submit1"][value$="领取，点击这里抢别人的"]');
        if ($submit.length > 0) {
            var time = TmpLog.getValue(Config.getLootAwardTmpLogName);
            if (!time || $.type(time) !== 'number') return;
            var diff = Math.floor((time - (new Date()).getTime()) / 1000);
            if (diff <= 0) return;
            var hours = Math.floor(diff / 60 / 60);
            var matches = /还有(\d+)小时领取，点击这里抢别人的/.exec($submit.val());
            if (matches) {
                if (hours !== parseInt(matches[1])) return;
                var minutes = Math.floor((diff - hours * 60 * 60) / 60);
                if (minutes < 0) minutes = 0;
                $submit.css('width', '270px').val('还有{0}小时{1}分领取，点击这里抢别人的'.replace('{0}', hours).replace('{1}', minutes));
            }
            else {
                if (hours !== 0) return;
            }
            var end = new Date(time);
            $submit.prev().prev().before('<span class="pd_highlight">可领取时间：{0}</span>'
                    .replace('{0}', Tools.getDateString(end) + ' ' + Tools.getTimeString(end, ':', false))
            );
        }
    },

    /**
     * 领取争夺奖励
     * @param {boolean} isAutoDonation 是否自动捐款
     */
    getLootAward: function (isAutoDonation) {
        console.log('领取争夺奖励Start');
        $.get('kf_fw_ig_index.php', function (html) {
            var matches = /<INPUT name="submit1" type="submit" value="(.+?)"/i.exec(html);
            if (!matches) {
                Tools.setCookie(Config.getLootAwardCookieName, 1, Tools.getDate('+' + Config.defLootInterval + 'm'));
                return;
            }
            var remainingMatches = /还有(\d+)(分钟|小时)领取/i.exec(matches[1]);
            if (remainingMatches) {
                var lootInterval = parseInt(remainingMatches[1]);
                if (remainingMatches[2] === '小时') lootInterval = lootInterval * 60;
                lootInterval++;
                Tools.setCookie(Config.getLootAwardCookieName, 1, Tools.getDate('+' + lootInterval + 'm'));
                return;
            }
            if (/(点击这里预领KFB|已经可以领取KFB)/i.test(matches[1])) {
                var gainMatches = /当前拥有\s*<span style=".+?">(\d+)<\/span>\s*预领KFB<br \/>/i.exec(html);
                var gain = 0;
                if (gainMatches) gain = parseInt(gainMatches[1]);
                $.post('kf_fw_ig_index.php',
                    {submit1: 1, one: 1},
                    function (html) {
                        Tools.setCookie(Config.getLootAwardCookieName, 1, Tools.getDate('+' + Config.defLootInterval + 'm'));
                        KFOL.showFormatLog('领取争夺奖励', html);
                        if (/(领取成功！|已经预领\d+KFB)/i.test(html)) {
                            TmpLog.setValue(Config.getLootAwardTmpLogName, Tools.getDate('+' + Config.defLootInterval + 'm').getTime());
                            Log.push('领取争夺奖励', '领取争夺奖励', {gain: {'KFB': gain}});
                            console.log('领取争夺奖励，KFB+' + gain);
                            KFOL.showMsg('<strong>领取争夺奖励</strong><i>KFB<em>+{0}</em></i><a target="_blank" href="kf_fw_ig_pklist.php">手动攻击</a>'
                                    .replace('{0}', gain)
                            );
                            if (isAutoDonation) KFOL.donation(false);
                        }
                    }, 'html');
            }
            else {
                Tools.setCookie(Config.getLootAwardCookieName, 1, Tools.getDate('+' + Config.defLootInterval + 'm'));
            }
        }, 'html');
    },

    getGainViaMsg: function (msg) {
        var gain = {};
        var matches = /被实际夺取(\d+)KFB/i.exec(msg);
        if (matches) gain['夺取KFB'] = parseInt(matches[1]);
        matches = /被实际燃烧(\d+)KFB/i.exec(msg);
        if (matches) gain['经验值'] = parseInt(matches[1]);
        matches = /掉落道具!(.+?)$/.exec(msg);
        if (matches) {
            gain['道具'] = 1;
            var item = {};
            item[matches[1]] = 1;
            gain['item'] = item;
        }
        return gain;
    },

    /**
     * 批量攻击
     * @param {Object} options 设置项
     * @param {number} options.type 攻击类型，1：在争夺页面中进行批量攻击；2：在自动争夺中进行批量攻击
     * @param {number} options.totalAttackNum 总攻击次数
     * @param {Object} options.attackList 攻击目标列表
     * @param {string} options.safeId 用户的SafeID
     */
    batchAttack: function (options) {
        var settings = {
            type: 1,
            totalAttackNum: 0,
            attackList: {},
            safeId: ''
        };
        $.extend(settings, options);
        $('.kf_fw_ig1').parent().append('<ul class="pd_result"><li><strong>攻击结果：</strong></li></ul>');
        var count = 0, successNum = 0, failNum = 0;
        var gain = {};
        $.each(settings.attackList, function (id, num) {
            for (var i = 1; i <= num; i++) {
                window.setTimeout(function () {
                    $.ajax({
                        type: 'POST',
                        url: 'kf_fw_ig_pkhit.php',
                        data: {uid: id, safeid: settings.safeId},
                        success: function (msg) {
                            if (/发起争夺/.test(msg)) {
                                successNum++;
                                $.each(Loot.getGainViaMsg(msg), function (key, data) {
                                    if (key === 'item') {
                                        if (typeof gain[key] === 'undefined') gain['item'] = {};
                                        for (var k in data) {
                                            if (typeof gain['item'][k] === 'undefined') gain['item'][k] = data[k];
                                            else gain['item'][k] += data[k];
                                        }
                                    }
                                    else {
                                        if (typeof gain[key] === 'undefined') gain[key] = data;
                                        else gain[key] += data;
                                    }
                                });
                            }
                            else failNum++;
                            console.log('【批量攻击】回应：' + msg);
                            $('.pd_result:last').append('<li>{0}</li>'.replace('{0}', msg));
                        },
                        error: function () {
                            failNum++;
                        },
                        complete: function () {
                            var $remainingNum = $('#pd_remaining_num');
                            $remainingNum.text(parseInt($remainingNum.text()) - 1);
                            if (successNum + failNum === settings.totalAttackNum) {
                                KFOL.removePopTips($('.pd_pop_tips'));
                                if (successNum > 0) {
                                    Log.push('批量攻击', '共有`{0}`次攻击成功'.replace('{0}', successNum), {gain: gain});
                                }
                                var msgStat = '', logStat = '', resultStat = '';
                                for (var key in gain) {
                                    if (key === 'item') {
                                        msgStat += '<br />';
                                        for (var itemName in gain['item']) {
                                            msgStat += '<i>{0}<em>+{1}</em></i>'.replace('{0}', itemName).replace('{1}', gain['item'][itemName]);
                                            logStat += '，{0}+{1}'.replace('{0}', itemName).replace('{1}', gain['item'][itemName]);
                                        }
                                    }
                                    else {
                                        msgStat += '<i>{0}<em>+{1}</em></i>'.replace('{0}', key).replace('{1}', gain[key]);
                                        logStat += '，{0}+{1}'.replace('{0}', key).replace('{1}', gain[key]);
                                    }
                                }
                                resultStat = msgStat.replace('</i><br />', '</i>');
                                console.log('共有{0}次攻击成功{1}{2}'
                                        .replace('{0}', successNum)
                                        .replace('{1}', failNum > 0 ? '，共有{0}次攻击失败'.replace('{0}', failNum) : '')
                                        .replace('{2}', logStat)
                                );
                                KFOL.showMsg('<strong>共有<em>{0}</em>次攻击成功{1}</strong>{2}'
                                        .replace('{0}', successNum)
                                        .replace('{1}', failNum > 0 ? '，共有<em>{0}</em>次攻击失败'.replace('{0}', failNum) : '')
                                        .replace('{2}', msgStat)
                                    , -1);
                                $('.pd_result:last').append('<li class="pd_stat"><b>统计结果：</b><br />{0}</li>'.replace('{0}', resultStat ? resultStat : '无'));
                            }
                        },
                        dataType: 'html'
                    });
                }, count * Config.defAjaxInterval);
                count++;
            }
        });
    },

    /**
     * 添加批量攻击按钮
     */
    addBatchAttackButton: function () {
        var safeId = KFOL.getSafeId();
        if (!safeId) return;
        $('.kf_fw_ig1 > tbody > tr > td:last-child').each(function (index) {
            var $this = $(this);
            if (index === 0) $this.attr('colspan', 5);
            else if (index === 1) $this.css('width', '310').after('<td>批量攻击</td>');
            var hitId = parseInt($this.find('a').attr('hitid'));
            if (!hitId) return;
            $this.css('width', '330')
                .after(('<td class="pd_batch_attack" style="width:70px;text-align:center"><label>' +
                '<input style="width:15px" class="pd_input" type="text" maxlength="2" data-id="{0}" value="{1}" /> 次</label></td>')
                    .replace('{0}', hitId)
                    .replace('{1}', Config.batchAttackList[hitId] ? Config.batchAttackList[hitId] : '')
            );
        });
        $('.pd_batch_attack .pd_input').keydown(function (event) {
            if (event.keyCode === 13) {
                $('.pd_item_btns > button:last-child').click();
            }
        });
        /**
         * 获取攻击列表和总次数
         * @param {Object} attackList 攻击目标列表
         * @returns {number} 攻击总次数
         */
        var getAttackNum = function (attackList) {
            var totalAttackNum = 0;
            $('.pd_batch_attack .pd_input').each(function () {
                var $this = $(this);
                var attackNum = $.trim($this.val());
                if (!attackNum) return 0;
                attackNum = parseInt(attackNum);
                if (isNaN(attackNum) || attackNum < 0) {
                    alert('攻击次数格式不正确');
                    $this.select();
                    $this.focus();
                    return 0;
                }
                attackList[parseInt($this.data('id'))] = attackNum;
                totalAttackNum += attackNum;
            });
            if ($.isEmptyObject(attackList)) return 0;
            if (totalAttackNum > Config.maxAttackNum) {
                alert('攻击次数不得超过{0}次'.replace('{0}', Config.maxAttackNum));
                return 0;
            }
            return totalAttackNum;
        };
        $('.kf_fw_ig1');
        $('<div class="pd_item_btns"><button>保存设置</button><button>清除设置</button><button><b>批量攻击</b></button></div>')
            .insertAfter('.kf_fw_ig1')
            .find('button:first-child')
            .click(function () {
                var attackList = {};
                var totalAttackNum = getAttackNum(attackList);
                if (totalAttackNum == 0) return;
                ConfigDialog.read();
                Config.batchAttackList = attackList;
                ConfigDialog.write();
                alert('设置已保存');
            })
            .next()
            .click(function () {
                ConfigDialog.read();
                Config.batchAttackList = {};
                ConfigDialog.write();
                alert('设置已清除');
            })
            .next()
            .click(function () {
                KFOL.removePopTips($('.pd_pop_tips'));
                var attackList = {};
                var totalAttackNum = getAttackNum(attackList);
                if (!totalAttackNum) return;
                if (!window.confirm('准备进行{0}次批量攻击，是否开始攻击？'.replace('{0}', totalAttackNum))) return;
                KFOL.showWaitMsg('<strong>正在批量攻击中...</strong><i>攻击次数：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', totalAttackNum)
                    , true);
                Loot.batchAttack({type: 1, totalAttackNum: totalAttackNum, attackList: attackList, safeId: safeId});
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
        var $user = $('.topright a[href^="profile.php?action=show&uid="]').eq(0);
        if ($user.length === 0) return false;
        KFOL.userName = $user.text();
        if (!KFOL.userName) return false;
        var matches = /&uid=(\d+)/.exec($user.attr('href'));
        if (!matches) return false;
        KFOL.uid = matches[1];
        return true;
    },

    /**
     * 添加CSS样式
     */
    appendCss: function () {
        $('head').append(
            '<style type="text/css">' +
            '.pd_layer { position: fixed; width: 100%; height: 100%; left: 0; top: 0; z-index: 1000; }' +
            '.pd_pop_box { position: fixed; width: 100%; z-index: 1001; }' +
            '.pd_pop_tips {' +
            '  border: 1px solid #6ca7c0; text-shadow: 0 0 3px rgba(0,0,0,0.1); border-radius: 3px; padding: 12px 40px; text-align: center;' +
            '  font-size: 14px; position: absolute; display: none; color: #333; background: #f8fcfe; background-repeat: no-repeat;' +
            '  background-image: -webkit-linear-gradient(#F9FCFE, #F6FBFE 25%, #EFF7FC);' +
            '  background-image: -moz-linear-gradient(top, #F9FCFE, #F6FBFE 25%, #EFF7FC);' +
            '  background-image: -o-linear-gradient(#F9FCFE, #F6FBFE 25%, #EFF7FC);' +
            '  background-image: linear-gradient(#F9FCFE, #F6FBFE 25%, #EFF7FC);' +
            '}' +
            '.pd_pop_tips strong { margin-right: 5px; }' +
            '.pd_pop_tips i { font-style: normal; padding-left: 10px; }' +
            '.pd_pop_tips em, .pd_stat em, .pd_pop_tips ins, .pd_stat ins { font-weight: 700; font-style: normal; color:#FF6600; padding: 0 5px; }' +
            '.pd_pop_tips ins, .pd_stat ins { text-decoration: none; color: #339933; }' +
            '.pd_pop_tips a { font-weight: bold; margin-left: 15px; }' +
            '.pd_stat i { font-style: normal; margin-right: 5px; }' +
            '.pd_stat .pd_notice { margin-left: 5px; }' +
            '.pd_highlight { color: #FF0000 !important; }' +
            '.pd_notice, .pd_pop_tips .pd_notice { font-style: italic; color: #666; }' +
            '.pd_input, .pd_cfg_main input, .pd_cfg_main select { vertical-align: middle; height: inherit; margin-right: 0; line-height: 22px; font-size: 12px; }' +
            '.pd_input[type="text"], .pd_cfg_main input[type="text"] { height: 18px; line-height: 18px; }' +
            '.pd_input:focus, .pd_cfg_main input[type="text"]:focus, .pd_cfg_main textarea:focus, .pd_textarea:focus { border-color: #7EB4EA; }' +
            '.pd_textarea, .pd_cfg_main textarea { border: 1px solid #CCC; font-size: 12px; }' +
            '.readlou .pd_goto_link { color: #000; }' +
            '.readlou .pd_goto_link:hover { color: #51D; }' +
            '.pd_fast_goto_floor, .pd_multi_quote_chk { margin-right: 2px; }' +
            '.pages .pd_fast_goto_page { margin-left: 8px; }' +
            '.pd_fast_goto_floor span:hover, .pd_fast_goto_page span:hover { color: #51D; cursor: pointer; text-decoration: underline; }' +
            '.pd_item_btns { text-align: right; margin-top: 5px;  }' +
            '.pd_item_btns button, .pd_item_btns input { margin-left: 3px; margin-bottom: 2px; vertical-align: middle; }' +
            '.pd_result { border: 1px solid #99F; padding: 5px; margin-top: 10px; line-height: 2em; }' +
            '.pd_thread_page { margin-left: 5px; }' +
            '.pd_thread_page a { color: #444; padding: 0 3px; }' +
            '.pd_thread_page a:hover { color: #51D; }' +
            '.pd_card_chk { position: absolute; bottom: -8px; left: 1px; }' +
            '.pd_disabled_link { color: #999 !important; text-decoration: none !important; cursor: default; }' +
            '.b_tit4 .pd_thread_goto, .b_tit4_1 .pd_thread_goto { position: absolute; top: 0; right: 0; padding: 0 10px; }' +
            '.b_tit4 .pd_thread_goto:hover, .b_tit4_1 .pd_thread_goto:hover { padding-left: 10px; }' +

                /* 设置对话框 */
            '.pd_cfg_box {' +
            '  position: fixed; border: 1px solid #9191FF; display: none; -webkit-box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.5);' +
            '  -moz-box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.5); -o-box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.5);' +
            '  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.5);' +
            '}' +
            '.pd_cfg_box h1 {text-align: center; font-size: 14px; background-color: #9191FF; color: #FFF; line-height: 2em; margin: 0; padding-left: 20px; }' +
            '.pd_cfg_box h1 span { float: right; cursor: pointer; padding: 0 10px; }' +
            '#pd_log { width: 600px; }' +
            '#pd_custom_sm_color_config { width: 360px; }' +
            '.pd_cfg_nav { text-align: right; margin-top: 5px; margin-bottom: -5px; }' +
            '.pd_cfg_nav a { margin-left: 7px; }' +
            '.pd_cfg_main { background-color: #FCFCFC; padding: 0 10px; font-size: 12px; line-height: 22px; min-height: 180px; overflow: auto; }' +
            '.pd_cfg_main fieldset { border: 1px solid #CCCCFF; }' +
            '.pd_cfg_main legend { font-weight: bold; }' +
            '.pd_cfg_main label input, .pd_cfg_main legend input, .pd_cfg_main label select { margin: 0 5px; }' +
            '.pd_cfg_main input[type="color"] { height: 18px; width: 30px; padding: 0; }' +
            '.pd_cfg_main button { vertical-align: middle; }' +
            '.pd_cfg_main .pd_cfg_tips { text-decoration: none; cursor: help; }' +
            '.pd_cfg_main .pd_cfg_tips:hover { color: #FF0000; }' +
            '#pd_config .pd_cfg_main { overflow-x: hidden; white-space: nowrap; }' +
            '.pd_cfg_panel { display: inline-block; width: 380px; vertical-align: top; }' +
            '.pd_cfg_panel + .pd_cfg_panel { margin-left: 5px; }' +
            '.pd_cfg_btns { background-color: #FCFCFC; text-align: right; padding: 5px; }' +
            '.pd_cfg_btns button { width: 80px; margin-left: 5px; }' +
            '.pd_cfg_about { float: left; line-height: 24px; margin-left: 5px; }' +
            '.pd_cfg_user_list { max-width: 360px; max-height: 114px; overflow: auto; white-space: normal; }' +
            '.pd_cfg_user_list > span {' +
            '  display: inline-block; background-color: #DFF0D8; border: 1px solid #D6E9C6; color: #3C763D;' +
            '  border-radius: 8px; padding: 0 5px; margin: 2px 3px;' +
            '}' +
            '.pd_cfg_user_list > span > a { text-decoration: none; padding-left: 4px; color: #3C763D; }' +
            '#pd_cfg_block_user_list > span { background-color: #F2DEDE; border: 1px solid #EBCCD1; color: #A94442; }' +
            '#pd_cfg_block_user_list > span > a { color: #A94442; }' +

                /* 日志对话框 */
            '.pd_log_nav { text-align: center; margin: -5px 0 -12px; font-size: 14px; line-height: 44px; }' +
            '.pd_log_nav a { display: inline-block; }' +
            '.pd_log_nav h2 { display: inline; font-size: 14px; margin-left: 7px; margin-right: 7px; }' +
            '#pd_log_content { height: 308px; overflow: auto; }' +
            '#pd_log_content h3 { display: inline-block; font-size: 12px; line-height: 22px; margin: 0; }' +
            '#pd_log_content h3:not(:first-child) { margin-top: 5px; }' +
            '#pd_log_content p { line-height: 22px; margin: 0; }' +
            '#pd_log .pd_stat i { display: inline-block; }' +
            '</style>'
        );
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
        var isFirst = $popBox.length === 0;
        if (isFirst) {
            if (settings.preventable) $('<div class="pd_layer"></div>').appendTo('body');
            $popBox = $('<div class="pd_pop_box"></div>').appendTo('body');
        }
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
        var popTipsHeight = $popTips.outerHeight();
        var popTipsWidth = $popTips.outerWidth();
        if (isFirst) {
            $popBox.css('top', $(window).height() / 2 - popTipsHeight / 2);
        }
        else {
            $popBox.animate({'top': '-=' + popTipsHeight / 1.5});
        }
        var $prev = $popTips.prev('.pd_pop_tips');
        $popTips.css('top', $prev.length > 0 ? parseInt($prev.css('top')) + $prev.outerHeight() + 5 : 0)
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
        if ($('.pd_pop_tips').length === 0) {
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
     * @param {boolean} isAutoSaveCurrentDeposit 是否在捐款完毕之后自动活期存款
     */
    donation: function (isAutoSaveCurrentDeposit) {
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
                var matches = /捐款获得(\d+)经验值(?:.*?补偿期(?:.*?\+(\d+)KFB)?(?:.*?(\d+)成长经验)?)?/i.exec(html);
                if (!matches) {
                    if (/KFB不足。<br \/>/.test(html)) {
                        msg += '<i class="pd_notice">KFB不足</i><a target="_blank" href="kf_growup.php">手动捐款</a>';
                    }
                    else return;
                }
                else {
                    msg += '<i>经验值<em>+{0}</em></i>'.replace('{0}', matches[1]);
                    var gain = {'经验值': parseInt(matches[1])};
                    if (typeof matches[2] !== 'undefined' || typeof matches[3] !== 'undefined') {
                        msg += '<i style="margin-left:5px">(补偿期:</i>{0}{1}'
                            .replace('{0}', typeof matches[2] !== 'undefined' ?
                                '<i>KFB<em>+{0}</em>{1}</i>'
                                    .replace('{0}', matches[2])
                                    .replace('{1}', typeof matches[3] !== 'undefined' ? '' : ')')
                                : '')
                            .replace('{1}', typeof matches[3] !== 'undefined' ? '<i>经验值<em>+{0}</em>)</i>'.replace('{0}', matches[3]) : '');
                        if (typeof matches[2] !== 'undefined')
                            gain['KFB'] = parseInt(matches[2]);
                        if (typeof matches[3] !== 'undefined')
                            gain['经验值'] += parseInt(matches[3]);
                    }
                    Log.push('捐款', '捐款`{0}`KFB'.replace('{0}', kfb), {gain: gain, pay: {'KFB': -kfb}});
                }
                KFOL.showMsg(msg);
                if (isAutoSaveCurrentDeposit) KFOL.autoSaveCurrentDeposit();
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
     */
    drawSmbox: function () {
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
                Tools.setCookie(Config.drawSmboxCookieName, 1, Tools.getDate('+' + Config.defDrawSmboxInterval + 'm'));
                KFOL.showFormatLog('抽取神秘盒子', html);
                var kfbRegex = /获得了(\d+)KFB的奖励.*?(\(\d+\|\d+\))/i;
                var smRegex = /获得本轮的头奖/i;
                var msg = '<strong>抽取神秘盒子[<em>No.{0}</em>]</strong>'.replace('{0}', smboxNumber);
                var gain = {};
                var action = '抽取神秘盒子[`No.{0}`]'.replace('{0}', smboxNumber);
                if (kfbRegex.test(html)) {
                    var matches = kfbRegex.exec(html);
                    msg += '<i>KFB<em>+{0}</em></i><i class="pd_notice">{1}</i>'
                        .replace('{0}', matches[1])
                        .replace('{1}', matches[2]);
                    gain['KFB'] = parseInt(matches[1]);
                    action += ' ' + matches[2];
                }
                else if (smRegex.test(html)) {
                    msg += '<i class="pd_highlight" style="font-weight:bold">KFB<em>+2000</em></i><a target="_blank" href="kf_smbox.php">查看头奖</a>';
                    gain['KFB'] = 2000;
                }
                else {
                    return;
                }
                Log.push('抽取神秘盒子', action, {gain: gain});
                KFOL.showMsg(msg);
                if (KFOL.isInHomePage) {
                    $('a[href="kf_smbox.php"].indbox5').removeClass('indbox5').addClass('indbox6');
                }
            }, 'html');
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
        if (Config.autoDrawSmbox2Enabled) {
            drawSmboxInterval *= 60;
            drawSmboxInterval = drawSmboxInterval === 0 ? Config.drawSmboxCompleteRefreshInterval : drawSmboxInterval;
        }
        else drawSmboxInterval = -1;
        if (false) {
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
        var oriTitle = document.title;
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
                        .replace('{0}', oriTitle)
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
        var handleError = function (interval, textStatus) {
            console.log('获取剩余抽奖时间失败，错误信息：' + textStatus);
            KFOL.removePopTips($('.pd_refresh_notice').parent());
            KFOL.showMsg('<span class="pd_refresh_notice">获取剩余抽奖时间失败，将在<em>{0}</em>分钟后重试...</span>'
                    .replace('{0}', interval)
                , -1);
            window.setTimeout(checkRefreshInterval, interval * 60 * 1000);
            showRefreshModeTips(interval * 60, true);
        };
        var checkRefreshInterval = function () {
            KFOL.removePopTips($('.pd_refresh_notice').parent());
            var refreshNoticeTimeout = window.setTimeout(function () {
                KFOL.showWaitMsg('<span class="pd_refresh_notice">正在获取抽奖剩余时间...</span>');
            }, 2000);
            $.ajax({
                url: 'index.php',
                dataType: 'html',
                success: function (html) {
                    window.clearTimeout(refreshNoticeTimeout);
                    KFOL.removePopTips($('.pd_refresh_notice').parent());
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
                        handleError(10, '遇到论坛维护或其它未知情况');
                        return;
                    }
                    var isDrawSmboxStarted = false;
                    var autoDrawItemOrCardAvailable = false && drawItemOrCardInterval === 0;
                    var autoDonationAvailable = Config.autoDonationEnabled && !Tools.getCookie(Config.donationCookieName);
                    if (Config.autoDrawSmbox2Enabled && drawSmboxInterval === 0) {
                        isDrawSmboxStarted = true;
                        KFOL.drawSmbox(autoDrawItemOrCardAvailable, autoDonationAvailable);
                    }
                    if (autoDrawItemOrCardAvailable && !isDrawSmboxStarted) {
                        //KFOL.drawItemOrCard();
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
                error: function (XMLHttpRequest, textStatus) {
                    handleError(Config.errorRefreshInterval, textStatus);
                }
            });
        };
        window.setTimeout(checkRefreshInterval, interval * 1000);
        showRefreshModeTips(interval);
    },

    /**
     * 获取用户的SafeID
     */
    getSafeId: function () {
        var matches = /safeid=(\w+)/i.exec($('a[href*="safeid="]').eq(0).attr('href'));
        if (!matches) return '';
        else return matches[1];
    },

    /**
     * 添加设置和日志对话框的链接
     */
    addConfigAndLogDialogLink: function () {
        var $login = $('a[href^="login.php?action=quit"]:eq(0)');
        $('<a href="#">助手设置</a><span style="margin:0 4px">|</span>').insertBefore($login)
            .filter('a').click(function (event) {
                event.preventDefault();
                ConfigDialog.show();
            });
        if (Config.showLogLinkInPageEnabled) {
            $('<a href="#">助手日志</a><span style="margin:0 4px">|</span>').insertBefore($login)
                .filter('a').click(function (event) {
                    event.preventDefault();
                    Log.show();
                });
        }
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
     * 处理首页有人@你的消息框
     */
    handleAtTips: function () {
        var type = Config.atTipsHandleType;
        if (type === 'default') return;
        var $atTips = $('a[href^="guanjianci.php?gjc="]');
        var noHighlight = function () {
            $atTips.removeClass('indbox5').addClass('indbox6');
        };
        var hideBox = function () {
            $atTips.parent().prev('div').addBack().remove();
        };
        var handleBox = noHighlight;
        if (type === 'hide_box_1' || type === 'hide_box_2') handleBox = hideBox;
        if (type === 'no_highlight_1' || type === 'no_highlight_2' || type === 'hide_box_1' || type === 'at_change_to_cao') {
            if ($atTips.length > 0) {
                var cookieText = Tools.getCookie(Config.hideMarkReadAtTipsCookieName);
                var atTipsText = $atTips.text();
                if (cookieText && cookieText === atTipsText) {
                    handleBox();
                }
                else {
                    $atTips.click(function () {
                        Tools.setCookie(Config.hideMarkReadAtTipsCookieName,
                            atTipsText,
                            Tools.getDate('+' + Config.hideMarkReadAtTipsExpires + 'd')
                        );
                        handleBox();
                    });
                }
                if (type === 'at_change_to_cao') {
                    $atTips.text(atTipsText.replace('@', '艹'));
                }
            }
            else if ($atTips.length === 0 && (type === 'no_highlight_1' || type === 'at_change_to_cao')) {
                var html = ('<div style="width:300px;"><a href="guanjianci.php?gjc={0}" target="_blank" class="indbox6">最近无人{1}你</a>' +
                '<br /><div class="line"></div><div class="c"></div></div><div class="line"></div>')
                    .replace('{0}', KFOL.userName)
                    .replace('{1}', type === 'at_change_to_cao' ? '艹' : '@');
                $('a[href="kf_vmember.php"]:contains("VIP会员")').parent().before(html);
            }
        }
        else if (type === 'hide_box_2') {
            if ($atTips.length > 0) handleBox();
        }
    },

    /**
     * 去除首页的VIP标识高亮
     */
    hideNoneVipTips: function () {
        $('a[href="kf_vmember.php"]:contains("VIP会员(参与论坛获得的额外权限)")').removeClass('indbox5').addClass('indbox6');
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
        $('<form><li class="pd_fast_goto_floor">电梯直达 <input class="pd_input" style="width:30px" type="text" maxlength="8" /> ' +
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
            .css({'max-width': '505px', 'white-space': 'nowrap', 'overflow': 'hidden', 'text-overflow': 'ellipsis'});
    },

    /**
     * 将页面滚动到指定楼层
     */
    fastGotoFloor: function () {
        var floor = parseInt(Tools.getUrlParam('floor'));
        if (!floor || floor <= 0) return;
        var $floorNode = $('.readlou > div:nth-child(2) > span:contains("{0}楼")'.replace('{0}', floor));
        if ($floorNode.length === 0) return;
        var linkName = $floorNode.closest('.readlou').prev().attr('name');
        if (!linkName || !/^\d+$/.test(linkName)) return;
        location.hash = '#' + linkName;
    },

    /**
     * 添加快速跳转到指定页数的输入框
     */
    addFastGotoPageInput: function () {
        $('<form><li class="pd_fast_goto_page">跳至 <input class="pd_input" style="width:30px" type="text" maxlength="8" /> ' +
        '<span>页</span></li></form>')
            .appendTo('table > tbody > tr > td > div > ul.pages')
            .submit(function (event) {
                event.preventDefault();
                var page = parseInt($.trim($(this).find('input').val()));
                if (!page || page <= 0) return;
                var fpage = parseInt(Tools.getUrlParam('fpage'));
                location.href = '{0}read.php?tid={1}&page={2}{3}'
                    .replace('{0}', Tools.getHostNameUrl)
                    .replace('{1}', Tools.getUrlParam('tid'))
                    .replace('{2}', page)
                    .replace('{3}', fpage ? '&fpage=' + fpage : '');
            })
            .find('span')
            .click(function () {
                $(this).closest('form').submit();
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
     * 修改指定楼层的神秘颜色
     * @param {jQuery} $element 指定楼层的发帖者的用户名链接的jQuery对象
     * @param {string} color 神秘颜色
     */
    modifyFloorSmColor: function ($element, color) {
        if ($element.is('.readidmsbottom > a')) $element.css('color', color);
        $element.closest('.readtext').css('border-color', color)
            .prev('.readlou').css('border-color', color)
            .next().next('.readlou').css('border-color', color);
    },

    /**
     * 修改本人的神秘颜色
     */
    modifyMySmColor: function () {
        var $my = $('.readidmsbottom > a[href="profile.php?action=show&uid={0}"]'.replace('{0}', KFOL.uid));
        if ($my.length === 0) $my = $('.readidmleft > a[href="profile.php?action=show&uid={0}"]'.replace('{0}', KFOL.uid));
        if ($my.length > 0) KFOL.modifyFloorSmColor($my, Config.customMySmColor);
    },

    /**
     * 修改各等级神秘颜色
     */
    modifySmColor: function () {
        if (Config.customSmColorConfigList.length === 0) return;
        $('.readidmsbottom > a[href^="profile.php?action=show&uid="], .readidmleft > a').each(function () {
            var $this = $(this);
            var smLevel = '';
            if ($this.is('.readidmleft > a')) {
                smLevel = $this.parent().next('.readidmright').text().toUpperCase();
                if (!/(-?\d+|MAX)/i.test(smLevel)) return;
            }
            else {
                var matches = /(-?\d+|MAX)级神秘/i.exec($this.parent().contents().last().text());
                if (!matches) return;
                smLevel = matches[1].toUpperCase();
            }
            $.each(Config.customSmColorConfigList, function (index, data) {
                if (Tools.compareSmLevel(smLevel, data.min) >= 0 && Tools.compareSmLevel(smLevel, data.max) <= 0) {
                    KFOL.modifyFloorSmColor($this, data.color);
                    return false;
                }
            });
        });
    },

    /**
     * 添加自定义神秘颜色提示
     */
    addCustomSmColorTips: function () {
        $('<span class="pd_highlight">低等级没人权？没有自己喜欢的颜色？快来试试助手的<a href="#">自定义本人神秘颜色</a>的功能吧！（虽然仅限自己可见 ╮(╯▽╰)╭）</span><br />')
            .appendTo('table div > table > tbody > tr > td:contains("自定义ID颜色")')
            .find('a').click(function (event) {
                event.preventDefault();
                ConfigDialog.show();
            });
    },

    /**
     * 在帖子列表页面中添加帖子页数快捷链接
     */
    addFastGotoThreadPageLink: function () {
        $('.threadtit1 > a[href^="read.php"]').each(function () {
            var $link = $(this);
            var floorNum = $link.closest('td').next().find('ul > li > a').contents().eq(0).text();
            if (!floorNum || floorNum < Config.perPageFloorNum) return;
            var url = $link.attr('href');
            var totalPageNum = Math.floor(floorNum / Config.perPageFloorNum) + 1;
            var html = '';
            for (var i = 1; i < totalPageNum; i++) {
                if (i > Config.maxFastGotoThreadPageNum) {
                    if (i + 1 <= totalPageNum) {
                        html += '..<a href="{0}&page={1}">{2}</a>'
                            .replace('{0}', url)
                            .replace('{1}', totalPageNum)
                            .replace('{2}', totalPageNum);
                    }
                    break;
                }
                html += '<a href="{0}&page={1}">{2}</a>'.replace('{0}', url).replace('{1}', i + 1).replace('{2}', i + 1);
            }
            html = '<span class="pd_thread_page">...{0}</span>'.replace('{0}', html);
            $link.after(html).parent().css('white-space', 'normal');
        });
    },

    /**
     * 调整帖子内容宽度，使其保持一致
     */
    adjustThreadContentWidth: function () {
        $('head').append(
            '<style type="text/css">' +
            '.readtext > table > tbody > tr > td { padding-left: 192px; }' +
            '.readidms, .readidm { margin-left: -192px !important; }' +
            '</style>'
        );
    },

    /**
     * 调整帖子内容字体大小
     */
    adjustThreadContentFontSize: function () {
        if (Config.threadContentFontSize > 0 && Config.threadContentFontSize !== 12) {
            $('head').append(
                '<style type="text/css">' +
                '.readtext td { font-size: {0}px; line-height: 1.6em; }'.replace('{0}', Config.threadContentFontSize) +
                '.readtext td > div, .readtext td > .read_fds { font-size: 12px; }' +
                '</style>'
            );
        }
    },

    /**
     * 添加复制购买人名单的链接
     */
    addCopyBuyersListLink: function () {
        $('<a style="margin:0 2px 0 5px" href="#">复制名单</a>').insertAfter('.readtext select[name="buyers"]').click(function (event) {
            event.preventDefault();
            var buyerList = [];
            $(this).prev('select').children('option').each(function (index) {
                var name = $(this).text();
                if (index === 0 || name === '-----------') return;
                buyerList.push(name);
            });
            if (buyerList.length === 0) {
                alert('暂时无人购买');
                return;
            }
            if ($('#pd_copy_buyer_list').length > 0) return;
            var html =
                '<form>' +
                '<div class="pd_cfg_box" id="pd_copy_buyer_list">' +
                '  <h1>购买人名单<span>&times;</span></h1>' +
                '  <div class="pd_cfg_main">' +
                '    <textarea style="width:200px;height:300px;margin:5px 0" readonly="readonly"></textarea>' +
                '  </div>' +
                '</div>' +
                '</form>';
            var $dialog = $(html).appendTo('body');
            Tools.resize('pd_copy_buyer_list');
            Tools.escKeydown('pd_copy_buyer_list');
            $dialog.find('h1 > span').click(function () {
                return Tools.close('pd_copy_buyer_list');
            }).end().find('textarea').val(buyerList.join('\n')).select().focus();
            $(window).on('resize.pd_copy_buyer_list', function () {
                Tools.resize('pd_copy_buyer_list');
            });
        });
    },

    /**
     * 显示统计回帖者名单对话框
     * @param {string[]} replyerList 回帖者名单列表
     */
    showStatReplyersDialog: function (replyerList) {
        var html =
            '<form>' +
            '<div class="pd_cfg_box" id="pd_replyer_list">' +
            '  <h1>回帖者名单<span>&times;</span></h1>' +
            '  <div class="pd_cfg_main">' +
            '    <div id="pd_replyer_list_filter" style="margin-top:5px">' +
            '      <label><input type="checkbox" checked="checked" />显示楼层号</label>' +
            '      <label><input type="checkbox" />去除重复</label>' +
            '      <label><input type="checkbox" />去除楼主</label>' +
            '    </div>' +
            '    <div style="color:#FF0000" id="pd_replyer_list_stat"></div>' +
            '    <textarea style="width:250px;height:300px;margin:5px 0" readonly="readonly"></textarea>' +
            '  </div>' +
            '</div>' +
            '</form>';
        var $dialog = $(html).appendTo('body');
        Tools.resize('pd_replyer_list');
        Tools.escKeydown('pd_replyer_list');
        $dialog.find('h1 > span').click(function () {
            return Tools.close('pd_replyer_list');
        }).end().find('textarea').data('replyer_list', JSON.stringify(replyerList));
        $(window).on('resize.pd_replyer_list', function () {
            Tools.resize('pd_replyer_list');
        });
        var filterList = function () {
            var $filterNodes = $('#pd_replyer_list_filter input');
            var isShowFloor = $filterNodes.eq(0).prop('checked'),
                isDeduplication = $filterNodes.eq(1).prop('checked'),
                isRemoveTopFloor = $filterNodes.eq(2).prop('checked');
            var list = $dialog.find('textarea').data('replyer_list');
            try {
                list = JSON.parse(list);
            }
            catch (ex) {
                return;
            }
            if (!list || $.type(list) !== 'array') return;
            if (isDeduplication) {
                for (var i in list) {
                    if ($.inArray(list[i], list) !== parseInt(i))
                        list[i] = null;
                }
            }
            if (isRemoveTopFloor) {
                var topFloor = $('.readtext:eq(0)').find('.readidmsbottom, .readidmleft').find('a').text();
                for (var i in list) {
                    if (list[i] === topFloor)
                        list[i] = null;
                }
            }
            var content = '';
            var num = 0;
            for (var i in list) {
                if (!list[i]) continue;
                content += (isShowFloor ? i + 'L：' : '') + list[i] + '\n';
                num++;
            }
            $dialog.find('textarea').val(content);
            $('#pd_replyer_list_stat').html('共有<b>{0}</b>条项目'.replace('{0}', num));
        }
        $('#pd_replyer_list_filter').find('input').click(filterList);
        filterList();
    },

    /**
     * 添加统计回帖者名单的链接
     */
    addStatReplyersLink: function () {
        var page = Tools.getUrlParam('page');
        if (page !== null && parseInt(page) !== 1) return;
        $('<li><a href="#" title="统计回帖者名单">[统计回帖]</a></li>').prependTo('.readlou:eq(1) > div > .pages')
            .find('a').click(function (event) {
                event.preventDefault();
                if ($('#pd_replyer_list').length > 0) return;
                var endFloor = parseInt(window.prompt('统计到第几楼？（0表示统计所有楼层）', 0));
                if (isNaN(endFloor) || endFloor < 0) return;
                var matches = /(\d+)页/.exec($('.pages:eq(0) > li:last-child > a').text());
                var maxPage = matches ? parseInt(matches[1]) : 1;
                if (endFloor === 0) endFloor = maxPage * Config.perPageFloorNum - 1;
                var endPage = Math.floor(endFloor / Config.perPageFloorNum) + 1;
                if (endPage > maxPage) endPage = maxPage;
                if (endPage > 100) {
                    alert('需访问的页数过多');
                    return;
                }
                var tid = Tools.getUrlParam('tid');
                if (!tid) return;
                KFOL.showWaitMsg('<strong>正在统计回帖名单中...</strong><i>剩余页数：<em id="pd_remaining_num">{0}</em></i>'
                        .replace('{0}', endPage)
                    , true);
                $(document).queue('StatReplyers', []);
                var replyerList = [];
                $.each(new Array(endPage), function (index) {
                    $(document).queue('StatReplyers', function () {
                        var url = 'read.php?tid={0}&page={1}'.replace('{0}', tid).replace('{1}', index + 1);
                        $.get(url, function (html) {
                            var matches = html.match(/<span style=".+?">\d+楼<\/span> <span style=".+?">(.|\n|\r\n)+?<a href="profile\.php\?action=show&uid=\d+" target="_blank" style=".+?">.+?<\/a>/gi);
                            var isStop = false;
                            for (var i in matches) {
                                var floorMatches = /<span style=".+?">(\d+)楼<\/span>(?:.|\n|\r\n)+?<a href="profile\.php\?action=show&uid=\d+".+?>(.+?)<\/a>/i.exec(matches[i]);
                                if (!floorMatches) continue;
                                var floor = parseInt(floorMatches[1]);
                                if (floor > endFloor) {
                                    isStop = true;
                                    break;
                                }
                                replyerList[floor] = floorMatches[2];
                            }
                            var $remainingNum = $('#pd_remaining_num');
                            $remainingNum.text(parseInt($remainingNum.text()) - 1);
                            if (isStop || index === endPage - 1) {
                                KFOL.removePopTips($('.pd_pop_tips'));
                                KFOL.showStatReplyersDialog(replyerList);
                            }
                            window.setTimeout(function () {
                                $(document).dequeue('StatReplyers');
                            }, Config.defAjaxInterval);
                        }, 'html');
                    });
                });
                $(document).dequeue('StatReplyers');
            });
    },

    /**
     * 获取多重引用数据
     * @returns {Object[]} 多重引用数据列表
     */
    getMultiQuoteData: function () {
        var quoteList = [];
        $('.pd_multi_quote_chk input:checked').each(function () {
            var $readLou = $(this).closest('.readlou');
            var matches = /(\d+)楼/.exec($readLou.find('.pd_goto_link').text());
            var floor = matches ? parseInt(matches[1]) : 0;
            var spid = $readLou.prev('a').attr('name');
            var userName = $readLou.next('.readtext').find('.readidmsbottom > a, .readidmleft > a').text();
            if (!userName) return;
            quoteList.push({floor: floor, spid: spid, userName: userName});
        });
        return quoteList;
    },

    /**
     * 添加多重回复和多重引用的按钮
     */
    addMultiQuoteButton: function () {
        var replyUrl = $('a[href^="post.php?action=reply"].b_tit2').attr('href');
        if (!replyUrl) return;
        $('<li class="pd_multi_quote_chk"><label title="多重引用"><input type="checkbox" /> 引</label></li>')
            .prependTo($('.readlou > div:first-child > ul').has('a[title="引用回复这个帖子"]'))
            .find('input').click(function () {
                var tid = parseInt(Tools.getUrlParam('tid'));
                var data = localStorage[Config.multiQuoteStorageName];
                if (data) {
                    try {
                        data = JSON.parse(data);
                        if (!data || $.type(data) !== 'object' || $.isEmptyObject(data)) data = null;
                        else if (typeof data.tid === 'undefined' || data.tid !== tid || $.type(data.quoteList) !== 'array')
                            data = null;
                    }
                    catch (ex) {
                        data = null;
                    }
                }
                else {
                    data = null;
                }
                var quoteList = KFOL.getMultiQuoteData();
                if (!data) {
                    localStorage.removeItem(Config.multiQuoteStorageName);
                    data = {tid: tid, quoteList: []};
                }
                var page = parseInt(Tools.getUrlParam('page'));
                if (!page) page = 1;
                if (quoteList.length > 0) data.quoteList[page] = quoteList;
                else delete data.quoteList[page];
                localStorage[Config.multiQuoteStorageName] = JSON.stringify(data);
            });
        $('.readlou:last').next('div').find('table > tbody > tr > td:last-child')
            .css({'text-align': 'right', 'width': '320px'})
            .append(('<span class="b_tit2" style="margin-left:5px"><a style="display:inline-block" href="#" title="多重回复">回复</a> ' +
            '<a style="display:inline-block" href="{0}" title="多重引用">引用</a></span>')
                .replace('{0}', replyUrl + '&multiquote=true'))
            .find('.b_tit2 > a:eq(0)').click(function (event) {
                event.preventDefault();
                KFOL.handleMultiQuote(1);
            });
    },

    /**
     * 处理多重回复和多重引用
     * @param {number} type 处理类型，1：多重回复；2：多重引用
     */
    handleMultiQuote: function (type) {
        if ($('#pd_clear_multi_quote_data').length === 0) {
            $('<a id="pd_clear_multi_quote_data" style="margin-left:7px" title="清除在浏览器中保存的多重引用数据" href="#">清除引用数据</a>')
                .insertAfter('input[name="diy_guanjianci"]').click(function (event) {
                    event.preventDefault();
                    localStorage.removeItem(Config.multiQuoteStorageName);
                    $('input[name="diy_guanjianci"]').val('');
                    if (type === 2) $('#textarea').val('');
                    else $('textarea[name="atc_content"]').val('');
                    alert('多重引用数据已被清除');
                });
        }
        var data = localStorage[Config.multiQuoteStorageName];
        if (!data) return;
        try {
            data = JSON.parse(data);
        }
        catch (ex) {
            return;
        }
        if (!data || $.type(data) !== 'object' || $.isEmptyObject(data)) return;
        var tid = parseInt(Tools.getUrlParam('tid')),
            fid = parseInt(Tools.getUrlParam('fid'));
        if (!tid || typeof data.tid === 'undefined' || data.tid !== tid || $.type(data.quoteList) !== 'array') return;
        if (type === 2 && !fid) return;
        var list = [];
        for (var i in data.quoteList) {
            if ($.type(data.quoteList[i]) !== 'array') continue;
            for (var j in data.quoteList[i]) {
                list.push(data.quoteList[i][j]);
            }
        }
        if (list.length === 0) {
            localStorage.removeItem(Config.multiQuoteStorageName);
            return;
        }
        var keyword = [];
        var content = '';
        if (type === 2) {
            KFOL.showWaitMsg('<strong>正在获取引用内容中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                    .replace('{0}', list.length)
                , true);
            $(document).queue('MultiQuote', []);
        }
        $.each(list, function (index, quote) {
            if (typeof quote.floor === 'undefined' || typeof quote.spid === 'undefined') return;
            if ($.inArray(quote.userName, keyword) === -1) keyword.push(quote.userName);
            if (type === 2) {
                $(document).queue('MultiQuote', function () {
                    var url = 'post.php?action=quote&fid={0}&tid={1}&pid={2}&article={3}'
                        .replace('{0}', fid)
                        .replace('{1}', tid)
                        .replace('{2}', quote.spid)
                        .replace('{3}', quote.floor);
                    $.get(url, function (html) {
                        var matches = /<textarea id="textarea".*?>((.|\n)+?)<\/textarea>/i.exec(html);
                        if (matches) content += Tools.htmlDecode(matches[1]).replace(/\n\n/g, '\n') + '\n';
                        var $remainingNum = $('#pd_remaining_num');
                        $remainingNum.text(parseInt($remainingNum.text()) - 1);
                        if (index === list.length - 1) {
                            KFOL.removePopTips($('.pd_pop_tips'));
                            $('#textarea').val(content).focus();
                        }
                        window.setTimeout(function () {
                            $(document).dequeue('MultiQuote');
                        }, 100);
                    }, 'html');
                });
            }
            else {
                content += '[quote]回 {0}楼({1}) 的帖子[/quote]\n'
                    .replace('{0}', quote.floor)
                    .replace('{1}', quote.userName);
            }
        });
        $('input[name="diy_guanjianci"]').val(keyword.join(','));
        $('form[name="FORM"]').submit(function () {
            localStorage.removeItem(Config.multiQuoteStorageName);
        });
        if (type === 2) $(document).dequeue('MultiQuote');
        else $('textarea[name="atc_content"]').val(content).focus();
    },

    /**
     * 在短消息页面中添加快速取款的链接
     */
    addFastDrawMoneyLink: function () {
        if ($('td:contains("SYSTEM")').length === 0 || $('td:contains("收到了他人转账的KFB")').length === 0) return;
        var $msg = $('.thread2 > tbody > tr:eq(-2) > td:last');
        $msg.html($msg.html()
                .replace(/会员\[(.+?)\]通过论坛银行/, '会员[<a target="_blank" href="profile.php?action=show&username=$1">$1</a>]通过论坛银行')
                .replace(/给你转帐(\d+)KFB/i, '给你转帐<span class="pd_stat"><em>$1</em></span>KFB')
        );
        $('<br /><a title="从活期存款中取出当前转账的金额" href="#">快速取款</a> | <a title="取出银行账户中的所有活期存款" href="#">取出所有存款</a>').appendTo($msg)
            .filter('a:eq(0)').click(function (event) {
                event.preventDefault();
                KFOL.removePopTips($('.pd_pop_tips'));
                var matches = /给你转帐(\d+)KFB/i.exec($msg.text());
                if (!matches) return;
                var money = parseInt(matches[1]);
                Bank.drawCurrentDeposit(money);
            })
            .end().filter('a:eq(1)').click(function (event) {
                event.preventDefault();
                KFOL.removePopTips($('.pd_pop_tips'));
                KFOL.showWaitMsg('正在获取当前活期存款金额...', true);
                $.get('hack.php?H_name=bank', function (html) {
                    KFOL.removePopTips($('.pd_pop_tips'));
                    var matches = /活期存款：(\d+)KFB<br \/>/i.exec(html);
                    if (!matches) {
                        alert('获取当前活期存款金额失败');
                        return;
                    }
                    var money = parseInt(matches[1]);
                    if (money <= 0) {
                        KFOL.showMsg('当前活期存款余额为零', -1);
                        return;
                    }
                    Bank.drawCurrentDeposit(money);
                }, 'html');
            });
    },

    /**
     * 将帖子和短消息中的绯月其它域名的链接修改为当前域名
     */
    modifyKFOtherDomainLink: function () {
        $('.readtext a, .thread2 a').each(function () {
            var $this = $(this);
            var url = $this.attr('href');
            var regex = /^http:\/\/(.+?\.)?(2dgal|9gal|9baka|9moe)\.com\//i;
            if (regex.test(url)) {
                $this.attr('href', url.replace(regex, Tools.getHostNameUrl()));
            }
        });
    },

    /**
     * 添加购买帖子提醒
     */
    addBuyThreadWarning: function () {
        $('.readtext input[type="button"][value="愿意购买,支付KFB"]').each(function () {
            var $this = $(this);
            var matches = /此帖售价\s*(\d+)\s*KFB/i.exec($this.closest('legend').contents().eq(0).text());
            if (!matches) return;
            var sell = parseInt(matches[1]);
            matches = /location\.href="(.+?)"/i.exec($this.attr('onclick'));
            if (!matches) return;
            $this.data('sell', sell).data('url', matches[1]).removeAttr('onclick').click(function (event) {
                event.preventDefault();
                var $this = $(this);
                var sell = $this.data('sell');
                var url = $this.data('url');
                if (!sell || !url) return;
                if (sell < Config.minBuyThreadWarningSell || window.confirm('此贴售价{0}KFB，是否购买？'.replace('{0}', sell))) {
                    location.href = url;
                }
            });
        });
    },

    /**
     * 添加批量购买帖子的按钮
     */
    addBatchBuyThreadButton: function () {
        var $btns = $('.readtext input[type="button"][value="愿意购买,支付KFB"]');
        if ($btns.length === 0) return;
        $btns.each(function () {
            var $this = $(this);
            var sell = $this.data('sell');
            var url = $this.data('url');
            if (!sell || !url) return;
            $this.after('<input class="pd_buy_thread" style="margin-left:10px;vertical-align:middle" type="checkbox" data-sell="{0}" data-url="{1}" />'
                    .replace('{0}', sell)
                    .replace('{1}', url)
            );
        });
        $('<span style="margin:0 5px">|</span><a class="pd_buy_thread_btn" title="批量购买所选帖子" href="#">批量购买</a>').insertAfter('td > a[href^="kf_tidfavor.php?action=favor&tid="]')
            .filter('a').click(function (event) {
                event.preventDefault();
                KFOL.removePopTips($('.pd_pop_tips'));
                var urlList = [];
                var totalSell = 0;
                $('.pd_buy_thread:checked').each(function () {
                    var $this = $(this);
                    var url = $this.data('url');
                    if (url) urlList.push(url);
                    var sell = parseInt($this.data('sell'));
                    if (!isNaN(sell)) totalSell += sell;
                });
                if (urlList.length === 0) return;
                if (window.confirm('你共选择了{0}个帖子，总售价{1}KFB，是否批量购买？'.replace('{0}', urlList.length).replace('{1}', totalSell))) {
                    KFOL.showWaitMsg('<strong>正在购买帖子中...</strong><i>剩余数量：<em id="pd_remaining_num">{0}</em></i>'
                            .replace('{0}', urlList.length)
                        , true);
                    KFOL.buyThreads(urlList, totalSell);
                }
            })
            .parent()
            .mouseenter(function () {
                $('<span style="margin-left:5px">[<a href="#">全选</a><a style="margin-left:5px" href="#">反选</a>]</span>').insertAfter($(this).find('.pd_buy_thread_btn'))
                    .find('a:first')
                    .click(function (event) {
                        event.preventDefault();
                        $('.pd_buy_thread').prop('checked', true);
                    })
                    .next('a')
                    .click(function (event) {
                        event.preventDefault();
                        $('.pd_buy_thread').each(function () {
                            $(this).prop('checked', !$(this).prop('checked'));
                        });
                    });
            }).mouseleave(function () {
                $(this).find('.pd_buy_thread_btn').next('span').remove();
            });
    },

    /**
     * 购买指定的一系列帖子
     * @param {string[]} urlList 购买帖子的URL列表
     * @param {number} totalSell 总售价
     */
    buyThreads: function (urlList, totalSell) {
        var successNum = 0, failNum = 0;
        $(document).queue('SellItems', []);
        $.each(urlList, function (index, url) {
            $(document).queue('BuyThreads', function () {
                $.get(url, function (html) {
                    KFOL.showFormatLog('购买帖子', html);
                    if (/操作完成/.test(html)) successNum++;
                    else failNum++;
                    var $remainingNum = $('#pd_remaining_num');
                    $remainingNum.text(parseInt($remainingNum.text()) - 1);
                    if (index === urlList.length - 1) {
                        KFOL.removePopTips($('.pd_pop_tips'));
                        if (successNum > 0) {
                            Log.push('购买帖子', '共有`{0}`个帖子购买成功'.replace('{0}', successNum), {pay: {'KFB': -totalSell}});
                        }
                        else totalSell = 0;
                        console.log('共有{0}个帖子购买成功，共有{1}个帖子购买失败，KFB-{2}'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum)
                                .replace('{2}', totalSell)
                        );
                        KFOL.showMsg({
                            msg: '<strong>共有<em>{0}</em>个帖子购买成功{1}</strong><i>KFB<ins>-{2}</ins></i>'
                                .replace('{0}', successNum)
                                .replace('{1}', failNum > 0 ? '，共有<em>{0}</em>个帖子购买失败'.replace('{0}', failNum) : '')
                                .replace('{2}', totalSell)
                            , duration: -1
                        });
                    }
                    window.setTimeout(function () {
                        $(document).dequeue('BuyThreads');
                    }, Config.defAjaxInterval);
                }, 'html');
            });
        });
        $(document).dequeue('BuyThreads');
    },

    /**
     * 添加关注和屏蔽用户的链接
     */
    addFollowAndBlockUserLink: function () {
        var matches = /(.+?)\s*详细信息/.exec($('td:contains("详细信息")').text());
        if (!matches) return;
        var user = $.trim(matches[1]);
        $('<span>[<a href="#">关注用户</a>] [<a href="#">屏蔽用户</a>]</span><br />')
            .appendTo($('a[href^="message.php?action=write&touid="]').parent())
            .find('a').each(function () {
                var $this = $(this);
                var str = '关注';
                var userList = Config.followUserList;
                if ($this.text().indexOf('屏蔽') > -1) {
                    str = '屏蔽';
                    userList = Config.blockUserList;
                }
                if ($.inArray(user, userList) > -1) {
                    $this.addClass('pd_highlight').text('解除' + str);
                }
            }).click(function (event) {
                event.preventDefault();
                ConfigDialog.read();
                var $this = $(this);
                var str = '关注';
                var userList = Config.followUserList;
                if ($this.text().indexOf('屏蔽') > -1) {
                    str = '屏蔽';
                    userList = Config.blockUserList;
                    if (!Config.blockUserEnabled) Config.blockUserEnabled = true;
                }
                else {
                    if (!Config.followUserEnabled) Config.followUserEnabled = true;
                }
                if ($this.text() === '解除' + str) {
                    var index = $.inArray(user, userList);
                    if (index > -1) {
                        userList.splice(index, 1);
                        ConfigDialog.write();
                    }
                    $this.removeClass('pd_highlight').text(str + '用户');
                    alert('该用户已被解除' + str);
                }
                else {
                    if ($.inArray(user, userList) === -1) {
                        userList.push(user);
                        ConfigDialog.write();
                    }
                    $this.addClass('pd_highlight').text('解除' + str);
                    alert('该用户已被' + str);
                }
            });
    },

    /**
     * 关注用户
     */
    followUsers: function () {
        if (!Config.followUserEnabled || Config.followUserList.length === 0) return;
        if (KFOL.isInHomePage && Config.highlightFollowUserThreadInHPEnabled) {
            $('.b_tit4 > a, .b_tit4_1 > a').each(function () {
                var $this = $(this);
                var matches = /》by：(.+)/.exec($this.attr('title'));
                if (!matches) return;
                if ($.inArray(matches[1], Config.followUserList) > -1) {
                    $this.addClass('pd_highlight');
                }
            });
        }
        else if (location.pathname === '/thread.php') {
            $('a.bl[href^="profile.php?action=show&uid="]').each(function () {
                var $this = $(this);
                if ($.inArray($this.text(), Config.followUserList) > -1) {
                    $this.addClass('pd_highlight');
                }
            });
        }
        else if (location.pathname === '/read.php') {
            $('.readidmsbottom > a, .readidmleft > a').each(function () {
                var $this = $(this);
                if ($.inArray($this.text(), Config.followUserList) > -1) {
                    $this.closest('.readtext').prev('.readlou').find('div:nth-child(2) > span:first-child')
                        .find('a').addBack().addClass('pd_highlight');
                }
            });
        }
        else if (location.pathname === '/guanjianci.php' || location.pathname === '/kf_share.php') {
            $('.kf_share1 > tbody > tr > td:last-child').each(function () {
                var $this = $(this);
                if ($.inArray($this.text(), Config.followUserList) > -1) {
                    $this.addClass('pd_highlight');
                }
            });
        }
        else if (location.pathname === '/search.php') {
            $('.thread1 a[href^="profile.php?action=show&uid="]').each(function () {
                var $this = $(this);
                if ($.inArray($this.text(), Config.followUserList) > -1) {
                    $this.addClass('pd_highlight');
                }
            });
        }
    },

    /**
     * 屏蔽用户
     */
    blockUsers: function () {
        if (!Config.blockUserEnabled || Config.blockUserList.length === 0) return;
        if (KFOL.isInHomePage) {
            $('.b_tit4 > a, .b_tit4_1 > a').each(function () {
                var $this = $(this);
                var matches = /》by：(.+)/.exec($this.attr('title'));
                if (!matches) return;
                if ($.inArray(matches[1], Config.blockUserList) > -1) {
                    $this.parent('li').remove();
                }
            });
        }
        else if (location.pathname === '/thread.php') {
            $('a.bl[href^="profile.php?action=show&uid="]').each(function () {
                var $this = $(this);
                if ($.inArray($this.text(), Config.blockUserList) > -1) {
                    $this.closest('tr').remove();
                }
            });
        }
        else if (location.pathname === '/read.php') {
            $('.readidmsbottom > a, .readidmleft > a').each(function () {
                var $this = $(this);
                if ($.inArray($this.text(), Config.blockUserList) > -1) {
                    var $lou = $this.closest('.readtext');
                    $lou.prev('.readlou').remove().end().next('.readlou').remove().end().remove();
                }
            });
            $('.readtext fieldset:has(legend:contains("Quote:"))').each(function () {
                var $this = $(this);
                var text = $this.text();
                for (var i in Config.blockUserList) {
                    try {
                        var regex1 = new RegExp('^Quote:引用(第\\d+楼|楼主)' + Config.blockUserList[i] + '于', 'i');
                        var regex2 = new RegExp('^Quote:回\\s*\\d+楼\\(' + Config.blockUserList[i] + '\\)\\s*的帖子', 'i');
                        if (regex1.test(text) || regex2.test(text)) {
                            $this.html('<legend>Quote:</legend><mark>该用户已被屏蔽</mark>');
                        }
                    }
                    catch (ex) {
                    }
                }
            });
        }
        else if (location.pathname === '/guanjianci.php') {
            $('.kf_share1 > tbody > tr > td:last-child').each(function () {
                var $this = $(this);
                if ($.inArray($this.text(), Config.blockUserList) > -1) {
                    $this.closest('tr').remove();
                }
            });
        }
    },

    /**
     * 将侧边栏修改为和手机相同的平铺样式
     */
    modifySideBar: function () {
        $('#r_menu').replaceWith(
            '<div id="r_menu" style="width:140px;color:#9999FF;font-size:14px;line-height:24px;text-align:center;border:1px #DDDDFF solid;padding:5px;overflow:hidden;">' +
            '	<span style="color:#ff9999;">游戏</span><br />' +
            '	<a href="thread.php?fid=102">游戏推荐</a> | <a href="thread.php?fid=106">新作动态</a><br />' +
            '	<a href="thread.php?fid=52">游戏讨论</a> | <a href="thread.php?fid=24">疑难互助</a><br />' +
            '	<a href="thread.php?fid=16">种子下载</a> | <a href="thread.php?fid=41">网盘下载</a><br />' +
            '	<a href="thread.php?fid=67">图片共享</a> | <a href="thread.php?fid=57">同人漫本</a><br />' +
            '	<span style="color:#ff9999;">动漫音乐</span><br />' +
            '	<a href="thread.php?fid=84">动漫讨论</a> | <a href="thread.php?fid=92">动画共享</a><br />' +
            '	<a href="thread.php?fid=127">漫画小说</a> | <a href="thread.php?fid=68">音乐共享</a><br />' +
            '	<a href="thread.php?fid=163">LIVE共享</a>  | <a href="thread.php?fid=182">转载资源</a><br />' +
            '	<span style="color:#ff9999;">综合</span><br />' +
            '	<a href="thread.php?fid=94">原创美图</a> | <a href="thread.php?fid=87">宅物交流</a><br />' +
            '	<a href="thread.php?fid=86">电子产品</a> | <a href="thread.php?fid=115">文字作品</a><br />' +
            '	<a href="thread.php?fid=96">出处讨论</a>  | <a href="thread.php?fid=36">寻求资源</a><br />' +
            '	<span style="color:#ff9999;">交流</span><br />' +
            '	<a href="thread.php?fid=5">自由讨论</a> | <a href="thread.php?fid=56">个人日记</a><br />' +
            '	<a href="thread.php?fid=98">日本语版</a>  | <a href="thread.php?fid=9">我的关注</a><br />' +
            '	<a href="thread.php?fid=4">站务管理</a><br />' +
            '	<span style="color:#ff9999;">专用</span><br />' +
            '	<a href="thread.php?fid=93">管理组区</a> | <a href="thread.php?fid=59">原创组区</a><br />' +
            '	<a href="/">论坛首页</a><br />' +
            '</div>'
        );
    },

    /**
     * 为侧边栏添加快捷导航的链接
     */
    addFastNavForSideBar: function () {
        if (Config.modifySideBarEnabled) {
            $('#r_menu > a:last').before(
                '<span style="color:#ff9999;">快捷导航</span><br />' +
                '<a href="guanjianci.php?gjc={0}">@提醒</a> | <a href="personal.php?action=post">回复</a> | <a href="kf_growup.php">神秘</a><br />'
                    .replace('{0}', KFOL.userName) +
                '<a href="kf_fw_ig_index.php">争夺</a> | <a href="kf_fw_ig_my.php">道具</a> | <a href="kf_smbox.php">盒子</a><br />' +
                '<a href="profile.php?action=modify">设置</a> | <a href="hack.php?H_name=bank">银行</a> | <a href="profile.php?action=favor">收藏</a><br />'
            );
        }
        else {
            $('#r_menu > ul > li:last-child').before(
                '<li class="r_cmenuho"><a href="JavaScript:;">快捷导航</a>' +
                '  <ul class="r_cmenu2">' +
                '    <li><a href="guanjianci.php?gjc={0}">@提醒</a></li>'.replace('{0}', KFOL.userName) +
                '    <li><a href="kf_growup.php">神秘等级</a></li>' +
                '    <li><a href="kf_fw_ig_index.php">争夺奖励</a></li>' +
                '    <li><a href="kf_fw_ig_my.php">我的道具</a></li>' +
                '    <li><a href="kf_smbox.php">神秘盒子</a></li>' +
                '    <li><a href="profile.php?action=modify">设置</a></li>' +
                '    <li><a href="hack.php?H_name=bank">银行</a></li>' +
                '    <li><a href="profile.php?action=favor">收藏</a></li>' +
                '    <li><a href="personal.php?action=post">我的回复</a></li>' +
                '  </ul>' +
                '</li>'
            );
        }
    },

    /**
     * 自动活期存款
     */
    autoSaveCurrentDeposit: function () {
        if (!(Config.saveCurrentDepositAfterKfb > 0 && Config.saveCurrentDepositKfb > 0 && Config.saveCurrentDepositKfb <= Config.saveCurrentDepositAfterKfb))
            return;
        var $kfb = $('a.indbox1[title="网站虚拟货币"]');
        var matches = /拥有(\d+)KFB/i.exec($kfb.text());
        if (!matches) return;
        var income = parseInt(matches[1]);
        if (income < Config.saveCurrentDepositAfterKfb) return;
        var multiple = Math.floor((income - Config.saveCurrentDepositAfterKfb) / Config.saveCurrentDepositKfb);
        if (income - Config.saveCurrentDepositKfb * multiple >= Config.saveCurrentDepositAfterKfb)
            multiple++;
        var money = Config.saveCurrentDepositKfb * multiple;
        if (money <= 0 || money > income) return;
        $.post('hack.php?H_name=bank',
            {action: 'save', btype: 1, savemoney: money},
            function (html) {
                if (/完成存款/.test(html)) {
                    Log.push('自动存款', '共有`{0}`KFB已自动存入活期存款'.replace('{0}', money));
                    KFOL.showFormatLog('自动存款', html);
                    console.log('共有{0}KFB已自动存入活期存款'.replace('{0}', money));
                    KFOL.showMsg('共有<em>{0}</em>KFB已自动存入活期存款'.replace('{0}', money));
                    $kfb.text('拥有{0}KFB'.replace('{0}', income - money));
                }
            }, 'html');
    },

    /**
     * 在神秘等级升级后进行提醒
     */
    smLevelUpAlert: function () {
        var logKey = 'SmLevelUp';
        var matches = /神秘(\d+)级/.exec($('a.indbox1[href="kf_growup.php"]').text());
        if (!matches) return;
        var smLevel = parseInt(matches[1]);
        var data = TmpLog.getValue(logKey);
        var writeData = function () {
            TmpLog.setValue(logKey, {time: (new Date()).getTime(), smLevel: smLevel});
        };
        if (!data || $.type(data.time) !== 'number' || $.type(data.smLevel) !== 'number') {
            writeData();
        }
        else if (smLevel > data.smLevel) {
            var date = new Date(data.time);
            Log.push('神秘等级升级', '自`{0}`以来，你的神秘等级总共上升了`{1}`级'
                    .replace('{0}', Tools.getDateString(date))
                    .replace('{1}', smLevel - data.smLevel)
            );
            KFOL.showMsg('自<em>{0}</em>以来，你的神秘等级总共上升了<em>{1}</em>级'
                    .replace('{0}', Tools.getDateString(date))
                    .replace('{1}', smLevel - data.smLevel)
            );
            writeData();
        }
        else if (smLevel < data.smLevel) {
            writeData();
        }
    },

    /**
     * 修改我的回复页面里的帖子链接
     */
    modifyMyPostLink: function () {
        $('.t a[href^="read.php?tid="]').each(function () {
            var $this = $(this);
            $this.attr('href', $this.attr('href').replace(/&uid=\d+#(\d+)/i, '&spid=$1'));
        });
    },

    /**
     * 在短消息页面添加选择指定短消息的按钮
     */
    addMsgSelectButton: function () {
        $('<input value="自定义" type="button" style="margin-right:3px">').insertBefore('input[type="button"][value="全选"]')
            .click(function (event) {
                event.preventDefault();
                var title = $.trim(window.prompt('请填写所要选择的包含指定字符串的短消息标题（可用|符号分隔多个标题）', '收到了他人转账的KFB|银行汇款通知|您的文章被评分|您的文章被删除'));
                if (title !== '') {
                    $('.thread1 > tbody > tr > td:nth-child(2) > a').each(function () {
                        var $this = $(this);
                        $.each(title.split('|'), function (index, key) {
                            if ($this.text().toLowerCase().indexOf(key.toLowerCase()) > -1) {
                                $this.closest('tr').find('td:last-child > input[type="checkbox"]').prop('checked', true);
                            }
                        });
                    });
                }
            }).parent().attr('colspan', 4)
            .prev('td').attr('colspan', 3);
        $('<input value="反选" type="button" style="margin-left:5px;margin-right:1px">').insertAfter('input[type="button"][value="全选"]')
            .click(function (event) {
                event.preventDefault();
                $('.thread1 > tbody > tr > td:last-child > input[type="checkbox"]').each(function () {
                    var $this = $(this);
                    $this.prop('checked', !$this.prop('checked'));
                });
            });
    },

    /**
     * 在首页帖子链接旁添加快速跳转至页末的链接
     */
    addHomePageThreadFastGotoLink: function () {
        $('.index1').on('mouseenter', 'li.b_tit4:has("a"), li.b_tit4_1:has("a")', function () {
            var $this = $(this);
            $this.css('position', 'relative')
                .prepend('<a class="pd_thread_goto" href="{0}&page=e#a">&raquo;</a>'.replace('{0}', $this.find('a').attr('href')));
        }).on('mouseleave', 'li.b_tit4:has("a"), li.b_tit4_1:has("a")', function () {
            $(this).css('position', 'static').find('.pd_thread_goto').remove();
        });
    },

    /**
     * 初始化
     */
    init: function () {
        if (typeof jQuery === 'undefined') return;
        var startDate = new Date();
        //console.log('KF Online助手启动');
        if (location.pathname === '/' || location.pathname === '/index.php') KFOL.isInHomePage = true;
        ConfigDialog.init();
        if (!KFOL.getUidAndUserName()) return;
        KFOL.appendCss();
        KFOL.addConfigAndLogDialogLink();

        if (Config.modifySideBarEnabled) KFOL.modifySideBar();
        if (Config.addSideBarFastNavEnabled) KFOL.addFastNavForSideBar();
        if (KFOL.isInHomePage) {
            //KFOL.adjustCookiesExpires();
            KFOL.handleAtTips();
            if (Config.hideNoneVipEnabled) KFOL.hideNoneVipTips();
            if (Config.smLevelUpAlertEnabled) KFOL.smLevelUpAlert();
            if (Config.homePageThreadFastGotoLinkEnabled) KFOL.addHomePageThreadFastGotoLink();
        }
        else if (location.pathname === '/read.php') {
            KFOL.fastGotoFloor();
            if (Config.adjustThreadContentWidthEnabled) KFOL.adjustThreadContentWidth();
            KFOL.adjustThreadContentFontSize();
            if (Config.customSmColorEnabled) KFOL.modifySmColor();
            if (Config.customMySmColor) KFOL.modifyMySmColor();
            if (Config.multiQuoteEnabled) KFOL.addMultiQuoteButton();
            KFOL.addFastGotoFloorInput();
            KFOL.addFloorGotoLink();
            //KFOL.addFastGotoPageInput();
            KFOL.addCopyBuyersListLink();
            KFOL.addStatReplyersLink();
            if (Config.modifyKFOtherDomainEnabled) KFOL.modifyKFOtherDomainLink();
            KFOL.addBuyThreadWarning();
            if (Config.batchBuyThreadEnabled) KFOL.addBatchBuyThreadButton();
        }
        else if (location.pathname === '/thread.php') {
            if (Config.highlightNewPostEnabled) KFOL.highlightNewPost();
            if (Config.showFastGotoThreadPageEnabled) KFOL.addFastGotoThreadPageLink();
        }
        else if (/\/kf_fw_ig_renew\.php$/i.test(location.href)) {
            Item.addConvertAllItemsToEnergyLink();
        }
        else if (/\/kf_fw_ig_renew\.php\?lv=\d+$/i.test(location.href)) {
            Item.addConvertEnergyAndRestoreItemsButton();
        }
        else if (/\/kf_fw_ig_my\.php\?lv=\d+$/i.test(location.href)) {
            Item.addSellAndUseItemsButton();
        }
        else if (/\/hack\.php\?H_name=bank$/i.test(location.href)) {
            Bank.addBatchTransferButton();
        }
        else if (/\/kf_fw_card_my\.php$/i.test(location.href)) {
            Card.addStartBatchModeButton();
        }
        else if (/\/post\.php\?action=reply&fid=\d+&tid=\d+&multiquote=true/i.test(location.href)) {
            if (Config.multiQuoteEnabled) KFOL.handleMultiQuote(2);
        }
        else if (/\/message\.php\?action=read&mid=\d+/i.test(location.href)) {
            KFOL.addFastDrawMoneyLink();
            if (Config.modifyKFOtherDomainEnabled) KFOL.modifyKFOtherDomainLink();
        }
        else if (/\/profile\.php\?action=show/i.test(location.href)) {
            KFOL.addFollowAndBlockUserLink();
        }
        else if (/\/personal\.php\?action=post/i.test(location.href)) {
            KFOL.modifyMyPostLink();
        }
        else if (location.pathname === '/kf_growup.php') {
            KFOL.addCustomSmColorTips();
        }
        else if (/\/message\.php($|\?action=receivebox)/i.test(location.href)) {
            KFOL.addMsgSelectButton();
        }
        else if (location.pathname === '/kf_fw_ig_shop.php') {
            Item.addBatchBuyItemsLink();
        }
        else if (location.pathname === '/kf_fw_ig_index.php') {
            Loot.showGetLootAwardTime();
        }
        else if (/\/kf_fw_ig_pklist\.php(\?l=s)?$/i.test(location.href)) {
            Loot.addBatchAttackButton();
        }
        KFOL.blockUsers();
        KFOL.followUsers();

        var isGetLootAwardStarted = false;
        var autoDonationAvailable = Config.autoDonationEnabled && !Tools.getCookie(Config.donationCookieName);
        if (Config.autoGetLootAwardEnabled && !Tools.getCookie(Config.getLootAwardCookieName)) {
            isGetLootAwardStarted = true;
            Loot.getLootAward(autoDonationAvailable);
        }

        if (Config.autoDrawSmbox2Enabled && !Tools.getCookie(Config.drawSmboxCookieName)) {
            KFOL.drawSmbox();
        }

        var isDonationStarted = false;
        var autoSaveCurrentDepositAvailable = Config.autoSaveCurrentDepositEnabled && KFOL.isInHomePage;
        if (autoDonationAvailable && !isGetLootAwardStarted) {
            isDonationStarted = true;
            KFOL.donation(autoSaveCurrentDepositAvailable);
        }

        if (autoSaveCurrentDepositAvailable && !isDonationStarted) KFOL.autoSaveCurrentDeposit();

        /*if (Config.autoRefreshEnabled) {
         if (KFOL.isInHomePage) KFOL.startAutoRefreshMode();
         }*/

        var endDate = new Date();
        console.log('KF Online助手加载完毕，加载耗时：{0}ms'.replace('{0}', endDate - startDate));
    }
};

KFOL.init();