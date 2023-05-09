/**
 * 视频播放
 */
Vue.component("video-display", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["drop"],
    data: function () {
        return {
            streamList: []
        }
    },
    mounted: function () {

    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
        <div :style="[transSize(item), componentStyle]" class="custom-column video-play-1">
            <div class="w100 component-bg-image-box" :style="item.styleOption == 2 && item.title.show ? drop.dynamicSize(item, paddingNum[item.type], 446, 322, 'paddingLeft') : ''">
                <div class="wh100" :class="{'is-bg': isIncludeStyleOption(showBgComponent, item.type, item.styleOption)}"></div>
            </div>
        </div>
    `
})
/**
 * 课程表
 */
Vue.component("course-table", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["drop"],
    data: function () {
        return {
            sectionTotal: [],
            weekTableData: [],
            chnNumChar: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
            chnUnitSection: ["", "万", "亿", "万亿", "亿亿"],
            chnUnitChar: ["", "十", "百", "千"],
            activetable: 0,
            tableData: {
                courseInfo: {
                    label: "课程信息",
                    value: ""
                },
                instructor: {
                    label: "授课老师",
                    value: ""
                },
                className: {
                    label: "上课班级",
                    value: ""
                },
                attendance: {
                    label: "出勤",
                    value: {
                        total: {
                            label: "应到",
                            value: 0,
                            color: "#0095E8"
                        },
                        check: {
                            label: "实到",
                            value: 0,
                            color: "#53EF8C"
                        },
                        late: {
                            label: "迟到",
                            value: 0,
                            color: "#FF4F4F"
                        },
                        unCheck: {
                            label: "缺勤",
                            value: 0,
                            color: "#FFD664"
                        },
                        absence: {
                            label: "请假",
                            value: 0,
                            color: "#C547E8"
                        },
                    }
                }
            },
        }
    },
    mounted: function () {

    },
    methods: {
        initSectionTotal: function () {
            // for (var index = 1; index < 8; index++) {
            //     var obj = {
            //         label: this.numberToChinese(index),
            //         value: $i.t('weeksCourseList')[this.randomNum(0, $i.t('weeksCourseList').length - 1)]
            //     }
            //     this.sectionTotal.push(obj);
            // }
        },
        initWeekTable: function () {
            var arr = [];
            // for (var i = 1; i < 9; i++) {
            //     arr.push([])
            //     for (var j = 0; j < 8; j++) {
            //         var value = "";
            //         if (i != 1) value = $i.t('weeksCourseList')[this.randomNum(0, $i.t('weeksCourseList').length - 1)];
            //         if (j == 0 && i != 1) value = this.numberToChinese(i - 1) + $i.t("cctjs8");
            //         if (i == 1 && j != 0) value = $i.t('tableWeeks')[j - 1];
            //         arr[i - 1].push(value);
            //     }
            // }
            this.weekTableData = arr;
        },
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        i18nSwitch: function (key, item) {
            if (this.activetable == 1) return $i.t("cctjs8")[item.label];
            var i18n = $i.t("courseText");
            return i18n[key];
        },
        selfComputedStyle: function (component, minmargin, defaultSize) {
            var data = {
                component: component,
                minmargin: minmargin,
                defaultSize: defaultSize
            }

            if (this.computedStyle) {
                return this.computedStyle(data);
            }
            return;
        },
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        /**
         * 
         * @param {*} item 
         * @param {*} key 
         * @returns 数据转换 返回自己要的格式
         */
        turnTableValue: function (item, key) {
            if (key == "attendance") {
                var text = [];
                for (var k in item.value) {
                    var label = $i.t("attendanceDetail")[k];
                    var value = `${label}：<span style="color: ${item.value[k].color}">${item.value[k].value || 0}</span>${$i.t("ccjs15")}`;
                    if (!isIncludeStyleOption(showBgComponent, this.item.type, this.item.styleOption)) {
                        value = label + "：" + (item.value[k].value || 0) + $i.t("ccjs15");
                    }
                    text.push(value)
                }
                return text.join("，");
            }
            return item.value || "——"
        },
        switchTableType: function (value) {
            if (value == 1 && !this.sectionTotal.length) this.initSectionTotal();
            if (value == 2 && !this.weekTableData.length) this.initWeekTable();
            this.activetable = value;
        },
        randomNum: function (minNum, maxNum) {
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum);
        },
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
                    if (strIns == '一' && this.chnUnitChar[unitPos] == "十") strIns = "";
                    strIns += this.chnUnitChar[unitPos];
                    chnStr = strIns + chnStr;
                }
                unitPos++;
                section = Math.floor(section / 10);
            }
            return chnStr;
        },
        columnOne: function (row, column) {
            if (column == 0) return "column-one";
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        sizeStyle: function () {
            var style = this.drop.dynamicSize(this.item);
            return style;
        },
        turnTableData: function () {
            var displayOptions = this.item.displayOptions;
            var newTabledata = {},
                tabledata = {},
                _this = this;
            displayOptions.forEach(function (el) {
                var key = el == "attendance1" ? "attendance" : el;
                tabledata[key] = _this.tableData[key];
            });
            // 排序
            for (var key in _this.tableData) {
                if (tabledata[key]) newTabledata[key] = _this.tableData[key];
            }
            if (this.activetable == 1) return this.sectionTotal;
            return newTabledata;
        },
        componentTextStyle: function () {
            var obj = {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }
            return obj[this.item.style.textAlign] || "center";
        },
        headerList: function () {
            return $i.t("courseHeaderList");
        },
    },
    template: `
        <div :style="[transSize(item), componentStyle]">
            <div class="wh100 custom-column course-container" :style="{padding: item.styleOption == 1 || item.styleOption == 3 ? item.style.borderWidth + 4 + 'px' : ''}">
                <template v-if="item.styleOption == 1 || item.styleOption == 3">
                    <div class="custom-items-center">
                        <div class="table-header custom-items-center" :class="{'table-header-3': item.styleOption == 3, 'custom-justify-between w100': item.styleOption == 1}">
                            <div
                                class="header-item pointer"
                                :class="{
                                'table-active custom-success-color': activetable == i,
                                }"
                                v-for="(he,i) in headerList"
                                :key="i"
                                :style="sizeStyle"
                                :title="he"
                                @click="switchTableType(i)"
                            >
                                <span>{{ he }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="table-body custom-column custom-justify-between" :class="{'table-body-3 border-none': item.styleOption == 3}">
                        <el-scrollbar class="custom-scrollbar" ref="tableScrollbar">
                            <template v-if="activetable != 2">
                                <div class="custom-t20 text-center" v-if="!sectionTotal.length && activetable == 1">{{ $i.t("ccjs13") }}</div>
                                <div
                                    class="table-body-item custom-items-center"
                                    v-for="(item, key) in turnTableData"
                                    :key="key"
                                    :style="sizeStyle"
                                    >
                                    <div class="body-label custom-items-center" :style="{'justify-content': componentTextStyle}">
                                        {{ i18nSwitch(key,item) }}
                                    </div>
                                    <div class="body-value custom-items-center" :style="{'justify-content': componentTextStyle}">
                                        <span v-html="turnTableValue(item, key)"></span>
                                    </div>
                                </div>
                            </template>
                            <template v-if="activetable == 2">
                                <div class="custom-t20 text-center" v-if="!weekTableData.length">{{ $i.t("ccjs14") }}</div>
                                <div
                                    :style="sizeStyle"
                                    v-for="(row, rowI) in weekTableData"
                                    :key="'row' + rowI"
                                    class="week-table-row custom-items-center"
                                >
                                    <div
                                        v-for="(col, colI) in row"
                                        :class="columnOne(rowI,colI)"
                                        :key="'col' + colI"
                                        class="week-table-column custom-flex-center"
                                        :style="{'justify-content': componentTextStyle}"
                                    >
                                        <span class="week-table-text">{{ row[colI] }}</span>
                                    </div>
                                </div>
                            </template>
                        </el-scrollbar>
                    </div>
                </template>

                <template v-if="item.styleOption == 2">
                    <div class="table-body custom-column custom-justify-between table-body-2 border-none" :style="item.title.show ? drop.dynamicSize(item, 38, 548, 321, 'paddingLeft') : ''">
                        <el-scrollbar class="custom-scrollbar" ref="tableScrollbar">
                            <div class="custom-t20 text-center" v-if="!sectionTotal.length && activetable == 1">{{ $i.t("ccjs13") }}</div>
                            <div
                                class="table-body-item custom-items-center"
                                v-for="(item, key) in turnTableData"
                                :key="key"
                                :style="sizeStyle"
                                >
                                <div class="body-label border-none custom-items-center" :style="{'justify-content': componentTextStyle}">
                                    {{ i18nSwitch(key,item) }}
                                </div>
                                <div class="body-value custom-items-center" :style="{'justify-content': componentTextStyle}">
                                    <span v-html="turnTableValue(item, key)"></span>
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                </template>
            </div>
        </div>
    `
})
/**
 * 课程信息
 */
Vue.component("course", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {
            displayOptions: {
                className: {
                    label: "班级名称:",
                    icon: "icondangqianweizhi",
                    value: "13-2",
                    color: "#f56415"
                },
                instructor: {
                    label: "授课老师:",
                    icon: "iconlaoshi",
                    value: "刘老师",
                    color: "#19cad5"
                },
                attendance: {
                    label: "出勤率:",
                    icon: "iconshujutongji",
                    value: "80%",
                    color: "#22ade1"
                },
                courseInfo: {
                    label: "课程信息:",
                    icon: "iconkechengbiao3",
                    value: "language",
                    color: "#5b6dab"
                },
            },
        }
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        selfComputedStyle: function (component, minmargin, defaultSize) {
            var data = {
                component: component,
                minmargin: minmargin,
                defaultSize: defaultSize
            }

            if (this.computedStyle) {
                return this.computedStyle(data);
            }
            return;
        },
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        i18nSwitch: function (key) {
            var i18n = $i.t("courseText");
            return i18n[key];
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
        <div :style="[transSize(item), componentStyle]">
            <div v-for="dis in item.displayOptions" :key="dis" class="pointer sensor" :style="{padding:selfComputedStyle(item,10,20)}">
                <i
                    :class="['iconfont pointer', displayOptions[dis].icon]"
                    :style="{color: displayOptions[dis].color,fontSize: selfComputedStyle(item,20,14)}"
                ></i>
                <span class="pointer">{{ i18nSwitch(dis) || "" }}</span>
                <span class="pointer">{{ displayOptions[dis].value }}</span>
            </div>
        </div>
    `
})
/**
 * 传感器
 */
