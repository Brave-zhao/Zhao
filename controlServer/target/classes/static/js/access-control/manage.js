var ajax = new Ajax(_config);
var $i = $i18n.obj;
var imageCompress = new ImageCompress({maxWidth: 1024, maxHeight: 1024, quality: 0.7});

var SELECT_UNIT_TEXT = $i.t('unit');
var LIMIT_DATE_START = null;
var LIMIT_DATE_END = null;
var SYNC_WARN_TEXT = '<p><strong>该操作将会执行以下内容:</strong></p><p>1. 同步门禁设备时间</p><p>2. 同步门禁开门二维码验证密钥</p>' +
    '<p class="important-tip-info"><i class="el-icon-warning-outline">如果同步无效，请尝试重启门禁</i></p>';

var userSearchPageDebounce = new Debounce(250);
// var WEEK_SHORT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

var FLAG_MAPPING = {
    "access_control": 1,
    "face_recognition": 2,
    "ac_screen": 3,
};

var AC_SCREEN_UUID_REG = /^\d{6}$/;
var UPDATE_FILE_NAME_REG = /^(.*)_v(.*).*\.bin$/;
var UPDATE_MINIMUM_VERSION = '1.2.0';
var UPDATE_VERSION_WARNING_TEXT = '<p class="important-tip-info">当前门禁的固件版本低于' + UPDATE_MINIMUM_VERSION + '，可能无法正常升级</p>';

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
    equipmentIp: null,
    equipmentPort: null,
}

