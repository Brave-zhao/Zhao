var ajax = new Ajax(_config);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    data: {
        searchDebounce: null, // 防抖
        equipmentList: [], // 设备列表
        currRowDetail: {},
        headerSelect: {
            placeValue: '',
            boxValue: '',
        },
        mode: {
            isShowDialog: false, // 修改模式
            description: '', // 描述
            open: false
        },
        tableData: [],
        page: {
            size: 10,
            count: 0,
            num: 1,
            search: '',
            uuid: sessionStorage.getItem('uuid')
        },
        checkList: ['选中且禁用', '复选框 A']
    },
    created: function () {
        this.initData();
        this.getPageModes();
        this.getListAirSwitchs();
    },
    mounted: function () {
        this.headerSelect.placeValue = sessionStorage.getItem('name');
        window.socketApi.sendSock(null, function (data) {
            // 下线
            if (data.type == 'offline' && data.uuid == sessionStorage.getItem('uuid')) {
                var url = window._config.server.url;
                window.location.href = url + '/energy/manage';
            }
        })
    },
    computed: {
        search: function () {
            return this.page.search;
        },
    },
    methods: {
        formatter: function (row, column, cellValue, index) {
            if (cellValue == null || cellValue == undefined || cellValue === '') return '无';
            return cellValue;
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
        initData: function () {
            this.searchDebounce = this.debounce(function () {
                this.getPageModes(1);
            }, 600)
        },
        changeBack: function () {
            window.history.back();
        },
        modeDetail: function (row) {
            var closeDeviceDetails = row.closeDeviceDetails;
            var openDeviceDetails = row.openDeviceDetails;
            var details = [];
            openDeviceDetails.forEach(function (el) {
                details.push(el + '<span class="table-separator">1</span>')
            });
            closeDeviceDetails.forEach(function (el) {
                details.push(el + '<span class="table-separator">0</span>')
            });
            var text = details.join('');
            return text ? "<div class='table-detail-box'>" + text + "</div>" : '无';
        },
        // 切换页码
        changeCurrPageNum: function (val) {
            this.page.num = val;
            this.getPageModes();
        },
        // 点击表格中的编辑
        changeEdit: function (row) {
            this.getModeDetail(row);
        },
        // 获取模式列表
        getPageModes: function (num) {
            var _that = this;
            var page = this.page;
            var data = {
                pageNum: num || page.num,
                pageSize: page.size,
                search: page.search,
                uuid: page.uuid
            }
            var loading = this.$loading({
                target: document.querySelector('.container')
            });
            if (num) sessionStorage.setItem('page', 1);
            ajax.handle("get", "api/eastcato/airswitch/pageModes", data, {
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
        // 修改模式
        undateMode: function () {
            var list = this.equipmentList;
            var open = [],
                close = [],
                _that = this;
            list.forEach(function (item) {
                if (item.isChecked) item.status ? open.push(item.uuid) : close.push(item.uuid);
            });
            var loading = this.$loading({
                target: document.querySelector('.container')
            });
            var data = {
                uuid: sessionStorage.getItem('uuid'),
                id: this.currRowDetail.id,
                description: this.currRowDetail.description,
                openDevices: open.join(','),
                closeDevices: close.join(',')
            }
            ajax.handle("post", "api/eastcato/airswitch/updateMode", data, {
                obj: this,
            }, function (res) {
                loading.close();
                _that.mode.isShowDialog = false;
                _that.getPageModes();
            }, function (err) {
                loading.close();
                _that.$message.error(err.msg);
                _that.mode.isShowDialog = false;
            });
        },
        // 获取模式详情
        getModeDetail: function (row) {
            var _that = this;
            let data = {
                uuid: sessionStorage.getItem('uuid'),
                modeId: row.id
            }
            var loading = this.$loading({
                target: document.querySelector('.container')
            });
            ajax.handle("get", "api/eastcato/airswitch/getModeDetail", data, {
                obj: this,
            }, function (res) {
                loading.close();
                console.log(res);
                _that.currRowDetail = res.data;
                _that.turnListData(res.data);
                _that.mode.isShowDialog = true;
            }, function (err) {
                _that.$message.error(err.msg);
                loading.close();
            });
        },
        // 转换设备列表
        turnListData: function (data) {
            var _that = this;
            var list = this.equipmentList; // 设备列表
            var open = data.openDevices ? data.openDevices.split(',') : []; // 开 id
            var close = data.closeDevices ? data.closeDevices.split(',') : []; // 关 id
            list.forEach(function (el) {
                var openIndex = open.indexOf(el.uuid);
                var closeIndex = close.indexOf(el.uuid);
                var isChecked = openIndex != -1 || closeIndex != -1; // open包含或者close包含则为选中
                var status = false;
                if (isChecked) {
                    status = openIndex != -1 ? true : false; // open包含则打开
                }
                _that.$set(el, "isChecked", isChecked);
                _that.$set(el, "status", status);

            });
        },
        // 获取所有设备列表
        getListAirSwitchs: function (row) {
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
                _that.equipmentList = res.data;
            }, function (err) {
                _that.$message.error(err.msg);
            });
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