Vue.component("sensor", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {
            displayOptions: {
                temperature: {
                    text: "温度",
                    icon: "iconwendu1",
                    value: "29.8°c",
                    color: "#f56415"
                },
                humidity: {
                    text: "湿度",
                    icon: "iconshidu1",
                    value: "9.7rh",
                    color: "#19cad5"
                },
                co2: {
                    text: "二氧化碳",
                    icon: "iconeryanghuatan",
                    value: "436.0ppm",
                    color: "#22ade1"
                },
                pm25: {
                    text: "PM2.5",
                    icon: "iconpm1",
                    value: "60μg/m³",
                    color: "#5b6dab"
                },
                pm10: {
                    text: "PM1.0",
                    icon: "iconpm1",
                    value: "60μm/h",
                    color: "#5b6dab"
                },
                voc: {
                    text: "voc",
                    icon: "iconjiaquan1",
                    value: "30g/L",
                    color: "#22ade1"
                },
                hcho: {
                    text: "甲醛",
                    icon: "iconjiaquan1",
                    value: "0.08mg/m³",
                    color: "#22ade1"
                }

            },
        }
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        selfComputedStyle: function (component, minmargin, defaultSize) {
            var data = {
                component: component,
                minmargin: minmargin,
                defaultSize: defaultSize
            }

            if (this.computedStyle) {
                return this.computedStyle(data);
            }
            return;
        },
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        i18nSwitch: function (dis) {
            var i18n = $i.t("sensorText");
            return i18n[dis];
        },
        iconMarginOrSize: function (currSize, defLeft, defRight, defSize) {
            if (this.item.styleOption == 1) currSize = 20;
            defSize = defSize || 14;
            var style = {
                marginLeft: defLeft,
                marginRight: defRight,
                fontSize: currSize
            }
            for (var key in style) {
                var data = {
                    component: this.item,
                    minmargin: style[key],
                    defaultSize: defSize
                }
                style[key] = this.computedStyle(data);
            }
            return style;
        }
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        /**
         * 
         * @returns 样式为1 或者 6 数据key的左右边距  样式 不是 1 或者 6 数据的上边距
         */
        key16Margin: function () {
            var defMargin = 8;
            var defaultSize = 14;
            var data = {
                component: this.item,
                minmargin: defMargin,
                defaultSize: defaultSize
            }
            if ([1, 6, 7].indexOf(this.item.styleOption) == -1) {
                defMargin = 7;
                return {
                    marginTop: this.computedStyle(data)
                }
            };

            return {
                marginLeft: this.computedStyle(data),
                marginRight: this.computedStyle(data)
            }
        },
    },
    template: `
        <div :style="[transSize(item), componentStyle]">
            <div v-for="dis in item.displayOptions" :key="dis" class="pointer sensor" :style="{padding:selfComputedStyle(item,10,20)}">
                <div class="custom-items-center" :class="{'custom-column': [2,5,7].indexOf(item.styleOption)!=-1}">
                    <div v-show="item.styleOption == 3" class="custom-column">
                        <span class="pointer">{{ displayOptions[dis].value }}</span>
                        <span class="pointer" :style="key16Margin">{{ i18nSwitch(dis) || "" }}</span>
                    </div>
                    <i
                        v-show="item.styleOption != 5 && item.styleOption != 6"
                        :class="['iconfont pointer', displayOptions[dis].icon]"
                        :style="[iconMarginOrSize(35,7,7,14),{color: displayOptions[dis].color}]"
                    ></i>
                    <div v-show="item.styleOption != 3" class="custom-items-center" :class="{'custom-column': [1,6,7].indexOf(item.styleOption)==-1}">
                        <span class="pointer" v-show="[1,6,7].indexOf(item.styleOption)==-1">{{ displayOptions[dis].value }}</span>
                        <span class="pointer" :style="key16Margin">{{ i18nSwitch(dis) || "" }}</span>
                        <span class="pointer" v-show="[1,6,7].indexOf(item.styleOption)!=-1">{{ displayOptions[dis].value }}</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
/**
 * 考勤
 */
Vue.component("attendance", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {
            attList: [{
                    text: '实到学生',
                    num: 30,
                    icon: 'iconshidao',
                    color: '#1F96CD',
                    key: "check",
                    img5: 'ic_style_check_5_sign.png',
                    img6: 'ic_style_check_6_sign.png'
                },
                {
                    text: '迟到学生',
                    num: 20,
                    icon: 'iconchidao',
                    color: '#F59409',
                    key: "late",
                    img5: 'ic_style_check_5_late.png',
                    img6: 'ic_style_check_6_late.png'
                },
                {
                    text: '请假学生',
                    num: 15,
                    icon: 'iconqingjia',
                    color: '#1CD786',
                    key: "absence",
                    img5: 'ic_style_check_5_leave.png',
                    img6: 'ic_style_check_6_leave.png'
                },
                {
                    text: '缺勤学生',
                    num: 18,
                    icon: 'iconqueqin',
                    color: '#E52A2A',
                    key: "unCheck",
                    img5: 'ic_style_check_5_unsign.png',
                    img6: 'ic_style_check_6_unsign.png'
                },
            ],
            myEchart: null,
            echartData: [],
            echartTime: null
        }
    },
    mounted: function () {
        var item = this.item;
        if (isIncludeStyleOption(showBgComponent, item.type, item.styleOption)) this.handleEchartData();
    },
    computed: {
        childrenStyle: function () {
            var children;
            var childrenText;
            var childrenNum;
            this.item.children.forEach(function (element) {
                if (element.type == 'text') {
                    childrenText = element;
                }
                if (element.type == 'num') {
                    childrenNum = element;
                }
            });
            if (childrenNum.style.fontSize >= childrenText.style.fontSize) {
                children = childrenNum;
            } else {
                children = childrenText;
            }
            return children;
        },
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        /**
         * 
         * @returns 可以显示图标的样式
         */
        showStyleIcon: function () {
            var arr = [2, 3, 4];
            return arr.indexOf(this.item.styleOption) != -1;
        },
        styleOption5Or6ImgStyle: function () {
            var style;
            var children = this.childrenStyle;
            if (this.item.styleOption == '5') {
                style = {
                    width: 110 / 14 * children.style.fontSize + 'px',
                    height: 110 / 14 * children.style.fontSize + 'px'
                }
            }
            if (this.item.styleOption == '6') {
                style = {
                    width: 110 / 14 * children.style.fontSize + 'px',
                    height: 67 / 14 * children.style.fontSize + 'px'
                }
            }
            return style;
        },
        computedStyleOption: function () {
            return this.item.styleOption;
        },
        computedShowTitle: function () {
            return this.item.title.show;
        },
        computedItem: function () {
            var style = {
                width: this.item.style.width,
                height: this.item.style.height,
            }
            return JSON.parse(JSON.stringify(style));
        },
        computedTitle: function () {
            var title = {
                fontSize: this.item.title.style.fontSize,
                show: this.item.title.show
            }
            return JSON.parse(JSON.stringify(title));
        },
    },
    methods: {
        textStyle: function (type) {
            var children = this.item.children;
            var style = {};
            children.forEach(function (el) {
                if (type == el.type) {
                    for (var key in el.style) {
                        style[key] = key == "fontSize" ? el.style[key] + "px" : el.style[key];
                    }
                }
            });
            return style;
        },
        transSize: function (item) {
            var size = this.childrenStyle.style.fontSize
            return this.transForm(size)
        },
        selfComputedStyle: function (component, minmargin, defaultSize) {
            var data = {
                component: component,
                minmargin: minmargin,
                defaultSize: defaultSize
            }

            if (this.computedStyle) {
                return this.computedStyle(data);
            }
            return;
        },
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        i18nSwitch: function (index) {
            var i18n = $i.t("attendanceDOs");
            return i18n[index];
        },
        styleOption45ImgSrc: function (src) {
            return this.$global.fullStaticUrl("public/images/admin/control/" + src);
        },
        /**
         * 
         * @param {*} defLeft 默认左边距
         * @param {*} defTop 默认上边距
         * @param {*} defSize 默认字体大小
         * @returns 文本边距样式
         */
        optionValueStyle: function (defLeft, defTop, defSize) {
            var dataLeft = {
                component: this.childrenStyle,
                minmargin: defLeft,
                defaultSize: defSize
            }
            var dataTop = {
                component: this.childrenStyle,
                minmargin: defTop,
                defaultSize: defSize
            }
            if (this.computedStyle) {
                var left = this.computedStyle(dataLeft);
                var top = this.computedStyle(dataTop);

                return {
                    marginTop: left,
                    marginLeft: top
                }
            }
        },
        /**
         * 
         * @param {*} currSize 
         * @param {*} defLeft 
         * @param {*} defRight 
         * @param {*} defSize 
         * @returns 图标边距字体样式
         */
        iconStyle: function (currSize, defLeft, defRight, defSize) {
            var children = this.childrenStyle;
            defSize = defSize || 14;
            if (this.item.styleOption == 3) defRight = 0;
            if (this.item.styleOption == 4) defLeft = 0;
            var initData = {
                fontSize: currSize,
                marginLeft: defLeft,
                marginRight: defRight
            }
            for (var key in initData) {
                var obj = {
                    component: children,
                    minmargin: initData[key],
                    defaultSize: defSize,
                }
                initData[key] = this.computedStyle(obj);
            }
            return initData
        },
        handleEchartData: function () {
            var arr = [];
            this.total = 0;
            this.attList.forEach(function (item) {
                this.total += item.num;
            });
            var attList = this.attList;
            attList.forEach(function (item, index) {
                color = {
                    check: ["#3DF9DF", "#4F86FC"],
                    late: ["#F9A737", "#FDCE69"],
                    absence: ["#2FD790", "#71F0BA"],
                    unCheck: ["#A781F8", "#C19EFB"],
                    actual: ["#F9A737", "#FDCE69"],
                }
                var itemStyleColor = {
                    type: 'linear',
                    colorStops: [{
                        offset: 0, color: color[item.key][0] // 0% 处的颜色
                    }, {
                        offset: 1, color: color[item.key][1] // 100% 处的颜色
                    }],
                    global: false // 缺省为 false
                }
                var obj = {
                    value: item.num,
                    name: $i.t("attendanceDOs")[index],
                    itemStyle: {
                        color: itemStyleColor
                    }
                };
                arr.push(obj);
            });
            this.echartData = arr;
            if (isIncludeStyleOption(showBgComponent, this.item.type, this.item.styleOption)) this.initEchart();
        },
        initEchart: function () {
            var chartDom = document.getElementById('attendance-echart');
            this.myEchart = echarts.init(chartDom);
            var option;
            
            option = {
                title: {
                    text: $i.t("ComponentList.attendance"),
                    left: "center",
                    top: "center",
                    textStyle: {
                        fontSize: 14,
                        color: "#fff"
                    },
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    left: 'center',
                    bottom: 20,
                    textStyle: {
                        color: "#A0A3BE"
                    },
                    itemWidth: 10,  // 设置宽度
                    itemHeight: 10, // 设置高度
                    icon: "circle"
                },
                series: [
                    {
                        name: $i.t("componentText.attendance"),
                        selectedMode: 'multiple',
                        type: 'pie',
                        radius: ['45%', '65%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: [0, 0, 0, 0]
                        },
                        tooltip: {
                            trigger: "item",
                            formatter: function (params) {
                                return $i.t("attendanceDOs")[params.dataIndex] + "（" + params.value + "）"
                            }
                        },
                        label: {
                            show: true,
                            position: 'inner',
                            formatter: function (params) {
                                return params.value == 0 ? "0%" : Math.round(params.value / 50 * 100) + "%"
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: this.echartData
                    }
                ]
            };
            
            option && this.myEchart.setOption(option);
        }
    },
    watch: {
        computedStyleOption: function (val) {
            if (isIncludeStyleOption(showBgComponent, this.item.type, val)) {
                this.handleEchartData();
            } else {
                if (this.myEchart) this.myEchart.dispose();
            }
        },
        computedItem: function (newVal, oldVal) {
            if (newVal.width != oldVal.width || newVal.height != oldVal.height) {
                if (!isIncludeStyleOption(showBgComponent, this.item.type, this.item.styleOption)) return;
                var _this = this;
                if (this.echartTime) {
                    clearTimeout(this.echartTime);
                    this.echartTime = null;
                }
                this.echartTime = setTimeout(function () {
                    _this.myEchart.dispose();
                    _this.$nextTick(function () {
                        _this.initEchart();
                    })
                }, 200);
            }
        },
        "$i18n.locale": function () {
            this.handleEchartData();
        },
        computedTitle: function () {
            if (!isIncludeStyleOption(showBgComponent, this.item.type, this.item.styleOption)) return;
            this.myEchart.dispose();
            var _this = this;
            setTimeout(function () {
                _this.initEchart();
            }, 200);
        }
    },
    template: `
        <div :style="[transSize(item), componentStyle]">
            <template v-if="!isIncludeStyleOption(showBgComponent, item.type, item.styleOption)">
                <div v-for="(att,i) in attList" :key="att.icon" class="pointer custom-items-center custom-column att-list" :style="{padding:selfComputedStyle(item,10,20)}">
                    <div v-if="item.styleOption != 5 && item.styleOption != 6" :class="{'custom-items-center': item.styleOption != 2,'custom-column custom-items-center': item.styleOption == 2}">
                        <div v-if="item.styleOption == 3 || item.styleOption == 1" :class="{'custom-column custom-items-center': item.styleOption != 1}">
                            <span class="pointer text" :style="textStyle('text')">{{ i18nSwitch(i) }}</span>
                            <span class="pointer num" :style="textStyle('num')">{{ att.num }}</span>
                        </div>
                        <i :class="['iconfont pointer', att.icon]" :style="[iconStyle(22,5,5,14),{ color: att.color }]"  v-if="showStyleIcon"></i>
                        <div v-if="item.styleOption == 4 || item.styleOption == 2" class="custom-column custom-items-center">
                            <span class="pointer text" :style="textStyle('text')">{{ i18nSwitch(i) }}</span>
                            <span class="pointer num" :style="textStyle('num')">{{ att.num }}</span>
                        </div>
                    </div>
                    <div v-else>
                        <div class="attendance-styleOption-bg custom-relative" :style="styleOption5Or6ImgStyle">
                            <img class="wh100" :src="styleOption45ImgSrc(att['img' + item.styleOption])">
                            <div class="custom-absolute styleOption45 custom-column">
                                <span class="pointer text" :style="[textStyle('text'),optionValueStyle(12,11,14)]">{{ i18nSwitch(i) }}</span>
                                
                                <span class="pointer num" :style="[textStyle('num'),optionValueStyle(12,14,14)]">{{ att.num }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <div id="attendance-echart" class="custom-absolute wh100"></div>
        </div>
    `
})
/**
 * 场景模式
 */
Vue.component("model", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template:
        // `
        //     <div :style="[transSize(item), componentStyle]">
        //         <apsn class="pointer">课室场景模式 当前可显示模式数量{{ item.styleOption }}</apsn>
        //     </div>
        // `
        "<div :style=\"[transSize(item), componentStyle]\">" +
        "            <apsn class=\"pointer\">课室场景模式 当前可显示模式数量{{ item.styleOption }}</apsn>" +
        "        </div>"
})
/**
 * 护眼灯
 */
Vue.component("lamp", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template:
        // `
        //     <div :style="[transSize(item), componentStyle]">
        //         <span class="pointer">护眼灯控制 当前可显示护眼灯数量{{ item.styleOption }}</span>
        //     </div>
        // `
        "<div :style=\"[transSize(item), componentStyle]\">" +
        "            <span class=\"pointer\">护眼灯控制 当前可显示护眼灯数量{{ item.styleOption }}</span>" +
        "        </div>"
})

/**
 * 电箱
 */
Vue.component("electric", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["drop"],
    data: function () {
        return {
            electricList: [{
                    name: "灯光",
                    relayStatus: 1,
                    voltage: 228240,
                    power: 0,
                    temperature: 37,
                    current: 0,
                    status: 0,
                    id: "01",
                    instructList: [{
                        afterCourseCloseTime: null,
                        beforeCourseOpenTime: 0,
                        createTime: 1651739892000,
                        enableAfterCourseClose: 0,
                        enableBeforeCourseOpen: 0,
                        id: 122,
                        instructCbValue: "CB-01-OPEN",
                        instructValue: "ID-01-OPEN",
                        label: "on",
                        name: "ON",
                        propertyButtonId: 108,
                        propertyId: 270,
                        tenantId: "000004",
                        updateTime: 1651739892000
                    }]
                },
                {
                    name: "筒灯",
                    relayStatus: 1,
                    voltage: 228240,
                    power: 0,
                    temperature: 37,
                    current: 0,
                    status: 0,
                    id: "02",
                    instructList: []
                },
                {
                    name: "灯光",
                    relayStatus: 0,
                    voltage: 228874,
                    power: 0,
                    temperature: 36,
                    current: 0,
                    status: 0,
                    id: "03",
                    instructList: []
                },
                {
                    name: "饮水机",
                    relayStatus: 0,
                    voltage: 228520,
                    power: 0,
                    temperature: 37,
                    current: 0,
                    status: 0,
                    id: "04",
                    instructList: []
                },
                {
                    name: "饮水机",
                    relayStatus: 0,
                    voltage: 0,
                    power: 0,
                    temperature: 37,
                    current: 0,
                    status: 0,
                    id: "05",
                    instructList: []
                },
                {
                    name: "插座",
                    relayStatus: 0,
                    voltage: 229636,
                    power: 0,
                    temperature: 37,
                    current: 0,
                    status: 0,
                    id: "06",
                    instructList: []
                },
                {
                    name: "灯光",
                    relayStatus: 0,
                    voltage: 229285,
                    power: 0,
                    temperature: 37,
                    current: 0,
                    status: 0,
                    id: "07",
                    instructList: []
                }
            ],
        }
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
        _addUnit(val, unit) {
            if (isNaN(val)) {
                return 0 + unit;
            }
            return val + unit;
        },
        turnValue(item, key) {
            var add = this._addUnit;
            var obj = {
                relayStatus: this.getBtnTextByRelayStatus(item),
                voltage: add((item[key] / 1000).toFixed(2), 'v'),
                power: add(item[key], 'w'),
                temperature: add(item[key], '℃'),
                current: add((item[key] / 1000).toFixed(2), 'A'),
                shortCircuits: add(item[key], '次')
            }
            for (var k in obj) {
                if (key == k) return obj[k]
            }
            return item[key] || $i.t("roomStatus")[0][2];

        },
        getBtnTextByRelayStatus: function (record) { //根据当前的开关状态和指令列表显示
            var isOpen = record.relayStatus == 1;
            var instructList = record.instructList || [];
            var label = isOpen ? "on" : "off";
            var find = this.findByKeyValue(instructList, "label", label);
            return find == null ? label.toUpperCase() : find.name;
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
        controlClass: function (el, key) {
            if (key != "relayStatus") return "";
            var isOpen = el.relayStatus == 1;
            var className = isOpen ? "on" : "off";
            return className + " control";
        }
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        sizeStyle: function () {
            var minStyle = this.drop.minStyle();
            var width = this.item.style.width;
            var height = this.item.style.height;
            var style;
            var defaulWidth = 350;
            var defaultHeight = 200;
            if (this.activetable == 2) {
                defaulWidth = 650;
                defaultHeight = 300;
            }
            if (width > height) {
                style = {
                    fontSize: Math.floor(20 / defaulWidth * height * minStyle) + 'px'
                }
            } else {
                style = {
                    fontSize: Math.floor(20 / defaultHeight * width * minStyle) + 'px'
                }
            }
            return style
        },
        componentTextStyle: function () {
            var obj = {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }
            return obj[this.item.style.textAlign] || "center";
        },
        titleList: function () {
            return $i.t("electricTitleList");
        }
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                <div class="electric custom-column wh100">
                    <div class="dev-title custom-items-center custom-justify-between" :class="{'border-dedede': item.styleOption == 1}">
                    <div class="dev-item" :style="sizeStyle">
                        <div v-for="(el, key) in titleList" :key="key" class="custom-items-center" 
                        :class="{'border-none': item.styleOption == 2}"
                        :title="el"
                        :style="{'justify-content': componentTextStyle}">
                            <span class="w100 custom-ellipsis">{{ el }}</span>
                        </div>
                    </div>
                    </div>
                    <div class="table-body" :class="{'electric-table-body-2': item.styleOption == 2}">
                        <el-scrollbar class="custom-scrollbar">
                            <div class="dev-list custom-column">
                                <template v-if="item.styleOption == 1">
                                    <div class="flex-shrink-0 custom-column">
                                        <div
                                            class="dev-item custom-items-center custom-justify-between"
                                            v-for="el in electricList"
                                            :key="el.id"
                                            :style="sizeStyle"
                                        >
                                            <div 
                                                v-for="(item, key) in titleList" 
                                                :key="'li' + key" class="custom-items-center" 
                                                :title="turnValue(el, key)"
                                                :style="{'justify-content': componentTextStyle}"
                                                :class="controlClass(el,key)" 
                                            >
                                                <span class="w100 custom-ellipsis">{{ turnValue(el, key) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <template v-if="item.styleOption == 2">
                                    <div class="custom-column dev-item-box-2">
                                        <div
                                            class="dev-item border-none"
                                            v-for="el in electricList"
                                            :key="el.id"
                                            :style="sizeStyle"
                                        >
                                            <div class="w100 custom-items-center custom-justify-between dev-item-container">
                                                <div 
                                                    v-for="(item, key) in titleList" 
                                                    :key="'li' + key" class="custom-items-center border-none" 
                                                    :title="turnValue(el, key)"
                                                    :style="{'justify-content': componentTextStyle}"
                                                >
                                                    <span class="w100 custom-ellipsis w70 custom-flex-center" :class="controlClass(el,key)">{{ turnValue(el, key) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </el-scrollbar>
                    </div>
                </div>
            </div>
        `
})
/**
 * 中控控制
 */
Vue.component("control", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template:
        //  `
        //     <div :style="[transSize(item), componentStyle]">
        //         {{ $i.t("componentText[3]") }}
        //     </div>
        // `
        "<div :style=\"[transSize(item), componentStyle]\">" +
        "            {{ $i.t(\"componentText.control\") }}" +
        "        </div>"
})
/**
 * 房间设备
 */
Vue.component("room", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["drop"],
    data: function () {
        return {
            activetable: 0,
            headerList: [{
                    text: "设备状态",
                    value: 0
                },
                {
                    text: "今日预警",
                    value: 1
                },
                {
                    text: "今日工单",
                    value: 2
                },
            ],
            titleList: [{
                    text: "设备",
                    value: 0
                },
                {
                    text: "型号",
                    value: 1
                },
                {
                    text: "IP",
                    value: 2
                },
                {
                    text: "状态",
                    value: 3
                },
            ],
            devList: [{
                    name: "中控主机",
                    type: "NET-4000",
                    IP: "192.168.2.38",
                    date: "1651915158692",
                    status: 0,
                    id: 3
                },
                {
                    name: "中控主机2",
                    type: "NET-4000",
                    IP: "192.168.2.38",
                    date: "1651915158692",
                    status: 1,
                    id: 4
                },
                {
                    name: "中控主机",
                    type: "NET-4000",
                    IP: "192.168.2.38",
                    date: "1651915158692",
                    status: null,
                    id: 5
                },
                {
                    name: "中控主机",
                    type: "NET-4000",
                    IP: "192.168.2.38",
                    date: "1651915158692",
                    status: null,
                    id: 6
                },
                {
                    name: "中控主机",
                    type: "NET-4000",
                    IP: "192.168.2.38",
                    date: "1651915158692",
                    status: null,
                    id: 7
                },
                {
                    name: "中控主机",
                    type: "NET-4000",
                    IP: "192.168.2.38",
                    date: "1651915158692",
                    status: null,
                    id: 8
                },
                {
                    name: "中控主机",
                    type: "NET-4000",
                    IP: "192.168.2.38",
                    date: "1651915158692",
                    status: null,
                    id: 9
                }
            ],
        }
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        componentTextStyle: function () {
            var obj = {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }
            return obj[this.item.style.textAlign] || "center";
        }
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        switchTableType: function (item) {
            this.activetable = item.value;
        },
        turnStatus: function (el, type) {
            var activetable = this.activetable;
            if (type == "status") {
                if (activetable != 1) {
                    return $i.t('roomStatus')[activetable][el.status] || $i.t('roomStatus')[activetable][1]
                } else {
                    return activetable == 1 ? $i.t("cctjs9")[0] : "——"
                }
            } else if (type == "ip") {
                if (activetable == 0) return el.IP;
                return el.content || "——";
            } else {
                if (activetable == 0) return el.type || "——";
                return this.$global.formatDate(Number(el.date), "HH:mm:ss");
            }
        },
        roomStatusRound(item) {
            if (this.activetable != 0) return "";
            var status = item.status != 0 ? 1 : item.status;
            var className = {
                0: "abnormal-round",
                1: "on-line-round"
            }
            return className[status];
        },
        sizeStyle: function (key, min) {
            key = key || "fontSize";
            min = min || 20;
            var minStyle = this.drop.minStyle();
            var width = this.item.style.width;
            var height = this.item.style.height;
            var style = {};
            var defaulWidth = 350;
            var defaultHeight = 200;
            if (width > height) {
                style[key] = Math.floor(min / defaulWidth * height * minStyle) + 'px';
            } else {
                style[key] = Math.floor(min / defaultHeight * width * minStyle) + 'px';
            }
            return style;
        },
    },
    template: `
    <div :style="[transSize(item), componentStyle]">
        <div class="wh100 custom-column course-container room-container" :style="{padding: item.style.borderWidth + 4 + 'px'}">
            <div class="custom-items-center">
                <div class="table-header custom-items-center" :class="{'table-header-2': item.styleOption == 2, 'custom-justify-between w100': item.styleOption == 1}">
                    <div class="header-item pointer" :class="{ 'table-active custom-success-color': activetable == he.value, }"
                        :title="$i.t('roomHeaderList')[i]"
                        v-for="(he,i) in headerList" :key="he.value" :style="sizeStyle()" @click="switchTableType(he)" >
                        <span>{{ $i.t('roomHeaderList')[i] }}</span>
                    </div>
                </div>
            </div>

            <div class="table-body" :class="{'table-body-2 border-none': item.styleOption == 2}">
                <el-scrollbar class="custom-scrollbar">
                    <div class="dev-list custom-column">
                        <div class="dev-item custom-items-center custom-justify-between" :style="sizeStyle()" >
                            <div v-for="(el,i) in titleList" :key="el.id" :style="{'justify-content': componentTextStyle}">{{ $i.t('roomTitleList')[activetable][i] }}</div>
                        </div>
                        <div class="dev-item custom-items-center custom-justify-between" :class="{'border-none': item.styleOption == 2 && elI != 0}" v-for="(el, elI) in devList"
                         :key="el.id" :style="sizeStyle()" >
                            <div :style="{'justify-content': componentTextStyle}">
                                <span class="w100 custom-ellipsis">{{ el.name }}</span>
                            </div>
                            <div :style="{'justify-content': componentTextStyle}">
                                <span class="w100 custom-ellipsis">{{ turnStatus(el,"type") }}</span>
                            </div>
                            <div :style="{'justify-content': componentTextStyle}">
                                <span class="w100 custom-ellipsis">{{ turnStatus(el,"ip") }}</span>
                            </div>
                            <div :style="{'justify-content': componentTextStyle}">
                                <span class="room-status-round custom-relative" :style="[sizeStyle('width',10),sizeStyle('height',10)]" :class="roomStatusRound(el)"></span>
                                <span class="w90 custom-ellipsis room-round-text">{{ turnStatus(el,"status") }}</span>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </div>
    `
})
/**
 * 安全用电
 */
Vue.component("security", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    template:
        // `
        // <div :style="transSize(item)">
        // {{ $i.t("componentText[9]") }}
        // </div>
        // `
        "<div :style=\"transSize(item)\">" +
        "            {{ $i.t(\"componentText[9]\") }}" +
        "        </div>"
})
/**
 * iot
 */
Vue.component("iot", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
        <div :style="[transSize(item),componentStyle]">
            {{ $i.t("componentText.iot") }}
        </div>
        `
})
/**
 * 红外控制器
 */
Vue.component("controller", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
            <div :style="[transSize(item),componentStyle]">
                {{ $i.t("componentText.controller") }}
            </div>
        `
})

/**
 * 矩形组件
 */
Vue.component("rectangle", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
            <div :style="[transSize(item),componentStyle]"></div>
        `
})

/**
 * 地点组件
 */
Vue.component("location", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                {{ $t("componentText")[item.type] }}
            </div>
        `
})
/**
 * 静态文本
 */
Vue.component("static-text", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                <el-scrollbar class="custom-scrollbar">
                    <div class="w100">{{ item.style.text }}</div>
                </el-scrollbar>
            </div>
        `
})

/**
 * IP对讲
 */
Vue.component("ip-intercom", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                {{ $t("componentText")[item.type] }}
            </div>
        `
})

