var ajax = new Ajax(_config);
var $i = $i18n.obj;

SELECT_UNIT_TEXT = $i.t('unit');

var USER_TIMER = null; // 姓名筛选防抖动

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
 * 获取模糊查询后的筛选列表
 * @param screen
 * @returns {[]|*}
 */
function getScreenList(list, like) {
    var _list = []; // 过滤后的筛选列表
    if (entity(like)) return list;
    for (var i in list) {
        var str = list[i].name;
        if (str.search(like) >= 0) {
            _list.push(list[i]);
        }
    }
    return _list;
}

/**
 * 初始化自定义类型的属性
 * @param _this
 * @param obj
 * @param ref
 */
function initCustomize(_this, obj, ref) {
    setTimeout(function () {
        var isCustomize = _this.$refs[ref] && _this.$refs[ref].createdSelected;
        if (!obj.obj.propertyTypeId) return;
        if (isCustomize) {
            Vue.set(obj.obj, "control", null);
            Vue.set(obj.obj, "customizePropertyTypeName", obj.obj.propertyTypeId);
        } else {
            var pt = _this.propertyTypeMap[obj.obj.propertyTypeId];
            Vue.set(obj.obj, "control", pt.control + '');
            Vue.set(obj.obj, "customizePropertyTypeName", null);
        }
        obj.isAddCustomizePropertyType = isCustomize;
    }, 0)
}

/**
 * 创建二维码的值
 * @param data
 * @returns {string}
 */
function createQrcodeValue(data, tenantId, repairUrl) {
    var url = repairUrl + "?uniqueCode=" + data.uniqueCode
        + "&&tenantId=" + tenantId
        + "&&ts=" + new Date().getTime();
    return encodeURI(url);
}

var _dialogAdd = {
    accessControlType: 1,
    name: null,
    uniqueCode: null,
    placeId: null,
}

