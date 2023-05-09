var ajax = new Ajax(_config);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    data: {
        searchDebounce: null, // 防抖
        warningData: [],
        headerSelect: {
            placeItem: [],
            currPlaceName: '',
            boxValue: '',
            boxOption: [],
            originalPlaces: [],       //原始树列表数据
            originalEqms: [],           //原始设备数据
        },
        tableData: [],
        page: {
            size: 8,
            count: 0,
            num: 1,
            search: '',
            placeId: '',
            target: '',
            placeIds: [],
            names: [],
            uniqueCodes: [],
            online: null,
        },
        props: {
            label: 'name',
        },
        deleteEquipment: {
            isShowDialog: false,
            data: {
                ids: ''
            }
        },
        addeEquipment: {
            isShowDialog: false,
            disable: true,
            placeValue: '',
            data: {
                name: '',
                uniqueCode: '',
                placeId: '',
                equipmentIp: ''
            },
        },
        qr: {
            isShowDialog: false,
            bigQrcodeUrl: '',
            currentSrc: '',
            title: ''
        },
        warningAudioUrl: '', // 预警声音
        muted: true,

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
        flashingEquipmentUuIds: "", //闪烁的uuid列表

        /*********************************权限***********************************************************/
        permissionDialog: {
            record: null, 
            loading: false,
            departments: [],                           //部门列表
            hasFetchDepartment: false,                      //是否获取过部门列表
            departmentLoading: false,
            userLoading: false,                          //用户加载
            users: [],                                 //用户列表
            hasFetchUser: false,                        //是否获取过用户列表
            checkedDeptUserIds: [],                            //已选中的部门用户id
            selectDepartment: null,                     //已选中的部门
            checkedUsers: [],                           //最右边已选中的用户
            checkedLoading: false,
            creatorCache: {}                           //设备创建用户id缓存
        },
        permissionLoading: false,
        permissionDialogVisible: false,
        /**************************警报策略************************************************************* */
        warningStrategy: {
            show: false,
            loading: false,
            record: null,
            warningStrategy: null,
            cutoffStrategy: null,
            isAll: false,
            alertStrategies: null,         //警报策略
        },
    },
    created: function () {
        this.warningAudioUrl = _config.staticPath + '/public/images/energy/warning2.mp3';
        this.getAirswitchPlaces();
        this.getEquipmentList();
        var num = sessionStorage.getItem('page');
        if (num != null) {
            this.page.num = Number(num);
            this.getAirswitchPage();
            this.getFlashingEquipmentUuIds();
            return;
        }
        this.getAirswitchPage();
        this.getFlashingEquipmentUuIds();
    },
    mounted: function () {
        this.initData();
        var _that = this;
        window.socketApi.sendSock(null, function (data) {
            // console.log(data);
            if (data.type == 'online' || data.type == 'offline') {
                _that.getAirswitchPage();
            }
            var index = _that.warningData.indexOf(data.uuid)
            if (data.type == 'protection_alarm') {
                var id = '';
                _that.tableData.forEach(function (el) {
                    if (el.uniqueCode == data.uuid) id = data.uuid;
                });
                if (index == -1) {
                    _that.warningData.push(data.uuid);
                    _that.autoAudio();
                };
            }
            if (data.type == 'change_protection') {
                _that.warningData.splice(index, 1);
                _that.AudioClose();
            }
        });
    },
    computed: {
        add: function () {
            return this.addeEquipment.data;
        },
        search: function () {
            return this.page.search;
        },
        /**********************日志******************************* */
        logTypeOptions: function () {
            return [{
                value: "1",
                name: this.$t('dialog.h48'),
                icon: "el-icon-bell",
            }, {
                value: "2",
                name: this.$t('dialog.h49'),
                icon: "el-icon-thumb"
            }]
        },
        logSubTypeMap: function () {
            return this.$t('dialog.h50');
        },
        /*********************权限用户**********************************/
        departmentTree: function() {
            return this.jsonTree(this.permissionDialog.departments, {});
        },
        permissionUsers: function() {
            var _this = this;
            var users = this.permissionDialog.users;
            var depChildren = [];
            if(this.permissionDialog.selectDepartment != null) {
                var departments = this.permissionDialog.departments.filter(function(el) {
                    return el.id != null;
                })
                
                var depId = this.permissionDialog.selectDepartment.id;
                depChildren = this.listChildrenIdsByPid(departments, depId);
                depChildren.push(depId);
                // console.log("子部门:", depChildren, depId);
            }
            users = users.filter(function(user) {
                //判断是否属于该部门的用户
                if(_this.permissionDialog.selectDepartment == null) {
                    return true;
                }

                if(user.depId != null) {
                    return depChildren.indexOf(user.depId) != -1;
                }
                var depIds = user.depIds;
                depIds = depIds || "";
                var depArr = depIds.split(",");
                return depChildren.some(function(el) {
                    return depArr.indexOf(el + "") != -1;
                })
            })
            .map(function(user) {
                //判断是否创建者
                user.isCreator = _this.isCreator(user.id);
                return user;
            })
            .sort(function(a, b) {
                //创建者排最前
                var weightA = a.isCreator ? 1 : 0;
                var weightB = b.isCreator ? 1 : 0;
                return weightB - weightA;
            })
            
            return users;
        },
        headerUuidOptions: function() {
            return this.headerSelect.originalEqms.map(function(el) {
                return {
                    label: el.uniqueCode,
                    value: el.uniqueCode
                }
            })
        },
        headerNameOptions: function() {
            return this.headerSelect.originalEqms.map(function(el) {
                return {
                    label: el.name,
                    value: el.name
                }
            })
        },
        onlineOptions: function() {
            return [{
                label: this.$t('dialog.h7'),
                value: true
            }, {
                label: this.$t('dialog.h8'),
                value: false
            }]

        }
    },
    methods: {
        initData: function () {
            this.searchDebounce = this.debounce(function () {
                // console.log(this.page);
                this.getAirswitchPage(1)
            }, 600)
        },
        /**
         * 函数防抖，能够避免同一操作在短时间内连续进行
         */
        debounce: function (callback, delay) {
            var timer = null; //定时器
            delay = delay || 300; //默认300毫秒
            return function () {
                if (timer != null) {
                    clearTimeout(timer);
                }
                var context = this;
                var args = arguments;
                timer = setTimeout(function () {
                    timer = null;
                    callback.apply(context, args);
                }, delay)
            }
        },
        //将后台的json转成jsonTree格式
        jsonTree: function (data, config) {
            if (!data) return [];
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
        },
        // 拷贝
        deepCopy: function (target) {
            if (typeof target == 'object') {
                var result = Array.isArray(target) ? [] : {}
                for (var key in target) {
                    if (typeof target[key] == 'object') {

                        result[key] = this.deepCopy(target[key])
                    } else {
                        result[key] = target[key]
                    }
                }
                return result
            }
            return target
        },
        autoAudio: function () {
            var audio = this.$refs.warningAudio;
            // this.muted = false;
            audio.play();
        },
        AudioClose: function () {
            var audio = this.$refs.warningAudio;
            audio.pause();
        },
        // 设置
        changeSetting: function (row, column, cell) {
            if (column.label == this.$t('dialog.h30')) {
                if (!row.online) return this.$message({
                    message: this.$t('dialog.h37'),
                    type: 'warning'
                });
                var url = window._config.server.url;
                sessionStorage.setItem('page', this.page.num);
                sessionStorage.setItem('uuid', row.uniqueCode);
                sessionStorage.setItem('name', row.name);
                window.location.href = url + '/energy/detail' + '?uid=/uuid=' + row.uniqueCode;
            }
            if (column.label == this.$t('dialog.h9')) {
                this.qr.bigQrcodeUrl = row.qrCodeUrl;
                var data = {
                    qrCodeUrl: row.qrCodeUrl,
                    id: 'big',
                    width: 200,
                    height: 200
                }
                this.qr.title = row.name;
                this.qr.isShowDialog = true;
                this.createQrCode(data, true);
            }
        },
        zoomQrCode: function (row) { //放大二维码
            this.qr.bigQrcodeUrl = row.qrCodeUrl;
            var data = {
                qrCodeUrl: row.qrCodeUrl,
                id: 'big',
                width: 200,
                height: 200
            }
            this.qr.title = row.name;
            this.qr.isShowDialog = true;
            this.createQrCode(data, true);
        },
        goToSetting: function (row) { //进入设置页面
            if (!row.online) return this.$message({
                message: this.$t('dialog.h37'),
                type: 'warning'
            });
            var url = window._config.server.url;
            sessionStorage.setItem('page', this.page.num);
            sessionStorage.setItem('uuid', row.uniqueCode);
            sessionStorage.setItem('name', row.name);
            window.location.href = url + '/energy/detail' + '?uid=/uuid=' + row.uniqueCode;
        },
        // 二维码
        createQrCode: function (row, type) {
            var id = row.id;
            var url = row.qrCodeUrl;
            var _that = this;
            this.$nextTick(function () {
                this.$refs['qrcode' + id].innerHTML = "";
                var qrcode = new QRCode(_that.$refs['qrcode' + id], {
                    text: url,
                    width: row.width || 50,
                    height: row.height || 50,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                if (type) {
                    this.qr.currentSrc = qrcode._oDrawing._elImage.getAttribute("src");
                }
            })
        },
        // 关闭新增弹窗
        cancelDrawer: function () {
            this.addeEquipment.isShowDialog = false;
            this.addeEquipment.placeValue = '';
            var list = this.addeEquipment.data;
            for (var key in list) {
                this.addeEquipment.data[key] = '';
            }
        },
        // 获取列表
        getAirswitchPage: function (num) {
            var _that = this;
            var page = this.page;
            var data = {
                pageNum: num || page.num,
                pageSize: page.size,
                search: page.search,
                online: page.online
            }

            if(this.page.placeIds.length > 0) {
                data.placeIds = this.page.placeIds.join(",");
            }

            if(this.page.names.length > 0) {
                data.names = this.page.names.join(",");
            }

            if(this.page.uniqueCodes.length > 0) {
                data.uniqueCodes = this.page.uniqueCodes.join(",");
            }

            var loading = this.$loading({
                target: document.querySelector('.container')
            });
            if (num) sessionStorage.setItem('page', 1);
            ajax.handle("post", "api/eastcato/airswitch/page", data, {
                obj: this,
            }, function (res) {
                loading.close();
                console.log(res);
                var data = res.data
                _that.page.count = data.count;
                _that.tableData = data.data;
            }, function (ERR) {
                loading.close();
            });
        },
        // 获取地点
        getAirswitchPlaces: function () {
            var _that = this;
            var param = {
                permissionFlag: "energyList"
            }
            ajax.handle("get", "api/eastcato/airswitch/places", param, {
                obj: this,
            }, function (res) {
                console.log(res);
                var arr = _that.deepCopy(res.data);
                _that.headerSelect.originalPlaces = arr;
                _that.headerSelect.placeItem = _that.jsonTree(arr, {});
            });
        },
        // 切换页码
        changeCurrPageNum: function(val) {
            this.page.num = val;
            sessionStorage.setItem('page', this.page.num);
            this.getAirswitchPage();
        },
        // 筛选地点
        changeNode: function (data, node) {
            // if (node.checked || node.expanded) {
            //     this.page.placeId = data.id;
            //     this.headerSelect.currPlaceName = data.name;
            // } else {
            //     this.page.placeId = '';
            //     this.headerSelect.currPlaceName = '';
            // }
            this.page.placeId = data.id;
            this.headerSelect.currPlaceName = data.name;
            this.getAirswitchPage(1);
            sessionStorage.setItem('page', 1);

        },
        cancelNode: function () {
            this.page.placeId = '';
            this.headerSelect.currPlaceName = '';
            this.getAirswitchPage(1);
            sessionStorage.setItem('page', 1);
        },
        // 选择新增设备的地点
        changeAddNode: function (data) {
            this.addeEquipment.placeValue = data.name;
            this.addeEquipment.data.placeId = data.id;
        },
        cancelAddNode: function () {
            this.addeEquipment.placeValue = "";
            this.addeEquipment.data.placeId = "";
        },
        // 选中设备
        selectEquipment: function (selection, row) {
            var equipmentIds = selection.map(function (val) {
                return val.uniqueCode
            })
            this.deleteEquipment.data.uuids = equipmentIds.join(',')

        },
        // 点击删除
        changeDeleteEquipment: function () {
            if (this.deleteEquipment.data.uuids == null || this.deleteEquipment.data.uuids == "") return this.$message.error('请选择需要删除的设备')
            this.deleteEquipment.isShowDialog = true;
        },
        // 删除设备
        confirmDeleteEquipment: function () {
            var _that = this;
            ajax.handle("POST", "api/eastcato/airswitch/delGatewayByUuids", this.deleteEquipment.data, {
                obj: this,
            }, function (res) {
                _that.getAirswitchPage();
                _that.deleteEquipment.isShowDialog = false;
                _that.$message.success(_that.$t('dialog.h46'));
            }, function (err) {
                _that.deleteEquipment.isShowDialog = false;
                _that.$message.error(_that.$t('dialog.h47'))
            });
        },
        // 确认新增设备
        confirmAddeEquipment: function () {
            if (this.addeEquipment.disable) return;
            var _that = this;
            var data = {};
            var list = this.addeEquipment.data;
            for (var key in list) {
                if (String(list[key]).trim() != '') data[key] = list[key]
            }
            ajax.handle("POST", "api/eastcato/airswitch/addGateway", data, {
                obj: this,
            }, function (res) {
                _that.getAirswitchPage();
                _that.cancelDrawer();
                _that.$message.success(_that.$t('dialog.h38'));
            });
        },
        // 另存
        confirmSave: function () {
            var url = (this.$refs.qrcodebig).getElementsByTagName("img")[0].currentSrc;
            var a = document.createElement('a');
            a.download = this.qr.title;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.qr.isShowDialog = false;
        },
        // 打印
        confirmPrint: function () {
            var url = (this.$refs.qrcodebig).getElementsByTagName("img")[0].currentSrc;
            console.log(printJS);
            printJS({
                printable: url,
                type: 'image',
                header: this.qr.title
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
            }, function (err) {
                _this.$message.error(_this.$t('dialog.h39'));
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
                this.$message.error(this.$t('dialog.h51'));
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

            var paramUrl = _config.server.central + "/api/v3/exportEquipmentLogs";
            paramUrl = $u.concatUrlParam(params, paramUrl);

            //url编码
            paramUrl = encodeURIComponent(paramUrl);

            var url = _config.server.url + "/energy/log/export?url=" + paramUrl;

            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                $u.exportForIE(url, this.$t('dialog.h40'));
            } else {
                $u.openDownload(url);
            }

        },
        deleteLog: function (log) { //删除日志记录
            var _this = this;
            this.$confirm(this.$t('dialog.h41'), this.$t('dialog.h42'), {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
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
            }, function (err) {
                _this.$message.error(_this.$t('dialog.h43'));
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
                _this.$message.success(_this.$t('dialog.h46'));
                _this.getLogData(1);
            });
		},
        /******************************获取离线闪烁uuid列表********************************************* */
        getFlashingEquipmentUuIds: function () {
            var _this = this;
            ajax.handle("get", "api/eastcato/airswitch/getFlashingEquipmentUuIds", {}, null, function (res) {
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
        //跳转到第一页
        toFirstPage: function () {
            this.page.num = 1;
            this.changeCurrPageNum(this.page.num)
            // this.getList();
        },
        //跳转到最后一页
        toLastPage: function () {
            var pageSize = this.page.size;
            var count = this.page.count;
            this.page.num = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1;
            this.changeCurrPageNum(this.page.num)
            // this.getList();
        },
        //跳转到目标页面
        toTargetPage: function () {
            if ($u.isNull(this.page.target)) {
                this.page.target = 1;
            }
            var pageSize = this.page.size;
            var count = this.page.count;
            var maxPage = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1; // 尾页页码
            this.page.target = this.page.target > maxPage ? maxPage : this.page.target;
            this.page.num = this.page.target;
            this.changeCurrPageNum(this.page.num)
            // this.getList();
        },

        /**********************************编辑权限**************************************************/
        showBindControlDialog: function(record) {
            this.permissionDialog.checkedUsers = [];
            this.permissionDialog.record = record;
            this.permissionDialogVisible = true;

            this.getCreator(record, this.initPermissionInfo);
        },
        initPermissionInfo: function() {
            this.listDepartments();
            this.listAllUsers();
            this.getEqmControlPermissionUser();
        },
        getCreator: function(record, callback) {                              //获取设备的创建者
            var uuid = record.uniqueCode;
            if(this.permissionDialog.creatorCache[uuid] != null) {
                this.$set(record, "userId", this.permissionDialog.creatorCache[uuid]);
                if(callback) {
                    callback();
                }
                return;
            }

            var param = {
                uuid: uuid
            }
            var _this = this;
            ajax.handle("GET", "api/eastcato/airswitch/getEqmControlByUuid", param, {
                obj: this,
                lname: "permissionLoading"
            }, function (rs) {
                _this.$set(record, "userId", rs.data.userId);
                _this.permissionDialog.creatorCache[uuid] = rs.data.userId;

                if(callback) {
                    callback();
                }
            }, function(err) {
                if(callback) {
                    callback();
                }
            }, function() {
                if(callback) {
                    callback();
                }
            });
        },
        listDepartments: function() {                         //获取部门列表
            if(this.permissionDialog.hasFetchDepartment) {
                return;
            }

            var _this = this;
            ajax.handle("GET", "api/eastcato/airswitch/getAllDepartment", {}, {
                obj: this,
                lname: "permissionLoading"
            }, function (rs) {
                //添加全部选项
                var data = rs.data;
                data.unshift({
                    name: "全部",
                    id: null,
                    pid: 0
                });
                _this.permissionDialog.departments = data;
                _this.permissionDialog.hasFetchDepartment = true;
            }, function(err) {
                
            });
        },
        listAllUsers: function() {                 //获取全部用户（不包括学生）
            if(this.permissionDialog.hasFetchUser) {
                return;
            }
            var param = {
                pageNum: 0,
                pageSize: 0,
                roleId: "1,2"
            }
            var _this = this;
            ajax.handle("GET", "api/eastcato/airswitch/getUserList", param, {
                obj: this,
                lname: "permissionLoading"
            }, function (rs) {
                _this.permissionDialog.users = rs.data;
                _this.permissionDialog.hasFetchUser = true;

                if(_this.permissionDialog.checkedDeptUserIds.length > 0) {
                    _this.checkDeptUserIds(_this.permissionDialog.checkedDeptUserIds);
                }
            }, function(err) {
                
            });
        },
        /**
		 * 根据父节点id获取子孙列表
		 * @param {*} list 树节点列表
		 * @param {*} pid 父节点id
		 * @param {*} idKey id键名，默认id
		 * @param {*} pidKey pid键名,默认pid
		 */
		listChildrenByPid: function(list, pid, idKey, pidKey) { 
			pid = pid || 0;
			idKey = idKey || "id";
			pidKey = pidKey || "pid";
			
			if(list.length <= 0) {
				return [];
			}
			var descendants = [];            //子孙节点列表
			var children = this.listByKeyValue(list, pidKey, pid);
			for(var i = 0; i < children.length; i++) {
				descendants.push(children[i]);
				var data = this.listChildrenByPid(list, children[i][idKey], idKey, pidKey);
				
				for(var j = 0; j < data.length; j++) {
					descendants.push(data[j]);
				}
			}
			return descendants;
		},
		/**
		 * 根据父节点id获取子孙id列表
		 * @param {*} list 树节点列表
		 * @param {*} pid 父节点id
		 * @param {*} idKey id键名，默认id
		 * @param {*} pidKey pid键名,默认pid
		 */
		listChildrenIdsByPid: function(list, pid, idKey, pidKey) {
			idKey = idKey || "id";
			var children = this.listChildrenByPid(list, pid, idKey, pidKey);
			return children.map(function(el) {
				return el[idKey];
			})
			
		},
        /**
         * 在数组中查找指定key并value相同的对象，并返回数组
         */
        listByKeyValue: function(array,key,value) {
            if(array == null || array == "") {
                return null;
            }
            
            return array.filter(function(ele) {
                    return ele[key] == value;
            })
        },
        /**
         * 在数组中查找指定key并value相同的对象，并返回第一个查找到的
         */
        findByKeyValue: function(array,key,value) {
            var list = this.listByKeyValue(array, key, value);
            return list == null || list.length <= 0 ? null : list[0];
        },
        changePermissonDept: function(data, node) {
            if(data.id == null) {
                this.permissionDialog.selectDepartment = null;
                return;
            }

            this.permissionDialog.selectDepartment = data;
        },
        isCreator: function(userId) {                     //是否创建者
            if(this.permissionDialog.record == null) {
                return false;
            }

            if(userId == null) {
                return false;
            }

            return this.permissionDialog.record.userId == userId;
        },
        getEqmControlPermissionUser: function(device) {             //获取已绑定权限的用户列表
            device = device || this.permissionDialog.record;
            var param = {
                propertyId: device.id,
                uuid: device.uniqueCode
            }
            var _this = this;
            ajax.handle("GET", "api/eastcato/airswitch/getEqmControlPermissionUser", param, {
                obj: this,
                lname: "permissionLoading"
            }, function (rs) {
                var data = rs.data;
                data = data.map(function(el) {
                    el.isCreator = _this.isCreator(el.id);
                    return el;
                })
                .sort(function(a, b) {
                    //创建者排最前
                    var weightA = a.isCreator ? 1 : 0;
                    var weightB = b.isCreator ? 1 : 0;
                    return weightB - weightA;
                });
                _this.permissionDialog.checkedUsers = data;

                var ids = data.map(function(el) {
                    return el.id;
                })
                _this.checkDeptUserIds(ids);
            }, function(err) {

            });
        },
        changeDeptUsersCheck: function(value) {                  //更新部门用户勾选选择
            var checked = this.listUsersByIds(value);
            this.permissionDialog.checkedUsers = checked;
            this.autoCheckDepartmentTree(value);
        },
        listUsersByIds: function(ids) {            //根据用户id获取用户列表
            var users = [];
            for(var i = 0; i < ids.length; i++) {
                var find = this.findByKeyValue(this.permissionDialog.users, "id", ids[i]);
                if(find != null) {
                    users.push(find);
                }
            }
            return users;
        },
        checkDeptUserIds: function(ids) {              //选中部门用户id
            this.permissionDialog.checkedDeptUserIds = ids;
            this.autoCheckDepartmentTree(ids);
        },
        autoCheckDepartmentTree: function(ids) {               //自动勾选树节点
            var _this = this;
            //选中树节点
            var users = this.listUsersByIds(ids);
            //获取用户部门列表
            var depIds = users.filter(function(user) {
                return !_this.isCreator(user.id);
            }).map(function(user) {
                return user.depId;
            })
            .filter(function(depId) {
                return depId != null;
            })
            .sort();
            var _this = this;
            this.$nextTick(function() {
               var checkedKeys = _this.$refs.permissionTree.getCheckedKeys();
               //取消选中的
               checkedKeys.forEach(function(el) {
                _this.$refs.permissionTree.setChecked(el, false);
               })

               //选中该选中的
               depIds.forEach(function(el) {
                   _this.$refs.permissionTree.setChecked(el, true);
               })
            })
        },
        removeCheckedUser: function(user) {              //移除选中的用户
            this.permissionDialog.checkedUsers.splice(this.permissionDialog.checkedUsers.indexOf(user), 1);
            var index = this.permissionDialog.checkedDeptUserIds.indexOf(user.id);
            if(index == -1) {
                return;
            }
            this.permissionDialog.checkedDeptUserIds.splice(index, 1);
            this.checkDeptUserIds(this.permissionDialog.checkedDeptUserIds);

        },
        handlePermissionDeptCheck: function(data, obj) {               //处理勾选部门树节点
            var isChecked = obj.checkedKeys.indexOf(data.id) != -1;
            //获取部门id
            var users = this.permissionDialog.users.filter(function(el) {
                if(el.depId != null) {
                    return el.depId == data.id;
                }
                var depIds = el.depIds;
                if(depIds == null || depIds == "") {
                    return false;
                }

                var depArr = depIds.split(",");
                console.log(depArr, data.id, depArr.indexOf(data.id + "") != -1);
                return depArr.indexOf(data.id + "") != -1;
            });

            var _this = this;
            users.forEach(function(el) {
                var index1 = _this.permissionDialog.checkedDeptUserIds.indexOf(el.id);
                var find = _this.findByKeyValue(_this.permissionDialog.checkedUsers, "id", el.id);
                //勾选
                if(isChecked) {
                    if(index1 == -1) {
                        _this.permissionDialog.checkedDeptUserIds.push(el.id);
                    }

                    if(find == null) {
                        _this.permissionDialog.checkedUsers.push(el);
                    }
                    return;
                }

                //如果是创建人，则不取消勾选
                if(_this.isCreator(el.id)) {
                    return;
                }

                if(index1 != -1) {
                    _this.permissionDialog.checkedDeptUserIds.splice(index1, 1);
                }

                if(find != null) {
                    _this.permissionDialog.checkedUsers.splice(_this.permissionDialog.checkedUsers.indexOf(find), 1);
                }

            })
        },
        confirmPermission: function() {
            var userIds = this.permissionDialog.checkedUsers.map(function(el) {
                return el.id;
            }).join(",");

            var param = {
                userIds: userIds,
                propertyId: this.permissionDialog.record.id,
                uuid: this.permissionDialog.record.uniqueCode
            };

            var _this = this;
            ajax.handle("POST", "api/eastcato/airswitch/bindEqmControlPermission", param, {
                obj: this,
                lname: "permissionLoading"
            }, function (rs) {
                _this.$message.success(_this.$t('dialog.h44'));
                _this.permissionDialogVisible = false;
            }, function(err) {
                console.log(err);
                _this.$message.error(err.msg || _this.$t('dialog.h45'));
            });

        },
        /*********************************警报策略************************************************** */
        showWarningStrategy: function(record) {
            this.warningStrategy.record = record;

            //获取全部预警策略
            if(this.warningStrategy.alertStrategies == null) {
                this.warningStrategy.alertStrategies = [];
                this.listAlertStrategies();
            }
            this.warningStrategy.isAll = false;
            this.getWarningStrategy();
            this.warningStrategy.show = true;
        },
        listAlertStrategies: function() {
            var _this = this;
            ajax.handle("GET", "api/eastcato/airswitch/listAlertStrategies", {}, null, function(rs) {
                _this.$set(_this.warningStrategy, "alertStrategies", rs.data);
            })
        },
        confirmSetwWarningStrategy: function() {
            var param = {
                uuid: this.warningStrategy.record.uniqueCode,
                warningStrategy: this.warningStrategy.warningStrategy,
                cutoffStrategy: this.warningStrategy.cutoffStrategy,
                isAll: this.warningStrategy.isAll
            }
            var _this = this;
            ajax.handle("POST", "api/eastcato/airswitch/updateWarningStrategy", param, {obj: this, lname: "warningStrategy.loading"}, function(rs) {
                _this.$message.success(_this.$t('p300'));
                _this.warningStrategy.show = false;
            })
        },
        getWarningStrategy: function() {
            var param = {
                uuid: this.warningStrategy.record.uniqueCode
            }

            var _this = this;
            ajax.handle("GET", "api/eastcato/airswitch/getWarningStrategy", param, {obj: this, lname: "warningStrategy.loading"}, function(rs) {
                var data = rs.data;
                _this.warningStrategy.warningStrategy = data.warningStrategy;
                _this.warningStrategy.cutoffStrategy = data.cutoffStrategy;
            })
        },
        getEquipmentList: function() {
            var _this = this;
            ajax.handle("GET", "api/eastcato/airswitch/equipments/list", {},  null, function(rs) {
                var data = rs.data;
                _this.headerSelect.originalEqms = rs.data;
            })
        }

    },
    watch: {
        add: { //监听的对象
            deep: true, //深度监听设置为 true
            handler: function (val) {
                if (val.name.trim() != '' && val.uniqueCode.trim() != '') {
                    this.addeEquipment.disable = false;
                } else {
                    this.addeEquipment.disable = true;
                }
            }
        },
        search: function () {
            this.searchDebounce();
        },
    },
    filters: {

    },
    directives: {

    },
})