/**
 * 远程协助
 */
Vue.component("remote-assistance", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {

        }
    },
    inject: ["drop"],
    mounted: function () {

    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
        <div :style="[transSize(item), componentStyle]" class="custom-column">
            <div class="w100 component-bg-image-box" :style="item.styleOption == 2 && item.title.show ? drop.dynamicSize(item, paddingNum[item.type], 446, 322, 'paddingLeft') : ''">
                <div class="wh100 custom-flex-center" :class="{'is-bg': isIncludeStyleOption(showBgComponent, item.type, item.styleOption)}">
                    <i :style="drop.dynamicSize(item, 40, 446, 322)" class="iconfont icon24gf-play"></i>
                </div>
            </div>
        </div>
    `
})

/**
 * 功能按钮
 */
Vue.component("function-button", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {

        }
    },
    mounted: function () {

    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        buttonText: function () {
            return $i.t("functionButtonText")[this.item.radio];
        }
    },
    template: `
        <div :style="[transSize(item), componentStyle]">
            <span class="custom-ellipsis" :title="buttonText">{{ buttonText }}</span>
        </div>
    `
})

/**
 * 按钮
 */
 Vue.component("my-button", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {

        }
    },
    mounted: function () {

    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        buttonText: function () {
            return $i.t("myButtonText")[this.item.radio];
        }
    },
    template: `
        <div class="static-text" :style="[transSize(item), componentStyle]">
            <el-scrollbar class="custom-scrollbar">
                <div class="w100">{{ item.style.text || item.text}}</div>
            </el-scrollbar>
        </div>
    `
})

/**
 * 空调
 */
 Vue.component("air-conditioning-control", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                {{ $t("componentText")[item.type] }}
            </div>
        `
})

/**
 * 摄像头
 */
 Vue.component("camera-control", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                
            </div>
        `
})

/**
 * 天气
 */
 Vue.component("weather", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {
            list: [
                {value: "today"},
                {value: "envValue", label: "envLabel"},
                {value: "tomorrow"},
                {value: "dayAfterTomorrows"},
            ]
        }
    },
    inject: ["drop"],
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
        computedStyle: function (item, size, defaultSize, key) {
            var fontSize = item.style.fontSize;
            return {
                [key]: Math.floor(fontSize * size / defaultSize) + 'px'
            }
		},
        getDateWeek: function (index) {
            var newDate = new Date();
            index = (index + 2) + 1;
            var week = moment(newDate).add(index, "days")._d.getDay();
            if (week == 0) week = 7;
            return $i.t("tableWeeks")[week - 1];
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        iconFontSize: function () {
            var item = this.item;
            return {
                fontSize: item.style.fontSize + "px"
            }
        },
        styleOption: function () {
            return this.item.styleOption
        },
        notEnv: function () {
            var list = this.list.filter(function (item) {
                return item.value != "envValue";
            })
            return list;
        },
        styleOption56List: function () {
            if (this.styleOption == 5) return this.notEnv;
            return this.list;
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]" class="custom-items-center weather-component">
                <template v-if="styleOption == 1">
                    <div class="weather-item custom-column" v-for="(el, elI) in notEnv" :key="el.value" :style="elI != notEnv.length ? computedStyle(item, 10, 14, 'marginRight') : {}">
                        <div>{{ $i.t("weatherData")[el.value] }}</div>
                        <div class="weather-icon__text custom-items-center" :style="computedStyle(item, 10, 14, 'marginTop')">
                            <i class="iconfont icontianqi" :style="computedStyle(item, 18, 14, 'fontSize')"></i>
                            <span :style="iconFontSize">{{ $i.t("weatherData.sunny") }}18℃/28℃</span>
                        </div>
                    </div>
                </template>
                <div class="custom-items-center" v-if="styleOption == 2 || styleOption == 3">
                    <i v-if="styleOption == 3" class="iconfont icontianqi" :style="computedStyle(item, 20, 14, 'fontSize')"></i>
                    <span :style="computedStyle(item, 5, 14, 'marginLeft')">{{ $i.t("weatherData.sunny") }} 18℃/28℃</span>
                </div>
                <div class="weather-styleoption__4 flex" v-if="styleOption == 4">
                    <i class="iconfont icontianqi" :style="computedStyle(item, 30, 14, 'fontSize')"></i>
                    <div class="custom-column" :style="computedStyle(item, 5, 14, 'marginLeft')">
                        <span>{{ $i.t("weatherData.sunny") }}</span>
                        <span>18℃/28℃</span>
                    </div>
                </div>
                <template v-if="styleOption == 5 || styleOption == 6 || styleOption == 7">
                    <div class="custom-column weather-styleoption__56" v-for="(el, elI) in styleOption56List" :style="elI != notEnv.length ? computedStyle(item, 10, 14, 'marginRight') : {}" :key="el.value">
                        <template v-if="el.value != 'envValue'">
                            <span>{{ $i.t("weatherData")[el.value] }}</span>
                            <i class="iconfont icontianqi" :style="[computedStyle(item, 18, 14, 'fontSize'), computedStyle(item, 3, 14, 'marginTop'), computedStyle(item, 3, 14, 'marginBottom')]"></i>
                            <span style="computedStyle(item, 3, 14, 'marginBottom')">{{ $i.t("weatherData.sunny") }}</span>
                            <span>18℃/28℃</span>
                        </template>
                        <template v-else>
                            <div>
                                <span>{{ $i.t("weatherData")[el.label] }}：</span>
                                <span>151{{ $i.t("weatherData")[el.value] }}</span>
                            </div>
                            <div>
                                <span>{{ $i.t("sensorText.humidity") }}：</span>
                                <span>50%</span>
                            </div>
                        </template>
                    </div>
                    <template v-if="styleOption == 7">
                        <div class="custom-column weather-styleoption__56" v-for="(el, elI) in 2" :style="computedStyle(item, 10, 14, 'marginLeft')" :key="el.value">
                            <span>{{ getDateWeek(elI) }}</span>
                            <i class="iconfont icontianqi" :style="[computedStyle(item, 18, 14, 'fontSize'), computedStyle(item, 3, 14, 'marginTop'), computedStyle(item, 3, 14, 'marginBottom')]"></i>
                            <span style="computedStyle(item, 3, 14, 'marginBottom')">{{ $i.t("weatherData.sunny") }}</span>
                            <span>18℃/28℃</span>
                        </div>
                    </template>
                </template>
            </div>
        `
})

/**
 * 线条
 */
Vue.component("my-line", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["drop"],
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        linStyle: function () {
            var componentStyle = this.componentStyle;
            if (!componentStyle.width) return;
            var item = this.item,
                style = {},
                borderWidth = item.style.borderWidth * 1,
                width = (componentStyle.width.replace("px", "")) * 1,
                height = (componentStyle.height.replace("px", "")) * 1;
            if (width >= height) {
                style.width = width + "px";
                style.height = "1px";
                style.borderTopWidth = borderWidth + "px";
                style.borderTopColor = item.style.borderColor;
                style.borderTopStyle = item.style.borderStyle;
            } else {
                style.height = height + "px";
                style.width = "1px";
                style.borderLeftWidth = borderWidth + "px";
                style.borderLeftColor = item.style.borderColor;
                style.borderLeftStyle = item.style.borderStyle;
            }
            return style;
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                <div :style="linStyle" class="custom-absolute"></div>
            </div>
        `
})

/**
 * 日期
 */
 Vue.component("date", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        styleOption: function () {
            return this.item.styleOption;
        },
        currDate: function () {
            var date = new Date(),
                styleOption = this.styleOption,
                format = {
                    0: "YYYY-MM-DD",
                    1: "YYYY/MM/DD",
                    2: "YYYY年MM月DD日",
                    3: "YYYY-MM-DD",
                    4: "YYYY/MM/DD",
                    5: "YYYY年MM月DD日",
                },
                week = date.getDay() == 0 ? 7 : date.getDay();

            var newDate = this.$global.formatDate(date, format[styleOption - 1]);
            if (styleOption <= 3) return newDate;
            return newDate + " " + $i.t("weeks")[week - 1];
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                <div>{{ currDate }}</div>
            </div>
        `
})

/**
 * 时间
 */
Vue.component("datetime", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
        componentStyle: function () {
            if (this.item.customStyle) return this.item.customStyle;
            return this.componentWHLT(this.item);
        },
        styleOption: function () {
            return this.item.styleOption;
        },
        currTime: function () {
            var date = new Date(),
                styleOption = this.styleOption,
                format = {
                    0: "HH:mm",
                    1: "HH:mm:ss",
                    2: "a HH:mm",
                    3: "a HH:mm:ss",
                };

            var time = this.$global.formatDate(date, format[styleOption - 1]);
            if (styleOption >= 3) {
                return time.replace(/pm|am/, function (val) {
                    return val == 'pm' ? val = $i.t('afternoon') : $i.t('morning')
                });
            }

            return time;
        },
        styleOption5Style: function () {
            var style = {};
            for (var key in this.componentStyle) {
                style[key] = this.componentStyle[key].replace("px", "");
            }
            var borderWidth = this.item.style.borderWidth * 2;
            var  width = style.width - borderWidth,
                height = style.height - borderWidth;

            var min = Math.min(width, height);
            return {
                width: min + "px",
                height: min + "px"
            }
        },
    },
    template: `
            <div :style="[transSize(item), componentStyle]">
                <div v-if="styleOption != 5">{{ currTime }}</div>
                <div v-else :style="styleOption5Style">
                    <img class="wh100" :src="$global.fullStaticUrl('public/images/admin/control/time1.png')" />
                </div>
            </div>
        `
})











//------------------------------------ 控制中心 ------------------------------

/**
 * 视频播放
 */
Vue.component("button-video-display", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {
            videoObject: {
                video: "", //视频地址
                id: "",
            },
            showSelect: false,
            hls: null,
            flvPlayer: null,
            streamList: [],
            videoDisplay: false,
            videoPlay: true,
        }
    },
    inject: ["central"],
    mounted: function () {
        this.getStreams();
    },
    methods: {
        changeStreamSelect: function (val) {
            this.destroyFlvPlayer()
            var id = id || this.videoObject.id;
            var url = this.streamList.filter(function (item) {
                return item.id == id;
            })[0].stream;
            this.videoObject.video = url || (this.streamList.length > 0 ? this.streamList[0].stream : null);
            this.$nextTick(function () {
                this.changePlayVideo(url);
            })
        },
        getStreams: function () {
            // /screenManager/api/control-template/streams
            var placeId = this.placeId,
                _this = this,
                url = "/api/control-template/streams?placeId=" + placeId;
            var config = {
                loading: {
                    context: this,
                    target: "videoDisplay"
                },
                showError: false,
            }
            this.videoObject.video = "";
            // var config = {
            //     liveSyncDurationCount: 0,
            // };
            // this.hls = this.hls || new Hls(config);
            this.streamList = [];
            this.$http.get(url, null, config).then(function (res) {
                console.log(res);
                var data = res.data || [];
                data.forEach(function (el, index) {
                    el.id = index;
                    _this.streamList.push(el);
                });
                _this.streamList = data;
                _this.central.streamList = data;
                // _this.streamList.push({
                //     name: "测试",
                //     id: 99,
                //     stream: "https://cdn.theguardian.tv/HLS/2015/07/20/150716YesMen.m3u8"
                // }, {
                //     name: "测试flv",
                //     id: 97,
                //     stream: "https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv"
                // }, {
                //     name: "测试flv1",
                //     id: 96,
                //     stream: "http://139.9.50.173:8077/live?port=1935&app=live&stream=cam2"
                // }, {
                //     name: "测试f",
                //     id: 111,
                //     stream: "https://sample-videos.com/video123/flv/720/big_buck_bunny_720p_2mb.flv"
                // }, {
                //     name: "测试xs",
                //     id: 98,
                //     stream: "http://hls01open.ys7.com/openlive/8197ca98192c4502820b763a4c0f1dec.m3u8"
                // }, {
                //     name: "111",
                //     id: 100,
                //     stream: "http://hls01open.ys7.com/openlive/8197ca98192c4502820b763a4c0f1dec.m3u8"
                // })
                _this.showSelect = _this.streamList.length > 1;


            })

        },
        isFlvUrl: function (url) { //是否flv链接        
            if (url == null) {
                return false;
            }

            //判断文件后缀是否mp4、mov、m4v、mkv
            url = this.$global.getUrlWithoutQuery(url);
            if (this.$global.isAllowSuffix(url, ["mp4", "mov", "m4v", "mkv", "m3u8"])) {
                return false;
            }

            //判断是否以rtsp://,rtmp://开头
            url = url.toLowerCase();
            if (url.indexOf("rtmp://") == 0 || url.indexOf("rtsp://") == 0) {
                return false;
            }
            return true;
        },
        flvPlay: function (url) {
            //使用flvjs播放
            url = url || this.videoObject.video;
            this.destroyFlvPlayer();
            var videoEle = this.$refs.video;
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
                this.flvPlayer = flvPlayer;
            }
        },
        destroyFlvPlayer: function () {
            //暂停flv播放器的播放
            if (this.flvPlayer) {
                this.flvPlayer.pause();
                this.flvPlayer.unload();
                this.flvPlayer.detachMediaElement();
                this.flvPlayer.destroy();
                this.flvPlayer = null;
            }
        },
        initHlsVideo: function () {
            if (this.isFlvUrl(this.videoObject.video)) return this.flvPlay();
            var config = {
                liveSyncDurationCount: 0,
            };
            var video = this.$refs.video || document.getElementById('video');
            var videoSrc = this.videoObject.video;
            if (Hls.isSupported()) {
                this.hls = this.hls || new Hls(config);
                this.hls.loadSource(videoSrc);
                this.hls.attachMedia(video);
                this.hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
            } else if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoSrc;
                video.addEventListener('canplay', function () {
                    video.play();
                });
            }
        },
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        visibleChange: function (value) {
            this.$refs.videoSelect.style.opacity = value ? 1 : 0;
        },
        changePlayVideo: function () {
            this.videoPlay = false;
            if (this.videoObject.video !== null) {
                this.initHlsVideo()
            }
        },
        clickPlay: function () {
            var curr = this.streamList.length > 0 ? this.streamList[0] : null;
            this.videoObject.video = curr.stream || null;
            this.videoObject.id = curr.id;
            this.changeStreamSelect();
        }
    },
    computed: {
        videoBoxStyle: function () {
            // var style = this.item.style;
            // var height = this.showSelect ? (Number(style.height) - 30) : style.height;
            // return {
            //     width: "100%",
            //     height: height + "px"
            // }
            var style = {};
            if (this.item.styleOption == 2 && this.item.title.show) {
                style = this.central.dynamicSize(this.item, paddingNum[this.item.type], null, null, 'paddingLeft');
            }
            return style;
        },
        placeId: function () {
            return this.central.placeId;
        },
        isFlv: function () { //判断是否flv直播流
            var url = this.videoObject.video;
            return this.isFlvUrl(url);
        },
    },
    watch: {
        placeId: function (val) {
            this.getStreams();
            this.videoPlay = true;
        }
    },
    beforeDestroy: function () {
        if (this.hls) {
            var video = this.$refs.video || document.getElementById('video');
            video.pause();
            this.hls.destroy();
            this.hls = null;
        }
        this.destroyFlvPlayer(); // 离开页面销毁监控的请求
    },
    template: `
        <div v-loading="videoDisplay" class="button-video-display" :style="videoBoxStyle">
            <div class="video-select" v-show="item.styleOption == 1" :class="{'video-active': showSelect}" ref="videoSelect">
                <span class="video-select-label">{{ $i.t("cctjs6") }}：</span>
                <el-select v-model="videoObject.id" :placeholder="$i.t('tipsText[0]')"
                @visible-change="visibleChange"
                    @change="changeStreamSelect(null)">
                    <el-option v-for="(li, liI) in streamList" 
                        :key="'stream' + liI"
                        :value="li.id" 
                        :label="li.name"
                    ></el-option>
                </el-select>
            </div>
            <div class="wh100 video-canvas-box" :class="item.styleOption != 2 ? 'video-box' : ''" >
                <video
                id="video"
                ref="video"
                class="video wh100"
                :src="videoObject.video"
                controls
                muted
                v-show="streamList.length && !videoPlay"
                ></video>
                <div class="component-video-placeholder custom-flex-center wh100" v-if="!streamList.length">
                    {{ $i.t("ccjs2") }}
                </div>
                <div class="video-play custom-flex-center wh100" v-show="videoPlay && streamList.length">
                    <i class="iconfont iconbofang" @click="clickPlay(null)"></i>
                </div>
            </div>
        </div>
        `
})
/**
 * 课程表
 */
