var ajax = new Ajax(_config);
var PAGE_NAME = "inspectionRecord";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i,
    computed: {
        recordStatusMap: function() {     //状态映射
            return {
                1: this.$t("p36"),
                3: this.$t("p37"),
                4: this.$t("p38")
            }
        },
        recordStatusOptions: function() {    
            var options = [];
            for(var key in this.recordStatusMap) {
                options.push({
                    label: this.recordStatusMap[key],
                    value: key
                })
            }
            return options;
        },
        stepMap: function() {
            return {
                online: this.$t("p39"),
                warning: this.$t("p40"),
                fault: this.$t("p41")
            }
        },
        stepOptions: function() {
            var options = [];
            for(var key in this.stepMap) {
                options.push({
                    label: this.stepMap[key],
                    value: key
                })
            }
            return options;
        },
        detailStatusMap: function() {
            return {
                1: this.$t("p42"),
                2: this.$t("p43"),
                3: this.$t("p44")
            }
        },
        stepDeviceInfo: function() {
            var total = 0;
            var normal = 0;
            var abnormal = 0;
            var record = this.detail.record;
            if(record != null) {
                if(this.detail.step == "online") {
                    total = record.statusEquipmentTotal;
                    abnormal = record.statusEquipmentOffline;
                }

                if(this.detail.step == "warning") {
                    total = record.warningEquipmentTotal;
                    abnormal = record.warningEquipmentAbnormal;
                }

                if(this.detail.step == "fault") {
                    total = record.faultEquipmentTotal;
                    abnormal = record.faultEquipmentAbnormal;
                }
                normal = total - abnormal;
            }
            
            return {
                total: total,
                normal: normal,
                abnormal: abnormal
            }
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
        status: null,       //选中的状态
        dates: [],           //时间筛选范围
        detail: {
            ignoreStatus: 3,
            record: null,
            data: [],
            showIgnored: false,    //是否显示已忽略数据
            show: false,          //是否显示
            step: "online",       //步骤
            search: "",
            dates: [],
            tableCheck: []
        },
        detailPage: {
            pageNum: 1,
            pageSize: 8,
            count: 1
        },
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
        formatCreator: function(row, column, cellValue, index) {
            if(row.method == 2) {
                return this.$t("p45")
            }
            if(row.user == null) {
                return this.$t("p46")
            }
            return row.user.nickname;
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
            this.getTableData(1);
        },
        //跳转到最后一页
        toLastPage: function() {
           var pageSize = this.page.pageSize;
           var count = this.page.count;
           var index = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1;
           this.getTableData(index);
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
            this.getTableData(this.page.target);
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
            if(!this.$global.isNull(this.status)) {
                data.statuses = this.status;
            }
            if(this.dates && this.dates.length > 0) {
                data.startTime = this.dates[0];
                data.endTime = this.dates[1];
            }

            ajax.handle("get", "/api/inspection/records/page", data, loading, function(rs) {
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
        changeStatus: function(status) {
            this.getTableData(1);
        },
        changeDates: function(dates) {
            this.getTableData(1);
        },
        //#region 删除
        singleDelete: function(record) {
            this.deleteConfirm([record]);
        },
        multiDelete: function() {
            if(this.tableCheck.length <= 0) {
                this.$global.showError(this.$t("p47"));
                return false;
            }
            this.deleteConfirm(this.tableCheck);
            return true;
        },
        deleteConfirm: function(records) {
            var _this = this;
            this.$yconfirm({
                message: this.$t("p48")
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
            ajax.handle("delete", "/api/inspection/records", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[2]"));
                _this.getTableData();
            })
        },
        //#endregion
        //#region 导出
        exportRecord: function(record) {
            var url = this.$global.fullServerUrl("/api/inspection/record/export?id=" + record.id);
            var filename = "巡检记录" + this.$global.formatDate(new Date(), "YYYY-MM-DD_HH_mm");
            var type = "application/vnd.ms-excel"
            this.downloadFile(url, type, filename);
        },
        downloadFile: function (url, type, filename) {
			var _this = this;
			var ajax = new XMLHttpRequest();
			this.loading = true;
			ajax.responseType = "blob";
			ajax.open("GET", url, true)
			ajax.onload = function () {
				_this.loading = false;
				if (this.status == 200) {
					var content = ajax.getResponseHeader("Content-Disposition");
                    if(_this.$global.isNull(filename)) {
                        filename = content && content.split(';')[1].split('fileName=')[1];
					    filename = decodeURI(filename);
                    }
					_this.handleDownloadResponse(this.response, filename, type);
					return;
				}

				//非正常状态
				_this.$global.showError(_this.$t("p49"));
			}
			ajax.send(null);
		},
		handleDownloadResponse: function (response, filename, type) {
			if (response == null) {
				return;
			}
			//如果是文件类型，则生成下载
			var blob = new Blob([response], {
				type: type || response.type
			});
			// 获取heads中的filename文件名
			var downloadElement = document.createElement("a");
			// 创建下载的链接
			var href = window.URL.createObjectURL(blob);
			downloadElement.href = href;
			// 下载后文件名
			downloadElement.download = filename;
			document.body.appendChild(downloadElement);
			// 点击下载
			downloadElement.click();
			// 下载完成移除元素
			document.body.removeChild(downloadElement);
			// 释放掉blob对象
			window.URL.revokeObjectURL(href);
		},
        //#endregion
        //#region 查看详情
        showDetails: function(record) {
            this.detail.record = record;
            this.detail.pageNum = 1;
            this.detail,data = [];
            this.detail.step = "online";
            this.detail.tableCheck = [];
            var _this = this;
            this.detailPage.count = 1;
            this.detail.show = true;
            this.getDetailData(1);
        },
        getDetailData: function(index) {
            index = index || this.detailPage.pageNum;
            var loading = {
                obj: this,
                lname: "tableLoading"
            }
            var data = {
                inspectionIds: this.detail.record.id,
                steps: this.detail.step,
                pageNum: index,
                pageSize: this.detailPage.pageSize,
                like: this.detail.search
            }

            if(!this.detail.showIgnored) {
                data.excludeStatuses = this.detail.ignoreStatus;
            }

            if(this.detail.dates && this.detail.dates.length > 0) {
                data.startTime = this.detail.dates[0];
                data.endTime = this.detail.dates[1];
            }

            var _this = this;
            ajax.handle("get", "/api/inspection/details/page", data, loading, function(rs) {
                _this.detailPage.pageNum = rs.data.pageNum;
                _this.detailPage.count = rs.data.count;
                _this.detail.data = rs.data.data;
            })
        },
        changeDetailSearch: function() {
            this.getDetailData(1);
        },
        changeDetailStep: function() {
            this.getDetailData(1);
        },
        handleDetailSelectionChange: function(selections) {
            this.detail.tableCheck = selections;
        },
        goBack: function() {
            this.detail.show = false;
        },
        multiDeleteDetails: function() {
            if(this.detail.tableCheck.length <= 0) {
                this.$global.showError(this.$t("p47"));
                return false;
            }
            this.detailDeleteConfirm(this.detail.tableCheck);
            return true;
        },
        singleDeleteDetail: function(record) {
            this.detailDeleteConfirm([record])
        },
        detailDeleteConfirm: function(records) {
            var _this = this;
            this.$yconfirm({
                message: this.$t("p48")
            })
            .then(function(rs) {
                _this.doDeleteDetails(records);
            })
            .catch(function(err) {

            })
        },
        doDeleteDetails: function(records) {
            var ids = records.map(function(el) {
                return el.id;
            }).join(",");
            var data = {
                ids: ids
            }
            var loading = {
                lname: "loading",
                obj: this
            }
            var _this = this;
            ajax.handle("delete", "/api/inspection/details", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[2]"));
                _this.getDetailData();
            })
        },
        multiIgnoreDetails: function() {
            if(this.detail.tableCheck.length <= 0) {
                this.$global.showError(this.$t("p47"));
                return false;
            }
            this.doIgnoreDetails(this.detail.tableCheck);
            return true;
        },
        singleIgnoreDetail: function(record) {
            this.doIgnoreDetails([record]);
        },
        doIgnoreDetails: function(records) {
            var ids = records.map(function(el) {
                return el.id;
            }).join(",");

            var data = {
                ids: ids
            }
            var loading = {
                lname: "loading",
                obj: this
            }

            var _this = this;
            ajax.handle("post", "/api/inspection/details/ignore", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[7]"));
                _this.getDetailData();
            })
        },
        cancelIgnoreDetail: function(record) {              //取消忽略
            var data = {
                ids: record.id
            }
            var loading = {
                lname: "loading",
                obj: this
            }

            var _this = this;
            ajax.handle("post", "/api/inspection/details/ignore/cancel", data, loading, function(rs) {
                _this.$global.showSuccess(_this.$t("toast[7]"));
                _this.getDetailData();
            })
        },
        changeDetailDates: function(dates) {
            this.getDetailData(1);
        }
        //#endregion
    },
    filters: {
        filterUnknown: function(val) {
            return val || "——"
        }
    }
});


