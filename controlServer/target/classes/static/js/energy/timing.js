var ajax = new Ajax(_config);
var $i = $i18n.obj;
var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    data: {
        chnNumChar: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
        chnUnitSection: ["", "万", "亿", "万亿", "亿亿"],
        chnUnitChar: ["", "十", "百", "千"],
        placeValue: '',
        timing: { // 定时
            isShowDialog: false,
            week: [],
            date: '',
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
            time: new Date(2016, 9, 10, 00, 00),
            equipment: [],
            equipmentList: [],
            operation: 1,
            everyday: 0,
            deleteTiming: false,
            currRowValue: {},
            name: ''
        },
        tableData: [],
        page: {
            size: 8,
            count: 0,
            num: 1,
            search: ''
        }
    },
    created: function () {
        // console.log(1);
    },
    mounted: function () {
        this.placeValue = sessionStorage.getItem('name');

        window.socketApi.sendSock(null, function (data) {
            // 下线
            if (data.type == 'offline' && data.uuid == sessionStorage.getItem('uuid')) {
                var url = window._config.server.url;
                window.location.href = url + '/energy/manage';
            }
        })

        this.getListAirSwitchs();
        this.getListTimings();
    },
    computed: {

    },
    methods: {
        tableRowClassName(row, index) {
            //把每一行的索引放进row
            this.$set(row.row, 'index', Number(row.rowIndex) + 1);
        },
        // #region 数字转中文
        numberToChinese: function (num) {
            var unitPos = 0;
            var strIns = '',
                chnStr = '';
            var needZero = false;

            if (num === 0) {
                return this.chnNumChar[0];
            }

            while (num > 0) {
                var section = num % 10000;
                if (needZero) {
                    chnStr = this.chnNumChar[0] + chnStr;
                }
                strIns = this.sectionToChinese(section);
                strIns += (section !== 0) ? this.chnUnitSection[unitPos] : this.chnUnitSection[0];
                chnStr = strIns + chnStr;
                needZero = (section < 1000) && (section > 0);
                num = Math.floor(num / 10000);
                unitPos++;
            }

            return chnStr;
        },
        sectionToChinese: function (section) {
            var strIns = '',
                chnStr = '';
            var unitPos = 0;
            var zero = true;
            while (section > 0) {
                var v = section % 10;
                if (v === 0) {
                    if (!zero) {
                        zero = true;
                        chnStr = this.chnNumChar[v] + chnStr;
                    }
                } else {
                    zero = false;
                    strIns = this.chnNumChar[v];
                    strIns += this.chnUnitChar[unitPos];
                    chnStr = strIns + chnStr;
                }
                unitPos++;
                section = Math.floor(section / 10);
            }
            return chnStr;
        },
        // #endregion
        // 时间筛选
        changeDatepicker: function (val) {
            this.timing.dateCheckbox = true;
        },
        // 日期筛选
        changeCheckBox: function (val) {
            if (!val) this.timing.date = ''
        },
        // 定时时间
        currTiminWeek: function (row) {
            var _that = this;
            var weekStr = row.weeks;
            var arr = [];
            if (weekStr != null) {
                var weekArr = weekStr.split(',');
                arr = weekArr.map(function (el) {
                    return el == 7 ? '周日' : '周' + _that.numberToChinese(Number(el));
                })
            }
            if (row.everyday) {
                arr.push('每天')
            }
            if (row.date) {
                arr.push(row.date)
            }
            return arr.join('、')
        },
        // 设备名称
        currAirSwitchsName: function (row) {
            var list = this.timing.equipmentList;
            var deviceIds = row.deviceIds.split(',');
            var arr = [];
            list.forEach(function (el) {
                deviceIds.forEach(function (id) {
                    if (el.uuid == id) arr.push(el.name);
                });
            });
            return arr.join(' ');
        },
        changeBack: function () {
            window.history.back();
        },
        // 获取路由参数
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURI(r[2]);
            return null;
        },
        // 切换页码
        changeCurrPageNum(val) {
            this.page.num = val;
            // sessionStorage.setItem('page', this.page.num);
            this.getListTimings();
        },
        // 获取定时列表
        getListTimings: function () {
            var _that = this;

            var data = {
                uuid: sessionStorage.getItem('uuid'),
                pageNum: this.page.num,
                pageSize: this.page.size
            }
            var loading = this.$loading({
                target: document.querySelector('.container')
            });
            ajax.handle("get", "api/eastcato/common/pageTimings", data, {
                obj: this,
            }, function (res) {
                loading.close();
                console.log(res);
                _that.tableData = res.data.data;
                _that.page.count = res.data.count;
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
                message: this.$t('dialog.h23'),
                type: 'warning'
            })
            if (data.name.trim() == '') return this.$message({
                message: this.$t('dialog.h24'),
                type: 'warning'
            })
            if (data.deviceIds == '') return this.$message({
                message: this.$t('dialog.h25'),
                type: 'warning'
            })

            ajax.handle("POST", "api/eastcato/common/addTiming", data, {
                obj: this,
            }, function (res) {
                _that.$message.success(_that.$t('dialog.h26'));
                _that.timing.isShowDialog = false;
                _that.getListTimings();
                _that.refreshTimingRequestData();
            }, function (err) {
                _that.$message.error(err.msg || _that.$t('dialog.h27'))
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
        // 获取设备列表
        getListAirSwitchs: function () {
            var _that = this;
            var data = {
                uuid: sessionStorage.getItem('uuid'),
                getDetails: true
            }
            var loading = this.$loading({
                target: document.querySelector('.container')
            });
            ajax.handle("get", "api/eastcato/common/listAirSwitchs", data, {
                obj: this,
            }, function (res) {
                loading.close();
                console.log(res);
                _that.timing.equipmentList = res.data;
            });
        },
        // 点击删除
        changeDelete: function (row, column, cell) {
            if (column.label == '操作') {
                this.timing.deleteTiming = true;
                // console.log(row, column, cell);
                this.timing.currRowValue = row;
            }
        },
        // 确认删除
        confirmDeleteTiming: function () {
            var _that = this;
            ajax.handle("POST", "api/eastcato/common/deleteTiming", {
                id: this.timing.currRowValue.id
            }, {
                obj: this,
            }, function (res) {
                _that.$message.success(_that.$t('dialog.h28'))
                _that.timing.deleteTiming = false;
                _that.getListTimings();
            }, function (err) {
                _that.$message.error(err.msg || _that.$t('dialog.h29'))
                _that.timing.deleteTiming = false;
            });
        }
    },
    watch: {

    },
    filters: {

    },
    directives: {

    },
})