Vue.component("button-course-table", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function,
        minStyle: Function
    },
    data: function () {
        return {
            sectionTotal: [],
            weekTableData: [],
            chnNumChar: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
            chnUnitSection: ["", "万", "亿", "万亿", "亿亿"],
            chnUnitChar: ["", "十", "百", "千"],
            activetable: 0,
            tableData: {
                title: {
                    value: "",
                },
                date: {
                    value: "",
                },
                nickname: {
                    value: "",
                },
                attendance: {
                    icon: "iconshujutongji",
                    value: {
                        total: {
                            value: 0,
                            color: "#0095E8"
                        },
                        check: {
                            value: 0,
                            color: "#53EF8C"
                        },
                        late: {
                            value: 0,
                            color: "#FF4F4F"
                        },
                        unCheck: {
                            value: 0,
                            color: "#FFD664"
                        },
                        absence: {
                            value: 0,
                            color: "#C547E8"
                        },
                    },
                    color: "#22ade1",
                    type: ["attendance", "attendanceDetail"]
                },
            },
            course: false,
            weekMax: 0
        }
    },
    inject: ["central"],
    mounted: function () {
        this.getCourseNext();
    },
    methods: {
        initSectionTotal: function () {
            var url = "/api/control-template/meetings/date";
            var _this = this;
            var config = {
                showError: false,
                loading: {
                    context: this,
                    target: "course"
                }
            },
            data = {
                placeId: this.placeId,
                date: this.$global.formatDate(new Date(), "YYYY-MM-DD")
            }
            this.$http.get(url, data, config).then(function (res) {
                _this.sectionTotal = res.data;
                _this.$nextTick(function () {
                    _this.$refs.tableScrollbar.update();
                })
            })
        },
        initWeekTable: function () {
            var url = "/api/control-template/meetings/week?placeId=" + this.placeId;
            var _this = this;
            var config = {
                showError: false,
                loading: {
                    context: this,
                    target: "course"
                }
            }
            this.$http.get(url, null, config).then(function (res) {
                _this.weekTableData = res.data;
                var max = 0;
                _this.weekTableData.forEach(function (item) {
                    if (item.meetings.length > max) max = item.meetings.length;
                });
                _this.weekMax = max;
                _this.$nextTick(function () {
                    _this.$refs.tableScrollbar.update();
                })
            })
        },
        // /api/control-template/course/next
        getCourseNext: function () {
            var placeId = this.placeId,
                _this = this,
                url = "/api/control-template/meeting/next?placeId=" + placeId;
            var config = {
                loading: {
                    context: this,
                    target: "course"
                },
                showError: false,
            }
            this.$http.get(url, null, config).then(function (res) {
                console.log(res);
                var data = res.data;

                var info = data.meeting;
                if (!info) return Object.assign(_this.$data.tableData, _this.$options.data().tableData);
                var detail = info.attendanceDetail;
                for (var k in _this.tableData) {
                    if (k == "attendance") {
                        for (var key in detail) {
                            _this.tableData[k].value[key].value = detail[key];
                        }
                    } else {
                        _this.tableData[k].value = info[k];
                        if (k == "date") {
                            var start = _this.$global.formatDate(info.start_time, "HH:mm");
                            var end = _this.$global.formatDate(info.end_time, "HH:mm");
                            _this.tableData[k].value = start + "~" + end;
                        }
                    }
                }
            })
        },
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        selfComputedStyle: function (component, minmargin, defaultSize) {
            var data = {
                component: component,
                minmargin: minmargin,
                defaultSize: defaultSize
            }

            if (this.computedStyle) {
                return this.computedStyle(data);
            }
            return;
        },
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        i18nSwitch: function (key, item, i) {
            if (this.activetable == 1) {
                var start = this.$global.formatDate(item.startTime, "HH:mm") || "";
                var end = this.$global.formatDate(item.endTime, "HH:mm") || "";
                return start + "~" + end;
            };
            var i18n = $i.t("meetingText");
            return i18n[key];
        },
        /**
         * 
         * @param {*} key  
         * @returns 数据转换 返回自己要的格式
         */
        turnTableValue: function (key, el) {
            if (this.activetable == 1) return el.title;
            var item = this.tableData[key];
            if (key == "attendance") {
                var keys = $i.t("attendanceDetail");
                var text = [];
                for (var k in keys) {
                    if (k != "total") {
                        var label = keys[k];
                        var value = `${label}：<span style="color: ${item.value[k].color}">${item.value[k].value || 0}</span>${$i.t("ccjs15")}`;
                        if (!isIncludeStyleOption(showBgComponent, this.item.type, this.item.styleOption)) {
                            value = label + "：" + (item.value[k].value || 0) + $i.t("ccjs15");
                        }
                        text.push(value);
                    }
                }
                var total = (item.value.check.value || 0) + (item.value.unCheck.value || 0);
                var totalText = `${$i.t("attendanceDetail").total}：<span style="color: ${item.value.total.color}">${total}</span>${$i.t("ccjs15")}`

                if (!isIncludeStyleOption(showBgComponent, this.item.type, this.item.styleOption)) {
                    totalText = $i.t("attendanceDetail").total + "：" + total + $i.t("ccjs15");
                }
                text.unshift(totalText);
                return text.join("，");
            }
            var value = item.value || "——";
            return value;
        },
        switchTableType: function (value) {
            if (value == 1) this.initSectionTotal();
            if (value == 2) this.initWeekTable();
            if (value == 0) this.getCourseNext();
            this.activetable = value;
        },
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
                    if (strIns == '一' && this.chnUnitChar[unitPos] == "十") strIns = "";
                    strIns += this.chnUnitChar[unitPos];
                    chnStr = strIns + chnStr;
                }
                unitPos++;
                section = Math.floor(section / 10);
            }
            return chnStr;
        },
        rowOne: function (row, rowI) {
            if (rowI == 0) return "row-one";
        },
        weeksValue: function (row, colI) {
            var item = row.meetings[colI - 1];
            if (!item || !item.startTime) return "";
            var start = this.$global.formatDate(item.startTime, "HH:mm") || "";
            var end = this.$global.formatDate(item.endTime, "HH:mm") || "";
            return start + "~" + end;

        },
        randomNum: function (minNum, maxNum) {
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum);
        },
    },
    computed: {
        placeId: function () {
            return this.central.placeId;
        },
        turnTableData: function () {
            var newTabledata = $i.t("meetingText");
            if (this.activetable == 1) return this.sectionTotal;
            return newTabledata;
        },
        sizeStyle: function () {
            var minStyle = this.minStyle();
            var width = this.item.style.width;
            var height = this.item.style.height;
            var style;
            var defaulWidth = 350;
            var defaultHeight = 200;
            if (this.activetable == 2) {
                defaulWidth = 650;
                defaultHeight = 300;
            }
            var size = 20 / minStyle
            if (width > height) {
                style = {
                    fontSize: Math.floor(size / defaulWidth * height * minStyle) + 'px'
                }
            } else {
                style = {
                    fontSize: Math.floor(size / defaultHeight * width * minStyle) + 'px'
                }
            }
            return style;
        },
        componentTextStyle: function () {
            var obj = {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }
            return obj[this.item.style.textAlign] || "center";
        },
        headerList: function () {
            return $i.t("courseHeaderList");
        },
    },
    watch: {
        placeId: function (val) {
            this.getCourseNext();
        },
    },
    template: `
        <div v-loading="course">
            <div class="wh100 custom-column course-container" :style="{padding: item.styleOption == 1 || item.styleOption == 3 ? item.style.borderWidth + 4 + 'px' : ''}">
                <template v-if="item.styleOption == 1 || item.styleOption == 3">
                    <div class="custom-items-center">
                        <div class="table-header custom-items-center" :class="{'table-header-3': item.styleOption == 3, 'custom-justify-between w100': item.styleOption == 1}" ref="header">
                            <div
                                class="header-item pointer"
                                :class="{
                                'table-active custom-success-color': activetable == i,
                                }"
                                v-for="(he,i) in headerList"
                                :key="i"
                                :style="sizeStyle"
                                :title="he"
                                @click="switchTableType(i)"
                            >
                                <span>{{ he }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-body custom-column custom-justify-between" :class="{'weeks-scrollbar':activetable == 2, 'table-body-3 border-none': item.styleOption == 3}">
                        <el-scrollbar class="custom-scrollbar" ref="tableScrollbar">
                            <template v-if="activetable != 2">
                                <div class="custom-t20 text-center w100" v-if="!sectionTotal.length && activetable == 1">{{ $i.t("ccjs13") }}</div>
                                <div
                                    class="custom-items-center table-body-item"
                                    v-for="(item, key) in turnTableData"
                                    :key="key"
                                    :style="sizeStyle"
                                    >
                                    <div class="body-label custom-items-center" :style="{'justify-content': componentTextStyle}">
                                        {{ i18nSwitch(key,item) }}
                                    </div>
                                    <div class="body-value custom-items-center" :style="{'justify-content': componentTextStyle}">
                                        <span v-html="turnTableValue(key, item)"></span>
                                    </div>
                                </div>
                            </template>
                            <template v-if="activetable == 2">
                                <div class="custom-t20 text-center" v-if="!weekTableData.length">{{ $i.t("ccjs14") }}</div>
                                <div
                                    :style="sizeStyle"
                                    v-for="(row, rowI) in weekTableData"
                                    :key="'row' + rowI"
                                    class="week-table-row custom-column"
                                >
                                    <div
                                        v-for="(col, colI) in weekMax"
                                        :key="'col' + colI"
                                        class="custom-flex-center"
                                        :class="colI == 0 ? 'week-table-column__one' : 'week-table-column'"
                                        :title="row[colI]"
                                        :style="{'justify-content': componentTextStyle}"
                                    >
                                        <span class="week-table-text" v-if="colI == 0">{{ $i.t("tableWeeks")[rowI] }}</span>
                                        <div v-else class="flex custom-column">
                                            <span>{{ weeksValue(row, colI) }}</span>
                                            <span class="week-table-text__title">{{  (row.meetings[colI - 1] && row.meetings[colI - 1].title) || "一" }}</span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-scrollbar>
                    </div>
                </template>

                <template  v-if="item.styleOption == 2">
                    <div class="table-body custom-column custom-justify-between table-body-2 border-none" :style="item.title.show ? central.dynamicSize(item, 38, 548, 321, 'paddingLeft') : ''">
                        <el-scrollbar class="custom-scrollbar" ref="tableScrollbar">
                            <div
                                class="custom-items-center table-body-item"
                                v-for="(item, key) in turnTableData"
                                :key="key"
                                :style="sizeStyle"
                                >
                                <div class="body-label custom-items-center" :style="{'justify-content': componentTextStyle}">
                                    {{ i18nSwitch(key,item) }}
                                </div>
                                <div class="body-value custom-items-center" :style="{'justify-content': componentTextStyle}" v-html="turnTableValue(key, item)">
                                    <span v-html="turnTableValue(key, item)"></span>
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                </template>
            </div>
        </div>
    `
})
/**
 * 课程信息
 */
Vue.component("button-course", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function,
        minStyle: Function
    },
    data: function () {
        return {
            displayOptions: {
                className: {
                    label: "班级名称:",
                    icon: "icondangqianweizhi",
                    value: "未知",
                    color: "#f56415",
                    type: ["examRoom", "clazzCustomizeName"]
                },
                instructor: {
                    label: "授课老师:",
                    icon: "iconlaoshi",
                    value: "未知",
                    color: "#19cad5",
                    type: ["invigilatorNames", "teacherCustomizeName"]
                },
                attendance: {
                    label: "出勤率:",
                    icon: "iconshujutongji",
                    value: "未知",
                    color: "#22ade1",
                    type: ["attendance"]
                },
                courseInfo: {
                    label: "课程信息:",
                    icon: "iconkechengbiao3",
                    value: "未知",
                    color: "#5b6dab",
                    type: ["name", "subjectCustomizeName"]
                },
            },
            course: false
        }
    },
    inject: ["central"],
    mounted: function () {
        this.getCourseNext();
    },
    methods: {
        // /api/control-template/course/next
        getCourseNext: function () {
            var placeId = this.placeId,
                _this = this,
                url = "/api/control-template/course/next?placeId=" + placeId;
            var config = {
                loading: {
                    context: this,
                    target: "course"
                },
                showError: false,
            }
            this.$http.get(url, null, config).then(function (res) {
                console.log(res);
                /**
                 * exam  
                 * {
                 *     课程信息: name,
                 *     授课老师: invigilatorNames,
                 *     班级名称: examRoom
                 * }
                 * 
                 *  course  
                 * {
                 *     课程信息: subjectCustomizeName,
                 *     授课老师: teacherCustomizeName,
                 *     班级名称: clazzCustomizeName
                 * }
                 */
                var data = res.data;

                if (!data.course && !data.exam) {
                    return Object.assign(_this.$data.displayOptions, _this.$options.data().displayOptions)
                };
                var info = data.course || data.exam;
                var keysData = {
                    className: info.examRoom || info.clazzCustomizeName,
                    instructor: info.invigilatorNames || info.teacherCustomizeName,
                    attendance: info.attendance,
                    courseInfo: info.name || info.subjectCustomizeName
                }

                for (var key in keysData) {
                    _this.displayOptions[key].value = keysData[key] || "未知";
                }

            })
        },
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        selfComputedStyle: function (component, minmargin, defaultSize) {
            var minStyle = this.minStyle();
            defaultSize = defaultSize / minStyle;
            var data = {
                component: component,
                minmargin: minmargin,
                defaultSize: defaultSize
            }

            if (this.computedStyle) {
                return this.computedStyle(data);
            }
            return;
        },
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        i18nSwitch: function (key) {
            var i18n = $i.t("courseText");
            return i18n[key];
        },
    },
    computed: {
        placeId: function () {
            return this.central.placeId;
        },
    },
    watch: {
        placeId: function (val) {
            this.getCourseNext();
        }
    },
    template: `
        <div v-loading="course">
            <div v-for="dis in item.displayOptions" :key="dis" class="pointer sensor" :style="{padding:selfComputedStyle(item,10,20)}">
                <i
                :class="['iconfont pointer', displayOptions[dis].icon]"
                :style="{color: displayOptions[dis].color,fontSize: selfComputedStyle(item,20,14)}"
                ></i>
                <span class="pointer">{{ i18nSwitch(dis) || "" }}：</span>
                <span class="pointer">{{ displayOptions[dis].value == "未知" ? $t("unknown") : displayOptions[dis].value }}</span>
            </div>
            
        </div>
        `
})
/**
 * 传感器
 */