var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    data: {
        asList: [],
        flashingUuidMap: {},
        isFirstSelectUser: true,
        // dayArray: [
        //     {
        //         value: 0,
        //         label: '周日'
        //     }, {
        //         value: 1,
        //         label: '周一'
        //     }, {
        //         value: 2,
        //         label: '周二'
        //     }, {
        //         value: 3,
        //         label: '周三'
        //     }, {
        //         value: 4,
        //         label: '周四'
        //     }, {
        //         value: 5,
        //         label: '周五'
        //     }, {
        //         value: 6,
        //         label: '周六'
        //     }
        // ],
        pickerOptions: {
            disabledDate: function (date) {
                var targetDate = new Date();
                targetDate.setHours(0);
                targetDate.setMinutes(0);
                targetDate.setSeconds(0);
                return date.getTime() <= (targetDate.getTime() - 1000);
            },
            shortcuts: [/*{
                text: '今天',
                onClick(picker) {
                    var date = new Date();
                    date.setHours(23);
                    date.setMinutes(59);
                    date.setSeconds(59);
                    picker.$emit('pick', date);
                }
            },*/ {
                text: $i.t('pickerShortcuts[0]'),
                onClick: function(picker) {
                    var date = new Date();
                    date.setTime(date.getTime() + 604800000)
                    date.setHours(23);
                    date.setMinutes(59);
                    date.setSeconds(59);
                    picker.$emit('pick', date);
                }
            }, {
                text: $i.t('pickerShortcuts[1]'),
                onClick: function(picker) {
                    const date = new Date();
                    date.setMonth(date.getMonth() + 1);
                    date.setHours(23);
                    date.setMinutes(59);
                    date.setSeconds(59);
                    picker.$emit('pick', date);
                }
            }, {
                text: $i.t('pickerShortcuts[2]'),
                onClick: function(picker) {
                    const date = new Date();
                    date.setMonth(date.getMonth() + 3);
                    date.setHours(23);
                    date.setMinutes(59);
                    date.setSeconds(59);
                    picker.$emit('pick', date);
                }
            }, {
                text: $i.t('pickerShortcuts[3]'),
                onClick: function(picker) {
                    const date = new Date();
                    date.setMonth(date.getMonth() + 6);
                    date.setHours(23);
                    date.setMinutes(59);
                    date.setSeconds(59);
                    picker.$emit('pick', date);
                }
            }, {
                text: $i.t('pickerShortcuts[4]'),
                onClick: function(picker) {
                    const date = new Date();
                    date.setFullYear(date.getFullYear() + 1);
                    date.setHours(23);
                    date.setMinutes(59);
                    date.setSeconds(59);
                    picker.$emit('pick', date);
                }
            }, {
                text: $i.t('pickerShortcuts[5]'),
                onClick: function(picker) {
                    const date = new Date();
                    date.setFullYear(date.getFullYear() + 2);
                    date.setHours(23);
                    date.setMinutes(59);
                    date.setSeconds(59);
                    picker.$emit('pick', date);
                }
            }]
        },
        statusDialogVisible: false,
        acStatusOptions: $i.t('dialog.status.acStatusOptions'),
        snDeviceMap: {},
/*        acType: {
            1: '普通',
            2: '人脸',
            3: '门禁屏',
        },
        onlineStatuses: {
            1: '在线',
            2: '离线'
        },*/
        statusPlaces: [],
        // fileList
        fileList: [],
        // user
        user: {},
        //
        config: _config,
        staticPath: _config.staticPath,
        multipleSelection: [],
        totalLoading: false,
        mainLoading: false, // 主界面的loading
        //分页信息
        page: {
            pageNum: 1,
            pageSize: 8,
            count: 1,
            target: null,
        },
        defaultProps: {
            children: 'children',
            label: 'name'
        },
        //列表数据初始化参数
        condition: {
            onlineStatus: null,
            type: null,
            loading: {
                place: false,
            },
            pid: 0,
            placeId: null,
            placeName: null,
            like: null,
            names: [],
            progress: {
                maxOverhaul: 0,
                maxLife: 0,
            },
            sort: {
                number: {
                    orderBy: "DESC",
                    prop: "number",
                }
            }, // 排序方式
            screen: { // 名称/品牌/型号筛选列表
                PROPERTY_NAME: {like: '', hasDo: false, list: [], value: []},
                PROPERTY_BRAND: {like: '', hasDo: false, list: [], value: []},
                PROPERTY_MODEL: {like: '', hasDo: false, list: [], value: []},
                REPAIR_NICKNAME: {like: '', hasDo: false, list: [], value: []},
            },
            propertyType: [], // 已选中的资产类型
            ptLike: '',
            status: '',
        },
        list: [],
        operationTextMap: {
            'open': $i.t('ptm.open'),
            'restart': $i.t('ptm.restart'),
            'sync-config': $i.t('ptm.syncConfig'),
        },
        dialog: {//模态框属性
            selectUser: {
                show: false,
                multipleSelection: [],
                list: [],
                like: '',
                page: {
                    pageNum: 1,
                    pageSize: 8,
                    count: 1,
                    target: null,
                },
                imageUrlPrefix: _config.server.central,
                depName: null,
                depId: null,
                depIds: "",
            },
            updateSK87: {
                show: false,
                loading: false,
                list: [],
                obj: {},
                selected: -1,
            },
            view: {
                show: false,
                loading: false,
                obj: {},
            },
            del: {
                show: false,
                msg: $i.t('msg.t5'),
                ids: '',
            },
            add: {
                show: false,
                obj: deepClone(_dialogAdd)
            },
            update: {//编辑
                show: false,
                loading: false,
                obj: {},
                collapse: "1",
                uniqueBtnLoading: false,
                isAddCustomizePropertyType: false,
                showResetQrcode: false,
                allowEditPlace: false,
            },
            addWhiteList: {
                show: false,
                loading: false,
                value: '',
                type: 1,
                start: null,
                end: null,
                isEdit: false,
                id: null,
                typeList: [
                    {value: 1, name: 'IC卡'},
                    // {value: 2, name: 'APP ID'},
                    // {value: 3, name: '二维码'},
                ],
                startTime: '',
                endTime: '',
                repeat: 0,
                repeatDayArray: [],
            },
            whiteList: {
                show: false,
                loading: false,
                search: '',
                searchUser: '',
                list: [],
                userList: [
                    // {nickname:'张三', id:1},
                    // {nickname:'李四', id:2},
                ],
                userPage: {
                    pageNum: 1,
                    pageSize: 8,
                },
                userSearchFinish: false,
                userLoading: false,
                autoRefresh: true,
                deviceSn: null,
                timeout: null,
                now: null,
                multipleSelection: [],
                idNicknameMap: {},
/*                typeTextMapping: {
                    1: 'IC卡',
                    2: 'APP ID',
                    3: '二维码',
                },*/
                /*statusTextMapping: {
                    1: '等待中',
                    2: '已添加',
                    4: '添加失败',
                    8: '删除中',
                    16: '删除失败',
                },*/
                statusColorMapping: {
                    1: '#F0871F',
                    2: '#2FC284',
                    4: '#D55643',
                    8: '#FF3030',
                    16: '#D55643',
                },
                page: {
                    pageNum: 1,
                    pageSize: 8,
                    count: 1,
                    target: null,
                },
                /*repeatTypeMapping: {
                    0: '日重复',
                    1: '周重复',
                },*/
            },
            acList: {
                test: true,
                show: false,
                loading: false,
                list: [],
            },
            export: {
                show: false,
                start: null,
                end: null,
                uniqueCode: null,
            },
            sync: {
                show: false,
                uniqueCodes: null,
                acTypes: null,
                checkList: [0],
                heartTime: 2,
            },
        },
        realPlace: [], // 源数据
        place: [], // 树状数据
        propertyType: [], // 全部资产类型
        propertyTypeMap: {}, // 资产映射
        PropertyTemplate: [], // 全部厂家模板
        uniqueCodeTip: $importTipObj.uniqueCode, // 唯一码设置说明
        tenantId: '', // 登录用户租户
        repairUrl: '', // 移动端报修页面地址
/*        statusMap: {
            "1": {name: "已上报", color: "#FF5D5D"},
            "2": {name: "处理中", color: "#30AFE1"},
            "4": {name: "已完成", color: "#27CC7D"},
        },*/
        propertyArray: [],
        updateAcObj: null,

        // region # 日志
        logDialog: {
            lastRecord: null,           //上次打开的设备信息
            record: {},            //当前打开的设备信息
            tabActive: null,
            selectTimes: [],                //选择的时间
            search: "",                  //搜索值
            data: [],                      //表格数据
            showTable: true,                 //是否显示表格， 优化选项切换表格渲染问题
            loading: false,
        },
        logDialogVisible: false,
        logPage: {
            pageNum: 1,
            pageSize: 20,
            count: 0,
        },
        // endregion

        alertStrategy: [{"id":4,"name":"预警A","types":"2,3,4,1","alertVoiceMode":3,"deleted":0,"createTime":"2021-12-22T05:50:01.000+0000","updateTime":"2021-12-23T10:40:50.000+0000","tenantId":"000002"}],
        alarmLevel: "",

        department: [],
    },
    created: function () {
        this.getList();
        this.getInitData();
    },
    mounted: function () {

    },
    computed: {

        depExpand3: function() {
            return $u.getExpandIdByLeve(this.department, 3, 1, []);
        },

        // region # 日志

        logTypeOptions: function() {
            return [{
                value: "1",
                name: this.$t('placeholder.h9'),
                icon: "el-icon-bell",
            }, {
                value: "2",
                name: this.$t('placeholder.h10'),
                icon: "el-icon-thumb"
            }]
        },
        logSubTypeMap: function() {
            return {
                "online": this.$t('placeholder.h11'),
                "offline": this.$t('placeholder.h12'),
                "reboot": this.$t('placeholder.h13'),
                "open": this.$t('placeholder.h14'),
                "firmware_upgrade": this.$t('placeholder.h15'),
                "control": "管控",
            }
        },

        // endregion

        filterList: function() {
            // debugger
            var onlineStatus = this.condition.onlineStatus;
            var list = this.list;
            if ($u.isNull(onlineStatus)) {
                return list;
            }
            var pageNum = this.page.pageNum;
            var pageSize = this.page.pageSize;
            list = list.filter(function (item) {
                return (onlineStatus == 1) === item.isOnline;
            });
            this.page.count = list.length;
            var start = (pageNum - 1) * pageSize;
            return list.slice(start, start + pageSize);
        },

        exportPickerOptions: function() {
            var start = this.dialog.export.start;
            return {
                disabledDate: function (date) {
                    if ($u.isNull(start)) return false;
                    return date.getTime() < start.getTime();
                }
            }
        },
        filterWhiteList: function () {

            var search = this.dialog.whiteList._search;
            var list = this.dialog.whiteList.list;
            if ($u.isNull(search)) return list;

            return list.filter(function (item) {
                return item.value.indexOf(search) !== -1;
            });
        },
        /**
         *
         */
        isShowProgress: function () {
            var target = this.dialog.add.obj.createTimeMillis;
            if ($u.isNull(target)) return false;
            var now = new Date().getTime();
            return target < now;
        },
        isCanSync: function () {
            var dialog = this.dialog.sync;
            return !$u.isNull(dialog.checkList) && dialog.checkList.length > 0;
        },
        isCanExport: function () {
            var dialog = this.dialog.export;
            return !$u.isNull(dialog.start) && !$u.isNull(dialog.end);
        },
        isCanAdd: function () {
            var obj = this.dialog.add.obj;
            var accessControlType = obj.accessControlType;
            return !$u.isNull(obj.name) &&
                !$u.isNull(obj.uniqueCode) &&
                // !$u.isNull(obj.placeId) &&
                (accessControlType === 2 ? (!$u.isNull(obj.equipmentPort) && !$u.isNull(obj.equipmentIp)) : true);
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
        /**
         * 表头品牌筛选列表
         */
        screenTypeList: function () {
            var list = this.propertyType;
            var like = this.condition.ptLike;
            return getScreenList(list, like);
        },
        /**
         * 表头品牌筛选列表
         */
        screenModelList: function () {
            var screen = this.condition.screen['PROPERTY_MODEL'];
            return getScreenList(screen.list, screen.like);
        },
        /**
         * 表头品牌筛选列表
         */
        screenBrandList: function () {
            var screen = this.condition.screen['PROPERTY_BRAND'];
            return getScreenList(screen.list, screen.like);
        },
        /**
         * 表头名称筛选列表
         */
        screenNameList: function () {
            var screen = this.condition.screen['PROPERTY_NAME'];
            return getScreenList(screen.list, screen.like);
        },
        /**
         * 表头品牌筛选列表
         */
        screenNicknameList: function () {
            var screen = this.condition.screen['REPAIR_NICKNAME'];
            return getScreenList(screen.list, screen.like);
        },
        /**
         * 检查状态设置模态框是否只有一个门禁
         */
        isSingleAc: function () {
            return this.statusPlaces.length === 1 && this.statusPlaces[0].data.length === 1;
        },
    },
    methods: {

        // region # 白名单选用户筛选
        getAllDepartment: function() {
            var obj = this.dialog.selectUser;
            obj.depId = null;
            obj.depName = null;
            obj.depIds = "";
            var _this = this;
            //请求参数
            var param = {};
            ajax.handle("get", "api/department/getAllDepartment", param, null, function(rs) {
                var data = rs.data;
                data = jsonTree(data,{});
                _this.department = data;
            });
        },
        userSelectDepChange: function (data, obj, forware, idKey, nameKey) {
            var depId = data.id;
            var depName = data.name;
            obj.depId = depId;
            obj.depName = depName;
            obj.depIds = $u.list2Str($u.getListByPid(this.department, depId, []));
            if (forware) this.toFirstUserPage();
        },
        userSelectCancelDep: function (type, obj, forware) {
            obj.depId = null;
            obj.depName = null;
            obj.depIds = "";
            eval("this.$refs." + type + ".setCurrentKey(null)");
            if (forware) this.toFirstUserPage();
        },
        // endregion

        // region # 日志
        exportLogV2: function() {                       //导出日志
            //开始时间和结束时间
            var startTime = null;
            var endTime = null;
            var times = this.logDialog.selectTimes;

            //判断是否已选择时间
            if(times == null || times.length < 2) {
                this.$message.error(this.$t('placeholder.h7'));
                return;
            }

            startTime = times[0];
            endTime = times[1];

            //类型(提醒或操作)
            var type = this.logDialog.tabActive;

            //设备唯一码
            var uniqueCode = this.logDialog.record.uniqueCode;
            var url = _config.server.url + "/access-control/exportEquipmentLogs?1=1";
            // var url = _config.server.central + "api/v3/exportEquipmentLogs?1=1";
            var params = {
                type: this.logDialog.tabActive,
                uniqueCode: uniqueCode,
                startTimeTS: startTime.getTime(),
                endTimeTS: endTime.getTime(),
            }
            for (var paramKey in params) {
                if ( params[paramKey] != null )
                    url = url + "&&" + paramKey + "=" + params[paramKey];
            }
            // window.open(url);
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                $u.exportForIE(url, this.$t('placeholder.h8'));
            } else {
                $u.openDownload(url);
            }
        },




        /*********************************设备日志*******************************************/
        formatNull: function(row, column, cellValue, index) {         //格式化空数据
            if(cellValue == null || cellValue == "") {
                return "——";
            }
            return cellValue;
        },
        formatLogTime: function(row, column, cellValue, index) {
            if(cellValue == null || cellValue == "") {
                return "——";
            }
            return moment(cellValue).format("YYYY-MM-DD HH:mm:ss");
        },
        showLogDialog: function(record) {
            //判断当前是否有选中tab，没有选中则默认第一个选项
            if(this.logDialog.tabActive == null && this.logTypeOptions.length > 0) {
                this.logDialog.tabActive = this.logTypeOptions[0].value;
            }

            //判断上一次打开的是否与当前打开的一致，一致则获取上次页码，否则则获取第一页数据
            var pageNum = 1;
            if(this.logDialog.lastRecord != null
                && this.logDialog.lastRecord.id == record.id) {
                pageNum = this.logPage.pageNum;
            }
            this.logDialog.lastRecord = record;
            this.logDialog.record = record;
            this.logDialogVisible = true;
            this.getLogData(pageNum);
        },
        getLogData: function(pageNum) {                      //获取日志列表数据,pageNum: 页码，不传默认当前页码
            pageNum = pageNum || this.logPage.pageNum;
            var params = {
                pageNum: pageNum,
                pageSize: this.logPage.pageSize,
                type: this.logDialog.tabActive,
                uniqueCode: this.logDialog.record.uniqueCode
            }
            //添加搜索参数
            var search = this.logDialog.search;
            if(search != null && search != "") {
                params.like = search;
            }

            //添加开始时间和结束时间参数
            var times = this.logDialog.selectTimes;
            if(times != null && times.length == 2) {
                params.startTime = times[0];
                params.endTime = times[1];
            }
            console.log("获取日志数据：" + pageNum, params);
            // 请求接口获取数据
            var _this = this;
            ajax.handle("get", "api/access-control/pageEquipmentLogs", params, {obj: this, lname: 'logDialog.loading'}, function(rs) {
                _this.logDialog.data = rs.data.data;
                _this.logPage.count = rs.data.count;
                _this.logPage.pageNum = pageNum;
            });
        },
        changeLogPage: function(pageNum) {
            this.getLogData(pageNum);
        },
        changeLogSearch: function() {
            this.getLogData(1);
        },
        changeLogTimes: function() {
            this.getLogData(1);
        },
        changeLogTab: function(value) {
            //隐藏表格，再重新渲染表格，避免el-table-column v-if带来的样式问题
            this.logDialog.showTable = false;
            this.$nextTick(function() {
                this.logDialog.showTable = true;
            })
            this.getLogData(1);
        },
        exportLog: function() {                       //导出日志
            //开始时间和结束时间
            var startTime = null;
            var endTime = null;
            var times = this.logDialog.selectTimes;

            //判断是否已选择时间
            if(times == null || times.length < 2) {
                this.$message.error(this.$t('placeholder.h7'));
                return;
            }

            startTime = times[0];
            endTime = times[1];

            //类型(提醒或操作)
            var type = this.logDialog.tabActive;

            //设备唯一码
            var uniqueCode = this.logDialog.record.uniqueCode;
            //TODO
        },
        deleteLog: function(log) {             //删除日志记录
            var _this = this;
            this.$confirm(this.$t('placeholder.h5'), this.$t('placeholder.h6'), {
                confirmButtonText: this.$t('yes'),
                cancelButtonText: this.$t('cancel'),
                type: "warning"
            })
                .then(function() {
                    _this.doDeleteLog(log);
                })
                .catch(function() {

                })
        },
        doDeleteLog: function(log) {
            // 执行删除
            var _this = this;
            ajax.handle("delete", "api/access-control/deleteEquipmentLogs/byIds/" + log.id, {}, {obj: this, lname: 'logDialog.loading'}, function(rs) {
                _this.$message.success(_this.$t('placeholder.h4'));
                _this.getLogData();
            });
        },
        deleteAllLogs: function() {               //删除全部日志
			var _this = this;
			this.$confirm(this.$t("commonLog.deleteAllTip"), this.$t("commonLog.deleteAllTipTitle"), {
				type: "warning"
			})
			 .then(function() {
				_this.doDeleteAllLogs();
			 })
			 .catch(function() {

			 })
		},
		doDeleteAllLogs: function() {
			var type = this.logDialog.tabActive;
			var uniqueCode = this.logDialog.record.uniqueCode;
			var params = {
				type: type,
				uniqueCode: uniqueCode
			}

			//添加开始时间和结束时间参数
            var times = this.logDialog.selectTimes;
            if(times != null && times.length == 2) {
                params.startTimeTS = times[0].getTime();
                params.endTimeTS = times[1].getTime();
            }

			var _this = this;
            ajax.handle("delete", "api/access-control/deleteEquipmentLogsBySelectBo", params, {obj: this, lname: 'logDialog.loading'}, function(rs) {
                _this.$message.success(_this.$t('placeholder.h4'));
                _this.getLogData(1);
            });
		},

        // endregion

        // region # 紧急开门
        emergencyOpen: function () {
            var _this = this;
            this.$confirm($i.t('msg.t4'), $i.t('tip'), {
                confirmButtonText: $i.t('yes'),
                cancelButtonText: $i.t('cancel'),
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        _this._doEmergencyOpen();
                    }
                },
            });
        },
        _doEmergencyOpen: function () {
            var _this = this;
            ajax.handle("post", "api/access-control/open/all", {}, {obj: this, lname: 'mainLoading'}, function(rs) {
                _this.$message.success($i.t('msg.opaSuccess'));
            });
        },
        // endregion

        // region # 在线状态相关
        selectOnlineStatus: function (arg) {
            var obj = arg[0];
            var type = arg[1];
            var isRefresh = arg[2];
            Vue.set(obj, 'onlineStatus', type.value || null);
            if (isRefresh) this.toFirstPage();
        },
        // endregion

        // region # 人脸门禁相关
        getFaceEquipmentUUID: function () {
            var obj = this.dialog.add.obj;
            if ($u.isNull(obj.equipmentIp) || $u.isNull(obj.equipmentPort)) {
                return this.$message.error($i.t('msg.e14'));
            }
            // 根据ip和端口获取人脸识别摄像头的唯一码
            var _this = this;
            var param = {
                ip: obj.equipmentIp,
                port: obj.equipmentPort,
            }
            ajax.handle("get", "api/access-control/getFaceEquipmentUUID", param, {obj: this, lname: 'mainLoading'}, function(rs) {
                    _this.$message.success($i.t('msg.getUUIDSuccess') + rs.data);
                    obj.uniqueCode = rs.data;
                }, function(rs) {
                    // _this.$message.error("设备唯一码获取失败，请检查ip、端口是否正确或者设备是否在线");
                    _this.$message.error(rs.msg);
            });
        },

        // endregion

        //取消部门选择
        cancelNodeSelect: function (type, obj, forware, idKey, nameKey) {
            Vue.set(obj, idKey, null);
            Vue.set(obj, nameKey, null);
            eval("this.$refs." + type + ".setCurrentKey(null)");
            if (forware) this.toFirstPage();
        },

        // region # 白名单列表相关
        /**
         * 搜索框回调
         * @param query
         */
        searchUser: function (query) {
            var obj = this.dialog.whiteList;
            obj.search = query;
            if (query === '') {
                obj.userList = [];
            } else {
                this.getUserListForSearch(true);
            }
        },
        getUserListForSearch: function (init) {
            var obj = this.dialog.whiteList;
            init = init || false;
            var loading = null;
            if (init) {
                obj.userSearchFinish = false;
                obj.userList = [];
                obj.userPage.pageNum = 1;
                loading = {
                    obj: this,
                    lname: "dialog.whiteList.userLoading"
                };
                this._doGetSearchUserData(loading);
            } else {
                var _this = this;
                // debounce
                userSearchPageDebounce.execute(function () {
                    _this._doGetSearchUserData(loading);
                });
            }
        },
        _doGetSearchUserData: function (loading) {
            var obj = this.dialog.whiteList;
            if (obj.userSearchFinish) return;
            var url = "api/user/getUserList";
            var param = {
                pageSize: obj.userPage.pageSize,
                pageNum: obj.userPage.pageNum,
                like: obj.search,
                roleId: -1,
                status: -1,
            };
            ajax.handle("get", url, param, loading, function (rs) {
                var data = rs.data;
                // 注意这里是合并数组
                if (obj.userList.length === 0) {
                    obj.userList = data.data;
                } else {
                    obj.userList.push.apply(obj.userList, data.data);
                }
                if (data.data.length !== 0 && data.data.length === obj.userPage.pageSize) {
                    obj.userPage.pageNum++;
                } else {
                    obj.userSearchFinish = true;
                }
            });
        },
        selectSearchChange: function (value) {
            // 更新白名单列表
            if (value) {
                this.dialog.whiteList.searchUser = value;
            } else {
                // 清空
                this.dialog.whiteList.searchUser = '';
                this.dialog.whiteList.userList = [];
            }
            this.toFirstWLPage();
        },
        /**
         * 显示白名单模态框
         * @param deviceSn      门禁的唯一码
         */
        showWhiteList: function (deviceSn) {
            var obj = this.dialog.whiteList;
            obj.show = true;
            obj.deviceSn = deviceSn;
            obj.search = '';
            obj.searchUser = '';
            obj.userList = [];
            // this.dialog.whiteList.list = [];
            this._clearWhiteListDialog();
            this.toFirstWLPage();
            // this._doUpdateWhiteList();
        },
        toFirstWLPage: function () {
            this.dialog.whiteList.page.pageNum = 1;
            this.getWLList();
        },
        //跳转到最后一页
        toLastWLPage: function() {
            var page = this.dialog.whiteList.page;
            var pageSize = page.pageSize;
            var count = page.count;
            page.pageNum = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1;
            this.getWLList();
        },
        //跳转到目标页面
        toTargetWLPage: function() {
            var page = this.dialog.whiteList.page;
            if ($u.isNull(page.target)) {
                page.target = 1;
            }
            var pageSize = page.pageSize;
            var count = page.count;
            var maxPage = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1; // 尾页页码
            page.target = page.target > maxPage ? maxPage : page.target;
            page.pageNum = page.target;
            this.getWLList();
        },
        getWLList: function (pageNum) {
            var obj = this.dialog.whiteList;
            var deviceSn = obj.deviceSn;
            var url = "api/v2/sk87/whiteList/bySn/" + deviceSn;
            // obj.list = [];
            if (pageNum) obj.page.pageNum = pageNum;
            var _this = this;
            ajax.handle("get", url, {
                index: obj.page.pageNum,
                num: obj.page.pageSize,
                userId: obj.searchUser,
                // search: obj.search,
            }, {obj: this, lname: 'dialog.whiteList.loading'}, function (rs) {
                obj.now = rs.data.now;
                obj.list = rs.data.whiteList.data;
                obj.timeout = rs.data.timeout;
                obj.idNicknameMap = rs.data.idNicknameMap;
                obj.page.count = rs.data.whiteList.count;
            }, function (rs) {
                _this.$message.error(rs.msg);
            });
        },
        _clearWhiteListDialog: function () {
            this.dialog.whiteList.multipleSelection = [];
            if (this.$refs.whiteListTable) {
                this.$refs.whiteListTable.clearSelection();
            }
        },
        // endregion


        // region # 选择用户相关
        showSelectUser: function () {
            this.dialog.selectUser.show = true;
            this.toFirstUserPage();
        },
        toFirstUserPage: function () {
            this.dialog.selectUser.page.pageNum = 1;
            this.getUserList();
        },
        //跳转到最后一页
        toLastUserPage: function() {
            var page = this.dialog.selectUser.page;
            var pageSize = page.pageSize;
            var count = page.count;
            page.pageNum = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1;
            this.getUserList();
        },
        //跳转到目标页面
        toTargetUserPage: function() {
            var page = this.dialog.selectUser.page;
            if ($u.isNull(page.target)) {
                page.target = 1;
            }
            var pageSize = page.pageSize;
            var count = page.count;
            var maxPage = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1; // 尾页页码
            page.target = page.target > maxPage ? maxPage : page.target;
            page.pageNum = page.target;
            this.getUserList();
        },
        getUserList: function (pageNum) {
            var obj = this.dialog.selectUser;
            var url = "api/user/getUserList";
            // obj.list = [];
            if (pageNum) obj.page.pageNum = pageNum;
            var param = {
                pageSize: obj.page.pageSize,
                pageNum: obj.page.pageNum,
                like: obj.like,
                roleId: -1,
                status: -1,
                depIds: obj.depIds,
            };
            var _this = this;
            ajax.handle("get", url, param, {
                obj: this,
                lname: "dialog.selectUser.loading"
            }, function (rs) {
                var data = rs.data;
                obj.list = data.data;
                obj.page.count = data.count;

                // 首次选用户，查已经存在的白名单，自动勾上
                if (_this.isFirstSelectUser) {
                    // TODO
                    var url = "api/access-control/whiteList/user/all/bySn/" + _this.dialog.whiteList.deviceSn;
                    ajax.handle("get", url, {}, {
                        obj: _this,
                        lname: "dialog.selectUser.loading"
                    }, function (rs) {
                        _this.isFirstSelectUser = false;
                        // TODO
                        var selectedList = rs.data;
                        _this.dialog.selectUser.multipleSelection = selectedList;
                        if (selectedList && selectedList.length > 0) {
                            _this._checkAlreadySelected(selectedList);
                        }
                    });
                } else {
                    // _this._checkAlreadySelected();
                }
            });
        },
        _checkAlreadySelected: function (selectedList) {
            var _this = this;

            // 应该要选中的idMap
            var userIdMap = {};
            selectedList.forEach(function (item) {
                userIdMap[item.id] = item;
            });

            setTimeout(function () {
                var list = _this.dialog.selectUser.list;
                // 第一页选过的idMap
                var alreadyCheckedIdMap = {};
                // 第一页勾选
                list.forEach(function (item) {
                    if (!$u.isNull(userIdMap[item.id])) {
                        _this.$refs.userListTable.toggleRowSelection(item, true);
                        alreadyCheckedIdMap[item.id] = true;
                    }
                });
                // 非第一页的勾选
                selectedList.forEach(function (item) {
                    if ($u.isNull(alreadyCheckedIdMap[item.id])) {
                        _this.$refs.userListTable.toggleRowSelection(item, true);
                    }
                });
            }, 0);


            // var _this = this;
    /*        setTimeout(function () {
                var list = _this.dialog.selectUser.list;
                var userIdMap = _this.dialog.selectUser.selectedUserIdMap;
                console.log(userIdMap);
                list.forEach(function (item) {
                    if (!$u.isNull(userIdMap[item.id])) {
                        _this.$refs.userListTable.toggleRowSelection(item, true);
                    }
                });
            }, 0);*/
        },
        _clearSelectUserDialog: function () {
            this.dialog.selectUser.multipleSelection = [];
            this.dialog.selectUser.selectedUserIdMap = {};
            if (this.$refs.userListTable) {
                this.$refs.userListTable.clearSelection();
            }
        },
        // endregion


        // region # 固件升级相关

        /**
         * 升级sk87固件(已弃用)
         */
        doSK87Update: function () {
            var dialog = this.dialog.updateSK87;
            if (dialog.selected === -1) {
                $u.showWarning(this, "请先选择要升级的固件");
                return;
            }
            var _this = this;
            this.$confirm('确定进行升级?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        _this._doSK87Update();
                    }
                },
            });

        },
        _doSK87Update: function () {
            var dialog = this.dialog.updateSK87;
            var _this = this;
            ajax.handle("put", "api/access-control/firmware/update/" + dialog.obj.uniqueCode, {
                updateUrl: dialog.list[dialog.selected],
            }, {
                obj: this,
            }, function (rs) {
                dialog.show = false;
                $u.showSuccess(_this, $i.t('msg.opaSuccess'));
            });
        },
        /**
         * 显示选择升级固件模态框(已弃用)
         */
        showUpdateSK87Modal: function (obj, disable) {
            if (disable === true) return;
            if ($u.isNull(this.snDeviceMap[obj.uniqueCode])) {
                $u.showWarning(this, this.$t('placeholder.h3'));
                return;
            }
            var dialog = this.dialog.updateSK87;
            dialog.obj = obj;
            dialog.show = true;
            dialog.selected = -1;
            this._getUpdateUrls();
        },
        _getUpdateUrls: function () {
            var _this = this;
            var dialog = this.dialog.updateSK87;
            dialog.selected = -1;
            // 获取固件列表
            ajax.handle("get", "api/access-control/list/update-urls", {}, {
                obj: this,
                lname: "dialog.updateSK87.loading"
            }, function (rs) {
                dialog.list = rs.data;
            }, function (err) {
                _this.$message.error(_this.$t('placeholder.h2'));
            });
        },
        /**
         * 删除升级固件文件(已弃用)
         * @param url
         */
        delUpdateFile: function (url) {
            var fileName = getFileNameFromUrl(url);
            var _this = this;
            this.$confirm('确定删除' + fileName +'?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        _this.doDelUpdateFile(encodeURIComponent(fileName));
                    }
                },
            });
        },
        doDelUpdateFile: function (fileName) {
            var _this = this;
            ajax.handle("delete", "api/access-control/update-file", {
                fileName: fileName
            }, {
                obj: this,
                lname: "dialog.updateSK87.loading"
            }, function (rs) {
                _this.$message.success($i.t('msg.delSuccess'));
                _this._getUpdateUrls();
            }, function (err) {
                _this.$message.error($i.t('msg.delFail'));
            });
        },
        uploadUpdateFile: function () {
            var file = $('#updateFileInput')[0].files[0];
            if ($u.isNull(file)) return;
            var formData = new FormData();
            formData.append("file", file);
            var _this = this;
            ajax.handleWithFiles("post", "api/access-control/update-file", formData, null, function(rs) {
                _this.$message.success($i.t('msg.uploadSuccess'));
                _this._getUpdateUrls();
                _this._clearInputFile('updateFileInput');
            }, function(rs) {
                _this.$message.error($i.t('msg.uploadFail'));
                _this._clearInputFile('updateFileInput');
            }, function (err) {
                _this.$message.error($i.t('msg.e12'));
                _this._clearInputFile('updateFileInput');
            });
        },
        _clearInputFile: function (id) {
            var file = document.getElementById(id);
            $u.clearInputFile(file);
        },

        clickUpdateInput: function (obj) {
            if (obj.accessControlType !== 1) return;
            if ($u.isNull(this.snDeviceMap[obj.uniqueCode])) {
                $u.showWarning(this, $i.t('msg.w2'));
                return;
            }
            // 保存要升级的固件
            this.updateAcObj = obj;
            // console.log("gogogo");
            // 触发选择升级文件的click事件
            this.$refs.updateInput.click();
        },
        afterSelectUpdateFile: function () {
            var file = $('#updateInput')[0].files[0];
            if ($u.isNull(file)) return;
            var name = file.name;
            // 检查版本号，如果能检测得到（文件名符合规范）
            var regExecRes = UPDATE_FILE_NAME_REG.exec(name);
            var deviceName, version, str = $i.t('msg.e13');
            if (!$u.isNull(regExecRes)) {
                deviceName = regExecRes[1];
                version = regExecRes[2];
                if (!$u.isNull(deviceName) && !$u.isNull(version)) {
                    str = $u.concatStr("即将升级到<b>", deviceName, "</b>的<b>", version, "</b>固件");
                }
            }
            var obj = this.updateAcObj;
            var deviceInfo = this.snDeviceMap[obj.uniqueCode];
            var isVersionWarning = false;
            if (deviceInfo) {
                var curVersion = deviceInfo.version;
                isVersionWarning = !$u.isNull(curVersion) && curVersion < UPDATE_MINIMUM_VERSION;
            }

            var _this = this;
            this.$confirm($u.concatStr(
                '<p>', str, '</p>',
                isVersionWarning ? UPDATE_VERSION_WARNING_TEXT : ''
                ), $i.t('plzConfirm'), {
                dangerouslyUseHTMLString: true,
                confirmButtonText: $i.t('yes'),
                cancelButtonText: $i.t('cancel'),
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        // 上传固件并触发更新操作
                        _this._uploadUpdateFile(file);
                    } else {
                        _this._clearInputFile('updateInput');
                    }
                },
            });
        },

        _uploadUpdateFile: function (file) {
            var formData = new FormData();
            formData.append("file", file);
            formData.append("uniqueCode", this.updateAcObj.uniqueCode);
            var _this = this;
            // return;
            // TODO
            ajax.handleWithFiles("post", "api/access-control/update-file/with-update", formData, null, function(rs) {
                _this.$message.success($i.t('msg.opaSuccess'));
                _this._clearInputFile('updateInput');
                // TODO
            }, function(rs) {
                _this.$message.error(rs.msg);
                _this._clearInputFile('updateInput');
            }, function (err) {
                _this.$message.error($i.t('msg.e12'));
                _this._clearInputFile('updateInput');
            });
        },

        // endregion


        // region # 导出开门记录
        showExportDialog: function (uniqueCode) {
            var dialog = this.dialog.export;
            dialog.uniqueCode = uniqueCode;
            dialog.start = null;
            dialog.end = null;
            dialog.show = true;
        },
        doExport: function () {
            var dialog = this.dialog.export;
            if (!this.isCanExport) return;
            var start = dialog.start.getTime();
            var end = dialog.end.getTime();
            if (end < start) {
                this.$message.error($i.t('msg.e5'));
                return;
            }
            var url = _config.server.url + "/api/access-control/open-log/batchExport";
            var params = {
                uniqueCodes: dialog.uniqueCode,
                start: start,
                end: end,
            };
            url = $u.concatUrlParam(params, url);

            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                $u.exportForIE(url, $i.t('openRecords'));
            } else {
                $u.openDownload(url);
            }
        },
        // endregion


        // region # 同步设备相关
        multiSync: function () {
            var ms = this.multipleSelection;
            if (ms.length === 0) {
                this.$message({
                    message: $i.t('plzSelect') + SELECT_UNIT_TEXT,
                    type: 'warning'
                });
                return;
            }
            var uniqueCodes = [], acTypes = [];
            ms.forEach(function (ac) {
                uniqueCodes.push(ac.uniqueCode);
                acTypes.push(ac.accessControlType || 1);
            });
            this._showSyncDialog(uniqueCodes.join(","), acTypes.join(","));
        },
        singleSync: function (ac, disable) {
            if (disable === true) return;
            this._showSyncDialog(ac.uniqueCode, ac.accessControlType || 1);

        },
        _showSyncDialog: function (uniqueCodes, acTypes) {
             var dialog = this.dialog.sync;
             dialog.uniqueCodes = uniqueCodes;
             dialog.acTypes = acTypes;
             dialog.checkList = [0];
             dialog.show = true;
        },
        doSync: function () {
            if (!this.isCanSync) return false;
            var dialog = this.dialog.sync;
            var _this = this;
            var checkList = dialog.checkList;
            var isSyncTime = checkList.indexOf(0) !== -1,
                isSyncQrKey = checkList.indexOf(1) !== -1,
                isSyncHt = checkList.indexOf(2) !== -1;

            ajax.handle("post", "api/access-control/multi/sync-config/optional", {
                uniqueCodes: dialog.uniqueCodes,
                acTypes: dialog.acTypes,
                isSyncTime: isSyncTime,
                isSyncQrKey: isSyncQrKey,
                isSyncHt: isSyncHt,
                ht: dialog.heartTime,
            }, {obj: this, lname: 'mainLoading'}, function (rs) {
                _this.$message.success($i.t('msg.opaSuccess'));
                dialog.show = false;
            }, function (rs) {
                _this.$message.error($i.t('msg.opaFail'));
            });
        },

        // endregion


        /**
         * 显示查看详情的模态框
         */
        showViewModal: function (obj) {
            this.dialog.view.obj = obj;
            this.dialog.view.show = true;
            var sn = obj.uniqueCode;
            var type = obj.accessControlType;
            if (type === 2) return;
            var _this = this;
            // 根据门禁id更新门禁状态信息
            ajax.handle("get", "api/access-control/device-info/bySn/" + sn, {}, {
                obj: this,
                lname: "dialog.view.loading"
            }, function (rs) {
                _this.snDeviceMap[sn] = $u.isEmptyObj(rs.data) ? null : rs.data;
            }, function (err) {
                _this.$message.error($i.t('msg.e11'));
            });
        },
        /**
         * 应用到其他门禁(显示选择门禁的模态框)
         */
        showBatchApply: function () {
            // 检查是否选中白名单
            var wlArray = this.dialog.whiteList.multipleSelection;
            if (wlArray.length === 0) {
                this.$message.error($i.t('msg.e9'));
                return;
            }

            var _this = this;
            ajax.handle("get", "api/access-control/all", {}, {
                obj: this,
                lname: "dialog.acList.loading"
            }, function (rs) {
                var data = rs.data, placeMap = {}, _statusPlaces = [];
                var curDeviceSn = _this.dialog.whiteList.deviceSn;
                data.forEach(function (ac) {
                    // 当前的门禁要过滤掉
                    if (ac.uniqueCode !== curDeviceSn) {
                        ac.checked = false;
                        var _placeId = ac.placeId || -1;
                        // 绑定了地点，但地点不存在，归类到'未绑定地点'
                        if (ac.placeId !== null && ac.placeName === null) {
                            _placeId = -1;
                        }
                        if (placeMap[_placeId]) {
                            placeMap[_placeId].data.push(ac);
                        } else {
                            placeMap[_placeId] = {
                                name: ac.placeName || $i.t('unboundPlace'),
                                data: [ac],
                            };
                        }
                    }
                });

                for (var placeId in placeMap) {
                    _statusPlaces.push({
                        place: placeMap[placeId].name,
                        data: placeMap[placeId].data,
                    });
                }
                _this.dialog.acList.data = data;
                _this.dialog.acList.list = _statusPlaces;
                _this.dialog.acList.show = true;
            });
        },
        /**
         * 应用到选中的门禁
         */
        batchApply: function () {
            // 获取选中的门禁ids
            var sps = this.dialog.acList.list, deviceSnArray = [];
            for (var idx in sps) {
                var data = sps[idx].data;
                data.forEach(function (ac) {
                    if (ac.checked === true) {
                        deviceSnArray.push(ac.uniqueCode);
                    }
                });
            }
            if (deviceSnArray.length === 0) {
                this.$message.error($i.t('msg.e10'));
                return;
            }
            // 检查冲突
            // this._batchApplyCheckConflict(deviceSnArray.join(","))
            this._doBatchApply(deviceSnArray.join(","));
        },
        /**
         * 检查是否有冲突(ajax)
         * @private
         */
