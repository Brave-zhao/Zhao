/**
 * 文件名：黑色主题监控窗口
 * 作者：刘露
 * 版本 1.0.4
 * 修改时间：2022-10-20
 * 内容: 新页面
 */

var PAGE_NAME = "v2MonitorIndex";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;

var vur = new Vue({
  el: "#app",
  i18n: $i18n.obj,
  data() {
    return {
      place: {
        currPlaceNode: {},
        list: [], // 地点树
        search: "", // 地点搜索
        id: "", // 地点ID
        props: {
          // 树形结构传参
          label: "name",
        },
        type: 0, // 地点显示类型
        defauleIds: [],
        classList: [], // 教室列表
        checkedPlaceList: [], // 选中的课室
        originalList: [], //原始地点树数据
        classroomList: [], //只有教室的地点树
      },
      page: {
        pageNum: 0,
        pageSize: 1,
        count: 0,
      },
      autoplay: false, // 是否轮训
      inputAutoplayTime: "", // 输入框的轮训时间
      interval: "", // 真正的轮训时间
      initialIndex: 0, // 当前页
      inputInitialIndex: "", // 前往多少页

      flyData: {},
      hlsData: {},
      pageIds: [],
      selectPlaceAllStream: [],
      directionList: {
        top: "el-icon-arrow-up",
        right: "el-icon-arrow-right",
        down: "el-icon-arrow-down",
        left: "el-icon-arrow-left",
        refresh: "el-icon-refresh",
      },

      meetingData: {
        title: { label: "会议主题", value: null },
        // { label: "参会人", value: "", type: "" },
        createTime: { label: "会议时间", value: null },
        services: { label: "会议服务", value: null },
        fileItems: { label: "会议附件", value: null },
      },
      personnelList: [], // 考勤人员列表
    };
  },
  mounted: function () {
    this.initData();
  },
  computed: {
    carouselTotal: function () {
      var page = this.page;
      if (page.count <= 0) return 0;
      var size = Math.ceil(page.count / page.pageSize);
      return size;
    },
    selectPlaceNames: function () {
      var names = [];
      this.place.checkedPlaceList.forEach(function (item) {
        names.push(item.name);
      });
      return names;
    },
    selectPlaceItem: function () {
      var items = [],
        _this = this;
      this.place.checkedPlaceList.forEach(function (item) {
        if (!item.myPlay) _this.$set(item, "myPlay", false);
        items.push(item);
      });
      return items;
    },
    defaultCheckedIds: function () {
      var ids = [];
      this.place.checkedPlaceList.forEach(function (item) {
        ids.push(item.id);
      });
      return ids;
    },
    /**
     * 根据选中的地点返回分页后的二维数组
     * @returns 
     */
    cutApartSelectPlaceAllStream: function () {
      var list = this.selectPlaceAllStream,
        page = this.page,
        size = page.pageSize,
        total = Math.ceil(page.count / size);
        newList = [],
        arr = [];

      for (var index = 0; index < total; index++) {
        var start = index * size,
          end = start + size;

        if (start == (index * size)) {
          arr = [];
          for (var i = start; i < end; i++) {
            var key = i - start;
            arr[key] = list[i] || {};
          }
          newList.push(arr);
        }
      }

      return newList;

    },
    singleMainVideo: function () {
      //单课室主视频
      return this.selectPlaceAllStream.length > 0
        ? this.selectPlaceAllStream[0]
        : null;
    },
    singleSubVideos: function () {
      //单课室子视频列表
      var maxNum = 3;
      //排除掉主视频，从1到3即是子视频
      var length = this.selectPlaceAllStream.length;
      if (length >= maxNum + 1) {
        return this.selectPlaceAllStream.slice(1, maxNum + 1);
      }
      var list = this.selectPlaceAllStream.slice(1);
      length = list.length;
      for (var i = 0; i < maxNum - length; i++) {
        list.push(null);
      }
      return list;
    },
  },
  methods: {
    initData: function () {
      this._getplaces();
      this.initPageIds();
    },

    /**
     * 设置新的视频流列表
     * 新的逻辑将地点所有的视频流显示出来
     *
     * 2022-12-15
     * 刘露
     */
    setSelectPlaceAllStream: function () {
      var list = [],
        _this = this,
        placeIdObj = {};
      
      this.selectPlaceAllStream.forEach(function (item) {
        placeIdObj[item.id] = item;
      });
      this.place.checkedPlaceList.forEach(function (item) {
        var stream = item.stream ? item.stream.split(",") : [""];
        var streamName = item.streamName ? item.streamName.split(",") : [""];
        for (var index = 0; index < stream.length; index++) {
          var id = item.id + "my" + (index + 1);
          var obj = {
            id: id,
            stream: stream[index],
            name: item.name,
            myPlay: placeIdObj[id] ? placeIdObj[id].myPlay : false,
            myError: placeIdObj[id] ? placeIdObj[id].myError : false,
            streamName: streamName.length > index ? streamName[index] : "",
          };
          list.unshift(obj);
        }
      });

      var listIds = {};
      list.forEach(function (item) {
        listIds[item.id] = item;
      });

      this.selectPlaceAllStream.forEach(function (item) {
        if (!list[item.id]) {
          if (_this.isFlvUrl(item.stream)) _this.destroyFlvPlayer(item.id);
          else _this.destroyHlsPlayer(item.id);
        }
      });

      this.$set(this, "selectPlaceAllStream", list);
    },

    /**
     * 获取地点列表
     */
    /**
     * 获取地点列表
     */
    _getplaces: function (id) {
      var placeId = id || 0;
      var _this = this;
      this.$http
        .get("/api/v2/index/places/" + placeId + "/permission")
        .then(function (res) {
          var data = res.data;
          if (!data.length) return;
          //原始树数据
          _this.place.originalList = data;
          //转成树数据
          var placeData = _this.$global.jsonTree(data, {});
          _this.place.list = placeData;
          //只有教室树数据
          var classrooms = data;
          _this.place.classroomList = _this.$global.jsonTree(classrooms, {});

          //单课室初始化
          if (_this.place.type === 0) {
            _this.initSinglePlace();
            return;
          }

          //多课室初始化
          _this.initMultiPlace();
        });
    },
    /**
     * 获取当前地点下所有课室
     */
    _getChildrenPlaceList: function (data) {
      if (!data.length) return;
      this.checkChangePlaceNode(null, { checkedNodes: data });
      this.$refs.placeTree.setCurrentKey(this.place.id);
      this.loopPlay();
      // if (this.selectPlaceAllStream[0] && this.selectPlaceAllStream[0].stream)
      //   this.playStream(this.selectPlaceAllStream[0]);
    },
    initPageIds: function () {
      for (let index = 0; index < 10; index++) {
        this.pageIds.push("page" + index);
      }
    },
    /**
     * 地点过滤 ElementUI框架的树形控件搜索地点过滤方法 使用方法可参考Element框架
     * @param {*} value
     * @param {*} data
     * @returns
     * @author 刘露
     * @version 1.0.3, 2022-10-20
     */
    filterNode(value, data) {
      if (!value) return true;
      var label = this.place.props.label;
      return data[label].indexOf(value) !== -1;
    },
    /**
     * 多课室选中时触发
     * != 0 只显示课室或者场所的地点列表
     * @param {*} curr 当前点击的
     * @param {*} data 所有选中的 具体值参考Element框架
     */
    checkChangePlaceNode: function (curr, data) {
      var list = data.checkedNodes.filter(function (item) {
        return item.type != 0;
      });
      var newList = this.groupSort(list);
      // for (let index = 0; index < 10; index++) {
      //   newList.push(...newList);
      // }
      this.autoplay = false;
      this.place.checkedPlaceList = newList;
      this.setSelectPlaceAllStream();
      this.page.count = this.selectPlaceAllStream.length;
      // this.page.count = this.place.checkedPlaceList.length;

      //清空选中的树节点，并选中新的节点
      var keys = newList.map(function (el) {
        return el.id;
      });
      console.log("keys:", keys);
      this.$nextTick(function () {
        this.$refs.placeTree.setCheckedKeys(keys);
      });
    },
    /**
     * 数组排序 根据从小到大
     * @param {*} arr 需要排序的数组
     * @returns
     */
    groupSort: function (arr) {
      for (var i = 1; i <= arr.length - 1; i++) {
        var preIndex = i - 1,
          current = arr[i],
          currentKey = arr[i].id;
        while (preIndex >= 0 && arr[preIndex].id > currentKey) {
          arr[preIndex + 1] = arr[preIndex];
          preIndex--;
        }
        arr[preIndex + 1] = current;
      }
      return arr;
    },
    changePlaceNode: function (data) {
      this.place.currPlaceNode = data;
      this.$nextTick(function () {
        this.$refs.placeTree.setCurrentKey(data.id);
      });
    },
    changeClassroomType: function (val) {
      if (this.place.type === val) return;

      //清空播放器
      this.clearAllPlayers();

      //清空选择的树节点
      this.place.checkedPlaceList = [];

      this.place.type = val;

      if (val === 1) {
        //多课室
        this.initMultiPlace();
        return;
      }

      //单课室
      this.initSinglePlace();
    },
    /**
     * 初始化多课室
     * @returns
     */
    initMultiPlace: function () {
      var places = this.place.list;
      if (places.length <= 0) {
        return;
      }

      var place = places[0];
      this.choosePlaceNode(place);

      var originalList = this.place.originalList;
      //获取子节点
      var placeId = this.place.id;
      var children = originalList.filter(function (el) {
        return el.id == placeId || el.pid == placeId;
      });
      this._getChildrenPlaceList(children);
    },
    clearAllPlayers: function () {
      for (var key in this.flyData) {
        this.destroyFlvPlayer(key);
      }
      for (var key in this.hlsData) {
        this.destroyHlsPlayer(key);
      }
    },
    /**
     * 修改宫格数
     * @param {*} size
     */
    changePageSize: function (size) {
      var _this = this;
      if (this.page.pageSize == size) return;
      this.page.pageSize = size;
      this.page.pageNum = 0;
      this.inputAutoplayTime = "";
      this.autoplay = false;
      this.loopPlay();
    },
    /**
     * 宫格边距计算
     * @param {*} index 当前index 1 开始
     * @returns
     */
    carouselItemPadding: function (index) {
      var size = this.page.pageSize;
      if (size <= 1) return;
      var left = 0,
        top = 0;

      if (size == 4) {
        // 18
        left = index % 2 != 0 ? 18 : 0;
        top = index < size / 2 ? 0 : 18;
      } else if (size == 9) {
        // 20
        left = index % 3 != 0 ? 20 : 0;
        top = index < size / 3 ? 0 : 20;
      }

      return {
        paddingLeft: left + "px",
        paddingTop: top + "px",
      };
    },
    /**
     * 视频流地址
     * @param {*} num 页码
     * @param {*} size 每页显示数
     * @returns
     */
    selectPlaceItemStreamUrl: function (num, size) {
      var selectPlaceAllStream = this.selectPlaceAllStream;
      var currIndex = this.currPageIndex(num, size);
      return selectPlaceAllStream[currIndex].stream;
    },
    /**
     * 确认轮训
     * @returns
     */
    placeCarousel: function () {
      if (!this.selectPlaceAllStream.length)
        return this.$global.showError($i.t("v2mijs4"));
      if (!this.inputAutoplayTime)
        return this.$global.showError($i.t("v2mijs5"));

      if (!this.inputAutoplayTime || this.autoplay) {
        this.autoplay = false;
        return;
      }

      this.interval = this.inputAutoplayTime;
      if (this.inputAutoplayTime === "0") {
        this.autoplay = false;
        return this.$global.showWarning($i.t("v2mijs6"));
      }
      this.autoplay = true;
    },
    /**
     * 循环将符合条件自动播放
     * @param {*} myplay 是否将已经播放的重新播放
     */
    loopPlay: function (myplay) {
      for (var key in this.flyData) {
        this.destroyFlvPlayer(key);
      }
      for (var key in this.hlsData) {
        this.destroyHlsPlayer(key);
      }
      var page = this.page,
        start = page.pageSize * page.pageNum,
        end = page.pageSize * (page.pageNum + 1);
      for (var index = start; index < end; index++) {
        var item = this.selectPlaceAllStream[index];
        if (item && item.stream) this.playStream(item);
      }
    },
    /**
     * 当轮训修改当前选中的索引时修改当前页
     * @param {*} curIndex
     * @param {*} oldIndex
     */
    changeInterval: function (curIndex, oldIndex) {
      var num = this.page.pageNum;
      this.page.pageNum = curIndex;

      if (curIndex != num) this.loopPlay();
    },
    /**
     * 点击翻页 修改轮训索引
     * @param {*} val
     */
    updatePageNum: function (val) {
      var page = this.page,
        carouselTotal = this.carouselTotal - 1,
        num = page.pageNum + val;
      if (num > carouselTotal) num = 0;
      if (num < 0) num = carouselTotal;
      this.confirmSetIndexAndPlayVideo(num);
    },
    /**
     * 设置轮训时间
     * @param {*} num 要设置的时间 秒为单位
     * @returns
     */
    setInitialIndex: function (num) {
      if (!this.selectPlaceAllStream.length)
        return this.$global.showError($i.t("v2mijs7"));
      var carouselTotal = this.carouselTotal;
      if (num > carouselTotal) {
        this.inputInitialIndex = this.carouselTotal;
        num = carouselTotal;
      }
      num = num * 1;
      this.confirmSetIndexAndPlayVideo(num - 1);
    },
    confirmSetIndexAndPlayVideo: function (num) {
      if (this.page.pageNum == num) return;
      this.page.pageNum = num;
      this.$refs.carousel.setActiveItem(num);
      this.loopPlay();
    },
    /**
     *
     * @param {*} page 当前页
     * @param {*} size 当前页的第几个
     * @returns
     */
    currPageIndex: function (page, size) {
      page -= 1;
      var pageSize = this.page.pageSize;
      return page * pageSize + (size - 1);
    },
    currVideo: function (num, size) {
      var item = this.selectPlaceAllStream[this.currPageIndex(num, size)];
      return item;
    },
    /**
     * 播放直播流 初始变量
     * @param {*} item
     */
    playStream: function (item) {
      var id = "video" + item.id,
        url = item.stream,
        _this = this;
      this.$set(item, "myPlay", true);
      this.$set(item, "myError", false);
      if (!url) return;
      _this.$nextTick(function () {
        _this.initHlsVideo(id, url);
      });
    },
    /**
     * 是否为flv直播流
     * @param {*} url
     * @returns
     */
    isFlvUrl: function (url) {
      //是否flv链接
      if (url == null) {
        return false;
      }

      //判断文件后缀是否mp4、mov、m4v、mkv
      url = this.$global.getUrlWithoutQuery(url);
      if (
        this.$global.isAllowSuffix(url, ["mp4", "mov", "m4v", "mkv", "m3u8"])
      ) {
        return false;
      }

      //判断是否以rtsp://,rtmp://开头
      url = url.toLowerCase();
      if (url.indexOf("rtmp://") == 0 || url.indexOf("rtsp://") == 0) {
        return false;
      }
      return true;
    },
    /**
     * 播放flv格式直播流
     * @param {*} id dom Id 或者ref
     * @param {*} url 流地址
     */
    flvPlay: function (id, url) {
      //使用flvjs播放
      var videoEle = this.$refs[id][0];
      var _this = this;
      if (videoEle) {
        var flyData = flvjs.createPlayer({
          type: "flv",
          url: url,
          isLive: true,
          cors: true,
          enableWorker: true,
          enableStashBuffer: false,
          stashInitialSize: 128,
          autoCleanupSourceBuffer: true,
        });
        flyData.attachMediaElement(videoEle);
        flyData.load();
        flyData.play();
        flyData.on(flvjs.Events.ERROR, function (err) {
          _this.setMyError(id);
        });
        this.flyData[id] = flyData;
      }
    },
    setMyError: function (id) {
      var _this = this;
      setTimeout(function () {
        _this.selectPlaceAllStream.forEach(function (el) {
          if (el.id == id.replace("video", "")) {
            _this.destroyFlvPlayer("video" + el.id);
            _this.destroyHlsPlayer("video" + el.id);

            _this.$set(el, "myError", true);
            _this.$set(el, "myPlay", false);
          }
        });
      }, 5000);
    },
    /**
     * 销毁flv直播流
     * @param {*} id dom Id 或者ref
     */
    destroyFlvPlayer: function (id) {
      // 销毁flv播放器的播放
      if (this.flyData[id]) {
        this.flyData[id].pause();
        this.flyData[id].unload();
        this.flyData[id].detachMediaElement();
        this.flyData[id].destroy();
        delete this.flyData[id];
      }
    },
    /**
     * 销毁hls直播流
     * @param {*} id dom Id 或者ref
     */
    destroyHlsPlayer: function (id) {
      var video = (this.$refs[id] || document.getElementById(id) || [])[0];
      if (!video) return;
      video.pause();
      if (this.hlsData[id]) {
        this.hlsData[id].destroy();
        delete this.hlsData[id];
      }
    },
    /**
     * 初始化直播流
     * @param {*} id dom Id 或者ref
     * @param {*} url 流地址
     * @returns
     */
    initHlsVideo: function (id, url) {
      if (this.isFlvUrl(url)) return this.flvPlay(id, url);
      var config = {
        liveSyncDurationCount: 0,
      };
      var _this = this;
      var video = (this.$refs[id] || document.getElementById(id))[0];
      if (Hls.isSupported()) {
        this.hlsData[id] = this.hlsData[id] || new Hls(config);
        this.hlsData[id].loadSource(url);
        this.hlsData[id].attachMedia(video);
        this.hlsData[id].on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        this.hlsData[id].on(Hls.Events.ERROR, function (event, data) {
          _this.setMyError(id);
        });
      } else if (video && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("canplay", function () {
          video.play();
        });
      }
    },

    /**********************************单课室************************************ */
    directionAbsolute: function (key) {
      var style = {};
      if (key == "top") style.top = 0;
      if (key == "right") style.right = 0;
      if (key == "down") style.bottom = 0;
      if (key == "left") style.left = 0;
      return style;
    },

    /**
     * 初始化单课室
     * @returns
     */
    initSinglePlace: function () {
      places = this.place.originalList;
      //默认选中第一个教室
      var classrooms = places.filter(function (el) {
        return el.type == 1;
      });
      if (classrooms.length <= 0) {
        return;
      }
      var defaultPlace = classrooms[0];
      this.choosePlaceNode(defaultPlace);
      this.initSingleData(defaultPlace);
    },
    /**
     * 初始化单课室节点数据，包括课程数据和播放流数据
     * @param {*} place
     */
    initSingleData: function (place) {
      this.initSingleStreams(place);
    },
    /**
     * 初始化单课室视频流，并播放
     * @param {*} place
     */
    initSingleStreams: function (place) {
      this.place.checkedPlaceList = [place];
      this.setSelectPlaceAllStream();
      this.playSingleStreams();
    },
    playSingleStreams: function () {
      //关闭全部播放器
      this.clearAllPlayers();

      //播放主视频以及子视频
      if (this.singleMainVideo != null) {
        this.playStream(this.singleMainVideo);
      }

      var _this = this;
      this.singleSubVideos
        .filter(function (el) {
          return el != null;
        })
        .forEach(function (el) {
          _this.playStream(el);
        });
    },
    /**
     * 选中指定地点，包括地点背景选中以及数据选中
     * @param {*} place
     * @returns
     */
    choosePlaceNode: function (place) {
      if (!place) {
        return;
      }
      this.place.defauleIds = [place.id];
      this.$set(this.place, "id", place.id);
      this.getMeetingInitData();
      this.changePlaceNode(place);
    },
    /**
     * 手动点击选择单课室地点节点
     * @param {*} data
     */
    changeSinglePlaceNode: function (data) {
      //非教室节点，不更改
      if (data.type !== 1) {
        return;
      }
      this.changePlaceNode(data);
      this.initSingleData(data);
    },
    /**
     * 选择主视频窗口
     */
    chooseMainStream: function (stream) {
      if (stream == null || stream.stream == null) {
        return false;
      }

      //交换位置
      var streams = this.selectPlaceAllStream;
      var index = streams.indexOf(stream);
      if (index == -1) {
        return;
      }

      var main = this.singleMainVideo;
      streams[0] = stream;
      streams[index] = main;
      this.$set(streams, 0, stream);
      this.$set(streams, index, main);
      this.$nextTick(function () {
        this.changePlayStream(main, stream);
        this.changePlayStream(stream, main);
      });
    },
    /**
     * 修改播放器播放地址，如果是同一类型，则切换播放器地址，如果是不同类型，则销毁播放器后重新加载
     * @param {*} stream 旧的流数据
     * @param {*} newStream 新的播放流数据
     */
    changePlayStream: function (stream, newStream) {
      if (stream == null || newStream == null) {
        return;
      }
      //销毁原视频
      var id = "video" + stream.id;
      if (this.flyData[id]) {
        this.destroyFlvPlayer(id);
      } else if (this.hlsData[id]) {
        this.destroyHlsPlayer(id);
      }
      //播放流地址
      this.playStream(newStream);
    },
    /**
     * 下载文件
     * @param {*} blobFile
     * @param {*} fileName
     */
    downloadFun(blobFile, fileName) {
      let blob = new Blob([blobFile], {
        type: "application/pdf;charset=UTF-8",
      });
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href); //释放内存
      }
    },
    getMeetingInitData: function () {
      var url = "api/v2/monitor/single/place/init?placeId=" + this.place.id,
        _this = this;

      this.$http.get(url).then(function (res) {
        var data = res.data.meeting || {},
          attendance = data.attendance || {},
          temporaryUsers = data.temporaryUsers || [],
          attendanceObj = {
            absenceUser: 1,
            checkInUser: 1,
            lateUser: 1,
            unCheckUser: 1,
          },
          list = [];

        for (var key in attendance) {
          if (attendanceObj[key]) {
            attendance[key].forEach(function (item) {
              _this.$set(item, "myStatus", key);
            });
            list = list.concat(attendance[key]);
          }
        }
        _this.personnelList = list.concat(temporaryUsers); // 人员列表 + 临时人员
        var meetingData = _this.meetingData;
        for (var key in meetingData) {
          if (data[key]) {
            var value = data[key];
            if (key == "createTime") {
              var startTime = _this.$global.formatDate(data.startTime, "HH:mm"),
                endTime = _this.$global.formatDate(data.endTime, "HH:mm");
                value = startTime + " ~ " + endTime;
            } else if (key == "services") {
              value = data[key].map(function (service) {
                return service.name + "×" + service.num;
              }).join("、")
            }
            _this.$set(meetingData[key], "value", value);
          }
        }
      });
    },
  },
  watch: {
    "place.search": function (val) {
      this.$refs.placeTree.filter(val);
    },
  },
});