Vue.component("button-sensor", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function,
        minStyle: Function
    },
    inject: ["central"],
    data: function () {
        return {
            displayOptions: {
                temperature: {
                    text: "温度",
                    icon: "iconwendu1",
                    value: "未知",
                    color: "#f56415"
                },
                humidity: {
                    text: "湿度",
                    icon: "iconshidu1",
                    value: "未知",
                    color: "#19cad5"
                },
                co2: {
                    text: "二氧化碳",
                    icon: "iconeryanghuatan",
                    value: "未知",
                    color: "#22ade1"
                },
                pm25: {
                    text: "PM2.5",
                    icon: "iconpm1",
                    value: "未知",
                    color: "#5b6dab"
                },
                // pm10: {
                //     text: "PM1.0",
                //     icon: "iconpm1",
                //     value: "",
                //     color: "#5b6dab"
                // },
                // voc: {
                //     text: "voc",
                //     icon: "iconjiaquan1",
                //     value: "",
                //     color: "#22ade1"
                // },
                hcho: {
                    text: "甲醛",
                    icon: "iconjiaquan1",
                    value: "未知",
                    color: "#22ade1"
                }

            },
            sensor: false
        }
    },
    mounted: function () {
        this.getEnvironment();
    },
    methods: {
        // /screenManager/api/control-template/environment
        getEnvironment: function () {
            var placeId = this.placeId,
                _this = this,
                url = "/api/control-template/environment?placeId=" + placeId;
            var config = {
                showError: false,
                loading: {
                    context: this,
                    target: "sensor"
                }
            }
            this.$http.get(url, null, config).then(function (res) {
                console.log(res);
                var company = {
                    temperature: "℃",
                    humidity: "%",
                    co2: "pm2.5",
                    pm25: "ppm",
                    hcho: "mg/m³"
                };
                var data = res.data;
                for (var key in _this.displayOptions) {
                    var dataV = data[key] || 0;
                    var companyV = company[key] || "";
                    _this.displayOptions[key].value = companyV ? dataV + companyV : "未知";
                }

            })
        },
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        selfComputedStyle: function (component, minmargin, defaultSize) {
            var minStyle = this.minStyle();
            defaultSize = defaultSize / minStyle;
            var data = {
                component: component,
                minmargin: minmargin,
                defaultSize: defaultSize
            }

            if (this.computedStyle) {
                return this.computedStyle(data);
            }
            return;
        },
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        i18nSwitch: function (dis) {
            var i18n = $i.t("sensorText");
            return i18n[dis];
        },
        iconMarginOrSize: function (currSize, defLeft, defRight, defSize) {
            if (this.item.styleOption == 1) currSize = 20;
            defSize = defSize || 14;
            var style = {
                marginLeft: defLeft,
                marginRight: defRight,
                fontSize: currSize
            }
            for (var key in style) {
                var data = {
                    component: this.item,
                    minmargin: style[key],
                    defaultSize: defSize
                }
                style[key] = this.computedStyle(data);
            }
            return style;
        }
    },
    computed: {
        placeId: function () {
            return this.central.placeId;
        },
        /**
         * 
         * @returns 样式为1 或者 6 数据key的左右边距  样式 不是 1 或者 6 数据的上边距
         */
        key16Margin: function () {
            var defMargin = 8;
            var defaultSize = 14;
            var data = {
                component: this.item,
                minmargin: defMargin,
                defaultSize: defaultSize
            }
            if ([1, 6, 7].indexOf(this.item.styleOption) == -1) {
                defMargin = 7;
                return {
                    marginTop: this.computedStyle(data)
                }
            };

            return {
                marginLeft: this.computedStyle(data),
                marginRight: this.computedStyle(data)
            }
        },
    },
    watch: {
        placeId: function () {
            this.getEnvironment();
        }
    },
    template: `
        <div v-loading="sensor">
            <div v-for="dis in item.displayOptions" :key="dis" class="pointer sensor" :style="{padding:selfComputedStyle(item,10,20)}">
                <div class="custom-items-center" :class="{'custom-column': [2,5,7].indexOf(item.styleOption)!=-1}">
                    <div v-show="item.styleOption == 3" class="custom-column">
                        <span class="pointer">{{ displayOptions[dis].value == '未知' ? $t('unknown') : displayOptions[dis].value }}</span>
                        <span class="pointer" :style="key16Margin">{{ i18nSwitch(dis) || "" }}</span>
                    </div>
                    <i
                        v-show="item.styleOption != 5 && item.styleOption != 6"
                        :class="['iconfont pointer', displayOptions[dis].icon]"
                        :style="[iconMarginOrSize(35,7,7,14),{color: displayOptions[dis].color}]"
                    ></i>
                    <div v-show="item.styleOption != 3" class="custom-items-center" :class="{'custom-column': [1,6,7].indexOf(item.styleOption)==-1}">
                        <span class="pointer" v-show="[1,6,7].indexOf(item.styleOption)==-1" >{{ displayOptions[dis].value == '未知' ? $t('unknown') : displayOptions[dis].value }}</span>
                        <span class="pointer" :style="key16Margin">{{ i18nSwitch(dis) || "" }}</span>
                        <span class="pointer" v-show="[1,6,7].indexOf(item.styleOption)!=-1">{{ displayOptions[dis].value == '未知' ? $t('unknown') : displayOptions[dis].value }}</span>
                    </div>
                </div>
            </div>
        </div>
        `
})
/**
 * 考勤
 */
Vue.component("button-attendance", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function,
        minStyle: Function
    },
    data: function () {
        return {
            attList: [{
                    num: 0,
                    icon: 'iconshidao',
                    color: '#1F96CD',
                    key: "check",
                    img5: 'ic_style_check_5_sign.png',
                    img6: 'ic_style_check_6_sign.png'
                },
                {
                    num: 0,
                    icon: 'iconchidao',
                    color: '#F59409',
                    key: "late",
                    img5: 'ic_style_check_5_late.png',
                    img6: 'ic_style_check_6_late.png'
                },
                {
                    num: 0,
                    icon: 'iconqingjia',
                    color: '#1CD786',
                    key: "absence",
                    img5: 'ic_style_check_5_leave.png',
                    img6: 'ic_style_check_6_leave.png'
                },
                {
                    num: 0,
                    icon: 'iconqueqin',
                    color: '#E52A2A',
                    key: "unCheck",
                    img5: 'ic_style_check_5_unsign.png',
                    img6: 'ic_style_check_6_unsign.png'
                },
            ],
            attendance: false,
            echartData: [],
            myEchart: null,
            total: 0
        }
    },
    inject: ["central"],
    mounted: function () {
        this.getAttendance();
    },
    computed: {
        childrenStyle: function () {
            var children;
            var childrenText;
            var childrenNum;
            this.item.children.forEach(function (element) {
                if (element.type == 'text') {
                    childrenText = element;
                }
                if (element.type == 'num') {
                    childrenNum = element;
                }
            });
            if (childrenNum.style.fontSize >= childrenText.style.fontSize) {
                children = childrenNum;
            } else {
                children = childrenText;
            }
            return children;
        },
        placeId: function () {
            return this.central.placeId;
        },
        /**
         * 
         * @returns 可以显示图标的样式
         */
        showStyleIcon: function () {
            var arr = [2, 3, 4];
            return arr.indexOf(this.item.styleOption) != -1;
        },
        styleOption5Or6ImgStyle: function () {
            var style;
            var children = this.childrenStyle;
            if (this.item.styleOption == '5') {
                style = {
                    width: 110 / 14 * children.style.fontSize + 'px',
                    height: 110 / 14 * children.style.fontSize + 'px'
                }
            }
            if (this.item.styleOption == '6') {
                style = {
                    width: 110 / 14 * children.style.fontSize + 'px',
                    height: 67 / 14 * children.style.fontSize + 'px'
                }
            }
            return style;
        },
    },
    methods: {
        handleEchartData: function () {
            var arr = [],
                _this = this;
            this.total = 0;
            this.attList.forEach(function (item) {
                if (item.key != "late") _this.total += item.num;
            });
            // var actual = [{text: "实到学生", num: 15, key: "actual"}];
            // attList = this.attList.concat(actual);
            var attList = this.attList;
            attList.forEach(function (item, index) {
                color = {
                    check: ["#3DF9DF", "#4F86FC"],
                    late: ["#F9A737", "#FDCE69"],
                    absence: ["#2FD790", "#71F0BA"],
                    unCheck: ["#A781F8", "#C19EFB"],
                    actual: ["#F9A737", "#FDCE69"],
                }
                var itemStyleColor = {
                    type: 'linear',
                    colorStops: [{
                        offset: 0, color: color[item.key][0] // 0% 处的颜色
                    }, {
                        offset: 1, color: color[item.key][1] // 100% 处的颜色
                    }],
                    global: false // 缺省为 false
                }
                var obj = {
                    value: item.num,
                    name: $i.t("attendanceDOs")[index],
                    itemStyle: {
                        color: itemStyleColor
                    }
                };
                arr.push(obj);
            });
            this.echartData = arr;
            if (isIncludeStyleOption(showBgComponent, this.item.type, this.item.styleOption)) this.initEchart();
        },
        getAttendance: function () {
            var placeId = this.placeId,
                attList = this.attList,
                _this = this,
                url = "/api/control-template/attendance/statistics?placeId=" + placeId,
                config = {
                    showError: false,
                    loading: {
                        context: this,
                        target: "attendance"
                    }
                };
            this.$http.get(url, null, config).then(function (res) {
                var data = res.data
                attList.forEach(function (item) {
                    if (data[item.key]) _this.$set(item, "num", data[item.key] || 0);
                });
                _this.handleEchartData();
            }).catch(function (err) {
                _this.handleEchartData();
                console.log(err);
            })
            // /api/control-template/attendance/statistics
        },
        textStyle: function (type) {
            var children = this.item.children;
            var style = {};
            children.forEach(function (el) {
                if (type == el.type) {
                    for (var key in el.style) {
                        style[key] = key == "fontSize" ? el.style[key] + "px" : el.style[key];
                    }
                }
            });
            return style;
        },
        transSize: function (item) {
            var size = this.childrenStyle.style.fontSize
            return this.transForm(size)
        },
        selfComputedStyle: function (component, minmargin, defaultSize) {
            var minStyle = this.minStyle();
            defaultSize = defaultSize / minStyle;
            var data = {
                component: component,
                minmargin: minmargin,
                defaultSize: defaultSize
            }

            if (this.computedStyle) {
                return this.computedStyle(data);
            }
            return;
        },
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        i18nSwitch: function (index) {
            var i18n = $i.t("attendanceDOs");
            return i18n[index];
        },
        styleOption45ImgSrc: function (src) {
            return this.$global.fullStaticUrl("public/images/admin/control/" + src);
        },
        /**
         * 
         * @param {*} defLeft 默认左边距
         * @param {*} defTop 默认上边距
         * @param {*} defSize 默认字体大小
         * @returns 
         */
        optionValueStyle: function (defLeft, defTop, defSize) {
            var dataLeft = {
                component: this.childrenStyle,
                minmargin: defLeft,
                defaultSize: defSize
            }
            var dataTop = {
                component: this.childrenStyle,
                minmargin: defTop,
                defaultSize: defSize
            }
            if (this.computedStyle) {
                var left = this.computedStyle(dataLeft);
                var top = this.computedStyle(dataTop);

                return {
                    marginTop: left,
                    marginLeft: top
                }
            }
        },
        /**
         * 
         * @param {*} currSize 
         * @param {*} defLeft 
         * @param {*} defRight 
         * @param {*} defSize 
         * @returns 图标边距字体样式
         */
        iconStyle: function (currSize, defLeft, defRight, defSize) {
            var children = this.childrenStyle;
            defSize = defSize || 14;
            if (this.item.styleOption == 3) defRight = 0;
            if (this.item.styleOption == 4) defLeft = 0;
            var initData = {
                fontSize: currSize,
                marginLeft: defLeft,
                marginRight: defRight
            }
            for (var key in initData) {
                var obj = {
                    component: children,
                    minmargin: initData[key],
                    defaultSize: defSize,
                }
                initData[key] = this.computedStyle(obj);
            }
            return initData
        },
        initEchart: function () {
            var chartDom = document.getElementById('attendance-echart');
            this.myEchart = echarts.init(chartDom);
            var option,
                _this = this;
            
            option = {
                title: {
                    text: $i.t("ComponentList.attendance") + "（" + this.total + "）",
                    left: "center",
                    top: "center",
                    textStyle: {
                        fontSize: 14,
                        color: "#fff"
                    },
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    left: 'center',
                    bottom: 20,
                    textStyle: {
                        color: "#A0A3BE"
                    },
                    itemWidth: 10,  // 设置宽度
                    itemHeight: 10, // 设置高度
                    icon: "circle"
                },
                series: [
                    {
                        name: $i.t("componentText.attendance"),
                        selectedMode: 'multiple',
                        type: 'pie',
                        radius: ['45%', '65%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: [0, 0, 0, 0]
                        },
                        tooltip: {
                            trigger: "item",
                            formatter: function (params) {
                                return $i.t("attendanceDOs")[params.dataIndex] + "（" + params.value + "）"
                            }
                        },
                        label: {
                            show: true,
                            position: 'inner',
                            formatter: function (params) {
                                var value = params.value;
                                return (_this.total == 0 || value == 0) ? "0%" : Math.round(value / _this.total * 100) + "%"
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: this.echartData
                    }
                ]
            };
            option && this.myEchart.setOption(option);
        }
    },
    beforeDestroy: function () {
        if (this.myEchart) this.myEchart.dispose();
    },
    watch: {
        placeId: function () {
            this.getAttendance();
        },
        "$i18n.locale": function () {
            this.handleEchartData();
        }
    },
    template: `
            <div v-loading="attendance">
                <template v-if="!isIncludeStyleOption(showBgComponent, item.type, item.styleOption)">
                    <div v-for="(att,i) in attList" :key="att.icon" class="pointer custom-items-center custom-column att-list" :style="{padding:selfComputedStyle(item,10,20)}">
                        <div v-if="item.styleOption != 5 && item.styleOption != 6" :class="{'custom-items-center': item.styleOption != 2,'custom-column custom-items-center': item.styleOption == 2}">
                            <div v-if="item.styleOption == 3 || item.styleOption == 1" :class="{'custom-column custom-items-center': item.styleOption != 1}">
                                <span class="pointer text" :style="textStyle('text')">{{ i18nSwitch(i) }}</span>
                                <span class="pointer num" :style="textStyle('num')">{{ att.num }}</span>
                            </div>
                            <i :class="['iconfont pointer', att.icon]" :style="[iconStyle(22,5,5,14),{ color: att.color }]"  v-if="showStyleIcon"></i>
                            <div v-if="item.styleOption == 4 || item.styleOption == 2" class="custom-column custom-items-center">
                                <span class="pointer text" :style="textStyle('text')">{{ i18nSwitch(i) }}</span>
                                <span class="pointer num" :style="textStyle('num')">{{ att.num }}</span>
                            </div>
                        </div>
                        <div v-else>
                            <div class="attendance-styleOption-bg custom-relative" :style="styleOption5Or6ImgStyle">
                                <img class="wh100" :src="styleOption45ImgSrc(att['img' + item.styleOption])">
                                <div class="custom-absolute styleOption45 custom-column">
                                    <span class="pointer text" :style="[textStyle('text'),optionValueStyle(12,11,14)]">{{ i18nSwitch(i) }}</span>
                                    
                                    <span class="pointer num" :style="[textStyle('num'),optionValueStyle(12,14,14)]">{{ att.num }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <div id="attendance-echart" class="custom-absolute wh100"></div>
            </div>
        `
})
/**
 * 电箱
 */
