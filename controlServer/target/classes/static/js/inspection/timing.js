var ajax = new Ajax(_config);
var PAGE_NAME = "inspectionTiming";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i,
    computed: {
        weekOptions: function() {
            var weeks = this.$t("p24");
            var options = [];
            for(var i = 0; i < weeks.length; i ++) {
                options.push({
                    label: weeks[i],
                    value: (i + 1) + ""
                })
            }
            return options;
        },
        timingTypeOptions: function() {       //定时类型选择
            return [{
                value: "all",
                label: this.$t("p25")
            }, {
                value: "place",
                label: this.$t("p26")
            }, {
                value: "propertyType",
                label: this.$t("p27")
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
            weeks: [],        //星期选择,
            everyday: false,    //是否每天
            otherDate: false,    //是否选中其他日期
            date: null,        //其他日期
            name: "",         //名称
            time: "00:00:00",         //时间
            placeIds: [],     //所选地点id
            propertyTypeIds: [],       //所选资产类型ids 
            type: "all",
            placeData: [],             //地点列表
            propertyTypes: []        //资产类型列表
        },
        editDialogVisible: false,
        editLoading: false
    },
    mounted: function() {
        this.getTableData(1);
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
        formatPeriodText: function(row) {                   //格式化周期文本
            var _this = this;
            var array = [];
            if(row.weeks) {
                var weekTexts = row.weeks.split(",")
                    .map(function(week) {
                        var find = _this.$global.findByKeyValue(_this.weekOptions, "value", week);
                        if(find == null) {
                            return null;
                        }
                        return find.label;
                    })
                    .filter(function(week) {
                        return week != null;
                    });
                array = array.concat(weekTexts);
            }
            if(row.everyday) {
                array.push(this.$t("p15"))
            }

            if(row.date) {
                array.push(row.date);
            }
            return array.join("、");
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
            }
            
            ajax.handle("get", "/api/inspection/timings/page", data, loading, function(rs) {
                //添加是否启用标识
                var data = rs.data.data;
                data = data.map(function(el) {
                    el.enable = el.status == 1;
                    return el;
                });
                _this.tableData = data;
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
        //#region 删除
        singleDelete: function(record) {
            this.deleteConfirm([record]);
        },
        multiDelete: function() {
            if(this.tableCheck.length <= 0) {
                this.$global.showError(this.$t("p28"));
                return false;
            }
            this.deleteConfirm(this.tableCheck);
            return true;
        },
        deleteConfirm: function(records) {
            var _this = this;
            this.$yconfirm({
                message: this.$t("p29")
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
            ajax.handle("delete", "/api/inspection/timings", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[2]"));
                _this.getTableData();
            })
        },
        //#endregion
        //#region 新增/编辑
        showEditDialog: function(isAdd, record) {
            this.editDialog.record = record;
            this.editDialog.isAdd = isAdd;
            this.resetEditDialog();
            if(!isAdd) {
                this.updateEditDialog(record);
            }
            this.editDialogVisible = true;
            this.getPlaceData();
            this.getPropertyTypes();
        },
        resetEditDialog: function() {
            this.editDialog.weeks = [];
            this.editDialog.everyday = false;
            this.editDialog.otherDate = false;
            this.editDialog.date = null;
            this.editDialog.time = "00:00:00";
            this.editDialog.placeIds = [];
            this.editDialog.propertyTypeIds = [];
            this.editDialog.type = "all";
            this.editDialog.name = "";
        },
        updateEditDialog: function(timing) {
            if(timing.weeks) {
                this.editDialog.weeks = timing.weeks.split(",");
            }
            this.editDialog.everyday = timing.everyday == 1;
            this.editDialog.otherDate = !this.$global.isNull(timing.date);
            this.editDialog.date = timing.date;
            this.editDialog.time = timing.time;
            this.editDialog.name = timing.name;
            if(timing.all == 1) {
                this.editDialog.type = "all";
            } else {
                if(!this.$global.isNull(timing.placeIds)) {
                    this.editDialog.type = "place";
                    this.editDialog.placeIds = timing.placeIds.split(",");
                }

                if(!this.$global.isNull(timing.propertyTypes)) {
                    this.editDialog.type = "propertyType";
                    this.editDialog.propertyTypeIds = timing.propertyTypes.split(",");
                }

            }
        },
        changeOtherDateCheckbox: function(value) {
            if(!value) {
                this.editDialog.date = null;
            }
            if(this.editDialog.otherDate = null) {
                this.editDialog.otherDate = false;
            }
        },
        changeOtherDate: function(value) {
            this.editDialog.otherDate = !this.$global.isNull(value);
        },
        getPlaceData: function() {              //获取地点数据
            var _this = this;
            if(this.editDialog.placeData.length > 0) {
                return;
            }
            ajax.handle("get", "/api/inspection/places", {}, null, function(rs) {
                _this.editDialog.placeData = rs.data;
            })
        },
        getPropertyTypes: function() {           //获取资产类型列表
            var _this = this;
            if(this.editDialog.propertyTypes.length > 0) {
                return;
            }
            ajax.handle("get", "/api/inspection/property-types", {}, null, function(rs) {
                _this.editDialog.propertyTypes = rs.data;
            })
        },
        confirmSubmit: function() {         //提交
            if(!this.checkSubmitTiming(this.editDialog)) {
                return;
            }
            var data = this.transformTimingData(this.editDialog);
            if(this.editDialog.isAdd) {
                this.addTiming(data);
                return;
            }

            this.updateTiming(data);
        },
        checkSubmitTiming: function(timing) {        //检查提交的定时是否有效
            if(timing.weeks.length <= 0 && !timing.everyday 
                && this.$global.isNull(timing.date)) {
                this.$global.showError(this.$t("p30"));
                return false;
            }
            if(this.$global.isNull(timing.name)) {
                this.$global.showError(this.$t("p31"));
                return false;
            }
            if(timing.type == "place" && timing.placeIds.length <= 0) {
                this.$global.showError(this.$t("p32"));
                return false;
            }
            if(timing.type == "propertyType" && timing.propertyTypeIds.length <= 0) {
                this.$global.showError(this.$t("p33"));
                return false;
            }
            return true;
        },
        transformTimingData: function(timing) {
            var data = {};
            data.name = timing.name;
            data.weeks = timing.weeks.join(",");
            data.date = timing.date;
            data.time = timing.time;
            data.everyday = timing.everyday ? 1 : 0;
            data.all = timing.type == "all" ? 1 : 0;
            if(timing.type == "place") {
                data.placeIds = timing.placeIds.join(",");
            }

            if(timing.type == "propertyType") {
                data.propertyTypes = timing.propertyTypeIds.join(",");
            }

            if(!timing.isAdd) {
                data.id = timing.record.id;
            }
            return data;
        },
        addTiming: function(data) {              //新增定时
            var _this = this;
            var loading = {
                obj: this,
                lname: "editLoading"
            }
            ajax.handle("put", "/api/inspection/timing", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[1]"));
                _this.getTableData();
                _this.editDialogVisible = false;
            })
        },
        updateTiming: function(data) {          //修改定时
            var _this = this;
            var loading = {
                obj: this,
                lname: "editLoading"
            }
            ajax.handle("post", "/api/inspection/timing", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[4]"));
                _this.getTableData();
                _this.editDialogVisible = false;
            })
        },
        //#endregion
        //#region 禁用或启用
        changeEnable: function(value, timing) {
            var _this = this;
            var loading = {
                obj: this,
                lname: "loading"
            }
            var data = {
                id: timing.id,
                enable: value
            }
            ajax.handle("post", "/api/inspection/timing/enable", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[7]"))
            })
        }
        //#endregion
    },
    filters: {
        filterUnknown: function(val) {
            return val || "——"
        }
    }
});


