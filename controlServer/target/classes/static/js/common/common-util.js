//将后台的json转成jsonTree格式
var jsonTree = function (data, config) {
    var id = config.id || 'id',
        pid = config.pid || 'pid',
        children = config.children || 'children';
    var idMap = [],
        jsonTree = [];
    data.forEach(function (v) {
        idMap[v[id]] = v;
    });
    data.forEach(function (v) {
        var parent = idMap[v[pid]];
        if (parent) {
            !parent[children] && (parent[children] = []);
            parent[children].push(v);
        } else {
            jsonTree.push(v);
        }
    });
    return jsonTree;
};

/**
 *    日期格式化工具
 */
function formatDate(date, fmt) {
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            var str = o[k] + '';
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
        }
    }
    return fmt;
};

function padLeftZero(str) {
    return ('00' + str).substr(str.length);
};


/**
 * 工具类
 */
var $u = {
    chars: "0123456789abcdefghijklmnopqrstuvwxyz",
    /**
     * 深复制对象
     * @param obj
     * @returns {{}}
     */
    objCopy: function (obj) {
        var res = {};
        for (var key in obj) res[key] = obj[key];
        return res;
    },
    /**
     * 深复制数组
     * @param arr
     * @returns {[]}
     */
    arrCopy: function (arr) {
        var res = [];
        for (var idx in arr) res[idx] = arr[idx];
        return res;
    },
    /**
     * equals with arr.map(o -> o[param])
     * @param arr
     * @param param
     * @returns {[]}
     */
    arrObjMap: function (arr, param) {
        var res = [];
        if (!!!arr || arr.length === 0) return res;
        for (var idx in arr) {
            res.push(arr[idx][param]);
        }
        return res;
    },
    /**
     * 生成随机码
     * @param size      随机码的位数
     * @returns {string}
     */
    randomCode: function (size) {
        size = size || 6;
        var maxPos = this.chars.length;
        var code = '';
        for (var i = 0; i < size; i++) {
            code += this.chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return code;
    },
    // 生成随机不重复id
    createRandomId: function () {
        return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
    },
    /**
     * 拼接字符串
     * @param str
     * @returns {string}
     */
    concatStr: function () {
        var res = "";
        for (var idx in arguments) {
            res += arguments[idx];
        }
        return res;
    },
    /**
     * 严格判空
     * @param obj
     * @returns {boolean}
     */
    isNull: function (obj) {
        if (obj === undefined || obj === null || obj === '') return true;
        return false;
    },

    /*   提示框相关   */
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
    },

    /**
     * 拼接url参数
     * @param params    obj
     * @param url       prefix(nullable)
     */
    concatUrlParam: function (params, url) {
        var paramStrArray = [];
        for (var key in params) {
            var param = params[key];
            if (!this.isNull(param)) {
                paramStrArray.push(this.concatStr(key, "=", param));
            }
        }
        var paramStr = paramStrArray.join("&");
        return url ? this.concatStr(url, this.isNull(paramStr) ? '' : '?', paramStr) : paramStr;
    },

    /**
     * 获取url地址上的指定参数
     * @param variable          key值
     * @returns {string|boolean}
     */
    getUrlParam: function(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) return pair[1];
        }
        return false;
    },
    // 设置cookie
    setCookie: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    // 获取cookie
    getCookie: function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name)  == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    getExpandIdByLeve: function(array, targetLeve, currentLeve, result) {
        for (var i in array) {
            var child = array[i].children || array[i].child;
            if (currentLeve <= targetLeve)
                result.push(array[i].id);
            if (child && child.length > 0)
                result = this.getExpandIdByLeve(child, targetLeve, currentLeve + 1, result);
        }
        return result;
    },
    /**
     * 获取子节点id列表
     * @param array 树状列表
     * @param pid 父节点id
     * @param result 返回结果
     * @returns {*}
     */
    getListIdByPid: function(array, pid, result) {
        var objList = this.getListByPid(array, pid, result);
        var ids = [];
        for ( var i in objList ) {
            ids.push(objList[i].id);
        }
        return ids;
    },
    /**
     * 获取子节点某属性列表
     * @param array 树状列表
     * @param pid 父节点id
     * @param result 返回结果
     * @returns {*}
     */
    getListAttrByPid: function(array, pid, attrKey, result) {
        var objList = this.getListByPid(array, pid, result);
        var attrArray = [];
        for ( var i in objList ) {
            attrArray.push(objList[i][attrKey]);
        }
        return attrArray;
    },
    /**
     * 获取子节点列表
     * @param array 树状列表
     * @param pid 父节点id
     * @param result 返回结果
     * @returns {*}
     */
    getListByPid: function(array, pid, result) {
        pid = pid == null ? 0 : pid;
        for (var i in array) {
            var nextPid = pid;
            if (array[i].pid == pid || array[i].id == pid) {
                if (array[i]) result.push(array[i]);
                nextPid = array[i].id;
            }
            if (array[i].children && array[i].children.length > 0) {
                result = this.getListByPid(array[i].children, nextPid, result);
            }
        }
        return result;
    },
    /**
     * 从树状结构数据中根据pid和指定的属性值查找数据列表
     * @param attrKey 指定属性的键
     * @param attrValue 指定属性的值
     * @param ls 树状结构数据
     * @param pid 起始pid
     * @param roomList 最终结果
     * @returns {*}
     */
    getListByPidAndAttr: function(attrKey, attrValue, ls, pid, roomList) {
        pid = pid == null ? 0 : pid;
        for (var i in ls) {
            var type = ls[i][attrKey];
            var nextPid = pid;
            if (ls[i].pid == pid || ls[i].id == pid) {
                if (type == attrValue) roomList.push(ls[i]);
                nextPid = ls[i].id;
            }
            if (ls[i].children && ls[i].children.length > 0) {
                roomList = this.getListByPidAndAttr(attrKey, attrValue, ls[i].children, nextPid, roomList);
            }
        }
        return roomList;
    },
    /**
     * 从树状结构数据中根据pid和指定的属性值查找数据id列表
     * @param attrKey 指定属性的键
     * @param attrValue 指定属性的值
     * @param ls 树状结构数据
     * @param pid 起始pid
     * @param roomList 最终结果
     * @returns {*}
     */
    getListIdByPidAndAttr: function(attrKey, attrValue, ls, pid, roomList) {
        var objList = this.getListByPidAndAttr(attrKey, attrValue, ls, pid, roomList);
        var majorIds = [];
        for ( var i in objList ) {
            majorIds.push(objList[i].id);
        }
        return majorIds;
    },
    openDownload: function(url) {
        var $a = document.createElement('a');
        $a.setAttribute("href", url);
        $a.setAttribute("download", "");
        $a.setAttribute("target","_blank");//弹出窗体
        //模拟js事件
        var evObj = document.createEvent('MouseEvents');
        evObj.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);
        $a.dispatchEvent(evObj);
        console.log($a)
    },
    exportForIE: function(url, fileName) {
        axios({
            method:'get',
            url: url,
            responseType:'arraybuffer'
        })
            .then(function(response) {
                var date = new Date();
                var dateStr = formatDate(date, 'yyyy-MM-dd-hh-mm');
                var name = (fileName ? fileName + "-" : "") + dateStr + ".xls";
                window.navigator.msSaveOrOpenBlob(new Blob([response.data]), name);
            });
    },
    /**
     * 保存当前的排序方式（可用于任意数量属性排序）
     * @param prop 排序属性
     * @param order 排序方式
     * @param sort data定义的sort对象
     */
    saveSort: function(prop, order, sort) {
        var orderBy = '';
        if (order === "descending") orderBy += "DESC";
        else if ( order === "ascending" ) orderBy += "ASC";
        sort[prop] = {prop: prop, orderBy: orderBy};
    },
    /**
     * 保存当前的排序方式（只排序当前传入排序属性）
     * @param prop 排序属性
     * @param order 排序方式
     * @param sort data定义的sort对象
     */
    saveSortSingle: function(prop, order, sort) {
        for ( var key in sort) {
            delete sort[key]; // 清除所有的排序方式
        }
        this.saveSort(prop, order, sort);
    },
    /**
     * 获取排序方式完整字符串
     * @param sort data定义的sort对象
     */
    getSortStr: function(sort) {
        var result = [];
        for (var key in sort) {
            var orderBy = sort[key].orderBy; // 排序方式（DESC、ASC和空字符串）
            if ( orderBy.length > 0 ) {
                result.push(key + " " + orderBy);
            }
        }
        if ( result.length == 0 ) return null;
        else return result.join(",");
    },
    /**
     * 获取某学校组织下的专业id（包括本身）
     * @param college 学校组织树状数据（this.collegeTree）
     * @param collegeId 查询起始节点的id
     * @returns {[]}
     */
    getMajorList: function(college, collegeId, majorType) {
        if ( collegeId == null ) return null; // 还没有选中的时候返回null
        var majors = this.getMajorObjList(college, collegeId, majorType);
        var ids = [];
        for ( var i in majors ) ids.push(majors[i].id);
        return ids;
    },
    /**
     * 获取某学校组织下的专业对象（包括本身）
     * @param college 学校组织树状数据（this.collegeTree）
     * @param collegeId 查询起始节点的id
     * @returns {[]}
     */
    getMajorObjList: function(college, collegeId, majorType) {
        if ( collegeId == null ) return null; // 还没有选中的时候返回null
        collegeId = collegeId ? collegeId : 0;
        var majors = [];
        $u.getListByPidAndAttr('type', majorType, college, collegeId, majors);
        return majors;
    },
    /**
     * 创建化二维码
     * @param obj 存储qrcode对象的父节点
     * @param url 二维码的值
     * @param elementId 二维码所在doc的id
     * @param width 二维码宽度
     * @param height 二维码长度
     */
    initQrcode: function(obj, url, elementId, width, height) {
        if (!obj.qrcode) {
            obj.qrcode = new QRCode(document.getElementById(elementId), {
                width : width,
                height : height,
            });
        }

        obj.qrcode.makeCode(url);
    },
    isEmptyObj: function (obj) {
        if (obj === null) return true;
        return Object.getOwnPropertyNames(obj).length === 0;
    },
    /**
     * 防抖动函数
     * @param fn 需要执行的函数
     * @param delay 延时时间
     * @returns {function(...[*]=)}
     */
    debounce: function(timer, fn, delay) {
        return function() {
            // 通过 ‘this’ 和 ‘arguments’ 获取函数的作用域和变量
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(context, args);
            }, delay);
        }
    },
    list2Str: function(array) {
        if (!array) return "";
        var idArray = [];
        for (var i in array) {
            idArray.push(array[i].id);
        }
        return idArray.join(",");
    },
    clearInputFile: function (f) {
        if (f.value) {
            try {
                f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
            } catch (err) {

            }
            if (f.value) { //for IE5 ~ IE10
                var form = document.createElement('form'), ref = f.nextSibling;
                form.appendChild(f);
                form.reset();
                ref.parentNode.insertBefore(f, ref);
            }
        }
    },
    /**
     * 将source合并到target
     * @param target
     * @param source
     * @returns {*}
     */
    extend: function (target, source) {
        for (var obj in source) {
            target[obj] = source[obj];
        }
        return target;
    },
    /**
     * 判断是否为空对象
     * @param obj
     * @returns {boolean}
     */
    isNullObj: function (obj) {
        if (this.isNull(obj)) return true;
        return JSON.stringify(obj) === "{}";
    },
};

/**
 * 深度克隆
 * @param obj
 * @returns {any}
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function entity(obj) {
    if ( obj == null || obj == '' )
        return true;
    var jsonStr = JSON.stringify(obj)
    if ( jsonStr == "{}" || jsonStr == "[]" )
        return true
    return false;
}

