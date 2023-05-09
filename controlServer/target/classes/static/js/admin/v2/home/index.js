var minInterval = 10;
var TEMPERATURE_MIN = 55;
var TEMPERATURE_MAX = 90;

// region # 数据刷新间隔

var DATA_REFRESH_INTERVAL_IP = 60000;
var DATA_REFRESH_INTERVAL_REPAIR = 60000 * 3;

// endregion

var PAGE_NAME = "v2HomeIndex";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;

var vue = new Vue({
  el: "#app",
  i18n: $i18n.obj,
  data: function () {
    return {
      showTrueMap: true,
      meetingList: [],
      meetingStatusColor: ["#FFFF00", "#3CFF00", "#FF7A56"],

      dataZoomTime: {
        // 自动滚动定时器
        floor: null,
        placeAssets: null,
        totalTime: null,
      },
      mapLoading: false,
      echarLoading: {
        classroom: false, // 课室使用情况loading
        systemInfo: false, // 服务器使用数据loading
        assets: false, // 资产loading
        courseTotal: false, // 课程数据
        env: false,
      },
      time: {
        systemInfo: null,
        systemInfoNumber: 5000, // 服务器
        internetSpeed: null, // 运行时长

        assets: null,
        assetsNUmber: 60000 * 3, // 资产分布

        courseTotal: null,
        courseTotalNumber: 60000 * 3, // 课程数据

        classroom: null,
        classroomNumber: 60000, // 课室使用情况

        env: null,
        envNumber: 60000 * 3, // 环境

        meeting: null, // 会议列表
        meetingNumber: 60000,
      },

      outActiveData: [], // 课室使用外层数据
      classroomRate: 0, // 当前使用率
      rateCenterData: ["50%", "center"], // 对齐方式
      ratePieData: [], // 课室使用外层装饰 暂未用到

      classroomTotalData: [], // 课室所有统计列表
      classroomParams: {
        type: 0,
        date: [],
      },

      floorData: [0], // 开启和未开启数据

      totalTime: 0, // 使用时长
      averageTime: 0, // 平均时长
      totalTimeData: [0], // 时长数据

      courseTotalData: [
        { name: "会议总数", value: 0, color: "#43E7FF", type: "totalCount" },
        { name: "已通过会议", value: 0, color: "#F8FF43", type: "syncCount" },
        { name: "待审核会议", value: 0, color: "#43FF84", type: "passCount" },
        { name: "已结束会议", value: 0, color: "#FF9043", type: "endCount" },
      ],
      courseData: [
        // 课程对比
        {
          value: 0,
          name: "预约会议完成率对比",
          type: "passRatio",
        },
        {
          value: 0,
          name: "已结束对比",
          type: "endRatio",
        },
        {
          value: 0,
          name: "总数完成率对比",
          type: "totalRatio",
        },
      ],
      courseParams: {
        type: 0,
      },

      mapClassroomData: {
        total: {
          name: "今日会议总数",
          value: 0,
          color: "#2CFEFB",
        },
        notStart: {
          name: "未开始会议数",
          value: 0,
          color: "#FFFF00",
        },
        afoot: {
          name: "进行中会议数",
          value: 0,
          color: "#3CFF00",
        },
        complete: {
          name: "已结束会议数",
          value: 0,
          color: "#FF7A56",
        },
      },

      internetSpeedTime: "", // 服务器运行时长
      internetSpeed: 0, // 网速
      statusRateData: [
        { name: "CPU", icon: "cpu", value: 0, id: "cpu" },
        { name: "内存", icon: "memory", value: 0, id: "memory" },
        { name: "硬盘", icon: "caliche", value: 0, id: "caliche" },
        { name: "温度", icon: "temperature", value: 0, id: "temperature" },
      ], // 硬件使用

      airQualityNumber: 0, // 空气质量
      airQualityText: "", // 优 || 良 || 中 || 差
      airQualityActiveData: [], // 环境外环数据 写死
      airQualityData: [
        { icon: "co2", name: "CO2", type: "co2", unit: "ppm", value: 0 },
        { icon: "beam", name: "甲醛", type: "hcho", unit: "μg/m3", value: 0 },
        { icon: "temperature", name: "温度", type: "temperature", unit: "℃", value: 0 },
        { icon: "humidity", name: "湿度", type: "humidity", unit: "%", value: 0 },
        { icon: "PM2.5", name: "PM2.5", type: "pm25", unit: "ppm", value: 0 },
        { icon: "PM10", name: "PM10", type: "pm10", unit: "ug/m3", value: 0 },
      ], // 环境列表数据

      assetsData: [
        { name: "设备总数", value: 0, color: "#FFD74D", id: "assets1", icon: "eq", type: "totalCount"},
        { name: "设备在线", value: 0, color: "#43E7FF", id: "assets2", icon: "on-line", type: "onlineCount" },
        { name: "设备离线", value: 0, color: "#FF7A56", id: "assets3", icon: "off-line", type: "offlineCount" },
      ],
      placeAssetsData: [0], // 地点资产数据

      alertLog: {
        //今日预警
        data: [],
        loading: false,
        timer: null,
      },

      /* region # ip对讲部分 */
      ip: {
        isLoading: false,
        countInfo: {
          total: 0,
          online: 0,
          offline: 0,
          callLogTotal: 0,
        },
        callBusyingList: [],
      },
      /* endregion*/

      /* region # 工单情况数据部分 */
      repair: {
        isLoading: false,
        // 1:日; 2:周; 3:月; 4:学期; 5:年
        type: 0,
      },
      /* endregion */
    };
  },
  computed: {
    normalTime: function () {
      var time = this.internetSpeedTime,
        hour = parseInt(time / (1000 * 60 * 60)),
        minutes = parseInt((time % (1000 * 60 * 60)) / (1000 * 60)),
        second = parseInt((time % (1000 * 60)) / 1000),
        arr = [hour, minutes, second],
        text = arr
          .map(function (t) {
            return t < 10 ? "0" + t : t;
          })
          .join(":");
      // if (!this.internetSpeedTime) return "00:00:00";
      return text;
    },
    co2BeamData: function () {
      var airQualityData = this.airQualityData;
      return airQualityData.filter(function (item) {
        return item.icon == "co2" || item.icon == "beam";
      });
    },
    notCo2BeamData: function () {
      var airQualityData = this.airQualityData;
      return airQualityData.filter(function (item) {
        return item.icon != "co2" && item.icon != "beam";
      });
    },
    countType2Text: function () {
      return $i.t("countType2Text");
    },
    envValue: function () {
      return $i.t("envValue");
    },
    meetingStatus: function () {
      return $i.t("meetingStatus");
    },
    meetingHeader: function () {
      return $i.t("meetingHeader");
    }
  },
  created: function () {},
  mounted: function () {
    this.initData();

    // TODO
    if (openIpIntercom) this._initChartIp();
    var _this = this;
    this.$nextTick(function () {
      _this._initChartRepair();
    });
  },
  methods: {
    initData: function () {
      var _this = this;
      // 初始化时间 并发送请求 课程数据
      this.initClassroomDate();
      this.setIntervalGetData(
        "meeting",
        "meetingNumber",
        "http_getMeetingList"
      );

      // 课程数据对比率
      this.setIntervalGetData(
        "courseTotal",
        "courseTotalNumber",
        "http_getMeetingTotalStatistics"
      );

      // 网速 || 硬件运行
      this.setIntervalGetData(
        "systemInfo",
        "systemInfoNumber",
        "http_getSystemInfo"
      );
      // 空气质量
      this.setIntervalGetData("env", "envNumber", "http_getEnvInfo");

      // 地点资产
      this.setIntervalGetData(
        "assets",
        "assetsNUmber",
        "http_getOnlineStatistics"
      );
      //智能预警
      this.initAlertLogs();

      // this.mapLoading = true;
      // setTimeout(function () {
      //   // 地图
      //   if (_this.showTrueMap) _this.initMap();
      //   _this.$nextTick(function () {
      //     _this.mapLoading = false;
      //   });
      // }, 2000);
    },
    /**
     * 定时获取数据
     * @param {*} timeName 定时名称 （time.xxx
     * @param {*} timeNum 定时时间 （time.xxx
     * @param {*} methods 获取数据的方法
     */
    setIntervalGetData: function (timeName, timeNum, methods) {
      var _this = this;
      if (this.time[timeName]) {
        clearInterval(this.time[timeName]);
        this.time[timeName] = null;
      }
      this[methods]();
      this.time[timeName] = setInterval(function () {
        _this[methods](true);
      }, this.time[timeNum]);
    },
    http_getMeetingList: function () {
      var url = "/api/v2/home/meetings/date",
        _this = this,
        config = {
          loading: false
        };

        this.$http.get(url, null, config).then(function (res) {
          _this.meetingList = res.data;
          _this.$set(_this.mapClassroomData.total, "value", res.data.length);
          var newDate = new Date().getTime();
          var data = {
            notStart: 0,
            afoot: 0,
            complete: 0,
          }
          _this.meetingList.forEach(function (item, index) {
            var status = 0,
              start = item.startTime,
              end = item.endTime;
            if (start <= newDate && end >= newDate) {
              status = 1; // 进行中
              data.afoot ++;
            }
            if (end < newDate) {
              status = 2; // 已结束
              data.complete ++;
            }
            _this.$set(item, "myStatus", status);
            _this.$set(item, "myNumber", index + 1);
            if(item.user != null && item.user.depName != null) {
               item.nickname = item.nickname + "(" + item.user.depName + ")"
            }
          });
          data.notStart = _this.meetingList.filter(function (item) {return item.myStatus === 0}).length;
          for (var key in data) {
            _this.$set(_this.mapClassroomData[key], "value", data[key]);
          }
        })
    },
    meetingItemText: function (row, key) {
      var start = this.$global.formatDate(row.startTime, "HH:mm");
      var end = this.$global.formatDate(row.endTime, "HH:mm");
      if (key == "createDate") return start + "~" + end;
      return key == "myStatus" ? this.meetingStatus[row[key]] : row[key];
    },
    /**
     * 初始化时间筛选并发送请求
     */
    initClassroomDate: function () {
      var start = new Date(moment(new Date()).startOf("month")).getTime(),
        curr = new Date().getTime();
      this.classroomParams.date = [start, curr];
      this.http_getMeetingroom(start, curr);
    },
    /**
     * 获取环境数据
     */
    http_getEnvInfo: function (hideLoading) {
      var url = "/api/v2/home/envInfo",
        _this = this,
        config = {
          loading: {
            context: this.echarLoading,
            target: "env",
          },
          showError: false,
        };

      if (this.echarLoading.env) return;

      if (hideLoading) config.loading = false;
      this.$http
        .get(url, null, config)
        .then(function (res) {
          var data = res.data;
          _this.airQualityText = data.airQuality;
          var num = ["0.20", "0.45", "0.70", "0.95"],
            text = ["差", "中", "良", "优"],
            index = text.indexOf(data.airQuality);
          _this.airQualityNumber = num[index];

          _this.initAirQualityActiveValue();
          _this.initAirQualityList(data);
        })
        .catch(function (err) {
          _this.initAirQualityActiveValue();
          _this.initAirQualityList({});
        });
    },
    /**
     * 获取服务器运行数据
     *
     * 获取不到温度的真实数据 写的是随机数
     *
     * @param {*} hideLoading 是否显示loading 定时器调用的都不显示loading
     */
    http_getSystemInfo: function (hideLoading) {
      var url = "/api/v2/home/system/info",
        _this = this,
        config = {
          loading: {
            context: this.echarLoading,
            target: "systemInfo",
          },
          showError: false,
        };

      if (this.echarLoading.systemInfo) return;

      if (hideLoading) config.loading = false;
      this.$http
        .get(url, null, config)
        .then(function (res) {
          var data = res.data;
          _this.internetSpeed = data.netWorkInfo.rxPercent * 1;
          if (!_this.time.internetSpeed) {
            _this.internetSpeedTime = data.systemUpTime;
            _this.time.internetSpeed = setInterval(function () {
              _this.internetSpeedTime += 1000;
            }, 1000);
          }
          var max = TEMPERATURE_MAX;
          var min = TEMPERATURE_MIN;
          var value = Math.floor(Math.random() * (max - min + 1)) + min;
          data.cpuInfo.temperature = value;
          _this.initStatusValue(data);
        })
        .catch(function (err) {
          _this.initStatusValue({});
        });
    },
    /**
     * 获取资产
     */
    http_getOnlineStatistics: function (hideLoading) { 
      var url = "api/v2/home/property/online/statistics",
        _this = this,
        config = {
          loading: {
            context: this.echarLoading,
            target: "assets",
          },
          showError: false,
        };
      if (this.echarLoading.assets) return;
      if (hideLoading) config.loading = false;
      this.$http
        .get(url, null, config)
        .then(function (res) {
          var data = res.data;
          _this.assetsData.forEach(function (item) {
            _this.$set(item, "value", data[item.type] || 0);
          });
          _this.initPlaceAssetsValue(data);
        })
        .catch(function () {
          _this.initPlaceAssetsValue({});
        });
    },
    /**
     * 获取课程数据总数统计
     * @param {*} hideLoading 是否隐藏loading
     */
    http_getMeetingTotalStatistics: function (hideLoading) {
      var url = "/api/v2/home/meeting/statistics",
        _this = this,
        config = {
          loading: {
            context: this.echarLoading,
            target: "courseTotal",
          },
          showError: false,
        };

      if (this.echarLoading.courseTotal) return;
      if (hideLoading) config.loading = false;
      this.$http
        .get(url, this.courseParams, config)
        .then(function (res) {
          // courseTotal
          var data = res.data;
          _this.courseTotalData.forEach(function (item) {
            _this.$set(item, "value", data[item.type] || 0);
          });
          _this.initCourseValue(data);
        })
        .catch(function (err) {
          _this.initCourseValue({});
        });
    },
    /**
     * 获取课室使用情况数据
     * @param {*} startDate 开始时间
     * @param {*} endDate 结束时间
     */
    http_getMeetingroom: function (startDate, endDate) {
      var url = "api/v2/home/meetingroom/statistics",
        _this = this,
        config = {
          showError: false,
          loading: {
            context: this.echarLoading,
            target: "classroom",
          },
        },
        params = {
          type: this.classroomParams.type,
        };
      if (this.echarLoading.classroom) return;
      if (_this.time.classroom) clearInterval(_this.time.classroom);

      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      this.$http
        .get(url, params, config)
        .then(function (res) {
          var data = res.data;
          _this.averageTime = data.averageUseTime || 0;
          _this.totalTime = data.totalUseTime || 0;
          _this.initbuildingName2OpenAndCloseCount(
            data.buildingName2OngoingAndFreeCount
          );
          _this.classroomRate = data.classRoomOngoingRatio * 100 || 0;
          _this.initOutData();
          var arr = [
            data.classRoomTotalCount,
            data.classRoomInUseCount,
            data.classRoomFreeCount,
            data.classRoomFaultCount,
          ]; // 数量
          // var arr = [
          //   Number((data.classRoomTotalRatio * 100).toFixed(2)),
          //   Number((data.classRoomInUseRatio * 100).toFixed(2)),
          //   Number((data.classRoomFreeRatio * 100).toFixed(2)),
          //   Number((data.classRoomFaultRatio * 100).toFixed(2)),
          // ]; // 百分比
          _this.classroomTotalData = arr;
          _this.initclassroomTotalEchart();
          _this.initTotalTimeValue(data.classRoomName2UseTime);

          _this.time.classroom = setInterval(function () {
            _this.http_getMeetingroom(startDate, endDate);
          }, _this.time.classroomNumber);
        })
        .catch(function () {
          _this.initbuildingName2OpenAndCloseCount();
          _this.initOutData();
          _this.initclassroomTotalEchart();
          _this.initTotalTimeValue({});
        });
    },

    /**
     * 切换课程总数时间段
     * @param {*} index
     */
    changeCourseTotal: function (index) {
      this.$nextTick(function () {
        this.setIntervalGetData(
          "courseTotal",
          "courseTotalNumber",
          "http_getMeetingTotalStatistics"
        );
      });
    },

    /**
     * 切换报修时间段
     * @param {*} index
     */
    changeRepair: function (index) {
      this.$nextTick(function () {
        this._updateChartRepair(index, true);
      });
    },
    /**
     * 切换课室使用情况时间段
     * @param {*} index
     */
    changeClassroom: function (index) {
      this.$nextTick(function () {
        var date = this.classroomParams.date;
        this.http_getMeetingroom(date[0], date[1]);
      });
    },

    changeClassroomTime: function (val) {
      var start = new Date(moment(val[0]).startOf("day")).getTime();
      var end = new Date(moment(val[1]).endOf("day")).getTime();
      this.classroomParams.date = [start, end];
      this.http_getMeetingroom(start, end);
    },

    /**
     * 设置数据过长自动滚动
     * @param {*} myChart echart
     * @param {*} option 配置
     * @param {*} data 数据
     */
    setIntervalDataZoom: function (myChart, option, data, endValue, timeName) {
      if (data.length <= endValue + 1) return;
      if (this.dataZoomTime[timeName]) {
        clearInterval(this.dataZoomTime[timeName]);
        this.dataZoomTime[timeName] = null;
      }
      this.dataZoomTime[timeName] = setInterval(function () {
        // 每次向后滚动一个，最后一个从头开始。
        if (option.dataZoom[0].endValue == data.length) {
          option.dataZoom[0].endValue = endValue;
          option.dataZoom[0].startValue = 0;
        } else {
          option.dataZoom[0].endValue = option.dataZoom[0].endValue + 1;
          option.dataZoom[0].startValue = option.dataZoom[0].startValue + 1;
        }
        myChart.setOption(option);
      }, 2000);
    },
    againGetData: function () {},

    /**
     * 当前课室使用率
     */
    initOutData: function () {
      var labelData1 = [],
        total = 70,
        scale = total / 100,
        num = this.classroomRate || 0;
      for (var i = 0; i < total; ++i) {
        labelData1.push({
          value: 1,
          name: i,
          itemStyle: {
            normal: {
              color: "#464451",
            },
          },
        });
      }
      for (var i = 0; i < labelData1.length; ++i) {
        if (labelData1[i].name < parseInt(num * scale)) {
          labelData1[i].itemStyle = {
            normal: {
              color: "#31d5f1",
            },
          };
        }
      }

      this.outActiveData = labelData1;
      this.initPieData();
    },
    initPieData: function () {
      var centerData = this.rateCenterData,
        series = {
          radius: {
            0: ["87%", "85.5%"],
            1: ["85%", "83.5%"],
            2: ["88%", "86.5%"],
            3: ["81%", "80%"],
            4: ["81%", "80%"],
            5: ["81%", "80%"],
          },
          startAngles: {
            1: -150,
            2: -140,
            4: -140,
            5: -147.5,
          },
          data: ["Pie", "Pie3", "Pie", "Pie1", "Pie2", "Pie2"],
        },
        arr = [];
      for (var index = 0; index <= 5; index++) {
        var obj = {
          type: "pie",
          zlevel: 0,
          silent: true,
          center: centerData,
          z: 1,
          label: {
            normal: {
              show: false,
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
        };
        var radius = series.radius[index],
          startAngles = series.startAngles[index];
        if (radius) obj.radius = radius;
        if (startAngles) obj.startAngles = startAngles;
        obj.data = this[series.data[index]]();
        arr.push(obj);
      }
      this.ratePieData = arr;
      this.$nextTick(function () {
        this.initclassroomRateEchart();
      });
    },
    Pie: function () {
      var dataArr = [];
      for (var i = 0; i < 100; i++) {
        if (i % 10 === 0) {
          dataArr.push({
            name: (i + 1).toString(),
            value: 30,
            itemStyle: {
              normal: {
                color: "rgba(0,255,255,1)",
                borderWidth: 0,
                borderColor: "rgba(0,0,0,0)",
              },
            },
          });
        } else {
          dataArr.push({
            name: (i + 1).toString(),
            value: 100,
            itemStyle: {
              normal: {
                color: "rgba(0,0,0,0)",
                borderWidth: 0,
                borderColor: "rgba(0,0,0,0)",
              },
            },
          });
        }
      }
      return dataArr;
    },
    Pie1: function () {
      var dataArr = [];
      for (var i = 0; i < 100; i++) {
        if (i % 5 === 0) {
          dataArr.push({
            name: (i + 1).toString(),
            value: 20,
            itemStyle: {
              normal: {
                color: "rgba(0,255,255,1)",
                borderWidth: 0,
                borderColor: "rgba(0,0,0,0)",
              },
            },
          });
        } else {
          dataArr.push({
            name: (i + 1).toString(),
            value: 100,
            itemStyle: {
              normal: {
                color: "rgba(0,0,0,0)",
                borderWidth: 0,
                borderColor: "rgba(0,0,0,0)",
              },
            },
          });
        }
      }
      return dataArr;
    },
    Pie2: function () {
      var dataArr = [];
      for (var i = 0; i < 100; i++) {
        if (i % 5 === 0) {
          dataArr.push({
            name: (i + 1).toString(),
            value: 20,
            itemStyle: {
              normal: {
                color: "rgba(0,255,255,.3)",
                borderWidth: 0,
                borderColor: "rgba(0,0,0,0)",
              },
            },
          });
        } else {
          dataArr.push({
            name: (i + 1).toString(),
            value: 100,
            itemStyle: {
              normal: {
                color: "rgba(0,0,0,0)",
                borderWidth: 0,
                borderColor: "rgba(0,0,0,0)",
              },
            },
          });
        }
      }
      return dataArr;
    },
    Pie3: function () {
      var dataArr = [];
      for (var i = 0; i < 100; i++) {
        if (i % 10 === 0) {
          dataArr.push({
            name: (i + 1).toString(),
            value: 0,
            itemStyle: {
              normal: {
                color: "rgba(0,255,255,.5)",
                borderWidth: 0,
                borderColor: "rgba(0,0,0,0)",
              },
            },
          });
        } else {
          dataArr.push({
            name: (i + 1).toString(),
            value: 100,
            itemStyle: {
              normal: {
                color: "rgba(0,0,0,0)",
                borderWidth: 0,
                borderColor: "rgba(0,0,0,0)",
              },
            },
          });
        }
      }
      return dataArr;
    },
    /**
     * 课室使用率环形图表
     * @param {*} pieData
     */
    initclassroomRateEchart: function (pieData) {
      var chartDom = document.getElementById("rate");
      var myChart = echarts.init(chartDom);
      var rate = Number((this.classroomRate || 0).toFixed(2)),
        outActiveData = this.outActiveData,
        centerData = this.rateCenterData,
        ratePieData = this.ratePieData,
        polarRadius = ["91%", "87%"],
        radius1 = ["88%", "100%"], // 外层
        radius2 = ["78%", "79%"], // 中间小
        radius3 = ["78%", "84%"], // 中间大
        option = {
          title: [
            {
              text: rate + "%",
              x: centerData[0],
              y: "30%",
              textAlign: "center",
              textStyle: {
                width: 100,
                fontSize: "20",
                fontWeight: "100",
                color: "#43E7FF",
                textAlign: "center",
                overflow: "break",
              },
            },
            {
              text: $i.t("v2hijs2") + "\n" + $i.t("v2hijs3"),
              left: centerData[0],
              top: "50%",
              textAlign: "center",
              textStyle: {
                width: 100,
                fontSize: "10",
                fontWeight: "400",
                color: "#909BC5",
                textAlign: "center",
                overflow: "break",
                lineHeight: 13,
              },
            },
          ],
          polar: {
            radius: polarRadius,
            center: centerData,
          },
          angleAxis: {
            max: 100,
            show: false,
            startAngle: 0,
          },
          radiusAxis: {
            type: "category",
            show: true,
            axisLabel: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
          series: [
            // 最外层
            {
              hoverAnimation: false,
              type: "pie",
              z: 2,
              data: outActiveData,
              center: centerData,
              radius: radius1,
              zlevel: -2,
              itemStyle: {
                normal: {
                  borderColor: "#000443",
                  borderWidth: 4,
                },
              },
              label: {
                normal: {
                  position: "inside",
                  show: false,
                },
              },
            },
            // 内层
            {
              type: "pie",
              radius: radius2,
              center: ["50%", "50%"],
              data: [
                {
                  value: rate,
                  itemStyle: {
                    color: "#35e7ff",
                  },
                  label: {
                    normal: {
                      position: "inside",
                      show: false,
                    },
                  },
                },
                {
                  value: 100 - rate,
                  itemStyle: {
                    color: "transparent",
                  },
                },
              ],
            },
            {
              type: "pie",
              radius: radius3,
              center: ["50%", "50%"],
              data: [
                {
                  value: rate,
                  itemStyle: {
                    color: "transparent",
                  },
                },
                {
                  value: 100 - rate,
                  name: "rose2",
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                      {
                        offset: 0,
                        color: "#0bfef7",
                      },
                      {
                        offset: 1,
                        color: "#bcb808",
                      },
                    ]),
                  },
                  label: {
                    normal: {
                      position: "inside",
                      show: false,
                    },
                  },
                },
              ],
            },
          ],
        };

      //   option.series = option.series.concat(ratePieData);

      option && myChart.setOption(option);
    },

    /**
     * 当前课室使用率根据key返回不同的渐变颜色
     * @param {*} key
     * @returns
     */
    initClassroomTotalColor: function (key) {
      var colors = {
          barCenter: [
            { start: "#205DDB", end: "#1BDFFC" },
            { start: "#30FDF6", end: "#B866FD" },
            { start: "#FD582F", end: "#FDAC53" },
            { start: "#A8E65D", end: "#FDAC53" },
          ],
          bottom: ["#00A8FF", "#BC38E7", "#FF802C", "#EBE424"],
          top: ["#16BBED", "#C3F7FF", "#FFA61B", "#8DE13A"],
        },
        _this = this,
        arr = [];

      this.classroomTotalData.forEach(function (item, index) {
        var itemStyle = {};
        if (key == "barCenter") {
          itemStyle = {
            normal: {
              barBorderRadius: 6,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: colors[key][index].start,
                },
                {
                  offset: 1,
                  color: colors[key][index].end,
                },
              ]),
            },
          };
        } else {
          itemStyle = {
            normal: {
              color: colors[key][index],
            },
          };
        }
        var obj = {
          value: item,
          itemStyle: item > 0 ? itemStyle : {color: "transparent"},
        };
        arr.push(obj);
      });
      return arr;
    },
    /**
     * 课室的使用状态值 ("总数", "在用", "空闲", "故障")
     */
    initclassroomTotalEchart: function () {
      var chartDom = document.getElementById("total-num");
      var myChart = echarts.init(chartDom),
        classroomTotalData = this.classroomTotalData,
        max = 0,
        pictorialTop = this.initClassroomTotalColor("top"),
        pictorialBottom = this.initClassroomTotalColor("bottom"),
        barCenter = this.initClassroomTotalColor("barCenter"),
        maxArr = [];
      barCenter.forEach(function (item) {
        max = Math.max(item.value, max);
      });
      barCenter.forEach(function (item) {
        maxArr.push(max);
      });
      var option = {
        tooltip: {
          trigger: "item",
          textStyle: {
            color: "#fff",
          },
          backgroundColor: "#000443",
          borderColor: "#fff",
          formatter: function (params) {
            var value = Number(barCenter[params.dataIndex].value.toFixed(2));
            return (
              params.name + "：" + value
              // params.name + "：" + value + "%"
            );
          },
        },
        backgroundColor: "#06144E",
        grid: {
          left: "10%",
          right: "5%",
          top: "10%",
          bottom: "18%",
        },
        yAxis: [
          {
            minInterval: Math.min(max, 20),
            type: "value",
            position: "left",
            alignTicks: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: "#20347C",
              },
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: "#B9BFD6",
            },
          },
        ],
        xAxis: [
          {
            type: "category",
            data: $i.t("classroomTotalEchart"),
            axisLabel: {
              show: true,
              color: "#909BC5",
              fontSize: 10,
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "#20347C",
              },
            },
            axisTick: { show: false },
          },
        ],

        series: [
          {
            type: "pictorialBar",
            symbolSize: [10, 4],
            symbolOffset: [0, 1], // 上部椭圆
            symbolPosition: "end",
            z: 12,
            data: pictorialTop,
          },
          {
            type: "pictorialBar",
            symbolSize: [10, 4],
            symbolOffset: [0, -2], // 下部椭圆
            z: 12,
            data: pictorialBottom,
          },
          {
            z: 11,
            data: barCenter,
            type: "bar",
            name: "Income",
            stack: "Total",
            barWidth: 11,
            barGap: "10%",
            itemStyle: {
              barBorderRadius: 3,
            },
          },
          {
            z: 10,
            name: "背景",
            type: "bar",
            barWidth: 11,
            barGap: "-100%",
            data: maxArr,
            itemStyle: {
              normal: {
                color: "#20347C",
                barBorderRadius: 4,
              },
            },
          },
        ],
      };

      option && myChart.setOption(option);
    },

    /**
     * 楼柱 占用和空闲
     * @param {*} data
     */
    initbuildingName2OpenAndCloseCount: function (data) {
      this.floorData = [];
      for (var key in data) {
        var obj = {
          openValue: data[key].free || "",
          closeValue: data[key].ongoing || "",
          name: key,
        };
        this.floorData.push(obj);
      }
      // for (let index = 0; index < 5; index++) {
      //   var obj = {
      //     openValue: 1 || "",
      //     closeValue: 1 || "",
      //     name: key,
      //   };
      //   if (index == 2) {
      //     obj = {
      //       openValue: 50 || "",
      //       closeValue: 1 || "",
      //       name: key,
      //     };
      //   }
      //   this.floorData.push(obj);
      // }

      if (!this.floorData.length) this.floorData = [null];
      this.initFloorDataEchart();
    },
    initFloorDataEchart: function () {
      var chartDom = document.getElementById("floor");
      var myChart = echarts.init(chartDom),
        floorData = this.floorData,
        showLabel = floorData[0] !== null,
        max = 0,
        dataZoomEndValue = 5,
        legendData = $i.t("floorDataEchartLegendData"),
        maxList = [];
      floorData.forEach(function (item) {
        if (item) max = Math.max(item.openValue + item.closeValue, max);
      });
      floorData.forEach(function (item) {
        maxList.push(max);
      });

      var option = {
        dataZoom: [
          //滑动条
          {
            show: false, //是否显示滑动条
            type: "slider", // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            startValue: 0, // 从头开始。
            endValue: dataZoomEndValue, // 一次性展示4个。
          },
        ],
        legend: {
          itemWidth: 10,
          itemHeight: 10,
          data: legendData,
          right: 80,
          textStyle: {
            fontSize: 12,
            fontFamily: "Source Han Sans CN",
            fontWeight: 400,
            color: "#909BC5",
            rich: {
              a: {
                verticalAlign: "middle",
              },
            },
            lineHeight: 10,
            padding: [0, 4, -3, 0],
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: floorData.map(function (item) {
            return item ? item.name : "";
          }),
          axisLine: {
            show: true,
            lineStyle: {
              color: "#022B73",
              width: 2,
            },
          },
          axisLabel: {
            show: true,
            color: "#909BC5",
            fontSize: 11,
            interval: 0,
            overflow: "truncate",
            width: 70,
          },
          axisTick: { show: false },
        },
        yAxis: {
          // minInterval: minInterval,
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              color: "#022B73",
            },
          },
          axisLabel: {
            show: true,
            color: "#909BC5",
            fontSize: 11,
          },
        },
        series: [
          {
            barWidth: 12,
            name: legendData[0],
            type: "bar",
            stack: "Total",
            label: {
              show: true,
              color: "#fff",
              fontSize: 11,
            },
            itemStyle: {
              borderColor: "transparent",
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#43E7FF",
                },
                {
                  offset: 1,
                  color: "#010742",
                },
              ]),
            },
            data: floorData.map(function (item) {
              var itemVal = item ? item.openValue : "";
              var obj = {
                value: itemVal,
              };
              if (max - itemVal >= 10)
                obj.label = {
                  position: ["100%", -5],
                };
              return obj;
            }),
          },
          // 上
          {
            barWidth: 12,
            name: legendData[1],
            type: "bar",
            stack: "Total",
            label: {
              show: true,
              color: "#fff",
              fontSize: 11,
            },
            itemStyle: {
              borderColor: "transparent",
              color: "#F7C824",
              // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              //   {
              //     offset: 0,
              //     color: "#F7C824",
              //   },
              //   {
              //     offset: 1,
              //     color: "#131D21",
              //   },
              // ]),
            },
            data: floorData.map(function (item) {
              var itemVal = item ? item.closeValue : "";
              var obj = {
                value: itemVal,
              };
              if (max - itemVal >= 10)
                obj.label = {
                  position: "top",
                };
              return obj;
            }),
            showBackground: showLabel,
            backgroundStyle: {
              color: "#17234F",
            },
          },
        ],
      };
      if (!showLabel) {
        option.yAxis.max = 20;
        option.yAxis.min = 0;
      } else {
        option.tooltip = {
          trigger: "axis",
          textStyle: {
            color: "#fff",
          },
          backgroundColor: "#000443",
          valueFormatter: function (value) {
            return value || 0;
          },
        };
      }
      this.setIntervalDataZoom(
        myChart,
        option,
        floorData,
        dataZoomEndValue,
        "floor"
      );
      option && myChart.setOption(option);
    },

    /**
     * 使用时长柱
     * @param {*} data
     */
    initTotalTimeValue: function (data) {
      this.totalTimeData = [];
      var i = 0;
      for (var key in data) {
        var obj = {
          name: key,
          value: Number(data[key].toFixed(2)),
        };
        var itemStyle = {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#3CAAB7" },
            { offset: 1, color: "#132543" },
          ]),
        };
        if (i % 2 != 0) {
          itemStyle = {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#00AEFF" },
              { offset: 1, color: "#132543" },
            ]),
          };
        }
        obj.itemStyle = itemStyle;
        this.totalTimeData.push(obj);
        i++;
      }
      if (!this.totalTimeData.length) this.totalTimeData = [null];
      this.initTotalTimeDataEchart();
    },
    /**
     * 根据时间查找课室数据
     */
    initTotalTimeDataEchart: function () {
      var chartDom = document.getElementById("time-num");
      var myChart = echarts.init(chartDom),
        totalTimeData = this.totalTimeData,
        dataZoomEndValue = 5,
        showLabel = totalTimeData[0] !== null;
      var option = {
        dataZoom: [
          {
            show: false, //是否显示滑动条
            type: "slider", // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            startValue: 0, // 从头开始。
            endValue: dataZoomEndValue, // 一次性展示6个。
          },
        ],
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: totalTimeData.map(function (item) {
            return item ? item.name : "";
          }),
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgba(255,255,255,0.14)",
              width: 2,
            },
          },
          axisLabel: {
            show: true,
            interval: 0,
            color: "#909BC5",
            fontSize: 11,
            width: 70,
            overflow: "truncate",
          },
          axisTick: { show: false },
        },
        yAxis: {
          // minInterval: minInterval,
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(255,255,255,0.14)",
            },
          },
          axisLabel: {
            show: true,
            color: "#909BC5",
            fontSize: 11,
          },
        },
        series: [
          {
            barWidth: 11,
            type: "bar",
            showBackground: showLabel,
            data: totalTimeData,
            label: {
              show: true,
              position: "top",
              color: "#fff",
              fontSize: 10,
            },
          },
        ],
      };
      if (!showLabel) {
        option.yAxis.max = 20;
        option.yAxis.min = 0;
      } else {
        option.tooltip = {
          trigger: "axis",
          backgroundColor: "#000443",
          textStyle: {
            color: "#fff",
          },
          valueFormatter: function (value) {
            return value || 0;
          },
        };
      }
      this.setIntervalDataZoom(
        myChart,
        option,
        totalTimeData,
        dataZoomEndValue,
        "totalTime"
      );
      option && myChart.setOption(option);
    },

    // 课程对比率
    initCourseValue: function (data) {
      var colors = ["#43E7FF", "#65E3AC", "#F5D600"],
        _this = this;
      this.courseData.forEach(function (item, index) {
        var itemStyle = {
          normal: {
            color: colors[index],
          },
        };
        _this.$set(item, "itemStyle", itemStyle);
        _this.$set(
          item,
          "value",
          Number((data[item.type] * 100).toFixed(1)) || 0
        );
      });
      this.initCourseDataEchart();
    },
    initCourseDataEchart: function () {
      var chartDom = document.getElementById("course-rate");
      var myChart = echarts.init(chartDom),
        courseData = this.courseData,
        option = {
          grid: {
            left: "10%",
            top: 0,
            right: "15%",
            bottom: "10%",
            containLabel: true,
          },
          tooltip: {
            trigger: "item",
            formatter: function (data) {
              var res = courseData[data.dataIndex];
              return res.name + " " + res.value + "%";
            },
            textStyle: {
              color: "#fff",
            },
            backgroundColor: "#000443",
            borderColor: "#fff",
          },

          xAxis: {
            type: "value",
            show: false,
            position: "top",
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: "#fff",
              },
            },
            splitLine: {
              show: false,
            },
          },
          yAxis: [
            {
              type: "category",
              axisTick: {
                show: false,
                alignWithLabel: false,
                length: 5,
              },
              splitLine: {
                show: false,
              },
              axisLine: {
                show: false,
                lineStyle: {
                  color: "#fff",
                  fontSize: 13,
                },
              },
              data: courseData.map(function (item) {
                return item.name;
              }),
            },
            {
              type: "category",
              axisTick: "none",
              axisLine: "none",
              show: true,

              axisLabel: {
                textStyle: {
                  color: "#fff",
                  fontSize: 15,
                },
                formatter: "{value}%",
              },
              data: courseData.map(function (item) {
                return item.value;
              }),
            },
          ],
          series: [
            {
              type: "bar",
              z: 11,
              barWidth: 5,
              itemStyle: {
                normal: {
                  show: true,
                },
              },
              barGap: "0%",
              data: courseData,
            },
            {
              name: "bg",
              type: "bar",
              barWidth: 5,
              barGap: "-100%",
              data: [100, 100, 100],
              itemStyle: {
                color: "#17234F",
              },
              z: 1,
            },
            {
              type: "pictorialBar",
              symbolSize: [10, 10],
              symbolOffset: [1, 0], // 上部小圆
              symbolPosition: "end",
              z: 12,
              data: courseData,
              color: "#16BBED",
            },
            {
              type: "pictorialBar",
              symbolSize: [22, 22],
              symbolPosition: "end",
              z: 12,
              data: courseData.map(function (item) {
                var itemStyle = {
                  color: "#A5E8FF",
                  opacity: 0.2,
                };
                return {
                  value: item.value,
                  itemStyle: itemStyle,
                  symbolOffset: item.value == 0 ? [-5, 0] : [7, 0], // 上部大圆
                };
              }),
            },
          ],
        };

      option && myChart.setOption(option);
    },

    initMap: function () {
      var map = new BMapGL.Map("map-content"); // 创建地图实例
      var point = new BMapGL.Point(113.626416, 23.154941); // 创建点坐标
      map.centerAndZoom(point, 17); // 初始化地图，设置中心点坐标和地图级别
      map.enableScrollWheelZoom();
      map.setMapStyleV2({
        styleId: "aa5255643ddcc2f909f6a6971ada5219",
      });
      map.setTilt(60);
    },

    /**
     * 网速
     */
    initStatusDataEchart: function () {
      var chartDom = document.getElementById("internet-speed");
      var myChart = echarts.init(chartDom),
        value = this.internetSpeed,
        textValue =
          this.internetSpeed / 1024 >= 1
            ? this.internetSpeed / 1024
            : this.internetSpeed,
        titleText = Number(textValue.toFixed(2)),
        internetSpeed = Number((value / 10).toFixed(2)),
        option = {
          //   backgroundColor: "#313131",
          title: [
            {
              text: [
                "{value|" + titleText + "}",
                "{unit|" +
                  (this.internetSpeed / 1024 >= 1 ? "Mbps" : "KB") +
                  "}",
              ].join(""),
              left: "center",
              top: "28%",
              textStyle: {
                fontSize: 14,
                fontWeight: 400,
                color: "#00BAFF",
                align: "center",
                // overflow: "truncate",
                rich: {
                  unit: {
                    fontSize: 12,
                    fontWeight: 400,
                    color: "#00BAFF",
                  },
                },
              },
            },
            {
              text: $i.t("v2hijs4"),
              left: "center",
              top: "55%",
              textStyle: {
                fontSize: 12,
                fontWeight: 400,
                color: "#FFFFFF",
              },
            },
          ],
          series: [
            // 细
            {
              type: "pie",
              radius: ["95%", "98%"],
              center: ["50%", "50%"],
              hoverAnimation: false,
              data: [
                {
                  value: internetSpeed / 10,
                  itemStyle: {
                    color: "transparent",
                  },
                  label: {
                    show: false,
                  },
                },
                {
                  value: 100 - internetSpeed / 10,
                  label: {
                    show: false,
                  },
                  itemStyle: {
                    color: "#3d3d6d",
                  },
                },
              ],
            },
            {
              type: "pie",
              radius: ["90%", "100%"],
              center: ["50%", "50%"],
              hoverAnimation: false,
              data: [
                {
                  value: internetSpeed,
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                      {
                        offset: 0,
                        color: "#0912fe",
                      },
                      {
                        offset: 1,
                        color: "#53dffe",
                      },
                    ]),
                  },
                  label: {
                    show: false,
                  },
                },
                {
                  value: 100 - internetSpeed,
                  itemStyle: {
                    color: "transparent",
                  },
                },
              ],
            },
            // 内
            {
              type: "pie",
              radius: "80%",
              labelLine: {
                show: false,
              },
              label: {
                show: false,
              },
              hoverAnimation: false,
              data: [100],
              itemStyle: {
                color: "#1c255e",
              },
            },
          ],
        };

      option && myChart.setOption(option);
    },

    // 空气质量
    initAirQualityActiveValue: function () {
      var total = 80,
        num = 40,
        airQualityActive = [];
      for (var i = 0; i < total; ++i) {
        airQualityActive.push({
          value: 1,
          name: i,
          itemStyle: {
            normal: {
              color: "#084b99",
            },
          },
        });
      }
      for (var i = 0; i < airQualityActive.length; ++i) {
        if (airQualityActive[i].name < num) {
          airQualityActive[i].itemStyle = {
            normal: {
              color: "#5315a7",
            },
          };
        }
        if (airQualityActive[i].name > 30 && airQualityActive[i].name < 49) {
          airQualityActive[i].itemStyle = {
            normal: {
              color: "transparent",
            },
          };
        }
      }
      this.airQualityActiveData = airQualityActive;
      this.initAirQualityEchart();
    },
    /**
     * 初始化环境信息
     * @param {*} data
     */
    initAirQualityList: function (data) {
      var _this = this;
      _this.airQualityData.forEach(function (item) {
        var value = parseInt(data[item.type] || 0);
        _this.$set(item, "value", value);
      });
    },
    initAirQualityEchart: function () {
      var chartDom = document.getElementById("air-quality");
      var myChart = echarts.init(chartDom),
        envValue = ["差", "中", "良", "优"],
        value = this.airQualityNumber,
        text = this.envValue[envValue.indexOf(this.airQualityText)]|| $t("setupB.s7"),
        airQualityActiveData = this.airQualityActiveData,
        polarRadius = ["76%", "84%"], // 进度
        outRadius = ["86%", "98%"], // 最外层
        liquidFillRadius = "70%"; // 水滴

      var option = {
          title: [
            {
              text: text,
              x: "center",
              y: "30%",
              textStyle: {
                fontSize: 20,
                fontWeight: "bold",
                color: "#28E8FF",
              },
            },
            {
              text: $i.t("v2hijs1"),
              x: "center",
              y: "55%",
              textStyle: {
                fontSize: 14,
                fontWeight: 500,
                color: "#FFFFFF",
              },
            },
          ],
          angleAxis: {
            show: false,
            max: (100 * 360) / 270, //-45度到225度，二者偏移值是270度除360度
            type: "value",
            startAngle: 225, //极坐标初始角度
            splitLine: {
              show: false,
            },
          },
          radiusAxis: {
            type: "category",
            min: 10,
            max: 10,
            axisLabel: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
          polar: {
            center: ["50%", "50%"], //中心点位置
            radius: polarRadius,
          },
          series: [
            {
              name: "外环",
              hoverAnimation: false,
              type: "pie",
              z: 2,
              data: airQualityActiveData,
              center: ["50%", "50%"],
              radius: outRadius,
              itemStyle: {
                normal: {
                  borderColor: "#000443",
                  borderWidth: 4,
                },
              },
              label: {
                normal: {
                  position: "inside",
                  show: false,
                },
              },
            },
            {
              type: "liquidFill",
              radius: liquidFillRadius,
              center: ["50%", "50%"],
              data: [value], // data个数代表波浪数
              backgroundStyle: {
                borderWidth: 1,
                color: "#05104e",
              },
              outline: {
                show: false,
              },
              label: {
                show: false,
              },
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: "#2e9dd3", // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "#0a225f", // 100% 处的颜色
                  },
                ]),
              },
            },
            {
              type: "bar",
              data: [
                {
                  //上层圆环，显示数据
                  value: value * 100,
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                      {
                        offset: 0,
                        color: "#51e5c6",
                      },
                      {
                        offset: 1,
                        color: "#00acff",
                      },
                    ]),
                  },
                },
              ],
              barGap: "-100%", //柱间距离,上下两层圆环重合
              coordinateSystem: "polar",
              roundCap: true, //顶端圆角从 v4.5.0 开始支持
              z: 2, //圆环层级，同zindex
            },
            {
              //下层圆环，显示最大值
              type: "bar",
              data: [
                {
                  value: 100,
                  itemStyle: {
                    color: "#03266a",
                  },
                },
              ],
              barGap: "-100%",
              coordinateSystem: "polar",
              roundCap: true,
              z: 1,
            },
          ],
        };

      option && myChart.setOption(option);
    },

    // 地点资产
    initPlaceAssetsValue: function (data) {
      this.placeAssetsData = [];
      var colors = {
          0: { start: "#FFC939", end: "#E38268" },
          1: { start: "#48A8EB", end: "#43E7FF" },
          2: { start: "#27EAC1", end: "#1D87E5" },
          3: { start: "#E57152", end: "#E38268" },
        },
        place = data.placeName2Count || [],
        i = 0;
      for (var index = 0; index < place.length; index++) {
        var item = place[index];
        if (index % 4 == 0) i = 0;
        var start = colors[i].start,
          end = colors[i].end;
        for (var key in item) {
          var obj = {
            name: key,
            id: "id" + (index + 1),
            value: item[key],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: start,
                },
                {
                  offset: 1,
                  color: end,
                },
              ]),
            },
          };
        }

        i++;
        this.placeAssetsData.push(obj);
      }
      if (!this.placeAssetsData.length) {
        for (var key in colors) {
          this.placeAssetsData.push({ value: 0 });
        }
      }
      this.initPlaceAssetsDataEchart();
    },
    /**
     * 资产统计
     */
    initPlaceAssetsDataEchart: function () {
      var chartDom = document.getElementById("assets-place");
      var myChart = echarts.init(chartDom),
        placeAssetsData = this.placeAssetsData,
        colors = ["#E38268", "#43E7FF", "#27EAC1", "#E38268"],
        total = 0,
        maxArr = [],
        dataZoomEndValue = 3,
        i = 0;
      for (var index = 0; index < placeAssetsData.length; index++) {
        total += placeAssetsData[index].value * 1;
      }
      for (var index = 0; index < placeAssetsData.length; index++) {
        maxArr.push(total);
      }
      var every = placeAssetsData.every(function (item) {
        return item.value == 0;
      });
      if (every) maxArr = [100, 100, 100, 100];
      var option = {
        dataZoom: [
          //滑动条
          {
            yAxisIndex: 0, //实现y轴滚动
            show: false, //是否显示滑动条
            type: "slider", // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            startValue: 0, // 从头开始。
            endValue: dataZoomEndValue, // 一次性展示4个。
          },
        ],
        grid: {
          left: "2%",
          top: 0,
          right: "2%",
          bottom: 0,
          containLabel: true,
        },

        xAxis: {
          type: "value",
          show: false,
          position: "top",
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: "#fff",
            },
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: [
          {
            type: "category",
            position: "right",
            axisTick: {
              show: false,
              alignWithLabel: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            inverse: true, //排序
            axisLine: {
              show: false,
            },
            axisLabel: {
              color: "#fff",
              inside: true,
              align: "right",
              verticalAlign: "bottom",
              padding: [0, 0, 10, 0],
              fontSize: 15,
              fontWeight: "bold",
            },
            data: placeAssetsData.map(function (item) {
              return item.value;
            }),
          },
        ],
        series: [
          {
            type: "bar",
            barWidth: 4,
            z: 10,
            itemStyle: {
              normal: {
                show: true,
              },
            },
            barGap: "0%",
            barCategoryGap: "50%",
            data: placeAssetsData,
            label: {
              show: true,
              position: [0, -20],
              formatter: function (data) {
                return [
                  "{no|No." + (data.dataIndex * 1 + 1) + "}",
                  "      {name|" + data.name + "}",
                ].join(" ");
              },
              rich: {
                no: {
                  fontSize: 13,
                  color: "#00F1DC",
                  fontStyle: "italic",
                },
                name: {
                  fontSize: 13,
                  color: "#fff",
                },
              },
            },
          },
          {
            name: "bg",
            type: "bar",
            barWidth: 4,
            barGap: "-100%",
            data: maxArr,
            itemStyle: {
              color: "#17234F",
            },
            z: 1,
          },
          {
            type: "scatter",
            z: 13,
            symbolSize: 16,
            data: placeAssetsData.map(function (item, index) {
              if (index % 4 == 0) i = 0;
              var color = colors[i];
              var itemStyle = {
                color: "transparent",
                borderWidth: 1,
                borderColor: color,
                opacity: 1,
              };
              i++;
              return {
                value: item.value,
                itemStyle: itemStyle,
              };
            }),
          },
          {
            type: "scatter",
            z: 12,
            symbolSize: 9,
            data: placeAssetsData.map(function (item, index) {
              if (index % 4 == 0) i = 0;
              var color = colors[i];
              var itemStyle = {
                color: color,
                opacity: 1,
              };
              i++;
              return {
                value: item.value,
                itemStyle: itemStyle,
              };
            }),
          },
        ],
      };
      this.setIntervalDataZoom(
        myChart,
        option,
        placeAssetsData,
        dataZoomEndValue,
        "placeAssets"
      );
      option && myChart.setOption(option);
    },

    /**
     * 硬件运行状态
     * @param {*} data
     */
    initStatusValue: function (data) {
      var arr = ["CPU", "内存", "硬盘", "温度"],
        icons = ["cpu", "memory", "caliche", "temperature"],
        cpuInfo = data.cpuInfo || {},
        systemCpuLoad = cpuInfo.systemCpuLoad || 0, // cpu
        temperature = cpuInfo.temperature || 0, // 温度
        memoryUseRatio = data.memoryInfo ? data.memoryInfo.memoryUseRatio : 0, // 内存
        diskInfo = data.diskInfo || {}, // 硬盘 totalRatio 对象循环相加除长度
        diskInfoLength = Object.keys(diskInfo).length,
        diskTotal = 0,
        _this = this;

      for (var key in diskInfo) {
        diskTotal += diskInfo[key].totalRatio;
      }
      diskTotal = diskTotal / diskInfoLength || 0;
      this.statusRateData.forEach(function (item, index) {
        var icon = icons[index];
        var value = 0;
        switch (icon) {
          case "cpu":
            value = systemCpuLoad.toFixed(2);
            break;
          case "memory":
            value = memoryUseRatio.toFixed(2);
            break;
          case "caliche":
            value = diskTotal.toFixed(2);
            break;
          case "temperature":
            value = temperature.toFixed(2);
            break;
        }
        value = Number(value);
        _this.$set(item, "value", value);
      });
      this.initStatusDataEchart();
    },
    /**
     * 硬件图片
     * @param {*} item
     * @returns
     */
    statusImage: function (item) {
      // this.$global.fullStaticUrl('/public/images/admin/control/map.png')
      var url =
        item.value >= 90 ? item.icon + "-overflow" : item.icon + "-normal";
      // item.icon + "-normal";
      return this.$global.fullStaticUrl(
        "/public/images/admin/control/" + url + ".png"
      );
    },
    statusValue: function (item) {
      if (item.icon == "temperature") return item.value + "℃";
      return item.value + "%";
    },
    airQualityImage: function (item) {
      var url =
        // item.value >= 80 ? item.icon + "-overflow" : item.icon + "-normal";
        item.icon + "-normal";
      return this.$global.fullStaticUrl(
        "/public/images/admin/control/env/" + url + ".png"
      );
    },
    initAlertLogs: function () {
      this.getAlertLogs(true);

      //启动定时器，每5分钟请求
      clearInterval(this.alertLog.timer);
      var _this = this;
      this.alertLog.timer = setInterval(function () {
        _this.getAlertLogs(false);
      }, 60 * 1000 * 5);
    },
    getAlertLogs: function (showLoading) {
      var loading = false;
      if (showLoading) {
        loading = {
          context: this.alertLog,
          target: "loading",
        };
      }
      var config = {
        loading: loading,
        showError: false,
      };
      var _this = this;
      this.$http
        .get("/api/v2/home/alertLog/today", {}, config)
        .then(function (rs) {
          var data = rs.data;
          data
            .sort(function (el1, el2) {
              return el2.createTime - el1.createTime;
            })
            .forEach(function (el, index) {
              el.index = index;
              var placeName = "";
              if (!_this.$global.isNull(el.placeName)) {
                placeName = "[" + el.placeName + "]";
              }
              el.fullContent = placeName + el.content;
            });
          _this.alertLog.data = data;
        })
        .catch(function (err) {});
    },

    // region # IP对讲部分
    _initChartIp: function () {
      this._updateChartIp();
      setInterval(this._updateChartIp, DATA_REFRESH_INTERVAL_IP);
    },
    _updateChartIp: function () {
      // 上次数据未刷新完毕，则忽略此次的刷新操作
      var obj = this.ip;
      if (obj.isLoading) return;
      obj.isLoading = true;
      var config = {
        showError: false,
        loading: {
          context: obj,
          target: "isLoading",
        },
      };
      this.$http
        .get("api/v2/index/chart/ipIntercom/data/all", {}, config)
        .then(function (res) {
          var data = res.data;
          obj.countInfo = data.countInfo || {};
          obj.callBusyingList = data.callBusyingList || [];
        });
    },
    // endregion

    // region # 工单情况数据部分
    _initChartRepair: function () {
      this._updateChartRepair();
      setInterval(this._updateChartRepair, DATA_REFRESH_INTERVAL_REPAIR);
    },
    // TODO my-v2-date切换时，调这个方法(force值传true)
    _updateChartRepair: function (type, force) {
      // 上次数据未刷新完毕，则忽略此次的刷新操作
      var obj = this.repair;
      if (obj.isLoading && force !== true) return;
      if (type) obj.type = type;
      obj.isLoading = true;
      var config = {
        showError: false,
        loading: {
          context: obj,
          target: "isLoading",
        },
      };
      this.$http
        .get(
          "api/v2/index/chart/repair/data",
          { type: obj.type },
          config
        )
        .then(function (res) {
          updateChartRepairPie(res.data.totalMap || {});
          updateChartRepairLine(res.data.seriesData || {}, obj.type);
        })
        .catch(function (err) {
          updateChartRepairPie({});
          updateChartRepairLine({}, obj.type);
        });
    },

    // endregion
  },
  filters: {
    millis2Str: function (millis) {
      var resArr = ["00", "00", "00"];
      if (!!!millis) return resArr.join(":");
      // 秒
      resArr[2] = prefixInteger(millis % 60, 2);
      // 分
      millis = Math.floor(millis / 60);
      if (millis > 0) {
        resArr[1] = prefixInteger(millis % 60, 2);
        // 时
        millis = Math.floor(millis / 60);
        if (millis > 0) {
          resArr[0] = millis < 10 ? prefixInteger(millis, 2) : millis;
        }
      }
      return resArr.join(":");
    },
  },
  watch: {
    "$i18n.locale": function () {
      this.initclassroomRateEchart();
      this.initclassroomTotalEchart();
      this.initFloorDataEchart();
      this.initStatusDataEchart();
      this.initAirQualityEchart();
      this._updateChartRepair();
    }
  }
});

