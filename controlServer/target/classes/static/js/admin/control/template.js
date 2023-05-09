/**
 * 自定义管理
 * 
 * 添加新的组件 要使用对齐方式需在 showFontAlignStyle 方法中添加组件type
 */
var PAGE_NAME = "controlTemplate";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    created: function () {},
    computed: {
        currActiveComponent: function () {
            var _this = this;
            return this.componentData.filter(function (el) {
                return el.id == _this.activeComponent;
            })
        },
        showStyleOption: function () {
            var currActiveComponent = this.currActiveComponent[0];
            var type = currActiveComponent ? currActiveComponent.type : null;
            return type == "model" || type == "lamp";
        },
        showDisplayOptions: function () {
            var currActiveComponent = this.currActiveComponent[0];
            var type = currActiveComponent ? currActiveComponent.type : null;
            return (type == "course" || type == "sensor") && this.editDrawerBody.displayOptions.length;
        },
        showFontAlignStyle: function () {
            var currActiveComponent = this.currActiveComponent[0],
                type = currActiveComponent.type;
            var arr = ["sensor", "course", "attendance", "room", "electric", "course-table", "location", "static-text", "function-button", "button", "weather", "date", "datetime"];
            return arr.indexOf(type) != -1;
        },
        // 对齐和颜色一起显示的组件
        showAlignAndColor: function () {
            var currActiveComponent = this.currActiveComponent[0];
            var arr = ["course-table", "room", "electric"];
            return arr.indexOf(currActiveComponent.type) == -1;
        },
        // 字体样式
        fontFamilyList: function () {
            // return ['宋体', '黑体', '楷体', '微软雅黑'];
            return $i.t('family');
        },
        fontFamilyListText: function () {
            return ['宋体', '黑体', '楷体', '微软雅黑'];
        },
        courseText: function () {
            // return {
            // 	className: "班级名称",
            // 	instructor: "授课老师",
            // 	attendance: "出勤率",
            // 	courseInfo: "课程信息"
            // }
            return $i.t('courseText');
        },
        sensorText: function () {
            // return {
            // 	temperature: "温度",
            // 	humidity: "湿度",
            // 	co2: "二氧化碳",
            // 	pm25: "PM2.5",
            // 	pm10: "PM1.0",
            // 	voc: "voc",
            // 	hcho: "甲醛"
            // }
            return $i.t('sensorText');

        },
        functionButtonText: function () {
            return $i.t('functionButtonText');
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
        canvasSize: function () {
            return this.$refs.drag.$el.getBoundingClientRect();
        },
        canvasBgRadioLabel: function () {
            return this.globalModule[0].radio == "1" ? $i.t('set.set9') : $i.t('set.set12');
        },
        activeBgImg: function () {
            var _this = this;
            var arr = this.bgImgList.filter(function (item) {
                return item.id == _this.bgActiveIndex;
            })
            return arr.length > 0 ? arr[0] : null;
        },
        canvasBgStyle: function () {
            // filter: opacity(0.5);
            var pagesStyle = this.pagesStyle;

            var opacity = (100 - pagesStyle.backgroundOpacity) / 100;
            // if (this.globalModule[0].radio == 2) delete style.backgroundColor;
            this.pagesStyle.backgroundColor = this.colorRgb(pagesStyle.backgroundColor, opacity);
            this.pagesStyle.filter = "opacity(" + opacity + ")"
            var style = {};
            var radio = this.globalModule[0].radio;
            for (var key in pagesStyle) {
                style[key] = radio == 1 && key == "backgroundImage" ? "" : pagesStyle[key];
            }
            return style;
        },
        pagesStyle: function () {
            return this.globalModulePage.style;
        },
        globalModulePage: function () {
            return this.globalModule[0].pages[0];
        },
        attFontStyleTextAlign: function () {
            var arr = this.fontStyleHtml.filter(function (item) {
                return item.model != "fontStyle" && item.model != "fontWeight";
            });
            return arr;
        },
        attFontStyleFontStyle: function () {
            var arr = this.fontStyleHtml.filter(function (item) {
                return item.model == "fontStyle" || item.model == "fontWeight";
            });
            return arr;
        },
        repeatComponent: function () {
            return ["rectangle", "static-text", "function-button", "button", "line"];
        },
        minStyle: function () {
            var moduleStyle = this.moduleStyle;
            var recWidth = this.canvasTransForm().width;
            return moduleStyle.width / recWidth;
        },
        newComponentData: function () {
            if (this.componentData !== undefined) {
                return JSON.parse(JSON.stringify(this.componentData));
            }
        },
        // 字体字号
        label: function () {
            var font = $i.t('font');
            var types = ["course-table", "room", "electric"];
            var type = this.currActiveComponent[0].type;
            if (types.indexOf(type) != -1) return {
                fontFamily: font[0],
            }
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
                },
                {
                    icon: "iconjurassic_HorFensan-align",
                    tip: align[3],
                    model: "textAlign",
                    value: "space-around"
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
        dialog: function () {
            return {
                confirm: $i.t('yes'),
                cancel: $i.t('no'),
                message: $i.t('cctjs2'),
                visible: false
            }
        },
        activeComponentRadio: function () {
            return this.currActiveComponent.length ? this.currActiveComponent[0].style.radio : null;
        },
        radioComponentData: function () {
            return {
                "function-button": this.functionButtonText,
            }
        },
        buttonStyleOption: function () {
            var component = null,
                _this = this;
            this.componentData.forEach(function (item){
                if (item.type == "button") component = _this.deepCopy(item);
            });
            return JSON.parse(JSON.stringify(component));
        },

        /**
         * 
         * @returns 根据变量返回是否显示IP对讲数据 []
         */
        computedLeftModule: function () {
            if (openIpIntercom) return this.leftModule;
            var newList = this.leftModule.filter(function (item) {
                return item.type != "ip-intercom" && item.type != "remote-assistance";
            });
            return newList;
        }
    },
    mounted: function () {
        // var opacity = this.globalModule[0].pages[0].style.backgroundOpacity
        // this.globalModule[0].pages[0].style.backgroundOpacity = 100 - (opacity * 100);
        // var config = {
        //     loading: {
        //         context: this.cameraDialog,
        //         target: "listLoading"
        //     }
        // };
        this.initData();
    },
    data: {
        network: null, // 网络请求
        leftModule: [], // 左边组件列表
        componentData: [], // 画布组件数据
        oldComponentData: [], // 画布组件数据
        activeComponent: "", // 当前选中的组件
        isConflictIds: [], // 冲突id
        editDrawer: false, // 编辑弹框
        editDrawerTitle: "", // 编辑弹框头部
        snapshotData: [], // 保存可以撤销的数据
        comMin: {
            w: 50,
            h: 20
        },
        showBgDialog: false,
        imgLoading: null,
        bgNameSearch: "",
        bgImgList: [],
        bgActiveIndex: null,
        bgType: null, // 默认是全局背景 null 点击矩形则为矩形类型字段rectangle
        bgPage: {
            pageSize: 8,
            count: 0,
            pageNum: 1,
            search: "",
        },

        course: ["className", "instructor", "attendance", "courseInfo"],
        sensor: ["temperature", "pm25", "humidity",
            // "pm10", "voc",
            "hcho", "co2"
        ],
        "function-button": "leaflets",
        checkboxGroup: ["course", "sensor"], // 多选
        componentRadio: ["function-button"], // 单选
        lefticonList: {
            "weather": "icontianqi",
            "static-text": "iconwenben",
            "location": "icondidian5",
            "course-table": "iconbiaoge",
            "video-display": "iconshipin2",
            "course": "iconkechengbiao3",
            "sensor": "iconhuanjing",
            "attendance": "iconkaoqin1",
            "model": "iconhuiyiguanli",
            "lamp": "iconOAkaoqin-chakan-",
            "electric": "iconwangguan",
            "control": "iconmoshi",
            "room": "icontab-shouye",
            "security": "icondianyuan",
            "iot": "iconqiapianmoshi_kuai",
            "controller": "iconshebeiguanli",
            "rectangle": "icondaolanpaiguanli",
            "remote-assistance": "iconxiaozu",
            "ip-intercom": "iconjisuanqi",
            "function-button": "iconbtn",
            "button": "iconbtn",
            "air-conditioning-control": "iconkongtiao",
            "camera-control": "iconshexiangtou1",
            "line": "iconjvzhong",
            "date": "iconriqi",
            "datetime": "iconshijian3",
        },
        editDrawerBody: {
            displayOptions: [], // 循环的值
            selectDisplayOptions: [], // v-model的值
            styleOption: 5
        }, // 编辑弹框数据显示
        oldGlobalModule: null,
        globalModule: [{
            version: '1.0.0',
            radio: '1',
            style: {
                // 分辨率宽度
                width: 1345,
                // 分辨率高度
                height: 740
            },
            pages: [{
                name: '',
                desc: '',
                style: {
                    backgroundColor: '#e9e9e9',
                    backgroundOpacity: 1,
                    width: 1345,
                    height: 740,
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat'
                },
                elements: []
            }]
        }],
        style: {
            width: 203,
            left: 0,
            height: 114,
            top: 0,
            backgroundColor: '#fff',
            backgroundImage: '',
            fontSize: 20,
            fontFamily: '宋体',
            textAlign: 'center',
            color: '#999999',
            fontStyle: 'normal',
            fontWeight: 'normal',
            backgroundOpacity: 1,
        },
        componentTitleStyle: {
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
        moduleStyle: {
            width: 1345,
            height: 740
        },
        canvasStyle: {
            width: 1002,
            height: 564
        },
        attChildren: [{
                type: 'text',
                style: {
                    fontFamily: '宋体',
                    fontSize: 20,
                    color: '#333333',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                }
            },
            {
                type: 'num',
                style: {
                    fontFamily: '宋体',
                    fontSize: 20,
                    color: '#333333',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                }
            },
        ],
        styleKey: ['width', 'left', 'height', 'top'],
        styleLabelKey: ["W", "X", "H", "Y"],
        maxComponentStyle: {
            width: 0,
            height: 0,
            left: 0,
            top: 0
        },

        videoPro: ['1:1', '3:2', '4:3', '16:9', '自定义'],
        proSize: {
            0: 1 / 1,
            1: 3 / 2,
            2: 4 / 3,
            3: 16 / 9,
        },
        border: {
            radio: 1,
            borderWidth: 1,
            borderColor: "#dedede",
            borderStyle: "solid",
            borderRadius: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
        },
        borderStyle: {
			solid: "──────",
			dashed: "----------",
			dotted: "···········"
		},
        mousedownTimer: null, // 圆角定时 为实现长按调整圆角
        borderRadius: 0, // 控制多个圆角时

        saveAsText: "",
        showSaveAs: false,
        showPublish: false,
        activeTab: "first",
        placeData: [],
        placeId: [],
        templateId: "",
        treeProps: {
            children: "children",
            label: "name"
        },
        currGlobalLoading: false,
        exportLoading: false,

        //#region 2022/09/23 新增按钮、空调、摄像组件 新的组件样式
        backstagePageData: [],// 后台菜单列表
        isTextComponent: {"static-text": 4, "button": 1},
        menuProps: {checkStrictly: true, value: "flag", label: "name", emitPath: false},
        componentStyleOption: {
            attendance: 7,
            sensor: 7,
            room: 2,
            "video-display": 2,
            "remote-assistance": 2,
            "course-table": 3,
            electric: 2,
            button: 2,
            control: 2,
            weather: 7,
            date: 6,
            datetime: 5
        },
        componentBuackgroundImageData: {}, // 保存每个组件的背景颜色 为实现渐变色要使用两个颜色
        comTypeMin: {
            line: {
                w: 20,
                h: 20
            }
        },
        upload: { 
            videoAccept: "video/mp4,.mpg,.avi,.flv,.wmv,.mkv,.vob,.mov",        //视频文件upload accept属性
            videoAllowSuffixs: "mp4,flv,wmv,avi,wmv,mpg,mpeg,mkv,vob,m4v,mov",           //允许的视频格式
            imageAccept: ".jpg,.jpeg,.png,.bmp",                  //纯图片upload accept属性
            imageAllowSuffixs: "jpg,jpeg,png,bmp",                     //允许的纯图片格式
            fileAccept: ".doc,.docx,.ppt,.pptx",                          //文件upload accept属性
            fileAllowSuffixs: "doc,docx,ppt,pptx",                      //允许的文件格式
            docAccept: ".jpg,.jpeg,.png,.bmp,.doc,.docx,.ppt,.pptx",           //文档管理upload accept属性
            docAllowSuffixs: "jpg,jpeg,png,bmp,doc,docx,ppt,pptx"      //文档管理允许的文件后缀
        },
        //#endregion
    },
    methods: {
        getQueryVariable: function () {
            var href = window.location.href;
            var query = href.substring(href.indexOf('?') + 1);
            var vars = query.split("&");

            var obj = {}
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[1] != undefined) obj[pair[0]] = pair[1]
            }
            return obj;
        },
        initKeyEvent: function () {
            var _this = this;
            document.addEventListener('keydown', function (e) {
                var platform = navigator.platform.match("Mac");
                var ctrlKey = platform ? e.metaKey : e.ctrlKey;

                var targetNames = {"INPUT": true, "TEXTAREA": true};
                if (targetNames[e.path[0].tagName]) return;

                if (e.key == "Delete" || e.key == "Backspace") {
                    if (!_this.currActiveComponent[0]) return;

                    _this.deleteComponent(_this.currActiveComponent[0]);
                    _this.$nextTick(function () {
                        _this.UndoSaveDebouncer(_this.componentData);
                    })
                    return;
                }
                if (!ctrlKey) return;
                if (e.key == 's' || e.key == 'S') { // 保存
                    e.preventDefault();
                    _this.save(0);
                } else if ((e.key == 'z' || e.key == 'Z')) { // 撤销
                    _this.clickUndo();
                }
            });
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
        // 只为解决计算属性没法传参问题
        minStyleMethods: function () {
            var moduleStyle = this.moduleStyle;
            var recWidth = this.canvasTransForm().width;
            return moduleStyle.width / recWidth;
        },
        clickNotActive: function (e) {
            e = e || window.event;
            e.stopPropagation();
            e.preventDefault();
            var className = ["components-center", "editor-icon", "components-canvas-bottom"];
            if (!this.activeComponent) return;
            for (var index = 0; index < className.length; index++) {
                if ((e.target.className).indexOf(className[index]) != -1) this.activeComponent = null;
            }
        },
        initData: function () {
			this._getbackstagePageDataList();
            this.initKeyEvent();
            this.snapshotData = new this.ArrayStack();
            this.getPlaceData();
            this.initLeftModule();
            var query = this.getQueryVariable();
            this.templateId = query.templateId;

            var item = localStorage.getItem("controlIndex") ? JSON.parse(localStorage.getItem("controlIndex")) : {};
            this.globalModulePage.name = item.name || "";

            if (!this.templateId) return;
            this.getTemplate();
        },
        /**
         * 生成组件基础样式
         */
        initLeftModule: function () {
            var _this = this;
            // var text = ["电箱控制", "考勤信息", "矩形组件", "中控控制", "视频显示窗", "传感器数据", "IOT模块组件", "课程信息展示", "上课模式控制", "护眼灯控制", "房间设备组件", "安全用电组件", "红外控制器组件"];
            // var type = ["electric", "attendance", "rectangle", "control", "video-display", "sensor", "iot", "course", "model", "lamp", "room", "security", "controller", ];

            var text = $i.t('componentText');
            var border = _this.deepCopy(this.border);
            var componentTitleStyle = this.componentTitleStyle;
            var typeWh = {
                course: [350, 200],
                button: [178, 46],
                date: [140, 50],
                datetime: [119, 50],
                weather: [340, 114],
            }
            for (var key in text) {
                var item = text[key];
                var obj = {
                    item: item,
                    type: key,
                    radio: 0,
                    disabled: false, // 是否显示
                    isConflict: false, // 是否冲突
                    lock: false,
                    displayOptions: this[key] || [],
                    styleOption: 1,
                    backgroundRadio: 1,
                    style: _this.deepCopy(_this.style),
                    children: [],
                    scale: 3
                };
                if (key == "button") {
                    obj.componentName = "my-button";
                    obj.function = "jumpPage";
                    obj.router = {
                        type: "custom",
                        menuFlag: "",
                        url: "",
                        openType: "new"
                    }
                }
                for (var bk in border) {
                    _this.$set(obj.style, bk, _this.deepCopy(border[bk]));
                }

                _this.$set(obj, "title", _this.deepCopy(componentTitleStyle));

                obj.style.backgroundOpacity = 100 - (obj.style.backgroundOpacity * 100);
                if (key == "attendance") {
                    _this.$set(obj, "children", _this.deepCopy(_this.attChildren));
                } else {
                    delete obj.children
                }
                if (typeWh[key]) {
                    _this.$set(obj.style, "width", typeWh[key][0]);
                    _this.$set(obj.style, "height", typeWh[key][1]);
                }
                if (key == "line") {
                    obj.componentName = "my-line"
                }
                if (_this.isTextComponent[key]) _this.$set(obj.style, "text", "");
                if (key == "rectangle") _this.$set(obj, "radio", "1");
                _this.leftModule.push(obj);
            }
        },
        /**
         * 根据type找出对应的组件
         * @param {*} type 组件type
         * @returns 
         */
        typeLeftModuleValue: function (type) {
            var arr = this.leftModule.filter(function (item) {
                return item.type == type;
            })
            return arr.length > 0 ? arr[0] : null;
        },
        /**
         * 开始拖拽
         * @param {*} e 
         */
        handleDragStart: function (e) {
            e.dataTransfer.setData('item', e.target.dataset.item);
            e.dataTransfer.setData('index', e.target.dataset.index);
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
            if (!e.dataTransfer.getData("item")) return;
            var item = JSON.parse(e.dataTransfer.getData("item"));
            var leftIndex = e.dataTransfer.getData("index");
            var leftItem = this.leftModule[leftIndex];
            if (leftItem.disabled) return;

            // this.typeLeftModuleValue()
            var canvasSize = this.canvasSize;
            var x = e.offsetX;
            var y = e.offsetY;
            var width = item.style.width;
            var height = item.style.height;
            var maxWidth = canvasSize.width - width;
            var maxHeight = canvasSize.height - height;
            var left = Math.min(x, maxWidth);
            var top = Math.min(y, maxHeight);
            if (item.type == 'video-display' && item.scale != 4) {
                var wh = this.getSizeByContainerRatio(width, height, this.proSize[item.scale]);
                width = wh.width;
                height = wh.height;
            }
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
            this.currDragComponent = item;
            if (item.disabled) return;
            var uuid = this.uuid();
            this.$set(this.currDragComponent, 'id', uuid);
            var com = this.deepCopy(this.currDragComponent)
            this.activeComponent = uuid;
            this.componentData.push(com);
            this.setUpDisable();
            this.UndoSaveDebouncer(this.componentData);
        },
        /**
         * 设置组件是否禁止新增
         */
        setUpDisable: function () {
            var _this = this;
            this.leftModule.forEach(function (el) {
                el.disabled = false;
                _this.componentData.forEach(function (com) {
                    if (_this.repeatComponent.indexOf(el.type) == -1 || el.type == "function-button") {
                        if (el.type == com.type) {
                            el.disabled = true;
                        }
                    }
                });
            });
        },
        /**
         * 设置组件样式
         */
        MoveSetComponentStyle: function (left, top, width, height, item) {
            // console.log(left, top);
            item.style.left = (left <= 0 ? 0 : left);
            item.style.top = (top <= 0 ? 0 : top);
            /**
             * 组件最小宽高
             */
            var w = this.canvasSize.width;
            var h = this.canvasSize.height;
            item.style.width = Math.max(Math.min(width, w), this.comMin.w);
            item.style.height = Math.max(Math.min(height, h), this.comMin.h);
        },
        /**
         * 
         * @param {*} type 保存 => 0 || 另存 => 1
         */
        save: function (type, publish) {
            if (type == 1 && this.showSaveAs && !this.saveAsText) return this.$global.showError($i.t("form[0]"));
            if (!this.globalModulePage.name && type != 1) {
                this.activeComponent = null;
                return this.$global.showError($i.t("form[0]"));
            }
            var newComponentData = this.deepCopy(this.componentData),
                _this = this;
            newComponentData.forEach(function (item) {
                if (item.type == "button") {
                    _this.$set(item, "text", item.style.text);
                }
            });
            this.currGlobalLoading = this.$loading({
                text: "loading...",
                background: "rgba(0, 0, 0, 0.7)",
                customClass: "te-fullscreen--loading",
            });
            var globalModule = this.deepCopy(this.globalModule);
            var moduleStyle = this.moduleStyle;
            globalModule[0].pages[0].elements = newComponentData;
            globalModule[0].style = moduleStyle;


            globalModule[0].pages[0].style.width = moduleStyle.width;
            globalModule[0].pages[0].style.height = moduleStyle.height;

            var radio = this.globalModule[0].radio;
            if (radio == 1) delete globalModule[0].pages[0].style.backgroundImage;

            // 点保存时 如果模板id已经存在 说明不是新建的模板 则使用修改模板的接口 type = 2
            if (this.templateId && type == 0) type = 2;
            this.domToImage(type, globalModule, publish);
        },
        /**
         * 删除组件 并设置禁用
         * @param {*} item 
         */
        deleteComponent: function (item) {
            var _this = this;
            if (!item) return;
            var newComData = this.componentData.filter(function (el) {
                return item.id != el.id;
            })
            this.componentData = newComData;
            this.setUpDisable();
        },






        /**
         * 字体、字号 下拉
         * @param {*} key 当前样式key
         * @returns 符合条件的key才显示
         */
        showFormSelect: function (key) {
            var arr = ["fontFamily", "fontSize"];
            return arr.indexOf(key) != -1;
        },
        /**
         * 对齐、加粗、斜体
         * @param {*} key 当前样式key
         * @returns 符合条件的key才显示
         */
        showFontStyle: function (key) {
            var arr = ["textAlign", "fontStyle", "fontWeight"];
            return arr.indexOf(key) != -1;
        },
        /**
         * 选中字体样式
         * @param {*} style 对齐方式当前item
         * @returns 
         */
        setUpfontStyle: function (style, item) {
            var value = style.value;
            var model = style.model;
            var isNormal = model == "fontStyle" || model == "fontWeight";
            var key = this.currActiveComponent[0].style[model];
            if (item) key = this.currActiveComponent[0].title.style[model];
            if (key == value && isNormal) {
                if (item) return this.$set(this.currActiveComponent[0].title.style, model, "normal");
                return this.currActiveComponent[0].style[model] = "normal";
            }
            if (item) {
                this.currActiveComponent[0].title.style[model] = value;
            } else {
                this.currActiveComponent[0].style[model] = value;
            }
            this.UndoSaveDebouncer(this.componentData);
        },
        /**
         * 设置考勤组件样式
         * @param {*} font 样式key
         * @param {*} item 当前组件
         */
        setUpAttFontStyle: function (font, item) {
            var model = font.model;
            var value = font.value;
            var type = item.type;
            var children = this.currActiveComponent[0].children;
            var key = item.style[model];
            children.forEach(function (el) {
                if (el.type == type) el.style[model] = value;
                if (key == value) el.style[model] = "normal";
            });

        },
        /**
         * 根据type 返回对应的字符 文字 || 数字
         * @param {*} children 考勤子级
         * @returns 
         */
        attLabel: function (children) {
            var type = children.type;
            return type == "text" ? $i.t('list[2]') : $i.t('cctjs1');
        },
        /**
         * 需要显示两端对齐的组件
         * @param {*} value 组件类型
         * @returns 
         */
        showSpaceAround: function (value) {
            var arr = ["attendance", "sensor", "weather"],
                type = this.currActiveComponent[0].type;
            if (value == "space-around") return arr.indexOf(type) != -1;
            return true;
        },
        /**
         * 多选功能 课程信息 - course 传感器 - sensor
         * @param {*} key 为需要渲染的多选组
         * @returns 
         */
        checkboxGroupList: function (key) {
            return this[key] || [];
        },
        /**
         * 
         * @param {*} key 组件类型
         * @returns 是否显示多选
         */
        showCheckboxGroup: function (key) {
            var curr = this.currActiveComponent[0].type;
            return curr == key;
        },
        showRadio: function (key) {
            var curr = this.currActiveComponent[0].type;
            return curr == key;
        },
        switchVideoPro: function (item, index) {
            item.scale = index;
            if (index == 4) return;
            var pro = this.proSize;
            var style = item.style;
            var aspectRatio = pro[index];

            var proStyle = this.getSizeByContainerRatio(style.width, style.height, aspectRatio);
            var minStyle = this.getSizeByContainerRatio(this.comMin.w, this.comMin.h, aspectRatio);

            var canvasSize = this.canvasSize;


            style.width = Math.max(proStyle.width, minStyle.width);
            style.height = Math.max(proStyle.height, minStyle.height);

            var maxLeft = canvasSize.width - style.width;
            var maxTop = canvasSize.height - style.height;
            var left = Math.min(style.left, maxLeft);
            var top = Math.min(style.top, maxTop);
            style.left = left;
            style.top = top;


        },
        /**
         * 根据容器大小获取等比例盒子宽高
         * @param {*} width 组件宽
         * @param {*} height 组件高
         * @param {*} aspectRatio 当前选中比例
         * @returns 
         */
        getSizeByContainerRatio: function (width, height, aspectRatio) {
            if (width < 0 || height < 0) {
                return {
                    width: 0,
                    height: 0
                }
            }
            //容器宽高比
            var containerRatio = width * 1.0 / height;
            // 设置的比例 大于 组件比例
            if (aspectRatio > containerRatio) {
                height = parseInt(width / aspectRatio);

            } else if (aspectRatio < containerRatio) {
                width = parseInt(height * aspectRatio);
            }
            return {
                width: width,
                height: height
            }
        },



        // 选中当前图片
        activeImg: function (index) {
            this.bgActiveIndex = this.bgImgList[index].id;
        },
        /**
         * 
         * @param {*} url 背景图url
         * @returns 根据有url的链接 返回没用url的链接显示在上传背景的位置
         */
        minBgImg: function (url) {
            if (url !== undefined) {
                var regBackgroundUrl = /url\("?'?.*"?'?\)/g;
                var regReplace = /"|'|url|\(|\)/g;
                var matchs = url.match(regBackgroundUrl);
                // console.log(matchs);
                if (matchs == null || matchs.length <= 0) {
                    return url;
                }
                return matchs[0].replace(regReplace, '')
            }
        },
        /**
         * 删除对应的背景图片
         * @param {*} type 当前点击的是矩形还是画布 删除
         * @param {*} e event
         */
        deleteActiveImg: function (type, e) {
            e.stopPropagation();
            if (type == "rectangle") this.$set(this.currActiveComponent[0].style, "backgroundImage", "");
            this.$set(this.pagesStyle, "backgroundImage", "");
        },
        // 删除图片列表
        clickImgDelete: function (item) {
            var id = item.id,
                url = '/api/background/',
                _this = this;
            this.$http.delete(url + id).then(function (res) {
                    _this.getBgImg();
                    _this.$global.showSuccess($i.t('toast[2]'));
                })
                .catch(function (err) {

                })
        },
        // 显示选择图片弹框
        uploadShowBgDialog: function (type) {
            this.bgType = type || null;
            this.showBgDialog = true;
            this.getBgImg();
        },
        // 背景
        changeBgImg: function (response, file, fileList) {
            // console.log(response, file, fileList);
            this.imgLoading.close();
            this.bgImgList.unshift(response.data)
        },
        // 背景上传时
        uploadBgProgress: function (event, file, fileList) {
            this.imgLoading = this.$loading({
                text: "loading...",
                background: "rgba(0, 0, 0, 0.7)",
                customClass: "te-fullscreen--loading",
            })
        },
        // 上传失败
        uploadBgError: function () {
            this.imgLoading.close();
        },
        /**
         * 切换页码
         * @param {*} value 当前点击的页码
         */
        changeBgPage: function (value) {
            this.bgPage.pageNum = value;
            this.getBgImg();
        },
        // 确认使用选中的图片
        confirmSelectBg: function () {
            this.showBgDialog = false;
            var activeBgImg = this.activeBgImg;
            if (!activeBgImg) return;
            var url = "url(" + this.$global.fullServerUrl(activeBgImg.url) + ")";
            if (this.bgType == "rectangle") return this.$set(this.currActiveComponent[0].style, "backgroundImage", url);

            this.$set(this.pagesStyle, "backgroundImage", url);
            this.UndoSaveDebouncer(this.componentData);
        },
        changeColor: function (value, item, key) {
            var color = "#fff";
            if (key == "color") color = "#999999";
            if (key == "backgroundColor" || key == "start" || key == "end") color = "#fff";
            if (!value) item[key] = color;
            if (key == "start" || key == "end") return this.gradientBgColor(value, key);
            this.UndoSaveDebouncer(this.componentData);
        },
        /**
         * 限制边框大小
         * @param {*} value 选中的值
         * @param {*} item 当前组件
         */
        changeBorderWidth: function (value, item) {
            var wh = {};
            for (var key in this.componentWHLT(item)) {
                wh[key] = Number(this.componentWHLT(item)[key].replace("px", ""));
            }

            var maxBorderWidth = (Math.min(wh.width, wh.height)) / 2;
            var newValue = Math.round(Math.min(maxBorderWidth, value));

            if (item.type == "line") {
				if ((wh.width * 1) >= (wh.height * 1)) {
					newValue = Math.round(Math.min(wh.height, value));
				} else {
					newValue = Math.round(Math.min(wh.width, value));
				}
			}

            this.$set(item.style, "borderWidth", newValue);
            this.UndoSaveDebouncer(this.componentData)
        },
        changeBorderStyle: function (val, data) {
			var style = data.style;
			for (var key in style) {
				if (key.indexOf("border") != -1 && key.indexOf("Style") != -1) style[key] = val;
			}
            this.UndoSaveDebouncer(this.componentData)
		},
        /**
         * 
         * @param {*} item 当前选中的组件
         * @param {*} key 要修改的样式key 'radio'
         * @param {*} radio 当前点击的
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
         */
        setRadiusSize: function (item, key, value, inp) {
            var _this = this;
            if (inp) {
                _this.setButtonBorderRadius(item, key, value, inp);
                return;
            }
            this.mousedownTimer && this.moveStop();
            this.mousedownTimer = setInterval(function () {
                _this.setButtonBorderRadius(item, key, value, inp);
            }, 80)

        },
        moveStop: function () {
            clearInterval(this.mousedownTimer)
        },
        setButtonBorderRadius: function (item, key, value, inp) {
            var _this = this;
            var borderRadius = _this.currActiveComponent[0].style.borderRadius;
            var num = 0;

            if (!item) { // 一个控制四个
                num = inp ? value : Number(_this[key]) + value;
                _this[key] = num <= 0 ? 0 : num;
                for (var k in borderRadius) {
                    _this.$set(borderRadius, k, _this[key]);
                }
            } else { // 四个单独控制
                num = inp ? value : Number(item[key]) + value;
                _this.$set(item, key, num <= 0 ? 0 : num);
            }
            // if (inp) _this.moveStop();
        },



        /**
         * 
         * @param {*} ispx 是否添加px
         * @returns 返回根据真实宽高 转换后的画布宽高
         */
        canvasTransForm: function (ispx) {
            var content = document.querySelector('.components-border').getBoundingClientRect();
            var recWidth = content.width;
            var recHeight = content.height;
            var moduleStyle = this.moduleStyle;
            var width, height;

            height = moduleStyle.height * recWidth / moduleStyle.width;
            width = (moduleStyle.width / moduleStyle.height) * height;

            if (height > recHeight) {
                width = recHeight / moduleStyle.height * moduleStyle.width;
                height = recHeight;
            } else if (moduleStyle.width == moduleStyle.height) {
                height = recHeight;
            }

            if (ispx) {
                return {
                    width: width + "px",
                    height: height + "px",
                }
            }
            return {
                width: width,
                height: height,
            }
        },
        /**
         * 
         * @param {*} size 默认字体大小
         * @returns 返回transform的值
         */
        transForm: function (size) {
            var minStyle = this.minStyle;
            var fontSize = size / minStyle;
            return style = {
                transform: 'scale(' + (fontSize / size).toFixed(3) + ')'
            }
        },
        /**
         * 
         * @param {*} item 当前组件
         * @returns 返回真实大小的宽高数据
         */
        componentWHLT: function (item) {
            var minStyle = this.minStyle;
            var result = {};
            ['width', 'height'].forEach(function (attr) {
                if (attr) {
                    var borderWidth = item.style.borderWidth;
                    if (item.type != "line") borderWidth / 2;
                    result[attr] = (item.style[attr] - borderWidth) * minStyle + 'px'
                }
            })
            return result
        },
        // 清空画布数据
        clearComponentData: function () {
            var _this = this;
            this.$yconfirm(this.dialog).then(function () {
                _this.componentData = [];
                _this.setUpDisable();
                _this.UndoSaveDebouncer(_this.componentData);
            }).catch(function () {

            })
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
        // 撤销
        clickUndo: function () {
            var snapshotData = JSON.parse(this.snapshotData.toString());

            if ((snapshotData.length <= 1)) return;
            this.snapshotData.pop();
            var data = this.snapshotData.top();

            this.componentData = this.deepCopy(data);

            this.$nextTick(this.setUpDisable());
        },
        // 保存快照
        saveCurrentCanvas: function () {
            this.snapshotData.push(this.deepCopy(this.componentData));
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









        changePrevious: function () {
            window.history.go(-1);
        },
        handlePlaceCheck: function (data, node) {
            this.placeId = node.checkedKeys
        },
        changeNextStep: function () {
            var _this = this;
            if (!this.globalModulePage.name) return this.$global.showError($i.t("form[0]"));
            if (this.isSame()) {
                _this.showPublish = true;
                return;
            }
            var type = 0;
            if (this.templateId && type == 0) type = 2;

            this.$yconfirm({
                message: $i.t('ccjs19'),
                confirmText: $i.t('confirm'),
                visible: false,
                withCancel: false,
                cancelText: $i.t('cancel')
            }).then(function () {
                _this.save(type, true);
            }).catch(function () {
                _this.showPublish = false;
            })
        },
        confirmPublish: function () {
            // /screenManager/api/control-template/template/places
            // if (!this.placeId.length) return this.$global.showError($i.t("tipsText[3]"));
            var ids = this.placeId.join(","),
                _this = this,
                url = "/api/control-template/template/places";
            var data = {
                templateId: this.templateId,
                placeIds: ids
            }
            var config = null;

            this.$http.put(url, data, config).then(function () {
                _this.$global.showSuccess($i.t("ccjs18"));
                _this.showPublish = false;
            }).catch(function () {})
        },
        // 另存
        saveAs: function () {
            this.saveAsText = this.globalModulePage.name;
            this.showSaveAs = true;
        },
        /**
         * 
         * @param {*} type 保存 => 0 || 另存 => 1 || 修改 => 2
         */
        domToImage: function (type, content, publish) {
            var node = this.$refs.domtoimage;
            var _this = this;
            var formData = new FormData();
            var oldComponentObj = {};
            var isUpdate = false;

            if (type == 2) {
                if (this.conflict()) {
                    this.currGlobalLoading.close();
                    return this.$global.showError($i.t("cctjs7"));
                }

                this.oldComponentData.forEach(function (item) {
                    oldComponentObj[item.id] = JSON.parse(JSON.stringify(item));
                });
    
                this.componentData.forEach(function (item) {
                    var oldItem = oldComponentObj[item.id];
                    if (item.type == "button" && oldItem) {
                        var filterItem = {
                            function: item.function,
                            router: Object.assign(item.router),
                            text: item.text
                        }
                        var filterOldItem = {
                            function: oldItem.function,
                            router: Object.assign(oldItem.router),
                            text: oldItem.text
                        }
                        isUpdate = JSON.stringify(filterItem) != JSON.stringify(filterOldItem);
                    }
                });

                if (this.isSame()) {
                    this.currGlobalLoading.close();
                    return this.$global.showSuccess($i.t("toast[8]"));
                }
            }


            if (isUpdate) {
                this.currGlobalLoading.close();

                this.$yconfirm({
                    message: $i.t('ccjs69'),
                    confirmText: $i.t('confirm'),
                    visible: false,
                    withCancel: false,
                    cancelText: $i.t('cancel')
                }).then(function () {
                    _this.createDomtoimage(node, formData, type, content, publish);
                }).catch(function () {
                    
                })
                return;
            }
            this.createDomtoimage(node, formData, type, content, publish);
            
        },
        createDomtoimage: function (node, formData, type, content, publish) {
            var _this = this;
            var methods = {
                0: "addTemplate",
                1: "saveAsTemplate",
                2: "updateTemplate"
            }
            this.$nextTick(function () {
                domtoimage.toPng(node)
                    .then(function (dataUrl) {

                        var blob = _this.dataURLtoBlob(dataUrl);
                        formData.append("file", blob, _this.globalModule[0].pages[0].name + '.png');
                        _this[methods[type]](formData, content, publish);
                    })
                    .catch(function (error) {
                        // 以防模板出现找不到的图片 直接调用后端请求 不生成预览图
                        formData = new FormData();
                        console.log(methods[type]);
                        _this[methods[type]](formData, content, publish);
                    });
            })
        },
        dataURLtoBlob: function (dataUrl) {
            var arr = dataUrl.split(',')
            var mime = arr[0].match(/:(.*?);/)[1]
            var bstr = atob(arr[1])
            var n = bstr.length
            var u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {
                type: mime
            });
        },








        /**
         * 设置组件在真实画布的大小
         * @param {*} style 组件样式
         * @returns 
         */
        updateRealWHLT: function (style) {
            if (style == null) {
                return;
            }

            for (var key in this.maxComponentStyle) {
                var value = style[key];
                value = value || 0;
                var real = Math.round(this.transToRealDataFromCanvas(value, key));
                this.$set(this.maxComponentStyle, key, real);
            }
        },
        /**
         * 设置组件样式
         * @param {*} key 当前输入的样式key
         * @param {*} value 当前输入的值
         */
        componentStyleWHXY: function (key, value) {
            var style = this.currActiveComponent[0].style;
            var moduleStyle = this.moduleStyle;

            var maxLeft = this.transToRealDataFromCanvas(style.left); // 真实数据
            var maxTop = this.transToRealDataFromCanvas(style.top); // 真实数据
            var maxWidth = this.transToRealDataFromCanvas(style.width); // 真实数据
            var maxHeight = this.transToRealDataFromCanvas(style.height); // 真实数据

            var mW = this.transToRealDataFromCanvas(this.comMin.w);
            var mH = this.transToRealDataFromCanvas(this.comMin.h);

            value = parseInt(value);

            var left = maxLeft,
                width = maxWidth,
                height = maxHeight,
                top = maxTop;

            if (key == "width") {
                if (value > moduleStyle.width) value = moduleStyle.width;
                var overW = moduleStyle.width - (maxLeft + value);
                if (overW < 0) left = maxLeft + overW;
                if (value < mW) {
                    value = mW;
                    this.$global.showError($i.t('maxWidth', {
                        num: value
                    }));
                }
                width = value;
            }
            if (key == "height") {
                if (value < mH) {
                    value = mH;
                    this.$global.showError($i.t('maxHeight', {
                        num: value
                    }));
                }
                if (value > moduleStyle.height) value = moduleStyle.height;
                var overH = moduleStyle.height - (maxTop + value);
                if (overH < 0) top = maxTop + overH;
                height = value;
            }

            if (key == "left") {
                if (value > moduleStyle.width - maxWidth) value = moduleStyle.width - maxWidth;
                left = value;
            }

            if (key == "top") {
                if (value > moduleStyle.height - maxHeight - 1) value = moduleStyle.height - maxHeight - 1;
                top = value
            }

            this.maxComponentStyle[key] = value;

            var minLeft = this.transToCanvasDataFromReal(left); // 真实数据
            var minTop = this.transToCanvasDataFromReal(top); // 真实数据
            var minWidth = this.transToCanvasDataFromReal(width); // 真实数据
            var minHeight = this.transToCanvasDataFromReal(height); // 真实数据

            this.MoveSetComponentStyle(minLeft, minTop, minWidth, minHeight, this.currActiveComponent[0]);
            this.UndoSaveDebouncer(this.componentData);
        },
        /**
         * 设置组件已拖拽列表滚动条在可视区域
         */
        setRightScrollTop: function () {
            var rightList = this.$refs.rightList || [];
            var rightScroll = this.$refs.rightScroll.wrap;
            this.$nextTick(function () {
                rightList.forEach(function (item) {
                    var index = item.className.indexOf("custom-success-bgcolor");
                    if (index != -1) rightScroll.scrollTop = item.offsetTop;
                });
            });
        },












        /**
         * 
         * @returns 组件是否冲突
         */
        conflict: function () {
            var _this = this;
            var components = this.componentData;
            var arr = [];
            if (components.length <= 1) return false;
            var repeatComponent = this.repeatComponent;
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
                    if (repeatComponent.indexOf(components[j].type) == -1 && repeatComponent.indexOf(components[i].type) == -1) {
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
        isOverlap: function (idOne, idTwo) {
            for (var key in idOne) {
                idOne[key] = Number(idOne[key]);
            }
            for (var key in idTwo) {
                idTwo[key] = Number(idTwo[key]);
            }
            var topOne = idOne.top,

                topTwo = idTwo.top,

                leftOne = idOne.left,

                leftTwo = idTwo.left,

                widthOne = idOne.width,

                widthTwo = idTwo.width,

                heightOne = idOne.height,

                heightTwo = idTwo.height;
            return topOne + heightOne > topTwo && topTwo + heightTwo > topOne &&
                leftOne + widthOne > leftTwo && leftTwo + widthTwo > leftOne;
        },
        uuid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        deepCopy: function (target) {
            if (typeof target == "object") {
                var result = Array.isArray(target) ? [] : {};
                for (var key in target) {
                    if (typeof target[key] == "object") {
                        result[key] = this.deepCopy(target[key]);
                    } else {
                        result[key] = target[key];
                    }
                }
                return result;
            }
            return target;
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
         * 将画布的数据转成真实的数据
         * @param {*} data 宽高等数据
         * @returns 返回转换后的数据
         */
        transToRealDataFromCanvas: function (data) {
            var minStyle = this.minStyle;
            return Math.round(data * minStyle);
        },
        /**
         * 将真实的数据转成画布的数据
         * @param {*} data 宽高等数据
         * @returns 返回转换后的数据
         */
        transToCanvasDataFromReal: function (data) {
            var minStyle = this.minStyle;
            return Math.round(data / minStyle);
        },
        // 判断两个数组的数据是否相同
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





        // http
        getBgImg: function (config) {
            var loading = this.$loading({
                text: "loading...",
                background: "rgba(0, 0, 0, 0.7)",
                customClass: "te-fullscreen--loading",
            });
            var url = '/api/background/page/layouts';
            var data = this.bgPage,
                _this = this;
            this.$http.get(url, data).then(function (res) {
                    loading.close();
                    if (res.code !== 200) return;
                    _this.bgImgList = res.data.data;
                })
                .catch(function (err) {
                    loading.close();
                })

        },
        /**
         * 获取地点数据
         */
        getPlaceData: function () {
            var data = {
                permission: "controlTemplate"
            };
            var _this = this;
            this.$http.get("/api/v2/index/places/0/permission", data).then(function (res) {
                var placeData = _this.$global.jsonTree(res.data, {});
                _this.placeData = placeData;
            })
        },
        getAssignedPlace: function () {
            var data = {
                templateId: this.templateId
            }
            this.placeId = [];
            var _this = this;
            this.$http.get("/api/control-template/template/places", data).then(function (res) {
                res.data.forEach(function (item) {
                    if (_this.placeId.indexOf(item.id) == -1) _this.placeId.push(item.placeId);
                });
            })
        },
        /**
         * 获取通配模板
         */
        getTemplate: function () {
            var config = null,
                _this = this,
                url = "api/control-template/template/byId/" + this.templateId;
            this.globalModule = this.globalModule;
            this.$http.get(url, null, config).then(function (res) {
                _this.globalModule = (res.data && res.data.content) ? JSON.parse(res.data.content) : _this.globalModule;

                var componentData = _this.deepCopy(_this.globalModule[0].pages[0].elements);
                _this.setBackgroundImage();
                // _this.componentData.forEach(function (item) {
                //     _this.styleKey.forEach(function (element) {
                //         var value = _this.transToCanvasDataFromReal(item.style[element]);
                //         item.style[element] = Number(value);
                //     });
                // });
                var border = _this.deepCopy(_this.border);
                componentData.forEach(function (item) {
                    var bg = item.style.backgroundImage;
                    if (!bg) {
                        _this.$set(item.style, "backgroundImage", "");
                        var bgColor = item.style.backgroundColor;
                        _this.$set(_this.componentBuackgroundImageData, item.type, {start: bgColor, end: bgColor})
                    } else {
                        if (item.style.backgroundImage.indexOf("linear-gradient") != -1) {
                            var newBg = item.style.backgroundImage;
                            var bgArr = newBg.replace(")", "").split(/,\s*/);
                            _this.$set(_this.componentBuackgroundImageData, item.type, {start: bgArr[1], end: bgArr[2]})
                        }
                    }
                    if (item.type == 'video-display' && item.scale == undefined) item.scale = 3;

                    if (!item.style.borderColor) {
                        for (var bk in border) {
                            _this.$set(item.style, bk, _this.deepCopy(border[bk]));
                        }
                    }

                    if (!item.title) {
                        var styleOption = item.styleOption;
                        _this.$set(item, "title", _this.deepCopy(_this.componentTitleStyle));
                        _this.$set(item.title, "show", false);
						if (isIncludeStyleOption(showTitleComponent, item.type, styleOption)) {
							_this.$set(item.title, "show", true);
							_this.$set(item.title, "text", $i.t("componentTitleText")[item.type]);
						}
                    }

                    if (item.type == "function-button" && typeof item.displayOptions == "string") {
                        item.radio = item.displayOptions;
                        item.displayOptions = [];
                    }
                    if (_this.isTextComponent[item.type]) {
                        if (item.text || item.text == 0) _this.$set(item.style, "text", item.text);
                    }
                });
                _this.globalModule[0].pages[0].name = res.data.name;
                _this.oldGlobalModule = _this.deepCopy(_this.globalModule);

                _this.getAssignedPlace();
                _this.componentData = _this.deepCopy(componentData);
                _this.setUpDisable();
                _this.oldComponentData = _this.deepCopy(_this.componentData);
                _this.UndoSaveDebouncer(_this.deepCopy(componentData));
                console.log(_this.componentData);
            }).catch(function (err) {
                console.log(err);
            })
        },
        /**
         * 
         * @returns 模板是否修改
         */
        isSame: function () {
            var componentData = [],
                oldComponentData = [],
                _this = this;
            this.componentData.forEach(function (item) {
                var obj = {};
                for (var key in item) {
                    if (key != "customStyle") obj[key] = _this.deepCopy(item[key]);
                }
                componentData.push(obj);
            });
            this.oldComponentData.forEach(function (item) {
                var obj = {};
                for (var key in item) {
                    if (key != "customStyle") obj[key] = _this.deepCopy(item[key]);
                }
                oldComponentData.push(obj);
            });
            var global = this.arrayEquals(this.globalModule, this.oldGlobalModule);
            var element = this.arrayEquals(oldComponentData, componentData);
            return global && element;
        },
        /**
         * 修改模板
         * @param {*} result 文件
         * @returns 
         */
        updateTemplate: function (result, globalModule, publish) {
            // /screenManager/api/control-template/template/update
            var content = JSON.stringify(globalModule),
                _this = this;


            var data = {
                id: this.templateId,
                name: this.globalModulePage.name,
                content: content
            }
            var config = {
                loading: false,
                contentType: false,
                processData: false
            }
            for (var key in data) {
                result.append([key], data[key]);
            }
            this.$http.post("/api/control-template/template/update", result, config).then(function () {
                _this.$global.showSuccess($i.t("toast[8]"));
                _this.oldGlobalModule = _this.deepCopy(_this.globalModule);
                _this.oldComponentData = _this.deepCopy(_this.componentData);
                _this.$nextTick(function () {
                    if (publish) _this.showPublish = true;
                })
                _this.currGlobalLoading.close();
            }).catch(function () {
                _this.currGlobalLoading.close();
            })
        },
        /**
         * 另存模板
         */
        saveAsTemplate: function () {
            // /screenManager/api/control-template/template/saveAs
            var _this = this;

            var data = {
                originalId: this.templateId,
                name: this.saveAsText,
            }

            var config = {
                loading: false
            }
            this.$http.post("/api/control-template/template/saveAs", data, config).then(function (res) {
                _this.$global.showSuccess($i.t("toast[7]"));
                _this.showSaveAs = false;
                _this.templateId = res.data.id;
                _this.getTemplate();
                _this.oldGlobalModule = _this.deepCopy(_this.globalModule);
                _this.oldComponentData = _this.deepCopy(_this.componentData);
                _this.currGlobalLoading.close();
            }).catch(function (err) {
                _this.currGlobalLoading.close();
            })
        },
        /**
         * 新增模板
         * @param {*} result 
         */
        addTemplate: function (result, globalModule, publish) {
            var content = JSON.stringify(globalModule);
            console.log(content);
            // /screenManager/api/control-template/template/add
            var url = "/api/control-template/template/add",
                _this = this;
            var data = {
                name: this.globalModulePage.name,
                content: content
            }
            var config = {
                loading: false,
                contentType: false,
                processData: false
            }
            for (var key in data) {
                result.append(key, data[key]);
            }
            this.$http.post(url, result, config).then(function (res) {
                _this.$global.showSuccess($i.t("toast[8]"));
                _this.templateId = res.data.id;
                _this.oldGlobalModule = _this.deepCopy(_this.globalModule);
                _this.oldComponentData = _this.deepCopy(_this.componentData);
                _this.$nextTick(function () {
                    if (publish) _this.showPublish = true;
                })
                _this.currGlobalLoading.close();
            }).catch(function (err) {
                _this.currGlobalLoading.close();
                console.log(err);
            })
        },




        /******************************* 导出 *******************************/
        exportTemplate: function () {
            if(this.$global.isNull(this.templateId)) {
                this.$global.showError("当前为空模板，无法导出");
                return;
            }
            var url = this.$global.fullServerUrl("/api/control-template/" + this.templateId + "/export");
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
					var content = ajax.getResponseHeader("Content-Disposition");
					var filename = content && content.split(';')[1].split('filename=')[1];
					filename = decodeURI(filename);
					_this.handleDownloadResponse(this.response, filename, "application/zip");
					return;
				}

				//非正常状态
				_this.$global.showError($i.t('exportErr'));
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





        setBackgroundImage: function () {
            var _this = this;
            this.leftModule.forEach(function (item) {
                var newBg = item.style.backgroundImage;
                var bgArr = newBg.replace(")", "").split(/,\s*/);
                _this.$set(_this.componentBuackgroundImageData, item.type, {start: bgArr[1] || "#fff", end: bgArr[2] || "#fff"});
            });
        },
        gradientBgColor: function (val, key) {
            var item = this.currActiveComponent[0],
                colors = this.componentBuackgroundImageData[item.type],
                opacity = (100 - item.style.backgroundOpacity) / 100,
                start = this.colorRgb(colors.start, opacity),
                end = this.colorRgb(colors.end, opacity),
                bg = "linear-gradient(0deg, " + end + ", " + start + ")";
            this.$set(item.style, "backgroundImage", bg)
        },
        dynamicSize: function (item, size, defaulWidth, defaultHeight, key) {
            var minStyle = this.minStyle;
            var width = item.style.width;
            var height = item.style.height;
            var style;
            size = size || 20;
            key = key || "fontSize";
            defaulWidth = defaulWidth || 350;
            defaultHeight = defaultHeight || 200;
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
         * 获取后台菜单列表
         */
        _getbackstagePageDataList: function () {
			var url = "/api/control-template/menus/backstage",
                _this = this;
            this.$http.get(url).then(function (res) {
                var list = _this.$global.jsonTree(res.data, {id: "flag", pid: "parent"});
                _this.backstagePageData = list;
            })
		},

    },
    watch: {
        currActiveComponent: {
            deep: true,
            handler: function (val, old) {
                // console.log(val);
                this.setRightScrollTop();
                if (val[0] != null) {
                    this.updateRealWHLT(val[0].style);
                }
            }
        },
        activeComponentRadio: function (val) {
            if (val === 1) this.setGlobalBorderRadius();
        },
        buttonStyleOption: function (val, old) {
            if (!val || !old) return;
            var newBg = val.style.backgroundImage;
            var bgArr = newBg.replace(")", "").split(/,\s*/);
            if (val.style.backgroundImage != old.style.backgroundImage) {
                this.$set(this.currActiveComponent[0], "backgroundRadio", 2);
                this.$set(this.componentBuackgroundImageData, val.type, {start: bgArr[1], end: bgArr[2]});
            }
        }
    },
    filters: {

    }
})