var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    directives: {
        'loadmore': $directive.loadmore,
    },
    data: {
        config: _config,
        staticPath: _config.staticPath,
        multipleSelection: [],
        mainLoading: false,
        /*acType: {
            1: '普通',
            2: '人脸',
            3: '门禁屏',
        },*/
        //分页信息
        list: [],
        page: {
            pageNum: 1,
            pageSize: 8,
            count: 1,
        },
/*        openWay: {
            1: 'IC卡',
            2: 'APP',
            3: '二维码',
            4: '远程开门',
            5: '密码',
            6: '人脸识别',
            7: '扫码开门',
        },
        userTypeMap: {
            0: '访客',
            1: '系统用户',
            2: '临时参会人',
        },
        statusMap: {
            4: '成功',
            8: '失败',
        },*/
        condition: {
            way: null,
            type: null,
            status: null,
            userType: null,
            acList: [],
            acLike: "",

            placeName: null,
            names: [],
            loading: {
                place: false,
                user: false,
            },
            screen: { // 名称/品牌/型号筛选列表
                user: {like: '', hasDo: false, list: [], value: [], page: {count: 0, pageNum: 0, pageSize: 10, finish: false}},
                userGroup: {like: '', hasDo: false, list: [], value: [], page: {count: 0, pageNum: 0, pageSize: 10, finish: false}},
            },

            depIds: null,
            depId: null,
            depName: null,
            depLike: null,
        },
        acList: [],
        acUniqueCodeMap: {},
        timeRange: null,
        place: [],
        placeIdNameMap: {},
        defaultProps: {
            children: 'children',
            label: 'name'
        },
        department: [],
    },
    created: function () {
        this.getList();
        this.getScreenUserList(1);
        this.getAllDepartment();
        this.getInitData();
    },
    mounted: function () {

    },
    computed: {
        /**
         * 获取筛选的用户id组
         */
        screenUserIds: function() {
            var obj = this.condition.screen.user;
            var value = obj.value;
            if ( value == null || value.length == 0 ) return null;
            return value.join(",");
        },
        screenAcList: function() {
            var list = this.acList;
            var like = this.condition.acLike;
            return getScreenList(list, like);
        },
        /**
         * 表头已选中的地点列表
         * @returns {*}
         */
        conditionPlaceSelect: function () {
            var place = this.place;
            var placeId = this.condition.placeId;
            if (entity(placeId)) return [];
            return $u.getListAttrByPid(place, placeId, "id", []);
        },
    },
    methods: {

        // region # 清空日志
        deleteAllLogs: function() {               //删除全部日志
            var _this = this;
            this.$confirm(this.$t("deleteAllTip"), this.$t("deleteAllTipTitle"), {
                type: "warning"
            })
            .then(function() {
                _this.doDeleteAllLogs();
            })
            .catch(function() {

            })
        },
        doDeleteAllLogs: function() {
            var params = {};
            var _this = this;
            ajax.handle("delete", "api/access-control/open-log/all", params, {obj: this, lname: 'mainLoading'}, function(rs) {
                _this.$message.success(_this.$t('delSuccess'));
                _this.toFirstPage();
            });
        },
        // endregion


        // region # 导出相关
        exportData: function () {
            var url = _config.server.url + "/api/access-control/open-log/batchExport";
            var obj = this.condition;
            //请求参数
            var params = {
                status: obj.status,
                way: obj.way,
                uniqueCodes: obj.acList.join(","),
                placeIds: this.conditionPlaceSelect.join(","),
                userIds: this.screenUserIds,
                depIds: this.condition.depIds,
            };
            var timeRange = this.timeRange;
            if (!$u.isNull(timeRange)) {
                params.start = timeRange[0].getTime();
                params.end = timeRange[1].getTime();
            }

            url = $u.concatUrlParam(params, url);

            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                $u.exportForIE(url, $i.t('openRecords'));
            } else {
                $u.openDownload(url);
            }
        },
        // endregion

        // region # 部门筛选
        getAllDepartment: function() {
            var _this = this;
            //请求参数
            var param = {};
            ajax.handle("get", "api/department/getAllDepartment", param, null, function(rs) {
                var data = rs.data;
                data = jsonTree(data,{});
                _this.department = data;
            });
        },
        //选择部门
        handleDepNodeClick: function(data, obj, forware) {
            var depId = data.id;
            var depName = data.name;
            obj.depId = depId;
            obj.depName = depName;
            obj.depIds = $u.list2Str($u.getListByPid(this.department, depId, []));
            if (forware) this.toFirstPage();
        },
        //取消部门选择
        cancelDepNodeSelect: function(type, obj, forware, idKey, nameKey) {
            Vue.set(obj, idKey, null);
            Vue.set(obj, nameKey, null);
            obj.depIds = null;
            eval("this.$refs." + type + ".setCurrentKey(null)");
            if (forware) this.toFirstPage();
        },
        /**
         * 表头部门模糊查询
         * @param value
         * @param data
         * @returns {boolean}
         */
        depFilter: function(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        // endregion

        // region # 用户筛选
        /**
         * 数据未加载中和数据还未加载完的时候加载更多
         * @param pageNum
         */
        tryGetUserList: function(pageNum) {
            var obj = this.condition.screen.user;
            // 当需要跳转到第一页的时候，重置显示数组和已经完成标识
            if ( pageNum === 1 ) {
                obj.list = [];
                obj.page.finish = false;
            }
            var loading = this.condition.loading.user;
            if ( !obj.page.finish && !loading ) {
                this.getScreenUserList(pageNum);
            }
        },
        /**
         * 获取申请人筛选列表
         */
        getScreenUserList: function(pageNum) {
            var _this = this;
            var obj = this.condition.screen.user;
            if ( pageNum != null ) obj.page.pageNum = pageNum;
            var param = {
                like: obj.like,
                pageNum: obj.page.pageNum,
                pageSize: obj.page.pageSize,
            };
            var url = "api/user/getScreenUserList";
            _this.condition.loading.user = true;
            ajax.handle("get", url, param, null, function(rs) {
                var _data = rs.data;
                for ( var i in _data.data ) {
                    obj.list.push(_data.data[i]); // 数据列表
                }
                obj.page.count = _data.count; // 数据总数
                if ( obj.page.count === obj.list.length ) obj.page.finish = true;
                _this.condition.loading.user = false;
            }, function(rs) {
                _this.$message.error(rs.msg);
                _this.condition.loading.user = false;
            });
        },
        /**
         * 表头筛选申请人搜索框改变
         */
        tableUserChange: $u.debounce(USER_TIMER, function() {
            this.tryGetUserList(1);
        }, 400),
        // endregion

        //取消部门选择
        cancelNodeSelect: function(type, obj, forware, idKey, nameKey) {
            Vue.set(obj, idKey, null);
            Vue.set(obj, nameKey, null);
            eval("this.$refs." + type + ".setCurrentKey(null)");
            if (forware) this.toFirstPage();
        },
        placeFilter: function (value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        //选择地点
        handleNodeClick: function (data, obj, forware, idKey, nameKey) {
            var depId = data.id;
            var depName = data.name;
            obj.depId = depId;
            obj.depName = depName;
            if (depId != obj[idKey]) {
                Vue.set(obj, idKey, depId);
                Vue.set(obj, nameKey, depName);
                Vue.set(obj, "ptype", data.type);
            }
            if (forware) this.toFirstPage();
        },
        refreshData: function () {
            this.getList();
        },
        /**
         * 列表筛选门禁类型
         * @param obj type的父级对象
         * @param type 选中门禁类型
         * @param isRefresh 是否刷新页面
         */
        selectType: function (arg) {
            var obj = arg[0];
            var type = arg[1];
            var isRefresh = arg[2];
            Vue.set(obj, 'type', type.value);
            if (isRefresh) this.toFirstPage();
        },
        /**
         * 获取数据列表
         * @param pageNum
         */
        getList: function (pageNum) {
            var _this = this;
            if (pageNum) _this.page.pageNum = pageNum;
            var obj = this.condition;
            //请求参数
            var param = {
                num: this.page.pageSize,
                index: this.page.pageNum,
                status: obj.status,
                way: obj.way,
                uniqueCodes: obj.acList.join(","),
                placeIds: this.conditionPlaceSelect.join(","),
                userIds: this.screenUserIds,
                depIds: this.condition.depIds,
                userType: this.condition.userType,
                type: this.condition.type,
            };

            var timeRange = this.timeRange;
            if (!$u.isNull(timeRange)) {
                param.start = timeRange[0].getTime();
                param.end = timeRange[1].getTime();
            }

            ajax.handle("get", "api/access-control/open-log/byDto", param, {obj: this, lname: 'mainLoading'}, function (rs) {
                var data = rs.data.data;
                if (data.length === 0 && _this.page.pageNum > 1) {
                    _this.page.pageNum--;
                    return _this.getList();
                }
                _this.list = data;
                _this.page.count = rs.data.count;
            });
        },

        /**
         * 获取页面初始化数据
         */
        getInitData: function () {
            var _this = this;
            ajax.handle("get", "api/access-control/open-log/manage/data/init", null, null, function (rs) {
                var acList = rs.data.acList;
                var acUniqueCodeMap = {};
                acList.forEach(function (ac) {
                    acUniqueCodeMap[ac.uniqueCode] = ac;
                });
                _this.acList = acList || [];
                _this.acUniqueCodeMap = acUniqueCodeMap;
                var place = rs.data.place;
                var placeIdNameMap = {};
                place.forEach(function (p) {
                    placeIdNameMap[p.id] = p.name;
                });
                _this.placeIdNameMap = placeIdNameMap;
                _this.place = jsonTree(place, {});
            });
        },

        /**
         * 跳转到第一页
         */
        toFirstPage: function () {
            this.page.pageNum = 1;
            this.getList();
        },
        //跳转到最后一页
        toLastPage: function() {
            var pageSize = this.page.pageSize;
            var count = this.page.count;
            this.page.pageNum = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1;
            this.getList();
        },
        //跳转到目标页面
        toTargetPage: function() {
            if ($u.isNull(this.page.target)) {
                this.page.target = 1;
            }
            var pageSize = this.page.pageSize;
            var count = this.page.count;
            var maxPage = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1; // 尾页页码
            this.page.target = this.page.target > maxPage ? maxPage : this.page.target;
            this.page.pageNum = this.page.target;
            this.getList();
        },
        /**
         * 批量删除
         */
        singleDelete: function (id) {
            var _this = this;
            this.$confirm($i.t('msg.t1'), $i.t('tip'), {
                confirmButtonText: $i.t('yes'),
                cancelButtonText: $i.t('cancel'),
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        _this._doMultipleDelete(id);
                    }
                },
            });
        },
        multipleDelete: function () {
            var _this = this;
            var ms = _this.multipleSelection;
            if (ms.length === 0) {
                this.$message({
                    message: $i.t('plzSelect') + SELECT_UNIT_TEXT,
                    type: 'warning'
                });
                return;
            }

            this.$confirm($i.t('msg.t1'), $i.t('tip'), {
                confirmButtonText: $i.t('yes'),
                cancelButtonText: $i.t('cancel'),
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        var ids = [];
                        ms.forEach(function (log) {
                            ids.push(log.id);
                        });
                        _this._doMultipleDelete(ids);
                    }
                },
            });
        },
        _doMultipleDelete: function (ids) {
            var _this = this;
            ajax.handle("delete", "api/access-control/open-log/byIds/" + ids, {}, {
                obj: this,
                lname: 'mainLoading'
            }, function (rs) {
                _this.$message.success($i.t('delSuccess'));
                _this.getList();
            }, function (rs) {
                _this.$message.error(rs.msg);
            });
        },

        /**
         * table-checkbox勾选event
         * @param val
         * @param obj
         */
        handleSelectionChange: function (val, obj) {
            if (obj) obj.multipleSelection = val;
            else this.multipleSelection = val;
        },


        selectWay: function (arg) {
            var obj = arg[0];
            var type = arg[1];
            var isRefresh = arg[2];
            Vue.set(obj, 'way', type.value);
            if (isRefresh) this.toFirstPage();
        },
        selectStatus: function (arg) {
            var obj = arg[0];
            var type = arg[1];
            var isRefresh = arg[2];
            Vue.set(obj, 'status', type.value);
            if (isRefresh) this.toFirstPage();
        },
        selectUserType: function (arg) {
            var obj = arg[0];
            var type = arg[1];
            var isRefresh = arg[2];
            Vue.set(obj, 'userType', type.value);
            if (isRefresh) this.toFirstPage();
        },

        timeRangeChange: function () {
            this.toFirstPage();
        },

        /**
         * 终极限制input输入为数字方法
         * @param obj
         * @param key
         * @param isInt
         */
        handleAmountChange: function(obj, key, isInt)  {
            var temp = obj[key].toString();
            if ( isInt ) {
                temp = temp.replace(/[^\d]/g, ""); //清除"数字"和"."以外的字符
                temp = temp.replace(/^(\-)*(\d+)$/, "$1$2"); //只能输入整数
            } else {
                temp = temp.replace(/。/g, ".");
                temp = temp.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
                temp = temp.replace(/^\./g, ""); //验证第一个字符是数字
                temp = temp.replace(/\.{2,}/g, ""); //只保留第一个, 清除多余的
                temp = temp.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                temp = temp.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
            }
            obj[key] = temp;
        },
    },
    watch: {
        'condition.depLike': function(val) {
            this.$refs.depCondition.filter(val);
        },
        'condition.placeLike': function (val) {
            this.$refs.condition.filter(val);
        },

    },
    filters: {
        url2FileName: function (url) {
            var index = url.lastIndexOf("\/");
            return url.substring(index + 1, url.length);
        },
        dateFull: function (mills) {
            return formatDate(new Date(mills), "yyyy-MM-dd hh:mm:ss");
        },
        /**
         * 日期格式化年月日
         * @param val
         * @returns {*}
         */
        formatDate: function (val, fmt) {
            if (!val) return "";
            return moment(val).format(fmt);
        },
        /**
         * 日期
         */
        day: function (val) {
            return val ? val + '天' : "——";
        },
        spendFormat: function (val) {
            if (!val) return "-";
            return formatSpendTime(val);
        },
        text: function (text) {
            return $u.isNull(text) ? '——' : text;
        },
        textShort: function (text) {
            return $u.isNull(text) ? '-' : text;
        },
        byKey: function (obj, key) {
            if ($u.isNull(obj) || $u.isNull(obj[key])) return '——';
            return obj[key];
        },
    }
})

