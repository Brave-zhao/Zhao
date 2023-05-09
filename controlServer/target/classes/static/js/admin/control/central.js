/**
 * 自定义管理
 */
 var PAGE_NAME = "controlTemplate";
 $i18n.initDefault(PAGE_NAME);
 var $i = $i18n.obj;
 var isNull = function (obj) {
	 if (obj === undefined || obj === null || obj === '') return true;
	 return false;
 }
 
function ImageCompress (option) {

	option.quality = option.quality || 0.9;
	var config = option;

	this.compress = function (file, callback) {
		return process(file, callback);
	}

	this.compressList = function (fileList, formData, callback) {
		var count = 0;
		for (var idx in fileList) {
			var file = fileList[idx].raw;
			this.compress(file, function (res) {
				if (res.status === 0) {
					// 失败，用压缩前的图片
					formData.append("file", file);
				} else {
					// 成功
					formData.append("file", res.file);
				}
				count++;
				// console.log("compress回调完毕:", count, res);
				if (count === fileList.length) callback(formData);
			});
		}
	}

	var supportTypes = [
		"image/png",
		"image/jpeg",
		"image/webp",
		"image/bmp"
	];

	//判断格式是否支持
	function isSupportedType (type) {
		return supportTypes.indexOf(type) !== -1;
	}

	function process (file, callback) {
		var outputType = file.type;
		if (isSupportedType(file.type) === false) {
			// 不支持的文件，直接返回原文件
			return callback({
				status: 2,
				file: file
			})
		}

		var img = new Image();
		img.onload = function () {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
				var scale = 1;
				if (config.maxWidth) {
					scale = Math.min(1, config.maxWidth / canvas.width);
				}
				if (config.maxHeight) {
					scale = Math.min(1, scale, config.maxHeight / canvas.height);
				}

				if (scale !== 1) {
					var mirror = document.createElement("canvas");
					mirror.width = Math.ceil(canvas.width * scale);
					mirror.height = Math.ceil(canvas.height * scale);
					var mctx = mirror.getContext("2d");
					mctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, mirror.width, mirror.height);
					canvas = mirror;
				}

				var dataURL = canvas.toDataURL(outputType, config.quality);
				var _file = dataURLtoFile(dataURL, file.name);
				callback({
					status: 1,
					file: _file
				})
			} catch (e) {
				console.error(e);
				callback({
					status: 0
				});
			}
		};
		img.onerror = function () {
			if (callback) callback({
				status: 0
			});
		};
		img.src = URL.createObjectURL(file);
	}

	function dataURLtoFile (dataurl, name) {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], name, {
			type: mime
		});
	}

}

var imageCompress = new ImageCompress({
	maxWidth: 1024,
	maxHeight: 1024,
	quality: 0.7
});

var _dialogAdd = {
	loading: false,
	show: false,
	assignList: [],
	obj: {
		typeIdx: "", // 报修类型
		level: 1,
		createTimeMillis: "", // 上门
		completeTimeMillis: "", // 完成
		phone: '',
		status: 1,
		propertyId: "", // 名称id
		name: "", // 名称
		propertyTypeName: "", // 资产名
		propertyType: "", // 资产ID
		brand: "", // 品牌
		placeName: '',
		nickname: "",
		bookTimeMillis: "", // 上门
	},
}

var videoStyle = {
	width: 499,
	height: 380,
	left: 0,
	top: 0
}