function prefixInteger(num, n) {
  return (Array(n).join(0) + num).slice(-n);
}

/* region # 工单情况数据部分 */
var chartRepairPie = null;
var chartRepairLine = null;
var chartOptionRepairPie = {
  tooltip: {
    trigger: "item",
    textStyle: {
      color: "#fff",
    },
    backgroundColor: "#000443",
    borderColor: "#fff",
  },
  legend: {
    orient: "vertical",
    right: 0,
    top: "center",
    itemWidth: 11,
    itemHeight: 11,
    textStyle: {
      color: "white",
    },
  },
  series: [
    {
      name: "工单情况",
      type: "pie",
      radius: "70%",
      center: ["35%", "50%"],
      data: [
        { value: 335, name: "已完成" },
        { value: 310, name: "未完成" },
        { value: 274, name: "进行中" },
        { value: 235, name: "已撤销" },
      ],
      label: {
        color: "rgba(255, 255, 255, 1)",
        position: "inside",
        fontSize: 16,
        formatter: function (params) {
          return Math.round(params.percent) + "%";
        },
      },
      labelLine: {
        show: false,
      },
      itemStyle: {
        color: function (colors) {
          var colorList = ["#29F32D", "#FF3A79", "#0C81FE", "#FF9047"];
          return colorList[colors.dataIndex];
        },
      },
      animationType: "scale",
      animationEasing: "elasticOut",
      animationDelay: function (idx) {
        return Math.random() * 200;
      },
    },
  ],
};
var chartOptionRepairLine = {
  tooltip: {
    trigger: "axis",
    textStyle: {
      color: "#fff",
    },
    backgroundColor: "#000443",
    borderColor: "#fff",
  },
  grid: {
    top: "15%",
    left: "4%",
    right: "4%",
    bottom: "15%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    axisLabel: {
      color: "#909BC5",
      fontSize: 14,
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#565982",
      },
    },
    axisTick: {
      show: false,
    },
    data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  },
  yAxis: {
    type: "value",
    axisLabel: {
      color: "#909BC5",
      fontSize: 14,
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#565982",
      },
    },
    splitLine: {
      lineStyle: {
        color: "#565982",
        type: "dashed",
      },
    },
  },
  series: [
    {
      name: $i.t("chartOptionRepairPieData")[0],
      type: "line",
      symbol: "none",
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210],
      itemStyle: {
        color: "#29F32D",
      },
    },
    {
      name: $i.t("chartOptionRepairPieData")[1],
      type: "line",
      symbol: "none",
      smooth: true,
      data: [220, 182, 191, 234, 290, 330, 310],
      itemStyle: {
        color: "#FF3A79",
      },
    },
    {
      name: $i.t("chartOptionRepairPieData")[2],
      type: "line",
      symbol: "none",
      smooth: true,
      data: [150, 232, 201, 154, 190, 330, 410],
      itemStyle: {
        color: "#0C81FE",
      },
    },
    {
      name: $i.t("chartOptionRepairPieData")[3],
      type: "line",
      symbol: "none",
      smooth: true,
      data: [320, 332, 301, 334, 390, 330, 320],
      itemStyle: {
        color: "#FF9047",
      },
    },
  ],
};

