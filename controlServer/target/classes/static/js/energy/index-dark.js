var ajax = new Ajax(_config);
var $i = $i18n.obj;

//将后台的json转成jsonTree格式
var jsonTree = function (data, config) {
    var id = config.id || 'id',
        pid = config.pid || 'pid',
        children = config.children || 'children';
    var idMap = [],
        jsonTree = [];
    data.forEach(function (v) {
        idMap[v[id]] = v;
    });
    data.forEach(function (v) {
        var parent = idMap[v[pid]];
        if (parent) {
            !parent[children] && (parent[children] = []);
            parent[children].push(v);
        } else {
            jsonTree.push(v);
        }
    });
    return jsonTree;
};

var chart1 = null;
var chart2 = null;
var chart3 = null;
window.onresize = function () {
    if (chart1 !== null) {
        chart1.resize();
    }
    if (chart2 !== null) {
        chart2.resize();
    }
    if (chart3 !== null) {
        chart3.resize();
    }
}

var _value = [40, 25, 30, 20, 34, 15];
var _name = ['办公用电', '照明', '备用', '电梯', '其他', '风机'];
var _color = ['#F99300', '#25A0FE', '#557CF5', '#57DEB6', '#5EC9FF', '#F3637C'];
var pieData = [];
var nameMap = {
    办公用电: 40,
    照明: 25,
    备用: 30,
    电梯: 20,
    其他: 34,
    风机: 15,
}
// for (var i = 0; i < _name.length; i++) {
//     var item = {
//         value: _value[i],
//         name: _name[i],
//         // itemStyle: {
//         //     color: _color[i]
//         // }
//     };
//     pieData.push(item);
// }
var chart_option_1 = {
    tooltip: {                  // hover 提示
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    graphic: [{                 // 自定义小图标
        type: 'image',
        z: 100,
        top: "25%",
        left: "18%",
        style: {
            // x: 88,
            // y: 78,
            width: 64,
            image: _config.staticPath + "/public/images/energy/01.png",
        }
    }],
    legend: {                   // 标签统计
        top: 10,
        right: 40,
        orient: "vertical",
        show: true,
        itemGap: 29,
        // 等下把它抽出去，函数参数传进来。闭包，可针对性文字处理
        formatter: function(name) {
            if(!chart_option_1.series[0].data || chart_option_1.series[0].data.length === 0) {
                return name + "    " + "0%"
            }
            return name + "    " + nameMap[name] + "%";
        },
        type: 'scroll',
        pageIconColor: '#6495ed',
        pageIconInactiveColor: '#aaa',
        pageIconSize: 11,
        tooltip: {
            show: true,
            formatter: function(param) {
                var name = param.name;
                if(!chart_option_1.series[0].data || chart_option_1.series[0].data.length === 0) {
                    return name + "    " + "0%"
                }
                return name + "    " + nameMap[name] + "%";
            },
        },
        icon: "pin",
        textStyle: {
            color: "white",
            fontSize: 14,
            fontWeight: "bold",
            width: 120,
            overflow: "truncate"
        }
    },
    series: [
        {
            name: $i.t('p11'),
            type: 'pie',
            radius: ['78%', '100%'],
            top: -70,
            left: 20,
            width: "40%",
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: false,
                    fontSize: '40',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            color: _color,
            data: pieData,
        }
    ]
};


var chart_option_2 = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow',
            label: {
                show: false
            }
        },
        // formatter: function (params, ticket, callback) {
        //     console.log(params, params[1].value);
        //     console.log(params[0].seriesId);
        //     setTimeout(function () {
        //         callback(ticket, "hello");
        //     }, 2000)
        //     return `
        //     ${params[0].name}<br>
        //     ${params[0].marker} ${params}

        //     `;
        // }
    },
    calculable: true,
    grid: {
        bottom: "8%",
    },
    legend: {
        icon: "pin",
        textStyle: {
            color: "white"
        }
    },
    color: ["#57DEB6", "#F3637C"],
    xAxis: {
        type: 'category',
        name: $i.t('p12'),
        // data: xAxisData,
        data: [],
        axisLabel: {
            fontSize: 10,
            color: "white"
            // rotate: 45
        },
        nameTextStyle: {
            color: "white"
        },
        axisLine: {
            lineStyle: {
                color: "white"
            }
        }
    },
    yAxis: {
        type: 'value',
        name: 'Kwh',
        axisLabel: {
            formatter: function (a) {
                a = +a;
                return isFinite(a) ? echarts.format.addCommas(+a) : '';
            },
            color: "white"
        },
        nameTextStyle: {
            color: "white"
        }
    },
    series: [{
        name: $i.t('p13'),
        type: "bar",
        data: [],
    }, {
        name: $i.t('p14'),
        type: "bar",
        data: [],
    }]
}

