var ajax = new Ajax(_config);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    data: {
        searchDebounce: null, // 防抖
        warningData: [],
        headerSelect: {
            placeValue: '',
            boxValue: '',
        },
        tableData: [],
        page: {
            size: 8,
            count: 0,
            num: 1,
            search: ''
        },
        security: { // 安全
            isShowDialog: false,
            currRowValue: '',
            data: {
                enableOverTemperature: {
                    text: '过温保护使能',
                    value: false
                },
                overTemperatureAlarm: {
                    text: '过温报警值(℃)',
                    value: ''
                },
                overTemperaturePowerOff: {
                    text: '过温断电值(℃)',
                    value: ''
                },
                enableOvercurrent: {
                    text: '过流保护使能',
                    value: false
                },
                overcurrentAlarm: {
                    text: '过流报警值(A)',
                    value: ''
                },
                overcurrentPowerOff: {
                    text: '过流断电值(A)',
                    value: ''
                },
                enableOvervoltage: {
                    text: '过压保护使能',
                    value: false
                },
                overvoltageAlarm: {
                    text: '过压报警值(V)',
                    value: ''
                },
                overvoltagePowerOff: {
                    text: '过压断电值(V)',
                    value: ''
                },
                enableUndervoltage: {
                    text: '欠压保护使能',
                    value: false
                },
                undervoltageAlarm: {
                    text: '欠压报警值',
                    value: ''
                },
            }
        },
        timing: { // 定时
            isShowDialog: false,
            week: [], // 星期的值
            date: '', // 日期的值
            dateCheckbox: false,
            isShowDatePicker: false,
            dateList: [{
                    text: '周一',
                    value: 1
                },
                {
                    text: '周二',
                    value: 2
                },
                {
                    text: '周三',
                    value: 3
                },
                {
                    text: '周四',
                    value: 4
                },
                {
                    text: '周五',
                    value: 5
                },
                {
                    text: '周六',
                    value: 6
                },
                {
                    text: '周日',
                    value: 7
                },
            ],
            time: new Date(2016, 9, 10, 00, 00), // 时间的值
            equipment: [], // 选中的设备
            equipmentList: [],
            operation: 1, // 开关的值
            everyday: 0,
            name: ''
        },
        updateName: { // 名称
            isShowDialog: false,
            name: '',
            currRowValue: {}
        },
        warning: { // 预警
            isShowDialog: false,
            tableData: [],
            rowUuid: ''
        },


        testCheckboxModel: false,
        testInputModel: 0,
        warningFlashingConfig: null,                     //警报闪烁配置
    },
    created: function () {
        var num = sessionStorage.getItem('detailPage');
        if (num != null) {
            this.page.num = Number(num);
        }
        this.getListAirSwitchs(); // 设备列表
    },
    mounted: function () {
        this.initData();
        this.headerSelect.placeValue = sessionStorage.getItem('name');
        var _that = this;
        this.getListDevicesWarnCount(); // 预警信息
        window.socketApi.sendSock(null, function (data) {
            console.log(data);
            var obj = {};
            if (data.type == 'protection_alarm') {
                obj = data.data;
                obj.uuid = data.subUuid;
                if (_that.warningData.length <= 0) {
                    _that.warningData.push(obj);
                } else {
                    _that.warningData.forEach(function (el) {
                        if (el.uuid != data.subUuid) _that.warningData.push(obj)
                    });
                }
                _that.getListDevicesWarnCount();
            }
            if (data.type == 'change_protection') {
                _that.warningData.forEach(function (el, index) {
                    if (el.uuid == data.subUuid) _that.warningData.splice(index, 1);
                });
                _that.getListDevicesWarnCount();
            }
            // 下线
            if (data.type == 'offline' && data.uuid == sessionStorage.getItem('uuid')) {
                var url = window._config.server.url;
                window.location.href = url + '/energy/manage';
            }
            if (data.type == 'change_device_info') return _that.getListAirSwitchs();
        });

        //获取警报闪烁配置
        this.getWarningFlashing();
    },
    computed: {
        search: function () {
            return this.page.search;
        },
        safetyAlarmFlashing: function() {                  //预警是否闪烁
            if(this.warningFlashingConfig == null) {
                return true;
            }
            return this.warningFlashingConfig.airswitchSafetyAlarm;
        },
        powerOffAlarmFlashing: function() {                  //断电警报是否闪烁
            if(this.warningFlashingConfig == null) {
                return true;
            }

            return this.warningFlashingConfig.airswitchPowerOffAlarm;
        }
    },
    methods: {
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
        initData: function () {
            this.searchDebounce = this.debounce(function () {
                // console.log(this.page);
                this.getListAirSwitchs(1);
            }, 600)
        },
        switchControl: function (row) {
            this.switchPower(row.uuid, Number(!row.relayStatus));
        },
        /**
         * 
         * @param {*} index 当前行下标
         * @param {*} row 当前行
         * @param {*} type 0=>安全管理 1=>解除预警 2=>定时管理 3=>更改名称
         */
        changeInfo: function (row, type) {
            var _that = this;
            if (type.property == 'relayStatus') return;
            if (type == 0) {
                this.security.currRowValue = row;
                this.getQueryWarnInfo(row.uuid, true); // 获取安全管理数据
                return;
            }
            if (type == 1) {
                this.warning.rowUuid = row.uuid;
                this.disarmAlarm();
                return;
            }
            if (type == 2) {
                this.timing.isShowDialog = true;
                this.timing.equipmentList = [row];
                this.timing.equipment.push(row.uuid);
                return;
            }
            if (type == 3) {
                this.updateName.currRowValue = row;
                this.updateName.name = row.name;
                this.updateName.isShowDialog = true;
                this.$nextTick(function () {
                    _that.$refs.updateName.focus();
                })
            }
        },
        warningShowpolice: function (id, key, type) {
            var _that = this;
            var ids = [];
            var offids = [];
            _that.warningData.forEach(function (el) {
                var offkey = (key.replace('Alarm', '')) + 'PowerOff';
                if (el.uuid == id && el[key]) ids.push(el.uuid);
                if (el.uuid == id && (el[offkey] || key == 'overvoltageAlarm' && el['undervoltageAlarm'])) offids.push(el.uuid);
            });
            if (offids.length > 0 && offids.indexOf(id) != -1 && this.powerOffAlarmFlashing) return 'showpolice-off';
            if (ids.length > 0 && ids.indexOf(id) != -1 && this.safetyAlarmFlashing) return 'showpolice';
            return '';
        },
        // 预警信息的解除预警按钮
        warningButton: function (id, key, type) {
            var _that = this;
            var ids = [];

            _that.warningData.forEach(function (el) {
                for (var key in el) {
                    if (key != 'uuid' && el[key]) ids.push(el.uuid);
                }
            });
            if (key == 'text') {
                if (ids.length > 0 && ids.indexOf(id) != -1) {
                    return '解除预警'
                } else {
                    return '正常'
                }
            } else {
                if (ids.length > 0 && ids.indexOf(id) != -1) {
                    return '#F6494A'
                } else {
                    return '#43B498'
                }
            }
        },
        // 获取路由参数
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURI(r[2]);
            return null;
        },
        // 日期切换
        changeDatepicker: function (val) {
            this.timing.dateCheckbox = true;
        },
        // 多选
        changeCheckBox: function (val) {
            if (!val) this.timing.date = ''
        },
        // 根据预警次数显示不同颜色和文字的按钮
        warningButtonStyleOrText: function (row, type) {
            if (type == 'text') {
                if (row.overTemperatureAlarmCount > 0 || row.overvoltageAlarmCount > 0 || row.overcurrentCount > 0) {
                    return '解除预警';
                } else {
                    return '正常';
                }
            } else if (type == '') {
                if (row > 0) {
                    return '#F6494A';
                } else {
                    return '#43B498'
                }
            } else {
                if (row.overTemperatureAlarmCount > 0 || row.overvoltageAlarmCount > 0 || row.overcurrentCount > 0) {
                    return '#F6494A';
                } else {
                    return '#43B498'
                }
            }
        },
        /**
         * 
         * @param {*} type 0=>预警信息 1=> 定时管理 2=> 模式管理
         */
        changeScreenButton: function (type) {
            if (type == 0) this.warning.isShowDialog = true;
            if (type == 1) {
                var url = window._config.server.url;
                sessionStorage.setItem('detailPage', this.page.num);
                window.location.href = url + '/energy/timing?place=' + this.headerSelect.placeValue;
            }
            if (type == 2) {
                var url = window._config.server.url;
                sessionStorage.setItem('detailPage', this.page.num);
                window.location.href = url + '/energy/mode?place=' + this.headerSelect.placeValue;
            }
        },
        changeBack: function () {
            window.history.back();
        },
        // 获取设备列表
        getListAirSwitchs: function (num) {
            var _that = this;
            var data = {
                uuid: sessionStorage.getItem('uuid'),
                getDetails: true,
                pageNum: num || this.page.num,
                pageSize: this.page.size,
                search: this.page.search
            }
            if (num) sessionStorage.setItem('detailPage', this.page.num);
            ajax.handle("get", "api/eastcato/common/pageAirSwitchs", data, {
                obj: this,
            }, function (res) {
                console.log(res);
                _that.tableData = res.data.data;
                _that.page.count = res.data.count;
            });
        },
        // 切换页码
        changeCurrPageNum: function (val) {
            this.page.num = val;
            sessionStorage.setItem('detailPage', this.page.num);
            this.getListAirSwitchs();
        },
        // 获取预警信息
        getListDevicesWarnCount: function () {
            var _that = this;
            ajax.handle("get", "api/eastcato/common/listDevicesWarnCount", {
                uuid: sessionStorage.getItem('uuid')
            }, {
                obj: this,
            }, function (res) {
                console.log(res);
                _that.warning.tableData = res.data;
            });
        },
        // 解除警报
        disarmAlarm: function () {
            var _that = this;
            var loading = this.$loading({
                target: document.querySelector('.container')
            });
            ajax.handle("POST", "api/eastcato/common/disarmAlarm", {
                uuid: this.warning.rowUuid
            }, {
                obj: this,
            }, function (res) {
                loading.close();
                console.log(res);
                _that.getListDevicesWarnCount();
                _that.getListAirSwitchs();
                _that.warning.isShowDialog = false;
                _that.$message.success('解除警报成功')
            }, function (err) {
                if(err.msg) {
                    _that.$message.error(err.msg)
                }
                loading.close();
                _that.warning.isShowDialog = false;
            });
        },
        // 点击预警信息的解除预警
        changeInfoButton: function (text, row) {
            // console.log(text, row);
            if (text == 'warning') {
                this.warning.rowUuid = row.uuid;
                this.disarmAlarm();
            }
        },
        // 获取当前设备安全设置
        getQueryWarnInfo: function (uuid, type) {
            var _that = this;
            var loading = this.$loading({
                target: document.querySelector('.container')
            });
            ajax.handle("get", "api/eastcato/common/queryWarnInfo", {
                uuid: uuid
            }, {
                obj: this,
            }, function (res) {
                loading.close();
                if (type) {
                    _that.security.isShowDialog = true;
                } else {
                    _that.security.isShowDialog = false;
                }
                for (var key in res.data) {
                    for (var val in _that.security.data) {
                        if (key == val) {
                            _that.security.data[val].value = res.data[key];
                        }
                    }
                }
            }, function (err) {
                if(err.msg) {
                    _that.$message.error(err.msg)
                }
                _that.security.isShowDialog = false;
                loading.close();
            });
        },
        // 新增定时
        addTiming: function () {
            var _that = this;
            var timing = this.timing;
            var data = {
                uuid: sessionStorage.getItem('uuid'),
                deviceIds: timing.equipment.join(','),
                time: moment(timing.time).format('HH:mm:ss'),
                opCode: timing.operation,
                date: timing.date || -1,
                weeks: timing.week.join(',') || -1,
                everyday: Number(timing.everyday) || -1,
                name: timing.name
            }
            for (var key in data) {
                if (data[key] == -1) delete data[key];
            }
            if (timing.week.length <= 0 && !data.everyday && !data.date) return this.$message({
                message: this.$t('dialog.h32'),
                type: 'warning'
            })
            if (data.name.trim() == '') return this.$message({
                message: this.$t('dialog.h33'),
                type: 'warning'
            })
            if (data.deviceIds == '') return this.$message({
                message: this.$t('dialog.h34'),
                type: 'warning'
            })
            ajax.handle("POST", "api/eastcato/common/addTiming", data, {
                obj: this,
            }, function (res) {
                _that.$message.success(_that.$t('dialog.h35'));
                _that.timing.isShowDialog = false;
                _that.refreshTimingRequestData();
            }, function (err) {
                _that.$message.error(err.msg || _that.$t('dialog.h36'));
                _that.timing.isShowDialog = false;
            });
        },
        refreshTimingRequestData: function () {
            var list = this.timing;
            var arr = [{
                key: 'equipment',
                value: []
            }, {
                key: 'date',
                value: ''
            }, {
                key: 'week',
                value: []
            }, {
                key: 'everyday',
                value: 0
            }, {
                key: 'operation',
                value: 1
            }, {
                key: 'time',
                value: new Date(2016, 9, 10, 00, 00)
            }, {
                key: 'dateCheckbox',
                value: false
            }];
            for (var key in list) {
                arr.forEach(function (el) {
                    if (key == el.key) list[key] = el.value;
                });
            }
        },
        // 修改名称
        confirmUpdateName: function () {
            var _that = this;
            var data = {
                uuid: this.updateName.currRowValue.uuid,
                name: this.updateName.name.trim(),
                buttonId: this.updateName.currRowValue.buttonId
            };
            if (data.name.trim() == '') return _that.$message.error(_that.$t('dialog.h37'))
            ajax.handle("POST", "api/eastcato/common/updateName", data, {
                obj: this,
            }, function (res) {
                _that.getListAirSwitchs();
                _that.getListDevicesWarnCount();
                _that.updateName.isShowDialog = false;
                _that.$message.success(_that.$t('dialog.h38'))
            }, function (err) {
                _that.updateName.isShowDialog = false;
                _that.$message.error(err.msg || _that.$t('dialog.h39'))
            });
        },
        // 控制开关
        switchPower: function (uuid, opCode) {
            var _that = this;
            var data = {
                uuid: uuid,
                opCode: opCode,
            };
            ajax.handle("POST", "api/eastcato/common/switchPower", data, {
                obj: this,
            }, function (res) {
                _that.getListAirSwitchs();
                _that.$message.success(_that.$t('dialog.h40'))
            });
        },
        // 修改安全设置
        confirmSetWarnInfo: function () {
            var list = this.security.data;
            var data = {
                uuid: this.security.currRowValue.uuid
            };
            for (var key in list) {
                data[key] = list[key].value
                if (typeof list[key].value == "string") data[key] = Number(list[key].value)
            }
            var _that = this;
            ajax.handle("POST", "api/eastcato/common/setWarnInfo", data, {
                obj: this
            }, function (res) {
                _that.getQueryWarnInfo(_that.security.currRowValue.uuid);
                _that.$message.success(_that.$t('dialog.h40'));
                _that.security.isShowDialog = false;
            }, function (err) {
                _that.security.isShowDialog = false;
            });
        },
        getWarningFlashing: function() {                               //获取闪烁配置
            var _this = this;
            ajax.handle("GET", "api/eastcato/airswitch/getWarningFlashing", {}, null, function (res) {
                _this.warningFlashingConfig = res.data;
            });
        },
        getBtnTextByRelayStatus: function(record) {                //根据当前的开关状态和指令列表显示
            var isOpen = record.relayStatus == 1;
            var instructList = record.instructList || [];
            var label = isOpen ? "on" : "off";
            var find = this.findByKeyValue(instructList, "label", label);
            return  find == null ? label.toUpperCase() : find.name;
        },
        /**
         * 在数组中查找指定key并value相同的对象，并返回第一个查找到的
         */
        findByKeyValue: function(array, key, value) {
            if(array == null) {
                return null;
            }
            for(var i = 0; i < array.length; i++) {
                if(array[i][key] == value) {
                    return array[i];
                }
            }
            return null;
        },

    },
    watch: {
        search: function () {
            this.searchDebounce();
        }
    },
    filters: {

    },
    directives: {

    },
})