Vue.component("button-electric", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function,
        minStyle: Function
    },
    name: "electric",
    inject: ["central"],
    data: function () {
        return {
            electric: false,
            electricList: [],
            time: null,
            test: [{
                btnType: 1,
                buttonId: 114,
                closeRelayStatus: null,
                closedStatus: 1,
                current: 0,
                currentBattery: 0,
                id: "07",
                airswitchAlarmFlag: {
                    undervoltage: true, // 欠压
                    overvoltage: false, // 过压
                    overcurrent: true, // 过流
                    overTemperature: true // 过温
                },
                instructList: [{
                        afterCourseCloseTime: null,
                        beforeCourseOpenTime: null,
                        createTime: 1652432202000,
                        enableAfterCourseClose: 0,
                        enableBeforeCourseOpen: 0,
                        id: 134,
                        instructCbValue: "CB-07-OPEN",
                        instructValue: "ID-07-OPEN",
                        label: "on",
                        name: "ON",
                        propertyButtonId: 114,
                        propertyId: 270,
                        tenantId: "000004",
                        updateTime: 1652432202000,
                    },
                    {
                        afterCourseCloseTime: null,
                        beforeCourseOpenTime: null,
                        createTime: 1652432202000,
                        enableAfterCourseClose: 0,
                        enableBeforeCourseOpen: 0,
                        id: 135,
                        instructCbValue: "CB-07-CLOSE",
                        instructValue: "ID-07-CLOSE",
                        label: "off",
                        name: "OFF",
                        propertyButtonId: 114,
                        propertyId: 270,
                        tenantId: "000004",
                        updateTime: 1652432202000,
                    }
                ],
                maxCurrent: 0,
                name: "机柜",
                parentUuid: "0cefafd3eb17eb16",
                power: 0,
                propertyId: 270,
                relayStatus: 2,
                serialNum: "3CC8F92C",
                shortCircuits: 0,
                temperature: 33,
                timestamp: 1652927477528,
                totalBattery: 0,
                uuid: "0cefafd3eb17eb16:07",
                voltage: 230655,
            }]
        }
    },
    mounted: function () {
        this.getAirswitchs();
    },
    methods: {
        // /screenManager/api/control-template/airswitchs
        getAirswitchs: function (hideLoading) {
            var url = "/api/control-template/airswitchs?placeId=" + this.placeId;
            var _this = this;
            var config = {
                showError: false,
                loading: {
                    context: this,
                    target: "electric"
                }
            }
            if (hideLoading) config.loading = false;
            this.$http.get(url, null, config).then(function (res) {
                // _this.electricList = _this.test;
                _this.electricList = res.data;
                if (_this.time) clearInterval(_this.time);
                _this.time = setInterval(function () {
                    _this.getAirswitchs(true);
                }, 10 * 1000);
            }).catch(function (err) {
                console.log(err);
                // _this.electricList = _this.test;
            })
        },
        // /screenManager/api/control-template/switchPower
        switchPower: function (item, key) {
            if (key != "relayStatus") return;
            var url = "/api/control-template/control";
            var _this = this;
            var currInstructId = this.getBtnTextByRelayStatus(item, "id");
            var instructList = item.instructList || [];
            var instructId = instructList[0] ? instructList[0].id : "";
            instructList.forEach(function (el) {
                if (el.id != currInstructId) instructId = el.id;
            });
            var data = {
                uuid: item.parentUuid,
                instructId: instructId
            }
            var config = {
                showError: false,
                loading: {
                    context: this,
                    target: "electric"
                },
            }
            if (item.btnType != 0) item.relayStatus = Number(!item.relayStatus);
            this.$http.post(url, data, config).then(function (res) {
                _this.$global.showSuccess($i.t("toast[7]"));
            }).catch(function (err) {
                if (item.btnType != 0) item.relayStatus = Number(!item.relayStatus);
            })
        },
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
        _addUnit(val, unit) {
            if (isNaN(val)) {
                return 0 + unit;
            }
            return val + unit;
        },
        turnValue(item, key) {
            var add = this._addUnit;
            var obj = {
                relayStatus: this.getBtnTextByRelayStatus(item),
                voltage: add((item[key] / 1000).toFixed(2), 'v'),
                power: add(item[key], 'w'),
                temperature: add(item[key], '℃'),
                current: add((item[key] / 1000).toFixed(2), 'A'),
            }
            if (item.btnType === 0 && key == "relayStatus") {
                return item.instructList[0].name;
            }
            for (var k in obj) {
                if (key == k) return obj[k]
            }
            if (key == "status") return $i.t("roomStatus")[0][1]; // 状态
            return item[key] || "——";

        },
        getBtnTextByRelayStatus: function (record, key) { //根据当前的开关状态和指令列表显示
            key = key || "name";
            var isOpen = record.relayStatus;
            if (record.broken) isOpen = 2;
            var obj = {0: "off", 1: "on", 2: "break"};
            var instructList = record.instructList || [];
            var label = obj[isOpen];
            var find = this.findByKeyValue(instructList, "label", label);
            return find == null ? label.toUpperCase() : find[key];
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
        controlClass: function (el, key) {
            if (key != "relayStatus") return "";
            var isOpen = el.relayStatus;
            if (el.broken) isOpen = 2;
            var obj = {0: "off", 1: "on", 2: "break"};
            var className = obj[isOpen];
            return className + " control pointer";
        },


        includesIds: function (item) {
            var id = item.id;
            return this.central.isConflictIds && this.central.isConflictIds.indexOf(id) != -1;
        },
        /**
         * 按钮显示的文本
         * @param {*} item 当前按钮
         * @returns 
         */
        buttonText: function (item) {
            var instructList = item.instructList;
            var name = instructList[0].name;
            var _this = this;
            if (item.instructList.length > 1) {
                instructList.forEach(function (el) {
                    if (!el.name) _this.$set(el, 'name', "");
                    if (!el.active) name = el.name;
                });
            }


            if (name && name.toString() == "[object Object]") name = "";
            return name;
        },
        buttonTextTip: function (item) {
            return item.propertyName + "-" + item.order;
        },
        componentBorderStyle: function (item) {
            var style = item.style;
            var result = {};
            for (var key in style) {
                if (key != "left" && key != "top") {
                    // 因为设置了圆角 会出现背景色溢出 所以单独设置圆角的容器上加背景色
                    if (key.indexOf('border') != -1 || key.indexOf('background') != -1) result[key] = style[key];

                    if (key == 'borderWidth') {
                        result[key] = style[key] + 'px';
                    }
                    if (key == "borderRadius") {
                        var radius = style[key].top + 'px ' + style[key].right + 'px ' + style[key].bottom + 'px ' + style[key].left + 'px';
                        result[key] = radius
                    }
                }
            }
            var opacity = (100 - result.backgroundOpacity) / 100;
            result.backgroundColor = this.colorRgb(result.backgroundColor, opacity);
            return result;
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
        alotMinWidth: function (item) {
            var width = item.style.width - 10;
            return {
                width: width + "px"
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
        setComponentStyle: function (item) {
            var result = {};
            var style = item.style;
            var sizeArr = ['width', 'height', "fontSize"];
            for (var key in style) {
                // 因为设置了圆角 会出现背景色溢出 所以全局颜色不设置背景颜色
                if (key.indexOf('border') == -1 && key.indexOf('background') == -1) result[key] = style[key];
                if (sizeArr.indexOf(key) != -1) result[key] = `${style[key]}px`;
            }

            return result
        },
        handleDragStart: function (e) {
            e.dataTransfer.setData('id', e.target.dataset.id);
            // this.central.setCurrDragButton();
        },
        turnVoltageClass: function (item, key) {
            var airswitchAlarmFlag = item.airswitchAlarmFlag;
            var obj = {
                current: airswitchAlarmFlag.overcurrent,
                // voltage: airswitchAlarmFlag.overvoltage,
                temperature: airswitchAlarmFlag.overTemperature
            }

            if (key == "voltage") {
                if (airswitchAlarmFlag.undervoltage) return "value-under";
                if (airswitchAlarmFlag.overvoltage) return "value-over";
            }
            if (obj[key]) return "value-over";
        }
    },
    computed: {
        sizeStyle: function () {
            var minStyle = this.minStyle();
            var width = this.item.style.width;
            var height = this.item.style.height;
            var style;
            var defaulWidth = 350;
            var defaultHeight = 200;
            var size = 20 / minStyle;
            if (width > height) {
                style = {
                    fontSize: Math.floor(size / defaulWidth * height * minStyle) + 'px'
                }
            } else {
                style = {
                    fontSize: Math.floor(size / defaultHeight * width * minStyle) + 'px'
                }
            }
            return style
        },
        componentTextStyle: function () {
            var obj = {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }
            return obj[this.item.style.textAlign] || "center";
        },
        placeId: function () {
            return this.central.placeId;
        },
        active: function () {
            return this.central.activeComponent;
        },
        titleList: function () {
            return $i.t("electricTitleList");
        },
        electricButton: function () {
            return this.central.buttonData[this.item.parentType];
        },
        electricFilterButton: function () {
            return this.central.electricFilterButton;
        },
        isEdit: function () {
            return this.central.isEdit;
        },
        activeComponent: function () {
            return this.central.activeComponent;
        },
    },
    watch: {
        placeId: function () {
            this.getAirswitchs();
        }
    },
    destroyed: function () {
        clearInterval(this.time);
    },
    template: `
            <div v-loading="electric">
                <div class="electric custom-column wh100">
                    <div class="dev-title custom-items-center custom-justify-between" :class="{'border-dedede': item.styleOption == 1}">
                    <div class="dev-item" :style="sizeStyle">
                        <div v-for="(el, key) in titleList" :key="key" class="custom-items-center" 
                        :class="{'border-none': item.styleOption == 2}"
                        :title="el"
                        :style="{'justify-content': componentTextStyle}">
                            <span class="w100 custom-ellipsis">{{ el }}</span>
                        </div>
                    </div>
                    </div>
                    <div class="table-body" :class="{'electric-table-body-2': item.styleOption == 2}">
                        <el-scrollbar class="custom-scrollbar" ref="custom-scrollbar-button-electric">
                            <div class="dev-list custom-column">
                                <div v-if="!electricList.length && !electricButton.length" class="custom-t20" >{{ $t("null[0]") }}</div>
                                <template v-if="item.styleOption == 1">
                                    <div class="flex-shrink-0 custom-column">
                                        <div
                                            class="dev-item custom-items-center custom-justify-between"
                                            v-for="el in electricList"
                                            :key="el.id"
                                            :style="sizeStyle"
                                        >
                                            <div 
                                                v-for="(item, key) in titleList" 
                                                :key="'li' + key" class="custom-items-center" 
                                                :title="turnValue(el, key)"
                                                @click="switchPower(el,key)"
                                                :style="{'justify-content': componentTextStyle}"
                                                :class="controlClass(el,key)"
                                            >
                                                <span class="w100 custom-ellipsis">{{ turnValue(el, key) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <template v-if="item.styleOption == 2">
                                    <div class="custom-column dev-item-box-2">
                                        <div
                                            class="dev-item border-none"
                                            v-for="el in electricList"
                                            :key="el.id"
                                            :style="sizeStyle"
                                        >
                                            <div class="w100 custom-items-center custom-justify-between dev-item-container">
                                                <div 
                                                    v-for="(item, key) in titleList" 
                                                    :key="'li' + key" 
                                                    class="custom-items-center border-none custom-relative turn-value-box"
                                                    :class="turnVoltageClass(el, key)"
                                                    :title="turnValue(el, key)"
                                                    @click="switchPower(el,key)"
                                                    :style="{'justify-content': componentTextStyle}"
                                                >
                                                    <span class="custom-ellipsis w70" :class="controlClass(el,key)">{{ turnValue(el, key) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <!-- 拖拽 -->
                                <div class="electric-button-container custom-flex custom-flex-warp" v-show="electricFilterButton.length" :class="{'border-t-dedede': electricFilterButton.length}">
                                    <div v-for="electric in electricFilterButton" :key="electric.id" class="electric-button-item-container">
                                        <div
                                            :draggable="isEdit" 
                                            @dragstart="handleDragStart"
                                            :data-id="electric.id" 
                                            :ref="'electric'+electric.id" 
                                            @click="central.setActiveComponent(electric.id,electric)"
                                            @dblclick="central.dbclickEditButton($event,electric,'electric')"
                                            class="electric-button-item custom-relative custom-items-center" 
                                            :style="setComponentStyle(electric)"
                                        >
                                            <div class="wh100 custom-absolute">
                                                <div :class="{conflict: includesIds(includesIds),'component-active': activeComponent == electric.id }" class="wh100 custom-absolute lt0 pointer"></div>
                                                <div class="component-slot-button-text wh100 custom-absolute pointer"
                                                    :class="{'is-active': !isEdit}"
                                                    :style="[{'justify-content': setButtonTextAlgin(electric)},componentBorderStyle(electric)]">
                                                    <span class="custom-absolute custom-ellipsis pointer"
                                                        :title="buttonText(electric)"
                                                        :style="[alotMinWidth(electric)]">{{ buttonText(electric) }}</span>
                                                </div>
                                                <el-tooltip class="item" effect="dark" :content="buttonTextTip(electric)"
                                                    v-if="isEdit" placement="top">
                                                    <div class="tip-number-left custom-absolute pointer">{{ electric.order }}
                                                    </div>
                                                </el-tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                </div>
            </div>
        `
})
/**
 * 中控控制
 */
Vue.component("button-control", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {
            activeComponent: null
        }
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize
            return this.transForm(size);
        },
    },
    computed: {
    },
    template: "<div></div>"
})
/**
 * 房间设备
 */
Vue.component("button-room", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function,
        minStyle: Function
    },
    inject: ["central"],
    data: function () {
        return {
            activetable: 0,
            room: false,
            headerList: [{
                    text: "设备状态",
                    value: 0
                },
                {
                    text: "今日预警",
                    value: 1
                },
                {
                    text: "今日工单",
                    value: 2
                },
            ],
            titleList: [{
                    text: "设备",
                    value: 0
                },
                {
                    text: "型号",
                    value: 1
                },
                {
                    text: "IP",
                    value: 2
                },
                {
                    text: "状态",
                    value: 3
                },
            ],
            devList: [],
            uuids: [],
            status: {},
            loadings: {},
            time: null,
        }
    },
    mounted: function () {
        this.getDevList();
    },
    computed: {
        componentTextStyle: function () {
            var obj = {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }
            return obj[this.item.style.textAlign] || "center";
        },
        placeId: function () {
            return this.central.placeId;
        },
    },
    methods: {
        computedStyle: function (data) {
            if (data !== null) {
                var size = data.component.style.fontSize;
                var margin = data.minmargin;
                var minsize = data.defaultSize;
                return Math.floor(size * margin / minsize) + 'px';
            }
            return "8px";
        },
        getDevList: function (key) {
            key = key || 0;
            var placeId = this.placeId,
                _this = this;
            var urls = {
                0: "/api/control-template/properties",
                1: "api/control-template/alertLog/today",
                2: "api/control-template/repair/today"
            }
            var url = urls[key] + "?placeId=" + placeId;
            var config = {
                loading: {
                    context: this,
                    target: "room"
                },
                showError: false,
            }
            this.$http.get(url, null, config).then(function (res) {
                var data = res.data;
                _this.devList = data;
                data.forEach(function (item) {
                    _this.uuids.push(item.uniqueCode);
                    _this.loadings[item.uniqueCode] = false;
                });
                if (_this.activetable == 0 && data && data.length) {
                    _this.getDevStatus();
                }
            })

        },
        getDevStatus: function () {
            var url = "/api/control-template/properties/status",
                _this = this;
            var config = {
                loading: false,
                showError: false,
            }
            var data = {
                uuids: this.uuids.join(",")
            };
            for (var key in this.loadings) {
                this.loadings[key] = true;
            }
            this.$http.get(url, data, config).then(function (res) {
                var resData = res.data;
                _this.status = resData;
                for (var key in _this.loadings) {
                    _this.loadings[key] = false;
                }
                if (_this.time) clearInterval(_this.time);
                if (_this.activetable == 0) {
                    _this.time = setInterval(function () {
                        _this.getDevStatus();
                    }, 10 * 1000);
                }
            }).catch(function () {
                for (var key in _this.loadings) {
                    _this.loadings[key] = false;
                }
            })
        },
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        switchTableType: function (item) {
            this.getDevList(item.value);
            this.activetable = item.value;
        },
        activetable0Status: function (item) {
            var activetable = this.activetable;
            var state = this.status[item.uniqueCode];
            return $i.t('roomStatus')[activetable][state] || $i.t('roomStatus')[activetable][2];
        },
        turnStatus: function (el, type) {
            var activetable = this.activetable;
            if (type == "status") {
                if (activetable == 2) { // 0 => activetable0Status
                    return $i.t('roomStatus')[activetable][el.status] || $i.t("roomStatus")[0][2];
                } else {
                    return activetable == 1 && el.alertStrategyName != null ? el.alertStrategyName : "——"
                }
            } else if (type == "ip") {
                if (activetable == 0) return el.ip || "——";
                return el.content || el.description || "——";
            } else {
                if (activetable == 0) return el.propertyTypeName || "——";
                return el.createTime ? this.$global.formatDate(Number(el.createTime), "HH:mm:ss") : "——";
            }
        },
        goToPage: function (item) {
            var url = {
                1: "",
                2: ""
            }
            if (!item.targetUrl) return;
            window.open(item.targetUrl);
        },
        roomStatusRound(item) {
            var status = this.status[item.uniqueCode];
            var className = {
                0: "abnormal-round",
                1: "on-line-round"
            }
            return className[status] || "off-line-round";
        },
        sizeStyle: function (key, size) {
            var minStyle = this.minStyle();
            size = (size || 20) / minStyle;
            key = key || "fontSize";
            var width = this.item.style.width;
            var height = this.item.style.height;
            var style = {};
            var defaulWidth = 350;
            var defaultHeight = 200;

            if (width > height) {
                style[key] = Math.floor(size / defaulWidth * height * minStyle) + 'px';
            } else {
                style[key] = Math.floor(size / defaultHeight * width * minStyle) + 'px';
            }
            return style
        },
    },
    watch: {
        placeId: function (val) {
            this.getDevList();
        }
    },
    destroyed: function () {
        clearInterval(this.time);
    },
    template: `
    <div v-loading="room">
        <div class="wh100 custom-column course-container room-container" :style="{padding: item.style.borderWidth + 4 + 'px'}">
            <div class="custom-items-center">
                <div class="table-header custom-items-center" :class="{'table-header-2': item.styleOption == 2, 'custom-justify-between w100': item.styleOption == 1}">
                    <div class="header-item pointer" :class="{ 'table-active custom-success-color': activetable == he.value, }"
                        :title="$i.t('roomHeaderList')[i]"
                        v-for="(he,i) in headerList" :key="he.value" :style="sizeStyle()" @click="switchTableType(he)" >
                        <span>{{ $i.t('roomHeaderList')[i] }}</span>
                    </div>
                </div>
            </div>
            <div class="table-body" :class="{'table-body-2 border-none': item.styleOption == 2}">
                <el-scrollbar class="custom-scrollbar">
                    <div v-if="!devList.length" class="custom-t20" >{{ $t("roomNotData")[activetable] }}</div>
                    <div v-else class="dev-list custom-column">
                        <div class="dev-item custom-items-center custom-justify-between" :style="sizeStyle()" >
                            <div v-for="(el,i) in titleList" :key="el.id" :style="{'justify-content': componentTextStyle}">{{ $i.t('roomTitleList')[activetable][i] }}</div>
                        </div>
                        <div class="dev-item custom-items-center custom-justify-between" :class="{'border-none': item.styleOption == 2 && elI != 0}" v-for="(el, elI) in devList"
                         @click="goToPage(el)"
                         :key="el.id" :style="sizeStyle()" >
                            <div :style="{'justify-content': componentTextStyle}" :title="el.name">
                                <span class="w100 custom-ellipsis">{{ el.name || "——" }}</span>
                            </div>
                            <div :style="{'justify-content': componentTextStyle}" :title="turnStatus(el,'type')" >
                                <span class="w100 custom-ellipsis">{{ turnStatus(el,"type") }}</span>
                            </div>
                            <div :style="{'justify-content': componentTextStyle}" :title="turnStatus(el,'ip')" >
                                <span class="w100 custom-ellipsis">{{ turnStatus(el,"ip") }}</span>
                            </div>
                            <div :style="{'justify-content': componentTextStyle}" :title="turnStatus(el,'status')" v-if="activetable != 0">
                                <span class="w100 custom-ellipsis">{{ turnStatus(el,"status") }}</span>
                            </div>
                            <div v-else>
                                <div :style="{'justify-content': componentTextStyle}" :title="activetable0Status(el)" class="room-status custom-items-center w100 custom-relative" v-loading="loadings[el.uniqueCode]">
                                    <span class="room-status-round" :style="[sizeStyle('width',10),sizeStyle('height',10)]" :class="roomStatusRound(el)"></span>
                                    <span class="w90 custom-ellipsis room-round-text">{{ activetable0Status(el) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </div>
    `
})

/**
 * iot
 */
Vue.component("button-iot", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    template: "<div></div>"
})
/**
 * 红外控制器
 */
Vue.component("button-controller", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
    },
    template: "<div></div>"
})

Vue.component("button-rectangle", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    methods: {

    },
    template:
        // `
        //     <div :style="transSize(item)"></div>
        // `
        "<div class='component-button-rectangle'></div>"
})

/**
 * 地点组件
 */
Vue.component("button-location", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["central"],
    data: function () {
        return {
            location: false,
            placeName: ""
        }
    },
    mounted: function () {
        this.getPlaceDetail();
    },
    methods: {
        getPlaceDetail: function () {
            // /screenManager/api/control-template/place/detail
            var config = {
                showError: false,
                loading: {
                    context: this,
                    target: "location"
                }
            }
            var placeId = this.placeId,
                _this = this;
            var url = "/api/control-template/place/detail?placeId=" + placeId;
            this.$http.get(url, null, config).then(function (res) {
                _this.placeName = res.data.name;
            })
        }
    },
    computed: {
        placeId: function () {
            return this.central.placeId;
        },
    },
    watch: {
        placeId: function () {
            this.getPlaceDetail();
        }
    },
    template: `
            <div class='component-button-location'>{{ placeName }}</div>
        `
})