var xAxisData = [];
var chart_option_3 = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow',
            label: {
                show: true
            }
        }
    },
    calculable: true,
    grid: {
        bottom: "8%",
    },
    legend: {
        textStyle: {
            color: "white"
        }
    },
    color: ["#57DEB6", "#F3637C"],
    xAxis: {
        type: 'category',
        name: $i.t('p12'),
        data: xAxisData,
        axisLabel: {
            fontSize: 10,
            // rotate: 45
            color: "white"
        },
        nameTextStyle: {
            color: "white"
        }
    },
    yAxis: {
        type: 'value',
        name: 'Kwh',
        axisLabel: {
            formatter: function (a) {
                a = +a;
                return isFinite(a) ? echarts.format.addCommas(+a) : '';
            },
            color: "white"
        },
        nameTextStyle: {
            color: "white"
        }
    },
    series: [{
        name: $i.t('p13'),
        type: "line",
        data: [],
        connectNulls: true
    }, {
        name: $i.t('p14'),
        type: "line",
        data: [],
        connectNulls: true
    }]
}

var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    data: {
        placeData: [],
        placeIds: 0,                  // 区域
        time: 'daily',                // 选择时间的类型
        date: null,                   // 选择日期
        chartLoading: false,

        tableData: [],
    },
    created: function () {
        // window._this = this;
        // window.top._this = this;
        this.initPlaceData();
    },
    mounted: function () {
        var _this = this;
        setTimeout(function() {
            _this.initChart();
        }, 0)
    },
    methods: {        
        // region # 请求接口并初始化数据
        initPlaceData: function() {                     // 初始化区域列表
            var _this = this;
            var param = {
                permissionFlag: "energyAnalysis"
            }

            ajax.handle("get", "api/eastcato/airswitch/places", param, null, function(json) {
                var data = json.data;
                _this.placeData = jsonTree(data, {});
            }, function(err) {
                _this.$message.error(_this.$t('placeholder.h2'));
            })
        },
        getChartsData: function() {                     // 获取echart数据
            var param = {
                placeId: this.placeIds || 0,
                date: this.date,               // 格式：yyyy-MM-dd ...
                type: this.time                // daily  month  year
            }

            // this.chartLoading = true;
            var _this = this;
            ajax.handle("get", "api/eastcato/airswitch/listDevicesCompareBattery", param, {
                obj: this,
                lname: 'chartLoading'
            }, function (rs) {
                var data = rs.data;
                // console.log(data);
                // ---
                var pieData = [];
                var legendData = [];
                // 瓦时转千瓦时，以及收集饼图所需数据
                data.forEach(function(item) {
                    item.battery /= 1000;
                    item.latelyBattery /= 1000;
                    nameMap[item.name] = item.percentage;
                    pieData.push({
                        name: item.name,
                        value: item.battery
                    });
                })
                _this.tableData = data;
                
                // 饼图，总能耗的使用占比
                _this._updateChart1(pieData, legendData);
            }, function (rs) {
                _this.$message.error(_this.$t('placeholder.h1'));
                // _this.chartLoading = false;
            }, function (err) {
                _this.$message.error(_this.$t('placeholder.h1'));
                // _this.chartLoading = false;
            });

            ajax.handle("get", "api/eastcato/airswitch/listBatteryHistory", param, {
                obj: this,
                lname: 'chartLoading'
            }, function (rs) {
                var data = rs.data;
                // console.log(data);
                // ---
                var battery_list = [];
                var latelyBattery_list = []
                var xAxisData = [];
                data.forEach(function(item) {
                    // 转千瓦时
                    item.battery /= 1000;
                    item.latelyBattery /= 1000;
                    // 收集echart数据
                    battery_list.push(item.battery);
                    latelyBattery_list.push(item.latelyBattery);
                    // 收集x轴坐标刻度
                    xAxisData.push(item.time);
                })
                _this.updateChart3AndChart2(battery_list, latelyBattery_list, xAxisData);
            }, function (rs) {
                _this.$message.error(_this.$t('placeholder.h1'));
                // _this.chartLoading = false;
            }, function (err) {
                _this.$message.error(_this.$t('placeholder.h1'));
                // _this.chartLoading = false;
            });
        },
        updateChart3AndChart2: function(battery_list, latelyBattery_list, xAxisData) {              // 更新echart示例
            var val = this.time;
            switch(val) {
                case 'daily':
                    this.$nextTick(function() {
                        var xAxisData = [];
                        for(var i = 0; i < 24; i++) {
                            xAxisData.push(i);
                        }
                        this._updateChart2(this.column[2], battery_list, this.column[4], latelyBattery_list, "小时", xAxisData);
                        this._updateChart3(this.column[2], battery_list, this.column[4], latelyBattery_list, "小时", xAxisData);
                    })
                    break;
                case 'month':
                    this.$nextTick(function() {
                        var xAxisData = [];
                        var m = this._getDateCount(this.date);
                        for(var i = 1; i <= 31; i++) {
                            xAxisData.push(i);
                        }
                        this._updateChart2(this.column[2], battery_list, this.column[4], latelyBattery_list, "号", xAxisData);
                        this._updateChart3(this.column[2], battery_list, this.column[4], latelyBattery_list, "号", xAxisData);
                    })
                    break;
                case 'year':
                    this.$nextTick(function() {
                        var xAxisData = [];
                        for(var i = 1; i <= 12; i++) {
                            xAxisData.push(i);
                        }
                        this._updateChart2(this.column[2], battery_list, this.column[4], latelyBattery_list, "月份", xAxisData);
                        this._updateChart3(this.column[2], battery_list, this.column[4], latelyBattery_list, "月份", xAxisData);
                    })
                    break;
            }
        },
        // endregion

        // region # 初始化echart示例
        initChart: function() {
            this._updateChart1();
            this._updateChart2();
            this._updateChart3();
        },
        _updateChart1: function(seriesData, legendData) {
            if(chart1 === null) {
                chart1 = echarts.init(document.getElementById('echart1'));
            }

            seriesData && (chart_option_1.series[0].data = seriesData);
            // legendData && (chart_option_1.legend.data = legendData);
            
            chart1.setOption(chart_option_1, true);
        },
        _updateChart2: function(seriesName1, seriesData1, seriesName2, seriesData2, xAxisName, xAxisData) {
            if(chart2 === null) {
                chart2 = echarts.init(document.getElementById('echart2'));
            }
            xAxisName && (chart_option_2.xAxis.name = xAxisName);
            xAxisData && (chart_option_2.xAxis.data = xAxisData);
            seriesName1 && (chart_option_2.series[0].name = seriesName1);
            seriesData1 && (chart_option_2.series[0].data = seriesData1);
            seriesName2 && (chart_option_2.series[1].name = seriesName2);
            seriesData2 && (chart_option_2.series[1].data = seriesData2);
            chart2.setOption(chart_option_2, true);
        },
        _updateChart3: function(seriesName1, seriesData1, seriesName2, seriesData2, xAxisName, xAxisData) {
            if(chart3 === null) {
                chart3 = echarts.init(document.getElementById('echart3'));
            }
            xAxisName && (chart_option_3.xAxis.name = xAxisName);
            xAxisData && (chart_option_3.xAxis.data = xAxisData);
            seriesName1 && (chart_option_3.series[0].name = seriesName1);
            seriesData1 && (chart_option_3.series[0].data = seriesData1);
            seriesName2 && (chart_option_3.series[1].name = seriesName2);
            seriesData2 && (chart_option_3.series[1].data = seriesData2);
            chart3.setOption(chart_option_3, true);
        },
        // endregion

        // region # 工具方法
        _getDateCount: function(obj) {                           // 根据时间戳或日期对象获取当前月的总天数
            var now = null;
            if (/Date/.test(Object.prototype.toString.call(obj))) {
                now = obj;
            }else{
                obj = obj || Date.now();
                now = new Date(obj);
            }
            now.setMonth(now.getMonth() + 1);
            now.setDate(0);
            // console.log(now.toLocaleDateString());
            return now.getDate();
        },
        _sameDate: function(type, date) {                        // 比较两个时间
            var now = new Date();
            var YYYY = now.getFullYear();
            var MM = now.getMonth();
            var DD = now.getDate();

            var date = new Date(date);
            if (type === 'daily') {
                if(moment().format("YYYY-MM-DD") === date) {
                    return true;
                }
                return false;
            }
            if (type === 'month') {
                if(moment().format("YYYY-MM") === date) {
                    return true;
                }
                return false;
            }
            if (type === 'year') {
                if(moment().format("YYYY") === date) {
                    return true;
                }
                return false;
            }
        },
        // endregion

        // region # 导出
        downloadHandler: function(type) {
            switch(type) {
                case 0 : {
                    var url = _config.staticPath
                        + "/api/eastcato/airswitch/exportDevicesCompareBattery" 
                        + "?placeId" + (this.placeIds || 0)
                        + "&date=" + this.date
                        + "&type=" + this.time;

                    $u.openDownload(url);
                    break;
                }
                case 1 : {
                    var url = _config.staticPath
                        + "/api/eastcato/airswitch/exportBatteryHistory"
                        + "?placeId" + (this.placeIds || 0)
                        + "&date=" + this.date
                        + "&type=" + this.time;

                    $u.openDownload(url);
                    break;
                }
            }
        },
        // endregion
    },
    computed: {
        datePickerOption: function() {                           // 选择时间类型映射对应饿了么日期选择组件，并重置默认当前时间
            var typeMap = {
                'daily': {
                    type: "date",
                    placeholder: "选择日",
                    format: "yyyy年MM月dd日",
                    "value-format": "yyyy-MM-dd",
                    'picker-options': {
                        disabledDate: function(date) {
                            var now = new Date();
                            if(date.getTime() > now.getTime()) {
                                return true;
                            }
                            return false;
                        }
                    },
                    clearable: false
                },
                'month': {
                    type: "month",
                    placeholder: "选择月",
                    format: "yyyy年MM月",
                    "value-format": "yyyy-MM",
                    'picker-options': {
                        disabledDate: function(date) {
                            var now = new Date();
                            if(date.getTime() > now.getTime()) {
                                return true;
                            }
                            return false;
                        }
                    },
                    clearable: false
                },
                'year': {
                    type: "year",
                    placeholder: "选择年",
                    format: "yyyy年",
                    "value-format": "yyyy",
                    'picker-options': {
                        disabledDate: function(date) {
                            var now = new Date();
                            if(date.getTime() > now.getTime()) {
                                return true;
                            }
                            return false;
                        }
                    },
                    clearable: false
                }
            };
            switch(this.time) {
                case 'daily':
                    this.date = moment().format("YYYY-MM-DD");
                    break;
                case 'month':
                    this.date = moment().format("YYYY-MM");
                    break;
                case 'year':
                    this.date = moment().format("YYYY");
                    break;
            }
            return typeMap[this.time];
        },
        column: function () {
            var date = moment(this.date).toDate();
            var val = this.time;
            var label2, label4;
            switch(val) {
                case 'daily':
                    if(this._sameDate(val, this.date)) {
                        label2 = this.$t('dialog.h10');
                        label4 = this.$t('dialog.h11')
                    }else {
                        label2 = date.getDate() + this.$t('dialog.h12');
                        date.setDate(date.getDate() - 1);
                        label4 = date.getDate() + this.$t('dialog.h13');
                    }
                break;
                case 'month':
                    if(this._sameDate(val, this.date)) {
                        label2 = this.$t('dialog.h14');
                        label4 = this.$t('dialog.h15');
                    }else {
                        label2 = date.getMonth() + 1 + this.$t('dialog.h16');
                        console.log(date.toLocaleDateString());

                        
                        date.setMonth(date.getMonth() - 1);
                        console.log(date.toLocaleDateString());
                        label4 = date.getMonth() + 1 + this.$t('dialog.h17');
                    }
                break;
                case 'year':
                    if(this._sameDate(val, this.date)) {
                        label2 = this.$t('dialog.h18');
                        label4 = this.$t('dialog.h19');
                    }else {
                        label2 = date.getFullYear() + this.$t('dialog.h20')
                        date.setFullYear(date.getFullYear() - 1);
                        label4 = date.getFullYear() + this.$t('dialog.h21');
                    }
                break;
            }
            return {
                2: label2,
                4: label4
            }
        }
    },
    watch: {
        date: function() {
            this.getChartsData();
        },
        placeIds: function() {
            this.getChartsData(); 
        }
    },
    filters: {
    },
    directives: {
    },
})