/*        _batchApplyCheckConflict: function (deviceSNs) {
            var data = {
                whiteLists: this.dialog.whiteList.multipleSelection,
                deviceSNs: deviceSNs
            };
            var _this = this;
            ajax.handleWithCT("post", "api/sk87/whiteList/batch/apply/check/conflict", JSON.stringify(data),
                {obj: this, lname: "mainLoading"}, "application/json",
                function (rs) {
                    var conflictList = rs.data || [];
                    if (conflictList.length > 0) {
                        // 如果有冲突的白名单，则生成提示文本
                        var h = _this.$createElement;
                        var conflictMap = {};
                        var acList = _this.dialog.acList.data;
                        // 生成门禁mapping
                        var acNameMapping = {};
                        acList.forEach(function (item) {
                            acNameMapping[item.uniqueCode] = item.name;
                        });
                        // 相同门禁映射
                        conflictList.forEach(function (item) {
                            var deviceList = conflictMap[item.deviceSn];
                            if (deviceList) {
                                deviceList.list.push(item);
                            } else {
                                var name = acNameMapping[item.deviceSn];
                                if (name) {
                                    conflictMap[item.deviceSn] = {
                                        list: [item],
                                        name: name,
                                    };
                                }
                            }
                        });

                        var messageArray = [h('div', {class: 'msgbox-title warning-icon'}, '以下白名单将不会添加')];
                        var isEmpty = true;
                        for (var key in conflictMap) {
                            isEmpty = false;
                            var conflictItem = conflictMap[key];
                            messageArray.push(h('div', {class: 'msgbox-item-title'}, conflictItem.name));
                            var list = conflictItem.list;
                            var wlArray = [];
                            list.forEach(function (item) {
                                wlArray.push(item.value + "(" + _this.dialog.whiteList.typeTextMapping[item.type] + ")");
                            });
                            messageArray.push(h('div', null, wlArray.join("、")));
                        }

                        // 再次判空
                        if (isEmpty) {
                            return _this._doBatchApply(deviceSNs);
                        }

                        _this.$msgbox({
                            title: '检测到门禁已拥有相同白名单',
                            message: h('div', {style: 'max-height: 300px;overflow-y: auto;'}, messageArray),
                            showCancelButton: true,
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            callback: function (action, instance) {
                                if (action === 'confirm') {
                                    _this._doBatchApply(deviceSNs);
                                }
                            },
                        });

                    } else {
                        _this._doBatchApply(deviceSNs);
                    }
                },
                function (rs) {
                    _this.$message.error("操作失败");
                }
            );
        },*/
        /**
         * 应用到选中的门禁(ajax)
         * @private
         */
        _doBatchApply: function (deviceSNs) {
            var data = {
                whiteLists: this.dialog.whiteList.multipleSelection,
                deviceSNs: deviceSNs
            };
            var _this = this;
            ajax.handleWithCT("post", "api/v2/sk87/whiteList/batch/apply", JSON.stringify(data),
                {obj: this, lname: "mainLoading"}, "application/json",
                function (rs) {
                    _this.$message.success($i.t('msg.opaSuccess'));
                    _this.dialog.acList.show = false;
                },
                function (rs) {
                    _this.$message.error($i.t('msg.opaFail'));
                }
            );
        },
        /**
         *  控制白名单是否可以勾选
         */
        whiteListSelectable: function (row, index) {
            return row.status === 2;
        },
        /**
         * 编辑白名单
         * @param wl
         */
        editWhiteList: function (wl) {
            var obj = this.dialog.addWhiteList;
            obj.value = wl.value;
            obj.type = wl.type;
            obj.start = new Date(wl.start);
            obj.end = new Date(wl.end);
            obj.isEdit = true;
            obj.id = wl.id;
            obj.startTime = wl.startTime;
            obj.endTime = wl.endTime;
            obj.repeat = wl.repeatType;
            obj.repeatDayArray = wl.repeat ? wl.repeat.split(",").map(function (item) {
                return parseInt(item);
            }) : [];
            obj.show = true;
        },
        /**
         * 白名单重试
         * @param id
         */
