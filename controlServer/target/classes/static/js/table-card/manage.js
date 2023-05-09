var ajax = new Ajax(_config);
var PAGE_NAME = "tableCardManage";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i,
    computed: {
        formRules: function() {
            return {
                name: [
                    { required: true, message: this.$t('p16'), trigger: "submit" },
                ],
                uniqueCode: [
                    { required: true, message: this.$t('p17'), trigger: "submit" },
                ]
            }
        },
        uuidTooltip: function() {
            if(this.isEinkFlags(this.editDialog.flag)) {
                return this.$t('p21');
            }
            return "";
        },
        typeTooltip: function() {
            if(this.editDialog.type == null) {
                return null;
            }

            var type = this.$global.findByKeyValue(this.einkTypes, "type", this.editDialog.type);
            if(type == null) {
                return null;
            }
            return this.$t('p22') + this.getEinkTypeDesc(type);
        },
        /**********************日志******************************* */
        logTypeOptions: function () {
            return [{
                value: "1",
                name: this.$t('commonLog.remindLog'),
                icon: "el-icon-bell",
            }, {
                value: "2",
                name: this.$t('commonLog.operateLog'),
                icon: "el-icon-thumb"
            }]
        },
        logSubTypeMap: function () {
            return this.$t('commonLogSubType');
        },
        manageType: function() {           //管理类型，由链接传入
            var type = this.$global.getUrlParam("type");
            type = type || 1;
            return type;
        },
        propertyFlags: function() {              //资产类型
            var type = this.manageType;
            if(type != 1) {
                return "eink_screen";
            }
            return "eink";
        },
        permission: function() {
            return this.manageType == 1 ? "tableCardManage" : "einkScreenManage";
        },
        onlineOptions: function() {
            return [{
                label: this.$t('p11'),
                value: true
            }, {
                label: this.$t('p12'),
                value: false
            }]
            
        }
    },
    data: {
        //分页信息
        page: {
            pageNum: 1,
            pageSize: 8,
            count: 1,
            target: '',
        },
        tableData: [],
        tableLoading: false,
        search: "",
        tableCheck: [],         //表格选中
        loading: false,
        editDialog: {       //新增编辑相关
            record: null,
            isAdd: true,
            name: "",
            placeId: null,
            uniqueCode: "",
            type: 1,
            flag: "eink",
            station: "",
        },
        editDialogVisible: false,
        editLoading: false,
        placeData: [],            //地点数据
        einkTypes: [],            //墨水屏类型
        flashingEquipmentUuIds: "",       //离线闪烁的uuids
        /*************************************日志*****************************************************/
        logDialog: {
            lastRecord: null, //上次打开的设备信息
            record: null, //当前打开的设备信息
            tabActive: null,
            selectTimes: [], //选择的时间
            search: "", //搜索值
            data: [], //表格数据
            showTable: true, //是否显示表格， 优化选项切换表格渲染问题
            loading: false,
        },
        logDialogVisible: false,
        logPage: {
            pageNum: 1,
            pageSize: 20,
            count: 0
        },
        placeIds: [],
        online: null,
        statusDebouncerMap: {},             //获取实时状态uuid与防抖函数的映射
        stations: null,                     //基站列表
    },
    mounted: function() {
        this.getTableData(1);
        this.getPlaceData();
        this.getEinkTypes();
        this.getFlashingEquipmentUuIds();
        this.startGetOnlineMap();
    },
    methods: {
        formatNull: function(row, column, cellValue, index) {         //格式化空数据
			if(cellValue == null || cellValue == "") {
				return "——";
			} 
			return cellValue;
		},
        formatUser: function(row, column, cellValue, index) {         //格式化用户
			if(cellValue == null || cellValue.nickname == null) {
				return "——";
			} 
			return cellValue.nickname;
		},
        formatType: function(row) {
            if(this.isEinkFlags(row.flag)) {
                var type = row.einkType;
                if(type == null) {
                    return "——";
                }
                return this.getEinkTypeStr(type);
            }
            return "——";
        },
        getEinkTypeStr: function(type) {
            return type.size + "/" + type.width + "*" + type.height;
        },
        isEinkFlags: function(flag) {
            return flag == "eink_screen" || flag == "eink";
        },
        getTableData: function(index) {                    //获取表格数据
            index = index || this.page.pageNum;
            var loading = {
                obj: this,
                lname: "tableLoading"
            }
            var _this = this;
            var data = {
                pageNum: index,
                pageSize: this.page.pageSize,
                like: this.search,
                placeIds: this.placeIds.length <= 0 ? null : this.placeIds.join(","),
                propertyTypeFlags: this.propertyFlags,
                permission: this.permission,
                online: this.online,
            }
            
            ajax.handle("get", "/api/tableCard/page", data, loading, function(rs) {
                _this.tableData = rs.data.data;
                _this.page.pageNum = index;
                _this.page.count = rs.data.count;
            });
        },
        handleSelectionChange: function(selection) {
            this.tableCheck = selection;
        },
        changeSearch: function() {
            this.getTableData(1);
        },
        changePlaces: function() {
            this.getTableData(1);
        },
        changeOnline: function() {
            this.getTableData(1);
        },
        //#region 删除
        singleDelete: function(record) {
            this.deleteConfirm([record]);
        },
        multiDelete: function() {
            if(this.tableCheck.length <= 0) {
                this.$global.showError(this.$t("p5"));
                return false;
            }
            this.deleteConfirm(this.tableCheck);
            return true;
        },
        deleteConfirm: function(records) {
            var _this = this;
            this.$yconfirm({
                message: this.$t("p6")
            })
            .then(function(rs) {
                _this.doDelete(records);
            })
            .catch(function(err) {

            })
        },
        doDelete: function(records) {
            var ids = records.map(function(record) {
                return record.id;
            }).join(",");
            var data = {
                ids: ids
            }
            var loading = {
                obj: this,
                lname: "loading"
            }

            var _this = this;
            ajax.handle("delete", "/api/tableCard", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[2]"));
                _this.getTableData();
            })
        },
        //#endregion
        //#region 新增/编辑
        showEditDialog: function(isAdd, record) {
            this.editDialog.record = record;
            this.editDialog.isAdd = isAdd;
            this.editDialog.flag = this.propertyFlags;

            if(!isAdd) {
                this.editDialog.name = record.name;
                this.editDialog.uniqueCode = record.uniqueCode;
                this.editDialog.placeId = record.placeId;
                this.editDialog.flag = record.flag;
                this.editDialog.station = record.einkAttribute ? record.einkAttribute.station : "";
                this.editDialog.type = record.einkType ? record.einkType.type : 1;
            }

            //获取基站列表
            if(this.stations == null) {
                this.stations = [];
                this.listStations();
            }
            this.editDialogVisible = true;
            this.$nextTick(function() {
                var dom = this.$refs.form;
                if(dom) {
                    dom.clearValidate();
                }
            })
        },
        getPlaceData: function() {              //获取地点数据
            var _this = this;
            ajax.handle("get", "/api/tableCard/places", {
                permission: this.permission
            }, null, function(rs) {
                _this.placeData = rs.data;
            })
        },
        getEinkTypes: function() {          //获取墨水屏类型
            var _this = this;
            ajax.handle("get", "/api/tableCard/eink/types", {}, null, function(rs) {
                var data = rs.data;
                data = data.map(function(el) {
                    el.label = _this.getEinkTypeStr(el);
                    el.desc = _this.getEinkTypeDesc(el);
                    return el;
                })
                _this.einkTypes = data;
            })
        },
        getEinkTypeDesc: function(type) {
            var size = type.size || "";
            var infos = size.split("寸");
            var desc = infos[0] + this.$t('p24');
            if(infos.length > 1) {
                var pages = infos[1];
                if(pages == "AB") {
                    desc += this.$t('p25');
                } else {
                    desc += this.$t('p26')
                }
            }
            desc += "（";
            desc += this.$t('p27') + type.width + " * " + type.height + "）";
            return desc;
        },
        confirmSubmit: function() {         //提交
            var _this = this;
            this.$refs.form.validate(function(valid) {
                if(!valid) {
                    _this.$global.showError(_this.$t('p23'));
                    return;
                }
                _this.doSubmit();
            })
        },
        doSubmit: function() {
            var data = {
                uniqueCode: this.editDialog.uniqueCode,
                name: this.editDialog.name,
                placeId: this.editDialog.placeId,
                flag: this.editDialog.flag,
                type: this.editDialog.type,
                station: this.editDialog.station
            }
            if(this.editDialog.isAdd) {
               this.addTableCard(data);
               return; 
            }
            data.id = this.editDialog.record.id;

            //判断地点是否更改
            if(this.editDialog.record.placeId == null 
                || this.editDialog.record.placeId == this.editDialog.placeId) {
                this.updateTableCard(data);
                return;
            }

            //查询桌牌设备是否已被占用
            var _this = this;
            var loading = {
                obj: this,
                lname: "editLoading"
            }
            ajax.handle("get", "api/tableCard/places/assigned", { uuid: this.editDialog.record.uniqueCode }, loading, function(rs) {
                var places = rs.data;
                if(places.length <= 0) {
                    _this.updateTableCard(data);
                    return;
                } 
                //询问
                _this.$yconfirm({
                    message: _this.$t('p30')
                }).then(function(rs) {
                    _this.updateTableCard(data);
                }).catch(function(err) {

                })
            })
        },
        addTableCard: function(data) {
            var _this = this;
            var loading = {
                obj: this,
                lname: "editLoading"
            }
            ajax.handle("post", "api/tableCard", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[1]"));
                _this.editDialogVisible = false;
                _this.getTableData();
            })
        },
        updateTableCard: function(data) {
            var _this = this;
            var loading = {
                obj: this,
                lname: "editLoading"
            }
            ajax.handle("put", "api/tableCard", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[0]"));
                _this.editDialogVisible = false;
                _this.getTableData();
            })
        },
        /******************************获取离线闪烁uuid列表********************************************* */
        getFlashingEquipmentUuIds: function () {
            var _this = this;
            ajax.handle("get", "/api/eastcato/airswitch/getFlashingEquipmentUuIds", {}, null, function (res) {
                _this.flashingEquipmentUuIds = res.data;
            }, function (err) {

            });
        },
        isFlashingByUuid: function (uuid) {
            if (this.flashingEquipmentUuIds == null || this.flashingEquipmentUuIds == "") {
                return false;
            }
            var uuids = this.flashingEquipmentUuIds.split(",");
            return uuids.indexOf(uuid) != -1;
        },
        startGetOnlineMap: function() {
            clearInterval(this.onlineTimer);
            var _this = this;
            this.onlineTimer = setInterval(function() {
                _this.getOnlineMap();
            }, 5 * 1000);
        },
        getOnlineMap: function() {
            var uuids = this.tableData.map(function(el) {
                return el.uniqueCode;
            }).join(",")
            var _this = this;
            ajax.handle("get", "/api/tableCard/onlineMap", {uuids: uuids}, null, function(rs) {
                var map = rs.data;
                _this.tableData.map(function(el) {
                    el.online = map[el.uniqueCode] || 0;
                })
            })
        },
        /*********************************设备日志*******************************************/
        formatNull: function (row, column, cellValue, index) { //格式化空数据
            if (cellValue == null || cellValue == "") {
                return "——";
            }
            return cellValue;
        },
        formatLogTime: function (row, column, cellValue, index) {
            if (cellValue == null || cellValue == "") {
                return "——";
            }
            return moment(cellValue).format("YYYY-MM-DD HH:mm:ss");
        },
        showLogDialog: function (record) {
            console.log(record);
            //判断当前是否有选中tab，没有选中则默认第一个选项
            if (this.logDialog.tabActive == null && this.logTypeOptions.length > 0) {
                this.logDialog.tabActive = this.logTypeOptions[0].value;
            }

            //判断上一次打开的是否与当前打开的一致，一致则获取上次页码，否则则获取第一页数据
            var pageNum = 1;
            if (this.logDialog.lastRecord != null &&
                this.logDialog.lastRecord.id == record.id) {
                pageNum = this.logPage.pageNum;
            }
            this.logDialog.lastRecord = record;
            this.logDialog.record = record;
            this.logDialogVisible = true;
            this.getLogData(pageNum);
        },
        getLogData: function (pageNum) { //获取日志列表数据,pageNum: 页码，不传默认当前页码
            pageNum = pageNum || this.logPage.pageNum;
            var params = {
                pageNum: pageNum,
                pageSize: this.logPage.pageSize,
                type: this.logDialog.tabActive,
                uniqueCode: this.logDialog.record.uniqueCode
            }
            //添加搜索参数
            var search = this.logDialog.search;
            if (search != null && search != "") {
                params.like = search;
            }

            //添加开始时间和结束时间参数
            var times = this.logDialog.selectTimes;
            if (times != null && times.length == 2) {
                params.startTimeTS = times[0].getTime();
                params.endTimeTS = times[1].getTime();
            }
            console.log("获取日志数据：" + pageNum, params);
            //TODO 请求接口获取数据
            var _this = this;
            ajax.handle("get", "api/eastcato/airswitch/pageEquipmentLogs", params, {
                obj: this,
            }, function (res) {
                _this.logPage.pageNum = pageNum;
                _this.logDialog.data = res.data.data;
                _this.logPage.count = res.data.count;
                console.log(_this.logPage, res);
            });
        },
        changeLogPage: function (pageNum) {
            this.getLogData(pageNum);
        },
        changeLogSearch: function () {
            this.getLogData(1);
        },
        changeLogTimes: function () {
            this.getLogData(1);
        },
        changeLogTab: function (value) {
            //隐藏表格，再重新渲染表格，避免el-table-column v-if带来的样式问题
            this.logDialog.showTable = false;
            this.$nextTick(function () {
                this.logDialog.showTable = true;
            })
            this.getLogData(1);
        },
        exportLog: function () { //导出日志
            //开始时间和结束时间
            var startTime = null;
            var endTime = null;
            var times = this.logDialog.selectTimes;

            //判断是否已选择时间
            if (times == null || times.length < 2) {
                this.$message.error(this.$t('commonLog.exportTemplateTips'));
                return;
            }

            startTime = times[0].getTime();
            endTime = times[1].getTime();

            //类型(提醒或操作)
            var type = this.logDialog.tabActive;

            //设备唯一码
            var uniqueCode = this.logDialog.record.uniqueCode;

            var params = {
                startTimeTS: startTime,
                endTimeTS: endTime,
                uniqueCode: uniqueCode,
                type: type
            }

            var paramUrl = _config.server.central + "api/v3/exportEquipmentLogs";
            paramUrl = $u.concatUrlParam(params, paramUrl);

            //url编码
            paramUrl = encodeURIComponent(paramUrl);

            var url = _config.server.url + "/energy/log/export?url=" + paramUrl;

            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                $u.exportForIE(url, this.$t('commonLog.filename'));
            } else {
                $u.openDownload(url);
            }

        },
        deleteLog: function (log) { //删除日志记录
            var _this = this;
            this.$confirm(this.$t('commonLog.deleteTip'), this.$t('commonLog.deleteAllTipTitle'), {
                    type: "warning"
                })
                .then(function () {
                    _this.doDeleteLog(log);
                })
                .catch(function () {

                })
        },
        doDeleteLog: function (log) {
            var _this = this;
            var params = {
                ids: log.id
            };
            ajax.handle("post", "api/eastcato/airswitch/deleteEquipmentLogs", params, {
                obj: this, lname: 'logDialog.loading'
            }, function (res) {
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
                _this.$message.success(_this.$t('toast[2]'));
                _this.getLogData(1);
            });
		},
        refreshStatus: function(eink, status) {       //刷新在线状态
            var param = {
                uuid: eink.uniqueCode,
                status: status
            }
            var _this = this;
            ajax.handle("post", "api/tableCard/refresh/status", param, null, function(rs) {
                _this.$global.showSuccess(_this.$t("p35"));
                //定时获取状态
                _this.getRefreshStatus(eink.uniqueCode);
            }, function(rs) {
                _this.$global.showError(rs.msg);
            })
        },
        getRefreshStatus: function(uuid) {
            var debouncer = this.statusDebouncerMap[uuid];
            if(debouncer != null) {
                debouncer();
                return;
            }
            var _this = this;
            debouncer = this.$global.debounce(function() {
                ajax.handle("get", "api/tableCard/realtime/status", {uuid: uuid}, null, function(rs) {
                    var find = _this.$global.findByKeyValue(_this.tableData, "uniqueCode", uuid);
                    if(find == null) {
                        return;
                    }
                    var data = rs.data;
                    _this.$set(find, "online", data.online);
                    _this.$set(find, "power", data.power);
                    _this.$set(find, "temperature", data.temperature);
                })
            }, 4000);
            this.statusDebouncerMap[uuid] = debouncer;
            debouncer();
        },
        listStations: function() {
            var _this = this;
            ajax.handle("get", "api/tableCard/stations", {}, null, function(rs) {
                _this.stations = rs.data;
            })
        },
    },
    filters: {
        filterUnknown: function(val) {
            return val || "——"
        }
    }
});