/**
 * 静态文本
 */
Vue.component("button-static-text", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["central"],
    data: function () {
        return {
            staticText: false
        }
    },
    mounted: function () {

    },
    methods: {

    },
    computed: {
        placeId: function () {
            return this.central.placeId;
        },
    },
    template: `
            <div class='component-button-static-text'>
                <el-scrollbar class="custom-scrollbar">
                    <div class="w100">{{ item.style.text }}</div>
                </el-scrollbar>
            </div>
        `
})

/**
 * 远程协助
 */
Vue.component("button-remote-assistance", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    data: function () {
        return {
            videoObject: {
                video: "", //视频地址
                id: "",
            },
            showSelect: false,
            hls: null,
            flvPlayer: null,
            streamList: [],
            videoPlay: true,
            isOk: false,
            open: false,
        }
    },
    inject: ["central"],
    mounted: function () {
        document.querySelector(".remoteAssistance").oncontextmenu = function () {
            return false;
        }
    },
    methods: {
        transSize: function (item) {
            var size = item.style.fontSize;
            return this.transForm(size);
        },
        visibleChange: function (value) {
            this.$refs.videoSelect.style.opacity = value ? 1 : 0;
        },
        playRemoteAssistance: function () {
            this.$emit('remote', this.item);
        },
        operationRemoteAssistance: function () { // 操作远程
            this.$emit('operation', this.item);
        },
        disconnectRemoteAssistance: function () { // 断开远程
            // this.playRemoteAssistance(1)
            this.$emit('disconnect', this.item);
        }
    },
    computed: {
        remoteCavasStyle: function () {
            return this.central.returnRemoteCavasStyle();
        },
        componentStyle: function () {
            return this.componentWHLT(this.item);
        },
        videoBoxStyle: function () {
            return {
                width: "100%",
                height: "100%"
            }
        },
        placeId: function () {
            return this.central.placeId;
        },
        returnCanvasStyle: function () {
            var style = {},
                _this = this;
            var node = this.central.$refs.fullCanvas;
            var width = node.clientWidth;
            var height = node.clientHeight;
            if (this.isFullScreen) {
                return {
                    width: width + "px",
                    height: height + "px"
                }
            }
            ["width", "height"].forEach(function (item) {
                style[item] = (item == "height" ? _this.item.style[item] - 38 : _this.item.style[item]) + "px";
            })
            style.marginTop = 38 + "px";
            return style;
        },
        currCallStatus: function () {
            return this.central.currCallStatus;
        },
        iPIntercomObj: function () {
            return this.central.iPIntercomObj;
        },
        remoteOperation: function () {
            return this.central.remoteOperation;
        },
        showRemoteAssistance: function () {
            return this.central.showRemoteAssistance;
        },
        isFullScreen: function () {
            return this.central.isFullScreen;
        },
        remoteAssistance: function () {
            return this.central.remoteAssistance;
        },
        openRemote: function () {
            return this.open;
        },
        showFullCanvas: function () {
            return this.central.isFullScreen;
        },
        returnRemoteOperationText: function () {
            return $i.t(this.remoteOperation ? "ccjs28" : "ccjs20");
        },
        
    },
    watch: {
        remoteCavasStyle: {
            deep: true,
            handler: function (val, old) {
                if (val.width > 0) return this.open = true;
                this.open = false;
            }
        },
        showFullCanvas: function (val) {
            this.isFullScreen = val;
        }
    },
    beforeDestroy: function () {

    },
    template: `
        <div class="button-video-display remoteAssistance" ref="remote" >
            <template v-if="item.styleOption == 1">
                <div class="video-play custom-absolute custom-flex-center wh100" v-show="!showRemoteAssistance" :class="{'full-canvas-container':isFullScreen}">
                    <i class="iconfont iconbofang" @click="playRemoteAssistance(0)"></i>
                </div>
                <div v-show="showRemoteAssistance" class="wh100">
                    <div v-loading="remoteAssistance" class="custom-items-center custom-justify-center" 
                    :class="{'full-canvas-container video-box':isFullScreen}" :style="videoBoxStyle">
                        <canvas class="remote-assistance-canvas" id="canvasRemote"></canvas>
                    </div>
                    <div class="video-select" v-show="!isOk" ref="videoSelect" 
                        :style="{position: isFullScreen ? 'fixed' : 'absolute'}" 
                        :class="{'video-active':!isOk && showRemoteAssistance}" 
                    >
                        <button class="remote-button pointer" @click="operationRemoteAssistance">{{ returnRemoteOperationText }}</button>
                        <button class="click-full click-disconnect pointer"  @click="disconnectRemoteAssistance">{{ $i.t("ccjs31") }}</button>
                        <i @click="$emit('full')" class="iconfont color-fff" :class="isFullScreen ? 'iconsuoxiao-xiaoping-02' : 'iconfangda'"></i>
                    </div>
                </div>
            </template>

            <template v-if="item.styleOption == 2">
                <div class="wh100 custom-relative" :style="item.title.show ? central.dynamicSize(item, paddingNum[item.type], 446, 322, 'paddingLeft') : ''">
                    <div class="video-play custom-relative custom-flex-center wh100 video-canvas-box" v-show="!showRemoteAssistance" :class="{'full-canvas-container':isFullScreen}">
                        <i :style="central.dynamicSize(item, 40, 446, 322)" @click="playRemoteAssistance(0)" class="iconfont icon24gf-play pointer"></i>
                    </div>
                    <div v-loading="remoteAssistance" class="video-canvas-box" v-show="showRemoteAssistance" :class="{'full-canvas-container video-box':isFullScreen}" :style="videoBoxStyle">
                        <canvas class="remote-assistance-canvas" id="canvasRemote"></canvas>
                    </div>
                </div>
            </template>
        </div>
        `
})

/**
 * IP对讲
 */
Vue.component("button-ip-intercom", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["central"],
    data: function () {
        return {
            staticText: false
        }
    },
    mounted: function () {

    },
    methods: {

    },
    computed: {
        placeId: function () {
            return this.central.placeId;
        },
    },
    template: `
            <div class='component-button-static-text'>
                
            </div>
        `
})

/**
 * 功能按钮
 */
Vue.component("button-function-button", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["central"],
    data: function () {
        return {
            staticText: false
        }
    },
    mounted: function () {

    },
    methods: {
        clickButton: function () {
            this.$emit("function-button", this.item);
        },
    },
    computed: {
        placeId: function () {
            return this.central.placeId;
        },
        buttonText: function () {
            return $i.t("functionButtonText")[this.item.radio];
        }
    },
    template: `
            <div class='component-button-function-button' @click="clickButton">
                <span class="custom-ellipsis" :title="buttonText">{{ buttonText }}</span>
            </div>
        `
})

/**
 * 空调控制
 */
 Vue.component("button-air-conditioning-control", {
    props: {
        item: Object,
    },
    data: function () {
        return {
            
        }
    },
    methods: {
        
    },
    computed: {
        
    },
    template: "<div></div>"
})

/**
 * 摄像头控制
 */
 Vue.component("button-camera-control", {
    props: {
        item: Object,
    },
    data: function () {
        return {
            activeComponent: null
        }
    },
    inject: ["central"],
    methods: {
        
    },
    computed: {
        
    },
    template: `<div>
        <div class="wh100" :style="item.title.show ? central.dynamicSize(item, paddingNum[item.type], null, null, 'paddingLeft') : ''">
            <div class="wh100 custom-items-center">
                <div id="button-camera-control-img" class="h100" ref="cameraControlImg"></div>
            </div>
        </div>
    </div>`
})

