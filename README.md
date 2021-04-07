##标题JS风险提示插件使用说明
###配置选项

*  **logServiceAdd** 风控上报日志服务器地址，默认值为
*  **serviceAdd** 风控信息服务器地址，默认值为
*  **openRiskLog** 是否开启风控日志上报，默认true
*  **riskData** 各风控点风控评估数据，该值支持本地配置或者从风控信息服务器获取，默认为null
*  **reqRiskDataIf** 请求风险数据接口，默认值为xxxx
*  **logReportIf** 日志上报接口，默认值为xxxx
*  **bgColor** 风险提示框主题背景色，默认"#009BFE"
*  **module** 应用所属模块，默认为null，不传取所有风控点风控评估数据
*  **riskColor** 风险字体颜色，默认"blue"
*  **riskMiddleBg** 中风险提示背景色，默认"yellow"
*  **riskHighBg** 高风险提示背景色，默认"red"
*  **okButtonColor** 确认按钮颜色，默认"#168bbb"
*  **cancelButtonColor** 取消按钮颜色，默认"gray"
*  **titleColor** 提示框标题颜色，默认"#444"
*  **timeout** 接口超时时间,单位毫秒，默认5000

###事件
*  **success** 1、当风险评估为无风险时被触发2、当风险提示框弹出，用户点击确认执行按钮时被触发
*  **fail**  当风险提示框弹出，用户点击取消按钮时被触发

###方法
*  **check** 检查指定风险点是否存在风险，当检测结果为中风险或者高风险时，弹出确认执行提示框
*  **init**  初始化风控插件，建议应用加载第一时间调用，用于网络加载riskData
*  **config**  对配置选项的相关值进行修改
*  **getRiskInfoById**  获取指定功能点风险信息

###依赖
该插件依赖jquery，调用时确保window.$可以调用，或者调用方法传入jquery，如：
```
bestvRiskAssess.check({
    id:xxx,
    jquery:xxx,
    success:function(){
        ...
    },
    fail:function(){
        ...
    }
    ...
})
```
或者
```
bestvRiskAssess.config({
    jquery:xxx,
    ...
})
```


###模块导入
####CommonJs
```
const bestvRiskAssess = require('./bestvRiskAssess.js')
```
####es6 module
```
import  bestvRiskAssess from './bestvRiskAssess'
```
####全局变量模式
```
<script src="./bestvRiskAssess.js" type="text/javascript"></script>
bestvRiskAssess.check(...)
```
###用法说明
```
/**
 * 初始化风控插件，应用加载的第一时间调用，用于插件从服务器获取各风控点风险数据信息集合
*/
bestvRiskAssess.init()
```

```
/**
 * 功能点风控检查，无风险时回调success函数，有风险时弹出风险提示框.
 * @id 必填，功能点id，每个功能点都有一个唯一id
 * @success 必填，无风险或者风险提示框OK按钮点击回调
 * @md 选填，当前功能点操作数据变动描述，是一个json对象，格式为{beforeChange："执行前的变动数据信息"，
 * afterChange："执行后的变动数据信息"，describe："文字说明"}。该数据会显示在风险提示框的提示信息中，提供给操作者做参考
 * @fail 选填，风险提示框cancel按钮点击调用
 * @其它 选填，配置选项，用于修改配置项的参数，并且只在当前函数执行中有效
*/
bestvRiskAssess.check({
    id:xxx,
    success:function(){
        ...
    },
    fail:function(){
        ...
    }
    ...
})
```

```
/**
 * 修改插件配置，具体参数参考配置选项，不设置表示默认
*/
bestvRiskAssess.config({
    riskHighBg: "yellow"，
    openRiskLog: "false"，
    ...
})
```

```
/**
 * 获取指定功能点的风险信息
 * @id 必填，功能点id，每个功能点都有一个唯一id
 */
bestvRiskAssess.getRiskInfoById(id)
```

###高级应用
####插件离线应用
当网络不通时，插件初始化风险数据无法获取，并且数据上报服务器无法连接时，如果使用插件？
```
bestvRiskAssess.config({
    riskData: ..,//本地配置风险数据，传给插件
    openRiskLog: false, //数据上报设置为false
    ...
})
```
####不同页面如何定制提示框样式
```

bestvRiskAssess.check({
    id:xxx,
    success:function(){
        ...
    },
    bgColor:"xxx" //提示框背景颜色
    riskColor:"xxx" //风险字体颜色,其它配置参考文档
    ...
})
```
