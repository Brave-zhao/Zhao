var PAGE_NAME = "tableCardManage";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i,
    computed: {
        selectPlaceText: function() {
            var _this = this;
            var text = this.placeIds.map(function(placeId) {
                var find = _this.$global.findByKeyValue(_this.placeData, "id", placeId);
                return find;
            }).filter(function(place) {
                return place != null;
            }).map(function(place) {
                return place.name;
            }).join("、");

            if(text.length <= 0) {
                return "无";
            }
            return text;
        },
        uploadStyle: function() {
            if(this.uploadDialog.record == null || this.uploadDialog.record.einkType == null) {
                return null;
            }

            var width = this.uploadDialog.record.einkType.width || 700;
            var height = this.uploadDialog.record.einkType.height || 480;

            var maxWidth = 300;
            var maxHeight = height / width * maxWidth;
            return {
                width: maxWidth + "px",
                height: maxHeight + "px"
            }
        },
    },
    data: {
        station: "",
        topics: "",
        placeData: [],
        placeIds: [], 
        tableData: [],
        page: {
            pageNum: 1,
            pageSize: 8,
            count: 1,
            target: '',
        },
        tablePlaceIds: [],
        tableLoading: false,
        uploadDialog: {
            visible: false,
            record: null,
            imgUrl: null,
            loading: false,
            data: {},
        }
    },
    mounted: function() {
        this.getPlaceData();
        this.getTableData(1);
        this.getOnlineMap();
    },
    methods: {
        formatNull: function(row, column, cellValue, index) {         //格式化空数据
			if(cellValue == null || cellValue == "") {
				return "——";
			} 
			return cellValue;
		},
        createTopic: function() {        //生成Topic前缀
            var param = {
                station: this.station
            }

            var _this = this;
            this.$http.get("/api/tableCard/topics", param)
                .then(function(rs) {
                    _this.$global.showSuccess("主题前缀已复制到剪切板");
                    _this.topics = JSON.stringify(rs.data);
                    _this.$global.clipboard(_this.topics);
                })
                .catch(function(err) {

                })
        },
        getPlaceData: function() {
            var config = {
                loading: false,
            }
            var _this = this;
            this.$http.get("/api/tableCard/places", {}, config)
                .then(function(rs) {
                    _this.placeData = rs.data;
                })
                .catch(function(err) {

                })
        },
        changePlaces: function() {
            this.getTableData(1);
        },
        getTableData: function(index) {                    //获取表格数据
            index = index || this.page.pageNum;
            var config = {
               loading: {
                 context: this,
                 target: "tableLoading"
               }
            }
            var _this = this;
            var data = {
                pageNum: index,
                pageSize: this.page.pageSize,
                placeIds: this.tablePlaceIds.length <= 0 ? null : this.tablePlaceIds.join(",")
            }
            this.$http.get("/api/tableCard/page", data, config)
                .then(function(rs) {
                    _this.tableData = rs.data.data;
                    _this.page.pageNum = index;
                    _this.page.count = rs.data.count;
                })
        },
        republish: function() {
            if(this.placeIds.length <= 0) {
                this.$global.showError("请先选择地点");
                return;
            }
            var _this = this;
            this.$yconfirm({
                message: "是否确定重新下发桌牌信息？（注意：重新下发会较耗时，请不要频繁操作）"
            }).then(function(rs) {
                _this.doRepublish();
            
            })
        },
        doRepublish: function() {
            var param = {
                placeIds: this.placeIds.join(",")
            }
            var _this = this;
            this.$http.post("/api/tableCard/republish", param)
                .then(function(rs) {
                    _this.$global.showSuccess("已重新下发，请耐心等待下发完成");
                })
                .catch(function(err) {

                })
        },
        allowRepublishPlace: function(place) {
            return place.type == 1 || place.type == 2;
        },
        republishToDevice: function(device) {
            var _this = this;
            this.$yconfirm({
                message: "是否确定重新下发桌牌信息？(注：不在线和未下发的将无法重新下发)"
            }).then(function(rs) {
                _this.doRepublishToDevice(device);
            })
            .catch(function(err) {
                console.log(err);
            })
        },
        doRepublishToDevice: function(device) {
            var param = {
                uuid: device.uniqueCode
            }
            var _this = this;
            this.$http.post("/api/tableCard/republish/device", param)
                .then(function(rs) {
                    _this.$global.showSuccess("已重新下发，请耐心等待下发完成");
                })
                .catch(function(err) {

                })
        },
        showUploadDialog: function(record) {
            this.uploadDialog.record = record;
            this.uploadDialog.imgUrl = null;
            var dom = this.$refs.uploader;
            if(dom) {
                dom.clearFiles();
            }
            this.uploadDialog.visible = true;
        },
        changeUploadFile: function(file, fileList) {
            if(file.status != "ready") {
                return;
            }

            var _this = this;
            var reader = new FileReader();
            reader.readAsDataURL(file.raw);
            reader.onload = function(event) {
                _this.$set(_this.uploadDialog, "imgUrl", event.target.result);
            }
        },
        confirmUpload: function() {
            if(this.uploadDialog.imgUrl == null) {
                this.$global.showError("请先选择要下发的图片");
                return;
            }
            this.$refs.uploader.submit();
        },
        beforeUpload: function() {
            this.uploadDialog.loading = true;
            this.$set(this.uploadDialog.data, "uuid", this.uploadDialog.record.uniqueCode);
            return true;
        },
        handleUploadSuccess: function(rs) {
            this.uploadDialog.loading = false;
            if(rs.code == 200) {
                this.$global.showSuccess("上传成功，请等待下发完毕");
                this.uploadDialog.visible = false;
                return;
            }

            this.$global.showError("上传失败，原因：" + rs.msg);
        },
        handleUploadError: function() {
            this.uploadDialog.loading = false;
            this.$global.showError("上传失败");
        },
        getOnlineMap: function() {
            var uuids = this.tableData.map(function(el) {
                return el.uniqueCode;
            }).join(",")
            var _this = this;
            this.$http.get("/api/tableCard/onlineMap", {uuids: uuids}, {loading: false})
                .then(function(rs) {
                    var map = rs.data;
                    _this.tableData.map(function(el) {
                        el.online = map[el.uniqueCode] || 0;
                    })
                })
                .catch(function(err) {

                })
        },
        startGetOnlineMap: function() {
            clearInterval(this.onlineTimer);
            var _this = this;
            this.onlineTimer = setInterval(function() {
                _this.getOnlineMap();
            }, 5 * 1000);
        },
    },
    filters: {
        
    }
});