var vue = new Vue({
	el: "#app",
	i18n: $i18n.obj,
	created: function () {
		var query = this.getQueryVariable();
		if (query.placeId) {
			this.showPlaceList = false;
		}
	},
	computed: {
		currActiveComponent: function () {
			var _this = this;
			if (this.$refs.drag) {
				var list = this.$refs.drag.checkedList();
				if (list.length > 1) {
					return [{
						type: "checked",
						style: this.alignCheckedGlobalStyle
					}];
				} else if (list.length == 1) {
					return this.buttonAllData.filter(function (el) {
						return el.id == list[0].id;
					})
				}
			}

			return this.buttonAllData.filter(function (el) {
				return el.id == _this.activeComponent;
			})
		},
		currActiveComponentInstructList: function () {
			var active = this.currActiveComponent[0];
			if (!active) return false;
			return active.instructList.length;
		},
		// checkedComponent
		dbclickTip: function () {
			return "双击按钮可编辑所有按钮样式"
		},
		// 字体字号
		label: function () {
			var font = $i.t('font');
			return {
				fontSize: font[1],
				fontFamily: font[0],
			}
		},
		// 背景 背景透明度
		bgLabel: function () {
			return {
				backgroundColor: $i.t('set.set9'),
				backgroundOpacity: $i.t('cctml23'),
			}
		},
		// 字体样式
		fontFamilyList: function () {
			// return ['宋体', '黑体', '楷体', '微软雅黑'];
			return $i.t('family');
		},
		// 字体样式 文字
		fontFamilyListText: function () {
			return ['宋体', '黑体', '楷体', '微软雅黑'];
		},
		// 对齐方式 加粗 斜体
		fontStyleHtml: function () {
			var align = $i.t('align');
			var font = $i.t('font');
			return [{
				icon: "iconzuoduiqi",
				tip: align[0],
				model: "textAlign",
				value: "left"
			},
			{
				icon: "iconjvzhong",
				tip: align[1],
				model: "textAlign",
				value: "center"
			}, {
				icon: "iconyouduiqi",
				tip: align[2],
				model: "textAlign",
				value: "right"
			}, {
				icon: "iconxieti",
				tip: font[4],
				model: "fontStyle",
				value: "italic"
			}, {
				icon: "iconcuti",
				tip: font[5],
				model: "fontWeight",
				value: "bold"
			}
			]
		},
		I18nNoData: function () {
			return $i.t("ccjs1");
		},
		I18nNotify: function () {
			return $i.t("ccjs7");
		},
		I18nLeave: function () {
			return {
				confirmText: $i.t('yes'),
				cancelText: $i.t('no'),
				message: $i.t('ccjs11'),
				visible: false,
				closeOnClickModal: false
			}
		},
		/**
		 * 
		 * @returns 画布样式
		 */
		canvasBgStyle: function () {
			// filter: opacity(0.5);
			var pagesStyle = this.pagesStyle;
			if (!pagesStyle.backgroundColor) return {};
			var opacity = (100 - pagesStyle.backgroundOpacity) / 100;
			this.pagesStyle.backgroundColor = this.colorRgb(pagesStyle.backgroundColor, opacity);
			this.pagesStyle.filter = "opacity(" + opacity + ")"
			var style = {};

			var radio = this.globalData[0] ? this.globalData[0].radio : 1;
			for (var key in pagesStyle) {
				style[key] = radio == 1 && key == "backgroundImage" ? "" : pagesStyle[key];
			}
			return style;
		},
		showDragDrop: function () {
			if (!this.notChildrenId || !this.placeId) return false;
			return this.notChildrenId == this.placeId;
		},
		canvasWidthHeight: function () {
			// var newStyle = {};
			// for (var key in this.dragDropCanvas) {
			// 	newStyle[key] = this.dragDropCanvas[key] + "px";
			// }
			// return newStyle;
			return {
				// width: this.dragDropCanvas.width + "px",
				height: this.dragDropCanvas.height + "px"
			};
		},
		classroomHeader: function () {
			return $i.t("classroomHeader");
		},
		devStatusListHeader: function () {
			return $i.t("devStatusListHeader");
		},
		totalStatus: function () {
			return $i.t("totalStatus");
		},
		iPIntercomButtonText: function () {
			return $i.t("iPIntercomButtonText");
		},
		activeComponentRadio: function () {
			return this.currActiveComponent.length ? this.currActiveComponent[0].style.radio : null;
		},
		/**
		 * 
		 * @returns 所有类型为电箱的按钮
		 */
		electricButton: function () {
			var airswitch = this.classroomTypes.airswitch;
			return this.buttonAllData.filter(function (item) {
				return item.propertyFlag == airswitch;
			});
		},
		/**
		 * 
		 * @returns 拿到包含在预约内的按钮
		 */
		electricFilterButton: function () {
			var buttonAllData = this.buttonAllData,
				airswitch = this.classroomTypes.airswitch,
				_this = this;
			var newElectric = buttonAllData.filter(function (item) {
				var parent = _this.$typeReturnComStyle(item.typeIdentical);
				return parent && item.propertyFlag == airswitch && _this.containButton(parent.style, item.style);
			});
			return newElectric || [];
		},
		computedCallType: function () {
			return $i.t("callType");
		},
		/**
		 * 根据返回的值显示来电内容
		 */
		dialogTipstext: function () {
			var value = this.iPIntercomObj;
			// 10086请求语音通话 || 10086请求视频通话
			var name = value.clientName || value.placeName || "";
			return name + value.fromId + this.computedCallType[value.callType];
		},
		placeName: function () {
			var name = "",
				_this = this;
			jsonPlaceData.forEach(function (item) {
				if (_this.placeId == item.id) name = item.name;
			});
		},
		filterTypes: function () {
			var placeId = this.placeId;
			if (isNull(placeId)) return [];
			var types = this.types;
			if (this.isAdmin === true) {
				return types.concat([{
					id: -1,
					name: "(" + $i.t('cctml32') + ")",
					isUnSorted: true
				}]);
			}
			var serviceIdList = this.placeIdServiceIdListMap[placeId];
			if (isNull(serviceIdList)) return types;
			var serviceIdMap = {};
			serviceIdList.forEach(function (sid) {
				serviceIdMap[sid] = true;
			});
			return types.filter(function (t) {
				return serviceIdMap[t.id] === true;
			});
		},
		rules: function () {
			return {
				typeIdx: [{
					required: true,
					message: $i.t('rules').typeIdx,
					trigger: "submit"
				}],
				phone: [{
					validator: this.validatePhone,
					trigger: "submit"
				}],
				createTimeMillis: [{
					required: true,
					message: $i.t('rules').createTimeMillis,
					trigger: "submit"
				}],
				status: [{
					validator: this.validateStatus,
					required: true,
					trigger: 'blur'
				}],
				completeTimeMillis: [{
					validator: this.validateStatus,
					required: true,
					trigger: 'blur'
				}],
				bookTimeMillis: [{
					required: true,
					message: $i.t('rules').bookTimeMillis,
					trigger: "submit"
				}],
				level: [{
					required: true,
					message: $i.t('rules').level,
					trigger: "submit"
				}]
			}
		},
		ipIntercomDialog: function () {
			return this.exhale.show || this.incomingCall.show;
		},
		MultimediaDeviceType: function () {
			return $i.t("MultimediaDeviceType");
		},
		ipTypes: function () {
			return $i.t("ipTypes");
		},
		ipButtonText: function () {
			return $i.t("ipButtonText");
		},
		checkedAlign: function () {
			return $i.t("alignIconList");
		},
		classroomType: function () {
			return $i.t("classroomType");
		},
		classrommStatus: function () {
			return $i.t("classrommStatus");
		},
		computedAlignCheckedGlobalStyle: function () {
			return JSON.parse(JSON.stringify(this.alignCheckedGlobalStyle));
		},
		initControlButtonList: function () {
			var list = this.controlButtonList.length;
			var diff = list % 5;
			if (diff <= 0) return this.controlButtonList;
			diff = 5 - diff;
			var arr = [];
			for (var index = 0; index < diff; index++) {
				arr.push({})
			}
			return this.controlButtonList.concat(arr);
		},
		computedGlobalButtonStyle: function () {
			return JSON.parse(JSON.stringify(this.globalButtonStyle));
		},
		/**
		 * 自己的状态是否占线
		 * @returns 
		 */
		placeIsBusy: function () {
			var placeStatus = this.placeStatus;
			var busy = null;
			for (var key in placeStatus) {
				if (placeStatus[key] > 0) busy = key;
			}
			return busy;
		},
		placeStatus: function () {
			return this.placeIpCallStatus[this.placeId];
		},
		transferText: function () {
			return this.iPIntercomButtonText.incomingCall[1].text;
		},
		notUserNumber: function () {
			var fromId = this.fromId;
			return fromId == null || fromId == undefined || fromId === "";
		},
		jsonCallCanvasData: function () {
			return JSON.parse(JSON.stringify(this.callCanvasStyleData));
		},
		filterTypeIsButtonComponent: function () {
			return this.componentData.filter(function(bt) {
				return bt.type != "button";
			})
		},
		myButtonText: function () {
			return $i.t('myButtonText');
		},
		buttonJumpRadioData: function () {
			return $i.t('buttonJumpRadioData');
		},
		buttonOpenRadioData: function () {
			return $i.t('buttonOpenRadioData');
		},
		devControl: function () {
			return $i.t("devControl");
		},
		cameraFunctionText: function () {
			return $i.t("cameraFunctionText");
		},
		returnRemoteOperationText: function () {
			return $i.t(this.remoteOperation ? "ccjs28" : "ccjs20");
		},
		filterDirectionArr: function () {
			var directionButton = this.directionButton;
			var arr = this.buttonAllData.filter(function (item) {
				return directionButton[item.componentId];
			})
			return arr;
		},
		/**
		 * 保存按钮
		 * @returns 
		 */
		saveButtonData: function () {
			var saveComponentId = this.saveComponentId,
				placeId = this.placeId;
			return this.buttonAllData.find(function (item) {
				return item.componentId == placeId + saveComponentId;
			})
		},
		/**
		 * 开关按钮
		 */
		switchButtonData: function () {
			var switchComponentId = this.switchComponentId,
				placeId = this.placeId;
			return this.buttonAllData.find(function (item) {
				return item.componentId == placeId + switchComponentId;
			})
		},
	},
	mounted: function () {
		this.initData();
		//初始化超级管理员权限
		var _this = this;
		this.$global.hasSuperPermission()
			.then(function(rs) {
				_this.editTemplate = rs;
			})
		this._sessionHeart();
	},
	provide: function () {
		return {
			central: this
		}
	},
	data: {
		props: {
			label: "name"
		},
		network: null, // 请求初始化
		isConflictIds: [], // 冲突id
		snapshotData: [], // 保存可以撤销的数据


		styleKey: ['width', 'height'],
		activeStyleKey: ['width', 'height', "left", "top"],
		styleLabelKey: ["W", "H", "X", "Y"],
		dialogComponentStyle: { // 弹框绑定的宽高
			width: 0,
			height: 0,
			left: 0,
			top: 0,
		},

		comMin: {
			w: 20,
			h: 20
		},
		callCanvasMin: {
			w: 300,
			h: 218
		},
		selectMultiple: true,
		dialog: {
			showButtonEditDrawer: false, // 编辑按钮弹框
			add: {
				loading: false,
				show: false,
				assignList: [],
				obj: {
					typeIdx: "", // 报修类型
					level: 1,
					createTimeMillis: "", // 上门
					completeTimeMillis: "", // 完成
					phone: '',
					status: 1,
					propertyId: "", // 名称id
					name: "", // 名称
					propertyTypeName: "", // 资产名
					propertyType: "", // 资产ID
					brand: "", // 品牌
					placeName: '',
					nickname: "",
					bookTimeMillis: "", // 上门
				},
			},
			showTemplateEditDialog: false,
		},
		dragDropCanvas: {
			width: 1345,
			height: 758
		},
		pageStyle: { // 通配页面大小
			width: 1002,
			height: 564
		},
		activeNames: [],
		isEdit: false,
		globalButtonStyle: {
			radio: 1,
			backgroundColor: '#fff',
			fontSize: 0,
			fontFamily: '宋体',
			textAlign: 'center',
			color: '#999999',
			fontStyle: 'normal',
			fontWeight: 'normal',
			backgroundOpacity: 1,
			borderWidth: 0,
			borderStyle: "solid",
			borderColor: "#dedede",
			backgroundRadio: 1,
			borderRadius: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			},
		},
		globalWHXY: { // 所有按钮大小
			width: 0,
			height: 0,
		},
		componentData: [], // 父级区域
		buttonAllData: [], // 所有按钮
		buttonAllType: [], // 需要请求接口数据的设备类型
		parentType: [], // 按钮类型的区域组件
		oldButtonAllData: [],
		pagesStyle: {},
		globalData: [], // 组建区域数据

		// airswitch：电箱, system:中控, zigbee:IOT网关, infrared_emitter:红外发射器
		buttonFromDevType: {
			// "button-electric": "airswitch",
			"button-control": "system",
			"button-iot": "zigbee",
			"button-controller": "infrared_emitter",
			"button-ip-intercom": "ip_intercom",
			"button-camera-control": "recognition",
			"button-air-conditioning-control": "aircondition"
		},
		buttonData: {
			"button-electric": [],
			"button-control": [],
			"button-iot": [],
			"button-controller": [],
			"button-ip-intercom": [],
			"button-camera-control": [],
			"button-air-conditioning-control": [],
		},
		activeComponent: null,
		placeData: [],
		jsonPlaceData: [],
		placeId: "",
		oldPlaceId: "",
		defaultExpandedKeys: [],
		showEmpty: false,
		showPlaceList: true,

		oldStyle: {
			cur: null,
			all: null
		},
		/**
		 * 双击时当前按钮组件 只为实现默认全局按钮样式为当前双击的按钮
		 */
		dbCurrComponent: null,
		overflowParentKey: [], // 按钮超出父级区域的父级类型列表

		timer: null, // 区分单击双击定时器
		mousedownTimer: null,
		defaultStyle: {
			width: 80,
			left: 0,
			height: 34,
			top: 0,
			backgroundColor: '#3D455A',
			fontSize: "15",
			fontFamily: '宋体',
			textAlign: 'center',
			color: '#fff',
			fontStyle: 'normal',
			fontWeight: 'normal',
			backgroundOpacity: 1,
			backgroundRadio: 1,
		},
		border: {
			radio: 1,
			borderWidth: 0,
			borderColor: "#dedede",
			borderStyle: "solid",
			borderRadius: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			},
		},
		borderRadius: 0,

		classroomList: [],
		notChildrenId: "",
		statusClassName: {
			0: "off-line",
			1: "on-line",
			2: "abnormal"
		},
		classroomTypes: {
			brand: "brand",
			ideahub: "ideahub",
			system: "system",
			airswitch: "airswitch"
		},
		showClassroomEmpty: false,
		electricType: "button-electric",
		activeAllelectricIds: [],
		currDragButton: null,
		placeListShowWidth: true, // 点击显示隐藏地点列表
		checkedClassroomHeader: ["brand", "ideahub", "system", "airswitch"], // 要在地点显示的类型
		checkedClassroomMax: 4, // 可选中的最数
		currGlobalLoading: false,


		iPIntercomType: "button-ip-intercom",
		omcsClient: null,
		isOk: false,
		$stompClient: null, // websocket
		iPIntercomTime: null, // 心跳定时器
		iPIntercomObjList: {},
		fromId: "",
		toId: "",
		transferId: "", // 转接的id

		showOMCSDialog: true, // 是否提示omcs弹框
		showHtmlOMCSDialog: false, // 是否打开omcs弹框
		iPIntercomObj: {}, // 呼叫或者接听的值
		exhale: {
			show: false,
			text: "exhale"
		},
		incomingCall: {
			show: false,
			text: "incomingCall"
		},
		remoteCavasStyle: { // 远程控制返回的大小
			width: 0,
			height: 0
		},
		exhaleOrIncomingCall: [], // 呼出exhale   呼入incomingCall
		remoteId: "", // 远程桌面id
		showRemoteAssistance: false,
		remoteAssistance: false,
		isFullScreen: false,
		openRemote: false, // 是否连接远程桌面
		currRemoteAssistanceData: null,


		alignCheckedGlobalStyle: {
			backgroundColor: "#fff",
			backgroundOpacity: 1,
			borderColor: "#dedede",
			backgroundRadio: 1,
			borderRadius: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
			},
			borderStyle: "solid",
			borderWidth: 1,
			color: "#999999",
			fontFamily: "宋体",
			fontSize: 15,

			fontStyle: "normal",
			fontWeight: "normal",
			height: "",
			left: "0",
			top: "",
			width: "",
			textAlign: "center",

			radio: 1,
			checkedAlign: []
		},
		copyAlignCheckedGlobalStyle: null,


		addStatusMap: {},
		repairFormData: [],
		previewImageVisible: false,
		previewImageUrl: "",
		previewVideoUrl: "",
		previewVideoVisible: false,
		placeIdServiceIdListMap: {},
		repairSelectList: {
			levels: [],
			propertyArray: [],
			propertyArrayMap: {}, // propertyArray转为对象格式 方便读取数据
		},
		previewVisible: false,

		classroomTypeActive: 0,
		classroomTimer: null,
		dblClassroomActive: {},
		classrommStatusData: {
			total: 0, // 课时总数
			warning: 0, // 预警
			course: 0, // 上课
			using: 0 // 使用
		},
		controlButtonList: [],


		placeIdServiceIdListMap: {},
		isAdmin: {},
		propertyTypeMap: {},
		propertyType: [],
		types: [],
		fileList: [],
		pickerOptions: {
			disabledDate: function (time) {
				return time.getTime() < (Date.now() - 86400000);
			},
		},
		userData: {},


		editClassroomName: false,
		showTransferDialog: false,
		guestsStatus: {}, // 状态
		placeIpCallStatus: { // 记录每个有ip呼叫的地点 三个按钮的状态
			// ip_calling: 0,
			// ip_monitor: 0,
			// ip_forced_call: 0
		},


		callType: 1, // 1 语音  2 视频
		showCallDialog: false, // 是否显示通话弹框
		showCallLoading: false, // 通话弹框loading
		showVideoPlay: false, // 是否显示video标签 主要判断视频格式
		showMyVideoPlay: false,
		showMyDialog: true, // 是否显示我的视频弹框
		showOtherDialog: true, // 是否显示对方的视频弹框
		currIpButtonKey: "", // 当前通话中的按钮key
		videoRestrictedArea: false, // 是否限制区域
		videoUrl: {}, // 视频链接
		myVideoUrl: {}, // 我的视频链接
		callStartTime: null, // 通话时的时间
		totalTime: null, // 通话时长的定时器
		callCanvasActive: "", // 弹框选中拖拽
		callCanvasStyleData: [{
			type: "call-canvas",
			id: "call-canvas-id",
			style: {}
		}],
		flvPlayer: {
			my: null,
			other: null,
		},
		hls: {
			my: null,
			other: null,
		},
		sendIPButtonData: null,
		myNotVideoEmpty: false,
		notVideoEmpty: false,


		cameraQualityValue: 20,
		DesktopQualityValue: 20,
		minimizeSize: "big",
		callTimeTotal: null,
		totalSecond: 0,
		buttonStatus: {}, // 根据id对应按钮session码
		buttomTime: null, // 获取回码状态定时器
		callOutDialogText: "ccjs33",
		callClientNotify: false, // 是否有麦克风连接状态的回调
		callReasultTime: null, // 呼叫无响应定时器
		haveIpIntercom: false, // 当前模板是否包含IP对讲组件
		onLineCount: 0, // 确认网络在线次数
		onLineCountTime: null, // 确认网络在线次数的定时器
		onLineCountTimeNum: 2000, // 确认网络在线次数的定时器毫秒数
		subscribeIds: [],
		//#region 2022/09/23 新增按钮、空调、摄像组件
		remoteOperation: false,
		showPageDialog: false, // 按钮组件跳页弹框
		pageUrl: "",
		backstagePageData: [{
				flag: "screenManage",
				icon: "iconfont iconbianpai",
				id: 4050,
				name: "终端管理",
				parent: "topPublish",
				path: "admin/exam",
				system: "publish",
				type: "manage",
			},
			{
				flag: "templateManage",
				icon: "iconfont iconzidingyi",
				id: 4060,
				name: "模板定义",
				parent: "topPublish",
				path: "admin/template/custom",
				system: "publish",
				type: "manage",
			}
		],
		devList: [],
		instructionObjList: {}, // 根据设备id对应指令列表

		cameraSelect: "control",
		instructionProtocol: ["TCP"], // TCP UDP HTTP
		activeProtocol: "TCP",
		templateControl: {
			host: "",
			port: "",
			url: "",
			protocol: "TCP", // 指令协议
			instruct: "", // 自定义指令内容
			propertyId: "", // 设备Id
			instructId: "" // 系统指令ID
		},
		setingUrl: {}, // 主题链接
		streamList: [], // 视频流
		videoObject: {
			video: "", //视频地址
			id: "",
		},
		componentFlvPlayer: null,
		directionComponent: null, // 自定义方向组件
		directionComponentType: "button-camera-direction", // 自定义方向组件名称
		switchComponentId: "_air_switch", // 开关特定
		temperatureComponentId: "_air_temp_value", // 温度特定
		saveComponentId: "_camera_save", // 保存按钮特定
		directionButton: {}, // 方向对应的图标
		directionArr: [], // 方向列表
		directionArrActive: null, // 当前选中的方向按钮
		groupButtonIcons: {}, // 空调特殊圆角按钮
		instructionsPropertyFlag: { // 可定义指令的componentId
			recognition: true,
			aircondition: true,
			button: true
		},
		savePreset: null, // 选择的预置位
		saveButtonPresetData: {
			item: null,
			data: null
		},
		showPresetDialog: false, // 是否显示预置位选择弹框
		temperatureMaxOrMin: {
			max: 40,
			min: 16
		},
		componentBuackgroundImageData: {
			checked: {
				end: "#3D455A",
				start: "#3D455A"
			}
		}, // 保存每个组件的背景颜色 为实现渐变色要使用两个颜色
		globalBuackgroundImageData: { // 保存全局背景颜色 为实现渐变色要使用两个颜色
			end: "#fff",
			start: "#fff"
		},
		showEdit: false,
		showEditTipBox: false,
		componentTitleStyle: { // 标题数据
			show: false,
			text: "", 
			style: {
				color: "#A0A3BE",
				fontStyle: 'normal',
				fontWeight: 'normal',
				textAlign: 'left',
				fontSize: "15",
				fontFamily: '宋体',
			}
		},
		customInstructions: { // 可自定义指令组件
			"button": true,
			"aircondition": true,
			"recognition": true
		},
		//#endregion

		editTemplate: false
	},
	methods: {
		/**
		 * 严格判空
		 * @param obj
		 * @returns {boolean}
		 */
		isNull: function (obj) {
			if (obj === undefined || obj === null || obj === '') return true;
			return false;
		},
		leavePage: function () { //监听离开
			var _this = this;
			var query = this.getQueryVariable();
			if (!query.placeId) return;
			window.onunload = function (e) {
				if (_this.showCallDialog) {
					_this.changeHangUp();
				}
			}
		},
		setGlobalBorderRadius: function () {
			var borderRadius = this.currActiveComponent[0].style.borderRadius;
			var radius = [];
			for (var key in borderRadius) {
				radius.push(borderRadius[key]);
			}
			var max = Math.max.apply(null, radius);
			this.borderRadius = max;
		},
		minStyle: function () {
			var pageStyleWidth = this.pageStyle.width; // 画布
			var dragWidth = this.dragDropCanvas.width; // 容器
			return dragWidth / pageStyleWidth;
		},
		getQueryVariable: function () {
			var href = window.location.href;
			// var href = "http://192.168.2.38:16082/screenManager/admin/control/central?placeId=5&isEdit=true"
			var query = href.substring(href.indexOf('?') + 1);
			var vars = query.split("&");

			var obj = {}
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[1] != undefined) obj[pair[0]] = pair[1]
			}
			return obj;
		},
		initData: function () {
			var query = this.getQueryVariable();
			// this._getbackstagePageDataList();
			this._getInitUrl();
			this.watchScreenSize();
			this.watchKeyDownEvent();
			this.callCanvasStyleData[0].style = JSON.parse(JSON.stringify(videoStyle));
			this.getClassroomData();
			this.addStatusMap = $i.t('addStatusMap');
			this.repairFormData = $i.t("repairFormData");
			this.repairSelectList.levels = $i.t("levels");
			this.leavePage();
			var arr = sessionStorage.getItem("checkedClassroomHeader");
			this.checkedClassroomHeader = arr ? JSON.parse(arr) : this.checkedClassroomHeader;
			this.snapshotData = new this.ArrayStack();
			if (query.isEdit)  this.showEdit = true;
			if (query.placeId) {
				this.notChildrenId = query.placeId;
				this.showOMCSDialog = true;
				/**
				 * 动态获取宽高
				 */
				this.$nextTick(function () {
					var tipBox = this.$refs.tipBox;
					// var tipH = 0;
					// if (query.isEdit) {
					// 	tipH = tipBox.offsetHeight
					// }
					var body = this.$refs.body;
					// console.log(body.clientWidth, body.clientHeight);
					this.dragDropCanvas.width = body.clientWidth;
					this.dragDropCanvas.height = body.clientHeight;
					if (query.isEdit) {
						this.dragDropCanvas.width = body.clientWidth - 5;
						this.dragDropCanvas.height = body.clientHeight - 5;
					}
					if (!query.isEdit) this.canvasTransForm();
				})
			} else {
				var body = this.$refs.bodyRight;
				this.dragDropCanvas.width = body.clientWidth;
				this.dragDropCanvas.height = body.clientHeight;
				this.$nextTick(function () {
					this.canvasTransForm();
				})
			}
			if (openIpIntercom) this.getMyTerminalNumber();

			if (query.placeId) {
				this.placeId = query.placeId;
				return this.getTemplate("query")
			};
			this.getplaces();

		},
		clearData: function () {
			this.overflowParentKey = [];
			this.pagesStyle = {};
			this.parentType = [];
			this.componentData = [];
			this.buttonAllType = []
			this.showEmpty = false;
			this.buttonAllData = [];
			this.activeComponent = "";
			this.directionArr = [];
			this.directionComponent = null;
			this.isEdit = false;
			for (var key in this.buttonData) {
				this.buttonData[key] = [];
			}
		},
		/**
		 * 监听浏览器窗口大小变化
		 * 为避免远程协助时
		 * 缩小浏览器出现未知错误问题
		 * 调用修改远程画布大小的方法
		 */
		watchScreenSize: function () {
			var _this = this,
				time = null;
			window.onresize = function () {
				if (!_this.showRemoteAssistance) return;
				if (time) clearTimeout(time);
				time = setTimeout(function () {
					_this.desktopUpdateRatio();
				}, 300)
			}
		},
		/**
		 * 监听键盘事件
		 */
		watchKeyDownEvent: function () {
			var _this = this;
			document.addEventListener('keydown', function (e) {
				e = e || window.event;
				var key = e.key.toLocaleUpperCase();
				var platform = navigator.platform.match("Mac");
				var ctrlKey = platform ? e.metaKey : e.ctrlKey;
				if (e.altKey || e.shiftKey) return;
				if (ctrlKey && _this.isEdit) {
					if (e && e.preventDefault) {
						e.preventDefault();
					} else {
						window.event.returnValue = false;
					}
					switch (key) {
						case "Z":
							_this.clickUndo();
							break;
						case "S":
							_this.save(null);
							break;	
					}
				}
			})
		},


		// region # 心跳保活
		_sessionHeart: function () {
			var _this = this;
			this.$http.get("/api/control-template/keepalive").then(function (rs) {
				var nextTimeout = rs.data || 60000;
				setTimeout(function () {
					_this._sessionHeart();
				}, nextTimeout);
			})
		},
		// endregion



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
				if (_this.showOMCSDialog && !_this.isOk) _this.initOmcsClient(); // 点某个地点才初始化omcs

				_this.$stompClient.subscribe(centralConnectedUrl, function (message) { // 总机接听自动弹框到指定地点
					console.log("connected:", message)
					var data = JSON.parse(message.body);
					var room = {
						id: data.placeId
					}
					_this.showTemplate(room);
				});
				if (_this.notUserNumber) return _this.$global.showError($i.t("ccjs44"));


			}, function () {
				_this.isOk = false;
				console.log("socket连接失败，2秒后重试")

				if (_this.iPIntercomTime) clearInterval(_this.iPIntercomTime);
				_this.iPIntercomTime = null;
				setTimeout(function () {
					_this.$initWebSocket();
				}, 2000);
				_this.destroyPlayer();
				if (_this.omcsClient) _this._destroy();
			});
		},
		subscribeWebSocket: function () {
			var _this = this,
				userId = this.fromId;
			var sendUrl = '/user/' + userId + '/remote-request/send';
			var responseUrl = '/user/' + userId + '/remote-request/response';
			var cancelUrl = '/user/' + userId + '/remote-request/cancel';
			var notifyUrl = '/user/' + userId + '/omcs/connected-notify';
			var callNotifyUrl = '/user/' + userId + '/call-client/notify';

			// v2版本新增的事件订阅(2022年7月11日)
			/**
			 * 对方挂断时触发该事件
			 * @type {string}
			 * {targetId:xxx,requestId:xxx}
			 * @targetId:为要通知挂断的号码
			 */
			var hangUpUrl = '/user/' + userId + '/remote-request/hang-up';
			/**
			 * 对方因网络原因掉线时触发该事件
			 * @type {string}
			 * {userId:xxx,type:1}
			 * @userId:断线一方的号码
			 * @type:呼叫类型[0:远程桌面; 1:IP对讲]
			 */
			var disconnectedUrl = '/user/' + userId + '/remote-request/disconnected';
			var sendResult = this.$stompClient.subscribe(sendUrl, function (message) { // 呼入
				console.log("send:", message)
				var data = JSON.parse(message.body);
				_this.iPIntercomObj = data;

				_this.confirmNetwork(true);

				if (data.watchCall) { // 监听 开启麦克风
					_this.forcedCallCurrPlaceTerminal({
						id: "ip_monitor"
					}, data.fromId);
				} else if (data.forceCall) { // 强制呼
					_this.forcedCallCurrPlaceTerminal({
						id: "ip_forced_call"
					}, data.fromId);
				} else {
					_this.$nextTick(function () {
						_this.setIncomingCallShow(true);
					})
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


				_this.$set(_this.iPIntercomObj, "toVideoConfigList", data.toVideoConfigList);
				_this.$set(_this.iPIntercomObj, "fromVideoConfigList", data.fromVideoConfigList);

				var type = _this.buttonTypeValue(data);

				if (reply == 0) { // 拒接
					if (_this.exhale.show) {
						_this.$global.showError($i.t("ccjs36"));
					}
					_this.setPlaceIpCallStatus(_this.currIpButtonKey, 0);
					_this.closeMicrophoneAndInitHeart();
				} else if (reply == 2) { // 转接
					_this.toId = data.transferId;
					_this.callCurrPlaceTerminal({
						id: type
					});
				} else if (reply == 1) {
					// 非监听才提示对方接听
					if (_this.sendIPButtonData.id != "ip_monitor") _this.$global.showSuccess($i.t("ccjs37"));
					_this.minimizeSize = "big";
					/**
					 * callClientNotify 对方是否有发送麦克风连接状态回调
					 * 如果对方接听后还是未发送通知 则提示未响应
					 * 发送通知则清除定时器
					 */
					if (!_this.iPIntercomObj.watchCall) {
						if (!_this.callClientNotify) _this.callClientNotify = setTimeout(function () {
							_this.$global.showError($i.t("ccjs63"));
						}, 10 * 1000);
					}
					_this._microphone();
					_this.hanldeCallDialog({
						id: _this.currIpButtonKey
					});
					_this.setGuestsStatus(1, [_this.toId], 1, true);
					_this.initHeart();
				}

				if (reply != 2) {
					_this.setExhaleShow(false); // 呼出的弹框
					_this.callOutDialogText = "ccjs33";
				}

			});

			var cancelResult = this.$stompClient.subscribe(cancelUrl, function (message) { // 对方取消
				console.log("cancel:", message)
				var data = JSON.parse(message.body);
				if (_this.iPIntercomObj.requestId != data.requestId) return;
				_this.setIncomingCallShow(false);
				_this.closeMicrophoneAndInitHeart();
			});

			var notifyResult = this.$stompClient.subscribe(notifyUrl, function (message) { // 未知回调
				console.log("connected:", message)
				var data = JSON.parse(message.body);
				_this.setIncomingCallShow(false);
				_this.setExhaleShow(false);
			});

			var hangUpResult = this.$stompClient.subscribe(hangUpUrl, function (message) { // 对方挂断
				console.log(message);
				console.log("connected:", message)
				var data = JSON.parse(message.body);

				if (_this.iPIntercomObj.requestId != data.requestId) return;
				if (!_this.iPIntercomObj.watchCall) _this.$global.showError($i.t("ccjs39"));
				else _this.$global.showError($i.t("ccjs26"));

				_this.destroyPlayer();
			});

			/* this.$stompClient.subscribe(disconnectedUrl, function (message) { // 对方网络掉线
				console.log("connected:", message)
				var data = JSON.parse(message.body);


				if (!_this.showCallDialog && !_this.incomingCall.show && !_this.exhale.show) return _this.closeMicrophoneAndInitHeart();

				_this.$global.showError($i.t("ccjs38"));
				_this.setIncomingCallShow(false);
				_this.setExhaleShow(false); // 呼出的弹框
				// 挂断电话并且让弹框消失 重置播放器
				if (_this.showCallDialog) _this.changeHangUp();
			}); */

			var notifyResult = this.$stompClient.subscribe(callNotifyUrl, function (message) { // 对方通知
				console.log("/call-client/notify:", message);
				if (_this.iPIntercomObj.watchCall) return;
				var data = JSON.parse(message.body),
					type = data.devType,
					ping = type.ping,
					pong = type.pong;
				var obj = {
					open: "showOtherDialog",
					callType: "callType",
				}

				if (ping && _this.iPIntercomObj.requestId == ping) _this.sendCallNotify("pong", _this.iPIntercomObj.requestId);
				if (pong && _this.iPIntercomObj.requestId == pong) _this.onLineCount--;

				if (_this.callClientNotify && type.microphone != undefined) {
					clearTimeout(_this.callClientNotify);
					_this.callClientNotify = null;
				}

				for (var key in obj) {
					var methods = obj[key];
					if (type[key] != undefined) {
						if (key == "callType") _this.changeCallType(true);
						if (key == "open") {
							_this[methods] = type[key];
							if (_this.showOtherDialog) {
								_this.playCameraOrVideo("other");
							} else {
								_this._cameraClose(_this.toId);
							}
						}
					}
				}

				var micro = type.microphone;
				// 麦克风是否可用
				if (micro != undefined && micro > 0) _this.$global.showError($i.t("ccjs56"));
			});

			var arr = [sendResult.id, responseResult.id, cancelResult.id, hangUpResult.id, notifyResult.id];
			this.subscribeIds = arr;
		},
		/**
		 * 取消订阅
		 */
		cancelAllIpSubscribe: function () {
			var _this = this;
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
		 * @param {*} caller 自己是否为呼叫方 1 本人 0 对方
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
		 * 实现打开omcs的弹框
		 */
		showOpenOMCSDialog: function () {
			if (!this.showOMCSDialog) return;
			var _this = this;
			this.showHtmlOMCSDialog = true;
			// this.$confirm($i.t("ccjs57"), $i.t("tips"), {
			// 	confirmButtonText: $i.t("down"),
			// 	cancelButtonText: $i.t("ccjs58"),
			// 	type: 'warning',
			// 	distinguishCancelAndClose: true,
			// 	beforeClose: function (key, e, done) {
			// 		if (key != "confirm") done();
			// 		else _this.downloadPlugin();
			// 	},
			// }).then(function () {

			// }).catch(function (err) {
			// 	// cancel 点击按钮 close 点击遮罩
			// 	if (err != "cancel") return;
			// 	if (_this.omcsClient) _this._destroy(true);
			// 	else _this._connect();
			// });
		},
		/**
		 * 下载omcs
		 */
		downOmcsCallback: function () {
			this.downloadPlugin();
			this.showHtmlOMCSDialog = false;
		},
		/**
		 * 打开omcs
		 */
		openOmcs: function () {
			this.openPlugin();
			this.showHtmlOMCSDialog = false;
		},
		/**
		 * 重新连接omcs
		 */
		retryOpenOmcs: function () {
			if (this.omcsClient) this._destroy(true);
			else this._connect();
			this.showHtmlOMCSDialog = false;
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
					var omcs = _this.getQueryVariable().omcs;
					if (_this.haveIpIntercom && omcs < 2) _this.showOpenOMCSDialog();
				},
				connectSuccessCallback: function () {
					console.log("login success!!!");
					_this.$global.showSuccess($i.t("ccjs47"));
					_this.subscribeWebSocket();

					_this.isOk = true;
					_this.initHeart();
					_this.setCameraQuality();
					_this.setDesktopQuality();

					var item = _this.sendIPButtonData;
					if (item) {
						_this.$nextTick(function () {
							console.log(item);
							_this.sendIPIntercom(item);
							_this.sendIPButtonData = null;
						});
					}
				},
				initCloseCallback: function () {
					/**
					 * isOk ? 表示已经连接成功过一次
					 */
					if (_this.isOk) {
						_this.$global.showError($i.t("ccjs64"));
						_this.destroyPlayer();
						_this.cancelAllIpSubscribe();
					}
					if (_this.iPIntercomTime) clearInterval(_this.iPIntercomTime);
					_this.isOk = false;
					console.log("-close-");
				},
				initOpenCallback: function () {
					console.log("-open-");
				},
				errorCallback: function (err) {
					// console.error(err);
					// _this.$global.showError($i.t("ccjs68"));
					// _this._microphoneClose();
					// _this.$global.showError(err.FailCause);
				},
				connectFailCallback: function (err) {
					_this.$global.showError($i.t("ccjs68"));
				},
				guestsUpdateCallback: function (guests) {
					console.log("guestsUpdateCallback:", guests);
					// 此处回调后，说明guests状态发生了改变，立即做心跳，保证在线/占线状态最新
				},
				connectionInterruptedCallback: function (serverIP) { // 断开连接
					console.log("connectionInterruptedCallback", serverIP);
					_this.$global.showError($i.t("ccjs64"));
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

			// 监听摄像头回调
			this.omcsClient.cameraEventRegister({
				connectEndedCallback: function (ownerId, baseResult) {
					console.log("-cameraConnectEnded-");
					console.log(ownerId, baseResult);
					var obj = {};
					obj[_this.fromId] = "my";
					obj[_this.toId] = "other";
					_this.myNotVideoEmpty = false;
					_this.notVideoEmpty = false;

					console.log(ownerId);
					if (baseResult.ResultCode > 0) {
						if (_this.notVideoEmpty || _this.myNotVideoEmpty)
							_this.protocolByLoaction(obj[ownerId]);
						if (ownerId == _this.fromId) _this.$global.showError($i.t("ccjs60"));
					}

					_this.showCallLoading = false;
				},
				disconnectedCallback: function (ownerId, type) {
					console.log("-cameraDisconnectedCallback-");
					console.log(ownerId, type);
				},
				autoReconnectSucceedCallback: function (ownerId) {
					console.log("-autoReconnectSucceedCallback-");
					console.log(ownerId);
				}
			});
			this._init();
		},
		/**
		 * 设置摄像头码率
		 */
		setCameraQuality: function () {
			this.omcsClient.setCameraEncodeQuality(this.cameraQualityValue);
		},
		/**
		 * 设置远程码率
		 */
		setDesktopQuality: function () {
			this.omcsClient.setDesktopEncodeQuality(this.DesktopQualityValue);
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
					_this.omcsToas(baseResult, $i.t("MultimediaDeviceType.Microphone.text"));
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
		/**
		 * 摄像头
		 * @returns 
		 */
		_camera: function (toId, domId) {
			console.log(toId, domId);
			domId = domId || "on-call";
			toId = toId || this.toId;

			if (!this.isOk) return alert($i.t("ccjs79"));

			this.omcsClient.camera({
				destId: toId,
				domId: domId
			});
		},
		/**
		 * 关闭摄像头
		 * @param {*} toId 
		 */
		_cameraClose: function (toId) {
			console.log("cameraClose:", toId);
			this.omcsClient.cameraDisconnect(toId);
		},
		/**
		 * 远程桌面
		 * @returns 
		 */
		_desktop: function () {
			if (!this.isOk) {
				alert($i.t("ccjs79"));
				return;
			}
			//增加显示桌面img
			/*var img = document.createElement('canvas');
			img.id = "aa01";

			document.getElementsByClassName("desktop")[0].appendChild(img);*/
			var _this = this;
			this.remoteAssistance = true;
			this.omcsClient.desktop({
				destId: _this.remoteId,
				domId: "canvasRemote",
				watchingOnly: _this.remoteOperation,
				connectEndedCallback: function (baseResult) {
					_this.remoteAssistance = false;
					console.log("-desktopConnectEnded-");
					console.log(baseResult);
					if (baseResult.ResultCode > 0) {
						_this.$global.showError(baseResult.FailCause);
						_this.showRemoteAssistance = false;
						return;
					}
					_this.remoteOperation = !_this.remoteOperation;
					_this.showRemoteAssistance = true;

					_this.remoteCavasStyle.width = baseResult.width;
					_this.remoteCavasStyle.height = baseResult.height;
					_this.openRemote = true;
					_this.setGuestsStatus(0, [baseResult.OwnerID]);
					_this.initHeart();
					/**
					 * 连接后调用更新画布 不然会出现 小屏无法控制 只有放大再缩小才可以
					 */
					_this.$nextTick(function () {
						_this.desktopUpdateRatio();
					})
					// {ResultCode: 0, FailCause: "成功", OwnerID: "aa01", width: 1280, height: 720}
					// 连接完毕后，通知对方
					var data = {
						fromId: baseResult.fromId,
						toId: baseResult.OwnerID,
						deviceType: _this.MultimediaDeviceType.Desktop.value, // 远程桌面
					}
					// _this._microphone(); // 麦克风
					_this.$stompClient.send("/app/omcs/send-connected-notify", {}, JSON.stringify(data));
				}
			});
		},
		/**
		 * 更新远程画布
		 */
		desktopUpdateRatio: function () {
			this.omcsClient.desktopUpdateRatio();
		},
		/**
		 * 取消远程桌面
		 */
		_desktopClose: function () {
			console.log("_desktopClose");
			this.openRemote = false;
			this.remoteCavasStyle.width = 0;
			this.remoteCavasStyle.height = 0;
			var a = this.omcsClient.desktopDisconnect();
			this.showRemoteAssistance = false;
			this.closeMicrophoneAndInitHeart();
		},
		/**
		 * 连接远程或关闭远程
		 * @param {*} item 当前组件
		 * @returns 
		 */
		handlerRemote: function (item, type) {
			if (!this.isOk) return this.$global.showError($i.t("ccjs45"));
			// if (!status) return this._desktop();
			// this._desktopClose();
			this.getRemoteList(type);
		},
		/**
		 * 全屏远程桌面
		 * @param {*} item 当前组件
		 */
		fullScreen: function (item, status) {
			if (!this.isOk) return this.$global.showError($i.t("ccjs45"));
			this.isFullScreen = !this.isFullScreen;
			if (this.showRemoteAssistance) this.$nextTick(function () {
				this.desktopUpdateRatio();
			})
			// this.showRemoteAssistance = true;
		},
		/**
		 * 设置地点ip呼叫按钮状态
		 * @param {*} key 要设置的键名
		 * @param {*} value 对应的值
		 * @param {*} all 全部设置为同样的值
		 */
		setPlaceIpCallStatus: function (key, value, all) {
			this.currIpButtonKey = value > 0 ? key : "";
			// 0 表示都可以操作
			var status = {
				ip_calling: 0,
				ip_monitor: 0,
				ip_forced_call: 0
			}
			if (all) {
				for (var k in status) {
					status[k] = value;
				}
			} else {
				if (key && value) status[key] = value;
			}
			this.$set(this.placeIpCallStatus, this.placeId, status);
		},
		hanldeCallDialog: function (item) {
			this.callStartTime = new Date();
			this.setTotalTime();
			this.setPlaceIpCallStatus(item.id, 1);
			this.showCallDialog = true;
			this.showCallLoading = true;
			this.showMyDialog = true;
			this.showOtherDialog = true;
			this.callType = this.iPIntercomObj.callType;
			if (this.iPIntercomObj.callType == 0) return this.showCallLoading = false;
			this.playCameraOrVideo();
		},
		/**
		 * 初始化 播放摄像头或者视频
		 * @param {*} dataKey 要控制的data值
		 */
		playCameraOrVideo: function (dataKey) {
			var data = {
				my: {
					id: this.fromId,
					node: "my-on-call"
				},
				other: {
					id: this.toId,
					node: "on-call"
				}
			};
			var newData = {};
			if (dataKey) {
				newData[dataKey] = data[dataKey];
			} else newData = data;
			this.$nextTick(function () {
				for (var key in newData) {
					var val = newData[key];
					this._camera(val.id, val.node);
				}
			})
		},
		/**
		 * 发起请求 根据当前点击的ip对讲按钮 执行不同的操作
		 * @param {*} item 
		 */
		sendIPIntercom: function (item) {
			// this.sendIPButtonData = item;
			// this.callCurrPlaceTerminal(item);
			// return;
			if (this.notUserNumber) return this.$global.showError($i.t("ccjs44"));
			this.sendIPButtonData = item;

			if (!this.isOk) return this.showOpenOMCSDialog();
			var placeStatus = this.placeStatus;
			var type = null;
			for (var key in placeStatus) {
				if (placeStatus[key] > 0) type = key;
			}
			// return this.$global.showError($i.t("ccjs48"));
			var methods = {
				// 先获取地点终端号码 再呼叫   挂断
				ip_calling: ["getPlaceTerminalNumber", "hangUpPlaceCall"],
				// 监听  取消监听
				ip_monitor: ["monitorCurrPlaceTerminal", "cancelMonitorCurrPlaceTerminal"],
				// 强制 挂断
				ip_forced_call: ["forcedCallCurrPlaceTerminal", "hangUpPlaceCall"]
			}
			var status = placeStatus[item.id];

			// 通话中点按钮
			if (this.showCallDialog && type == item.id) return this.changeHangUp();
			// 通话中点其他按钮
			if (type && item.id != type) return this.$global.showError($i.t("ccjs48"));

			if (this.iPIntercomObj.watchCall) { // 当前为监听状态 需要先挂断 才可呼叫
				this.hangUpPlaceCall(item, methods[item.id][status]);
				return
			}
			/**
			 * 当前占线中 并且按钮状态可操作 则不发请求
			 */
			// if (this.placeIsBusy && status <= 0) return this.$global.showError($i.t("ccjs35"));
			this[methods[item.id][status]](item);
		},
		/**
		 * 设置呼叫中弹框
		 * @param {*} value 要设置的值
		 */
		setExhaleShow: function (value) {
			this.exhale.show = value;
		},
		/**
		 * 设置呼入中弹框
		 * @param {*} value 要设置的值
		 */
		setIncomingCallShow: function (value) {
			this.incomingCall.show = value;
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
				_this.setExhaleShow(false);
				_this.setPlaceIpCallStatus(_this.currIpButtonKey, 0);
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
		 */
		responseCallRequire: function (reply, item) {
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
			if (reply == "2") {
				data.transferId = this.transferId;
			}
			if (this.iPIntercomObj.watchCall) {
				config.loading = false
			}
			this.$http.post(url, JSON.stringify(data), config).then(function (res) {
				var id = item ? item.id : null;
				/**
				 * 监听状态 只需要响应接听 不需要其他操作
				 */

				if (id == "ip_monitor") return;

				if (reply == "1") { // 点击按钮接听 或者别人强制呼入
					_this.setIncomingCallShow(false); // 呼入的弹框

					var room = {
						id: _this.iPIntercomObj.placeId
					}
					if (room.id) _this.showTemplate(room);

					_this._microphone();
					_this.hanldeCallDialog(item ? item : {
						id: "ip_calling"
					});
					_this.setGuestsStatus(record.type, [data.fromId], 0, true); // 设置占线状态
					_this.initHeart();
				} else if (reply != "1") { // 拒绝 || 转接
					_this.setIncomingCallShow(false); // 呼入的弹框
					_this.closeMicrophoneAndInitHeart();
				}
			}).catch(function (err) {
				/**
				 * 错误 可能是对方掉线之类的
				 * 则直接让呼入弹框消失
				 * 并重置心跳
				 */
				_this.setIncomingCallShow(false); // 呼入的弹框
				_this.closeMicrophoneAndInitHeart();
				console.log(err);
			})
		},
		/**
		 * 确认转接
		 */
		confirmTransfer: function () {
			if (!this.transferId) return this.$global.showError($i.t("ccjs41"));
			this.numberByPlace();
		},
		/**
		 * 挂断
		 * @param {*} item 当前点击的id
		 * @param {*} callMethods 只在点击按钮并且被监听
		 * @param {*} itemId ip_calling || ip_monitor || ip_forced_call
		 */
		hangUpPlaceCall: function (item, callMethods) {
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
				_this.iPIntercomObj = {};
				var id = item.id;
				_this.guestsStatus = {};

				if (callMethods) { // 被监听状态 点了按钮
					if (callMethods == "call") {
						_this.responseCallRequire("1", item);
					} else {
						_this.$nextTick(function () {
							_this[callMethods](item);
						})
					}
				}
				_this.destroyPlayer();
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
		 * 获取当前地点终端号码
		 */
		getPlaceTerminalNumber: function (item) {
			var url = "api/call/list/huawei/by/placeId/" + this.placeId,
				_this = this;
			this.$http.get(url).then(function (res) {
				var data = res.data;
				var onlineItem = null; // 找出第一个在线小屏
				data.forEach(function (el) {
					if (el.onlineStatus && !onlineItem) onlineItem = el;
				});
				_this.dataByOnlineStatus(item, onlineItem);
			}).catch(function (err) {
				console.log(err);
			})
		},
		/**
		 * 根据数据判断是否占线 并发送 ip对讲请求
		 * @param {*} onlineItem 要判断的数据
		 * @returns 
		 */
		dataByOnlineStatus: function (item, onlineItem) {
			if (!onlineItem) return this.$global.showError($i.t("ccjs34"));
			// 判断是否占线
			var count = 0;
			if (onlineItem.onlineStatus[1]) count++;
			if (count > 0) return this.$global.showError($i.t("ccjs35"));
			this.toId = onlineItem.number;
			this.callCurrPlaceTerminal(item);
		},
		/**
		 * 呼叫当前地点终端
		 * @param {*} item 当前点击的按钮
		 */
		callCurrPlaceTerminal: function (item) {
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
					placeId: this.placeId,
					callType: 1
				},
				config = {
					contentType: "application/json",
					showError: false
				}
			if (item.id == "ip_monitor") data.watchCall = true;
			else if (item.id == "ip_forced_call") data.forceCall = true;

			this.$http.post(url, JSON.stringify(data), config).then(function (res) {
				var result = res.data;
				
				if (item.id == "ip_monitor") _this.$set(_this.iPIntercomObj, "watchCall", true);
				else if (item.id == "ip_forced_call") _this.$set(_this.iPIntercomObj, "forceCall", true);

				_this.setPlaceIpCallStatus(item.id, 1);
				_this.setGuestsStatus(data.type, [data.toId]); // 设置占线状态
				_this.$set(_this.iPIntercomObj, "requestId", result.requestId); // 设置通话id
				_this.$set(_this.iPIntercomObj, "callType", data.callType);

				_this.initHeart();

				if (item.id == "ip_calling") _this.setExhaleShow(true);

				/**
				 * 类型[1:总机;2:课室终端;3:移动端;4:WEB端;5:远程桌面]
				 * 
				 * 如果呼叫的号码是 总机
				 * 等十秒时候对方都未响应则 提示排队人过多
				 * 反之60秒未响应则取消呼出
				 */
				if (result.toType != 1) {
					if (!_this.callReasultTime) _this.callReasultTime = setTimeout(function () {
						_this.$global.showError($i.t("ccjs63"));
						_this.cancelExhale();
					}, 10 * 6000);
				} else {
					if (!_this.callReasultTime) _this.callReasultTime = setTimeout(function () {
						_this.callOutDialogText = "ccjs62";
					}, 10 * 1000);
				}
				_this.confirmNetwork();
			}).catch(function (err) {
				/**
				 * 对方无人值守时 状态码7010
				 * 呼叫状态
				 */
				if (err.code == 7010 && item.id == "ip_calling") {
					var errReasult = err.data;
					_this.toId = errReasult.transferNumber;
					_this.callCurrPlaceTerminal({
						id: item.id
					});
					return;
				}
				_this.$global.showError(err.error.msg || $i.t("ccjs65"));
			})
		},
		/**
		 * 确认对方网络是否在线
		 */
		confirmNetwork (send) {
			var _this = this;

			if (this.onLineCountTime) clearInterval(this.onLineCountTime);
			this.sendCallNotify("ping", this.iPIntercomObj.requestId);
			this.onLineCount++;

			this.onLineCountTime = setInterval(function () {
				if (_this.onLineCount == 2) {
					_this.$global.showError($i.t("ccjs66"));
				};
				if (_this.onLineCount >= 5) {
					clearInterval(_this.onLineCountTime);
					_this.onLineCount = 0;
					_this.$global.showError($i.t("ccjs67"));
					_this.setIncomingCallShow(false);
					_this.setExhaleShow(false); // 呼出的弹框
					// 挂断电话并且让弹框消失 重置播放器
					if (_this.showCallDialog) _this.changeHangUp();
					else if (!send) _this.cancelExhale();
					else _this.responseCallRequire(0);
					return;
				};
				_this.sendCallNotify("ping", _this.iPIntercomObj.requestId);
				_this.onLineCount++;
			}, this.onLineCountTimeNum);

		},
		/**
		 * 监听当前地点终端
		 */
		monitorCurrPlaceTerminal: function (item) {
			this.getPlaceTerminalNumber(item);
		},
		/**
		 * 取消监听
		 */
		cancelMonitorCurrPlaceTerminal: function (item) {
			this.hangUpPlaceCall(item);
		},
		/**
		 * 强制呼入或者接听当前地点终端
		 */
		forcedCallCurrPlaceTerminal: function (item, toId) {
			/**
			 * 如果正在通话中 并且心跳的对方id 跟我要接听的不一样 则需要先挂断
			 * 如果当前未通话 并且toId不存在 则表示点了强制呼
			 */
			if (this.guestsStatus[1]) {
				if (this.guestsStatus[1] != toId) this.hangUpPlaceCall(item, "call");
			} else {
				if (!toId) this.getPlaceTerminalNumber(item);
				else this.responseCallRequire("1", item);
			}
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
				_this.$initWebSocket();
			}).catch(function (err) {
				console.log(err);
			})
		},
		numberByPlace: function () {
			var url = "api/call/by/number/" + this.transferId,
				_this = this;
			this.$http.get(url).then(function (res) {
				// _this.dataByOnlineStatus({
				// 	id: "ip_calling"
				// }, res.data);
				/**
				 * 如果号码不存在则提示错误
				 * 直到存在才响应请求 并且让弹框消失
				 */
				var data = res.data || {},
					count = 0;
				for (var key in data) {
					count++;
				}
				if (count <= 0) return _this.$global.showError($i.t("ccjs43"));
				_this.responseCallRequire("2");
				_this.showTransferDialog = false;
			})
		},
		/**
		 * 关闭麦克风 并且重置心跳
		 * @param {*} closePhone 是否关闭麦克风
		 */
		closeMicrophoneAndInitHeart: function (closePhone) {
			if (this.callReasultTime) clearTimeout(this.callReasultTime);
			if (this.callClientNotify) clearTimeout(this.callClientNotify);
			if (this.onLineCountTime) clearTimeout(this.onLineCountTime);
			this.callReasultTime = null;
			this.callClientNotify = null;
			this.onLineCountTime = null;
			this.iPIntercomObj = {};

			this.guestsStatus = {};
			this.initHeart();
			if (closePhone) this._microphoneClose();
		},
		omcsToas: function (result, text) {
			if (result.ResultCode == 0) {
				return true;
			}
			this.$global.showError("连接对方" + text + result.FailCause);
			return false;
		},
		// #endregion








		// 点击编辑
		clickEdit: function () {
			if (this.classroomTypeActive == 2) {

				return;
			}
			if (!this.buttonAllData.length && !this.electricButton.length) return this.$global.showError($i.t("ccjs12"));
			this.setActiveComponent(null);
			this.$refs.drag.setChecked();
			var _this = this;
			if (this.isEdit) {
				_this.isConflictIds = [];
				if (!this.isSame()) {
					// console.log(this.isSame(), _this.buttonAllData, _this.oldButtonAllData);
					this.$yconfirm(this.I18nLeave).then(function () {
						_this.save();
					}).catch(function () {
						_this.buttonAllData = JSON.parse(JSON.stringify(_this.oldButtonAllData));
					})
				}

				this.isEdit = false;
				return;
			}
			this.isEdit = true;
			this.$nextTick(function () {
				var data = this.buttonAllData[0];
				if (!data) return;
				if (data.propertyFlag == this.classroomTypes.airswitch) return;
				this.setActiveComponent(data.id);
				this.$refs.drag.setChecked();
			})
		},
		setActiveComponent: function (value, item) {
			if (!this.isEdit) {
				// 智慧电箱外部按钮点击
				if (item) this.sendButtonInstructions(item);
				return;
			}
			this.$set(this, "activeComponent", value || null);
		},
		/**
		 * 修改输入框的值做区域限制
		 * @param {*} key 当前修改的key (宽 高)
		 * @param {*} value 修改的值
		 * @param {*} type 全局("global") || 当前
		 * @returns 
		 */
		componentStyleWHXY: function (key, value, type) {
			value = parseInt(value);
			var list = this.$refs.drag.checkIds();

			var curr = this.currActiveComponent[0];
			var style = curr ? curr.style : null;
			var airswitch = this.classroomTypes.airswitch;
			if (list.length) style = this.alignCheckedGlobalStyle;
			if (type == "global") style = this.buttonAllData[0].style;
			if (!style) return this.$global.showError($i.t("ccjs5"));

			var canvasSize = this.dragDropCanvas;
			var left = style.left,
				width = style.width,
				height = style.height,
				top = style.top;


			var mW = this.comMin.w;
			var mH = this.comMin.h;

			if (key == "width") {
				// 在智慧电箱区域中的时候 限制最大宽度在区域内
				var parent = this.$typeReturnComStyle(this.electricType);
				if (curr.propertyFlag == airswitch && parent && this.containButton(parent.style, style)) {
					var parent = this.$typeReturnComStyle(this.electricType);
					var parentWidth = parent.style.width - (parent.style.borderWidth * 2) - 10;
					value = Math.min(value, parentWidth);
				}
				if (value > canvasSize.width) value = canvasSize.width;
				var overW = canvasSize.width - (left + value);
				if (overW < 0) left = left + overW;
				if (value < mW) {
					value = mW;
					this.$global.showError($i.t('maxWidth', {
						num: value
					}));
				}
				width = value;
			} else if (key == "height") {
				if (value < mH) {
					value = mH;
					this.$global.showError($i.t('maxHeight', {
						num: value
					}));
				}
				if (value > canvasSize.height) value = canvasSize.height;
				var overH = canvasSize.height - (top + value);
				if (overH < 0) top = top + overH;
				height = value;
			} else if (key == "left") {
				var maxL = canvasSize.width - width;
				left = Math.min(Math.max(value, 0), maxL);
			} else {
				var maxT = canvasSize.height - height;
				top = Math.min(Math.max(value, 0), maxT);
			}


			if (type == "global") {
				this.$set(this.globalWHXY, key, Math.round(value));
				this.setAllButtonStyle(this.globalWHXY, null, key);
				return;
			}
			if (list.length) {
				this.buttonAllData.forEach(function (bt) {
					if (list.indexOf(bt.id) != -1 && bt.propertyFlag != "button") bt.style[key] = value;
				});
			}
			style.width = Math.round(width);
			style.height = Math.round(height);
			style.left = Math.round(left);
			style.top = Math.round(top);
			this.updateRealWHLT(style);
		},
		/**
		 * 设置组件大小
		 * @param {*} style 组件样式
		 * @returns 
		 */
		updateRealWHLT: function (style) {
			if (style == null) {
				return;
			}

			for (var key in this.dialogComponentStyle) {
				var value = style[key];
				value = value || 0;
				var real = Math.round(value);
				this.$set(this.dialogComponentStyle, key, real);
			}
		},
		/**
		 * 取消选中
		 * @param {*} e 
		 */
		clickNotActive: function (e) {
			e = e || window.event;
			e.stopPropagation();
			e.preventDefault();
			if (e.target.className.indexOf("click-component") != -1) this.setActiveComponent(null);
		},
		/**
		 * 双击编辑
		 * @param {*} e event
		 * @param {*} item 当前按钮
		 * @param {*} type 只在双击智慧电箱为真
		 */
		dbclickEditButton: function (e, item, type) {
			clearTimeout(this.timer);
			if (!this.isEdit) return;
			if (this.dialog.showButtonEditDrawer) return;
			this.copyCOmponent();

			var bts = specialComponent;
			var show = bts[item.propertyFlag];
			if (show) return this.dbclickEditButtonComponent(e, item);

			var _this = this;
			if (type) {
				item = this.buttonAllData.filter(function (btn) {
					return btn.id == item.id;
				})[0]
			}
			this.dbCurrComponent = item;
			this.dialog.showButtonEditDrawer = true;
			// ["width", "height"].forEach(function (key) {
			// 	_this.globalWHXY[key] = item.style[key];
			// })
			this.$nextTick(function () {
				var canvasScroll = _this.$refs.canvasScroll;
				// 230 为实现双击 按钮显示在可视区域
				canvasScroll.scrollLeft = e.clientX - 230 - 300;
			})
		},
		copyCOmponent: function () {
			this.copyAlignCheckedGlobalStyle = JSON.parse(JSON.stringify(this.alignCheckedGlobalStyle));
			this.oldStyle.curr = JSON.parse(JSON.stringify(this.currActiveComponent));
			this.oldStyle.all = JSON.parse(JSON.stringify(this.buttonAllData));

		},
		/**
		 * IP 格式判断
		 * @param {*} e 
		 * @param {*} value 
		 * @returns 
		 */
		blurHost: function (e, value) {
			if (!value) return;
			var reg = /^(([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])$/;
			if (!reg.test(value)) this.$global.showError($i.t("ccjs78"));
		},
		/**
		 * 确认修改按钮样式
		 */
		confirmUpdateButtonStyle: function () {
			this.dialog.showButtonEditDrawer = false;
			var cur = JSON.stringify(this.buttonAllData);
			var old = JSON.stringify(this.oldStyle.all);
			if (cur != old) this.UndoSaveDebouncer(this.buttonAllData, this.oldStyle.all);
			this.activeNames = [];
			return false
		},
		changeColor: function (value, item, key) {
			var color = "#fff";
			if (key == "color") color = "#999999";
			if (key == "backgroundColor") color = "#fff";
			if (!value) item[key] = color;
		},
		/**
		 * 关闭抽屉的回调
		 */
		beforeClose: function () {
			this.currActiveComponent = this.oldStyle.curr;
			this.$set(this, "buttonAllData", this.oldStyle.all);
			this.activeNames = [];
			this.alignCheckedGlobalStyle = this.copyAlignCheckedGlobalStyle;
		},
		/**
		 * 
		 * @param {*} item 当前组件
		 * @returns 组件初始化样式
		 */
		setComponentStyle: function (item) {
			var result = {};
			var style = item.style;
			var sizeArr = ['width', 'height', 'top', 'left', "fontSize", "borderWidth"];
			for (var key in style) {
				result[key] = style[key];
				if (sizeArr.indexOf(key) != -1) result[key] = `${style[key]}px`;
				if (key == "borderRadius") {

					var radius = (style[key].top * 1) + 'px ' + (style[key].right * 1) + 'px ' + (style[key].bottom * 1) + 'px ' + (style[key].left * 1) + 'px';
					result[key] = radius
				}
				if (item.type == "rectangle" && key.indexOf('background') != -1) delete result[key];
			}

			if (!result.backgroundColor) {
				result.backgroundColor = "fff";
				result.backgroundOpacity = 0;
			}
			var opacity = (100 - result.backgroundOpacity) / 100;

			result.backgroundColor = this.colorRgb(result.backgroundColor, opacity);
			if (item.type == "line") {
				result.backgroundColor = this.colorRgb("#fff", 0);
			};
			if (item.type == "line") {
				delete result.borderStyle;
				delete result.borderWidth;
				delete result.borderColor;
			}
			return result
		},
		rectangleBgStyle: function (item) {
			if (item.type != "rectangle") return

			// filter: opacity(0.5);
			var itemStyle = item.style;
			var opacity = (100 - itemStyle.backgroundOpacity) / 100;
			var style = {
				backgroundImage: itemStyle.backgroundImage,
				backgroundColor: this.colorRgb(itemStyle.backgroundColor, opacity),
			}
			if (style.backgroundImage) style.filter = "opacity(" + opacity + ")";

			if (item.radio == 1) delete style.backgroundImage;
			return style;
		},
		/**
		 * 设置所有按钮样式
		 * @param {*} style 按钮样式数据
		 */
		setAllButtonStyle: function (style, buttonAllData, keys) {
			var _this = this;
			var parent = this.$typeReturnComStyle(this.electricType);
			var airswitch = this.classroomTypes.airswitch;
			buttonAllData = buttonAllData || this.buttonAllData;

			buttonAllData.forEach(function (item) {
				if (item.propertyFlag != "button") {
					if (item.propertyFlag == airswitch && parent && _this.containButton(parent.style, item.style)) {
						style.left = parent.style.left;
					}
					for (var key in style) {
						_this.$set(item.style, keys || key, _this.$deepCopy(style[keys || key]));
					}
				}
				
			});
		},
		setCheckedButtonStyle: function (key, value) {
			var _this = this;
			var list = this.$refs.drag.checkIds();
			if (!list.length) return;
			this.buttonAllData.forEach(function (item) {
				if (list.indexOf(item.id) != -1 && item.propertyFlag != "button") _this.$set(item.style, key, value);
			});
		},
		/**
		 * 
		 * @param {*} style 当前点击的对齐方式的值
		 * @returns 
		 */
		setUpfontStyle: function (style, type) {
			var value = style.value;
			var model = style.model;
			var isNormal = model == "fontStyle" || model == "fontWeight";

			var list = this.$refs.drag.checkIds();
			if (type == "global") {
				var key = this.globalButtonStyle[model];
				if (key == value && isNormal) return this.globalButtonStyle[model] = "normal";
				this.globalButtonStyle[model] = value;
				return;
			}
			if (list.length) {
				var key = this.alignCheckedGlobalStyle[model];
				if (key == value && isNormal) value = "normal";
				this.alignCheckedGlobalStyle[model] = value;
				this.buttonAllData.forEach(function (bt) {
					if (list.indexOf(bt.id) != -1 && bt.propertyFlag != "button") bt.style[model] = value;
				});
				return
			}
			var key = this.currActiveComponent[0].style[model];
			if (key == value && isNormal) return this.currActiveComponent[0].style[model] = "normal";
			this.currActiveComponent[0].style[model] = value;
		},








		/**
		 * 
		 * @param {*} item 当前点击的组价对其方式
		 */
		setCheckedAlign: function (item) {
			var type = item.value,
				ids = this.$refs.drag.checkedComponentIds,
				region = this.$refs.drag.computedMaxOrMinValue,
				data = this.buttonAllData,
				equally = this.checkedAlignColorClass(item);

			// 等间距可操作性 必须满足 equally 为 false
			if ((type == "levelEqually" || type == "verticalEqually") && equally) return;

			var filterData = data.filter(function (el) {
				return ids.indexOf(el.id) != -1;
			});
			var marginKey = "left";
			var sizeKey = "width";
			if (type == "verticalEqually" || type == "verticalCenter") {
				marginKey = "top";
				sizeKey = "height";
			}
			filterData = this.groupSort(filterData, marginKey);

			if (type == "levelEqually" || type == "verticalEqually") {
				/**
				 * 拿到最边的四个id
				 * 
				 * 最边的值不动
				 */
				var minleft = null,
					mintop = null,
					maxleft = null,
					maxtop = null,

					minleftId = null,
					mintopId = null,
					maxleftId = null,
					maxtopId = null;
				var equallyDiff = region[sizeKey];
				filterData.forEach(function (el, index) {
					var currStyle = el.style;
					var left = currStyle.left;
					var top = currStyle.top;

					if (index == 0) {
						minleft = left;
						maxleft = left;
						mintop = top;
						maxtop = top;
						minleftId = el.id;
						maxleftId = el.id;
						mintopId = el.id;
						maxtopId = el.id;
					} else {
						if (left <= minleft) {
							minleft = left;
							minleftId = el.id;
						}
						if (left >= maxleft) {
							maxleft = left;
							maxleftId = el.id
						}
						if (top <= mintop) {
							mintop = top;
							mintopId = el.id;
						}
						if (top >= maxtop) {
							maxtop = top;
							maxtopId = el.id;
						}
					}
					equallyDiff -= currStyle[sizeKey];
				});
				var btnIds = [minleftId, maxleftId, mintopId, maxtopId];
				/**
				 * 数组去重 存在最边的id一样的情况
				 */
				var newBtnIds = [];
				for (var i = 0; i < btnIds.length; i++) {
					newBtnIds.indexOf(btnIds[i]) === -1 ? newBtnIds.push(btnIds[i]) : newBtnIds;
				};

				var firstEl = null;
				filterData.forEach(function (el, index) {
					if (newBtnIds.indexOf(el.id) == -1) {
						var btnDiff = equallyDiff / (filterData.length - 1);
						if (firstEl) {
							/**
							 * 获取当前与上一个的间距 - 计算后的相同间距 = 需要加或者减的值
							 * 将原始边距加上得到的值
							 * 
							 * 最小值为区域最小
							 * 最大值为区域最大
							 */
							var margin = el.style[marginKey] - (firstEl[marginKey] + firstEl[sizeKey]);
							var val = margin - btnDiff;
							var regionRight = region[marginKey] + region[sizeKey]; // 区域最大
							var minVal = Math.min(el.style[marginKey] - val, regionRight - el.style[sizeKey]);
							el.style[marginKey] = Math.max(minVal, region[marginKey]);
						}

					}
					firstEl = el.style;
				})
				return;
			}


			data.forEach(function (el, index) {
				var left = el.style.left;
				var top = el.style.top;
				if (ids.indexOf(el.id) != -1) {
					if (type == "left") left = region.left;
					else if (type == "right") left = (region.left + region.width) - el.style.width;
					else if (type == "top") top = region.top;
					else if (type == "bottom") top = (region.top + region.height) - el.style.height;
					else { // 水平居中 || 垂直居中
						var diff = region[sizeKey] - el.style[sizeKey];
						if (type == "verticalCenter") top = region[marginKey] + (diff / 2);
						else left = region[marginKey] + (diff / 2);
					}
					el.style.left = left;
					el.style.top = top;
				}
			});
		},
		/**
		 * 数组排序 根据从小到大
		 * @param {*} arr 需要排序的数组
		 * @param {*} key 某个边距 left || top
		 * @returns 
		 */
		groupSort: function (arr, key) {
			key = key || "left";
			for (var i = 1; i <= arr.length - 1; i++) {
				var preIndex = i - 1,
					current = arr[i],
					currentKey = arr[i].style[key];
				while (preIndex >= 0 && arr[preIndex].style[key] > currentKey) {
					arr[preIndex + 1] = arr[preIndex];
					preIndex--;
				}
				arr[preIndex + 1] = current;
			}
			return arr;
		},
		/**
		 * 是否可以点击等间距 只有在长度超过三个才可以
		 * @param {*} item 
		 * @returns 
		 */
		checkedAlignColorClass: function (item) {
			var value = item.value;
			var list = this.$refs.drag.checkedList();
			if (list.length >= 3) {
				return "";
			} else {
				if (value == "levelEqually" || value == "verticalEqually") return "equally";
			}
		},













		/**
		 * 
		 * @param {*} item 当前组件
		 * @returns 组件对其方式
		 */
		componentTextStyle: function (item) {
			if (item.type == this.directionComponentType) return;
			var obj = {
				left: "flex-start",
				center: "center",
				right: "flex-end"
			}
			return obj[item.style.textAlign] || "space-around";
		},
		setButtonTextAlgin: function (item) {
			if (item.type == this.directionComponentType) return;
			var obj = {
				left: "flex-start",
				center: "center",
				right: "flex-end"
			}
			return obj[item.style.textAlign] || "center";
		},
		colorRgb: function (value, opacity) {
			// 16进制颜色值的正则
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
			// 把颜色值变成小写
			var color = value.toLowerCase();
			if (reg.test(color)) {
				// 如果只有三位的值，需变成六位，如：#fff => #ffffff
				if (color.length === 4) {
					var colorNew = "#";
					for (var i = 1; i < 4; i += 1) {
						colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
					}
					color = colorNew;
				}
				// 处理六位的颜色值，转为RGB
				var colorChange = [];
				for (var i = 1; i < 7; i += 2) {
					colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
				}
				return "rgba(" + colorChange.join(",") + "," + opacity + ")";
			} else {
				return color;
			}
		},
		/**
		 * 限制边框大小
		 * @param {*} value 当前选中的值
		 * @param {*} item 当前组件
		 */
		changeBorderWidth: function (value, item) {

			var wh = {};
			["width", "height"].forEach(function (key) {
				wh[key] = item.style[key];
			})
			var maxBorderWidth = (Math.min(wh.width, wh.height)) / 2;
			value = Math.round(Math.min(maxBorderWidth, value));
			if (!this.$refs.drag.checkIds().length) this.$set(item.style, "borderWidth", value);
		},
		/**
		 * 切换圆角类型
		 * @param {*} item 当前组件
		 * @param {*} key 要修改的值 radio
		 * @param {*} radio 当前点击的类型
		 */
		changeRadiusType: function (item, key, radio) {
			var max = 0;
			var borderRadius = item.borderRadius;
			this.$set(item, key, radio);

			if (radio == 1) {
				for (var k in borderRadius) {
					if (borderRadius[k] > max) max = borderRadius[k];
				}
				this.borderRadius = max;
			} else {
				for (var k in borderRadius) {
					borderRadius[k] = this.borderRadius;
				}
			}
		},
		/**
		 * 设置圆角值
		 * @param {*} item 当前控制的圆角对象
		 * @param {*} key 当前设置的圆角边
		 * @param {*} value 设置的值
		 * @param {*} inp 输入的时候
		 * @param {*} type 全局按钮设置
		 */
		setRadiusSize: function (item, key, value, inp, type) {
			var _this = this;
			if (inp) {
				_this.setButtonBorderRadius(item, key, value, inp, type);
				return;
			}
			this.mousedownTimer && this.moveStop();
			this.mousedownTimer = setInterval(function () {
				_this.setButtonBorderRadius(item, key, value, inp, type);
			}, 80)
		},
		moveStop: function () {
			clearInterval(this.mousedownTimer)
		},
		setButtonBorderRadius: function (item, key, value, inp, type) {
			var _this = this;
			var borderRadius = _this.currActiveComponent[0].style.borderRadius;
			var num = 0;

			var list = this.$refs.drag.checkIds();

			if (!item) { // 一个控制四个
				num = inp ? value : Number(_this[key]) + value;
				_this[key] = num <= 0 ? 0 : num;
				for (var k in borderRadius) {
					_this.$set(borderRadius, k, _this[key]);
				}
				if (type) {
					this.buttonAllData.forEach(function (el) {
						if (el.propertyFlag != "button") {
							var borderRadius = el.style.borderRadius;
							for (var k in borderRadius) {
								borderRadius[k] = _this[key];
							}
						}
						
					});
					return;
				};
			} else { // 四个单独控制
				num = inp ? value : Number(item[key]) + value;
				_this.$set(item, key, num <= 0 ? 0 : num);
			}

			if (list.length && !type) {
				this.buttonAllData.forEach(function (el) {
					if (list.indexOf(el.id) != -1) {
						var borderRadius = el.style.borderRadius;
						for (var k in borderRadius) {
							if (item) borderRadius[key] = num;
							else _this.$set(borderRadius, k, _this[key]);
						}
					}
				});
			}
			if (inp) _this.moveStop();
		},
		/**
		 * 根据父级类型返回对应的子级是否有按钮数据
		 * @param {*} item 父级组件
		 * @returns 返回暂无数据或者空
		 */
		showNotButtonData: function (item) {
			var type = item.parentType;
			if (type == this.electricType) return "";
			if (this.buttonData[type] && !this.buttonData[type].length) return this.I18nNoData;
			return "";
		},
		/**
		 * 按钮组件拖拽结束
		 * @param {*} item 当前按钮
		 */
		buttonLeaveParent: function (item) {
			// var style = item.style;
			// var parentStyle = this.$typeReturnComStyle(item.typeIdentical).style;
			// var styleR = style.left + style.width;
			// var styleB = style.top + style.height;

			// var parentR = parentStyle.left + parentStyle.width;
			// var parentB = parentStyle.top + parentStyle.height;


			// if ((style.left >= parentStyle.left && styleR <= parentR) && (style.top >= parentStyle.top && styleB <= parentB)) {

			// } else {
			// 	this.$nextTick(this.$initButtonStyle(item.typeIdentical, "leave"));
			// }
		},
		/**
		 * 初始化按钮样式
		 * @param {*} key 按钮类型的key 参考buttonData
		 * @param {*} type 当前是否为拖拽俺妞妞结束
		 */
		$initButtonStyle: function (key, type) {
			var style = this.$deepCopy(this.defaultStyle);
			var border = this.$deepCopy(this.border);
			for (var bk in border) {
				this.$set(style, bk, this.$deepCopy(border[bk]));
			}
			var typeReturnCom = this.$typeReturnComStyle(key); // 父级区域

			var typeStyle = typeReturnCom.style;
			for (var k in typeStyle) {
				var sizeArr = ['width', 'height', 'top', 'left', "fontSize"];
				if (sizeArr.indexOf(k) != -1) typeStyle[k] = Number(typeStyle[k]);
			}
			var order = ['top', 'right', 'bottom', 'left'];
			var keys = ['width', 'left', 'height', 'top'];

			var _this = this;
			var buttonData = this.buttonData[typeReturnCom.parentType];
			
			var bt = {
				[this.placeId + '_camera_up']: "el-icon-arrow-up",
				[this.placeId + '_camera_right']: "el-icon-arrow-right",
				[this.placeId + '_camera_down']: "el-icon-arrow-down",
				[this.placeId + '_camera_left']: "el-icon-arrow-left",
				[this.placeId + '_camera_reset']: "el-icon-refresh",
			}
			this.directionButton = bt;

			var groupButton = buttonData.filter(function (item) {
				if (item.componentType == "component") {
					keys.forEach(function (s) {
						if (item.style[s] != undefined) item.style[s] = _this.transToRealDataFromCanvas(item.style[s]);
					});
				}
				return item.componentType == "component";
			})

			if (groupButton.length) this.initDirectionButtonStyle(buttonData, typeReturnCom, groupButton);

			// buttonData = buttonData.filter(function (item) {
			// 	return !bt[item.componentId] && item.componentType != "component";
			// })

			buttonData = buttonData.filter(function (item) {
				return !bt[item.componentId] && item.componentType != "component";
			})

			buttonData.forEach(function (btD) { // 转换大小
				_this.$set(btD, "button-type", "button-type-" + typeReturnCom.parentType);
				_this.$set(btD, "typeIdentical", typeReturnCom.parentType);

				if (btD.style) {
					keys.forEach(function (s) {
						if (btD.style[s] != undefined) {
							btD.style[s] = _this.transToRealDataFromCanvas(btD.style[s]);
						}
					});
					if (!btD.style.borderColor) {
						for (var bk in border) {
							_this.$set(btD.style, bk, _this.$deepCopy(border[bk]));
						}
					}
					// 圆角排序
					if (btD.style.borderRadius) {
						var borderRadiusOrder = {};
						order.forEach(function (s) {
							borderRadiusOrder[s] = btD.style.borderRadius[s];
						});
						btD.style.borderRadius = borderRadiusOrder;
					}
				}
			});

			

			// 移动按钮后面的按钮往上移动 暂未用到 问题太多
			var active = _this.currActiveComponent[0];
			if (active) {
				buttonData = this.buttonAllData.filter(function (el) {
					return el.typeIdentical == typeReturnCom.parentType;
				})
				buttonData = buttonData.filter(function (item) {
					var childrenStyle = item.style;
					var parentStyle = _this.$typeReturnComStyle(item.typeIdentical).style;
					var styleR = style.left + style.width;
					var styleB = style.top + style.height;

					var parentR = parentStyle.left + parentStyle.width;
					var parentB = parentStyle.top + parentStyle.height;
					return (childrenStyle.left >= parentStyle.left && styleR <= parentR) && (childrenStyle.top >= parentStyle.top && styleB <= parentB);
				})
			}

			this.setButtonStyle(buttonData, style, typeReturnCom, type, key);
		},
		/**
		 * 
		 * @param {*} buttonData 按钮数组
		 * @param {*} style 按钮默认样式
		 * @param {*} typeReturnCom 父级区域组件
		 */
		setButtonStyle: function (buttonData, style, typeReturnCom, type, key) {
			var _air_switch = this.placeId + this.switchComponentId; // 开关
			var _air_temp_value = this.placeId + this.temperatureComponentId; // 温度
			var roundCount = 0; // 特殊圆圈按钮计数
			var valueCount = 0; // 调整温度按钮计数

			var defaultTop = 10,
				defaultLeft = 10,
				firstStyle = null,
				count = 1,
				_this = this,
				i = 0,
				typeStyle = typeReturnCom.style;
				// item.type + '-title'
			if (typeStyle.height - style.height < 10) defaultTop = 0;

			var titleNode = this.$refs[typeReturnCom.type + '-title'];
			var obj = {};
			var comType = typeReturnCom.type;
			if (typeReturnCom.title.show) {
				obj[comType] = {left: 10, top: 10}
				var imgNode = document.getElementById("button-camera-control-img");
				if (titleNode) obj[comType].top = titleNode ? titleNode[0].offsetHeight : 10;
				if (comType == "camera-control") obj[comType].left = (imgNode.offsetHeight + 10) || 10;
				defaultTop = obj[comType].top;
			}


			buttonData.forEach(function (item, index) {
				var newStyle = _this.$deepCopy(style);
				var isSwitch = item.componentId == _this.placeId + _this.switchComponentId;
				if (_this.groupButtonIcons[item.componentId] && !isSwitch) {
					newStyle.height = 65;
					newStyle.width = 55;
					var groupRadius = _this.dynamicSize({style: newStyle}, 56, 56, 85, 'width').width.replace("px", "") * 1;
					
					newStyle.borderRadius = {
						top: groupRadius,
						right: groupRadius,
						bottom: groupRadius,
						left: groupRadius
					}
				}
				var styleTrueButton = buttonData.filter(function (item) {
					return item.style;
				});
				if (!item.style || (!item.style.left && item.style.left != 0)) {
					var news = firstStyle ? firstStyle : newStyle;

					/**
					 * firstStyle: 上一次数据
					 * 
					 * 上一次数据加默认边距
					 */
					newStyle.left = (firstStyle ? firstStyle.left + firstStyle.width : typeStyle.left) + defaultLeft;
					newStyle.top = firstStyle ? firstStyle.top : defaultTop + typeStyle.top;

					newStyle.left = index == 0 && obj[comType] ? (newStyle.left * 1) + (obj[comType].left * 1) : newStyle.left;
					

					/**
					 * 计算后的距离 是否与其他有样式的按钮冲突
					 * 
					 * 如果冲突 则拿到冲突的按钮样式 根据冲突的按钮重新计算并且修改距离(newStyle)
					 * 修改以后 再次判断是否冲突
					 * 每次循环到一个按钮都这么判断
					 * 
					 * 直到遇到不冲突的距离为止
					 */
					if (!obj[comType]) {
						styleTrueButton.forEach(function (el) {
							var es = el.style;
							var overTop = es.top - news.top <= 0 || news.top - es.top <= 0;
							var overLeft = es.left - news.left <= 0 || news.left - es.left <= 0;
							if (overTop) newStyle.top = es.top;
							if (overLeft) newStyle.left = es.left + defaultLeft + es.width;
						});
					}

					/**
					 * 如果上一次数据为真 父级区域的right - 上一次数据的right < 每个按钮默认大小 
					 * 也就是说放不下一个新的按钮
					 * 则换行
					 * 设置top 为上一次数据的bottom + 默认边距
					 * 设置left 为上一次数据的right + 默认边距
					 */
					var parentR = typeStyle.width + typeStyle.left;
					var firstR = news.left + news.width;

					if (parentR - firstR <= newStyle.width + defaultLeft) {
						defaultTop = 10;
						newStyle.left = defaultLeft + typeStyle.left + (obj[comType] ? obj[comType].left : 0);
						newStyle.top = news.top + news.height + defaultTop;
					};

					firstStyle = _this.$deepCopy(newStyle);

					if (newStyle.top + newStyle.height > _this.dragDropCanvas.height) {
						var nT = _this.dragDropCanvas.height - (newStyle.top + newStyle.height);
						newStyle.top += nT;
					}

					for (var key in item.style) {
						if (item.style[key]) {
							newStyle[key] = _this.$deepCopy(item.style[key]);
						}
					}

					if (_this.groupButtonIcons[item.componentId] && !isSwitch) {
						var groupRadius = _this.dynamicSize({style: newStyle}, 56, 56, 85, 'width').width.replace("px", "") * 1;
						
						newStyle.borderRadius = {
							top: groupRadius,
							right: groupRadius,
							bottom: groupRadius,
							left: groupRadius
						}
					}
					_this.$set(item, "style", newStyle);

					if (item.componentId == _this.placeId + _this.temperatureComponentId) {
						_this.$set(item.style, "backgroundOpacity", 100);
					}
				}
			});


		},
		/**
		 * 初始化方向组件
		 * @param {*} list 方向组件的五个控制
		 * @param {*} typeReturnCom 方向组件所在区域
		 * @param {*} groupButton 方向组件初始值
		 */
		initDirectionButtonStyle: function (list, typeReturnCom, groupButton) {
			var groupButtonItem = groupButton[0];
			var imgNode = document.getElementById("button-camera-control-img");
			var titleNode = this.$refs[typeReturnCom.type + '-title'];
			var directionButton = this.directionButton;

			var borderWidth = typeReturnCom.style.borderWidth * 2;

			var directionArr = list.filter(function (item) {
				return directionButton[item.componentId];
			})

			var padding = 5;
			if (typeReturnCom.title.show) {
				padding = this.dynamicSize(typeReturnCom, paddingNum[typeReturnCom.type], null, null, 'paddingLeft').paddingLeft.replace("px", "") * 1;
			}
			var obj = {
				width: (imgNode.offsetHeight - borderWidth) - 2,
				height: (imgNode.offsetHeight - borderWidth),
				left:  padding + (typeReturnCom.style.left * 1),
				top: padding * 1 + (titleNode ? titleNode[0].offsetHeight : 0) + (typeReturnCom.style.top - borderWidth),
				fontSize: "25",
				fontFamily: '宋体',
				backgroundColor: "#22242C",
				backgroundOpacity: 1,
				backgroundRadio: 1,
			};

			if (!groupButtonItem.style.left && groupButtonItem.style.left != 0) {
				var border = this.$deepCopy(this.border);

				for (var key in border) {
					this.$set(groupButtonItem.style, key, this.$deepCopy(border[key]));
				}
				for (var key in obj) {
					this.$set(groupButtonItem.style, key, this.$deepCopy(obj[key]));
				}

			}
			this.$set(groupButtonItem, "componentName", this.directionComponentType);

			this.directionComponent = groupButtonItem;
			this.directionArr = directionArr;
		},








		add: function () {
			var _this = this;
			this.$refs["add-form"].validate(function (valid) {
				if (!valid) return;
				var obj = _this.dialog.add;
				// obj.loading = true;
				// var param = this.createParam(obj);
				// if ( !this.verifyForm(param) ) return;
				var params = _this.$deepCopy(obj.obj);

				// 如果没有选择设备，清空不需要传递的参数
				if (isNull(params.propertyId)) {
					delete params.propertyType;
					delete params.propertyTypeName;
					delete params.propertyId;
					delete params.brand;
					delete params.name;
				}

				// 参数处理
				var typeIdx = params.typeIdx;
				var repairType = _this.filterTypes.filter(function (el) {
					return el.id == typeIdx;
				})[0];
				if (repairType.isUnSorted !== true) {
					params.type = repairType.id;
					params.typeName = repairType.name;
					params.typeFlag = repairType.flag || "";
				}
				var formData = new FormData();
				for (var key in params) {
					formData.append(key, params[key]);
				}
				if (!isNull(params.propertyId)) formData.append("property", params.propertyId);
				formData.append("placeId", _this.placeId);
				if (isNull(params.completeTimeMillis)) {
					formData.delete("completeTimeMillis");
				}
				// 文件处理
				var fileList = _this.fileList;
				if (fileList.length > 0) {
					imageCompress.compressList(fileList, formData, function (formData) {
						_this._doAddData(formData);
					});
				} else {
					_this._doAddData(formData);
				}
			});
		},
		changeFunctionButton: function (item) {
			if (item.radio == "leaflets") {
				this.dialog.add.show = true;
				this.dialog.add.obj.createTimeMillis = new Date().getTime();
				this.dialog.add.obj.completeTimeMillis = new Date().getTime();
			} else this.accessControl();
		},
		fileChange: function (file, fileList) {
			this.fileList = fileList;
		},
		handleVideoPreview: function (url) {
			this.previewVideoUrl = url;
			this.previewVideoVisible = true;
		},
		handlePicturePreview: function (url) {
			this.previewImageUrl = url;
			this.previewImageVisible = true;
		},
		repairTypeChange: function () { },
		elSelectList: function (key) {
			return this[key] || this.repairSelectList[key] || [];
		},
		validatePhone: function (rule, value, callback) {
			if (value && !/^[1][0-9]{10}$/.test(value)) {
				return callback(new Error($i.t("rules")[rule.field]));
			}
			callback();
		},
		validateStatus: function (rule, value, callback) {
			if (this.dialog.add.obj.status == 4 && rule.field == "completeTimeMillis" && isNull(value)) {
				return callback(new Error($i.t("rules")[rule.field]));
			}
			callback();
		},
		/**
		 * 
		 * @param {*} curr 选择的值
		 * @param {*} item 当前点击的下拉
		 */
		changeRepairType: function (curr, item) {
			if (item.model == "typeIdx") {
				var nullKey = {
					propertyTypeName: "propertyTypeName",
					brand: "brand"
				}
				var obj = this.dialog.add.obj;
				for (var key in nullKey) {
					this.dialog.add.obj[key] = "";
				}
				this.getRepairPropertiesList(curr);
			} else if (item.model == "propertyId") {
				var map = this.propertyArrayMap[curr];
				this.dialog.add.obj.name = map.name;
				this.dialog.add.obj.propertyType = map.propertyTypeId;
				this.dialog.add.obj.propertyTypeName = map.propertyTypeName;
				this.dialog.add.obj.brand = map.brand;
			}
		},
		resetAddForm: function () {
			var add = this.$deepCopy(_dialogAdd);
			add.obj.placeName = this.dialog.add.obj.placeName;
			this.dialog.add = this.$deepCopy(add);
		},








		/**
		 * ip呼叫的图标
		 * @param {*} item 
		 * @returns 
		 */
		ipIntercomIcon: function (item) {
			if (item.typeIdentical == this.iPIntercomType) {
				var placeStatus = this.placeStatus;
				if (!placeStatus) return "";
				var status = placeStatus[item.id]
				var text = {
					// ip呼叫 挂断 占线
					ip_calling: ["iconoutBound-hujiao", "iconguaduan", "iconguaduan"],
					// 监听 取消监听
					ip_monitor: ["iconl-zhuangtaijianting", "iconguaduan"],
					ip_forced_call: ["iconhuru", "iconguaduan"],
				}
				return text[item.id][status];
			}

		},
		enlargeNarrowIcon: function (item) {
			var placeId = this.placeId;
			var obj = {
				[placeId + "_camera_enlarge"]: "el-icon-zoom-in",
				[placeId + "_camera_narrow"]: "el-icon-zoom-out",
				[placeId + "_camera_save"]: "iconfont iconbaocun1",
			}
			return obj[item.componentId] || "";
		},
		/**
		 * 按钮显示的文本
		 * @param {*} item 当前按钮
		 * @returns 
		 */
		buttonText: function (item, isValue) {
			if (item.type == this.directionComponentType) return;
			var instructList = item.instructList;
			if (this.instructionsPropertyFlag[item.propertyFlag]) {
				// if (item.propertyFlag != "button") return;
				if (this.placeId + this.temperatureComponentId == item.componentId) return item.style.text + "℃";
				return item.style.text;
			}
			if (!instructList) {
				var placeStatus = this.placeStatus;
				if (!placeStatus) return "";
				var status = placeStatus[item.id]
				var text = {
					// ip呼叫 挂断 占线
					ip_calling: ["ccjs25", "ipButtonText[1]", "ipButtonText[2]"],
					// 监听 取消监听
					ip_monitor: ["ccjs23", "ccjs22"],
					ip_forced_call: ["ccjs24", "ipButtonText[1]"],
				}
				return $i.t(text[item.id][status]);
			}
			var name = instructList[0].name;
			var _this = this;
			if (item.instructList.length > 1) {
				instructList.forEach(function (el) {
					if (!el.name) _this.$set(el, 'name', "");
					if (!el.active) name = el.name;
				});
			}

			if (item.componentId == this.placeId + this.temperatureComponentId) {
				var size = item.style.fontSize - 10;
				if (isValue) return name + "<span style='font-size: " + size + 'px' + "'" + ">℃</span>";
				return name + "℃";
			}
			if (name && name.toString() == "[object Object]") name = "";
			return name;
		},
		buttonTextTip: function (item) {
			var name = item.propertyFlag == "ip_intercom" ? $i.t("componentText.ip-intercom") : item.propertyName;
			name = name || "";
			return name ? name + "-" + item.order : null;
		},
		componentBorderStyle: function (item) {
			var style = item.style;
			var result = {};
			for (var key in style) {
				// 因为设置了圆角 会出现背景色溢出 所以单独设置圆角的容器上加背景色
				if ((key.indexOf('border') != -1 || key.indexOf('background') != -1) && item.type != "video-display") result[key] = style[key];

				if (key == 'borderWidth') result[key] = style[key] + 'px'
				if (item.type == "video-display" && key.indexOf('border') != -1) result[key] = style[key];

				if (key == "borderRadius") {
					var radius = style[key].top + 'px ' + style[key].right + 'px ' + style[key].bottom + 'px ' + style[key].left + 'px';
					result[key] = radius
				}
			}
			if (item.type != "rectangle" && item.type != "video-display" && result.backgroundColor) {
				var opacity = (100 - result.backgroundOpacity) / 100;
				result.backgroundColor = this.colorRgb(result.backgroundColor, opacity);
			}
			return result;
		},
		alotMinWidth: function (item) {
			var width = item.style.width - 10;
			return {
				padding: "0 3px"
			}
		},





		$deepCopy: function (target) {
			if (typeof target == "object") {
				var result = Array.isArray(target) ? [] : {};
				for (var key in target) {
					if (typeof target[key] == "object") {
						result[key] = this.$deepCopy(target[key]);
					} else {
						result[key] = target[key];
					}
				}
				return result;
			}
			return target;
		},
		/**
		 * 
		 * @param {*} type 父级按钮类型
		 * @returns 根据type返回当前父级区域数据
		 */
		$typeReturnComStyle: function (type) {
			var btnType = type && type.indexOf("button-") == -1 ? "button-" + type : type;
			var typeStyle = this.componentData.filter(function (item) {
				return item.parentType == btnType;
			});
			return typeStyle.length ? typeStyle[0] : null;
		},
		/**
		 * 版本1  ------------
		 * 按钮只能在自己的区域和矩形区域拖拽
		 * @returns 组件是否冲突
		 */
		conflict: function () {
			var _this = this;
			var components = this.buttonAllData.concat(this.componentData);
			console.log(components);
			var arr = [];
			if (components.length <= 1) return false;
			for (var i = 0; i < components.length; i++) {
				var c = {
					left: components[i].style.left,
					top: components[i].style.top,
					width: components[i].style.width,
					height: components[i].style.height,
				}

				for (var j = i + 1; j < components.length; j++) {
					var o = {
						left: components[j].style.left,
						top: components[j].style.top,
						width: components[j].style.width,
						height: components[j].style.height,
					}
					var typeI = components[i].parentType || components[i]["button-type"] || "";
					var typeJ = components[j].parentType || components[j]["button-type"] || "";
					/**
					 * 获取数据时设置了 typeIdentical = 父级类型
					 * 按钮父级类型 不等于自身typeIdentical
					 */
					var typeIdentical = components[i].type != components[j].typeIdentical || components[i].typeIdentical != components[j].type;
					if (typeI.indexOf('rectangle') == -1 && typeJ.indexOf('rectangle') == -1 && typeIdentical) {
						var isOverlap = _this.isOverlap(c, o);
						if (isOverlap) {
							if (arr.indexOf(components[i].id) == -1 || arr.indexOf(components[j].id) == -1) {
								arr.push(components[i].id);
								arr.push(components[j].id);
							}
							continue;
						}
					}
				}
				if (arr.indexOf(components[i].id) !== -1) {
					components[i].isConflict = true;
				} else {
					components[i].isConflict = false;
				}
			}
			_this.isConflictIds = arr;
			if (arr.length > 0) {
				return true;
			}
		},
		/**
		 * 版本2  ------------
		 * 只要是按钮区域都可以随意拖拽
		 * @returns 组件是否冲突
		 */
		conflict2: function () {
			var _this = this;
			var components = this.buttonAllData.concat(this.componentData);
			var notParentType = ["video-display", "course", "sensor", "attendance", "electric"];
			var arr = [];
			if (components.length <= 1) return false;
			for (var i = 0; i < this.buttonAllData.length; i++) {
				var allItem = this.buttonAllData[i];
				var allStyle = allItem.style;

				// 按钮与父级区域是否冲突
				for (var j = 0; j < this.componentData.length; j++) {
					var parentItem = this.componentData[j];
					var parentStyle = this.componentData[j].style;
					var parentType = parentItem.type;

					var airswitch = this.classroomTypes.airswitch; // 按钮是否为智慧电箱

					var isAirswitch = allItem.propertyFlag == airswitch && _this.containButton(parentStyle, allStyle);
					if (notParentType.indexOf(parentType) != -1 && !isAirswitch) {
						var isOverlap = _this.isOverlap(parentStyle, allStyle);
						// console.log(isOverlap);

						if (isOverlap) {
							if (arr.indexOf(allItem.id) == -1) {
								arr.push(allItem.id);
							};
							if (arr.indexOf(parentItem.id) == -1) arr.push(parentItem.id);
							continue;
						}
					}
				}

				// 按钮与按钮是否冲突
				var otherComponent = this.otherComponent(allItem);
				for (var index = 0; index < otherComponent.length; index++) {
					var other = otherComponent[index];
					var currParent = _this.$typeReturnComStyle(allItem.typeIdentical);
					var otherParent = _this.$typeReturnComStyle(other.typeIdentical);
					var containButton = _this.containButton;
					var currIsAirswitch = allItem.propertyFlag == airswitch && currParent && containButton(currParent.style, allStyle);
					var otherIsAirswitch = other.propertyFlag == airswitch && otherParent && containButton(otherParent.style, other.style);

					var isOverlap = _this.isOverlap(other.style, allStyle); // 是否冲突
					// console.log(isOverlap);
					// 两个按钮都是电箱 并且两个都包含在电箱区域内则不进行冲突检测
					if (isOverlap && !currIsAirswitch && !otherIsAirswitch) {
						if (arr.indexOf(allItem.id) == -1) {
							arr.push(allItem.id);
						};
						if (arr.indexOf(other.id) == -1) {
							arr.push(other.id);
						};
						continue;
					}
				}

			}
			_this.isConflictIds = arr;
			if (arr.length > 0) {
				return true;
			}
		},
		isOverlap: function (idOne, idTwo) {
			this.activeStyleKey.forEach(function (key) {
				idOne[key] = Number(idOne[key]);
				idTwo[key] = Number(idTwo[key]);
			})
			var topOne = Math.floor(idOne.top),

				topTwo = Math.floor(idTwo.top),

				leftOne = Math.floor(idOne.left),

				leftTwo = Math.floor(idTwo.left),

				widthOne = Math.floor(idOne.width),

				widthTwo = Math.floor(idTwo.width),

				heightOne = Math.floor(idOne.height),

				heightTwo = Math.floor(idTwo.height);
			return topOne + heightOne > topTwo && topTwo + heightTwo > topOne &&
				leftOne + widthOne > leftTwo && leftTwo + widthTwo > leftOne;
		},
		containButton: function (parent, children) {
			var pleft = parent.left,
				pTop = parent.top,
				pWidth = parent.width,
				pHeight = parent.height;

			var cleft = children.left,
				cTop = children.top,
				cWidth = children.width,
				cHeight = children.height;

			return (cleft >= pleft && cleft + cWidth <= pleft + pWidth) && (cTop >= pTop && cTop + cHeight <= pTop + pHeight);
		},

		/**
		 * 
		 * @param {*} currComponent 当前组件
		 * @returns 其他组件信息
		 */
		otherComponent: function (currComponent) {
			var buttonAllData = this.buttonAllData;
			var component = buttonAllData.filter(function (item) {
				return item.id != currComponent.id;
			})
			return component;
		},








		// 撤销
		clickUndo: function () {
			var snapshotData = JSON.parse(this.snapshotData.toString());
			if ((snapshotData.length <= 1) && this.arrayEquals(snapshotData[0], this.buttonAllData)) return;
			this.snapshotData.pop();
			var data = this.snapshotData.top() || [];
			this.buttonAllData = JSON.parse(JSON.stringify(data));
		},
		// 保存快照
		saveCurrentCanvas: function () {
			if (!this.snapshotData) return;
			this.snapshotData.push(JSON.parse(JSON.stringify(this.buttonAllData)));
		},
		ArrayStack: function () {
			var arr = [];
			//压栈操作  
			this.push = function (element) {
				arr.push(element);
			}
			//退栈操作  
			this.pop = function () {
				return arr.pop();
			}
			//获取栈顶元素  
			this.top = function () {
				return arr[arr.length - 1] || [];
			}
			//获取栈长  
			this.size = function () {
				return arr.length;
			}
			//清空栈  
			this.clear = function () {
				arr = [];
				return true;
			}

			this.toString = function () {
				return JSON.stringify(arr);
			}
		},
		/**
		 * 保存快照
		 * @param {*} newVal 新的按钮数据
		 * @param {*} oldVal 没修改之前的按钮数据
		 */
		UndoSaveDebouncer: function (newVal, oldVal) {
			if (newVal != oldVal) {
				this.$nextTick(this.saveCurrentCanvas())
			}
		},


		/**
		 * 判断两个数组的数据是否相同
		 * @param {*} array1 数组1
		 * @param {*} array2 数组2
		 * @returns 相同返回 true 反之 false
		 */
		arrayEquals: function (array1, array2) {
			if (!array1 || !array2)
				return false;
			if (array1.length != array2.length)
				return false;
			for (var i = 0, l = array1.length; i < l; i++) {
				if (array1[i] instanceof Array && array2[i] instanceof Array) {
					if (!this.arrayEquals(array1[i], array2[i]))
						return false;
				} else if (array1[i] instanceof Object && array2[i] instanceof Object) {
					if (!this.objectEquals(array1[i], array2[i]))
						return false;
				} else if (array1[i] != array2[i]) {
					return false;
				}
			}
			return true;
		},
		objectEquals: function (object1, object2) {
			for (var propName in object1) {
				if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
					return false;
				} else if (typeof object1[propName] != typeof object2[propName]) {
					return false;
				}
			}
			for (var propName in object2) {
				if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
					return false;
				} else if (typeof object1[propName] != typeof object2[propName]) {
					return false;
				}
				if (!object1.hasOwnProperty(propName))
					continue;
				if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
					if (!this.arrayEquals(object1[propName], object2[propName]))
						return false;
				} else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
					if (!this.objectEquals(object1[propName], object2[propName]))
						return false;
				} else if (object1[propName] != object2[propName]) {
					return false;
				}
			}
			return true;
		},
		/**
		 * 
		 * @returns 模板是否修改
		 */
		isSame: function () {
			var buttonAllData = [],
				oldButtonAllData = [],
				_this = this;
			this.buttonAllData.forEach(function (item) {
				var obj = {};
				for (var key in item) {
					if (key != "customStyle") obj[key] = _this.$deepCopy(item[key]);
				}
				buttonAllData.push(obj);
			});
			this.oldButtonAllData.forEach(function (item) {
				var obj = {};
				for (var key in item) {
					if (key != "customStyle") obj[key] = _this.$deepCopy(item[key]);
				}
				oldButtonAllData.push(obj);
			});
			return this.arrayEquals(oldButtonAllData, buttonAllData);
		},
		/**
		 * 将画布的数据转成真实的数据
		 * @param {*} data 宽高等数据
		 * @returns 返回转换后的数据
		 */
		transToRealDataFromCanvas: function (data) {
			var pageStyleWidth = this.pageStyle.width; // 画布
			var dragWidth = this.dragDropCanvas.width; // 容器
			return (data * (dragWidth / pageStyleWidth)).toFixed(4) * 1;
		},
		/**
		 * 将真实的数据转成画布的数据
		 * @param {*} data 宽高等数据
		 * @returns 返回转换后的数据
		 */
		transToCanvasDataFromReal: function (data) {
			var pageStyleWidth = this.pageStyle.width; // 画布
			var dragWidth = this.dragDropCanvas.width; // 容器

			return (data / (dragWidth / pageStyleWidth)).toFixed(4) * 1;
		},
		/**
		 * 
		 * @returns 返回根据真实宽高 转换后的画布宽高
		 */
		canvasTransForm: function () {
			var w = this.pageStyle.width;
			var h = this.pageStyle.height;

			var dw = this.dragDropCanvas.width;
			var dh = this.dragDropCanvas.height;

			var newStyle = this.getObjectFitSize(dw, dh, w, h);
			this.dragDropCanvas.width = newStyle.width - 3.2;
			this.dragDropCanvas.height = newStyle.height - 1.8;
		},
		getObjectFitSize: function (containerWidth, containerHeight, width, height) {
			/**
			 * 画布宽 / 画布高 = 画布的比例大小(doRatio)
			 * 真实宽/ 真实高 = 真实的比例大小(cRatio)
			 * 
			 * 
			 * 画布比例 > 真实比例
			 * width = 真实宽
			 * height = 真实宽 / 画布比例
			 * 
			 * 画布比例 <= 真实比例
			 * height = 真实高
			 * width = 真实高 * 画布比例
			 * 
			 */
			var doRatio = width / height;
			var cRatio = containerWidth / containerHeight;
			var targetWidth = 0;
			var targetHeight = 0;

			if (doRatio > cRatio) {
				targetWidth = containerWidth;
				targetHeight = targetWidth / doRatio;
			} else {
				targetHeight = containerHeight;
				targetWidth = targetHeight * doRatio;
			}

			return {
				width: targetWidth,
				height: targetHeight,
			};
		},










		checkChangePlaceNode: function (node, curr) {
			var checkedKeys = curr.checkedKeys.join(",");
			// this.getClassroomData(checkedKeys);
		},
		/**
		 * 点击地点获取数据
		 * @param {*} data 当前点击的地点节点
		 * @returns 
		 */
		changePlaceNode: function (data) {
			var _this = this;

			// if (this.placeId == data.id) return;
			for (var key in this.buttonData) {
				this.buttonData[key] = [];
			}

			if (this.showCallDialog) {
				this.$refs.placeTree.setCurrentKey(this.oldPlaceId);
				return this.$global.showError($i.t("ccjs21"));
			}

			if (this.openRemote) {
				this.omcsClient.desktopSetWatchingOnly(true); // 不可操作
				this._desktopClose();
			}
			if (!this.isSame() && this.isEdit) {
				this.$yconfirm(this.I18nLeave).then(function () {
					_this.clearData();
					_this.save(data.id);
					_this.getChildrenPlaceList(data);
				}).catch(function () {
					_this.clearData();
					_this.getChildrenPlaceList(data);
				})
				_this.isEdit = false;
				return;
			};
			_this.clearData();
			this.getChildrenPlaceList(data);
		},




		/**
		 * 
		 * @param {*} type 教室显示类型
		 * @returns 返回类型相等的头部多选数据
		 */
		returnDataByType: function (type) {
			var curr = this.classroomHeader.filter(function (item) {
				return item.type == type;
			});
			return curr.length ? curr[0] : {};
		},
		changeCheckbox: function () {
			sessionStorage.setItem("checkedClassroomHeader", JSON.stringify(this.checkedClassroomHeader));
		},
		abnormalGoToPage: function (room) {
			if (room.alertStatus != 2) return;
			window.open(room.targetUrl)
		},
		classroomHeaderStatus: function (el) {
			var status = el.status;
			var className = this.statusClassName;
			return className[status];
		},
		classroomListStatus: function (room, type) {
			var iconType = type.type;
			var className = this.statusClassName
			var value = {
				className: "",
				text: ""
			}
			if (type == "total") {

				var total = room.alertStatus;
				value = {
					className: this.statusClassName[total],
					text: $i.t("totalStatus")[total - 1]
				}
			} else {
				var status = room.deviceStatus[iconType] || 0;
				value = {
					className: className[status],
					text: this.devStatusListHeader[status]
				}
			}
			return value

		},
		classroomCourse: function (room) {
			var course = room.course;
			var courseValue = "";
			var clazz = course ? course.clazzCustomizeName : "";
			var subject = course ? course.subjectCustomizeName : "";
			if (clazz && subject) courseValue = clazz + "/" + subject;
			return courseValue || $i.t("ccjs16")
		},
		showTemplate: function (room) {
			var id = room.id;
			if (id == this.placeId) return;
			this.placeId = id;
			var placeData = this.placeData;
			if (!this.$refs.placeTree) return;
			// this.defaultExpandedKeys = this.treeFindPath(placeData, this.placeId);
			this.defaultExpandedKeys = [this.placeId];
			this.$refs.placeTree.setCurrentKey(id);
			this.getTemplate(true);
		},










		/**
		 * 
		 * @returns 返回选中的地点列表
		 */
		getCheckedKeys: function () {
			// type == 2 教室
			var list = this.$refs.placeTree ? this.$refs.placeTree.getCheckedNodes() : [];
			list = list.filter(function (item) {
				return item.type == 2;
			})
			return list;
		},
		/**
		 * 切换课室类型 每次切换修改之前地点的数据
		 * @param {*} value 当前点击的类型
		 */
		changeClassroomType: function (value) {
			this.classroomTypeActive = value;
			this.$nextTick(function () {
				if (!this.jsonPlaceData[0]) return;
				this.$refs.placeTree.setCurrentKey(this.jsonPlaceData[0].id);
			})
		},
		/**
		 * 主要为缺少的按钮补充空值 不影响布局
		 * @returns 返回按钮列表
		 */
		controlButtonData: function () {
			if (!this.getCheckedKeys().length) return [];
			return this.initControlButtonList;
		},
		/**
		 * 点击按钮时
		 * @param {*} item 当前点击的按钮
		 */
		clickSendClassroomOrder: function (item) {
			if (this.editClassroomName) return;
			console.log("clickSendClassroomOrder");
			this.sendClassroomOrder(item);
		},
		/**
		 * 双击按钮时 变为输入框
		 * @param {*} item 当前双击的按钮
		 */
		dblUpdateClassrName: function (item) {
			if (this.classroomTimer) clearTimeout(this.classroomTimer);
			console.log("dblUpdateClassrName");

			this.dblClassroomActive = this.$deepCopy(item);
			this.$nextTick(function () {
				this.$refs['updateClassroom' + item.id][0].focus();
			})
		},
		/**
		 * 确认修改按钮名称
		 * @param {*} btn 当前要修改的按钮
		 * @param {*} value 当前输入的值
		 * @returns 
		 */
		confirmUpdateClassroom: function (btn, value) {
			btn.name = btn.name.trim();
			this.updateClassroomName(btn);
		},
		/**
		 * 输入框失去焦点 设置双击选中的值为空
		 */
		hiddenInput: function () {
			this.dblClassroomActive = {};
		},
		clickEditClassroom: function () {
			var edit = this.editClassroomName;
			if (!edit && !this.controlButtonData().length) return this.$global.showError($i.t("cctml37"));
			this.editClassroomName = !edit;
		},












		/**
		 * 鼠标按下并拖拽按钮进入区域设置滚动条在最下面
		 * @param {*} item 当前电箱按钮
		 * @returns 
		 */
		mouseMoveComponent: function (item) {
			if (item.propertyFlag != this.classroomTypes.airswitch) return;
			var parent = this.$typeReturnComStyle(this.electricType);
			if (!parent) return;
			var isOverlap = this.isOverlap(parent.style, item.style);
			if (!isOverlap) return;
			var scrollbar = this.$refs[this.electricType][0].$refs["custom-scrollbar-button-electric"];
			var height = scrollbar.wrap.scrollHeight;
			scrollbar.wrap.scrollTop = height;
		},
		/**
		 * 松开按钮时如果在区域内设置最大宽度为区域宽度减去内边距
		 * @param {*} item 当前电箱按钮
		 * @returns 
		 */
		mouseupComponent: function (item, list) {
			var airswitch = this.classroomTypes.airswitch;
			// this.UndoSaveDebouncer(list);
			if (item.propertyFlag == airswitch) {
				var parent = this.$typeReturnComStyle(this.electricType);
				var containButton = this.containButton(parent.style, item.style);
				if (!containButton) return;
				var parentWidth = parent.style.width - 10;
				var value = Math.min(item.style.width, parentWidth);
				this.$set(item.style, "width", value);
			}
		},
		setCurrDragButton: function (item) {
			this.currDragButton = item;
		},
		handleDragOver: function (e) {
			if (e && e.preventDefault) {
				e.preventDefault(); //防止浏览器默认行为(W3C) 
			} else {
				window.event.returnValue = false; //IE中阻止浏览器行为 
			}
			e.dataTransfer.dropEffect = 'copy'
		},
		/**
		 * 停止拖拽
		 * @param {*} e 
		 * @param {*} item 
		 * @returns 
		 */
		handleDrop: function (e) {
			var e = e || window.event;
			if (e && e.preventDefault) {
				e.preventDefault(); //防止浏览器默认行为(W3C) 
			} else {
				window.event.returnValue = false; //IE中阻止浏览器行为 
			}
			var id = e.dataTransfer.getData("id");
			var item = this.buttonAllData.filter(function (btn) {
				return btn.id == id;
			})[0];
			if (!item) return;
			// this.typeLeftModuleValue()
			var canvasSize = this.dragDropCanvas;
			var x = e.offsetX;
			var y = e.offsetY;
			var width = item.style.width;
			var height = item.style.height;
			var maxWidth = canvasSize.width - width;
			var maxHeight = canvasSize.height - height;
			var left = Math.min(x, maxWidth);
			var top = Math.min(y, maxHeight);
			this.MoveSetComponentStyle(left, top, width, height, item);
			this.dropConfirm(e, item);
		},
		/**
		 * 点击显示当前组件
		 * @param {*} e event
		 * @param {*} item 当前拖拽的组件
		 * @returns 
		 */
		dropConfirm: function (e, item) {
			if (e && e.preventDefault) {
				e.preventDefault(); //防止浏览器默认行为(W3C) 
			} else {
				window.event.returnValue = false; //IE中阻止浏览器行为 
			}
			this.isConflictIds = this.isConflictIds.filter(function (el) {
				el.id == item.id
			});
			var uuid = item.id;
			this.setActiveComponent(uuid);
			this.UndoSaveDebouncer(this.buttonAllData);
		},
		/**
		 * 设置按钮样式
		 */
		MoveSetComponentStyle: function (left, top, width, height, item) {
			// console.log(left, top);
			item.style.left = (left <= 0 ? 0 : left);
			item.style.top = (top <= 0 ? 0 : top);
			/**
			 * 组件最小宽高
			 */
			var w = this.dragDropCanvas.width;
			var h = this.dragDropCanvas.height;
			item.style.width = Math.max(Math.min(width, w), this.comMin.w);
			item.style.height = Math.max(Math.min(height, h), this.comMin.h);
		},






		// http
		save: function (id) {
			var buttons = this.filterTypeIsButtonComponent;
			// if (this.conflict2()) {
			// 	// 冲突不取消编辑 ???????????????????????
			// 	this.isEdit = true;
			// 	this.setActiveComponent(buttons[0].id);
			// 	return this.$global.showError($i.t("ccjs6"));
			// }
			this.setActiveComponent(null);
			this.$refs.drag.setChecked();
			this.isEdit = false;
			if (this.isSame()) return this.$global.showSuccess($i.t("toast[8]"));

			this.snapshotData = new this.ArrayStack();

			var url = "api/control-template/components?placeId=" + this.placeId;
			var config = {
				contentType: "application/json",
				loading: false,
				processData: false
			}
			var data = JSON.parse(JSON.stringify(this.buttonAllData));
			var formData = [],
				_this = this;
			for (var index = 0; index < data.length; index++) {
				var item = data[index];
				var instructList = [];
				var itemInstructList = item.instructList || [];
				itemInstructList.forEach(function (el) {
					var elObj = {}
					for (var key in el) {
						if (["id", "name"].indexOf(key) != -1) elObj[key] = el[key];
					}
					instructList.push(elObj);
				})
				var keys = ['width', 'left', 'height', 'top'];
				keys.forEach(function (s) {
					item.style[s] = _this.transToCanvasDataFromReal(item.style[s]);
				});

				var obj = {
					style: JSON.stringify(item.style),
					componentId: item.componentId,
					// instructList: instructList
				}
				if (!item.customBtn) {
					obj.instructList = instructList;
				}

				formData.push(obj)
			}

			this.$http.post(url, JSON.stringify(formData), config).then(function (res) {
				console.log(res);
				_this.$global.showSuccess($i.t("toast[8]"));
				_this.getButtonList(id);
			}).catch(function (err) {
				console.log(err);
			})
			// if (this.conflict()) {}
		},
		/**
		 * 获取通配模板
		 */
		getTemplate: function (type) {
			var config = null;
			var _this = this;
			var data = {
				placeId: this.placeId
			}
			this.$http.get("/api/control-template/template", data, config).then(function (res) {
				var data = res.data;
				var content = (res.data && res.data.content) ? JSON.parse(data.content) : [];
				_this.notChildrenId = _this.placeId; // 添加显示模板的id
				if (!content.length) return _this.showEmpty = true;
				var elements = content[0].pages[0].elements;
				if (!elements.length) return _this.showEmpty = true;
				// console.log(content);
				_this.globalData = content;
				_this.pagesStyle = content[0].pages[0].style;

				if (!type) {
					// _this.dragDropCanvas = content[0].style
					_this.dragDropCanvas.width = 1345;
					_this.dragDropCanvas.height = 758;
				}; // 画布样式}
				_this.componentData = elements;
				console.log("template:", elements);

				var pageStyleWidth = _this.pageStyle.width; // 画布
				var dragWidth = _this.dragDropCanvas.width; // 容器
				var isButton = false;
				var haveIpIntercom = false; // 是否包含IP对讲
				_this.componentData.forEach(function (item) {
					if (item.type == "ip-intercom" || item.type == "remote-assistance") haveIpIntercom = true;
					_this.$set(item, "parentType", "button-" + item.type);
					// push 所有区域组件的类型
					_this.parentType.push(item.parentType);

					['width', 'left', 'height', 'top'].forEach(function (el) {
						// item.style[el] = _this.transToRealDataFromCanvas(item.style[el]);
						item.style[el] = item.style[el] * (dragWidth / pageStyleWidth)
					});
					if (item.type == "function-button") {
						if (typeof item.displayOptions == "string") {
							item.radio = item.displayOptions;
							item.displayOptions = [];
						}
						if (item.radio == "leaflets") isButton = true;
					}
					// 所有按钮转换后的类型数据 后端需要的设备类型数据
					var devType = _this.buttonFromDevType[item.parentType];
					if (devType && _this.buttonAllType.indexOf(item.parentType) == -1) _this.buttonAllType.push(devType);
					if (item.type == "static-text") {
						if (item.text || item.text == 0) _this.$set(item.style, "text", item.text);
					}
					if (!item.title) {
						var styleOption = item.styleOption;
						_this.$set(item, "title", _this.$deepCopy(_this.componentTitleStyle));
						_this.$set(item.title, "show", false);
						if (isIncludeStyleOption(showTitleComponent, item.type, styleOption)) {
							_this.$set(item.title, "show", true);
							_this.$set(item.title, "text", $i.t("componentTitleText")[item.type]);
						}
					}
				});
				_this.haveIpIntercom = haveIpIntercom;
				var omcs = _this.getQueryVariable().omcs || null;
				if (openIpIntercom && haveIpIntercom && !_this.isOk && omcs == null) _this.showOpenOMCSDialog();
				if (type) {
					_this.getButtonList();
					if (isButton) _this.getRepairInitData();
					return
				}
			}).catch(function (err) {
				console.log(err);
				_this.showEmpty = true;
			})
		},
		/**
		 * 获取报修初始数据
		 */
		getRepairInitData: function () {
			var _this = this,
				url = "/api/control-template/repair/manage/data/init";

			this.$http.get(url, null).then(function (res) {
				var data = res.data;
				var user = data.user;
				_this.dialog.add.obj.nickname = user.nickname;
				_this.dialog.add.obj.phone = user.phone;

				var isAdmin = data.isAdmin || false;
				_this.isAdmin = isAdmin;
				_this.placeIdServiceIdListMap = data.placeIdServiceIdListMap || {};

				var propertyType = data.propertyType;
				_this.propertyType = propertyType;
				for (var i in propertyType) {
					_this.$set(_this.propertyTypeMap, propertyType[i].id, propertyType[i]);
				}
				_this.types = data.types;
			})
		},
		/**
		 * 根据报修类型和地点获取资产列表
		 * @param {*} id 类型id
		 */
		getRepairPropertiesList: function (id) {
			var _this = this,
				url = "/api/control-template/repair/properties",
				data = {
					systemServiceIds: id,
					placeIds: this.placeId
				}
			this.$http.get(url, data).then(function (res) {
				var data = res.data;
				_this.repairSelectList.propertyArray = data;
				var propertyArrayMap = {};
				data.forEach(function (p) {
					propertyArrayMap[p.id] = p;
				});
				_this.propertyArrayMap = propertyArrayMap;
			})
		},
		/**
		 * 开启门禁
		 */
		accessControl: function () {
			var _this = this,
				url = "/api/control-template/accessControl",
				data = {
					placeId: this.placeId
				}
			this.$http.post(url, data).then(function (res) {
				_this.$global.showSuccess($i.t('toast[7]'));
			})
		},
		/**
		 * 新增报修
		 * @param {*} formData 
		 */
		_doAddData: function (formData) {
			var obj = this.dialog.add,
				_this = this,
				url = "/api/control-template/repair/add",
				config = {
					contentType: false,
					processData: false
				}

			this.$http.post(url, formData, config).then(function (res) {
				_this.$global.showSuccess($i.t('toast[1]'));
				obj.show = false;
				_this.resetAddForm();
				_this.$refs["add-upload"][0].clearFiles();
				_this.fileList = [];
			})
		},
		/**
		 * 获取地点列表
		 */
		getplaces: function () {
			var _this = this;
			var data = {
				permission: "controlCenter"
			};
			this.$http.get("/api/v2/index/places/0/permission", data).then(function (res) {
				// _this.placeId = 5;
				_this.jsonPlaceData = res.data;
				var placeData = _this.$global.jsonTree(res.data, {});
				_this.getChildrenPlaceList(null, placeData[0].id);
				_this.placeId = placeData[0].id;
				_this.oldPlaceId = placeData[0].id;
				_this.placeData = placeData;
				// _this.getTemplate();
				// _this.defaultExpandedKeys = _this.treeFindPath(placeData, _this.placeId);
				_this.defaultExpandedKeys = [placeData[0].id];
			})
		},
		/**
		 * 获取当前地点下的所有课室
		 * @param {*} data 当前点击的地点
		 * @param {*} id 当前地点id
		 * @returns 
		 */
		getChildrenPlaceList: function (data, id) {
			if (data && data.id == this.placeId) return;
			if (data) {
				this.placeId = data.id;
				this.oldPlaceId = data.id;
			}
			var placeId = data ? data.id : id;
			this.classroomList = [];
			this.setActiveComponent(null);
			this.showClassroomEmpty = false;
			this.dialog.showButtonEditDrawer = false;
			// /screenManager/api/control-templatedashboard/places
			var url = "/api/control-template/dashboard/places?placeId=" + placeId;
			var _this = this;
			this.$http.get(url, null).then(function (res) {

				_this.$refs.placeTree.setCurrentKey(placeId);
				var resData = res.data || [];
				// for (var index = 0; index < 10; index++) {
				// 	resData.push(res.data[0])
				// }
				// 没有教室 或者只有一个并且id相同直接获取按钮
				if (!resData.length || (resData.length == 1 && resData[0].id == placeId)) {
					_this.getTemplate(true);
					_this.notChildrenId = _this.placeId; // 添加显示模板的id

					_this.snapshotData = new _this.ArrayStack();
					_this.setActiveComponent(null);
					_this.activeNames = [];

					_this.isEdit = false;
				} else {
					_this.notChildrenId = "";
					_this.classroomList = resData;
				}

			})
		},
		/**
		 * 根据某一个id查找当前节点所有父节点id
		 * @param {*} tree 树结构数据
		 * @param {*} menuid 需要查找的id
		 * @returns 
		 */
		treeFindPath: function (tree, menuid) {
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
		 * 获取按钮列表 并初始化按钮样式
		 */
		getButtonList: function (id, addDirectionArr, propertyFlags) {
			var data = {
				placeId: id || this.placeId,
				propertyFlags: propertyFlags || this.buttonAllType.join(",")
			}
			var config = null;
			var _this = this;
			this.$http.get("api/control-template/components", data, config).then(function (res) {
				var data = res.data;

				_this.placeId = id || _this.placeId;
				var arr = [],
					overflowParentKey = null;

				var typeArr = [
					{ id: "speed_low", icon: "iconcaozuo_disu" }, // 低速
					{ id: "speed_middle", icon: "iconcaozuo_zhongsu" }, // 中速
					{ id: "speed_high", icon: "iconcaozuo_gaosu" }, // 高速
					{ id: "speed_auto", icon: "iconzidong" }, // 速度自动
					{ id: "swing_wind", icon: "iconkongtiao1" }, // 摆风
					{ id: "refrigeration", icon: "iconqichexiangguan-zhileng" }, // 制冷
					{ id: "heating", icon: "iconzhire" }, // 制热
					{ id: "arefaction", icon: "iconchushi" }, // 除湿
					{ id: "ventilate", icon: "icona-28tongfengfengshan" }, // 通风
					{ id: "function_auto", icon: "iconzidong" }, // 温度自动
					{ id: "switch" }, // 开关
				]
				var groupButton = {};

				typeArr.forEach(function (tp) {
					var componentId = [_this.placeId + "_air_" + tp.id];
					groupButton[componentId] = tp.icon || true;
				});
				_this.groupButtonIcons = groupButton;

				var _air_switch = _this.placeId + _this.switchComponentId;
				var _air_temp_value = _this.placeId + _this.temperatureComponentId;

				var result = _this.setInsDefauleStatus(data);
				var group = result.group;
				var airSwitch = result.airSwitch; // 开关
				var temperature = result.temperature; // 温度

				// 排序
				var common = data.filter(function (item) {
					if (item.componentId == _air_temp_value) {
						return false;
					}
					return !groupButton[item.componentId];
				});
				data = common.concat(group);
				if (airSwitch) data.unshift(airSwitch);
				if (temperature) data.unshift(temperature);


				// buttonData添加对应的数据列表
				for (var key in _this.buttonData) {
					if (!addDirectionArr || (addDirectionArr && _this.buttonFromDevType[key] == "aircondition")) _this.buttonData[key] = [];
					var devType = _this.buttonFromDevType[key];
					// 根据后端返回的按钮类型 往buttonData添加对应的类型
					data.forEach(function (item, i) {
						var propertyFlag = item.propertyFlag; // 按钮设备类型
						if (propertyFlag == devType) {
							if (key == _this.electricType) {
								if (!item.inherent) _this.buttonData[key].push(item);
							} else {
								_this.buttonData[key].push(item);
							}
						}
					});
					
				}

				// 对应的按钮区域按钮列表初始化数据
				for (var key in _this.buttonData) {
					if (!addDirectionArr || (addDirectionArr && _this.buttonFromDevType[key] == "aircondition")) {
						// 判断是否为按钮类型的设备 初始化样式
						if (_this.parentType.indexOf(key) != -1) {
							_this.$initButtonStyle(key);
						}
						var over = _this.buttonData[key].some(function (item) {
							return item.style && item.style.top + item.style.height > _this.dragDropCanvas.height;
						})
						if (over) {
							overflowParentKey = overflowParentKey || {};
							if (!overflowParentKey[key]) overflowParentKey[key] = key;
						}
					}
					
				}

				// 过滤掉已经存储到buttonData的按钮
				for (var key in _this.buttonData) {
					var devType = _this.buttonFromDevType[key];

					data = data.filter(function (item) {
						return item.propertyFlag != devType;
					})
				}

				//#region 初始化模板按钮样式

				var propertyIds = [];
				var isInsButton = false; // 是否为需要选指令的按钮

				// 合并按钮
				for (var key in _this.buttonData) {
					arr = arr.concat(_this.buttonData[key]);
				}
				arr = arr.concat(data);

				// 初始化 style.control
				arr.forEach(function (item) {
					if (_this.instructionsPropertyFlag[item.propertyFlag]) {
						isInsButton = true;
					}
					var list = item.style.control ? item.style.control.instructList : [];
					if (item.style.control && !item.style.control.type) {
						if (_this.instructionsPropertyFlag[item.propertyFlag] && item.propertyFlag != "button") {
							_this.$set(item.style.control, "type", "system");
						} else {
							_this.$set(item.style.control, "type", "custom");
						}

						list.forEach(function (ins) {
							if (!ins.active) _this.$set(ins, "active", false);
							for (var key in _this.templateControl) {
								_this.$set(ins, key, _this.templateControl[key]);
							}
						});
						
					}
					if (item.style.control) {
						var propertyId = item.style.control.instructList[0].propertyId || item.style.control.propertyId;
						var instructId = item.style.control.instructList[0].instructId || item.style.control.instructId;
						var propertyIndex = propertyIds.indexOf(propertyId);
						if (propertyIndex == -1 && propertyId) propertyIds.push(propertyId);
						_this.$set(item.style.control.instructList[0], "instructId", instructId);
						_this.$set(item.style.control.instructList[0], "propertyId", propertyId);

						for (var key in list[0]) {
							_this.$set(item.instructList[0], key, list[0][key]);
						}
					}
					if (!item.style.backgroundRadio) _this.$set(item.style, "backgroundRadio", 1);
					var bgColor = item.style.backgroundColor;
					_this.$set(_this.componentBuackgroundImageData, item.type, {start: bgColor, end: bgColor})
				});

				arr = _this.setInsDefaultData(arr, groupButton);
				// 过滤返回的方向按钮 合并自定义的方向按钮
				arr = arr.concat(_this.directionArr);

				// 模板按钮设置样式
				var keys = ['width', 'left', 'height', 'top'];
				data.forEach(function (item) {
					keys.forEach(function (s) {
						if (item.style[s] != undefined) item.style[s] = _this.transToRealDataFromCanvas(item.style[s]);
					});
				});

				// 模板内的按钮组件
				if (isInsButton && !addDirectionArr) _this._getDeviceList(propertyIds);

				_this.oldButtonAllData = JSON.parse(JSON.stringify(arr));
				_this.buttonAllData = JSON.parse(JSON.stringify(arr));
				console.log("buttonList:", _this.buttonAllData);
				//#endregion


				_this.UndoSaveDebouncer(_this.buttonAllData);

				// 按钮超出区域
				if (overflowParentKey) {
					_this.componentData.forEach(function (com) {
						if (overflowParentKey[com.parentType]) _this.overflowParentKey.push(com.item);
					});
					var text = _this.overflowParentKey.join("、");
					_this.$notify({
						title: _this.I18nNotify,
						message: text,
						type: 'warning',
						duration: 0
					});
				}
				
				/**
				 * 只在初始的时候赋值 也就是当前地点IP对讲数据没有的时候才赋值 为了实现切换地点 不切换文本
				 */
				if (!_this.placeStatus) _this.setPlaceIpCallStatus();
				_this.componentData = _this.componentData.filter(function (el) {
					return el.type != "button";
				});
			}).catch(function (err) {
				console.log(err);
			})
		},
		/**
		 * 发送指令
		 * @param {*} item 当前按钮
		 * @returns 
		 */
		sendButtonInstructions: function (item, switchValue) {
			if (this.isEdit) return;
			// 自定义方向组件
			if (item.type == this.directionComponentType) return;
			// IP对讲按钮
			if (item.typeIdentical == this.iPIntercomType) {
				this.sendIPIntercom(item);
				return;
			}
			// 温度按钮
			if (item.componentId == this.placeId + this.temperatureComponentId) return;
			clearTimeout(this.timer)
			var status = this.buttonStatus;
			var _this = this;

			/**
			 * 状态回码返回一直为 0则不让操作此按钮
			 * 
			 * 或者包含互斥按钮的回码未响应
			 */
			for (var session in status) {
				var isGroup = this.buttonAllData.some(function (gr) {
					return gr.group == status[session].group;
				})
				if (item.id == status[session].id || isGroup) return this.$global.showError($i.t("ccjs70"));
			}

			if (this.placeId + this.switchComponentId == item.componentId) {
				var id = item.instructList[0].propertyId;
				this.$set(item, "myActive", !switchValue);
				if (!id) return this.$global.showError($i.t("ccjs71"));
			}

			this.timer = setTimeout(function () {
				if (item.style.function == "jumpPage") return _this.sendButtonComponent(item);
				if (item.style.function == "control" && item.style.control.type == "custom") return _this.sendButtonControlComponent(item);
				var instructId = item.instructList ? item.instructList[0].id : "",
					propertyId = item.instructList ? item.instructList[0].propertyId : "",
					list = item.instructList || [];

				list.forEach(function (el) {
					if (!el.active) instructId = el.id;
				});

				var data = {
					uuid: item.uuid,
					instructId: instructId
				};
				var control = item.style.control;
				var instructList = control ? control.instructList : [];

				if (!_this.instructionsPropertyFlag[item.propertyFlag]) return _this.confirmSend(item, data);

				delete data.uuid;
				data.propertyId = propertyId;

				if (item.group) {
					data.groups = item.group;
				}
				/**
				 * 获取未选中的指令
				 * 如果为分组则 将指令中的id给分组指令id
				 */
				var find = _this.findByKeyValue(instructList, "active", false) || _this.findByKeyValue(instructList, "active", undefined);
				var activeFind = _this.findByKeyValue(instructList, "active", true) || instructList[0];
				if (find) { 
					if (item.group) data.groupInstructs = find.id;
					data.instructId = find.instructId;
				}
				data.instructId = activeFind.instructId;
				// 未选择指令
				if (!data.propertyId || !data.instructId) {
					return _this.$global.showError($i.t("ccjs71"));
				}

				// 保存按钮逻辑
				if (item.componentId == _this.placeId + _this.saveComponentId) {
					_this.showPresetDialog = true;
					_this.saveButtonPresetData = {
						item: item,
						data: data
					}
					return;
				}

				// 空调
				if (item.propertyFlag == "aircondition") {
					if (instructList.length <= 1) {
						if (activeFind) data.instructId = activeFind.instructId;
					}
					data.componentId = item.componentId;
					if (item.linkGroups) {
						data.linkGroups = item.linkGroups;
						data.linkGroupInstructs = item.linkInstructs;
					}

					data.componentId = item.componentId;
					data.placeId = _this.placeId;
					_this.sendAirconditionInstruct(data, item);
					return;
				}

				_this.confirmSend(item, data);
			}, 500)

		},
		/**
		 * 确认保存当前位置到指定预置位
		 */
		confirmSendPreset: function () {
			var result = this.saveButtonPresetData;
			var data = {};
			for (var key in result.data) {
				data[key] = result.data[key];
			}

			var instructList = result.item.style.control.instructList,
				savePreset = this.savePreset;
			instructList.forEach(function (item) {
				if (item.id == savePreset) data.instructId = item.instructId;
			});
			if (!data.instructId) return this.$global.showError($i.t("ccjs77"));
			this.showPresetDialog = false;

			this.confirmSend(result.item, data);
		},
		/**
		 * 确认发送指令
		 * @param {*} item 当前按钮
		 * @param {*} data 参数
		 */
		confirmSend: function (item, data) {
			var url = "/api/control-template/control",
				_this = this;
			var config = {
				loading: false,
				contentType: "application/x-www-form-urlencoded"
			}

			_this.$http.post(url, data, config).then(function (res) {
				_this.sendHandlerThen(item, data);
				if (!res.data.session) return;
				_this.buttonStatus[res.data.session] = item;
				_this.getSessionStatusMap(item);
			}).catch(function (err) {
				console.log(err);
			})
		},
		/**
		 * 发送空调指令
		 * @param {*} data 参数
		 * @param {*} item 当前按钮数据
		 */
		sendAirconditionInstruct: function (data, item) {
			var placeId = this.placeId;
			if (this.switchButtonData && !this.switchButtonData.myActive && item.componentId != placeId + this.switchComponentId) {
				return this.$global.showError($i.t("ccjs72"));
			}
			// return;
			var config = {
				loading: false,
				contentType: "application/x-www-form-urlencoded"
			}
			var url = "api/control-template/aircondition/control",
				_this = this;
			_this.$http.post(url, data, config).then(function (res) {
				_this.sendHandlerThen(item, data);
				if (res.data.temperature || res.data.temperature == 0) {
					_this.buttonAllData.forEach(function (el) {
						if (placeId + _this.temperatureComponentId == el.componentId) {
							_this.$set(el.style, "text", res.data.temperature);
						}
					})
				}
				// if (item.propertyFlag == "aircondition") _this.getButtonList(null, true, "aircondition");

				if (!res.data.session) return;
				_this.buttonStatus[res.data.session] = item;
				_this.getSessionStatusMap(item);
			}).catch(function (err) {
				console.log(err);
			})
		},
		/**
		 * 发送指令成功后的回调
		 * @param {*} item 当前按钮
		 * @param {*} data 参数
		 */
		sendHandlerThen: function (item, data) {
			var _this = this;
			this.$global.showSuccess($i.t("toast[7]"));
			if (!item.myActive) {
				item.instructList.forEach(function (el) {
					_this.$set(el, 'active', !el.active)
				});
			};
			if (data.groups) {
				this.buttonAllData.forEach(function (el) {
					// 相同分组 不同id
					if (el.group == item.group && el.componentId != data.componentId) {
						_this.$set(el, "myActive", false);
					}
				})
			}
			if (item.style.control && item.style.control.instructList) {
				var instructList = item.style.control.instructList;
				this.setInsActiveValue(instructList, data.instructId);
			}

			if (item.groupType == "selfLock") this.$set(item, "myActive", !item.myActive);
			if (item.groupType == "mutex") this.$set(item, "myActive", true);

			// 组件联动
			if (!data.linkGroupInstructs) return;
			this.buttonAllData.forEach(function (el) {
				var elInstructList = el.style.control.instructList;
				if (el.group == data.linkGroups) {
					_this.$set(el, "myActive", false);
					elInstructList.forEach(function (ins) {
						if (ins.id == data.linkGroupInstructs) {
							_this.$set(el, "myActive", true);
						}
					})
				}
				
			})
		},
		/**
		 * 发送自定义指令
		 * @param {*} item 
		 */
		sendButtonControlComponent: function (item) {
			var url = "/api/control-template/control/custom",
				_this = this,
				data = {
					host: "",
					port: "",
					protocol: "",
					instruct: "",
				},
				toast = {
					host: "ccjs76",
					port: "ccjs75",
					protocol: "ccjs74",
					instruct: "ccjs73",
				}
			var list = item.style.control.instructList;
			for (var key in data) {
				data[key] = list[0][key];
			}
			if (item.group) {
				var find = this.findByKeyValue(list, "active", false) || this.findByKeyValue(list, "active", undefined);
				data.groups = item.group,
				data.groupInstructs = find.id
			}
			for (var key in data) {
				if (!data[key]) return this.$global.showError($i.t(toast[key]));
			}
			this.$http.post(url, data).then(function (res) {
				_this.$global.showSuccess($i.t("toast[7]"));
			})
		},
		/**
		 * 获取操作 (回码) 是否成功
		 * @param {*} item 当前按钮
		 * @param {*} insData 发送指令的参数
		 * @returns 
		 */
		getSessionStatusMap: function (item) {
			var url = "/api/control-template/control/session/statusMap",
				_this = this,
				data = {},
				sessions = [],
				status = this.buttonStatus;
			for (var session in status) {
				sessions.push(session);
			}

			data.sessions = sessions.join(",");
			if (!sessions.length) return clearInterval(this.buttomTime);

			this.$http.get(url, data).then(function (res) {
				var data = res.data,
					errSession = [],
					isAircondition = false;

				for (var session in data) {
					var code = data[session];
					/**
					 * (1,2) 成功或者失败必须删除当前按钮对应的返回码值
					 * 2 ? 说明失败了 需要保存按钮id 获取上一次的指令 重新修改按钮状态
					 */
					if (code == 2) {
						var sItem = _this.buttonStatus[session];
						if (sItem.propertyFlag == "aircondition") isAircondition = true;
						else errSession.push(sItem.id);
					}
					if (code != 0) delete _this.buttonStatus[session];
				}
				if (isAircondition) _this.getButtonList(null, true, "aircondition");
				if (errSession.length) _this.buttonUpStatusMap(errSession.join(","));

				var count = 0;
				for (var session in _this.buttonStatus) {
					count++;
				}

				/**
				 * 每次定时器前都清空
				 * 判断buttonStatus是否有值
				 * 也就是是否还有按钮的回执 未返回成功或失败 
				 * 有的话才需要继续调用获取接口
				 */
				clearInterval(_this.buttomTime);
				if (count > 0) _this.buttomTime = setInterval(function () {
					_this.getSessionStatusMap(item);
				}, 3000)
			})
		},
		/**
		 * 获取按钮上一次执行的指令
		 * @param {*} buttonIds 
		 */
		buttonUpStatusMap: function (buttonIds) {
			var url = "/api/control-template/button/statusMap",
				_this = this,
				data = {
					buttonIds: buttonIds
				},
				ids = buttonIds.split(","), // 要修改的按钮id组
				buttonAllData = this.buttonAllData;

			this.$http.get(url, data).then(function (res) {
				var result = res.data || {}; // {btid: id} || {group: insId}
				/**
				 * 如果返回了对应的按钮id
				 * 则修改按钮id相同 并且对应的指令id相同的active为true
				 * 也就是当前状态
				 */
				buttonAllData.forEach(function (el) {
					var instructList = el.instructList,
						btnId = el.id + "";
					if (ids.indexOf(btnId) < 0) return;
					if (!result[btnId]) return;
					instructList.forEach(function (item) {
						_this.$set(item, "active", false);
						if (item.id == result[btnId]) _this.$set(item, "active", true);
					})
					var insList = instructList.every(function (item) {
						return item.id != result[btnId];
					})
					if (insList) _this.$set(instructList[0], "active", true);

				})

			})
		},
		/**
		 * 设置指令选中状态
		 * @param {*} instructList 指令列表
		 * @param {*} instructId 发送指令的id
		 */
		setInsActiveValue: function (instructList, instructId) {
			var _this = this;
			if (!instructId) return;
			if (instructList.length > 1) {
				instructList.forEach(function (ins) {
					_this.$set(ins, "active", false);
					if (ins.instructId == instructId) _this.$set(ins, "active", true);
				});
			}
		},
		/**
		 * 切换当前通话类型
		 * @param {*} item 
		 */
		changeCallType: function (notSend, item) {
			if (this.isEdit || (item && !this.placeStatus[item.id])) return;
			this.showMyDialog = !this.showMyDialog;
			this.showOtherDialog = !this.showOtherDialog;

			var type = this.callType;
			this.callType = type == 1 ? 2 : 1;
			if (this.callType == 1) {
				this.playCameraOrVideo();
			} else {
				this.closeAllCamera();
			}

			// 1 ? 视频 : 语音
			if (!notSend) this.sendCallNotify("callType", this.callType);
		},
		changeShowMyVideo: function () {
			this.showMyDialog = !this.showMyDialog;
			if (this.showMyDialog) {
				this.playCameraOrVideo("my");
			} else {
				this._cameraClose(this.fromId);
			}
			// true ? 打开 : 关闭
			this.sendCallNotify("open", this.showMyDialog);
		},
		/**
		 * 点击弹框挂断
		 * @param {*} item 
		 */
		changeHangUp: function (item) {
			this.hangUpPlaceCall({
				id: this.currIpButtonKey
			});
		},
		/**
		 * 点击小视频 切换两个视频的链接 以实现切换大小
		 */
		changeCanvas: function () {

		},
		/**
		 * 修改视频放大缩小
		 * @param {*} timeTotal 要显示的通话时长
		 */
		changeMinimize: function (timeTotal) {
			var size = this.minimizeSize;

			this.minimizeSize = size == "big" ? "min" : "big";
		},
		setTotalTime: function () {
			var _this = this,
				start = this.callStartTime;
			this.totalSecond = 0;
			if (this.totalTime) clearInterval(this.totalTime);
			this.totalTime = setInterval(function () {
				var currDate = new Date(),
					time = currDate - start,
					hour = parseInt((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
					minutes = parseInt((time % (1000 * 60 * 60)) / (1000 * 60)),
					second = parseInt((time % (1000 * 60)) / 1000),

					arr = [hour, minutes, second],
					text = arr.map(function (t) {
						return _this.addZero(t);
					}).join(":");
				_this.totalSecond += 1;
				_this.callTimeTotal = text;
			}, 1000);
		},
		addZero: function (val) {
			return val < 10 ? "0" + val : val;
		},








		/**
		 * 获取集控列表
		 * @param {*} ids 
		 */
		getClassroomData: function (ids) {
			var url = "/api/control-template/multi/buttons",
				_this = this,
				data = {
					placeId: ids
				};
			this.$http.get(url, data).then(function (res) {
				_this.controlButtonList = res.data || [];
				_this.getClassRoomStatus();
			})
		},
		/**
		 * 修改集控名称
		 * @param {*} btn 
		 */
		updateClassroomName: function (btn) {
			var url = "/api/control-template/multi/button",
				_this = this,
				config = {
					loading: false,
					contentType: "application/x-www-form-urlencoded"
				},
				data = {
					id: btn.id,
					name: btn.name,
					// style:{} // 预留字段 暂时用不到
				}
			this.$http.post(url, data, config).then(function (res) {
				_this.getClassroomData();
				_this.$global.showSuccess($i.t("toast[4]"));
				// _this.dblClassroomActive = _this.$deepCopy(res.data);
			})
		},
		/**
		 * 发送集控指令
		 * @param {*} btn 
		 */
		sendClassroomOrder: function (btn) {
			var ids = [],
				list = this.getCheckedKeys();
			list.forEach(function (item) {
				ids.push(item.id);
			});

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
			this.$http.post(url, data, config).then(function (res) {
				_this.$global.showSuccess($i.t("toast[7]"));
			})
		},
		/**
		 * 获取教室使用情况
		 */
		getClassRoomStatus: function () {
			var url = "/api/control-template/multi/classRoom",
				_this = this;
			this.$http.get(url).then(function (res) {
				console.log(res);
				_this.classrommStatusData = res.data;
			})
		},
		/**
		 * 获取当前地点远程协助id
		 * @param {*} type 调用方法的类型
		 */
		getRemoteList: function (type) {
			if (!this.isOk) return this.$global.showError($i.t("ccjs45"));
			// this.remoteId = "aa88"
			// this._desktop();
			// return
			// /api/control-template/deskRemote/list?placeId=
			var url = "/api/control-template/deskRemote/list?placeId=" + this.placeId,
				_this = this;
			this.$http.get(url).then(function (res) {
				console.log(res);
				_this.remoteId = res.data[0] ? res.data[0].number : null;
				if (_this.isNull(_this.remoteId)) {
					_this.$global.showError($i.t("ccjs51"));
					return;
				}
				_this._desktop();
				_this.showRemoteAssistance = true;
			})
		},





		listByData: function (list) {
			var newList = list.filter(function (item) {
				return item.type == 3 || item.type == 4;
			})
			return newList[0] || null;
		},
		/**
		 * 播放视频
		 * @returns
		 */
		protocolByLoaction: function (objKey) {
			var _this = this;
			/**
			 * https://cdn.theguardian.tv/HLS/2015/07/20/150716YesMen.m3u8
			 * https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv
			 */
			var list = this.iPIntercomObj.toVideoConfigList || [];
			var myList = this.iPIntercomObj.fromVideoConfigList || [];
			// var list = [];
			// var myList = [];


			if (!list.length && objKey == "other") this.notVideoEmpty = true;
			if (!myList.length && objKey == "my") this.myNotVideoEmpty = true;

			this[objKey == "my" ? "showMyVideoPlay" : "showVideoPlay"] = true;

			var obj = {
				my: {
					data: this.listByData(myList),
					urlKey: "myVideoUrl",
					node: "myvideo"
				},
				other: {
					data: this.listByData(list),
					urlKey: "videoUrl",
					node: "canvasvideo"
				}
			};
			var urlkey = obj[objKey].urlKey;
			if (!list.length && !myList.length && this.notVideoEmpty && this.myNotVideoEmpty) {
				this.showMyDialog = false;
				this.showOtherDialog = false;
				// this.callType = 2;
			}

			if ((objKey == "my" && !myList.length) || (objKey == "other" && !list.length)) return;

			this[urlkey] = obj[objKey].data || {};
			_this.$nextTick(function () {
				if (_this[urlkey]) {
					_this.initHlsVideo(obj[objKey], objKey);
				}
			})

			// for (var key in obj) {
			// 	var result = obj[key],
			// 		urlkey = result.urlKey;

			// 	this[urlkey] = result.data;
			// 	this.showOnCallDialog = true;
			// 	this.showMyVideoPlay = true;

			// 	/**
			// 	 * 使用闭包解决作用域问题
			// 	 * 
			// 	 * 因为循环内部使用异步操作并且是var声明 会出现循环已经完成 但是执行还未完成
			// 	 * 导致每次执行只能拿到循环完成后的最后一个值
			// 	 * 使用闭包传参 会因为内部引用导致内存无法释放
			// 	 */
			// 	(function (result, key) {
			// 		_this.$nextTick(function () {
			// 			if (_this[urlkey]) {
			// 				_this.initHlsVideo(result, key);
			// 			}
			// 		})
			// 	})(result, key)

			// }
		},
		/**
		 * 获取url不带请求参数的路径
		 * @param {}} url
		 */
		getUrlWithoutQuery: function (url) {
			if (this.isNull(url)) {
				return url;
			}
			if (url.indexOf("?") == -1) {
				return url;
			}
			var arr = url.split("?");
			return arr.length > 0 ? arr[0] : url;
		},
		isAllowSuffix: function (filename, allowSuffixs) { //判断当前文件名称是否符合后缀
			if (this.isNull(filename)) {
				return false;
			}
			if (this.isNull(allowSuffixs)) {
				return false;
			}
			var _this = this;
			var isAllow = allowSuffixs.some(function (suffix) {
				return _this.endWith(filename.toLowerCase(), suffix.toLowerCase());
			})
			return isAllow;
		},
		endWith: function (str, endStr) {
			var d = str.length - endStr.length;
			return (d >= 0 && str.lastIndexOf(endStr) == d)
		},
		isFlvUrl: function (url) { //是否flv链接        
			if (url == null) {
				return false;
			}

			//判断文件后缀是否mp4、mov、m4v、mkv
			url = this.getUrlWithoutQuery(url);
			if (this.isAllowSuffix(url, ["mp4", "mov", "m4v", "mkv", "m3u8"])) {
				return false;
			}

			//判断是否以rtsp://,rtmp://开头
			url = url.toLowerCase();
			if (url.indexOf("rtmp://") == 0 || url.indexOf("rtsp://") == 0) {
				return false;
			}
			return true;
		},
		initHlsVideo: function (result, key) {
			var data = result.data || {};
			var type = data.type, // 后端视频类型
				url = data.url || "", // 后端视频链接
				videoSrc = url || "",
				nodekey = result.node; // 视频要显示的node位置

			if (type == 3 && this.isFlvUrl(videoSrc)) return this.flvPlay(result, key);
			var config = {
				liveSyncDurationCount: 0,
			};
			var video = this.$refs[nodekey] || document.getElementById(nodekey);

			if (Hls.isSupported()) {
				this.hls[key] = this.hls[key] || new Hls(config);
				this.hls[key].loadSource(videoSrc);
				this.hls[key].attachMedia(video);
				this.hls[key].on(Hls.Events.MANIFEST_PARSED, function () {
					video.play();
				});
				this.hls[key].on(Hls.Events.ERROR, function (event, hlsData) {
					var errorType = hlsData.type;
					var errorDetails = hlsData.details;
					var errorFatal = hlsData.fatal;

					console.log(errorType, errorDetails, errorFatal);
				});
			} else if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
				video.src = videoSrc;
				video.addEventListener('canplay', function () {
					video.play();
				});
			}
		},
		flvPlay: function (result, key) {
			var data = result.data || {};
			//使用flvjs播放
			var url = data.url,
				nodekey = result.node;

			var videoEle = this.$refs[nodekey] || document.getElementById(nodekey);

			if (videoEle) {
				var flvPlayer = flvjs.createPlayer({
					type: "flv",
					url: url,
					isLive: true,
					cors: true,
					enableWorker: true,
					enableStashBuffer: false,
					stashInitialSize: 128,
					autoCleanupSourceBuffer: true
				})
				flvPlayer.attachMediaElement(videoEle);
				flvPlayer.load();
				flvPlayer.play();
				// 监听
				flvPlayer.on(flvjs.Events.ERROR, function (err) {
					console.log(err);
				})

				//取消监听
				// flvPlayer.off(flvjs.Events.ERROR, function () {})

				this.flvPlayer[key] = flvPlayer;
			}
		},
		clearAllTime: function () {
			if (this.iPIntercomTime) clearInterval(this.iPIntercomTime);
			if (this.onLineCountTime) clearInterval(this.onLineCountTime);
			if (this.totalTime) clearInterval(this.totalTime);

			if (this.callClientNotify) clearTimeout(this.callClientNotify);
			if (this.callReasultTime) clearTimeout(this.callReasultTime);

			this.iPIntercomTime = null;
			this.onLineCountTime = null;
			this.totalTime = null;
			this.callClientNotify = null;
			this.callReasultTime = null;
		},
		destroyPlayer: function () {
			this.setIncomingCallShow(false);
			this.setExhaleShow(false); // 呼出的弹框
			this.sendIPButtonData = null;

			this.clearAllTime();

			this.callStartTime = null; // 清除开始时间
			this.setPlaceIpCallStatus(this.currIpButtonKey, 0);

			this.videoUrl = {};
			this.myVideoUrl = {};
			this.showVideoPlay = false;
			this.showMyVideoPlay = false;
			this.iPIntercomObj = {};

			for (var key in videoStyle) {
				this.callCanvasStyleData[0].style[key] = videoStyle[key];
			}

			//暂停flv播放器的播放
			for (var key in this.flvPlayer) {
				var result = this.flvPlayer[key];
				if (result) {
					result.pause();
					result.unload();
					result.detachMediaElement();
					result.destroy();
					this.flvPlayer[key] = null;
				}
			}
			var nodes = {
				my: "myvideo",
				other: "canvasvideo"
			}
			for (var key in this.hls) {
				var result = this.hls[key];
				if (result) {
					var node = nodes[key];
					var video = this.$refs[node] || document.getElementById(node);
					video.pause();
					result.destroy();
					this.hls[key] = null;
				}
			}
			this.closeMicrophoneAndInitHeart(this.showCallDialog);
			if (this.showCallDialog) this.closeAllCamera();
			this.showCallDialog = false; // 隐藏弹框
		},
		/**
		 * 关闭当前开启的摄像头
		 */
		closeAllCamera: function () {
			var arr = [this.fromId, this.toId],
				_this = this;
			arr.forEach(function (id) {
				if (id) _this._cameraClose(id);
			});
		},




		changeStreamSelect: function (val, type) {
			if (this.$refs[type] && this.$refs[type][0]) {
				this.$refs[type][0].changeStreamSelect();
			}
		},
		/**
		 * 组件标题按钮高度
		 * @returns 
		 */
		titleHeight: function (item) {
			var title = item.type + '-logo';
			if (this.$refs[title] && this.$refs[title][0]) return {
				height: (this.$refs[title][0].offsetHeight + 10) + "px"
			}
		},
		/**
		 * 
		 * @param {*} val 
		 * @param {*} key 
		 */
		gradientGlobalBgColor: function (val, key) {
			var item = this.globalButtonStyle,
				colors = this.globalBuackgroundImageData,
				opacity = (100 - item.backgroundOpacity) / 100,
				start = this.colorRgb(colors.start, opacity),
				end = this.colorRgb(colors.end, opacity),
				bg = "linear-gradient(0deg, " + end + ", " + start + ")";
				console.log(bg);
			this.$set(item, "backgroundImage", bg);
		},
		gradientBgColor: function (val, key) {
			var item = this.currActiveComponent[0],
				colors = this.componentBuackgroundImageData[item.type],
				opacity = (100 - item.style.backgroundOpacity) / 100,
				start = this.colorRgb(colors.start, opacity),
				end = this.colorRgb(colors.end, opacity),
				bg = "linear-gradient(0deg, " + end + ", " + start + ")";
				console.log(bg);
			this.$set(item.style, "backgroundImage", bg)
		},
		/**
		 * 设置按钮选中状态
		 * @param {*} data 按钮列表
		 * @returns 
		 */
		setInsDefauleStatus: function (data) {
			var _this = this,
				groupButton = this.groupButtonIcons,
				airSwitch = null, // 开关
				temperature = null, // 温度
				_air_switch = _this.placeId + _this.switchComponentId,
				_air_temp_value = _this.placeId + _this.temperatureComponentId;

			var group = data.filter(function (item) {
				var myActive = false;
				var instructList = item.instructList || [];

				/**
				 * _air_switch 开关状态
				 * 
				 * 反之则判断按钮选中（是按钮组 并且选中 并且label == on）
				 */
				_this.$set(item, "myActive", false);

				for (var index = 0; index < instructList.length; index++) {
					var ins = instructList[index]
					myActive = instructList[index].active;

					if (instructList.length > 1) {
						if (item.group && myActive && ins.label == "on") {
							_this.$set(item, "myActive", true);
						}
					} else {
						if (item.group && myActive)  _this.$set(item, "myActive", true);
					}
				}

				if (item.componentId == _air_switch) {
					airSwitch = item;
				}

				if (item.componentId == _air_temp_value) {
					temperature = item;
				}
				var isTrue = groupButton[item.componentId] && item.componentId != _air_switch
				return isTrue;
			});
			return {
				group: group,
				airSwitch: airSwitch,
				temperature: temperature
			};
		},
		/**
		 * 初始化时设置默认颜色
		 * @param {*} arr 按钮列表
		 * @returns 
		 */
		setInsDefaultData: function (arr) {
			var _this = this
			var newArr = arr.filter(function (el, elI) {
				return !_this.directionButton[el.componentId];
			});

			/**
			 * 设置方向默认颜色
			 */
			_this.directionArr.forEach(function (item) {
				if (!item.style.color) {
					_this.$set(item.style, "color", "#3f434d");

					if (item.componentId == _this.placeId + "_camera_reset") {
						_this.$set(item.style, "color", "#191b20");
					}
				}
			});
			return newArr;
		},
		/**
		 * 根据指令的label 与预置位的id相同 返回预置位名称
		 * @param {*} item 当前按钮 (保存的四个预置位指令)
		 * @returns 
		 */
		cameraPresetName: function (item) {
			for (var index = 0; index < this.buttonAllData.length; index++) {
				var el = this.buttonAllData[index];
				if (item.label == el.id) return el.style.text;
			}
		},
		getBtnTextByRelayStatus: function (record, isFind) { //根据当前的开关状态和指令列表显示
			var isOpen = record.active;
			var instructList = record.instructList || [];
			var label = isOpen ? "on" : "off";
			var find = this.findByKeyValue(instructList, "label", label);
			if (isFind) return find;
			return find != null ? find.active : false;
		},
		/**
		 * 在数组中查找指定key并value相同的对象，并返回第一个查找到的
		 */
		findByKeyValue: function (array, key, value) {
			if (array == null) {
				return null;
			}
			for (var i = 0; i < array.length; i++) {
				if (array[i][key] == value) {
					return array[i];
				}
			}
			return null;
		},
		groupButtonStyle: function (style) {
			var opacity = (100 - style.backgroundOpacity) / 100;
			var result = {};

			var radius = style.borderRadius.top + 'px ' + style.borderRadius.right + 'px ' + style.borderRadius.bottom + 'px ' + style.borderRadius.left + 'px';
			result.borderRadius = radius;

			result.backgroundColor = this.colorRgb(style.backgroundColor, opacity);
			result.backgroundImage = style.backgroundImage;
			return result;
		},
		/**
		 * 断开远程
		 */
		disconnectRemoteAssistance: function () { // 断开远程
			if (!this.showRemoteAssistance) return;
			// this.playRemoteAssistance(1)
			this.remoteOperation = false;
			this.isFullScreen = false;
			this.omcsClient.desktopSetWatchingOnly(!this.remoteOperation); // 不可操作
			this._desktopClose();
		},
		/**
		 * 开启远程操作
		 * @param {*} item 当前组件
		 */
		operationRemoteAssistance: function (item) {
			if (!this.isOk) return this.$global.showError($i.t("ccjs45"));

			if (this.showRemoteAssistance) {
				this.omcsClient.desktopSetWatchingOnly(this.remoteOperation); // 可操作
				this.remoteOperation = !this.remoteOperation;
			}
			if (!this.showRemoteAssistance) this.handlerRemote(item, 'open');
		},
		/**
		 * 为了兼容黑色样式 添加区域标题 组件的宽高去要减去标题
		 * @param {*} item 当前组件数据
		 * @returns 返回一个新的组件宽高
		 */
		myComponentWHLT: function (item) {
			var title = item.type + '-title';
			var node = this.$refs[title];
			var minStyle = this.drop.minStyle();
			var titleHeight = node.offsetHeight;
			var padding = 0;

			if (item.title.show) {
				padding = this.dynamicSize(paddingNum[item.type], null, null, "padding").padding.replace("px", "") * 1;
			}            

			var result = {};
			['width', 'height'].forEach(function (attr) {
				if (attr) {
					result[attr] = (item.style[attr] - padding - item.style.borderWidth * 2) * minStyle + 'px'
					if (attr == "height") result[attr] = (item.style[attr] - padding - titleHeight - item.style.borderWidth * 2) * minStyle + 'px'
				}
			})
			
			return result;
		},
		dynamicSize: function (item, num, defaulWidth, defaultHeight, key) {
			var minStyle = this.minStyle();
			var width = item.style.width;
			var height = item.style.height;
			var style;
			var defaulWidth = defaulWidth || 548;
			var defaultHeight = defaultHeight || 321;
			key = key || "fontSize";
			var size = (num || 22) / minStyle;
			if (width > height) {
				style = {
					[key]: Math.floor(size / defaulWidth * height * minStyle) + 'px'
				}
			} else {
				style = {
					[key]: Math.floor(size / defaultHeight * width * minStyle) + 'px'
				}
			}
			return style;
		},
		/**
		 * 双击模板组件
		 * @param {*} e 
		 * @param {*} item 
		 * @param {*} show 
		 */
		dbclickEditButtonComponent: function (e, item, show) {
			this.dialog.showButtonEditDrawer = true;
		},
		/**
		 * 模板组件发送指令
		 * @param {*} item 
		 */
		sendButtonComponent: function (item) {
			console.log(item);
			var router = item.style.router;
			if (router.type != "custom") {
				this._getMenuUrl(router.menuFlag, router);
				return
			}
			this.changeJumpPage(router);
			return;
		},
		/**
		 * 处理页面跳转 逻辑抽离 因为多个地方使用
		 * @param {*} router 当前按钮的跳页数据
		 * @param {*} url 要跳转的链接
		 * @returns 
		 */
		changeJumpPage: function (router, url) {
			var url = url || router.url;
			var openType = router.openType;
			if (openType == "new") return window.open(url, "_blank");
			this.pageUrl = url;
			this.$nextTick(function () {
				this.showPageDialog = true;
			})
		},
		/**
		 * 处理特殊组件数据的显示影藏
		 * @param {*} item 
		 */
		handlerSpecialComponentData: function (item) {
			
		},
		/**
		 * 切换主题
		 */
		switchTheme: function () {
			window.parent.location.href = this.setingUrl.v2;
		},
		changeLocalDevice: function (val) {
			if (!this.instructionObjList[val]) this._getInstructionsList(val);
		},
		/**
		 * 获取其他主题色链接
		 */
		_getInitUrl: function () {
			var url = "/api/v2/control-template/init/data",
				_this = this;
			this.$http.get(url).then(function (res) {
				_this.setingUrl = res.data.url;
			})
		},
		/**
		 * 获取后台菜单列表
		 */
		_getbackstagePageDataList: function () {
			var url = "/api/control-template/menus/backstage",
				_this = this;
			this.$http.get(url).then(function (res) {
				console.log(res);
			})
		},
		/**
		 * 根据后台菜单flag获取完整url
		 * 获取数据后调用方法 处理跳转逻辑并传递url
		 * @param {*} flag 
		 * @param {*} router 
		 */
		_getMenuUrl: function (flag, router) {
			var url = "/api/control-template/menu/url/byFlag",
				_this = this,
				data = { flag: flag };
			this.$http.get(url, data).then(function (res) {
				_this.changeJumpPage(router, res.data);
			})
		},
		/**
		 * 获取设备列表
		 */
		_getDeviceList: function (propertyIds) {
			var url = "/api/control-template/properties/control?placeId=" + this.placeId,
				_this = this;
			this.$http.get(url).then(function (res) {
				_this.devList = res.data;
				_this._getInstructionsList(propertyIds.join(","));
			})
		},
		/**
		 * 根据设备Id获取指令列表
		 */
		_getInstructionsList: function (propertyIds) {
			var url = "/api/control-template/instructs/byPropertyIds",
				_this = this,
				data = { propertyIds: propertyIds };
			this.$http.get(url, data).then(function (res) {
				res.data.forEach(function (item) {
					if (!_this.instructionObjList[item.propertyId]) {
						_this.$set(_this.instructionObjList, item.propertyId, []);
					}
					_this.instructionObjList[item.propertyId].push(_this.$deepCopy(item));
				});
			})
		}
	},
	watch: {
		computedGlobalButtonStyle: {
			handler: function (val, old) {
				var keys = "";
				for (var key in val) {
					if (key == "borderRadius") {
						for (var bk in val[key]) {
							if (val[key][bk] != old[key][bk]) keys = key;
						}
					} else {
						if (val[key] != old[key]) keys = key;
					}
				}
				if (!keys) return;
				this.setAllButtonStyle(val, null, keys);
			},
			deep: true
		},
		computedAlignCheckedGlobalStyle: {
			handler: function (val, old) {
				var obj = {
					fontStyle: true,
					fontWeight: true,
					height: true,
					left: true,
					top: true,
					width: true,
					textAlign: true,
					borderRadius: true,
					checkedAlign: true,
					backgroundRadio: true,
				};
				var key = "";
				var value = "";
				for (var k in val) {
					if (val[k] != old[k] && !obj[k]) {
						key = k;
						value = val[k];
					}
				}
				if (!key && !value) return;
				this.setCheckedButtonStyle(key, value)
			},
			deep: true
		},
		currActiveComponent: {
			deep: true,
			handler: function (val, old) {
				// console.log(val);
				if (val[0] != null) {
					this.updateRealWHLT(val[0].style);
					this.handlerSpecialComponentData(val[0]);
				}
			}
		},
		activeComponentRadio: function (val) {
			if (val === 1) this.setGlobalBorderRadius();
		},
		"$i18n.locale": function () {
			this.addStatusMap = $i.t('addStatusMap');
			this.repairFormData = $i.t("repairFormData");
			this.repairSelectList.levels = $i.t('levels');
		},
		placeId: function (val) {
			// this.dialog.add.obj.placeName
			for (var index = 0; index < this.jsonPlaceData.length; index++) {
				var item = this.jsonPlaceData[index];
				if (item.id == val) return this.dialog.add.obj.placeName = item.name;
			}
		},
		// showDragDrop: function (newVak) {
		// 	if (newVak && !this.omcsClient) {
		// 		this.showOMCSDialog = true;
		// 		if (!this.isOk) this.initOmcsClient();
		// 	}
		// },
		jsonCallCanvasData: {
			deep: true,
			handler: function (val) {
				var node = this.$refs.fullCanvas,
					style = val[0].style,
					width = node.clientWidth,
					height = node.clientHeight,
					diff = 5,
					minLeft = Math.max(width - style.width - diff, 0),
					minTop = Math.max(height - style.height - diff, 0);

				this.callCanvasStyleData[0].style.left = Math.min(minLeft, style.left);
				this.callCanvasStyleData[0].style.top = Math.min(minTop, style.top);
				this.callCanvasStyleData[0].style.width = Math.min(width - diff, style.width);
				this.callCanvasStyleData[0].style.height = Math.min(height - diff, style.height);
			},
		}
	},
	filters: {
		text: function (text) {
			return isNull(text) ? '——' : text;
		},
		formatUserList: function (list) {
			if (isNull(list) || list.length === 0) return "——";
			var nameArray = [];
			list.forEach(function (item) {
				var nickname = item.nickname || item.name;
				if (!isNull(nickname)) nameArray.push(nickname);
			});
			return nameArray.join("、");
		},
	},
})