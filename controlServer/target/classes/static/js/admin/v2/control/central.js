/**
 * 文件名：控制中心黑色主题首页
 * 作者：刘露
 * 修改人：刘露
 * 修改时间：2022-10-08
 * 修改内容：添加控制中心黑色主题，接口对接
 */
 var PAGE_NAME = "v2ControlTemplate";
 $i18n.initDefault(PAGE_NAME);
 var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
	i18n: $i18n.obj,
    data: function () {
        return {
            props: { // 树形结构传参
                label: "name"
            },
            placeSearch: "", // 地点搜索
            jsonPlaceData: [], // 未转换为树节点的地点数据
            placeId: "", // 选中地点
            oldPlaceId: "",
            placeDataList: [], // 树结构地点列表
            defaultExpandedKeys: [], // 默认展开的地点

            classrommType: 0, // 当前选中的课室类型 0:单课室 1:多课室
            statisticsData: {}, // 占用状态统计
            statisticsDataText: { // 数据统计列表 type: 图片路径
                total : { text: "场所总数", type: "total" , value: 0, color: "#4B7DFD"},
                warning : { text: "故障场所", type: "fault", value: 0, color: "#FFD664" },
                using : { text: "在使用场所", type: "in-use", value: 0, color: "#FF4F4F" },
                free : { text:  "空闲场所", type: "free", value: 0, color: "#53EF8C" },
                stop : { text: "停用中", type: "self-study", value: 0, color: "#C547E8" },
            },

            placeDetailList: [], // 当前选中的地点 课室列表
            placeStatus: {  // 课室状态文本 背景链接
                free: {text: "空闲暂无会议", url: "green"}, 
                warning: {text: "故障中", url: "yellow"},
                using: {text: "在使用中", url: "red"},
                stop: {text: "停用中", url: "purple"} 
            },
            placeIconList: [ // 每个地点要显示的图标 图标对应的数据类型
                { icon: "iconbanpai", text: "电子班牌", type: "brand" }, 
                // { icon: "icontouyingyi01", text: "投影/一体机", type: "ideahub" },
                { icon: "iconyaoyaokongqi", text: "控制主机", type: "system" }, 
                { icon: "iconbattery-2-charge-fill", text: "智慧电箱", type: "airswitch" }, 
                { icon: "iconoutBound-hujiao", text: "IP对讲", type: "ipIntercom" }
            ],

            checkedPlaceList: [], // 选中的地点
            controlButtonList: [], // 控制列表
            controlButtonObj: { 0: 1, 1: 0, 2: 3, 3: 2, 4: 5, 5: 4, 8: 9, 9: 8 }, // 集控互斥指令对应的下标
            multiplePlaceStatus: {}, // 多课室地点状态

            setingUrl: {},
            templateUrl: "",
            showTemplateDialog: false,
            OMCSDialogCount: 0,
            showScreenSizeDialog: false,
            showSeting: false,

            placePage: {
                status: "",
                pageNum: 1,
                pageSize: 15,
                pageCount: 0
            },
            placePageTotal: 0,
            placePageCount: 0,
            indexInput: ""
        }
    },
    computed: {
        /**
         * 
         * @returns 返回当前选中的地点id列表
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        selectPlaceIds: function () {
            var ids = [];
            this.checkedPlaceList.forEach(function (item) {
                ids.push(item.id);
            });
            return ids;
        },
        /**
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         * @returns 返回当前选中的课室统计
         */
        multipleStatisticsData: function () {
            var obj = { free: 0, selfstudy: 0, total: 0, using: 0, warning: 0 };
            if (!this.checkedPlaceList.length) return obj;
            for (var key in this.multiplePlaceStatus) {
                var status = this.multiplePlaceStatus[key];
                if (this.selectPlaceIds.indexOf(key * 1) != -1) {
                    if (obj[status] !== undefined) {
                        obj[status] += 1;
                    }
                    obj.total += 1;
                }
                
            }
            return obj;
        },
        dialog: function () {
            return {
                confirm: $i.t('yes'),
                cancel: $i.t('no'),
                message: "",
                visible: false
            }
        },
        placeDevStatus: function () {
            return $i.t("placeDevStatus");
        }
    },
    mounted: function () {
        this.initData();
    },
    methods: {
        /**
         * 发送请求
         * 初始化数据等
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        initData: function () {
            this._getplaces();
            this._getStatistics();
            this._getInitUrl();
            this.watchScreenSize();
        },
        watchScreenSize: function () {
			var _this = this,
				time = null;
			window.onresize = function () {
				if (time) clearTimeout(time);
				time = setTimeout(function () {
                    if (!_this.showTemplateDialog || _this.showScreenSizeDialog) return;
                    _this.showScreenSizeDialog = true;
                    _this.$confirm($i.t("v2ctjs2"), $i.t("tips"), {
                        confirmButtonText: $i.t("confirm"),
                        cancelButtonText: $i.t("cancel"),
                        type: 'warning'
                    }).then(function () {
                        _this.templateUrl = _this.templateUrl + "&time=" + new Date().getTime();
                        _this.showScreenSizeDialog = false;
                    }).catch(function () {
                        _this.showScreenSizeDialog = false;
                    });
				}, 300)
			}
		},
        /**
		 * 获取地点列表
         * @author 刘露
         * @version 1.0.3, 2022-10-08
		 */
		_getplaces: function () {
			var _this = this;
			var data = {
				permission: "controlCenter"
			};
			this.$http.get("/api/v2/index/places/0/permission", data).then(function (res) {
				// if (!res.data.length) return _this.showPlaceEmpty = true;
				// _this.placeId = 5;
                if (!res.data.length) return;
				_this.jsonPlaceData = res.data;
				var placeData = _this.$global.jsonTree(res.data, {});
                _this._getChildrenPlaceList(null, placeData[0].id);
				_this.placeId = placeData[0].id;
				_this.oldPlaceId = placeData[0].id;
				_this.placeDataList = placeData;
				// _this.getTemplate();
				// _this.defaultExpandedKeys = _this._treeFindPath(placeData, _this.placeId);
				_this.defaultExpandedKeys = [placeData[0].id];
			})
		},
        /**
		 * 获取当前地点下的所有课室
		 * @param {*} data 当前点击的地点
		 * @param {*} id 当前地点id
		 * @returns 
         * @author 刘露
         * @version 1.0.3, 2022-10-08
		 */
         _getChildrenPlaceList: function (data, id) {
			// if (data && data.id == this.placeId) return;
			if (data) {
				this.placeId = data.id;
				this.oldPlaceId = data.id;
			}
			var placeId = data ? data.id : id;
            var params = {
                placeId: placeId
            }
            for (var key in this.placePage) {
                if (this.placePage[key]) params[key] = this.placePage[key];
            }
            if (params.status) delete params.placeId;
			var url = "/api/v2/control-template/dashboard/places/page";
			var _this = this;
			this.$http.get(url, params).then(function (res) {
                var result = res.data;
				_this.$refs.placeTree.setCurrentKey(placeId);
                if (result.data.length && result.data.length <= 1) {
                    _this.showTemplate(result.data[0]);
                } else {
                    _this.showTemplateDialog = false;
                    _this.placeDetailList = result.data;
                }
                _this.placePageTotal = result.count;
                _this.placePageCount = result.pageCount;
			})
		},
        /**
         * 获取课室状态使用统计
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        _getStatistics: function () {
            var url = "/api/v2/control-template/places/statistics",
                _this = this;
            this.$http.get(url, null).then(function (res) {
                _this.statisticsData = res.data;
                var total = res.data.total;
                for (var key in res.data) {
                    var val = res.data[key];
                    // statisticsDataText
                    _this.statisticsDataText[key].value = total == 0 ? 0 : Math.round((val / total) * 100);
                }
			})
        },
        /**
		 * 获取集控列表
         * 获取课室时初始化字段 myStatus 用于保存集控状态
         * @author 刘露
         * @version 1.0.3, 2022-10-08
		 */
		_getClassroomData: function () {
			var url = "/api/control-template/multi/buttons",
				_this = this,
				data = {
					placeId: this.selectPlaceIds.join(",")
				};
			this.$http.get(url, data).then(function (res) {
				_this.controlButtonList = res.data || [];
                _this.controlButtonList.forEach(function (item) {
                    _this.$set(item, "myStatus", false);
                })

			})
		},
        /**
         * 获取每个场所的使用状态
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        _getPlacesStatus: function () {
            var url = "api/v2/control-template/places/status",
                _this = this;
            this.$http.get(url).then(function (res) {
				_this.multiplePlaceStatus = res.data;
			})
        },
        /**
         * 获取主题url
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        _getInitUrl: function () {
            var url = "/api/v2/control-template/init/data",
                _this = this;
            this.$http.get(url).then(function (res) {
				_this.setingUrl = res.data.url;
			})
        },
        /**
		 * 发送集控指令
         * 当前控制的指令是符合条件的互斥指令时 也就是controlButtonList[id] 对应的值可以找到
         * 则需要将与之对应的互斥指令设置为相反的指令状态
         * 如果操作失败则返回之前的状态
         * 
		 * @param {*} value 当前开关的值
         * @param {*} btn 当前操作的按钮类型
         * @param {*} btnIndex 当前按钮下标
         * @author 刘露
         * @version 1.0.3, 2022-10-08
		 */
		_sendClassroomOrder: function (value, btn, btnIndex) {
            var ids = this.selectPlaceIds;
			var url = "/api/control-template/multi/control",
				_this = this,
				config = {
					loading: false,
					contentType: "application/x-www-form-urlencoded"
				},
				data = {
					placeIds: ids.join(","),
					id: btn.id,
				}

            var obj = this.controlButtonObj,
                otherIndex = obj[btnIndex];

			this.$http.post(url, data, config).then(function (res) {
				_this.$global.showSuccess($i.t("toast[7]"));

                if (!_this.controlButtonList[otherIndex]) return;
                _this.$set(_this.controlButtonList[otherIndex], "myStatus", !value);

			}).catch(function (err) {
                console.log(err);
                _this.$set(btn, "myStatus", !btn.myStatus);
            })
		},


        /**
		 * 根据某一个id查找当前节点所有父节点id
		 * @param {*} tree 树结构数据
		 * @param {*} menuid 需要查找的id
		 * @returns 
         * @author 刘露
         * @version 1.0.3, 2022-10-08
		 */
		_treeFindPath: function (tree, menuid) {
			var path = [];
			if (!tree) return [];
			var forFn = function (tree, menuid) {
				for (var i = 0; i < tree.length; i++) {
					// 存放最后返回的内容,返回text集合
					var data = tree[i];
					path.push(data.id);
					if (data.id === menuid) return path;
					if (data.children) {
						var findChildren = forFn(data.children, menuid);
						if (findChildren) return findChildren;
					}
					path.pop();
				}
			}
			forFn(tree, menuid);
			return path;
		},

        /**
         * 单课室选中地点
         * @param {*} data 当前选中的地点
         * @returns 
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        changePlaceNode: function (data) {
            this.placePage.status = "";
			console.log(data);

			// if (this.placeId == data.id) return;
			this._getChildrenPlaceList(data);
        },
        /**
         * 切换主题
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        changSeting: function () {
            window.parent.location.href = this.setingUrl.v1;
        },
        /**
         * 切换课室类型
         * @param {*} val 当前要切换的主题值 0: 单课室 1: 多课室
         * @returns 
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        changeClassroomType: function (val) {
            if (this.classrommType === val) return;
            if (val == 1) {
                this.showTemplateDialog = false;
                this._getPlacesStatus();
                this._getClassroomData();
            } else {
                this._getplaces();
                this._getStatistics();    
            }
            this.classrommType = val;
        },
        /**
         * 地点过滤 ElementUI框架的树形控件搜索地点过滤方法 使用方法可参考Element框架
         * @param {*} value 
         * @param {*} data 
         * @returns 
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        filterNode(value, data) {
            if (!value) return true;
            var label = this.props.label;
            return data[label].indexOf(value) !== -1;
        },
        /**
         * 地点使用状态时要显示的文本
         * @param {*} item 当前地点数据
         * @returns 
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        placeStatusText: function (item) {
            var status = item.placeStatus,
                course = item.course,
                type = item.type,
                meeting = item.meeting;
            if (status == "using") {
                if (item.course) return (course.clazzCustomizeName || "") + "/" + (course.subjectCustomizeName || "");
                return meeting.title;
            };
            if (type == 1 && status == "free") return $i.t("v2ctjs1");
            return $i.t("placeStatus")[status];
        },
        /**
         * 多课室选中时触发
         * != 0 只显示课室或者场所的地点列表
         * @param {*} curr 当前点击的
         * @param {*} data 所有选中的 具体值参考Element框架
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        checkChangePlaceNode: function (curr, data) {
            this.checkedPlaceList = data.checkedNodes.filter(function (item) {
                return item.type == 1 || item.type == 2;
            });
        },
        /**
         * 删除当前选中的地点
         * @param {*} item 要删除的地点数据
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        cancelSelectPlace: function (item) {
            var ids = [];
            var list = this.checkedPlaceList.filter(function (el) {
                if (el.id != item.id) {
                    ids.push(el.id);
                    return el;
                }
            })
            this.checkedPlaceList = list;
            this.$refs.placeTree.setCheckedKeys(ids);
        },
        /**
         * 控制当前选中的多个地点
         * @param {*} value 当前开关的值
         * @param {*} item 当前操作的按钮类型
         * @param {*} index 当前按钮下标
         * @returns 
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        changeControl: function (value, item, index) {
            if (!this.checkedPlaceList.length)  {
                this.$global.showError($i.t("v2ctjs3"));
                this.$set(item, "myStatus", !value);
                return;
            }

            this._sendClassroomOrder(value, item, index);
        },
        showTemplate: function (data, event) {
            var isSpan = event ? event.target.className.indexOf("place-detail-data-value__text") : -1;
            if (isSpan != -1 && data.placeStatus == "warning" && data.targetUrl) {
                window.open(data.targetUrl);
                return;
            };

            this.OMCSDialogCount += 1;
            this.defaultExpandedKeys = [data.id];
            this.placeId = data.id;
            this.$refs.placeTree.setCurrentKey(data.id);
            this.templateUrl = "/admin/control/central?isEdit=false&placeId=" + data.id + "&omcs=" + this.OMCSDialogCount;
            this.showTemplateDialog = true;
        },
        selectStatisticsStatus: function (status) {
            this.placePage.pageNum = 1;
            this.placePage.status = this.placePage.status == status ? "" : status;
            this._getChildrenPlaceList(null, this.placeId);
        },
        changePage: function (index) {
            index = parseInt(index);
            this.placePage.pageNum = index;
            this._getChildrenPlaceList(null, this.placeId);
        },
        jumpFirst: function () {
            this.changePage(1);
        },
        jumpLast: function () {
            this.changePage(this.placePageCount);
        },
        jumpTo: function () {
            if (this.indexInput == null || this.indexInput == "") {
                return;
            }
			var index = parseInt(this.indexInput);
			if (index < 1) {
				var str = $i.t("v2ctjs4");
				this.$global.showError(str);
				return;
			}

			if (index > this.placePageCount) {
				var str = $i.t("v2ctjs5", {number: this.placePageCount});
				this.$global.showError(str);
				return;
			}

            this.changePage(this.indexInput);
        },
    },
    watch: {
        /**
         * 地点搜索框
         * @param {*} val 当前输入框的值
         * @author 刘露
         * @version 1.0.3, 2022-10-08
         */
        placeSearch: function (val) {
            this.$refs.placeTree.filter(val);
        },
        /**
         * 监听地点变化 初始化指令状态
         */
        selectPlaceIds: {
            deep: true,
            handler: function (val) {
                var _this = this;
                if (!val) return;
                this.controlButtonList.forEach(function (item) {
                    _this.$set(item, "myStatus", false);
                });
            }
        }
    }
})