var CHART_XAXIS_TYPE_1 = [
  "2时",
  "4时",
  "6时",
  "8时",
  "10时",
  "12时",
  "14时",
  "16时",
  "18时",
  "20时",
  "22时",
  "24时",
];
var CHART_XAXIS_TYPE_2 = [
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六",
  "周日",
];
var CHART_XAXIS_TYPE_5 = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

function updateChartRepairPie(totalMap) {
  if (chartRepairPie == null) {
    chartRepairPie = echarts.init(document.getElementById("repairPie"));
  }
  var data = chartOptionRepairPie.series[0].data;
  data[0].value = totalMap.finished || 0;
  data[1].value = totalMap.todo || 0;
  data[2].value = totalMap.processing || 0;
  data[3].value = totalMap.cancelled || 0;

  chartOptionRepairPie.series[0].name = $i.t("v2hijs5");
  data.forEach(function (name, index) {
    data[index].name = $i.t("chartOptionRepairPieData")[index];
  });
  // TODO
  chartRepairPie.setOption(chartOptionRepairPie, true);
}
function updateChartRepairLine(seriesData, type) {
  if (chartRepairLine == null) {
    chartRepairLine = echarts.init(document.getElementById("repairLine"));
  }
  var finished = seriesData.finished || [];
  if (type === 0) {
    chartOptionRepairLine.xAxis.data = $i.t("chartXaxisType_1");
  } else if (type === 1) {
    chartOptionRepairLine.xAxis.data = $i.t("chartXaxisType_2");
  } else if (type === 2) {
    var maxDay = finished.length;
    var xAxisData = [];
    for (var i = 1; i <= maxDay; i++) {
      xAxisData.push($i.t("v2hijs6", {number: i}));
    }
    chartOptionRepairLine.xAxis.data = xAxisData;
  } else if (type === 3) {
    var maxWeek = finished.length;
    var xAxisData = [];
    for (var i = 1; i <= maxWeek; i++) {
      xAxisData.push($i.t("v2hijs7", {number: i}));
    }
    chartOptionRepairLine.xAxis.data = xAxisData;
  } else if (type === 4) {
    chartOptionRepairLine.xAxis.data = $i.t("chartXaxisType_5");
  }

  var series = chartOptionRepairLine.series;
  series[0].data = finished;
  series[1].data = seriesData.todo;
  series[2].data = seriesData.processing;
  series[3].data = seriesData.cancelled;
  // TODO
  chartRepairLine.setOption(chartOptionRepairLine, true);
}

/* endregion */
