# KF Online助手
KF Online必备！可在绯月Galgame上自动抽取神秘盒子、道具或卡片以及KFB捐款，并可使用各种方便的功能，更多功能开发中……

## 脚本下载地址
https://greasyfork.org/zh-CN/scripts/8615

## 使用说明
可编辑脚本对以下设置进行修改：

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
    };

## 更新日志
* __V2.2.0 (2015-03-21)__
  * 增加了无需访问首页即可自动抽奖的功能
  * 增加了转换本级全部已使用的道具为能量的功能
* __V2.1.1 (2015-03-17)__
  * 增加了定时模式的功能（默认禁用，需停留在首页，而且在某些特殊情况下可能会失效，如：维护、无法连接、404等，建议配合浏览器的定时刷新功能来使用）
  * 修正了定时模式下计算刷新间隔的BUG
* __V2.0.0 (2015-03-16)__
  * 2.0版正式发布
* __V1.0.0 (2015-03-14)__
  * 1.0版正式发布

## 开发计划
### 近期计划：
* 提供设置界面（无需修改代码，方便脚本升级）
* KFB捐款可设定为已有收入的百分比（最多5000KFB以内）以及可以设定在一天的某个时间段之后捐款

### 远期计划：
  批量使用道具、卡片批量转换为VIP时间、批量神秘抽奖等等功能处于开发计划中  
  _（不过目前可供测试的样本数量还太少了，或者哪位菊苣能贡献一下账号让我测试一下？）_

## 讨论帖
http://bbs.2dgal.com/read.php?tid=478307

## License
[MIT](http://opensource.org/licenses/MIT)