/*        retryWhiteList: function (id) {
            var _this = this;
            this.$confirm('确定重试?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        _this._doRetryWhiteList(id);
                    }
                },
            });
        },*/
        /**
         * 白名单重试(ajax)
         * @param id
         * @private
         */
/*        _doRetryWhiteList: function (id) {
            var _this = this;
            ajax.handle("put", "api/sk87/whiteList/retry/" + id, {}, {
                obj: this,
                lname: 'dialog.whiteList.loading'
            }, function (rs) {
                _this.$message.success($i.t('msg.opaSuccess'));
                _this._doUpdateWhiteList();
            }, function (rs) {
                _this.$message.error(rs.msg);
            });
        },*/
        /**
         * 删除白名单
         * @param id
         */
        deleteWhiteList: function (id) {
            var _this = this;
            this.$confirm($i.t('msg.t3'), $i.t('tip'), {
                confirmButtonText: $i.t('yes'),
                cancelButtonText: $i.t('cancel'),
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        _this._doDeleteWhiteList(id);
                    }
                },
            });
        },
        /**
         * 删除白名单(ajax)
         * @param id
         * @private
         */
        _doDeleteWhiteList: function (id) {
            var _this = this;
            ajax.handle("delete", "api/sk87/whiteList/" + id, {}, {
                obj: this,
                lname: 'dialog.whiteList.loading'
            }, function (rs) {
                _this.$message.success($i.t('msg.opaSuccess'));
                _this.getWLList();
                // _this._doUpdateWhiteList();
            }, function (rs) {
                _this.$message.error(rs.msg);
            });
        },
        /**
         * 批量强制删除白名单
         */
        forceMultiDeleteWhiteList: function () {
            var wlArray = this.dialog.whiteList.multipleSelection;
            if (wlArray.length === 0) {
                this.$message.error($i.t('msg.e9'));
                return;
            }
            var wlIdArray = wlArray.map(function (wl) {
                return wl.id;
            });
            this.forceDeleteWhiteList(wlIdArray.join(","));
        },
        /**
         * 强制删除白名单
         * @param id    白名单id
         */
        forceDeleteWhiteList: function (id) {
            var _this = this;
            this.$confirm($i.t('msg.t2'), $i.t('warn'), {
                confirmButtonText: $i.t('yes'),
                cancelButtonText: $i.t('cancel'),
                type: 'warning',
                callback: function (action, instance) {
                    if (action === 'confirm') {
                        _this._doForceDeleteWhiteList(id);
                    }
                },
            });
        },
        /**
         * 强制删除白名单(ajax)
         */
        _doForceDeleteWhiteList: function (id) {
            var _this = this;
            ajax.handle("delete", "api/sk87/whiteList/force/" + id, {}, {
                obj: this,
                lname: 'dialog.whiteList.loading'
            }, function (rs) {
                _this.$message.success($i.t('msg.delSuccess'));
                _this.getWLList();
                _this._clearWhiteListDialog();
                // _this._doUpdateWhiteList();
            }, function (rs) {
                _this.$message.error(rs.msg);
            });
        },
        /**
         * 添加白名单
         */
        addWhiteList: function () {
            var form = this.dialog.addWhiteList;
            // var value = form.value;
            // var type = form.type;
            var start = form.start;
            var end = form.end;
            var isEdit = form.isEdit;
            // 判空
            /*            if ($u.isNull(value.trim())) {
                            this.$message.error("号码不能为空");
                            return;
                        }
                        if ($u.isNull(start)) {
                            this.$message.error("请选择开始时间");
                            return;
                        }
                        if ($u.isNull(end)) {
                            this.$message.error("请选择结束时间");
                            return;
                        }*/
            // 检查用户
            var users = this.dialog.selectUser.multipleSelection;
            if (!isEdit && ($u.isNull(users) || users.length === 0)) {
                this.$message.error($i.t('msg.e2'));
                return;
            }

            // 检查时间
            var startTime = form.startTime;
            var endTime = form.endTime;
            if ($u.isNull(startTime)) {
                this.$message.error($i.t('msg.e3'));
                return;
            }
            if ($u.isNull(endTime)) {
                this.$message.error($i.t('msg.e4'));
                return;
            }
            if (startTime > endTime) {
                this.$message.error($i.t('msg.e5'));
                return;
            }

            // 检查repeatType
            if ($u.isNull(form.repeat)) {
                this.$message.error($i.t('msg.e6'));
                return;
            }

            // 检查重复周次
            if (form.repeat === 1 && form.repeatDayArray.length === 0) {
                this.$message.error($i.t('msg.e7'));
                return;
            }

            // 检查有效期
            if ($u.isNull(end)) {
                this.$message.error($i.t('msg.e8'));
                return;
            }

            // 时间判断
            /*            if (start > end) {
                            this.$message.error("结束时间必须在开始时间之后");
                            return;
                        }*/

            var deviceSn = this.dialog.whiteList.deviceSn;
            var _this = this;
            end.setHours(23);
            end.setMinutes(59);
            end.setSeconds(59);
            var params = {
                deviceSn: deviceSn,
                // value: value,
                // type: type,
                startMillis: start.getTime(),
                endMillis: end.getTime(),
                startTime: startTime,
                endTime: endTime,
                repeatType: form.repeat,
                repeat: form.repeatDayArray.join(",")
            };


            if (isEdit) {
                params.id = form.id;
            } else {
                var userIds = [];
                users.forEach(function (item) {
                    userIds.push(item.id);
                });
                params.userIds = userIds;
                params = JSON.stringify(params);
            }
            ajax.handleWithCT(isEdit ? "put" : "post", "api/v2/sk87/whiteList", params, {
                obj: this,
                lname: 'mainLoading'
            }, isEdit ? "application/x-www-form-urlencoded" : "application/json", function (rs) {
                _this.$message.success($i.t('msg.opaSuccess'));
                _this.dialog.addWhiteList.show = false;
                _this.toFirstWLPage();
                // _this._doUpdateWhiteList();
                _this._clearSelectUserDialog();
            }, function (rs) {
                _this.$message.error(rs.msg);
            });
        },
        /**
         * 显示添加白名单模态框
         */
        showAddWhiteList: function () {
            this._clearSelectUserDialog();
            this.isFirstSelectUser = true;
            var obj = this.dialog.addWhiteList;
            obj.value = "";
            obj.type = 1;
            obj.start = new Date();
            obj.end = null;
            obj.isEdit = false;
            obj.startTime = '';
            obj.endTime = '';
            obj.repeat = 0;
            obj.repeatDayArray = [];
            obj.show = true;
            this.getAllDepartment();
            setTimeout(function () {
                var date = new Date();
                date.setFullYear(date.getFullYear() + 10)
                LIMIT_DATE_END = date.getTime();
            }, 0);
        },
        /**
         * 刷新白名单列表
         */
        refreshWhiteList: function () {
            this._doUpdateWhiteList(1);
        },
        /**
         * 搜索白名单
         */
        doWhiteListSearch: function () {
            this.dialog.whiteList.multipleSelection = [];
            this.dialog.whiteList._search = this.dialog.whiteList.search;
        },
        /**
         * 白名单table，多选change事件
         * @param val
         */
        whiteListSelectionChange: function (val) {
            this.dialog.whiteList.multipleSelection = val;
        },
        userListSelectionChange: function (val, row) {
            this.dialog.selectUser.multipleSelection = val;
        },
        /**
         * 获取白名单列表(ajax)
         * @private
         */
        _doUpdateWhiteList: function (isRefresh) {
            var deviceSn = this.dialog.whiteList.deviceSn;
            var url = "api/sk87/whiteList/bySn/" + deviceSn;
            var _this = this;
            ajax.handle("get", url, {
                index: 0,
                num: 0,
            }, {obj: this, lname: 'dialog.whiteList.loading'}, function (rs) {
                if (_this.dialog.whiteList.cbBtns) {
                    _this.dialog.whiteList.cbBtns.destroy();
                }
                _this.dialog.whiteList.list = rs.data.whiteList.data;
                _this.dialog.whiteList.timeout = rs.data.timeout;
                _this.dialog.whiteList.now = rs.data.now;
                _this.dialog.whiteList.idNicknameMap = rs.data.idNicknameMap;
                if (isRefresh === 1) {
                    $a.showSuccess(vue, $i.t('msg.refreshSuccess'));
                }
                setTimeout(function () {
                    _this.dialog.whiteList.cbBtns = new ClipboardJS('.clipboard-btn');
                    _this.dialog.whiteList.cbBtns.on('success', function (e) {
                        $a.showSuccess(vue, $i.t('msg.copySuccess'));
                    });
                    _this.dialog.whiteList.cbBtns.on('error', function (e) {
                        $a.showSuccess(vue, $i.t('msg.copyFail'));
                    });
                }, 0);
            }, function (rs) {
                _this.$message.error(rs.msg);
            });
        },
        // switch(710)的单个控制
        uncheckOtherSwitch: function (key) {
            var acStatusOptions = this.acStatusOptions;
            for (var _key in acStatusOptions) {
                if (_key !== key) {
                    acStatusOptions[_key].checked = false;
                }
            }
        },
        // 状态设置(点击完成按钮)
        setStatus: function () {
            // 获取选中的门禁ids
            var sps = this.statusPlaces;
            var propertyIds = [];
            for (var idx in sps) {
                var data = sps[idx].data;
                data.forEach(function (ac) {
                    if (ac.checked === true) {
                        propertyIds.push(ac.id);
                    }
                });
            }
            if (propertyIds.length === 0) return;
            // 获取选中的status
            var acStatusOptions = this.acStatusOptions;
            var status = null;
            for (var _status in acStatusOptions) {
                if (acStatusOptions[_status].checked === true) {
                    status = _status;
                    break;
                }
            }
            var params = {};
            if (status !== null) {
                params.status = status;
            }
            // 请求接口
            var _this = this;
            ajax.handle("put", "api/access-control/abnormal/" + propertyIds.join(","),
                params, {obj: this, lname: 'mainLoading'}, function (rs) {
                    _this.$message.success($i.t('msg.setSuccess'));
                    _this.statusDialogVisible = false;
                    _this.getList();
                }, function (rs) {
                    _this.$message.error(rs.msg);
                });
        },
        // 状态设置(点击地点)
        showSetStatus: function (ac) {
            if ($u.isNull(ac.placeId)) return;
            this._showSetSelectedStatusDialog([ac]);
        },
        // 状态设置(选中)
        showSetStatusSelected: function () {
            var ms = this.multipleSelection;
            if (ms.length === 0) {
                this.$message({
                    message: $i.t('plzSelect') + SELECT_UNIT_TEXT,
                    type: 'warning'
                });
                return;
            }
            this._showSetSelectedStatusDialog(ms);
        },
        _showSetSelectedStatusDialog: function (acList) {
            var placeMap = {}, placeIds = [];
            acList.forEach(function (ac) {
                if (!$u.isNull(ac.placeId)) {
                    placeMap[ac.placeId] = {
                        name: ac.placeName,
                        data: [],
                    };
                }
            });
            for (var key in placeMap) {
                placeIds.push(key);
            }

            if (placeIds.length === 0) {
                this.$message({
                    message: $i.t('msg.w1', {unit: SELECT_UNIT_TEXT}),
                    type: 'warning'
                });
                return;
            }
            this.statusPlaces = [];
            var _statusPlaces = [];
            this.acStatusOptions = $i.t('dialog.status.acStatusOptions');
            var _this = this;
            ajax.handle("get", "api/access-control/byPlaceIds/" + placeIds.join(","), {}, {
                obj: this,
                lname: "mainLoading"
            }, function (rs) {
                var data = rs.data;
                data.forEach(function (ac) {
                    ac.checked = true;
                    placeMap[ac.placeId].data.push(ac);
                });
                for (var placeId in placeMap) {
                    if (placeMap[placeId].data.length === 0) continue;
                    _statusPlaces.push({
                        place: placeMap[placeId].name,
                        data: placeMap[placeId].data,
                    });
                }
                _this.statusPlaces = _statusPlaces;
                _this.statusDialogVisible = true;
            });
        },
        /**
         * 刷新在线状态
         */
        refreshStatus: function () {
            var list = this.list;
            if (list.length === 0) {
                this.$message.error($i.t('msg.e1'));
                return;
            }
            var uniqueCodes = [], acTypes = [];
            list.forEach(function (ac) {
                uniqueCodes.push(ac.uniqueCode);
                acTypes.push(ac.accessControlType);
            });

            var _this = this;
            ajax.handle("get", "api/access-control/map/sn-device", {
                uniqueCodes: uniqueCodes,
                acTypes: acTypes
            }, {obj: this, lname: "mainLoading"}, function (rs) {

                var snDeviceMap = rs.data.snDeviceMap;
                // var faceOnlineMap = rs.data.faceOnlineMap;
                // var screenOnlineMap = rs.data.screenOnlineMap;
                // $u.extend(snDeviceMap, faceOnlineMap);
                // $u.extend(snDeviceMap, screenOnlineMap);
                _this.snDeviceMap = snDeviceMap;

                var list = _this.list;
                list.forEach(function (item) {
                    item.isOnline = !$u.isNull(snDeviceMap[item.uniqueCode]);
                });

                _this.$message.success($i.t('msg.refreshSuccess'));
            }, function (rs) {
                _this.$message.error($i.t('msg.refreshFail'));
            });
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
         * 更新-进度完成
         */
        processComplete: function () {
            var obj = this.dialog.update.obj;
            obj.status = 4;
            if ($u.isNull(obj.completeTimeMillis)) {
                obj.completeTimeMillis = new Date().getTime();
            }
        },
        /**
         *
         * @param file
         * @param fileList
         */
        fileChange: function (file, fileList) {
            this.fileList = fileList;
        },

        /**
         * 名称改变
         */
        propertyNameChange: function (property) {
            this.dialog.add.obj.name = property.name;
            this.dialog.add.obj.propertyType = property.propertyTypeId;
            this.dialog.add.obj.propertyTypeName = property.propertyTypeName;
            this.dialog.add.obj.propertyId = property.id;
            this.dialog.add.obj.brand = property.brand;
        },
        /**
         * 进度
         */
        statusChange: function (command) {
            this.condition.status = command;
            this.toFirstPage();
        },
        /**
         * 清除所有的筛选是否已查询
         */
        cleanAllScreenHasDo: function () {
            var obj = this.condition;
            obj.screen["PROPERTY_NAME"].hasDo = false;
            obj.screen["PROPERTY_MODEL"].hasDo = false;
            obj.screen["PROPERTY_BRAND"].hasDo = false;
            obj.screen["REPAIR_NICKNAME"].hasDo = false;
        },

        /**
         * 触发文件input点击事件
         * @param inputId
         */
        choosePhoto: function (inputId) {
            $('#' + inputId).click();
        },
        /**
         * 获取/刷新全部资产类型
         */
        getAllPropertyType: function () {
            var _this = this;
            var param = {};
            ajax.handle("get", "v3/property/getAllPropertyType", param, null, function (rs) {
                var data = rs.data;
                _this.propertyType = data;
            }, function (rs) {
            });
        },
        /**
         * 显示编辑模态框
         * @param data 需要编辑的数据对象
         */
/*        showUpdateDialog: function (data) {
            var obj = this.dialog.update;
            var copy = deepClone(data);
            if (copy.status === 1) copy.status = 2;
            copy.spend = copy.spend ? formatSpendTime(copy.spend) : '无';
            copy.createTime = moment(copy.createTime).format("YYYY-MM-DD HH:mm");
            copy.fileList = copy.files ? copy.files.split(",") : [];
            if ($u.isNull(copy.completeTime)) {
                copy.completeTimeMillis = null;
                copy.isCompleted = false;
            } else {
                copy.completeTimeMillis = new Date(copy.completeTime).getTime();
                copy.isCompleted = true;
            }
            obj.obj = copy;
            obj.show = true;
            obj.loading = true;
            var _this = this;
            ajax.handle("get", "api/repair/detail/byId/" + data.id, {}, null, function (rs) {
                obj.loading = false;
                if (data.status === 1) Vue.set(data, "status", 2);
                obj.obj.updateLogList = rs.data.repairUpdateLogs;
            }, function (rs) {
                _this.$message.error("获取报修信息失败，请关闭后重试");
                obj.loading = false;
            });
        },*/
        /**
         * 获取/刷新全部厂家模板列表
         */
        getPropertyTemplate: function () {
            var _this = this;
            var obj = this.dialog.template;
            var param = {
                like: obj.like,
            };
            obj.loading = true;
            ajax.handle("get", "v3/property/getTemplateList", param, null, function (rs) {
                var data = rs.data.data;
                _this.PropertyTemplate = data;
                obj.loading = false;
            }, function (rs) {
                obj.loading = false;
            });
        },

        /**
         * 将自定义的内容放在请求参数的指定属性
         * @param ref 自定义内容所在组件的ref
         * @param param 请求参数
         * @param key v-model绑定的值
         * @param customKey 放入的属性的键
         */
        initCustomizeParam: function (ref, param, key, customKey) {
            var isCustomize = this.$refs[ref].createdLabel === param[key];
            if (isCustomize) {
                param[key] = null;
                param[customKey] = this.$refs[ref].createdLabel;
            }
        },

        /**
         * 终极限制input输入为数字方法
         * @param obj
         * @param key
         * @param isInt
         */
        handleAmountChange: function (obj, key, isInt) {
            var temp = obj[key].toString();
            if (isInt) {
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
        /**
         * 表头地点模糊查询
         * @param value
         * @param data
         * @returns {boolean}
         */
        placeFilter: function (value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        placeFilterChart: function (value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        /**
         * 获取页面初始化数据
         */
        getInitData: function () {
            var _this = this;
            ajax.handle("get", "api/access-control/manage/data/init", null, null, function (rs) {
                _this.place = jsonTree(rs.data.place, {});
                var feUuids = rs.data.feUuids;
                if (typeof feUuids === "string" && feUuids !== "") {
                    var flashingUuidMap = {};
                    feUuids.split(",").forEach(function (item) {
                        flashingUuidMap[item] = true;
                    });
                    _this.flashingUuidMap = flashingUuidMap;
                }
                _this.asList = rs.data.asList || [];
            });
        },
        /**
         * 初始化flag对应的筛选列表
         * @param isExpand
         * @param flag
         */
        initScreenList: function (isExpand, flag) {
            var _this = this;
            var obj = this.condition;
            if (isExpand && !obj.screen[flag].hasDo) {
                var param = {flag: flag};
                obj.loading[flag] = true;
                var url = "api/central/property/getScreen";
                if (flag === "REPAIR_NICKNAME") {
                    url = "api/property/getScreen";
                }
                ajax.handle("get", url, param, null, function (rs) {
                    var data = rs.data;
                    obj.screen[flag].list = data;
                    obj.loading[flag] = false;
                    obj.screen[flag].hasDo = true;
                }, function (rs) {
                    obj.loading[flag] = false;
                    obj.screen[flag].hasDo = true;
                });
            }
        },
        /**
         * 更改列表查询排序规则
         * @param sort
         */
        sortChange: function (sort) {
            var prop = sort.prop;
            var order = sort.order;
            $u.saveSortSingle(prop, order, this.condition.sort);
            this.toFirstPage();
        },
        /**
         * 获取所有的地点数据
         */
        getAllPlace: function () {
            var _this = this;
            var obj = this.condition;
            var param = {};
            obj.loading.place = true;
            ajax.handle("get", "place/getAll", param, null, function (rs) {
                var data = rs.data;
                _this.realPlace = deepClone(data);
                data = jsonTree(data, {});
                _this.place = data;
                obj.loading.place = false;
            }, function (rs) {
                obj.loading.place = false;
            });
        },
        /**
         * 执行删除数据
         */
        doDelete: function () {
            var ids = this.dialog.del.ids;
            this.dialog.del.show = false;
            this.ajaxMultipleDelete(ids);
        },
        //显示新增模态框
        showAddModal: function () {
            this.resetAddForm();
            this.dialog.add.show = true;
            this.dialog.add.isEdit = false;
        },
        // 显示编辑模态框
        showEditModal: function (ac) {
            var obj = this.dialog.add;
            obj.obj = deepClone(ac);
            obj.show = true;
            obj.isEdit = true;
            setTimeout(function () {
                var date = new Date(ac.start);
                date.setFullYear(date.getFullYear() + 10)
                LIMIT_DATE_END = date.getTime();
            }, 0);
        },
        //删除单条数据
        singleDelete: function (id) {
            var _this = this;
            this.dialog.del.ids = id;
            this.dialog.del.show = true;
        },
        //编辑
/*        update: function () {
            var _this = this;
            var obj = this.dialog.update;
            var param = {
                status: obj.obj.status,
                completeTimeMillis: obj.obj.completeTimeMillis,
                description: obj.obj.description,
            };
            if ($u.isNull(param.description)) {
                _this.$message.error("描述不能为空");
                return;
            }
            obj.loading = true;
            // if (!this.verifyForm(param)) return;
            ajax.handle("put", "api/repair/byId/" + obj.obj.id, param, null, function (rs) {
                _this.$message.success("更新成功");
                obj.show = false;
                obj.loading = false;
                _this.toFirstPage();
            }, function (rs) {
                obj.loading = false;
                _this.$message.error("更新失败");
            });
        },*/
        //取消部门选择
        cancelDep: function (type, obj, forware) {
            obj.depId = null;
            obj.depName = null;
            eval("this.$refs." + type + ".setCurrentKey(null)");
            if (forware) this.toFirstPage();
        },
        cancelPlace: function (type, obj) {
            obj.placeId = null;
            obj.placeName = null;
            eval("this.$refs." + type + ".setCurrentKey(null)");
        },
        //重置新增用户表单
        resetAddForm: function () {
            this.dialog.add.obj = deepClone(_dialogAdd);
            $("#add_qrcode").html(""); // 清除二维码
        },
        /**
         * 检查表单数据合法性
         * @param param 待检查数据
         */
/*        verifyForm: function (param) {
            var name = param.name; // 名称
            var uniqueCode = param.uniqueCode; // 唯一码
            var propertyTypeId = param.propertyTypeId; // 资产类型
            var customizePropertyTypeName = param.customizePropertyTypeName;
            var control = param.control; // 是否控制资产
            if (entity(name)) {
                $u.showWarning(this, "名称不能为空");
                return false;
            }
            if (entity(uniqueCode)) {
                $u.showWarning(this, "唯一码不能为空");
                return false;
            }
            if (!/^\d{6}$/.test(uniqueCode)) {
                $u.showWarning(this, "唯一码应由6位数字组成");
                return false;
            }
            if (entity(propertyTypeId) && entity(customizePropertyTypeName)) {
                $u.showWarning(this, "请选择资产类型");
                return false;
            }
            if (entity(control)) {
                $u.showWarning(this, "请选择控制资产");
                return false;
            }
            return true;
        },*/
        /**
         * 创建新增/更新时的请求参数
         * @param obj
         */
        createParam: function (obj) {
            var param = deepClone(obj.obj);
            if (param.customizePropertyTypeName) param.propertyTypeId = null; // 如果用户自定义资产类型，则不需要传资产id
            return param;
        },
        /**
         * 更新数据
         */
/*        updateData: function () {
            var _this = this;
            var obj = this.dialog.update;
            var param = this.createParam(obj);
            if (!this.verifyForm(param)) return;
            ajax.handle("post", "v3/property/update", param, null, function (rs) {
                _this.$message.success("编辑成功");
                obj.show = false;
                obj.loading = false;
                if (obj.isAddCustomizePropertyType) {
                    _this.getAllPropertyType();
                }
                _this.getList();
                _this.cleanAllScreenHasDo();
            }, function (rs) {
                obj.loading = false;
                _this.$message.error(rs.msg);
            });
        },*/
        // 提交新增
        addData: function () {
            if (!this.isCanAdd) return;
            var obj = this.dialog.add.obj;

            if (obj.accessControlType === 3 && !AC_SCREEN_UUID_REG.test(obj.uniqueCode)) {
                this.$message.error(this.$t('placeholder.h1'));
                return;
            }

            this._doAddData(obj);
        },
        _doAddData: function (obj) {
            var _this = this;

            var isEdit = this.dialog.add.isEdit;
            var url, method;
            if (isEdit) {
                method = "put";
                url = "api/access-control/" + obj.id;
            } else {
                method = "post";
                url = "api/access-control";
            }

            ajax.handle(method, url, {
                name: obj.name,
                uniqueCode: obj.uniqueCode,
                placeId: obj.placeId,
                accessControlType: obj.accessControlType,
                equipmentIp: obj.equipmentIp,
                equipmentPort: obj.equipmentPort,
        }, {obj: this, lname: 'mainLoading'}, function (rs) {
                _this.$message.success((isEdit ? $i.t('msg.edit') : $i.t('msg.add')) + $i.t('msg.success'));
                if (isEdit) {
                    _this.getList();
                } else {
                    _this.toFirstPage();
                }
                _this.dialog.add.show = false;
            }, function (rs) {
                console.error(rs);
                _this.$message.error(rs.msg || $i.t('msg.opaFail'));
            });
        },
        //跳转到第一页
        toFirstPage: function () {
            this.page.pageNum = 1;
            this.getList();
        },
        //跳转到最后一页
        toLastPage: function() {
            var pageSize = this.page.pageSize;
            var count = this.page.count;
            this.page.pageNum = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1;
            if ($u.isNull(this.condition.onlineStatus)) {
                this.getList();
            }
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
            if ($u.isNull(this.condition.onlineStatus)) {
                this.getList();
            }
        },
        //选择部门
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
        updatePage: function (pageNum) {
            this.page.pageNum = pageNum;
        },
        getList: function (pageNum) {
            var _this = this;
            if (pageNum) _this.page.pageNum = pageNum;
            // var sort = $u.getSortStr(this.condition.sort);
            var obj = this.condition;
            //请求参数
            var param = {
                pageSize: this.page.pageSize,
                pageNum: this.page.pageNum,
                like: obj.like,
                // orderBy: sort, // 排序方式
                // name: obj.screen.PROPERTY_NAME.value.join(","), // 按名称筛选
                // nickname: obj.screen.REPAIR_NICKNAME.value.join(","), // 按报修人
                // brands: obj.screen.PROPERTY_BRAND.value.join(","), // 按品牌筛选
                // propertyType: obj.screen.PROPERTY_MODEL.value.join(","), // 按型号筛选
                // propertyType: obj.propertyType.join(","), // 已选的资产类型
                placeIds: this.conditionPlaceSelect.join(","), // 已选的地点
                // status: obj.status,
                accessControlType: obj.type,
                onlineStatus: obj.onlineStatus,
            };
            ajax.handle("get", "api/access-control/byDto", param, {obj: this, lname: 'mainLoading'}, function (rs) {
                var data = rs.data.data;
                if (data.length === 0 && _this.page.pageNum > 1) {
                    _this.page.pageNum--;
                    return _this.getList();
                }

                _this.page.count = rs.data.count;
                var snDeviceMap = rs.data.snDeviceMap;
                // var faceOnlineMap = rs.data.faceOnlineMap;
                // var screenOnlineMap = rs.data.screenOnlineMap;
                // $u.extend(snDeviceMap, faceOnlineMap);
                // $u.extend(snDeviceMap, screenOnlineMap);

                data.forEach(function (item) {
                    item.accessControlType = FLAG_MAPPING[item.flag];
                    item.isOnline = !$u.isNull(snDeviceMap[item.uniqueCode]) && snDeviceMap[item.uniqueCode] !== 0;
                });

                _this.list = data;
                _this.snDeviceMap = snDeviceMap;
            });
        },
        handleSelectionChange: function (val, obj) {
            if (obj) obj.multipleSelection = val;
            else this.multipleSelection = val;
        },
        //批量删除
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
                        ms.forEach(function (ac) {
                            ids.push(ac.id);
                        });
                        _this._doMultipleDelete(ids);
                    }
                },
            });
        },
        _doMultipleDelete: function (ids) {
            var _this = this;
            ajax.handle("delete", "api/access-control/byIds/" + ids, {}, {
                obj: this,
                lname: 'mainLoading'
            }, function (rs) {
                _this.$message.success($i.t('msg.delSuccess'));
                _this.getList();
            }, function (rs) {
                _this.$message.error(rs.msg);
            });
        },
        // 批量开门
        multiOperate: function (cmd) {
            var ms = this.multipleSelection;
            if (ms.length === 0) {
                this.$message({
                    message: $i.t('plzSelect') + SELECT_UNIT_TEXT,
                    type: 'warning'
                });
                return;
            }
            var _this = this;
            this.$confirm('<p>' + $i.t('confirm') + this.operationTextMap[cmd] + '?</p>'
                + (cmd === 'sync-config' ? SYNC_WARN_TEXT : ''),
                $i.t('tip'), {
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: $i.t('yes'),
                    cancelButtonText: $i.t('cancel'),
                    type: 'warning',
                    callback: function (action, instance) {
                        if (action === 'confirm') {
                            var uniqueCodes = [], acTypes = [];
                            ms.forEach(function (ac) {
                                uniqueCodes.push(ac.uniqueCode);
                                acTypes.push(ac.accessControlType || 1);
                            });
                            _this._doOperation(uniqueCodes.join(","), acTypes.join(","), cmd);
                        }
                    },
                });
        },
        // 单个操作
        operate: function (ac, cmd, disable) {
            if (disable === true) return;
            if ($u.isNull(this.snDeviceMap[ac.uniqueCode])) {
                this.$message({message: $i.t('msg.acOffline'), type: 'warning'});
                return;
            }
            var _this = this;
            this.$confirm('<p>' + $i.t('confirm') + this.operationTextMap[cmd] + '?</p>'
                + (cmd === 'sync-config' ? SYNC_WARN_TEXT : ''),
                $i.t('tip'), {
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: $i.t('yes'),
                    cancelButtonText: $i.t('cancel'),
                    type: 'warning',
                    callback: function (action, instance) {
                        if (action === 'confirm') {
                            _this._doOperation(ac.uniqueCode, ac.accessControlType || 1, cmd);
                        }
                    },
                });
        },
        _doOperation: function (uniqueCodes, acTypes, cmd) {
            var _this = this;
            ajax.handle("post", "api/access-control/multi/" + cmd, {
                uniqueCodes: uniqueCodes,
                acTypes: acTypes,
            }, {obj: this, lname: 'mainLoading'}, function (rs) {
                _this.$message.success($i.t('msg.opaSuccess'));
            }, function (rs) {
                _this.$message.error($i.t('msg.opaFail'));
            });
        },
        getFileNameFromUrl: getFileNameFromUrl,
    },
    watch: {
        'dialog.addWhiteList.start': function (val) {
            var date = new Date(val);
            date.setFullYear(date.getFullYear() + 10)
            LIMIT_DATE_END = date.getTime();
        },
        'chartFilter.attrSwitch': function (val) {
            this._getChartsData(1);
        },
        'chartFilter.dateSwitch': function (val) {
            this._getChartsData(2);
        },
        'chartFilter.placeLike': function (val) {
            this.$refs.chartPlaceFilter.filter(val);
        },
        'condition.placeLike': function (val) {
            this.$refs.condition.filter(val);
        },
    },
    filters: {
        url2FileName: function (url) {
            return getFileNameFromUrl(url);
        },
        dateFull: function (mills) {
            return formatDate(new Date(mills), "yyyy-MM-dd hh:mm:ss");
        },
        date: function (mills) {
            return formatDate(new Date(mills), "yyyy-MM-dd");
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
            return $u.isNull(text) ? '——' : text;
        },
        byKey: function (obj, key) {
            if ($u.isNull(obj) || $u.isNull(obj[key])) return '——';
            return obj[key];
        },
        weekRepeat: function (repeat) {
            if ($u.isNull(repeat)) return "——";
            var rArr = repeat.split(",");
            var res = [];
            for (var idx = 0; idx < rArr.length; idx++) {
                // res.push(WEEK_SHORT[rArr[idx]]);
                res.push($i.t('weekShort[' + rArr[idx] + ']'));
            }
            return res.join("、");
        },
    },
    directives: {
        'loadmore': $directive.loadmore,
    },
})

function getFileNameFromUrl(url) {
    var index = url.lastIndexOf("\/");
    return url.substring(index + 1, url.length);
}


