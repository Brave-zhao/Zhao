
/**
 * 特殊模板组件
 * 不可移动但是要修改数据
 * 按钮
 * 空调
 * 摄像头
 */
var specialComponent = {
	"button": "showButtonDialog",
	// "recognition": "showAirConditioningDialog",
	// "aircondition": "showCameraDialog"
};

var showTitleComponent = {
    "video-display": 2,
    "remote-assistance": 2,
    "course-table": 2,
    "camera-control": 1,
    "control": 2,
}

var showBgComponent = {
    attendance: 7,
    "video-display": 2,
    "remote-assistance": 2,
    "course-table": "2,3",
    "camera-control": 1,
    "air-conditioning-control": 1,
    "control": 2,
    room: 2,
    electric: 2,
    button: 2
}

var paddingNum = {
    "course-table": 38,
    "video-display": 20,
    "remote-assistance": 20,
}

/**
 * 是否开启Ip对讲功能
 */
var openIpIntercom = true;

var isIncludeStyleOption = function (obj, type, option) {
    var values = (obj[type] + "").split(",");

    return values.indexOf(option + "") != -1;
}

Vue.component("drag-drop-group", {
    provide: function () {
        return {
            drop: this
        }
    },
    inject: ["central"],
    props: {
        canvasRef: String,
        item: Object,
        index: Number,
        active: String,
        transForm: Function,
        componentWHLT: Function,
        isLock: Boolean,
        isConflictIds: Array,
        outerData: Array,
        minStyle: Function,
        selectMultiple: Boolean,
        dynamicSize: Function,
        isButton: {
            type: Boolean,
            default: false
        },
        width: {
            type: Number,
            default: 1000
        },
        height: {
            type: Number,
            default: 562
        },
        /**
         * 要渲染的数据组
         */
        data: Array,
        /**
         * 是否限制拖拽区域 默认true
         */
        restrictedArea: {
            type: Boolean,
            default: true
        },
        /**
         * 父级样式属性
         */
        rectInfo: Object,
        /**
         * 组件最小宽高 默认为都0
         */
        comMin: {
            type: Object,
            default: function () {
                return {
                    w: 0,
                    h: 0
                }
            }
        },
        comTypeMin: {
            type: Object,
            default: function () {
                return {}
            }
        },
        /**
         * 移动吸附
         */
        showMouseLine: {
            type: Boolean,
            default: true
        },
        diff: {
            type: Number,
            default: 3
        },
        /**
         * 缩放吸附
         */
        showZoomLine: {
            type: Boolean,
            default: true
        },
        allIsLock: {
            type: Boolean,
            default: false
        },
        nameKey: {
            type: String,
            default: "type"
        },
    },
    data: function () {
        return {
            lineStatus: { // 吸附线是否显示
                xt: false,
                xc: false,
                xb: false,
                yl: false,
                yc: false,
                yr: false
            },
            lines: ['xt', 'xc', 'xb', 'yl', 'yc', 'yr'], // 分别对应三条横线和三条竖线
            activeComponent: null,
            componentData: [],
            oldComponentData: [],

            // 滑动区域样式
            regionStyle: {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            },
            checkedComponentIds: [], // 选中的组件id列表
            checkedComponentList: [], // 选中的组件列表
            pointList: [{
                    point: 'lt',
                    cursor: 'nw'
                },
                {
                    point: 'rt',
                    cursor: 'ne'
                },
                {
                    point: 'rb',
                    cursor: 'se'
                },
                {
                    point: 'lb',
                    cursor: 'sw'
                }
            ],
            showCheckedPoint: true,
            border: ["t", "r", "b", "l"]
        }
    },
    mounted: function () {
        this.componentData = this.data;
        this.oldComponentData = this.deepCopy(this.data);
        this.activeComponent = this.active;
        this.addEventListenerKeyCode();
    },
    methods: {
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
        addEventListenerKeyCode: function () {
            var _this = this;
            document.onkeydown = function (e) {
                var rectInfo = _this.$refs[_this.canvasRef || "com-canvas"].getBoundingClientRect();
                var parent = {
                    W: rectInfo.width,
                    H: rectInfo.height,
                    X: rectInfo.left,
                    Y: rectInfo.top
                }
                var key = window.event.key;
                if (!_this.notFunctionKeys(e)) return; // 是否为 非组合键
                var targetNames = {"INPUT": true, "TEXTAREA": true};
                if (targetNames[e.path[0].tagName]) return;

                if (key == "ArrowLeft" || key == "ArrowUp" || key == "ArrowRight" || key == "ArrowDown") {
                    if (e && e.preventDefault) {
                        e.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }
                } else {
                    return;
                }
                var isChecked = _this.isChecked();
                if (!isChecked && !_this.currComponent) return;
                var item = isChecked ? _this.computedMaxOrMinValue : _this.currComponent.style;

                var left = item.left,
                    top = item.top,
                    width = item.width,
                    height = item.height;

                switch (key) {
                    case "ArrowLeft":
                        left -= 1;
                        break;
                    case "ArrowUp":
                        top -= 1;
                        break;
                    case "ArrowRight":
                        left += 1;
                        break;
                    case "ArrowDown":
                        top += 1;
                        break;
                }
                var left = Math.max(Math.min(left, parent.W - width), 0);
                var top = Math.max(Math.min(top, parent.H - height), 0);

                // var ctrlKey = platform ? e.metaKey : e.ctrlKey;
                // if (!ctrlKey) return;

                if (isChecked) {
                    _this.data.forEach(function (daItem) {
                        var diffLeft = left + (daItem.style.left - item.left);
                        var diffTop = top + (daItem.style.top - item.top);
                        var index = _this.checkedComponentIds.indexOf(daItem.id);
                        if (index != -1) {
                            _this.moveSetCheckedStyle(daItem, diffLeft, diffTop, daItem.style.width, daItem.style.height);
                        }
                    })
                } else {
                    _this.MoveSetComponentStyle(left, top, width, height, _this.currComponent);
                }
            }


        },
        notFunctionKeys: function (e) {
            var eventKeys = {
                altKey: false,
                ctrlKey: false,
                metaKey: false,
                shiftKey: false
            }
            for (var key in eventKeys) {
                if (e[key]) return false;
            }
            return true;
        },
        mouseCheckedPoint: function (event, point) {
            var item = this.computedMaxOrMinValue,
                e = event || window.event;
            this.mouseDownOnPoint(e, point, null, item);
        },
        // 鼠标缩放圈按下
        mouseDownOnPoint: function (event, point, index, item, el) {
            if (specialComponent[item.propertyFlag]) return;
            if (this.isLock || this.allIsLock) return;
            var id = item.id;
            var ids = this.checkedComponentIds;
            if (ids.length <= 1 && ids[0] != id) {
                this.activeComponent = id;
                this.setChecked();
            }

            var e = this.eventDefault(event);
            var _this = this;
            // 画布位置信息
            var rectInfo = this.$refs[this.canvasRef || "com-canvas"].getBoundingClientRect();
            var parent = {
                W: rectInfo.width,
                H: rectInfo.height,
                X: rectInfo.left,
                Y: rectInfo.top
            }

            // var parent = this.parentPlace;
            // 组件样式
            var componentStyle = this.deepCopy(item.style);

            var list = this.checkedComponentIds;
            var data = this.data.filter(function (da) {
                return list.indexOf(da.id) != -1
            })
            data = this.deepCopy(data);
            if (list.length > 1) {
                componentStyle = this.deepCopy(this.computedMaxOrMinValue);
                item = this.computedMaxOrMinValue;
            }

            var move = null;
            move = function (moveEvent) {
                _this.mouseMoveOnPoint(moveEvent, parent, componentStyle, point, item, el, data);
            }
            var up = function (e) {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                _this.hideLine();
                _this.saveComponent();
            }
            var leave = function () {
                document.removeEventListener("mouseleave", leave);
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mouseleave', leave);
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        },
        /**
         * 保存组件快照
         */
        saveComponent: function () {
            var com = JSON.stringify(this.componentData);
            var old = JSON.stringify(this.oldComponentData);
            if (com != old && this.$parent.UndoSaveDebouncer) {
                this.$parent.UndoSaveDebouncer(JSON.stringify(this.componentData), JSON.stringify(this.oldComponentData));
                this.oldComponentData = this.deepCopy(this.componentData);
            }
        },
        /**
         * 缩放组件
         * @param {*} event 移动event
         * @param {*} parent 画布位置信息
         * @param {*} componentStyle 组件在拖拽前的位置
         * @param {*} point 当前鼠标点的缩放位置
         * @param {*} el 外层类型
         * @param {*} data 点击时多选的数据
         */
        mouseMoveOnPoint: function (event, parent, componentStyle, point, item, el, data) {
            var e = this.eventDefault(event);
            var hasT = /t/.test(point);
            var hasB = /b/.test(point);
            var hasL = /l/.test(point);
            var hasR = /r/.test(point);
            /**
             * 移动时组件与画布距离
             * 鼠标移动与点击缩放时的差值
             */
            var moveX = e.clientX - parent.X,
                moveY = e.clientY - parent.Y;

            // var minX = this.restrictedArea ? 0 : moveX;
            // var minY = this.restrictedArea ? 0 : moveY;
            var minLeft = 0,
                minTop = 0;
            var minX = this.restrictedArea ? minLeft : moveX;
            var minY = this.restrictedArea ? minTop : moveY;

            /**
             * 组件边距 - 移动的位置相对组件原来的位置 得到每次组件需要移动的值
             */
            var X = componentStyle.left - (Math.max(moveX, minX));
            var Y = componentStyle.top - (Math.max(moveY, minY));

            // 组件右边
            var comR = componentStyle.left + componentStyle.width;
            var comB = componentStyle.top + componentStyle.height;
            // 移动时相对组件右边的距离 只针对当前是在右边或下边缩放
            var R = moveX - comR;
            var B = moveY - comB;
            var comMin = this.comTypeMin[item.type] || this.comMin;
            var minw = comMin.w;
            var minh = comMin.h;

            // 移动左边或者上边 才会触发修改top和left 反之都是本身 最大左边距为本身的右边 最大上距为本身的下边
            var left = Math.min(hasL ? componentStyle.left - X : componentStyle.left, comR - minw);
            var top = Math.min(hasT ? componentStyle.top - Y : componentStyle.top, comB - minh);

            var maxWidth = Math.min(componentStyle.width + R, parent.W - componentStyle.left);
            var maxHeight = Math.min(componentStyle.height + B, parent.H - componentStyle.top);
            maxWidth = this.restrictedArea ? maxWidth : componentStyle.width + R;
            maxHeight = this.restrictedArea ? maxHeight : componentStyle.height + B;
            /**
             * 限制缩放大小时
             * 如果包含l 并且组件left大于0 组件的宽 + X差值 反之判断是r 组件宽 + 组件右边与移动时的差值
             * 如果包含t 并且组件top大于0 组件的宽 + Y差值 反之判断是b 组件高 + 组件下边与移动时的差值
             */

            var width = Math.max(hasL ? componentStyle.width + X : hasR ? maxWidth : componentStyle.width, minw);
            var height = Math.max(hasT ? componentStyle.height + Y : hasB ? maxHeight : componentStyle.height, minh);

            if (item.type == "video-display" && item.scale != 4) {
                var pro = {
                    0: 1 / 1,
                    1: 3 / 2,
                    2: 4 / 3,
                    3: 16 / 9,
                }
                var aspectRatio = pro[item.scale];
                var wh = this.getSizeByContainerRatio(width, height, aspectRatio);
                var newWidth = wh.width;
                var newHeight = wh.height;
                var minWidth = this.getSizeByContainerRatio(comMin.w, comMin.h, aspectRatio);

                width = newWidth;
                height = newHeight;

                if (hasL || hasB) {
                    var newLeft = (componentStyle.width - newWidth);
                    left = Math.min(componentStyle.left + newLeft, comR - minWidth.width);
                }
                if (hasT) {
                    var newTop = (componentStyle.height - newHeight);
                    // top = Math.min(componentStyle.top + newTop, comB - minWidth.height);
                    top = Math.max(componentStyle.top + newTop, 0);
                }

                if (hasR) {
                    left = Math.min(componentStyle.left, comR - minWidth.width);
                    // top = Math.min(componentStyle.top, comB - minWidth.height);
                }

            }

            if (this.isChecked()) {
                this.zoomUpdateCheckedStyle(data, componentStyle, width, height, point);
            } else {
                this.MoveSetComponentStyle(left, top, width, height, item, el);
            }
            if (this.showZoomLine) {
                this.showLine(item, "zoom", point, el, data, componentStyle);
            }

        },
        zoomUpdateCheckedStyle: function (data, componentStyle, width, height, point) {
            var hasT = /t/.test(point);
            var hasL = /l/.test(point);
            var diffLeft = width - componentStyle.width,
                diffTop = height - componentStyle.height,
                regionRight = componentStyle.left + componentStyle.width, // 区域右边
                regionBottom = componentStyle.top + componentStyle.height, // 区域下边
                _this = this;
            data.forEach(function (comItem) {
                var comStyle = comItem.style,
                    // 得到当前按钮相对区域的边距比例
                    comLeft = (comStyle.left - componentStyle.left) / componentStyle.width,
                    comTop = (comStyle.top - componentStyle.top) / componentStyle.height,
                    comRight = (regionRight - (comStyle.left + comStyle.width)) / componentStyle.width,
                    comBottom = (regionBottom - (comStyle.top + comStyle.height)) / componentStyle.height,
                    comWidth = comStyle.width / componentStyle.width,
                    comHeight = comStyle.height / componentStyle.height;

                _this.data.forEach(function (currItem) {
                    if (currItem.id == comItem.id) {
                        // 比例 * 差值 + 原来的值
                        comLeft = (comLeft * diffLeft) + comStyle.left;
                        comTop = (comTop * diffTop) + comStyle.top;
                        comWidth = (comWidth * diffLeft) + comStyle.width;
                        comHeight = (comHeight * diffTop) + comStyle.height;

                        if (hasL) {
                            comLeft = (comStyle.left + comStyle.width - (comRight * diffLeft)) - comWidth;
                        }
                        if (hasT) {
                            comTop = (comStyle.top + comStyle.height - (comBottom * diffTop)) - comHeight;
                        }
                        _this.moveSetCheckedStyle(currItem, comLeft, comTop, comWidth, comHeight);
                    }
                });
            });
        },
        /**
         * 
         * @param {*} direction 手势
         * @param {*} item 当前组件
         * @param {*} newStyle 新的值
         * @param {*} checkedStyle 区域样式
         * @param {*} data 未修改前组件列表数据
         * @returns 
         */
        scalingOfAdsorption: function (direction, item, newStyle, checkedStyle, data) {
            var hasT = /t/.test(direction);
            var hasB = /b/.test(direction);
            var hasL = /l/.test(direction);
            var hasR = /r/.test(direction);

            var currStyle = item.style;
            if (this.isChecked()) {
                currStyle = checkedStyle;
            }

            ['width', 'height', 'top', 'left'].forEach(function (attr) {
                currStyle[attr] = Number(currStyle[attr])
            })
            var diffLeft = (newStyle.l + newStyle.w) - (currStyle.left + currStyle.width),
                diffTop = (newStyle.t + newStyle.h) - (currStyle.top + currStyle.height),
                left = currStyle.left,
                top = currStyle.top,
                width = currStyle.width,
                height = currStyle.height;


            if (hasT) {
                diffTop = currStyle.top - newStyle.t;
                top = currStyle.top - diffTop;
            }
            if (hasL) {
                diffLeft = currStyle.left - newStyle.l;
                left = currStyle.left - diffLeft;
            }
            width = currStyle.width + diffLeft;
            height = currStyle.height + diffTop;
            if (this.isChecked()) {
                this.zoomUpdateCheckedStyle(data, checkedStyle, width, height, direction)
                return
            }
            this.MoveSetComponentStyle(left, top, width, height, item);
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
        /**
         * 点击组件
         */
        mouseDownComponent: function (event, item, index, el) {
            if (this.isLock || this.allIsLock) return;
            if (this.checkIds().indexOf(item.id) == -1 && !this.isKeyCtrl()) {
                this.setChecked();
                this.activeComponent = item.id;
            }
            var e = this.eventDefault(event);
            if (item.lock) return;
            if (specialComponent[item.propertyFlag]) return;
            var _this = this;
            // 画布位置信息
            var rectInfo = this.$refs[this.canvasRef || "com-canvas"].getBoundingClientRect();
            var parent = {
                W: rectInfo.width,
                H: rectInfo.height,
                X: rectInfo.left,
                Y: rectInfo.top
            }
            // console.log(parent, this.parentPlace);
            // var parent = this.parentPlace;
            var id = item.id;
            /**
             * 点击时的组件位置信息
             */
            var moduleInfo = document.querySelector('[sort="' + id + '"]').getBoundingClientRect();

            var componentStyle = {
                width: item.style.width,
                height: item.style.height,
                left: moduleInfo.left - parent.X,
                top: moduleInfo.top - parent.Y
            }

            var clickInfo = {
                x: e.clientX,
                y: e.clientY
            }
            var move = null;
            var data = this.deepCopy(this.data);
            var checkedStyle = this.deepCopy(this.computedMaxOrMinValue);
            move = function (moveEvent) {
                _this.mouseMoveComponent(moveEvent, clickInfo, componentStyle, parent, item, el, data, checkedStyle);
            }
            var up = function (e) {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                _this.hideLine();
                _this.showCheckedPoint = true;

                _this.$emit("mouseup-component", item, _this.componentData);
                _this.saveComponent();
            }
            var leave = function () {
                document.removeEventListener("mouseleave", leave);
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            document.addEventListener('mouseleave', leave);
        },
        /**
         * 移动组件
         * @param {*} moveE 鼠标移动位置
         * @param {*} clickE 点击时的组件边距
         * @param {*} componentStyle 点击时的组件相对画布位置信息
         * @param {*} parent 画布位置信息
         * @param {*} item 当前组件
         * @param {*} el 外层类型
         * @param {*} data 开始点击时所有组件的副本 只为拿到点击时的位置
         */
        mouseMoveComponent: function (moveE, clickE, componentStyle, parent, item, el, data, checkedStyle) {

            /**
             * 当前点击的位置 - 组件距离画布距离 - 画布距离浏览器距离 = 点击位置相对组件位置
             * 只为鼠标点击组件某个位置鼠标就在那个位置 
             * 如果没有这个值 距离会加上这一段 导致鼠标一直在组件左上角
             */
            // var poorX = clickE.x - componentStyle.left - parent.X;
            // var poorY = clickE.y - componentStyle.top - parent.Y;
            /**
             * 当前移动位置 - 画布位置 - 点击的位置离组件位置
             */
            // var left = moveE.clientX - parent.X - poorX;
            // var top = moveE.clientY - parent.Y - poorY;

            /**
             * 鼠标点击到移动位置的差值
             */
            var l = moveE.clientX - clickE.x,
                t = moveE.clientY - clickE.y,

                left = componentStyle.left + l,
                top = componentStyle.top + t,
                width = componentStyle.width,
                height = componentStyle.height;


            if (this.restrictedArea) {
                /**
                 * 如果限制区域 
                 * Math.max(0, left)
                 * 位置信息得到的是相对画布的距离 所以与0作比较
                 * 只要边距大于0 就可以一直移动 反只就为0
                 * 选出一个最大值 可以实现最小左边距或上边距为0
                 * 
                 * 
                 * parent.W - componentStyle.width
                 * 得到当前组件在画布所有可移动区域 
                 * 如果某个距离大于可移动区域 则最小值为可移动区域
                 * 选出一个最小值 实现最大边距为画布大小减去组件大小
                 */

                left = Math.min(left, parent.W - componentStyle.width);
                top = Math.min(top, parent.H - componentStyle.height);
            }

            if (this.checkedComponentIds.length > 1) {
                this.showCheckedPoint = false;
                var list = this.checkedComponentIds,
                    ids = {},
                    _this = this;
                list.forEach(function (id) {
                    ids[id] = true;
                });
                data.forEach(function (item) {
                    if (ids[item.id]) {
                        var style = item.style,
                            left = style.left,
                            top = style.top,
                            marginl = left - checkedStyle.left,
                            marginr = (checkedStyle.width + checkedStyle.left) - (style.width + style.left),
                            marginb = (checkedStyle.height + checkedStyle.top) - (style.height + style.top),
                            margint = top - checkedStyle.top,
                            /**
                             * 所有的计算都基于按钮
                             * 最大值为 画布宽 - 按钮宽 - 按钮右边离区域右边的距离
                             */
                            lvalue = Math.min(Math.max(marginl, left + l), parent.W - style.width - marginr),
                            tvalue = Math.min(Math.max(margint, top + t), parent.H - style.height - marginb);

                        _this.data.forEach(function (el) {
                            if (item.id == el.id) {
                                _this.moveSetCheckedStyle(el, lvalue, tvalue, style.width, style.height);
                            }
                        });
                    }
                });
                if (this.showMouseLine) {
                    this.showLine(item, "mouse", null, el, data, checkedStyle);
                }
                return;
            }
            this.MoveSetComponentStyle(left, top, width, height, item, el);
            this.$emit("mouse-move-component", item);
            if (this.showMouseLine) {
                this.showLine(item, "mouse", null, el);
            }
        },
        /**
         * 清除浏览器默认事件
         */
        eventDefault: function (event) {
            var e = event || window.event;
            e.stopPropagation();
            e.preventDefault();
            return e;
        },
        /**
         * 设置组件样式
         */
        MoveSetComponentStyle: function (left, top, width, height, item, el) {

            /**
             * 组件最小宽高
             */

            // item.style.width = Math.max(width, this.comMin.w);
            // item.style.height = Math.max(height, this.comMin.h);
            item.style.width = width;
            item.style.height = height;

            var minLeft = 0;
            var minTop = 0;

            item.style.left = Math.max(minLeft, left);
            item.style.top = Math.max(minTop, top);

        },
        /**
         * 设置多选的样式
         */
        moveSetCheckedStyle: function (item, lvalue, tvalue, width, height) {
            item.style.width = width;
            item.style.height = height;

            item.style.left = lvalue;
            item.style.top = tvalue;
        },
        /**
         * 移动吸附
         */
        mouseKeyStyle: function (currStyle, key, condition, other, lKey, rKey, tKey, bKey) {
            // console.log(key, condition.line, lKey, rKey, tKey, bKey);
            var w = currStyle.width,
                h = currStyle.height,
                l = currStyle.left,
                t = currStyle.top,
                line = condition.line;
            var lkeyVal = lKey || rKey;
            var tkeyVal = tKey || bKey;

            if (key == "top") {
                t = condition.lineValue - h
                if (line == "xt") t = other[tkeyVal];
            }
            if (key == "left") {
                l = condition.lineValue - w;
                if (line == "yl") l = other[lkeyVal];
            }
            return {
                w: w,
                h: h,
                l: l,
                t: t
            }
        },
        // 吸附
        showLine: function (item, type, point, el, data, checkedStyle) {
            if (item == undefined) {
                return;
            }
            // var i = index;
            var _this = this;
            var lines = this.$refs;
            var currStyle, thisComponent;
            // 当前组件
            currStyle = item.style;
            thisComponent = item;


            // 其他组件
            var otherComponent = this.otherComponentStyle(thisComponent, el);
            var list = this.checkedComponentIds;
            var components = [];
            if (list.length > 1) {
                otherComponent = this.otherComponentStyle({});
                currStyle = this.computedMaxOrMinValue;
                components = this.data.filter(function (com) {
                    return list.indexOf(com.id) != -1;
                })
            }

            ['width', 'height', 'top', 'left'].forEach(function (attr) {
                currStyle[attr] = Number(currStyle[attr])
            })

            if (!this.data.length) return
            _this.hideLine()
            if (!otherComponent.length) return;

            otherComponent.forEach(function (value) {
                var other = {
                    top: Number(value.style.top),
                    left: Number(value.style.left),
                    width: Number(value.style.width),
                    height: Number(value.style.height),
                    bottom: Number(value.style.top) + Number(value.style.height),
                    right: Number(value.style.left) + Number(value.style.width)
                }
                var curRight = currStyle.left + currStyle.width;
                var curBottom = currStyle.top + currStyle.height;
                var curL = currStyle.left;
                var curT = currStyle.top;


                var lKey = _this.isNearly(curL, other.left, other.right, "left", "right");
                var rKey = _this.isNearly(curRight, other.left, other.right, "left", "right");
                var tKey = _this.isNearly(curT, other.top, other.bottom, "top", "bottom");
                var bKey = _this.isNearly(curBottom, other.top, other.bottom, "top", "bottom");

                var ylValue = other[lKey] == undefined ? currStyle.left : other[lKey];
                var yrValue = other[rKey] == undefined ? currStyle.left : other[rKey];
                var xtValue = other[tKey] == undefined ? currStyle.top : other[tKey];
                var xbValue = other[bKey] == undefined ? currStyle.top : other[bKey];


                var conditions = {
                    left: [{
                            show: _this.isNearly(currStyle.left, other.left, other.right),
                            lineValue: ylValue,
                            line: "yl",
                            lineNode: lines[3], // yl
                        },
                        {
                            show: _this.isNearly(curRight, other.left, other.right),
                            lineValue: yrValue,
                            line: "yr",
                            lineNode: lines[5], // yr
                        }
                    ],
                    top: [{
                            show: _this.isNearly(currStyle.top, other.top, other.bottom),
                            lineValue: xtValue,
                            line: "xt",
                            lineNode: lines[0], // xt
                        },
                        {
                            show: _this.isNearly(curBottom, other.top, other.bottom),
                            lineValue: xbValue,
                            line: "xb",
                            lineNode: lines[2], // xb
                        }
                    ],
                }
                Object.keys(conditions).forEach(function (key) {
                    conditions[key].forEach(function (condition) {
                        if (!condition.show) return;
                        var val = condition.lineValue;

                        condition.lineNode[0].style[key] = val + "px";
                        _this.lineStatus[condition.line] = true;
                        var mouseKeyStyle = _this.mouseKeyStyle(currStyle, key, condition, other, lKey, rKey, tKey, bKey)

                        var mousel = Math.max(mouseKeyStyle.l, 0);
                        var mouset = Math.max(mouseKeyStyle.t, 0);

                        if (type == "zoom") return _this.scalingOfAdsorption(point, item, mouseKeyStyle, checkedStyle, data);

                        if (list.length > 1) {
                            data.forEach(function (daItem) {
                                var diffLeft = mousel + (daItem.style.left - checkedStyle.left);
                                var diffTop = mouset + (daItem.style.top - checkedStyle.top);
                                components.forEach(function (comItem) {
                                    if (daItem.id == comItem.id) {
                                        _this.moveSetCheckedStyle(comItem, diffLeft, diffTop, comItem.style.width, comItem.style.height);
                                    }
                                });
                            })
                        } else {
                            _this.MoveSetComponentStyle(mouseKeyStyle.l, mouseKeyStyle.t, mouseKeyStyle.w, mouseKeyStyle.h, item, el);
                        }

                    })
                })
            });
        },
        // 隐藏
        hideLine: function () {
            var _this = this;
            for (var key in this.lineStatus) {
                this.lineStatus[key] = false;
            }
        },
        /**
         * 
         * @param {*} dragValue 其他组件与当前组件相同一边
         * @param {*} targetValue 当前组件
         * @param {*} targetValue1 其他组件与当前组件相反边
         * @param {*} key1 相同边的key 比如 left
         * @param {*} key2 相反边的key 比如 right
         * @returns 
         */
        isNearly: function (dragValue, targetValue, targetValue1, key1, key2) {
            // console.log(dragValue, targetValue, '相减：', dragValue - targetValue)
            /**
             * 两种情况 
             * 1、相同边比较
             * 2、不同边比较
             * 使用返回true的数据
             */

            if (Math.abs(dragValue - targetValue) <= this.diff) return key1 || true;
            if (Math.abs(dragValue - targetValue1) <= this.diff) return key2 || true;
            return false;
            // return Math.abs(dragValue - targetValue) <= this.diff;
        },
        /**
         * 
         * @param {*} curr 当前组件 || 多个组件id
         * @returns 其他组件信息
         */
        otherComponentStyle: function (curr, el) {
            var _this = this;
            var ids = curr.id ? [curr.id] : this.checkedComponentIds;
            var outerData = this.outerData || [];
            var data = outerData.concat(this.data);
            var component = data.filter(function (item) {
                // return item.id != curr.id;
                return ids.indexOf(item.id) == -1;
            })
            return component || [];
        },
        /**
         * 吸附线样式
         */
        lineStyle: function (line) {
            var rectInfo = this.$refs[this.canvasRef || "com-canvas"].getBoundingClientRect();
            var classname = line.indexOf('x') != -1 ? 'x-line' : 'y-line';
            var width = 1;
            var height = 1;
            if (classname == 'x-line') {
                width = rectInfo.width;
            }
            if (classname == 'y-line') {
                height = rectInfo.height;
            }
            return {
                width: width + 'px',
                height: height + 'px',
            }
        },
        // 在画布移动时
        handleDragOver: function (e) {
            var e = e || window.event;
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
        },
        isKeyCtrl: function () {
            return window.event.ctrlKey;
        },
        // 点击组价
        changeComponent: function (e, item) {
            if (this.allIsLock) return;
            if (this.isKeyCtrl()) return;
            if (e.target.className.indexOf('delete-component') != -1) return this.$emit('delete', item);
            var id = item.id;
            // 判断按钮名称是否为空
            if (this.$parent.buttonNameIsVoid) {
                if (this.$parent.buttonNameIsVoid()) return;
            }
            var ids = this.checkedComponentIds;
            if (ids.length <= 1 && ids[0] != id) {
                this.activeComponent = id;
                this.setChecked();
            }

            if (this.$parent.copyCOmponent) {
                this.$parent.copyCOmponent();
            }
        },
        // 点击canvas
        clickNotActive: function (event) {
            var e = event || window.event;
            e.preventDefault();
            if (e.target.className.indexOf('canvas') !== -1 || e.target.className.indexOf('outer-border') !== -1) {
                this.activeComponent = null;
            }
        },

        editDisoption: function () {
            var _this = this;
            var item = this.componentData.filter(function (el, i) {
                return el.id == _this.activeComponent;
            })[0]
            return item;
        },
        setComponentStyle: function (item) {
            var result = {};
            var style = item.style;
            var sizeArr = ['width', 'height', 'top', 'left', "fontSize"];
            for (var key in style) {
                if (item.type != "rectangle") result[key] = style[key];
                // if (key == 'backgroundOpacity') result[key] = 100 - (result[key] * 100);
                if (sizeArr.indexOf(key) != -1) result[key] = `${style[key]}px`;
            }
            // var opacity = result.backgroundOpacity;
            if (item.type && item.type != "rectangle") {
                var opacity = (100 - result.backgroundOpacity) / 100;

                result.backgroundColor = this.colorRgb(result.backgroundColor, opacity);
            }

            return result
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
        setButtonTextAlgin: function (item) {
            var obj = {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }
            return obj[item.style.textAlign] || "center";
        },









        isChecked: function () {
            return this.checkedComponentIds.length > 1;
        },
        setChecked: function (ids, list) {
            this.checkedComponentIds = ids || [];
            this.checkedComponentList = list || [];
        },
        checkedList: function () {
            return this.checkedComponentList || [];
        },
        checkIds: function () {
            return this.checkedComponentIds || [];
        },
        /**
         * 按下ctrl并点击 选中
         * @param {*} item 
         */
        doSomething: function (e, item) {
            if (specialComponent[item.propertyFlag]) return;
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            if (e.altKey || e.shiftKey) return;
            if (!this.selectMultiple || !this.isEdit) return;
            var id = item.id,
                _this = this;
            var activeId = this.activeComponent;
            /**
             * 当前选中的是不是特殊按钮组件
             * 如果是则不追加到多选组
             */
            var isButtonTemplate = this.componentData.filter(function (bt) {return bt.id == activeId})[0] || {};

            if (activeId != null && !specialComponent[isButtonTemplate.propertyFlag]) {
                if (this.checkedComponentIds.indexOf(activeId) == -1) this.checkedComponentIds.push(activeId);
            }
            this.activeComponent = null;
            var index = this.checkedComponentIds.indexOf(id);
            if (index == -1) {
                this.checkedComponentIds.push(id);
            } else {
                this.checkedComponentIds.splice(index, 1);
            }
            var arr = this.data.filter(function (el) {
                return _this.checkedComponentIds.indexOf(el.id) != -1;
            });

            if (arr.length == 1) this.activeComponent = item.id;
            this.checkedComponentList = arr;
        },
        /**
         * 鼠标在画布点击时
         * @param {*} event event
         */
        alignCanvasMousedown: function (event) {
            var _this = this;
            var e = event || window.event;
            if (e.target.className.indexOf("component-pointer") >= 0) return;
            this.activeComponent = null;
            this.clickNotActive(event);
            if (!this.isEdit || !this.selectMultiple) return;
            // e.stopPropagation();
            // e.preventDefault();
            this.setChecked();
            for (var key in this.regionStyle) {
                this.regionStyle[key] = 0;
            }

            var canvasInfo = this.$refs[this.canvasRef || "com-canvas"].getBoundingClientRect();

            var startStyle = {
                left: e.clientX - canvasInfo.left,
                top: e.clientY - canvasInfo.top
            };

            var move = function (moveEvent) {
                _this.alignCanvasMouseMove(moveEvent, canvasInfo, startStyle);
            }
            var up = function (upEvent) {
                _this.alignCanvasMouseUp(upEvent, canvasInfo, startStyle)
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        },
        alignCanvasMouseMove: function (event, canvasInfo, startStyle) {
            // console.log(event);
            var _this = this;
            var e = event || window.event;
            e.stopPropagation();
            e.preventDefault();

            var left = Math.max(e.clientX - canvasInfo.left, 0),
                top = Math.max(e.clientY - canvasInfo.top, 0),
                w = startStyle.left - left,
                h = startStyle.top - top,
                width = Math.abs(w),
                height = Math.abs(h);

            left = w < 0 ? startStyle.left : left;
            top = h < 0 ? startStyle.top : top;
            height = Math.min(height, canvasInfo.height - top);
            width = Math.min(width, canvasInfo.width - left);


            var region = {
                left: left,
                top: top,
                width: width,
                height: height
            }
            this.setChecked();

            var arr = this.data.filter(function (item) {
                return _this.isOverlap(region, item.style);
            });

            this.checkedComponentList = arr;

            arr.forEach(function (item, index) {
                if (_this.checkedComponentIds.indexOf(item.id) == -1) _this.checkedComponentIds.push(item.id);
            });

            this.regionStyle.width = width;
            this.regionStyle.top = top;
            this.regionStyle.height = height;
            this.regionStyle.left = left;


        },
        alignCanvasMouseUp: function (event, canvasInfo, startStyle) {
            var _this = this;
            for (var key in this.regionStyle) {
                this.regionStyle[key] = 0;
            }
            var ids = this.checkedComponentIds;
            if (ids.length == 1) {
                this.activeComponent = ids[0];
                this.setChecked();
            }
        },
        isOverlap: function (idOne, idTwo) {
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
        addPx: function (obj) {
            var pxs = ['width', 'height', "left", "top"];
            var result = {};
            for (var key in obj) {
                result[key] = obj[key];
            }
            pxs.forEach(function (key) {
                result[key] = obj[key] + "px";
            });
            return result;
        },
        setPointStyle: function (item) {
            var style = this.computedMaxOrMinValue;
            var point = item.point;
            var width = style.width;
            var height = style.height;
            var hasT = /t/.test(point);
            var hasB = /b/.test(point);
            var hasL = /l/.test(point);
            var hasR = /r/.test(point);
            var top = 0;
            var left = 0;
            // 两个的时候 也就是四角的时候
            left = hasL ? style.left : width + style.left
            top = hasT ? style.top : height + style.top
            var styles = {
                marginLeft: hasR ? '-5px' : '-5px',
                marginTop: '-5px',
                left: left + 'px',
                top: top + 'px',
                cursor: item.cursor + '-resize',
            }
            return styles;
        },


        setActiveBorderStyle: function (key) {
            var style = this.computedMaxOrMinValue;
            var defaultWH = 6,
                top = style.top,
                width = style.width,
                height = style.height,
                left = style.left;
            var keys = {
                "t": {
                    width: width,
                    location: "Top",
                    top: top,
                    left: left,
                    height: defaultWH
                },
                "r": {
                    height: height,
                    left: (width * 1 + left) - defaultWH,
                    top: top,
                    location: "Right",
                    width: defaultWH
                },
                "b": {
                    width: width,
                    top: (height * 1 + top) - defaultWH,
                    left: left,
                    location: "Bottom",
                    height: defaultWH
                },
                "l": {
                    height: height,
                    location: "Left",
                    left: left,
                    top: top,
                    width: defaultWH
                }
            }
            var newStyle = {},
                _this = this;
            for (var k in keys[key]) {
                var styleKey = "border" + keys[key][k];
                if (k == "location") {
                    if (_this.checkedComponentIds.length > 1) newStyle[styleKey] = "1px solid #43B498";
                } else {
                    newStyle[k] = keys[key][k] + "px";
                }
            }
            if (key == "l" || key == "r") newStyle.cursor = "w-resize";
            if (key == "t" || key == "b") newStyle.cursor = "n-resize";
            return newStyle;
        },
    },
    computed: {
        canvasSize: function () {
            var wIspx = isNaN(this.width) ? this.width : this.width + "px";
            var hIspx = isNaN(this.height) ? this.height : this.height + "px";
            return {
                width: wIspx,
                height: hIspx
            }
        },
        electricFilterButtonIds: function () {
            var ids = {};
            if (!this.central) return ids;
            this.central.electricFilterButton.forEach(function (item) {
                var value = item.propertyFlag + item.id
                if (!ids[value]) ids[value] = value;
            })
            return ids;
        },
        computedRegionStyle: function () { // 区域的样式
            var _this = this,
                result = {},
                max = 0;
            ['width', 'height', "left", "top"].forEach(function (key) {
                var value = _this.regionStyle[key];
                if (value > 0) max = value;
                result[key] = value;
            })
            if (max > 0) result.border = "1px solid #43b498";
            return result;
        },
        computedMaxOrMinValue: function () {
            var _this = this;
            var arr = this.data.filter(function (item) {
                return _this.checkedComponentIds.indexOf(item.id) != -1;
            });
            var allStyle = {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
            }
            if (!arr.length) return allStyle;
            var arrStyle = arr[0].style,
                minLeft = arrStyle.left,
                maxRight = arrStyle.left + arrStyle.width,
                minTop = arrStyle.top,
                maxBottom = arrStyle.top + arrStyle.height;

            arr.forEach(function (item) {
                var style = item.style;
                var left = style.left,
                    right = style.left + style.width,
                    top = style.top,
                    bottom = style.top + style.height;

                minLeft = Math.min(minLeft, left);
                maxRight = Math.max(maxRight, right);
                minTop = Math.min(minTop, top);
                maxBottom = Math.max(maxBottom, bottom);
            });
            allStyle = {
                left: minLeft,
                top: minTop,
                width: (maxRight - minLeft),
                height: (maxBottom - minTop),
                border: "1px solid #43b498"
            }
            return allStyle;
        },
        isEdit: function () {
            return this.central ? this.central.isEdit : true;
        },
        currComponent: function () {
            var _this = this;
            var curr = this.data.filter(function (el) {
                return el.id == _this.activeComponent;
            })
            return curr[0] ? curr[0] : null;
        },
    },
    watch: {
        activeComponent: function (val) {
            // this.active = val;
            this.$emit("update:active", val)
        },
        active: function (val) {
            this.activeComponent = val;
        },
        data: {
            handler: function (val) {
                this.componentData = val;
            },
            deep: true
        }
    },
    template: `
    <div
        class="components-canvas custom-relative com-canvas"
        :ref="canvasRef || 'com-canvas'"
        :style="canvasSize"
        @mousedown="alignCanvasMousedown"
      >
        <div v-for="point in pointList" 
            @mousedown="mouseCheckedPoint($event,point.point)"
            :class="['custom-absolute component-pointer',point.point, {'l-point': isChecked() && showCheckedPoint}]" 
            :style="setPointStyle(point)">
        </div>
        <div 
            v-for="br in border" 
            :key="br" 
            class="custom-absolute align-checked-container" 
            :style="setActiveBorderStyle(br)"
            @mousedown="mouseCheckedPoint($event,br)"
        ></div>

        <div class="align-checked-container custom-absolute region-style"
            :style="addPx(computedRegionStyle)"></div>
        <template>
            <drag-drop
            :name-key="nameKey"
            ref="item"
            v-for="(item, index) in componentData"
            :item="item"
            :sort="item.id"
            @mouse="mouseDownComponent"
            @mouse-point="mouseDownOnPoint"
            @cl="$emit('parentclick',item)"
            @db="$emit('parentdb',$event,item)"
            @click.ctrl.native="doSomething($event,item)"
            :index="index"
            :active="activeComponent"
            :key="item.id"
            :trans-form="transForm"
            :component-w-h-l-t="componentWHLT"
            v-on="$listeners"
            @mousedown.native="changeComponent($event, item)"
            :is-conflict-ids="isConflictIds"
            v-show="!electricFilterButtonIds[item.propertyFlag + item.id]"
            >
                <slot class="component-slot" :item="item"></slot>
            </drag-drop>
        </template>
        
        <div
          v-for="(line, lineIndex) in lines"
          :key="lineIndex"
          class="line active-line"
          :ref="lineIndex"
          :class="[line.indexOf('x') != -1 ? 'x-line' : 'y-line', line]"
          v-show="lineStatus[line] || false"
        ></div>
      </div>
    `
})
Vue.component("drag-drop", {
    data: function () {
        return {
            pointList: [{
                    point: 't',
                    cursor: 'n'
                },
                {
                    point: 'r',
                    cursor: 'e'
                },
                {
                    point: 'b',
                    cursor: 's'
                },
                {
                    point: 'l',
                    cursor: 'w'
                },
                {
                    point: 'lt',
                    cursor: 'nw'
                },
                {
                    point: 'rt',
                    cursor: 'ne'
                },
                {
                    point: 'rb',
                    cursor: 'se'
                },
                {
                    point: 'lb',
                    cursor: 'sw'
                }
            ],
            border: ["t", "r", "b", "l"],
            show: {},
            selectOffsetHeight: 0
        }
    },
    props: {
        item: Object,
        elType: Object,
        index: Number,
        active: String,
        transForm: Function,
        componentWHLT: Function,
        nameKey: String,
    },
    inject: ["drop"],
    mounted: function () {
        
    },
    computed: {
        itemStyle: function () {
            return this.item.style;
        },
        /**
         * 画布位置以及大小
         */
        parentPlace: function (event) {
            var rectInfo = this.rectInfo;
            var parent = {
                W: rectInfo.width,
                H: rectInfo.height,
                X: rectInfo.left,
                Y: rectInfo.top
            }
            return parent;
        },
        componentTextStyle: function () {
            var obj = {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }
            return obj[this.item.style.textAlign] || "space-around";
        },
        componentStyle: function () {
            if (!this.componentWHLT) return;
            return this.componentWHLT(this.item);
        },
        includesIds: function () {
            var id = this.item.id;
            return this.drop.isConflictIds && this.drop.isConflictIds.indexOf(id) != -1;
        },
        activeIds: function () {
            var id = this.item.id;
            return this.drop.checkedComponentIds && this.drop.checkedComponentIds.indexOf(id) != -1;
        },
        rectangleWidthHeight: function () {
            var style = this.item.style;
            var width = style.width - (style.borderWidth * 2);
            var height = style.height - (style.borderWidth * 2);
            return {
                width: width + "px",
                height: height + "px"
            }
        },
        componentBgStyle: function () {
            if (this.drop.central && this.drop.central.groupButtonIcons[this.item.componentId]) return;
            if (this.item.type == "line") {
                return {backgroundColor: this.colorRgb("#fff", 0)}
            };
            var result = {};
            var style = this.item.style;
            var notBg = {
                // "video-display": "video-display",
                // "remote-assistance": "remote-assistance",
            }
            if (notBg[this.item.type]) return;
            for (var key in style) {
                if (key.indexOf("background") != -1) {
                    result[key] = style[key];
                }
            }
            var opacity = (100 - result.backgroundOpacity) / 100;
            if (result.backgroundColor) {
                result.backgroundColor = this.colorRgb(result.backgroundColor, opacity);
            }
            if (style.backgroundImage) {
                result.filter = "opacity(" + opacity + ")";
                result.backgroundSize = "100% 100%";
                result.backgroundRepeat = "no-repeat";
            }
            return result;
        },
        computedStyleOption: function () {
            return this.item.styleOption;
        },
        computedStyleWidthAndHeight: function () {
            var style = this.item.style;
            return {
                width: style.width,
                height: style.height
            }
        },
        computedShowTitle: function () {
            if (!this.item.title) return;
            return this.item.title.show;
        },
        newComponentWHLT: function () {
            var item = this.item;
            if (item.title && item.title.show) {
                return this.myComponentWHLT;
            } else {
                this.$set(item, "customStyle", null);
                return this.componentWHLT;
            }
        },
        titleFontSize: function () {
            var style = this.dynamicSize();
            return style;
        },
        titleLogoWidth: function () {
            var style = this.dynamicSize(9, null, null, "width");
            return style;
        },
        showComponent: function () {
            var item = this.item,
                direction = this.drop.central && this.drop.central.directionButton[item.componentId];
            return this.drop.central ? !direction : true;
        },
        titleDefauleStyle: function () {
            if (!this.item.title) return;
            var titleStyle = this.item.title.style;
            var result = {};
            for (var key in titleStyle) {
                result[key] = key == "fontSize" ? titleStyle[key] + "px" : titleStyle[key];
            }
            return result;
        }
    },
    methods: {
        dynamicSize: function (size, defaulWidth, defaultHeight, key) {
            if (!this.drop || !this.drop.minStyle) return;
            var minStyle = this.drop.minStyle();
            var width = this.item.style.width;
            var height = this.item.style.height;
            var style;
            size = size || 22;
            key = key || "fontSize";
            defaulWidth = defaulWidth || 548;
            defaultHeight = defaultHeight || 321;
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
         * 为了兼容黑色样式 添加区域标题 组件的宽高去要减去标题
         * @param {*} item 当前组件数据
         * @returns 返回一个新的组件宽高
         */
        myComponentWHLT: function (item) {
            var result = {};
            
            this.$nextTick(function () {
                var title = item.type + '-title';
                var node = this.$refs[title];
                var minStyle = this.drop.minStyle();
                var titleHeight = node.offsetHeight;
                var padding = 0;
                var bottom = 0;

                if (item.title && item.title.show) {
                    padding = this.dynamicSize(paddingNum[item.type], null, null, "padding").padding.replace("px", "") * 1;
                    bottom = this.dynamicSize(23, null, null, 'paddingBottom').paddingBottom.replace("px", "") * 1;
                }

                ['width', 'height'].forEach(function (attr) {
                    if (attr) {
                        result[attr] = (item.style[attr] - padding - item.style.borderWidth * 2) * minStyle + 'px'
                        if (attr == "height") result[attr] = (item.style[attr] - bottom - padding - titleHeight - item.style.borderWidth * 2) * minStyle + 'px'
                    }
                })
                this.$set(item, "customStyle", result);
                return result;
            })
            return result;
        },
        // 设置缩放圆圈样式
        setPointStyle: function (item, style) {
            var ids = this.drop.checkedComponentIds;
            if (ids.length > 1) return;
            // 按钮组件
            if (specialComponent[this.item.propertyFlag]) return { display: "none" };
            var point = item.point;
            var width = style.width;
            var height = style.height;
            var hasT = /t/.test(point);
            var hasB = /b/.test(point);
            var hasL = /l/.test(point);
            var hasR = /r/.test(point);
            var top = 0;
            var left = 0;
            // 两个的时候 也就是四角的时候
            if (point.length === 2) {
                left = hasL ? 0 : width
                top = hasT ? 0 : height
            } else {
                // 上下两边的点，宽度居中
                if (hasT || hasB) {
                    left = width / 2
                    top = hasT ? 0 : height
                }

                // 左右两边的点，高度居中
                if (hasL || hasR) {
                    left = hasL ? 0 : width
                    top = Math.floor(height / 2)
                }
            }
            var styles = {
                marginLeft: hasR ? '-5px' : '-5px',
                marginTop: '-5px',
                left: left + 'px',
                top: top + 'px',
                cursor: item.cursor + '-resize',
            }
            return styles;
        },
        // 设置组件样式
        setComponentStyle: function (item) {
            var result = {};
            var style = item.style;
            var sizeArr = ['width', 'height', 'top', 'left', "fontSize"];
            for (var key in style) {
                // 因为设置了圆角 会出现背景色溢出 所以全局颜色不设置背景颜色
                if (item.type != "rectangle" && key.indexOf('border') == -1 && key.indexOf('background') == -1) result[key] = style[key];
                if (sizeArr.indexOf(key) != -1) result[key] = style[key] + "px";
            }

            return result;
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
        activeBorder: function (item) {
            var result = {},
                style = item.style;
            var sizeArr = ['width', 'height', 'left', 'top'];
            sizeArr.forEach(function (key) {
                result[key] = style[key] + "px";
            });
            return result;
        },
        componentBorderStyle: function (item) {
            if (item.type == "line") return;
            if (this.drop.central && this.drop.central.groupButtonIcons[item.componentId]) return;
            var style = item.style;
            var result = {};
            for (var key in style) {
                if (key.indexOf('background') == -1) {
                    if (key.indexOf('border') != -1) {
                        result[key] = style[key];
                    }
                    if (key == 'borderWidth') result[key] = style[key] + 'px';


                    if (key == "borderRadius") {
                        var radius = style[key].top + 'px ' + style[key].right + 'px ' + style[key].bottom + 'px ' + style[key].left + 'px';
                        result[key] = radius
                    }
                }

            }
            return result;
        },
        setActiveBorderStyle: function (key) {
            var style = this.item.style;
            var scale = 1;
            var show = this.item.id == this.active || this.drop.checkedComponentIds.indexOf(this.item.id) != -1;
            var includesIds = this.includesIds;
            var keys = {
                "t": {
                    width: "100%",
                    location: "Top",
                    top: "0",
                },
                "r": {
                    height: "100%",
                    left: (style.width * scale - 1) + "px",
                    location: "Right",
                },
                "b": {
                    width: "100%",
                    top: (style.height * scale - 1) + "px",
                    location: "Bottom",
                },
                "l": {
                    height: "100%",
                    location: "Left",
                    left: "0",
                }
            }
            var newStyle = {
                zIndex: 1
            };
            for (var k in keys[key]) {
                newStyle[k] = keys[key][k];
                var styleKey = "border" + keys[key][k];
                if (k == "location") {
                    if (show) newStyle[styleKey] = "2px solid #43B498";
                    if (includesIds) newStyle[styleKey] = "2px solid #f00";
                }
            }
            return newStyle;
        },
        componentName: function (item) {
            if (specialComponent[item.propertyFlag]) return "";
            return item.componentName || item[this.nameKey];
        },
        titleHeight: function () {
            var style = {};
            var title = this.item.type + '-left-title';
            if (this.$refs[title]) style.height = (this.$refs[title].offsetHeight + 10) + "px"
            return style;
        },
    },
    watch: {
        computedStyleOption: function (val) {
            var type = this.item.type;
            if (type == "button") {
                this.item.style.backgroundImage = "linear-gradient(180deg, #52555D, #2B2F38)"
            }
            if (isIncludeStyleOption(showTitleComponent, type, val)) {
                this.$set(this.item.title, "show", true);
                this.$set(this.item.title, "text", $i.t("componentTitleText")[type]);
            } else {
                this.$set(this.item.title, "show", false);
            }
            if (isIncludeStyleOption(showBgComponent, type, val)) {
                this.$set(this.item.style, "backgroundColor", "#22242C");
            } else {
                this.$set(this.item.style, "backgroundColor", "#fff");
            }
        },
        computedShowTitle: function () {
            var type = this.item.type;
            if (this.newComponentWHLT) this.newComponentWHLT(this.item);
            if (!this.item.title.text) this.$set(this.item.title, "text", $i.t("componentText")[type]);
        },
        computedStyleWidthAndHeight: function () {
            if (this.newComponentWHLT) this.newComponentWHLT(this.item);
        }
    },
    // <div class="custom-absolute wh100" :style="componentBorderStyle(item)"></div>
    template: `
        <div
        v-if="showComponent"
        class="custom-absolute component-item"
        :class="item.type"
        :style="setComponentStyle(item)"
        @mousedown="$emit('mouse', $event, item, index, elType)"
        >
            
            <slot></slot>
            <div
                v-for="(point, i) in pointList"
                :key="point.cursor"
                class="custom-absolute component-pointer"
                :class="[
                    {
                    'l-point': active == item.id,
                    },
                    point.point,
                ]"
                :style="setPointStyle(point, itemStyle)"
                @mousedown="$emit('mouse-point', $event, point.point, index, item, elType)"
            ></div>
            <div
                v-for="br in border"
                class="custom-absolute"
                :style="setActiveBorderStyle(br)"
            ></div>
            <div 
                class="wh100 component-item-content-box"
                :style="[
                    item.title && item.title.show
                    ? dynamicSize(paddingNum[item.type], null, null, 'padding')
                    : '',
                    componentBgStyle,
                    componentBorderStyle(item),
                ]">

                <!-- 组件区域标题 -->
                <div 
                    class="component-title-name custom-relative custom-items-center custom-justify-between"
                    :style="[titleFontSize, dynamicSize(23, null, null, 'paddingBottom')]"
                    v-show="item.title && item.title.show"
                    :ref="item.type + '-title'"
                    :id="item.type + '-title'"
                >
                    <div class="flex-shrink-0 custom-relative custom-items-center title-left-box" :class="{'only': item.type != 'video-display' && item.type != 'remote-assistance'}" :ref="item.type + '-left-title'">
                        <div class="component-title-name-log custom-absolute" :style="titleLogoWidth"></div>
                        <div :style="titleDefauleStyle" class="title-left-text custom-ellipsis">
                            <span :title="item.title ? item.title.text : ''" >{{ item.title ? item.title.text : "" }}</span>
                        </div>
                    </div>

                    <!-- 右侧按钮或下拉 -->
                    <div v-if="item.type == 'video-display' || item.type == 'remote-assistance'" class="h100 title-right-box">
                        <div class="custom-items-center h100 color-A0A3BE" v-if="item.type == 'video-display'">
                            <span class="video-select-label flex-shrink-0">{{ $i.t("cctjs6") }}：</span>

                            <el-select :placeholder="$i.t('tipsText[0]')">
                                <el-option v-for="(li, liI) in []" 
                                    :key="'stream' + liI"
                                    :value="li.id" 
                                    :label="li.name"
                                ></el-option>
                            </el-select>
                        </div>
                        <div v-if="item.type == 'remote-assistance'" class="remote-assistance-title custom-flex-center">
                            <button class="remote-button pointer custom-ellipsis" :title="$i.t('ccjs20')" >{{ $i.t('ccjs20') }}</button>

                            <button class="click-disconnect pointer custom-ellipsis margin-l-5" :title="$i.t('ccjs31')" >{{ $i.t("ccjs31") }}</button>

                            <i class="iconfont iconfangda pointer margin-l-5"></i>
                        </div>
                    </div>
                </div>

                <div class="custom-flex-center component-box" :style="">

                    <component :component-w-h-l-t="newComponentWHLT" v-on="$listeners" :trans-form="transForm" :style="{'justify-content': componentTextStyle}" :is="componentName(item)" class="component custom-absolute" :item="item"></component>
                </div>
            </div>
        </div>
    `
})

{
    /* <template v-else>
                <div v-for="el in componentData" :key="el.id" class="custom-absolute outer-border" 
                    :style="setComponentStyle(el)">
                    <drag-drop
                    ref="item"
                    v-for="(item, index) in buttonData[el.type]"
                    :item="item"
                    :el-type="el.type"
                    :sort="item.id"
                    @mouse="mouseDownComponent"
                    @mouse-point="mouseDownOnPoint"
                    :index="index"
                    :active="activeComponent"
                    :key="index"
                    :trans-form="transForm"
                    :component-w-h-l-t="componentWHLT"
                    @mousedown.native="changeComponent($event, item)"
                    :class="{conflict: includesIds(item.id)}"
                    >
                        <slot class="component-slot"></slot>
                    </drag-drop>
                </div>
            </template> */
}