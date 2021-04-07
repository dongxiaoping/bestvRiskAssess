;(function (window, document, undefined) {
    "use strict"
    var _global, riskAssess = new RiskAssess ()
        , RiskGrade = {//风险等级
        Low: 0,
        Middle: 1,
        High: 2,
        UnCatch: 3, //网络等异常原因获取不到等级信息
        UnKnow: 4//等级信息缺失
    }
        , defaultConfig = {//默认配置文件
        logServiceAdd: 'https://www.toplaygame.cn', //风控日志上报服务器地址
        serviceAdd: 'https://www.toplaygame.cn', //风险评估服务器地址
        openRiskLog: true, //是否开启风控日志上报
        riskData: null, //风险评估数据，部分网络不通的项目可以使用改参数自己配置风险数据
        reqRiskDataIf: 'phpserver/public/index.php/race/room/get_config',//请求风险数据接口
        logReportIf: 'phpserver/public/index.php/race/room/get_config',//日志上报接口
        module: null, //应用所属模块
        bgColor: '#009BFE', //风险提示框主题背景色
        riskColor: 'blue', //风险字体颜色
        riskMiddleBg: 'yellow', //中风险提示背景色
        riskHighBg: 'red',//高风险提示背景色
        okButtonColor: '#168bbb', //确认按钮颜色
        cancelButtonColor: 'gray', //取消按钮颜色
        titleColor: '#444', //提示框标题颜色
        timeout: 5000 //接口超时时间
    }
        , plugin = {//BEGIN 对外接口
        //检查当前操作ID风险等级并，存在风险弹出风险提示框
        check: function (options) {
            o = $.extend ({}, defaultConfig, options)
            riskAssess.check (riskAssess.getCheckParam (options))
        },
        init: function () { //初始化插件
            if (o.riskData !== null) {
                console.log ("风险初始数据已存在")
                return
            }
            riskAssess.reqRiskData () //初始化风险数据
        },
        getRiskInfoById: function (id) { //获取指定功能点的风险信息
            return riskAssess.getRiskInfoById (id)
        },
        //修改默认配置，同时可以传入jquery（window.$ 不为jquery的情况下）
        config: function (options) {
            if (options && options.jquery) {
                window.$ = options.jquery
            }
            defaultConfig = $.extend ({}, defaultConfig, options)
        }
    }, o = defaultConfig //实际执行配置参数


    /*BEGIN 风险鉴权模块*/
    function RiskAssess () {
    }

    RiskAssess.prototype.check = function (checkParam) {
        var riskInfo = this.getRiskInfoById (checkParam.id), grade = RiskGrade.High, tipWord = null
        if (grade !== RiskGrade.Low) {
            var dia = new Dia ()
            var title = '风险提示框'
            var functionName = '功能名称1'
            var op = '操作人员2'
            var riskNumber = 98.7
            if (grade === RiskGrade.UnKnow) {
                tipWord = "当前操作的风险等级未知，请谨慎操作！"
            }
            dia.confirm (title, functionName, op, grade, checkParam.md, riskNumber, tipWord, checkParam.success, checkParam.fail)
        }
    }

    RiskAssess.prototype.getRiskInfoById = function (id) {
        if (o.riskData && typeof o.riskData[id] !== "undefined") {
            return o.riskData[id]
        }
        return null
    }

    /*从用户传参中获取风险检查参数*/
    RiskAssess.prototype.getCheckParam = function (options) {
        var success = (options && options.success && typeof options.success === "function") ? options.success : function () {
            console.log ("no success callback")
        }
        var fail = (options && options.fail && typeof options.fail === "function") ? options.fail : function () {
            console.log ("no fail callback")
        }
        var id = (options && options.id) ? options.id : null
        var md = (options && options.md) ? options.md : {}
        try {
            md = this.getFormatJsonStrFromString (JSON.stringify (md))
        } catch (e) {
            md = ""
        }
        return {id: id, md: md, success: success, fail: fail}
    }

    //根据操作id获取风险等级信息
    RiskAssess.prototype.reqRiskData = function (opId) {
        var that = this, ifAddress = o.serviceAdd + "/" + o.reqRiskDataIf
        $.ajax ({
            url: ifAddress, type: "GET", timeout: o.timeout, success: function (result) {
                that.setRiskData (result)
                console.log ("初始化风险数据：" + JSON.stringify (result))
            }, error: function (xhr, status, error) {
                console.log ("请求失败")
            }
        });
    }

    //日志上报接口
    RiskAssess.prototype.logReport = function (opId) {
        var that = this, ifAddress = o.logServiceAdd + "/" + o.logReportIf
        $.ajax ({
            url: ifAddress, type: "POST", timeout: o.timeout, success: function (result) {
                console.log ("上报成功")
            }, error: function (xhr, status, error) {
                console.log ("上报失败")
            }
        });
    }

    //获取风控服务器地址
    RiskAssess.prototype.getServiceAddress = function () {
        return o.serviceAdd
    }

    //初始化风控信息
    RiskAssess.prototype.setRiskData = function (data) {
        defaultConfig.riskData = data
    }

    RiskAssess.prototype.getFormatJsonStrFromString = function (jsonStr) { //UI展示格式化JSON数据
        let res = "";
        if (jsonStr) {
            for (let i = 0, j = 0, k = 0, ii, ele; i < jsonStr.length; i++) {//k:缩进，j:""个数
                ele = jsonStr.charAt (i);
                if (j % 2 == 0 && ele == "}") {
                    k--;
                    for (ii = 0; ii < k; ii++) ele = "    " + ele;
                    ele = "\n" + ele;
                } else if (j % 2 == 0 && ele == "{") {
                    ele += "\n";
                    k++;
                    for (ii = 0; ii < k; ii++) ele += "    ";
                } else if (j % 2 == 0 && ele == ",") {
                    ele += "\n";
                    for (ii = 0; ii < k; ii++) ele += "    ";
                } else if (ele == "\"") j++;
                res += ele;
            }
            // console.log(res);
            return res;
        }
    }

    RiskAssess.prototype.isJSON = function (str) { //验证输入JSON格式正确
        //console.log(str);
        if (typeof str == 'string') {
            try {
                let obj = JSON.parse (str);
                //console.log(obj);
                if (obj && typeof obj == 'object') {
                    // console.log('true');
                    return true;
                } else {
                    // console.log('false');
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
    }
    /*END 风险鉴权模块*/

    /*BEGIN 对话框模块*/
    function Dia () {
    }

    Dia.prototype.alert = function (msg) {
        this.GenerateHtml ("alert", "提示", msg);
        this.btnOk (); //alert只是弹出消息，因此没必要用到回调函数callback
        this.btnNo ();
    }
    /*@title 标题
     *@functionName 功能名称
     *@op 操作人员
     *@grade 风险等级
     *@md 改动json信息
     *@riskNumber 风险值
     *@success 确认回调
     *@fail 取消回调
    */
    Dia.prototype.confirm = function (title, functionName, op, grade, md, riskNumber, tipWord, success, fail) {
        var params = {
            type: "confirm",
            title: title,
            functionName: functionName,
            op: op,
            grade: grade,
            riskNumber: riskNumber,
            tipWord: tipWord,
            md: md
        }
        this.GenerateHtml (params);
        this.btnOk (success);
        this.btnNo (fail);
    }
    //生成Html
    Dia.prototype.GenerateHtml = function (params) {
        var _html = "",
            bgTipCss = params.grade === RiskGrade.Middle ? "bestv_riskassess_middle_bg" : "bestv_riskassess_high_bg",
            gradeWord
        switch (params.grade) {
            case  RiskGrade.Middle:
                gradeWord = "中"
                break
            case RiskGrade.High:
                gradeWord = "高"
                break
            default:
                gradeWord = "未知"
                params.riskNumber = "未知"
        }
        //提示行html
        var tipHtml = params.tipWord ? '<div class="bestv_riskassess_msg bestv_riskassess_tip" >' + params.tipWord + '</div>' : ''

        _html += '<div id="bestv_riskassess_box"></div><div id="bestv_riskassess_con"><span id="bestv_riskassess_tit">' + params.title + '</span>';
        _html += '<a id="bestv_riskassess_ico">x</a>' +
            '<div class="bestv_riskassess_msg">' +
            '<div class="bestv_riskassess_part">功能名称： ' + params.functionName + '</div>' +
            '<div class="bestv_riskassess_part">操作人： ' + params.op + '</div>' +
            '</div>' +
            '<div class="bestv_riskassess_msg ' + bgTipCss + '">' +
            '<div class="bestv_riskassess_part">风险等级： <span class="bestv_riskassess_ligth">' + gradeWord + '</span></div>' +
            '<div class="bestv_riskassess_part">风险系数： <span class="bestv_riskassess_ligth">' + params.riskNumber + '</span></div>' +
            '</div>' + tipHtml +
            '<div class="bestv_riskassess_msg"><div style="width: 100%;height:150px;">' +
            '<div class="bestv_riskassess_textarea_left">数据变化</div>' +
            '<div class="bestv_riskassess_textarea_right"><textarea style="width:99%;height:95%;">'
            + params.md + '</textarea></div>' +
            '</div>' +
            '</div>' +
            '<div id="bestv_riskassess_btnbox">';

        if (params.type == "alert") {
            _html += '<input id="bestv_riskassess_btn_ok" type="button" value="确定" />';
        }
        if (params.type == "confirm") {
            _html += '<input id="bestv_riskassess_btn_ok" type="button" value="确认执行" />';
            _html += '<input id="bestv_riskassess_btn_no" type="button" value="取消" />';
        }
        _html += '</div></div>';
        if ($ ("#bestv_riskassess_box,#bestv_riskassess_con")) $ ("#bestv_riskassess_box,#bestv_riskassess_con").remove ();
        //必须先将_html添加到body，再设置Css样式
        $ ("body").append (_html);
        this.GenerateCss ();
    }

    Dia.prototype.GenerateCss = function () {
        $ ("#bestv_riskassess_box").css ({
            width: '100%', height: '100%', zIndex: '99999', position: 'fixed',
            filter: 'Alpha(opacity=60)', backgroundColor: 'black', top: '0', left: '0', opacity: '0.6'
        })

        $ ("#bestv_riskassess_con").css ({
            zIndex: '999999', width: '480px', position: 'fixed',
            backgroundColor: 'White', borderRadius: '5px'
        })

        $ (".bestv_riskassess_part").css ({
            width: '48%', height: '100%', float: 'left'
        })

        $ (".bestv_riskassess_middle_bg").css ({
            backgroundColor: o.riskMiddleBg
        })

        $ (".bestv_riskassess_textarea_left").css ({
            width: '18%', height: '100%', float: 'left'
        })
        $ (".bestv_riskassess_textarea_right").css ({
            width: '80%', height: '100%', float: 'right'
        })

        $ (".bestv_riskassess_high_bg").css ({
            backgroundColor: o.riskHighBg
        });

        $ ("#bestv_riskassess_tit").css ({
            display: 'block', fontSize: '20px', color: o.titleColor, padding: '10px 15px',
            backgroundColor: '#DDD', borderRadius: '5px 5px 0 0',
            borderBottom: '3px solid ' + o.bgColor, fontWeight: 'bold'
        });

        $ (".bestv_riskassess_msg").css ({/*borderBottom: '1px dashed #DDD'*/
            padding: '10px', lineHeight: '30px',
            fontSize: '17px',
            "overflow-y": "auto"
        });

        $ (".bestv_riskassess_tip").css ({
            fontWeight: 'bold', color: o.riskColor
        });

        $ (".bestv_riskassess_ligth").css ({
            fontWeight: 'bold', fontSize: '24px', color: o.riskColor
        });


        $ ("#bestv_riskassess_ico").css ({
            display: 'block', position: 'absolute', right: '10px', top: '9px',
            width: '18px', height: '18px', textAlign: 'center',

            lineHeight: '16px', cursor: 'pointer', borderRadius: '12px', fontFamily: '微软雅黑'
        });

        $ ("#bestv_riskassess_btnbox").css ({margin: '15px 0 30px 0', textAlign: 'center'});
        $ ("#bestv_riskassess_btn_ok,#bestv_riskassess_btn_no").css ({
            width: '110px',
            height: '35px',
            borderRadius: '6px',
            color: 'white',
            border: 'none'
        });
        $ ("#bestv_riskassess_btn_ok").css ({backgroundColor: o.okButtonColor})
        $ ("#bestv_riskassess_btn_no").css ({backgroundColor: o.cancelButtonColor, marginLeft: '80px'})

        //右上角关闭按钮hover样式
        $ ("#bestv_riskassess_ico").hover (function () {
            $ (this).css ({color: 'White'});
        }, function () {
            $ (this).css ({color: 'black'});
        });

        var _widht = document.documentElement.clientWidth //屏幕宽
            , _height = document.documentElement.clientHeight //屏幕高
            , boxWidth = $ ("#bestv_riskassess_con").width ()
            , boxHeight = $ ("#bestv_riskassess_con").height ()

        //让提示框居中
        $ ("#bestv_riskassess_con").css ({
            top: (_height - boxHeight) / 2 * 0.6 + "px",
            left: (_widht - boxWidth) / 2 + "px"
        });
    }

    Dia.prototype.btnOk = function (callback) {
        $ ("#bestv_riskassess_btn_ok").click (function () {
            $ ("#bestv_riskassess_box,#bestv_riskassess_con").remove ();
            if (typeof (callback) == 'function') {
                callback ();
            }
        });
    }

    Dia.prototype.btnNo = function (callback) {
        $ ("#bestv_riskassess_btn_no,#bestv_riskassess_ico").click (function () {
            $ ("#bestv_riskassess_box,#bestv_riskassess_con").remove ();
            if (typeof (callback) == 'function') {
                callback ();
            }
        });
    }

    /*EDN 对话框模块*/

    _global = (function () {
        return this || (0, eval) ('this');
    } ());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = plugin;
    } else if (typeof define === "function" && define.amd) {
        define (function () {
            return plugin;
        });
    } else {
        !('plugin' in _global) && (_global.bestvRiskAssess = plugin);
    }
} (window, document));