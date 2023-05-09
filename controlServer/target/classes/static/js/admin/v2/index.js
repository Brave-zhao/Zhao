/**
 * 深色版首页
 */
 var PAGE_NAME = "v2Index";
 $i18n.initDefault(PAGE_NAME);
 var $i = $i18n.obj;

var vue = new Vue({
	el: "#app",
	i18n: $i18n.obj,
	created: function() {
		
	},
	mounted: function() {
		this.initData();
		this.$global.setCookie("a", "123");
		this.$global.setCookie("b", "123", 60 * 1000);
	},
	computed: {
		logo: function() {
			if(this.$global.isNull(this.init)) {
				return "";
			}
			return this.init.logo;
		},
		menus: function() {          //菜单列表
			if(this.$global.isNull(this.init)) {
				return [];
			}

			var menus = this.init.menus.map(function(menu) {
				menu.mark = menu.flag;
				menu.title = menu.name;
				return menu;
			})
			return this.init.menus;
		},
		activeUrl: function() {
			if(this.activeMenu == null) {
				return "";
			}
			return this.activeMenu.path;
		},
		loginUser: function() {
			if(this.$global.isNull(this.init)) {
				return {};
			}
			return this.init.loginUser || {};
		},
		jumpMarks: function() {                //直接跳转的菜单标识
			return ["controlSettingV2"];
		},
		openNewPageMarks: function() {
			return [];
		},
		headerFoldMarks: function() {         //全屏的菜单标识
			return ["controlIndexV2"];
		},
		enableHeaderFold: function() {       //头部是否可收起
			if(this.activeMenu == null) {
				return false;
			}
			return this.headerFoldMarks.indexOf(this.activeMenu.mark) != -1;
		},
		isHeaderFold: function() {      //头部是否折叠
			return this.enableHeaderFold && !this.isMouseEnterHeader;
		},
		foldHeaderDebouncer: function() {              //收起头部防抖函数
			var _this = this;
			return this.$global.debounce(function() {
				_this.$set(_this, "isMouseEnterHeader", false);
			}, 1000);
		},
		showUnattendedMask: function() {                 //是否显示无人值守或号码转接
			if(this.$global.isObjectNull(this.unattendedConfig)) {
				return false;
			}
			return this.unattendedConfig.unattended == 1 || this.unattendedConfig.tranfer == 1;
		},
		defaultUnattendedConfig: function() {
			return {
				unattended: 0,
				password: "",
				tranfer: 0,
				number: ""
			}
		},
		initDateSeparatorFormat: function () {
			var list = this.messageListData,
				newList = {},
				_this = this;
			list.forEach(function (item) {
				var curr = _this.$global.formatDate(item.createTime, "YYYY-MM-DD");

				if (!newList[curr]) newList[curr] = [];
				newList[curr].push(item);
			});
			return newList;
		},
		/**
		 * 是否显示时间label
		 * @returns 
		 */
		showTimeLabel: function () {
			return !this.startPatrol && this.patrolProgressType && this.patrolProgressType != "nothing";
		},
		/**
		 * 扫描文本
		 * @returns 
		 */
		scanningText: function () {
			var label = this.patrolRecordCollapseData[this.currPatrolType] || {}
			return this.startPatrol ? (label.label ? "正在进行" + label.label: "") : '请点击 "开始巡检" 进行巡检'
		},
		formatPatrolTimeText: function () {
			var value = this.patrolTime.value,
				hour = parseInt(value / (1000 * 60 * 60)),
				minutes = parseInt((value % (1000 * 60 * 60)) / (1000 * 60)),
				second = parseInt((value % (1000 * 60)) / 1000),
				arr = [hour, minutes, second],
				text = arr.map(function (t) {
					return t < 10 ? "0" + t : t;
				}).join(":");

			return text;
		},
		/**
		 * 
		 * @returns 过滤掉正常记录
		 */
		patrolRecordContent: function () {
			var list = this.patrolRecordCollapseData;
			if (!this.startPatrol) {
				var newList = {};
				for (var key in list) {
					if (!newList[key]) newList[key] = {};
					newList[key].content = list[key].content.filter(function (item) {return item.status != 1});
				}
				return newList;
			}
			return this.patrolRecordCollapseData;
		},
		/**
		 * 
		 * @returns 是否显示列表形式的短号列表
		 */
		showListFormData: function () {
			var number = this.intercomParams.number
			return number == undefined || number == null || number === "";
		},
		callTimeTotal: function () {
			var time = this.totalSecond * 1000,
				hour = parseInt(time / (1000 * 60 * 60)),
				minutes = parseInt((time % (1000 * 60 * 60)) / (1000 * 60)),
				second = parseInt((time % (1000 * 60)) / 1000),
				arr = [hour, minutes, second],
				text = arr
				.map(function (t) {
					return t < 10 ? "0" + t : t;
				})
				.join(":");
			return text;
		},
		computedCallType: function () {
            return $i.t("callType");
        },
		patrolRecordStatus: function () {
			return $i.t("patrolRecordStatus");
		},
		terminalTypes: function () {
			return $i.t("terminalTypes");
		},
		intercomStatus: function () { // 号码在线状态
			return $i.t("intercomStatus");
		},
		dialogTipstext: function () {
			var value = this.iPIntercomObj;
			// 10086请求语音通话 || 10086请求视频通话
			var name = value.clientName || value.placeName || "";
			return name + (value.fromId || "") + (this.computedCallType[value.callType] || "");
		},
		notUserNumber: function () {
			return !this.userData.number;
		},
		onCallAndDotWatch: function () {
			return !this.iPIntercomObj.watchCall && this.currCallSpeed == "onCall";
		},
		handlerActiveMenu: function () {
			var active = this.menus.filter(function (item) { return item.active })[0];
			return active;
		},
	},
	data: {
		init: null,         //初始化数据
		hasInitData: false,
		activeMenu: null,      //iframe显示的链接
		isMouseEnterHeader: false,      //鼠标是否移入头部
		foldTimer: null,
		firstOpen: true,                 //是否第一次打开页面
		unattendedConfig: {                //无人值守信息
		},
		//#region 消息 && 无人值守 && 一键巡检
		getLateData: false,
		messageListData: [],
		messageParams: {
			pageNum: 1,
			pageSize: 50
		},
		messageCount: 0,
		messageLoading: false,


		showUnattendedDialog: false, // 设置无人值守弹框
		

		showPatrolDialog: false, // 一键巡检弹框
		startPatrol: false, // 是否开始巡检
		patrolTime: {
			time: null,
			value: 0,
			total: 500,
			pushTime: null, // 巡检过程定时一条条加数据
		},
		
		patrolStatusData: [
			{ name: "巡检设备", value: 0, color: "#2E97FF", type: "statusEquipmentTotal" },
			{ name: "设备在线", value: 0, color: "#F1B350", type: "statusEquipmentOnline" },
			{ name: "设备离线", value: 0, color: "#EE6057", type: "statusEquipmentOffline" }
		],
		patrolType: 0, // 巡检类型 (0: 设备, 1: 地点)
		placeId: [],
		oldPlaceId: "",
		placeList: [],
		devList: [], // 设备列表
		placeProps: {
			disabled: true
		},
		oldDevType: [],
		devType: [], // 选中的设备类型
		warningValue: 0,
		faultValue: 0,
		rateValue: 0, // 巡检进度
		currPatrolType: "", // 当前巡检进度类型 (off-line || warning || fault)
		// 巡检记录列表
		patrolRecordCollapseData: {
			"off-line": {
				label: "设备离线巡检",
				icon: "iconlixian",
				type: "online",
				height: 0,
				loading: false,
				content: [],
			},
			"warning": {
				label: "设备预警巡检",
				icon: "iconjingbao",
				type: "warning",
				height: 0,
				loading: false,
				content: [],
			},
			"fault": {
				label: "设备故障巡检",
				icon: "iconguzhang",
				type: "fault",
				height: 0,
				loading: false,
				content: [],
			}
		},
		patrolRecordCollapseActive: [], // 折叠面板选中
		patrolProgressType: "nothing", // 巡检进度类型
		patrolProgressText: {
			// 上一次巡检
			lastTime: {
				text: "上一次巡检进度",
				type: "",
				value: ""
			},
			// 本次巡检
			thisTime: {
				text: "巡检进度",
				type: "",
				value: ""
			},
			// 无巡检记录
			nothing: {
				text: "当前未巡检",
				type: "",
				value: ""
			},
		},

		initLatelyPatrolRecord: {}, // 初始化最近一次巡检
		exportLoading: false,
		//#endregion

		//#region IP呼叫
		showIpDialog: false, // 显示Ip对讲详情弹框
		intercomParams: {
			number: "",
			placeId: "", // 当前行地点id
		},
		searchDebounceNumber: null,
		intercomListTime: null,
		intercomList: [], // Ip对讲号码列表
		intercomListLoading: false,
		intercomNumberTypes: [
			{ label: "地点", name: "place", value: "1,2" },
			{ label: "个人", name: "personal", value: "3,4" }
		],
		activeIntercomNumberType: "place", // 当前选中的号码类型

		showCallDialog: false, // 是否显示呼叫中弹框
		showIncomingCallDialog: false, // 是否显示呼入弹框
		//#endregion

		//#region omcs
		remindOmcs: true, // 是否提醒omcs
		showOpenOMCSDialog: false, // 下载插件弹框
		showOMCSDialog: true,
		showTransferDialog: false,
		$stompClient: null,
		omcsClient: null,

		guestsStatus: {}, // 状态
		totalSecond: 0, // 通话计时器
		totalTime: null, // 通话时长的定时器
		callStartTime: null, // 开始通话的时间

		subscribeIds: [],
		fromId: "",
		toId: "",
		transferId: "",
		isOk: "",
		webSocketTime: null, // WebSocket失败定时器
		iPIntercomTime: null, // 在线心跳定时器
		callClientNotify: false, // 是否有麦克风连接状态的通知
		onLineCount: 0, // 确认网络在线次数
		onLineCountTime: null, // 确认网络在线次数的定时器
		onLineCountTimeNum: 2000, // 确认网络在线次数的定时器毫秒数

		iPIntercomObj: {}, // 呼入
		sendIPButtonData: null,
		userData: {},
		currCallSpeed: "", // 当前通话进度  call(呼叫) => onCall(通话中) => incomingCall(呼入)
		//#endregion


		superUserData: {
			show: false,
			password: ""
		}
	},
	methods: {
		initData: function() {
			this.leavePage();
			this.initUnattendedConfig();
			this.getInitData();
			this.registerEventListener();

			this.getMessageList();
			if (!openIpIntercom) return;
			this.getMyTerminalNumber();
			this.searchDebounceNumber = this.$global.debounce(this.getIntercomList);
		},
		leavePage: function () { //监听离开
			var _this = this;
			window.onbeforeunload = function (e) {
				if (_this.startPatrol) _this.changePatrolStatus();
			}
		},
		initUnattendedConfig: function() {
			var unattended = this.defaultUnattendedConfig;
			for(var key in unattended) {
				this.$set(this.unattendedConfig, key, unattended[key]);
			}
		},
		getInitData: function() {
			var _this = this;
			this.$http.get("/api/v2/index/init/data", {})
				.then(function(rs) {
					var unattended = rs.data.unattendedConfig || {};
					if(unattended == null) {
						_this.initUnattendedConfig();
					} else {
						_this.unattendedConfig = unattended;
					}
					if (unattended.unattended === 1) {
						_this.$set(_this.unattendedConfig, "password", "");
					}
					_this.init = rs.data;
					_this.hasInitData = true;
					_this.initActiveMenu();
				})
				.catch(function(err) {

				})
		},
		registerEventListener: function() {
			var _this = this;
			//注：因为事件在iframe上无法监听，因此必须这样处理
			if(this.$refs.headerMask) {
				this.$refs.headerMask.addEventListener("mouseenter", function(e) {
					if(_this.isHeaderFold) {
						_this.$set(_this, "isMouseEnterHeader", true);
						clearTimeout(_this.foldTimer)
					}
				})
			}

			if(this.$refs.header) {
				this.$refs.header.addEventListener("mouseenter", function(e) {
					_this.$set(_this, "isMouseEnterHeader", true);
					clearTimeout(_this.foldTimer)
				})

				this.$refs.header.addEventListener("mouseleave", function(e) {
					_this.resetFoldTimer();
				})
			}
		},
		resetFoldTimer: function() {
			clearTimeout(this.foldTimer);
			var _this = this;
			this.foldTimer = setTimeout(function() {
				_this.isMouseEnterHeader = false;
			}, 1000)
		},
		initActiveMenu: function() {             //初始化选中菜单
			//判断参数是否带有flag或mark参数
			var mark = this.$global.getUrlParam("flag") || this.$global.getUrlParam("mark");
			if(this.$global.isNull(mark)) {
				//从localstorage获取
				var local = this.$global.getItem("control_menu_active");
				if(local != null) {
					document.title = local.name || $i.t("page.f");
					mark = local.mark;
				}
			} else {
				//清空链接参数
				var url = this.$global.removeUrlParams(window.location.href, ["flag", "mark"]);
				if(window.history.replaceState) {
					window.history.replaceState({}, $i.t("page.f"), url);
				}
			}

			if(!this.$global.isNull(mark)) {
				for(var i = 0; i < this.menus.length; i++) {
					if(mark == this.menus[i].mark) {
						this.doActiveMenu(this.menus[i], false);
						return;
					}
				}
			}

			//获取第一个可用菜单
			for(var i = 0; i < this.menus.length; i++) {
				if(this.isMenuEnable(this.menus[i])) {
					this.doActiveMenu(this.menus[i], false);
					return;
				}
			}
		},
		doActiveMenu: function(menu, openNewPage) {           //选中菜单
			var isActive = this.actualActiveMenu(menu);
			if(!isActive) {
				return false;
			}

			if(this.isMenuSpecial(menu)) {
				return true;
			}

			if(!openNewPage) {
				for(var i = 0; i < this.menus.length; i++) {
					this.menus[i].active = false;
				}
				menu.active = true;
				this.activeMenu = menu;
				return true;
			}

			//打开新窗口
			var url = this.$global.addUrlParam(window.location.href, "flag", menu.mark);
			window.open(url);
			return true;
		},
		actualActiveMenu: function(menu) {
			if(!this.isMenuEnable(menu)) {
				this.showDisable();
				return false;
			}

			if(this.doActiveSpecialMenu(menu)) {
				this.setNotFirstOpen();
				return true;
			}

			this.$global.setItem("control_menu_active", menu);
			this.setNotFirstOpen();
			return true;
		},
		changeMenu: function(menu) {
			if(this.activeMenu != null && menu.mark == this.activeMenu.mark) {
				return false;
			}
			document.title = menu.title || $i.t("page.f");
			var openNewPage = this.openNewPageMarks.indexOf(menu.mark) != -1;
			return this.doActiveMenu(menu, openNewPage);
		},
		setNotFirstOpen: function() {
			if(!this.firstOpen) {
				return;
			}
			var _this = this;
			setTimeout(function() {
				_this.firstOpen = false;
			}, 600);
		},
		showDisable: function(type) {
			// this.$global.showError("功能暂未开放");
		},
		/**
		 * 显示一键巡检弹框
		 */
		 showOnekeyPatrolDialog: function () {
			this.showPatrolDialog = true;
			this.$nextTick(function () {
				if (this.getLateData) this.getLatelyPatrolRecord();
				else {
					if (!this.placeList.length) this.getPlaceList();
					if (!this.devList.length) this.getDevList();	
					this.initCircularValue(false);
					this.initLineEchart(false);
				}
			})
			
			
		},
		/**
		 * 显示设置无人值守弹框
		 */
		showSetUnattendedDialog: function () {
			this.showUnattendedDialog = true;
		},
		/**
		 * 
		 * @param {*} val 
		 */
		hoverMessage: function (val) {
			if (val) this.getMessageList();
		},
		doActiveSpecialMenu: function(menu) {       //选中特殊菜单，如系统设置
			if(this.isMenuSpecial(menu)) {
				window.location.href = menu.path;
				return true;
			}
			return false;
		},
		isMenuSpecial: function(menu) {
			return this.jumpMarks.indexOf(menu.mark) != -1;
		},
		isMenuEnable: function(menu) {        //判断菜单是否可用
			return !this.$global.isNull(menu.path);
		},
		handleDropCommand: function(command) {     //处理下拉菜单点击事件
			if(command == "logout") {
				this.logout();
				return;
			}
		},
		logout: function() {
			this.$global.clearSuperPermission();
			window.location.href = this.$global.serverUrl() + "/logout?service=" + window.location.href;
		},
		doFullScreen: function() {
			if(this.isFullScreen()) {
				this.exitFullScreen();
				return;
			}
			this.requestFullScreen();
		},
		requestFullScreen: function() {
			var element = document.documentElement;
			var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
            if (requestMethod) {
                requestMethod.call(element);
            } else if (typeof window.ActiveXObject !== "undefined") {
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            }
		},
		exitFullScreen: function() {         //退出全屏
			var exitFullScreen = document.exitFullScreen || 
				document.mozCancelFullScreen || 
				document.webkitExitFullscreen || 
				document.msExitFullscreen;
			if (exitFullScreen) {
				exitFullScreen.call(document);
			}
		},
		isFullScreen: function() {             //是否全屏状态
			return document.fullscreenElement ||
						document.msFullscreenElement ||
						document.mozFullScreenElement ||
						document.webkitFullscreenElement || false;
		},
		/**
		 * 全部已读
		 */
		allRead: function () {
			if (!this.messageListData.length) return;
			var url = "api/v2/index/msgs/read/all",
			_this = this,
			config = {
				loading: false
			}
			this.$http.post(url, null, config).then(function (res) {
				_this.$global.showSuccess($i.t("toast[7]"));
				_this.messageListData = [];
			})
		},
		/**
		 * 当前消息时间
		 * @param {*} item 
		 * @returns 
		 */
		messageTime: function (item) {
			return this.$global.formatDate(item.createTime, "HH:mm:ss");
		},
		/**
		 * 消息详情
		 */
		toMessageDetail: function (item) {
			window.open(item.targetUrl);
		},
		/**
		 * 忽略当前消息
		 * @param {*} item 
		 * @param {*} index 
		 */
		removeCurrMessage: function (item) {
			this.setMessageRead([item.id]);
		},
		/**
		 * 确认设置无人值守
		 */
		confirmSetUnnatteded: function () {
			this.setUnnatteded();
			// var _this = this,
			// 	unattended = this.unattendedConfig,
			// 	number = unattended.number,
			// 	url = "api/call/by/number/" + number;

			// 	if (number !== "") {
			// 		this.$http.get(url).then(function (res) {
			// 			var data = res.data || {},
			// 				count = 0;
			// 			for (var key in data) {
			// 				count++;
			// 			}
			// 			_this.$global.showError("转接号码不存在");
			// 			if (count > 0) _this.setUnnatteded();
			// 		})
			// 		return;
			// 	}
			// _this.setUnnatteded();
			// this.showUnattendedDialog = false;
		},
		/**
		 * 设置无人值守
		 */
		setUnnatteded: function () {
			var url = "/api/v2/index/unattended/active",
				unattended = this.unattendedConfig,
				_this = this,
				data = {
					password: unattended.password,
					number: unattended.number
				};

			this.$http.post(url, data).then(function (res) {
				_this.$global.showSuccess($i.t("v2Ijs1"));
				_this.$set(_this.unattendedConfig, "unattended", 1); // 值守中
				_this.$set(_this.unattendedConfig, "password", "");
			})
		},
		/**
		 * 确认取消无人值守
		 */
		 confirmUnlockUnattended: function () {
			var url = "/api/v2/index/unattended/cancel",
				unattended = this.unattendedConfig,
				_this = this,
				data = {
					password: unattended.password
				};

			this.$http.post(url, data).then(function (res) {
				_this.$global.showSuccess($i.t("v2Ijs2"));
				_this.$set(_this.unattendedConfig, "unattended", 0);
				_this.showUnattendedDialog = false;
			})
		},
		/**
		 * 取消设置无人值守
		 */
		cancelSetUnnatteded: function () {
			this.showUnattendedDialog = false;
		},
		changePatrolType: function (val) {
			this.patrolType = val;
		},
		changePlace: function (val) {
			var count = 0;
			for (var key in val) {
				count++
			}
			this.$nextTick(function () {
				if (count <= 0) this.placeId = "all";
			})
		},
		/**
		 * 初始化设备列表
		 */
		getDevList: function () {
			var url = "api/v2/index/inspection/property-types",
				_this = this;

			this.$http.get(url).then(function (res) {
				_this.devList = res.data.filter(function (item) {
					return item.nameEn;
				});
			})
		},
		/**
		 * 初始化地点数据
		 */
		getPlaceList: function () {
			var _this = this;
			var data = {
				permission: "controlCenter"
			};
			this.$http.get("api/v2/index/places/0/permission", data).then(function (res) {
                if (!res.data.length) return;
				_this.jsonPlaceData = res.data;
				var placeData = _this.$global.jsonTree(res.data, {});
				_this.placeList = placeData;
				_this.$nextTick(function () {
					var placeId = _this.initLatelyPatrolRecord.placeId;
					if (placeId !== null) {
						_this.placeId = placeId;
						_this.oldPlaceId = placeId;
					}
				})
			})
		},
		/**
		 * 导出巡检结果
		 */
		exportPatrolResult: function () {
			if (!this.initLatelyPatrolRecord.id) return this.$global.showError($i.t("patrolProgressText.nothing"));
			// this.$global.openDownload
			var _this = this,
				id =  this.initLatelyPatrolRecord.id;
				// url = url = "v2/inspection/export";
				var url = this.$global.fullServerUrl("api/inspection/record/export?id=" + id);
				this.downloadFile(url);
		},
		downloadFile: function (url) {
			var _this = this;
			var ajax = new XMLHttpRequest();
			this.exportLoading = true;
			ajax.responseType = "blob";
			ajax.open("GET", url, true)
			ajax.onload = function () {
				_this.exportLoading = false;
				if (this.status == 200) {
					var filename = $i.t("v2Ijs3") + _this.$global.formatDate(new Date(), "YYYY-MM-DD_HH_mm");
					filename = decodeURI(filename);
					_this.handleDownloadResponse(this.response, filename, "application/vnd.ms-excel");
					return;
				}

				//非正常状态
				_this.$global.showError($i.t("v2Ijs4"));
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
		/**
		 * 设置类别 检测文本
		 * @param {*} item 当前大类
		 * @param {*} key 当前类的类型key
		 * @returns 
		 */
		 patrolRecordStatisticsText: function (item, key) {
			var data = this.initLatelyPatrolRecord,
				total = {
					"off-line": { value: data.statusEquipmentTotal, text: "离线" },
					"warning": { value: data.warningEquipmentTotal, text: "预警" },
					"fault": { value: data.faultEquipmentTotal, text: "故障" }
				},
				content = this.patrolRecordContent[key].content.length,
				value = total[key].value;

			var result = "";
			// 巡查在线设备200台，以下10台设备离线，需要检查

			if (this.patrolProgressType == "nothing") return $i.t("v2Iml24");
			if (this.startPatrol) return $i.t("patrolRecordStatisticsText")[key];
			result = content > 0 ? $i.t("v2Ijs5", {total: value, num: content}) : $i.t("v2Iml22");
			return result;
		},
		/**
		 * 忽略本次巡检记录
		 * @param {*} data 
		 * @param {*} item 
		 */
		ignoreInspectionDetail: function (data, item) {
			var url = "api/v2/index/inspection/detail/ignore",
				id = item.id,
				config = {loading: false}
				_this = this;

			this.$http.post(url, {detailId: id}, config).then(function (res) {
				_this.$global.showSuccess($i.t("toast[7]"));
				var newContent = data.content.filter(function (el) { return el.id != item.id });
				_this.$set(data, "content", newContent);
				_this.handlerPatrolRecordData({details: newContent});
			})
		},
		/**
		 * 获取最近一次巡检记录
		 */
		getLatelyPatrolRecord: function () {
			var url = "api/v2/index/inspection/record/lately",
				_this = this;
			
			this.$http.get(url).then(function (res) {
				var data = res.data;
				_this.patrolTime.value = data.endTime - data.startTime;
				_this.initPatrolRecordAllData(data, true);
				if (!_this.placeList.length) _this.getPlaceList();
				if (!_this.devList.length) _this.getDevList();

				if (data.placeId !== null) {
					_this.patrolType = 1;
				}
				if (data.propertyFlags) {
					_this.patrolType = 0;
					_this.devType = data.propertyFlags.split(",");
					_this.oldDevType = data.propertyFlags.split(",");
				}
			})
		},
		/**
		 * 所有需要初始化的巡检数据
		 * @param {*} data 后端返回的数据
		 * @param {*} allDetail 是否一次渲染所有详情数据 只在初始时为真
		 */
		initPatrolRecordAllData: function (data, allDetail) {
			this.initLatelyPatrolRecord = data;
			this.warningValue = data.warningEquipmentAbnormal; // 预警总数
			this.faultValue = data.faultEquipmentAbnormal; // 故障总数
			this.rateValue = Math.min(parseInt(Math.round(data.progress)), 100); // 进度
			this.initPatrolStatusData(data); // 初始化巡检设备状态统计
			this.$nextTick(function () {
				var details = allDetail ? {details: data.details} : data;
				this.handlerPatrolRecordData(details);
				this.initCircularValue(!allDetail);
				this.initLineEchart(!allDetail);
				// this.handlerPatrolRecordData(data);
			})
		},
		placeAllDiasble: function () {
			return this.startPatrol;
		},
		initPatrolStatusData: function (data) {
			var _this = this;
			this.patrolStatusData.forEach(function (item) {
				_this.$set(item, "value", data[item.type] || 0);
			})
		},
		/**
		 * 修改巡检状态 开始 停止
		 */
		changePatrolStatus: function () {
			var _this = this,
				patrolTime = this.patrolTime,
				url = "api/v2/index/inspection/start",
				propertyTypes = this.devType.join(","),
				patrolType = this.patrolType,
				params = {
					propertyTypes: propertyTypes || null,
					placeIds: this.placeId ? this.placeId.join(",") : null
				},
				config = {
					loading: false
				};

			if (patrolType === 0) delete params.placeIds;
			if (patrolType === 1) delete params.propertyTypes;
			for (var key in params) {
				if (!params[key]) delete params[key];
			}
			if (!this.startPatrol) {
				this.$http.post(url, params, config).then(function (res) {
					_this.startPatrol = true;
					_this.patrolProgressType = "thisTime";
					for (var key in _this.patrolRecordCollapseData) {
						_this.patrolRecordCollapseData[key].content = [];
						_this.patrolRecordCollapseData[key].height = 0;
					}
					_this.patrolTime.value = 0;
					var data = res.data;
					_this.initPatrolRecordAllData(data);

					_this.getPatrolDetail(data.id);

					_this.patrolTime.time = setInterval(function () {
						// console.log(_this.patrolTime.value);
						_this.getPatrolDetail(data.id);
					}, patrolTime.total)
				})
			} else {
				this.cancelOnSiteInspection();
			}

			
			/**
				if (this.startPatrol) {
					this.patrolTime.time = setInterval(function () {
						_this.patrolTime.value += 1000;
					}, 1000)
				} else {
					clearInterval(this.patrolTime.time);
					this.patrolTime.time = null;
					this.patrolProgressType = "thisTime";
				}
			 */
			
		},
		/**
		 * 取消巡检
		 */
		cancelOnSiteInspection: function () {
			if (!this.startPatrol) return;
			var _this = this;
			_this.startPatrol = false;
			clearInterval(this.patrolTime.time);
			this.patrolTime.time = null;
			this.patrolProgressType = "thisTime";
			var url = "/api/v2/index/inspection/cancel",
				params = {
					id: this.initLatelyPatrolRecord.id
				}
			this.$http.post(url, params).then(function (res) {
				var data = res.data;
				_this.$global.showSuccess($i.t("toast[7]"));
				_this.startPatrol = false;
				if (_this.patrolTime.pushTime) {
					clearInterval(_this.patrolTime.pushTime);
					_this.patrolTime.pushTime = null;
				}
				if (_this.patrolTime.time) {
					clearInterval(_this.patrolTime.time);
					_this.patrolTime.time = null;
				}
				_this.initPatrolRecordAllData(data);
				for (var key in _this.patrolRecordCollapseData) {
					_this.$set(_this.patrolRecordCollapseData[key], "loading", false);
				}

			})
		},
		/**
		 * 获取巡检详情
		 * @param {*} id 巡检id
		 */
		getPatrolDetail: function (id) {
			var url = "api/v2/index/inspection/record/byId",
				_this = this,
				params = {id: id},
				config = {loading: false}

				this.$http.get(url, params, config).then(function (res) {
					var data = res.data;
					if (data.status === 1) {
						clearInterval(_this.patrolTime.time);
						_this.patrolTime.time = null;
						_this.startPatrol = false;
						_this.patrolProgressType = "thisTime";
						_this.patrolTime.value = data.duration;
					} else {
						_this.patrolTime.value += _this.patrolTime.total;
					}
					_this.initPatrolRecordAllData(data);
				})
		},
		handlerPatrolRecordData: function (data) {
			var arr = data.details || [];
			var obj = {},
				_this = this,
				keys = {
					"online": "off-line",
					"warning": "warning",
					"fault": "fault",
				}
			arr.forEach(function (item) {
				var key = keys[item.step];
				if (!obj[key]) obj[key] = [];
				var content = _this.patrolRecordCollapseData[key].content;

				if (data.step) {
					var some = content.some(function (el) {return el.id === item.id });
					if (!some) obj[key].push(item);
				} else {
					obj[key].push(item);
				}
			});
			if (data.status == 1) {
				this.patrolRecordCollapseActive = "off-line";
				for (var key in _this.patrolRecordCollapseData) {
					_this.$set(_this.patrolRecordCollapseData[key], "loading", false);
				}
			}
			var detail = [];
			for (var key in obj) {
				detail = detail.concat(obj[key]);
			}
			if (detail.length <= 0) return;

			if (data.step) {
				var total = this.patrolTime.total;
				var number = parseInt(total / detail.length) <= 0;
				number = number <= 0 ? 1 : number;

				if (this.patrolTime.pushTime) {
					clearInterval(this.patrolTime.pushTime);
					this.patrolTime.pushTime = null;
				}

				var index = 0;
				this.patrolTime.pushTime = setInterval(function () {
					var size = detail.length > total ? Math.ceil(detail.length / total) : 1;
					var list = detail.slice(index, index + size);
					list.forEach(function (item) {
						var currKey = keys[item.step];
						for (var key in _this.patrolRecordCollapseData) {
							_this.$set(_this.patrolRecordCollapseData[key], "loading", false);
						}
						_this.patrolRecordCollapseActive = currKey;
						_this.currPatrolType = currKey;

						_this.patrolRecordCollapseData[currKey].content.push(item);
						var height = (_this.patrolRecordCollapseData[currKey].height * 1) + 40;
						_this.$set(_this.patrolRecordCollapseData[currKey], "height", height);
						_this.$set(_this.patrolRecordCollapseData[currKey], "loading", true);
						var top = _this.$refs.atrolRecordCollapse.$el.offsetHeight;
						_this.$refs.patrolRecordScrollbar.wrap.scrollTop = top;
					});

					index += size;

					// setTimeout(function () {clearInterval(_this.patrolTime.pushTime);},2000)
					if (index >= detail.length - 1) {
						clearInterval(_this.patrolTime.pushTime);
						_this.patrolTime.pushTime = null;
					}
					if (!_this.startPatrol) {
						_this.patrolRecordCollapseActive = "off-line";
						_this.currPatrolType = "";
						for (var key in _this.patrolRecordCollapseData) {
							_this.$set(_this.patrolRecordCollapseData[key], "loading", false);
						}
					}
				}, number)


			} else {
				// 设置高度 实现折叠面板动画效果
				for (var key in this.patrolRecordCollapseData) {
					if (obj[key]) this.$set(this.patrolRecordCollapseData[key], "height", obj[key].length * 40)
				}


				this.$nextTick(function () {
					// 自动打开折叠面板
					this.patrolRecordCollapseActive = Object.keys(obj);
					this.pushNewPatrolData(obj, true);
				})
			}
		},
		/**
		 * 追加新数据
		 * @param {*} obj 要追加的数据对象列表
		 * @param {*} clear 是否要清空重新追加
		 */
		pushNewPatrolData: function (obj, clear) {
			var _this = this;
			for (var key in obj) {
				// 清空是为什么重新追加 以防追加相同的数据
				if (clear) this.patrolRecordCollapseData[key].content = [];
				var list = obj[key];
				if (this.patrolRecordCollapseData[key]) {
					list.forEach(function (item) {
						_this.patrolRecordCollapseData[key].content.push(item);
					});
				}
			}
		},
		/**
		 * 获取消息列表
		 */
		getMessageList: function () {
			var url = "api/v2/index/msgs/unread/user",
			_this = this,
			data = this.messageParams,
			config = {
				loading: {
					context: this,
					target: "messageLoading",
				}
			};
			this.$http.get(url, data, config).then(function (res) {
				var result = res.data;
				_this.messageListData = result.data;
				_this.messageCount = result.count;
			})
		},
		/**
		 * 
		 * @param {array} ids
		 */
		setMessageRead: function (ids) {
			var url = "api/v2/index/msgs/read/byIds",
			_this = this,
			data = { msgIds: ids.join(",") }
			config = {
				loading: false
			};
			this.$http.post(url, data).then(function (res) {
				var newList = _this.messageListData.filter(function (el) {
					return ids.indexOf(el.id) === -1;
				})
				_this.messageListData = newList;
			})
		},


		// 计算渐变中心以及渐变半径
		calc: function  (theta1, theta2) {
			var r = 0.5; // 半径是0.5 其实表示0.5个直径
			var inner = 0.8; // 里面镂空部分占60%  option中radius为[45%, 55%]  55 * 0.8 == 45

			var cos = Math.cos;
			var sin = Math.sin;
			var PI = Math.PI;
			var min = Math.min;
			var max = Math.max;

			var bottom = 0;
			var left = 2 * r;
			var right = 0;

			// y0: θ1对应的外部点的y值
			// y1: θ2对应的外部点的y值
			// _y0: θ1对应的内部点的y值
			// _y1: θ2对应的内部点的y值
			// x0: θ1对应的外部点的x值
			// x1: θ2对应的外部点的x值
			// _x0: θ1对应的内部点的x值
			// _x1: θ2对应的内部点的x值
			var y0 = r * (1 - cos(theta1));
			var y1 = r * (1 - cos(theta2));

			var _y0 = r * (1 - inner * cos(theta1));
			var _y1 = r * (1 - inner * cos(theta2));

			// 如果这个弧经过θ == PI的点  则bottom = 2PI
			// bottom用于之后的max计算中
			if (theta1 < PI && theta2 > PI) {
				bottom = 2 * r;
			}
			// 计算这几个点的最大最小值
			var ymin = min(_y0, _y1, y0, y1);
			var ymax = max(_y0, _y1, y0, y1, bottom);

			var x0 = r * (1 + sin(theta1));
			var x1 = r * (1 + sin(theta2));

			var _x0 = r * (1 + inner * sin(theta1));
			var _x1 = r * (1 + inner * sin(theta2));

			// 如果这个弧经过θ == PI / 2的点  则right = 2PI
			if (theta1 < PI / 2 && theta2 > PI / 2) {
				right = 2 * r;
			}
			// 如果这个弧经过θ == PI / 2 * 3的点  则left = 0
			if (theta1 < PI / 2 * 3 && theta2 > PI / 2 * 3) {
				left = 0;
			}
			var xmin = min(_x0, _x1, x0, x1, left);
			var xmax = max(_x0, _x1, x1, x0, right);

			return {
				// 计算圆心以及半径
				center: [(r - xmin) / (xmax - xmin), (r - ymin) / (ymax - ymin)],
				radius: r / min(xmax - xmin, ymax - ymin)
			}
		},

		initCircularValue: function (animation) {
			var rateValue = this.rateValue || 0,
				_this = this,
				data = [
					{value: (100 - rateValue), color0: '#223549', color1: '#0E76B7'},
					{value: rateValue, color0: '#1E4D61', color1: '#00D8E2'},
				],
				total = data.map(v => v.value).reduce((o, n) => o + n );

			// 计算每一个data的其实角度和末了角度 θ1和θ2
			data.reduce((o, v) => {
				v.theta1 = o;
				v.theta2 = o + v.value / total;
				return v.theta2
			}, 0);

			data.forEach(function (v, i) {
				var ops = _this.calc(v.theta1 * 2 * Math.PI, v.theta2 * 2 * Math.PI);
				if (v.value) v.itemStyle = {
					color: v.color1
					// color: {
					// 	type: 'radial',
					// 	x: ops.center[0],
					// 	y: ops.center[1],
					// 	r: ops.radius,
					// 	colorStops: [{
					// 		offset: 0, color: v.color0
					// 	},{
					// 		offset: 0.9, color: v.color0
					// 	},{
					// 		offset: 0.8, color: v.color1
					// 	}, {
					// 		offset: 1, color: v.color1
					// 	}],
					// 	globalCoord: false // 缺省为 false
					// }
				}
			})

			this.initCircularEchart(data, animation);
		},
		initCircularEchart: function (data, animation) {
			var chartDom = document.getElementById("rate-echart");
			var myChart = echarts.init(chartDom),
				rate = this.rateValue || 0,
				option = {
					animation: animation,
					title: {
						text: rate + "%",
						x: 'center',
						y: "35%",
						textStyle: {
							fontWeight: 'normal',
							fontSize: 21,
							fontWeight: "bold",
							color: "#FFF",
						}
					},
					series: [{
							type: 'pie',
							hoverAnimation: false,
							radius: ['100%', '80%'],
							z: 2,
							labelLine: {
								show: false
							},
							emptyCircleStyle: {
								color: "#22242D"
							},
							data: data
						},
						{
							type: 'pie',
							hoverAnimation: false,
							radius: ['79%', '0%'],
							z: 2,
							labelLine: {
								show: false
							},
							emptyCircleStyle: {
								borderColor: "#90897D",
								borderWidth: 2,
								color: "#22242D"
							},
							data: []
						},
					]
				};

			option && myChart.setOption(option);
		},
		initLineEchart: function (animation) {
			var chartDom = document.getElementById("line-echart");
			var myChart = echarts.init(chartDom),	  
				rate = this.rateValue,
				option = {
					animation: animation,
					grid: {
						left: 0,
						right: 0,
						bottom: 0,
						top: 0,
					},
					xAxis: {
						show: false,
						type: 'value'
					},
					yAxis: [{
						type: 'category',
						inverse: true,
						axisLabel: {
							show: false,
							textStyle: {
								color: '#fff'
							},
						},
						splitLine: {
							show: false
						},
						axisTick: {
							show: false
						},
						axisLine: {
							show: false
						},
					}],
					series: [{
							name: '值',
							type: 'bar',
							zlevel: 1,
							barWidth: "100%",
							data: [rate],
							itemStyle: {
								normal: {
									barBorderRadius: 30,
									color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
										offset: 0,
										color: '#0093EB'
									}, {
										offset: 1,
										color: '#62C7FF'
									}]),
								},
							}
						},
						{
							name: '背景',
							type: 'bar',
							barWidth: "100%",
							barGap: '-100%',
							data: [100],
							itemStyle: {
								color: '#35373F',
								barBorderRadius: 7,
							},
						},
					]
				};

			option && myChart.setOption(option);
		},
		goToIpIntercom: function() {
			if(this.init == null || this.init.ipIntercomUrl == null) {
				this.$global.showError($i.t("v2Ijs6"));
				return;
			}
			window.open(this.init.ipIntercomUrl);
		},


		showIpIntercom: function () {
			if (this.onCallAndDotWatch) return this.handleHangUp();
			this.showIpDialog = true;
			if (!this.$stompClient) this.$initWebSocket();
			this.getIntercomList();
		},
		/**
		 * 获取IP对讲列表
		 */
		getIntercomList: function (dotLoading) {
			var url = "api/call/byDto",
				_this = this,
				types = this.intercomNumberTypes.filter(function (item) {
					return _this.activeIntercomNumberType == item.name
				})[0],
				number = this.intercomParams.number,
				data = {
					types: types.value,
					likeNumber: number,
					index: 0,
					num: 0
				},
				config = {
					loading: {
						context: this,
						target: "intercomListLoading",
					}
				};
				if (dotLoading) {
					config.loading = false	
				}

			this.clearIntervalIntercomList();
			this.$http.get(url, data,config).then(function (res) {
				var result = res.data;
				_this.intercomList = result.data;
				_this.intercomListTime = setInterval(function () {
					_this.getIntercomList(true);
				}, 6000 * 100);
			})
		},
		/**
		 * 清除获取列表的定时器
		 */
		clearIntervalIntercomList: function () {
			if (this.intercomListTime) {
				clearInterval(this.intercomListTime);
				this.intercomListTime = null;
			}
		},
		/**
		 * 切换类型
		 * @param {*} node 
		 */
		changeIntercomNumberTypes: function (node) {
			this.intercomList = [];
			this.getIntercomList();
		},
		/**
		 * 处理在线状态
		 * @param {*} item 
		 * @returns 
		 */
		handleIntercomStatus: function (item) {
			var status = item.onlineStatus;
			if (!status) return 0; // 离线
			if (status[1]) return 2; // 占线
			return 1; // 在线
		},
		callNumber: function (item) {
			// this.currCallSpeed = "onCall"
			// this.setTotalTime();
			// return
			if (this.notUserNumber) return this.$global.showError($i.t("v2Ijs7"));
			this.sendIPButtonData = item;
			if (!this.$stompClient.connected) return this.$initWebSocket();
			if (!this.isOk) return this.showOpenOMCSDialog = true;
			if (item.number == this.userData.number) return this.$global.showError($i.t("v2Ijs8"));
			if (item.placeId) this.intercomParams.placeId = item.placeId;

			if (this.currCallSpeed == "onCall") return this.hangUpPlaceCall(item.number);
			this.numberByPlace(item.number);
		},
		/**
		 * 关闭IP列表弹框
		 */
		colseIntercomDialog: function () {
			this.showIpDialog = false;
		},
		/**
		 * 获取当前账号终端号码
		 */
		getMyTerminalNumber: function () {
			var url = "api/call/web",
				_this = this;
			var config = {
				showError: false
			}
			this.$http.get(url, null, config).then(function (res) {
				_this.fromId = res.data.number;
				_this.userData = res.data;
				_this.remindOmcs = localStorage.getItem("remind") != 0;
				if (_this.remindOmcs) _this.$initWebSocket();	
			}).catch(function (err) {
				console.log(err);
			})
		},



		// #region  WebSocket 的一系列操作

		$initWebSocket: function () {
			var socket = new SockJS(_config.server.ipIntercom + "/websocket", null, {
				timeout: 15000
			}),
				_this = this,
				uId = this.userData.userId;
			this.$stompClient = Stomp.over(socket);

			/**
			 * 总机接听成功后触发该事件，此时控制中心需要切到对应的地点
			 * @type {string}
			 * {placeId:xx,terminalNumber:xxx}
			 */
			var centralConnectedUrl = '/user/' + uId + '/remote-request/central/connected';

			this.$stompClient.connect({
				userId: this.fromId
			}, function (frame) {
				console.log("控制中心websocket连接成功:", _config.server.ipIntercom + "/websocket")
				if (_this.showOMCSDialog && !_this.isOk) {
					if (_this.omcsClient) _this._destroy();
					_this.initOmcsClient(); // 点某个地点才初始化omcs
				}

			}, function () {
				_this.isOk = false;
				console.log("socket连接失败，2秒后重试")

				if (_this.iPIntercomTime) clearInterval(_this.iPIntercomTime);
				if (_this.webSocketTime) clearTimeout(_this.webSocketTime);
				_this.iPIntercomTime = null;
				_this.webSocketTime = setTimeout(function () {
					_this.$initWebSocket();
				}, 2000);
				_this.initHeart();
				if (_this.omcsClient) _this._destroy();
			});
		},
		subscribeWebSocket: function () {
			var _this = this,
				userId = this.fromId;
			var sendUrl = '/user/' + userId + '/remote-request/send';
			var responseUrl = '/user/' + userId + '/remote-request/response';
			var cancelUrl = '/user/' + userId + '/remote-request/cancel';
			var callNotifyUrl = '/user/' + userId + '/call-client/notify';

			// v2版本新增的事件订阅(2022年7月11日)
			/**
			 * 对方挂断时触发该事件
			 * @type {string}
			 * {targetId:xxx,requestId:xxx}
			 * @targetId:为要通知挂断的号码
			 */
			var hangUpUrl = '/user/' + userId + '/remote-request/hang-up';

			var sendResult = this.$stompClient.subscribe(sendUrl, function (message) { // 呼入
				console.log("send:", message)
				var data = JSON.parse(message.body);
				_this.currCallSpeed = "incomingCall";
				_this.iPIntercomObj = data;

				_this.confirmNetwork(true);

				if (data.watchCall) { // 监听 开启麦克风
					_this.responseCallRequire(1);
				} else if (data.forceCall) { // 强制呼
					_this.responseCallRequire(1);
				} else {
					_this.showIncomingCallDialog = true;
				}
				_this.toId = data.fromId;
				_this.setGuestsStatus(data.type, [data.fromId]);
				_this.initHeart();
			});

			var responseResult = this.$stompClient.subscribe(responseUrl, function (message) { // 别人响应
				console.log("response:", message)
				var data = JSON.parse(message.body),
					reply = data.reply;
				if (_this.callReasultTime) clearTimeout(_this.callReasultTime);

				if (reply == 0) { // 拒接
					_this.currCallSpeed = "";
					_this.closeMicrophoneAndInitHeart();
				} else if (reply == 2) { // 转接
					_this.sendIPIntercom(data.transferId);
				} else if (reply == 1) {
					_this.currCallSpeed = "onCall";
					// 非监听才提示对方接听
					if (!_this.iPIntercomObj.watchCall) {
						_this.$global.showSuccess($i.t("v2Ijs9"));

						/**
						 * callClientNotify 对方是否有发送麦克风连接状态回调
						 * 如果对方接听后还是未发送通知 则提示未响应
						 * 发送通知则清除定时器
						 */
						if (!_this.callClientNotify) _this.callClientNotify = setTimeout(function () {
							_this.$global.showError($i.t("v2Ijs10"));
						}, 10 * 1000);
					}
					// _this.showCallDialog = false;
					_this.setTotalTime();
					_this._microphone();
					_this.setGuestsStatus(1, [_this.toId], 1, true);
					_this.initHeart();
				}

			});

			var cancelResult = this.$stompClient.subscribe(cancelUrl, function (message) { // 对方取消
				console.log("cancel:", message)
				var data = JSON.parse(message.body);
				if (_this.iPIntercomObj.requestId != data.requestId) return;
				_this.closeMicrophoneAndInitHeart();
			});


			var hangUpResult = this.$stompClient.subscribe(hangUpUrl, function (message) { // 对方挂断
				console.log(message);
				console.log("connected:", message)
				var data = JSON.parse(message.body);

				if (_this.iPIntercomObj.requestId != data.requestId) return;
				if (!_this.iPIntercomObj.watchCall) _this.$global.showError($i.t("v2Ijs11"));
				_this.iPIntercomObj = {};
				_this.closeMicrophoneAndInitHeart(true);
			});

			var notifyResult = this.$stompClient.subscribe(callNotifyUrl, function (message) { // 对方通知
				console.log("/call-client/notify:", message);
				if (_this.iPIntercomObj.watchCall) return;
				var data = JSON.parse(message.body),
					devType = data.devType,
					ping = devType.ping,
					pong = devType.pong;

				if (ping && _this.iPIntercomObj.requestId == ping) _this.sendCallNotify("pong", _this.iPIntercomObj.requestId);
				if (pong && _this.iPIntercomObj.requestId == pong) _this.onLineCount--;

				if (_this.callClientNotify && devType.microphone != undefined) {
					clearTimeout(_this.callClientNotify);
					_this.callClientNotify = null;
				}

				var micro = devType.microphone;
				// 麦克风是否可用
				if (micro != undefined && micro > 0) _this.$global.showError($i.t("v2Ijs12"));
			});

			var arr = [sendResult.id, responseResult.id, cancelResult.id, hangUpResult.id, notifyResult.id];
			this.subscribeIds = arr;
		},
		/**
		 * 取消订阅
		 */
		cancelAllIpSubscribe: function () {
			var _this = this;
			this.currCallSpeed = "";
			this.subscribeIds.forEach(function (id) {
				_this.$stompClient.unsubscribe(id);
			});
			this.$nextTick(function () {
				this.subscribeIds = [];
			})
		},
		/**
		 * 给对方发送消息
		 * @param {*} key 消息key
		 * @param {*} val 消息内容
		 */
		sendCallNotify: function (key, val) {
			var data = {
				toId: this.toId,
				requestId: this.iPIntercomObj.requestId,
				devType: {}
			};
			data.devType[key] = val;
			this.$stompClient.send("/app/call-client/notify", {}, JSON.stringify(data));
		},






		initHeart: function (guests) {
			var _this = this;
			guests = guests || {};
			this.heart(guests);

			if (this.iPIntercomTime) clearInterval(this.iPIntercomTime);
			this.iPIntercomTime = setInterval(function () {
				_this.heart(guests);
			}, (1000 * 10));
		},
		heart: function (guests) {
			console.log("<<<<<<<<<<<<<<<<<<  heart >>>>>>>>>>>>>>>>>>>>>>>>");
			var data = {
				id: this.fromId,
				guests: this.guestsStatus
			}
			if (data.guests.p1) data.guests.p1.time = this.totalSecond;
			// 10秒发一次
			this.$stompClient.send("/app/omcs/heart", {}, JSON.stringify(data));
		},
		/**
		 * 设置心跳值
		 * @param {*} type 0 远程 1 IP对讲
		 * @param {*} toId 对方号码
		 * @param {*} caller 自己是否为呼叫方
		 * @param {*} isP1 是否需要追加p1
		 */
		setGuestsStatus: function (type, toId, caller, isP1) {
			var p1 = {
				number: toId[0],
				time: this.totalSecond,
				caller: caller,
			}
			if (this.callStartTime) p1.startTime = this.callStartTime.getTime();
			if (isP1) this.$set(this.guestsStatus, "p1", p1);
			this.$set(this.guestsStatus, type, toId);
		},

		// #endregion








		// #region  远程的一系列操作
		returnRemoteCavasStyle: function () {
			return this.remoteCavasStyle;
		},
		_init: function () {
			this.omcsClient.init();
		},
		/**
		 * 设置不提示弹框
		 */
		setDotRemind: function () {
			localStorage.setItem("remind", 0);
			this.showOpenOMCSDialog = false;
		},
		/**
		 * 下载omcs插件
		 */
		downOmcsCallback: function () {
			this.downloadPlugin();
			this.showOpenOMCSDialog = false;
		},
		/**
		 * 打开omcs
		 */
		openOmcs: function () {
			this.openPlugin();
			this.showOpenOMCSDialog = false;
		},
		/**
		 * 重新连接omcs插件
		 */
		retryOpenOmcs: function () {
			if (this.omcsClient) this._destroy(true);
			else this._connect();
			this.showOpenOMCSDialog = false;
		},
		/**
		 * 处理挂断 和 取消
		 */
		handleHangUp: function () {
			if (this.currCallSpeed == "call") this.cancelExhale();
			if (this.currCallSpeed == "onCall") this.hangUpPlaceCall();
		},
		/**
		 * 连接
		 * @returns 
		 */
		initOmcsClient: function () {
			if (this.isOk) return;
			var _this = this;
			this.omcsClient = new OmcsClient({
				id: _this.fromId,
				serverIP: _config.omcs.ip,
				serverPort: _config.omcs.port,
				pluginDownloadUrl: _config.omcs.pluginDownloadUrl,
				connectOmcsServiceError: function (error) {
					console.log("connectOmcsServiceError:", error);
					if (_this.subscribeIds.length) _this.cancelAllIpSubscribe();
					_this.showOpenOMCSDialog = true;
				},
				connectSuccessCallback: function () {
					console.log("login success!!!");
					// _this.$global.showSuccess("连接服务器成功");
					_this.subscribeWebSocket();

					_this.isOk = true;
					_this.initHeart();

					var item = _this.sendIPButtonData;
					if (item) {
						_this.$nextTick(function () {
							_this.sendIPIntercom(item.number);
							_this.sendIPButtonData = null;
						});
					}
				},
				initCloseCallback: function () {
					/**
					 * isOk ? 表示已经连接成功过一次
					 */
					if (_this.isOk) {
						if (_this.handlerActiveMenu.mark != "controlCentralV2") _this.$global.showError($i.t("v2Ijs13"));
						_this.cancelAllIpSubscribe();
					}
					if (_this.iPIntercomTime) clearInterval(_this.iPIntercomTime);
					_this.isOk = false;
					console.log("-close-");
				},
				initOpenCallback: function () {
					console.log("-open-");
				},
				errorCallback: function (err) {},
				connectFailCallback: function (err) {
					_this.$global.showError($i.t("v2Ijs14"));
				},
				guestsUpdateCallback: function (guests) {
					console.log("guestsUpdateCallback:", guests);
					// 此处回调后，说明guests状态发生了改变，立即做心跳，保证在线/占线状态最新
				},
				connectionInterruptedCallback: function (serverIP) { // 断开连接
					console.log("connectionInterruptedCallback", serverIP);
					if (_this.handlerActiveMenu.mark != "controlCentralV2") _this.$global.showError($i.t("v2Ijs13"));
					_this.isOk = false;
					if (_this.iPIntercomTime) clearInterval(_this.iPIntercomTime);
					_this.cancelAllIpSubscribe();
				},
				connectionRebuildSucceedCallback: function () {
					console.log("connectionRebuildSucceedCallback");
					_this._destroy();
					_this.$nextTick(function () {
						_this.$initWebSocket();
					})
				},
				connectionRebuildSuccessCallback: function (serverIP) { // 重连成功
					console.log("connectionRebuildSuccessCallback", serverIP);
					_this.isOk = true;
					_this.closeMicrophoneAndInitHeart();
				},
				// omcsClient.desktopSetWatchingOnly(watchOnly);  watchOnly ? 不可操作 : 可操作
				/**
				 * 对方突然断连的回调
				 * @param {*} id 对方的短号
				 * @param {*} type 监听 || 远程 || ip
				 */
				deviceDisconnectedCallback: function (id, type) { }
			});

			this._init();
		},
		/**
		 * 下载omcs
		 */
		downloadPlugin: function () {
			this.omcsClient.downloadPlugin();
		},
		/**
		 * 打开omcs
		 */
		openPlugin: function () {
			this.omcsClient.openPlugin();
		},
		/**
		 * 连接omcs
		 */
		_connect: function () {
			this.omcsClient.connect();
		},
		/**
		 * 更新在线状态
		 */
		_desktopGuests (value) {
			this.omcsClient.updateGuests(value);
		},
		/**
		 * 断开
		 */
		_disconnect: function () {
			this.omcsClient.disconnect();
			this.isOk = false;
		},
		/**
		 * 摧毁
		 */
		_destroy: function (init) {
			this.omcsClient.destroy();
			this.isOk = false;
			if (init) this.initOmcsClient();
		},
		/**
		 * 麦克风
		 * @param {*} openMonitor 是否打开监听
		 */
		_microphone: function (toId) {
			var _this = this;
			var toId = toId || this.toId;
			console.log("麦克风:", toId);
			this.omcsClient.microphone({
				destId: toId,
				connectEndedCallback: function (baseResult) {
					console.log("-microphoneConnectEnded-");
					console.log(baseResult);
					if (_this.currIpButtonKey != "ip_monitor") _this.sendCallNotify("microphone", baseResult.ResultCode);
					_this.$global.showSuccess("连接对方麦克风" + baseResult.FailCause);
				}
			})
		},
		/**
		 * 取消麦克风
		 */
		_microphoneClose: function () {
			console.log("_microphoneClose");
			this.omcsClient.microphoneDisconnect();
		},
		setTotalTime: function () {
			var _this = this;
			this.totalSecond = 0;
			if (this.totalTime) clearInterval(this.totalTime);
			this.totalTime = setInterval(function () {
				_this.totalSecond += 1;
			}, 1000);
		},
		/**
		 * 发起请求 根据当前点击的ip对讲按钮 执行不同的操作
		 * @param {*} item 
		 */
		sendIPIntercom: function (id) {
			this.toId = id;
			this.callCurrPlaceTerminal();
		},
		/**
		 * 取消呼出
		 */
		cancelExhale: function () {
			var _this = this,
				url = "api/remote-request/cancel",
				data = {
					fromId: this.fromId,
					toId: this.toId,
					requestId: this.iPIntercomObj.requestId
				},
				config = {
					contentType: "application/json"
				};
			this.$http.post(url, JSON.stringify(data), config).then(function (res) {
				_this.currCallSpeed = "";
				_this.closeMicrophoneAndInitHeart();
			})
		},
		/**
		 * 呼入弹框 点击按钮处理
		 * @param {*} item 当前点击的按钮
		 */
		incomingCallButtons: function (item) {
			var replys = {
				answer: "1", // 接听
				transfer: "2", // 转接
				refuse: "0" // 拒绝
			}
			if (replys[item.type] == 2) {
				this.showTransferDialog = true;
				return;
			}
			this.responseCallRequire(replys[item.type]);
		},
		/**
		 * 响应请求
		 * @param {*} reply 0 拒绝 1 接听 2 转接
		 */
		responseCallRequire: function (reply) {
			var url = "api/remote-request/response",
				record = this.iPIntercomObj,
				_this = this,
				data = {
					reply: reply,
				},
				config = {
					contentType: "application/json"
				}
			var keys = ["fromId", "toId", "type", "requestId"];
			for (var key in record) {
				if (keys.indexOf(key) > -1) data[key] = record[key];
			}
			if (reply == 2) {
				data.transferId = this.transferId;
			}
			if (this.iPIntercomObj.watchCall) {
				config.loading = false
			}
			this.$http.post(url, JSON.stringify(data), config).then(function (res) {
				/**
				 * 监听状态 只需要响应接听 不需要其他操作
				 */
				if (_this.iPIntercomObj.watchCall) return;

				_this.showIncomingCallDialog = false;
				if (reply == 1) { // 点击按钮接听 或者别人强制呼入
					_this.currCallSpeed = "onCall";
					_this._microphone();
					_this.callStartTime = new Date();
					_this.setTotalTime();
					_this.showIncomingCallDialog = false;
					_this.showCallDialog = false;
					_this.setGuestsStatus(record.type, [data.fromId], 0, true); // 设置占线状态
					_this.initHeart();
				} else if (reply != 1) { // 拒绝
					_this.closeMicrophoneAndInitHeart();
					_this.currCallSpeed = "";
				}
			}).catch(function (err) {
				/**
				 * 错误 可能是对方掉线之类的
				 * 则直接让呼入弹框消失
				 * 并重置心跳
				 */
				 _this.showIncomingCallDialog = false;
				_this.closeMicrophoneAndInitHeart();
				console.log(err);
			})
		},
		/**
		 * 确认转接
		 */
		confirmTransfer: function () {
			if (!this.transferId) return this.$global.showError($i.t("v2Ijs15"));
			this.numberByPlace();
		},
		/**
		 * 获取号码是否存在并且 判断是否在线 占线
		 * @param {*} id 
		 * @param {*} isTransfer 是否转接 只在呼入点击转接调用 目前未添加转接逻辑
		 */
		numberByPlace: function (id, isTransfer) {
			id = id == undefined ? this.transferId : id;
			var url = "api/call/by/number/" + id,
				_this = this;
			this.$http.get(url).then(function (res) {
				/**
				 * 如果号码不存在则提示错误
				 * 直到存在才响应请求 并且让弹框消失
				 */
				var data = res.data || {};
				if (data.number != id) return _this.$global.showError($i.t("v2Ijs16"));
				if (!data.onlineStatus) return _this.$global.showError($i.t("v2Ijs17"));
				if (data.onlineStatus && data.onlineStatus[1]) return _this.$global.showError($i.t("v2Ijs18"));
				if (isTransfer) {
					_this.responseCallRequire(2);
					_this.showTransferDialog = false;
				} else {
					_this.sendIPIntercom(id);
				}
			})
		},
		/**
		 * 挂断 当前在童话中则先挂断
		 * @param {*} toId 要呼叫的号码
		 */
		hangUpPlaceCall: function (toId) {
			var url = "api/remote-request/hang-up",
				_this = this,
				config = {
					contentType: "application/json",
				},
				data = {
					targetId: this.toId || this.iPIntercomObj.fromId,
					requestId: this.iPIntercomObj.requestId
				}
			this.$http.post(url, JSON.stringify(data), config).then(function (res) {
				_this.closeMicrophoneAndInitHeart(true);
				if (toId) _this.numberByPlace(toId);
			}).catch(function (err) {
				console.log(err);
			})
		},
		/**
		 * 根据websocket返回的数据判断要设置的按钮key
		 * @param {*} data 后端数据
		 * @returns 
		 */
		buttonTypeValue: function (data) {
			return data.forceCall ? "ip_forced_call" : data.watchCall ? "ip_monitor" : "ip_calling";
		},
		/**
		 * 呼叫当前地点终端
		 * @param {*} item 当前点击的按钮
		 */
		callCurrPlaceTerminal: function () {
			this.iPIntercomObj = {};
			if (this.callReasultTime) {
				clearTimeout(this.callReasultTime);
				this.callReasultTime = null;
			}
			var url = "api/remote-request/send",
				_this = this,
				data = {
					fromId: this.fromId,
					toId: this.toId,
					// toId: "2001",
					type: 1,
					callType: 0
				},
				config = {
					contentType: "application/json",
					showError: false
				}
			if (this.intercomParams.placeId) {
				data.placeId = this.intercomParams.placeId
			}

			this.$http.post(url, JSON.stringify(data), config).then(function (res) {
				var result = res.data;
				_this.currCallSpeed = "call";
				_this.setGuestsStatus(data.type, [data.toId]); // 设置占线状态
				_this.$set(_this.iPIntercomObj, "requestId", result.requestId); // 设置通话id
				_this.$set(_this.iPIntercomObj, "callType", data.callType);
				_this.initHeart();

				_this.showCallDialog = true;
				/**
				 * 类型[1:总机;2:课室终端;3:移动端;4:WEB端;5:远程桌面]
				 * 
				 * 如果呼叫的号码是 总机
				 * 等十秒时候对方都未响应则 提示排队人过多
				 * 反之60秒未响应则取消呼出
				 */
				if (result.toType != 1) {
					if (!_this.callReasultTime) _this.callReasultTime = setTimeout(function () {
						_this.$global.showError($i.t("v2Ijs10"));
						_this.cancelExhale();
					}, 10 * 6000);
				} else {
					if (!_this.callReasultTime) _this.callReasultTime = setTimeout(function () {
						_this.callOutDialogText = $i.t("v2Ijs19");
					}, 10 * 1000);
				}
				_this.confirmNetwork();
			}).catch(function (err) {
				/**
				 * 对方无人值守时 状态码7010
				 * 呼叫状态
				 */
				if (err.code == 7010) {
					var errReasult = err.data;
					_this.toId = errReasult.transferNumber;
					_this.callCurrPlaceTerminal();
					return;
				}
				_this.$global.showError(err.error.msg || $i.t("ccjs65"));
			})
		},
		/**
		 * 确认对方网络是否在线
		 */
		confirmNetwork () {
			var _this = this;
			var currCallSpeed = this.currCallSpeed;

			if (this.onLineCountTime) clearInterval(this.onLineCountTime);
			this.sendCallNotify("ping", this.iPIntercomObj.requestId);
			this.onLineCount++;

			this.onLineCountTime = setInterval(function () {
				if (_this.onLineCount == 2) {
					_this.$global.showError($i.t("v2Ijs20"));
				};
				if (_this.onLineCount >= 5) {
					clearInterval(_this.onLineCountTime);
					_this.onLineCount = 0;
					_this.$global.showError($i.t("v2Ijs21"));
					if (currCallSpeed == "onCall") {
						_this.hangUpPlaceCall();
					}
					if (currCallSpeed == "call") {
						_this.cancelExhale();
					}
					if (currCallSpeed == "incomingCall") {
						_this.responseCallRequire(0);
					}
					return;
				};
				_this.sendCallNotify("ping", _this.iPIntercomObj.requestId);
				_this.onLineCount++;
			}, this.onLineCountTimeNum);

		},
		/**
		 * 关闭麦克风 并且重置心跳
		 * @param {*} closePhone 是否关闭麦克风
		 */
		closeMicrophoneAndInitHeart: function (closePhone) {
			if (this.callReasultTime) clearTimeout(this.callReasultTime); // 未接听提示
			if (this.callClientNotify) clearTimeout(this.callClientNotify); // 麦克风连接回调状态
			if (this.onLineCountTime) clearTimeout(this.onLineCountTime); // 确认在线
			this.callReasultTime = null;
			this.callClientNotify = null;
			this.onLineCountTime = null;
			this.iPIntercomObj = {};
			this.currCallSpeed = "";
			this.guestsStatus = {};
			this.initHeart();
			if (closePhone) this._microphoneClose();
			this.showCallDialog = false;
		},
		// #endregion
		showSuperUserDialog: function() {
			this.superUserData.password = "";
			this.superUserData.show = true;
		},
		confirmSetSuperAdmin: function() {
			if(this.$global.isNull(this.superUserData.password)) {
				this.$global.showError($i.t("v2Ijs22"));
				return;
			}
			var _this = this;
			var param = {
				password: this.superUserData.password
			}
			this.$http.post("/api/v2/index/super-admin/cookie", param)
				.then(function(rs) {
					_this.superUserData.show = false;
					//重新加载网页
					_this.$global.showSuccess($i.t("v2Ijs23"));
				})
				.catch(function(err) {

				})
		}

	},
	watch: {
		"intercomParams.number": function (val) {
			this.searchDebounceNumber();
		},
		activeUrl: function(val, oldVal) {
		}
	},
	filters: {
		
	}
})