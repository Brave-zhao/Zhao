/****************************
 * AJAX请求类
 ****************************/
function Ajax(_c) {

    var URL = _c.server.url + "/";

    var SUCCESS_CODE = _c.ajax.success_code;

    var ajaxText = {
        "zh-CN": {
            permission_limit: "你的用户权限不足！",
            request_error: "请求出错！",
            data_error: "发生了一点错误！",
        },
        "en-US": {
            permission_limit: "you are out of permission!",
            request_error: "request error!",
            data_error: "Something went wrong!",
        }
    }

    var connection_error = function (e, vueObj) {
        if (!(vueObj && vueObj.obj)) {
            _c.ajax.connection_error(e);
            return;
        }
        var locale = vueObj.obj._i18n ? vueObj.obj._i18n.locale || "zh-CN" : "zh-CN";
        if (e.status === 401) {
            location.reload();
        } else if (e.status === 403) {
            $a.showError(vueObj.obj, ajaxText[locale].permisstion_limit);
        } else {
            $a.showError(vueObj.obj, ajaxText[locale].request_error);
        }
    };
    var return_error = function (result, vueObj) {
        if (!(vueObj && vueObj.obj)) {
            _c.ajax.return_error(result);
            return;
        }
        var locale = vueObj.obj._i18n ? vueObj.obj._i18n.locale || "zh-CN" : "zh-CN";
        var msg = result.msg || ajaxText[locale].data_error;
        $a.showError(vueObj.obj, msg);
    };

    var loadingStart = function (vueObj) {
        if (vueObj) {
            var lname = vueObj.lname || 'loading';
            eval("vueObj.obj." + lname + " = true");
        }
    }
    var loadingClose = function (vueObj) {
        if (vueObj) {
            var lname = vueObj.lname || 'loading';
            // vueObj.obj.$nextTick(function () {
            eval("vueObj.obj." + lname + " = false");
            // });
        }
    }
    /**
     * 执行ajax请求
     * @param type            请求类型[get,post,put,delete]
     * @param url            请求地址
     * @param data            请求参数(没有则传入{})
     * @param vueObj        vueObj，会自动设置vueObj的loading变量，不必手动处理，例子：{obj: this, lname: 'loading'}，如果lname不传入，则默认为'loading'
     * @param callback        回调函数
     * @param errorHandle    失败时的回调(如果不传入则使用默认的错误处理逻辑)
     * @param connectErrorHandle    连接错误时的回调(如果不传入则使用默认的错误处理逻辑)
     */
    this.handle = function (type, url, data, vueObj, callback, errorHandle, connectErrorHandle) {
        loadingStart(vueObj);
        var rCode = null;
        if (_c.isLog) {
            rCode = randomCode();
            console.log("[" + rCode + "][" + type + "]", url, data);
        }
        $.ajax({
            url: URL + url,
            type: type,
            dataType: "json",
            data: data,
            cache: false,
            success: function (result) {
                if (_c.isLog) console.log("[" + rCode + "][SUCCESS]", result);
                loadingClose(vueObj);

                if (result.code === SUCCESS_CODE) {
                    callback(result);
                } else {
                    if (errorHandle) {
                        errorHandle(result);
                    } else {
                        return_error(result, vueObj);
                    }
                }
            },
            error: function (e) {
                if (_c.isLog) console.error("[" + rCode + "][ERROR]", e);
                loadingClose(vueObj);

                if (connectErrorHandle) {
                    connectErrorHandle(e);
                } else {
                    connection_error(e, vueObj);
                }
            }
        });
    }

    /**
     * 执行带文件的ajax请求
     * @param type            请求类型[get,post,put,delete]
     * @param url            请求地址
     * @param formData        请求参数(没有则传入{})
     * @param vueObj        vueObj，会自动设置vueObj的loading变量，不必手动处理，例子：{obj: this, lname: 'loading'}，如果lname不传入，则默认为'loading'
     * @param callback        回调函数
     * @param errorHandle    失败时的回调(如果不传入则使用默认的错误处理逻辑)
     * @param connectErrorHandle    连接错误时的回调(如果不传入则使用默认的错误处理逻辑)
     */
    this.handleWithFiles = function (type, url, formData, vueObj, callback, errorHandle, connectErrorHandle) {
        loadingStart(vueObj);
        var rCode = null;
        if (_c.isLog) {
            rCode = randomCode();
            console.log("[" + rCode + "][" + type + "]", url, formData);
        }
        $.ajax({
            url: URL + url,
            type: type,
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                if (_c.isLog) console.log("[" + rCode + "][SUCCESS]", result);
                loadingClose(vueObj);

                if (result.code === SUCCESS_CODE) {
                    callback(result);
                } else {
                    if (errorHandle) {
                        errorHandle(result);
                    } else {
                        return_error(result, vueObj);
                    }
                }
            },
            error: function (e) {
                if (_c.isLog) console.error("[" + rCode + "][ERROR]", e);
                loadingClose(vueObj);

                if (connectErrorHandle) {
                    connectErrorHandle(e);
                } else {
                    connection_error(e, vueObj);
                }
            }
        });
    }

    /**
     * 指定contentType执行ajax请求
     * @param type            请求类型[get,post,put,delete]
     * @param url            请求地址
     * @param data            请求参数(没有则传入{})
     * @param vueObj        vueObj，会自动设置vueObj的loading变量，不必手动处理，例子：{obj: this, lname: 'loading'}，如果lname不传入，则默认为'loading'
     * @param contentType    指定的contentType(必传)
     * @param callback        回调函数
     * @param errorHandle    失败时的回调(如果不传入则使用默认的错误处理逻辑)
     * @param connectErrorHandle    连接错误时的回调(如果不传入则使用默认的错误处理逻辑)
     */
    this.handleWithCT = function (type, url, data, vueObj, contentType, callback, errorHandle, connectErrorHandle) {
        loadingStart(vueObj);
        var rCode = null;
        if (_c.isLog) {
            rCode = randomCode();
            console.log("[" + rCode + "][" + type + "]", url, data);
        }
        $.ajax({
            url: URL + url,
            type: type,
            dataType: "json",
            contentType: contentType,
            data: data,
            cache: false,
            success: function (result) {
                if (_c.isLog) console.log("[" + rCode + "][SUCCESS]", result);
                loadingClose(vueObj);

                if (result.code === SUCCESS_CODE) {
                    callback(result);
                } else {
                    if (errorHandle) {
                        errorHandle(result);
                    } else {
                        return_error(result, vueObj);
                    }
                }
            },
            error: function (e) {
                if (_c.isLog) console.error("[" + rCode + "][ERROR]", e);
                loadingClose(vueObj);

                if (connectErrorHandle) {
                    connectErrorHandle(e);
                } else {
                    connection_error(e, vueObj);
                }
            }
        });
    }

    /**
     * 将json数据的键的下划线转为驼峰
     */
    this.data2Camel = function (data) {
        if (!data) return null;
        var _data = {};
        for (var key in data) {
            _data[camelCase(key)] = data[key];
        }
        return _data;
    }

    /**
     * 将字符串的下划线转驼峰
     */
    function camelCase(string) {
        return string.replace(/_([a-z])/g, function (all, letter) {
            return letter.toUpperCase();
        });
    }

    /**
     * json转formData
     */
    this.json2formData = function (json) {
        var formData = new FormData();
        for (var key in json) {
            formData.append(key, json[key]);
        }
        return formData;
    }

    /**
     * 数据判空与校验
     * @param dataGroup            需要判空的json数据
     * @param checkParmaName    需要判空的字段，数组['name','age']
     * @param notNullGroup        是否允许为空,数组[false, true]
     * @param regExpGroup        需要判断的正则表达式，数组，下标位置要与checkParamName对应[*,+]，如果不需要正则匹配，则输入null[null,null]
     * @param nullStr            如果字段为空，需要显示的提示，数组，下标位置要与checkParamName对应['名字不能为空','请输入年龄']，如果不需要提示，则输入''['','']
     * @param 如果有字段判空与校验不成功，则返回true，否则返回false
     */
    this.checkNull = function (dataGroup, checkParamName, notNullGroup, regExpGroup, nullStr) {
        for (var idx in checkParamName) {
            var data = dataGroup[checkParamName[idx]];
            var notNull = notNullGroup[idx];
            // 判空
            if (data === undefined || data === '' || data === null) {
                if (notNull) {
                    alertNullStr(nullStr[idx]);
                    return true;
                }
            } else {
                // 判断正则
                var regExp = regExpGroup[idx];
                if (regExp) {
                    if (typeof data === 'number') {
                        data = data.toString();
                    }
                    if (!regExp.test(data)) {
                        alertNullStr(nullStr[idx]);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // 输出判空提示
    function alertNullStr(str) {
        if (str && str != '' && str != null) {
            alert(str);
        }
    }

    /**
     * 生成随机码
     * @param size      随机码的位数
     * @returns {string}
     */
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz";

    function randomCode(size) {
        size = size || 6;
        var maxPos = chars.length;
        var code = '';
        for (var i = 0; i < size; i++) {
            code += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return code;
    }
}


/** 提示框(vue用) **/
var $a = {
    alert: function (_this, msg, title) {
        if (title == null) {
            title = "提示";
        }
        _this.$alert(msg, title)
    },
    showSuccess: function (_this, msg) {		//显示成功提示
        _this.$message({
            type: "success",
            message: msg
        });
    },
    showError: function (_this, msg) {		//显示失败提示
        _this.$message({
            type: "error",
            message: msg
        });
    },
    showWarning: function (_this, msg) {		//显示警告提示
        _this.$message({
            type: "warning",
            message: msg
        });
    }
};

/** 表单数据验证(vue用) **/
var $form = {
    regCheck: function (vueObj, formData, formReg, errorMsg) {
        for (var key in formReg) {
            var data = formData[key];
            var isNull = $u.isNull(data);
            if (formReg[key].nullable === true) {
                if (isNull) continue;
            } else {
                if (isNull) {
                    $a.showError(vueObj, errorMsg[key]);
                    return false;
                }
            }
            var reg = formReg[key].reg;
            if (reg !== null && !reg.test(data)) {
                $a.showError(vueObj, errorMsg[key]);
                return false;
            }
        }

        return true;
    }
}