/**
 * 摄像头方向
 */
 Vue.component("button-camera-direction", {
    props: {
        item: Object,
    },
    data: function () {
        return {
            activeComponent: null,
        }
    },
    inject: ["central"],
    methods: {
        directionAbsolute: function (item) {
            var id = item.componentId;
            var style = {
                color: item.style.color
            }
            if (id.indexOf("_camera_up") != -1) style.top = 0;
            if (id.indexOf("_camera_right") != -1) style.right = 0;
            if (id.indexOf("_camera_down") != -1) style.bottom = 0;
            if (id.indexOf("_camera_left") != -1) style.left = 0;
            return style;
        },
        sendDirectionButton: function (item) {
            var direction = this.central.directionArrActive;
            if (direction && direction.id == item.id) return this.central.directionArrActive = null;
            if (this.isEdit && this.isActiveParent) {
                this.central.directionArrActive = item;
                return;
            }
            var list = item.style.control.instructList;
            this.central.sendButtonInstructions(item);
        },
        dbclickEditButton: function (e) {
            this.central.dbclickEditButton(e, this.item);
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
        isActiveDirection: function (dir) {
            var active = this.directionArrActive;
            if (!active || !this.isActiveParent) return false;
            return active.componentId == dir.componentId;
        },
        /**
         * 
         * @param {*} item 返回按钮文本
         * @returns 
         */
        directionButtonTitle: function (item) {
            var list = item.instructList;
            var find = list.filter(function (el) {
                return el.active;
            })[0];
            if (find) return find.name;
        },
    },
    computed: {
        directionArrActive: function () {
            return this.central.directionArrActive;
        },
        isActiveParent: function () {
            var curr = this.central.currActiveComponent[0]
            return curr && curr.id == this.item.id;
        },
        isEdit: function () {
            return this.central.isEdit;
        },
        directionArr: function () {
            return this.central.filterDirectionArr;
        },
        directionButton: function () {
            return this.central.directionButton;
        },
        imageWidthHeight: function () {
            var item = this.item;
            var width = this.central.dynamicSize(item, 164, 164, 166, 'width').width.replace("px", "") * 1;
            var height = this.central.dynamicSize(item, 166, 164, 166, 'height').height.replace("px", "") * 1;
            var style = item.style;
            var scale = 164 / 166;
            var getSizeByContainerRatio = this.getSizeByContainerRatio(style.width, style.height, scale);

            width = getSizeByContainerRatio.width;
            height = getSizeByContainerRatio.height;

            var borW = item.style.borderWidth * 2;
            return {
                width: width - borW + "px",
                height: height - borW + "px"
            }
        },
        directionListPadding: function () {
            var item = {
                style: {
                    width: 164,
                    height: 166
                }
            }
            var style = this.central.dynamicSize(item, 10, 164, 166, 'padding');
            return style;
        },
        componentTextStyle: function () {
			var obj = {
				left: "flex-start",
				center: "center",
				right: "flex-end"
			}
			return obj[this.item.style.textAlign] || "space-around";
		},
    },
    watch: {
        isActiveParent: function (val) {
            if (!val) this.central.directionArrActive = null;
        }
    },
    template: `<div class="wh100">
        <div class="wh100 custom-flex-center" :style="{'justify-content': componentTextStyle}">
            <div class="custom-items-center custom-relative camera-direction-container" :style="imageWidthHeight">
                <img class="wh100" ref="cameraImg" :src="$global.fullStaticUrl('/public/images/admin/control/camera.png')"></img>

                <div class="direction-list-box custom-absolute wh100">
                    <div class="direction-list wh100" :style="directionListPadding">
                        <div class="custom-flex-center custom-relative wh100" @dblclick="dbclickEditButton($event)">
                            <div class="custom-absolute pointer direction-icon-box" :class="{'direction-edit': isEdit, 'direction-active': isActiveDirection(dir) }" :style="directionAbsolute(dir)" v-for="dir in directionArr" :key="dir.id" @click="sendDirectionButton(dir)" :title="directionButtonTitle(dir)">
                                <i :class="directionButton[dir.componentId]"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})


/**
 * 天气
 */
 Vue.component("button-weather", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["central"],
    data: function () {
        return {
            list: [],
            day: {
                0: "today",
                1: "tomorrow",
                2: "dayAfterTomorrows"
            },
            realtime: {},
        }
    },
    mounted: function () {
        this.getWeather();
    },
    methods: {
        getWeather: function () {
            var url = "/api/control-template/weather?defaultCity=广州",
                _this = this,
                config = {
                    showError: false,
                }

                // var result = {
                //     future: [
                //         { date: "2022-11-21", direct: "持续无风向", temperature: "20/29℃", weather: "阵雨转中到大雨" },
                //         { date: "2022-11-22", direct: "持续无风向", temperature: "20/24℃", weather: "中到大雨转中雨"},
                //         { date: "2022-11-23", direct: "持续无风向", temperature: "19/23℃", weather: "中雨转小到中雨" },
                //         { date: "2022-11-24", direct: "持续无风向", temperature: "18/23℃", weather: "小到中雨转中雨" },
                //         { date: "2022-11-25", direct: "持续无风向", temperature: "19/21℃", weather: "中雨转小雨" }
                //     ],
                //     realtime: {
                //         aqi: "46",
                //         direct: "东风",
                //         humidity: "59",
                //         info: "多云",
                //         power: "2级",
                //         temperature: "28",
                //         wid: "01",
                //     }
                // }
                // _this.list = result.future;
                // _this.realtime = result.realtime;
            this.$http.get(url, null, config).then(function (res) {
                var result = res.data || {};
                _this.list = result.future;
                _this.realtime = result.realtime;
            })
        },
        computedStyle: function (item, size, defaultSize, key) {
            var fontSize = item.style.fontSize;
            return {
                [key]: Math.floor(fontSize * size / defaultSize) + 'px'
            }
		},
        getDateWeek: function (index) {
            var newDate = new Date();
            index = (index + 2) + 1;
            var week = moment(newDate).add(index, "days")._d.getDay();
            if (week == 0) week = 7;
            return $i.t("tableWeeks")[week - 1];
        },
        index567: function (index) {
            return index > 1 ? index - 1 : index;
        },
        aqiGrade: function (value) {
            var index = 0;
            switch (true) {
                case value <= 50:
                    index = 0;
                    break;
                case value <= 100:
                    index = 1;
                        break;
                case value <= 150:
                    index = 2;
                    break;
                case value <= 200:
                    index = 3;
                    break;
                case value <= 300:
                    index = 4;
                    break;
                default:
                    index = 5;
                    break;
            }
        return $i.t("aqiGrade")[index];
        },
    },
    computed: {
        iconFontSize: function () {
            var item = this.item;
            return {
                // fontSize: item.style.fontSize + "px"
                width: item.style.fontSize + "px"
            }
        },
        placeId: function () {
            return this.central.placeId;
        },
        threeDayData: function () {
            var list = this.list.filter(function (item, index) {
                return index < 3;
            })
            return list || [];
        },
        styleOption: function () {
            return this.item.styleOption
        },
        lastTwoDayData: function () {
            var list = this.list.filter(function (item, index) {
                return index >= 3;
            })
            return list;
        },
        list567: function () {
            return [
                {value: "today"},
                {value: "envValue", label: "envLabel"},
                {value: "tomorrow"},
                {value: "dayAfterTomorrows"},
            ]
        },
    },
    template: `
            <div class="weather-component">
                <div class="wh100 custom-flex-center" v-if="!list.length">{{ $t("null[0]") }}</div>
                <template v-else>
                    <div class="custom-items-center component-button-weather" v-if="styleOption == 1">
                        <div class="weather-item custom-column" v-for="(el, i) in threeDayData" :key="i" 
                        :style="i != threeDayData.length ? computedStyle(item, 10, 14, 'marginRight') : {}">
                            <div>{{ $i.t("weatherData")[day[i]] }}</div>
                            <div class="weather-icon__text custom-items-center" :style="central.dynamicSize(item, 10, 328, 40, 'marginTop')">
                                <img :src="$global.getWeatherIconV2(el.weather)" :style="iconFontSize" />
                                <span :style="central.dynamicSize(item, 5, 328, 40, 'marginLeft')">{{ el.weather }}{{ el.temperature }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="custom-items-center" v-if="styleOption == 2 || styleOption == 3">
                        <div>
                            <img  v-if="styleOption == 3" :src="$global.getWeatherIconV2(threeDayData[0].weather)" :style="computedStyle(item, 20, 14, 'width')" />
                        </div>
                        <span :style="computedStyle(item, 5, 14, 'marginLeft')">{{ threeDayData[0].weather }} {{ threeDayData[0].temperature }}</span>
                    </div>
                    <div class="weather-styleoption__4 flex" v-if="styleOption == 4">
                        <div>
                            <img :src="$global.getWeatherIconV2(threeDayData[0].weather)" :style="computedStyle(item, 30, 14, 'width')" />
                        </div>
                        <div class="custom-column" :style="computedStyle(item, 5, 14, 'marginLeft')">
                            <span>{{ threeDayData[0].weather }}</span>
                            <span>{{ threeDayData[0].temperature }}</span>
                        </div>
                    </div>
                    <template v-if="styleOption == 5 || styleOption == 6 || styleOption == 7">
                        <div class="custom-column weather-styleoption__56" v-for="(el, elI) in list567" :style="elI != list567.length ? computedStyle(item, 10, 14, 'marginRight') : {}" :key="el.value">
                            <template v-if="el.value != 'envValue'">
                                <span>{{ $i.t("weatherData")[day[index567(elI)]] }}</span>
                                <div>
                                    <img :src="$global.getWeatherIconV2(threeDayData[index567(elI)].weather)" :style="[computedStyle(item, 18, 14, 'width'), computedStyle(item, 3, 14, 'marginTop'), computedStyle(item, 3, 14, 'marginBottom')]" />
                                </div>
                                <span style="computedStyle(item, 3, 14, 'marginBottom')">{{ threeDayData[index567(elI)].weather }}</span>
                                <span>{{ threeDayData[index567(elI)].temperature }}</span>
                            </template>
                            <template v-else>
                                <div>
                                    <span>{{ $i.t("weatherData")[el.label] }}：</span>
                                    <span>{{ realtime.aqi }} {{ aqiGrade(realtime.aqi) }}</span>
                                </div>
                                <div>
                                    <span>{{ $i.t("sensorText.humidity") }}：</span>
                                    <span>{{ realtime.humidity }}%</span>
                                </div>
                            </template>
                        </div>
                        <template v-if="styleOption == 7">
                            <div class="custom-column weather-styleoption__56" v-for="(el, elI) in 2" :style="computedStyle(item, 10, 14, 'marginLeft')" :key="el.value">
                                <span>{{ getDateWeek(elI) }}</span>
                                <div>
                                    <img :src="$global.getWeatherIconV2(lastTwoDayData[elI].weather)" :style="[computedStyle(item, 18, 14, 'width'), computedStyle(item, 3, 14, 'marginTop'), computedStyle(item, 3, 14, 'marginBottom')]" />
                                </div>
                                <span style="computedStyle(item, 3, 14, 'marginBottom')">{{ lastTwoDayData[elI].weather }}</span>
                                <span>{{ lastTwoDayData[elI].temperature }}</span>
                            </div>
                        </template>
                    </template>
                </template>
            </div>
        `
})


/**
 * 通话弹框
 */
Vue.component("call-canvas", {
    props: {
        item: Object,
    },
    inject: ["central"],
    data: function () {
        return {
            total: "",
            totalTime: null,
            fontSizeNum: 20,
            myCanvasSize: "min", // 默认min 说明我的是小框框 反之max 我的为大框框

            myVideoTime: null,  // 切换摄像头防抖
        }
    },
    mounted: function () {
        this.initData();
    },
    methods: {
        initData: function () {
            var nodes = ["canvasvideo", "myvideo"],
                _this = this;
            nodes.forEach(function (el) {
                var myVid = _this.$refs[el];
                myVid.addEventListener("click", mouseHandler, false);

                function mouseHandler(event) {
                    // 阻止视频默认点击事件
                    event.preventDefault()
                }
            });

            this.total = this.callTimeTotal;
        },
        addPx: function (style) {
            var keys = ['width', 'height'];
            var result = {};
            keys.forEach(function (key) {
                result[key] = style[key] + "px";
            });
            return result;
        },
        sizeStyle: function (size, key) {
            size = size || 50;
            var width = this.item.style.width * 1;
            var height = this.item.style.height * 1;

            var style = {};
            if (width > height) {
                style.height = Math.floor(size / 300 * height) + 'px';
            } else {
                style.height = Math.floor(size / 300 * width) + 'px';
            }
            if (key) style[key] = style.height;
            return style;
        },
        iconFontSizeStyle: function (size) {
            size = size || 32;
            var width = this.item.style.width * 1;
            var height = this.item.style.height * 1;

            var style = {};
            if (width > height) {
                style.fontSize = Math.floor(size / 499 * height) + 'px';
            } else {
                style.fontSize = Math.floor(size / 499 * width) + 'px';
            }
            return style;
        },
        changhangUp: function () {
            this.$emit('hang-up', this.item);
            if (this.totalTime) clearInterval(this.totalTime);
        },
        changCallType: function () {
            this.$emit('chang-type');
        },
        setMyCanvasSize: function (val) {
            this.myCanvasSize = val || "min";
        },
        changShowMyVideo: function () {
            var _this = this;
            if (this.myVideoTime) clearTimeout(this.myVideoTime);

            this.myVideoTime = setTimeout(function () {
                var node = _this.$refs.myvideo;
                _this.$emit('show-video', _this.item);
                if (!_this.showMyVideoPlay) return;
                // 显示隐藏我的视频框 暂停当前播放
                if (_this.showMyDialog) return node.play();
                _this.$nextTick(function () {
                    _this.setMyCanvasSize(!_this.showOtherDialog ? "max" : "min");
                    node.pause();
                })
            }, 700);
        },
        changeCanvas: function (min) {
            this.$emit('change-canvas', this.item);
            if (min != "min") return;
            this.setMyCanvasSize(this.myCanvasSize == "min" ? "max" : "min");
        },
        addZero: function (val) {
            return val < 10 ? "0" + val : val;
        },
        setTotalTime: function () {
            var _this = this,
                start = this.callStartTime;
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

                _this.total = text;
            }, 1000);
        },
        changeMinimize: function (e) {
            e.stopPropagation();
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            this.$emit("minimize");
        },
    },

    computed: {
        showVideoPlay: function () {
            return this.central.showVideoPlay || false;
        },
        showMyVideoPlay: function () {
            return this.central.showMyVideoPlay || false;
        },
        videoUrl: function () {
            return this.central.videoUrl.url || "";
        },
        myVideoUrl: function () {
            return this.central.myVideoUrl.url || "";
        },
        callStartTime: function () {
            return this.central.callStartTime || null;
        },
        callTimeTotal: function () {
            return this.central.callTimeTotal || null;
        },
        showMyDialog: function () {
            return this.central.showMyDialog || false;
        },
        showOtherDialog: function () {
            return this.central.showOtherDialog || false;
        },
        showCallLoading: function () {
            return this.central.showCallLoading || false;
        },
        callType: function () {
            return this.central.callType;
        },
        myNotVideoEmpty: function () {
            return this.central.myNotVideoEmpty || false;
        },
        notVideoEmpty: function () {
            return this.central.notVideoEmpty || false;
        },

        canvasVideoStyle: function () {
            if (this.myCanvasSize == "max") return this.myStyle;
            return {
                // height: this.otherStyle + "px"
                height: "100%"
            };
        },
        myCanvasVideoStyle: function () {
            if (this.myCanvasSize == "max") return {
                // height: this.otherStyle + "px"
                height: "100%"
            };
            return this.myStyle;
        },

        otherStyle: function () {
            return (this.item.style.height * 1) - (this.sizeStyle().height.replace("px", "") * 1);
        },
        myStyle: function () {
            var width = this.item.style.width * 1,
                height = this.item.style.height * 1,
                w = 300 + 2,
                h = 170 + 2;

            var style = {};
            if (width > height) {
                style.width = Math.floor(w / 499 * height) + 'px';
                style.height = Math.floor(h / 499 * height) + 'px';
            } else {
                style.width = Math.floor(w / 499 * width) + 'px';
                style.height = Math.floor(h / 499 * width) + 'px';
            }
            return style;
        },
        showEmpty: function () {
            return !this.showMyDialog && !this.showOtherDialog;
        },
        itemBoxRadius: function () {
            var width = this.item.style.width * 1;
            var height = this.item.style.height * 1;

            var style = {};
            if (width > height) {
                style.borderRadius = Math.floor(20 / 499 * height) + 'px';
            } else {
                style.borderRadius = Math.floor(20 / 499 * width) + 'px';
            }
            return style;
        },
        timeMargin: function () {
            var width = this.myStyle.width;
            return {
                width: width.replace("px", "") - 50 + "px"
            }
        },
    },
    watch: {
        showOtherDialog: function (val) {
            // 监听对方是否关闭摄像头 如果是则让自己的显示为最大 反之自己最小
            this.setMyCanvasSize(!val ? "max" : "min");
        },
        callTimeTotal: function (val) {
            this.total = val;
        }
    },
    //  v-loading="showCallLoading"
    template: `
        <div class="call-container custom-absolute">
            <div class="canvas-video-container wh100 empty" v-if="showEmpty"></div>
            <div class="custom-absolute lt0 minimize-container">
                <div class="minimize-content pointer custom-items-center" @click="changeMinimize" :title="$t('ccjs61')">
                    <i class="el-icon-minus"></i>
                </div>
            </div>
            <!-- 对方的视频 -->
            <div
                :class="
                    myCanvasSize == 'min'
                    ? 'canvas-video-container wh100'
                    : 'custom-absolute my-canvas-video-container'
                "
                v-show="showOtherDialog"
                @click="changeCanvas(myCanvasSize == 'min' ? 'max' : 'min')"
                :style="canvasVideoStyle"
            >
                <video
                    id="canvasvideo"
                    ref="canvasvideo"
                    class="video wh100"
                    :src="videoUrl"
                    controls
                    loop
                    v-show="showVideoPlay"
                ></video>
                <canvas id="on-call" class="wh100" v-show="!showVideoPlay"></canvas>
                
                <div v-if="notVideoEmpty" class="not-call-video">{{ $t("ccjs2") }}</div>
            </div>
            <!-- 我的视频 -->
            <div
                :class="
                    myCanvasSize == 'min'
                    ? 'custom-absolute my-canvas-video-container'
                    : 'canvas-video-container wh100'
                "
                v-show="showMyDialog"
                @click="changeCanvas(myCanvasSize)"
                :style="myCanvasVideoStyle"
            >
                <video
                    id="myvideo"
                    ref="myvideo"
                    class="video wh100"
                    :src="myVideoUrl"
                    controls
                    loop
                    v-show="showMyVideoPlay"
                ></video>
                <canvas id="my-on-call" class="wh100" v-show="!showMyVideoPlay"></canvas>

                <div v-if="myNotVideoEmpty" class="not-call-video">{{ $t("ccjs2") }}</div>
            </div>

            <div class="call-canvas-bottom custom-flex-center" :style="sizeStyle()">
                <!-- 计时器 -->
                <div class="call-time" v-if="callStartTime" :style="[iconFontSizeStyle(25),timeMargin]">{{ total }}</div>
                <!-- 挂断 -->
                <div class="bottom-item" @click="changhangUp">
                    <div class="bottom-icon-box" :style="[sizeStyle(45, 'width'),itemBoxRadius]">
                        <i class="iconfont iconjisuanqi" :style="iconFontSizeStyle()"></i>
                        <span :style="iconFontSizeStyle(fontSizeNum)">{{ $t("ipButtonText[1]") }}</span>
                    </div>
                </div>
                <!-- 转换通话类型 -->
                <div class="bottom-item" @click="changCallType" v-if="callType == 1">
                    <div class="bottom-icon-box turn-type" :style="[sizeStyle(45, 'width'),itemBoxRadius]">
                        <i :class="callType == 1 ? 'el-icon-microphone' : 'iconfont iconshexiangtou1'" :style="iconFontSizeStyle()"></i>
                        <span :style="iconFontSizeStyle(fontSizeNum)" v-if="callType == 1">{{ $t(callType == 1 ? "ccjs53" : "ccjs55") }}</span>
                    </div>
                </div>
                <!-- 是否开启我的视频 -->
                <div class="bottom-item" v-if="callType == 1" @click="changShowMyVideo">
                    <div class="bottom-icon-box turn-type" :style="[sizeStyle(45, 'width'),itemBoxRadius]">
                        <i class="iconfont" :class="showMyDialog ? 'iconshexiangtou1' : 'iconshexiangtou_guanbi'" :style="iconFontSizeStyle()"></i>
                        <span :style="iconFontSizeStyle(fontSizeNum)">{{ $t("ccjs54") }}</span>
                    </div>
                </div>
            </div>
        </div>
        `
})

/**
 * 线条
 */
 Vue.component("button-line", {
    props: {
        item: Object,
        transForm: Function,
        componentWHLT: Function
    },
    inject: ["central"],
    methods: {
        
    },
    computed: {
        linStyle: function () {
            var item = this.item,
                style = {},
                width = item.style.width * 1,
                borderWidth = item.style.borderWidth,
                height = item.style.height * 1;
            if (width >= height) {
                style.width = width + "px";
                style.height = "1px";
                style.borderTopWidth = borderWidth + "px";
                style.borderTopColor = item.style.borderColor;
                style.borderTopStyle = item.style.borderStyle;
            } else {
                style.height = height + "px";
                style.width = "1px";
                style.borderLeftWidth = borderWidth + "px";
                style.borderLeftColor = item.style.borderColor;
                style.borderLeftStyle = item.style.borderStyle;
            }
            return style;
        },
    },
    template: `
            <div>
                <div :style="linStyle" class="custom-absolute"></div>
            </div>
        `
})

/**
 * 日期
 */
 Vue.component("button-date", {
    props: {
        item: Object,
    },
    data: function () {
        return {
            activeComponent: null
        }
    },
    inject: ["central"],
    methods: {
        
    },
    computed: {
        styleOption: function () {
            return this.item.styleOption;
        },
        currDate: function () {
            var date = new Date(),
                styleOption = this.styleOption,
                format = {
                    0: "YYYY-MM-DD",
                    1: "YYYY/MM/DD",
                    2: "YYYY年MM月DD日",
                    3: "YYYY-MM-DD",
                    4: "YYYY/MM/DD",
                    5: "YYYY年MM月DD日",
                },
                week = date.getDay() == 0 ? 7 : date.getDay();

            var newDate = this.$global.formatDate(date, format[styleOption - 1]);
            if (styleOption <= 3) return newDate;
            return newDate + " " + $i.t("weeks")[week - 1];
        },
    },
    template: `<div>
        <div :style="item.title.show ? central.dynamicSize(item, paddingNum[item.type], null, null, 'paddingLeft') : ''">
            {{ currDate }}
        </div>
    </div>`
})

/**
 * 时间
 */
 Vue.component("button-datetime", {
    props: {
        item: Object,
    },
    data: function () {
        return {
            activeComponent: null,
            date: new Date(),
            time: null,
            transform: {
                h: "",
                m: "",
                s: ""
            },
            transformTime: null
        }
    },
    mounted: function () {
        this.initTimer();
    },
    inject: ["central"],
    methods: {
        initTimer: function () {
            var _this = this;
            if (this.styleOption == 5) {
                if (this.transformTime) {
                    clearInterval(this.transformTime);
                    this.transformTime = null;
                }
                this.pointerTransform();
                this.transformTime = setInterval(function () {
                    _this.pointerTransform();
                }, 1000);
                return;
            }
            var number = 1000;
            if (this.styleOption == 0 || this.styleOption == 2) number = number * 6;
            if (this.time) {
                clearInterval(this.time);
                this.time = null;
            }
            this.time = setInterval(function () {
                _this.date = new Date();
            }, number)
        },
        /**
         * 指针旋转角度
         */
        pointerTransform: function () {
            var newDate = new Date(),
                hours = newDate.getHours(),
                minutes = newDate.getMinutes(),
                seconds = newDate.getSeconds(),
                ms = newDate.getMilliseconds();//得到当前毫秒


            var srotate = seconds + ms / 1000;

            var mrotate = minutes + srotate / 60;

            var hrotate = hours % 12 + (minutes / 60);
            this.$set(this.transform, "s", 'rotate(' + srotate * 6 + 'deg)');
            this.$set(this.transform, "m", 'rotate(' + mrotate * 6 + 'deg)');
            this.$set(this.transform, "h", 'rotate(' + hrotate * 30 + 'deg)');
        },
        pointerStyle: function (type, w, h) {
			var clockStyle = this.styleOption5Style;
			var num = {};
			for (var key in clockStyle) {
                num[key] = clockStyle[key].replace("px", "");
            }

            var width = (num.width / (70 / w)).toFixed(2);
			var height = (num.height / (70 / h)).toFixed(2);
            var left = num.width / 2 - (width / 2);
            var top = num.height / 2 - height;
            var transform = this.transform;
			return {
                width: width + "px",
                height: height + "px",
                left: left + "px",
                top: top + "px",
                transform: transform[type],
            }
		}
    },
    computed: {
        styleOption: function () {
            return this.item.styleOption;
        },
        currTime: function () {
            var date = this.date,
                styleOption = this.styleOption,
                format = {
                    0: "HH:mm",
                    1: "HH:mm:ss",
                    2: "a HH:mm",
                    3: "a HH:mm:ss",
                };

            var time = this.$global.formatDate(date, format[styleOption - 1]);
            if (styleOption >= 3) {
                return time.replace(/pm|am/, function (val) {
                    return val == 'pm' ? val = $i.t('afternoon') : $i.t('morning')
                });
            }

            return time;
        },
        styleOption5Style: function () {
            var style = this.item.style;
            var  borderWidth = style.borderWidth * 2,
                width = style.width - borderWidth,
                height = style.height - borderWidth;

            var min = Math.min(width, height);
            return {
                width: min + "px",
                height: min + "px"
            }
        },
    },
    beforeDestroy: function () {
        if (this.time) {
            clearInterval(this.time);
            this.time = null;
        }
        if (this.transformTime) {
            clearInterval(this.transformTime);
            this.transformTime = null;
        }
    },
    template: `<div :style="item.title.show ? central.dynamicSize(item, paddingNum[item.type], null, null, 'paddingLeft') : ''">
        <div v-if="styleOption != 5">
            {{ currTime }}
        </div>
        <div v-else class="custom-relative" :style="styleOption5Style">
            <div class="custom-absolute datetime-ointer" :style="pointerStyle('h', 1.5, 15)"></div>
            <div class="custom-absolute datetime-ointer" :style="pointerStyle('m', 1, 20)"></div>
            <div class="custom-absolute datetime-ointer" :style="pointerStyle('s', 0.5, 23)"></div>
            <img class="wh100" :src="$global.fullStaticUrl('public/images/admin/control/time1.png')" />
        </div>
    </div>`
})




/**
 * v2标题
 */
Vue.component("my-v2-title", {
    props: {
        text: String
    },
    methods: {
        
    },
    computed: {},
    template: `
            <div class="my-v2-title">
                <div class="title-container">
                    <span class="title-text">{{ text }}</span>
                </div>
            </div>
        `
})

/**
 * v2标题
 */
 Vue.component("my-v2-date", {
    props: {
        active: String
    },
    data: function () {
        return {
            listValue: ["today", "week", "month", "year"],
            myActive: ""
        }
    },
    mounted () {
        this.initData();
    },
    methods: {
        initData: function () {
            this.myActive = this.active;
        },
        changeDate: function (index) {
            this.myActive = index;
            this.$emit("change", index);
        }
    },
    computed: {
        list: function () {
            $i.t("ComponentList.v2DateList");
        }
    },
    watch: {
        myActive: function (val) {
            this.$emit("update:active", val);
        },
        active: function (val) {
            this.myActive = val;
        }
    },
    template: `
            <div class="my-v2-date">
                <div class="date-container flex">
                    <div v-show="item" class="date-item pointer" @click="changeDate(index)" :class="{'active': index == myActive }" v-for="(item, index) in list" :key="listValue[index]">
                        <span>{{ item }}</span>
                    </div>
                </div>
            </div>
        `
})