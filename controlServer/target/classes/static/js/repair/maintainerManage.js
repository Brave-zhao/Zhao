var ajax = new Ajax(_config);
var PAGE_NAME = "maintainerManage";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;
var imageCompress = new ImageCompress({maxWidth:1024, maxHeight:1024, quality: 0.7});

var highLightDebounce = debounce(function (id) {
    vue.jumpHighLightPage(id);
}, 500);

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

/**
 * 获取进度条天数对应的颜色
 * @param day 天数
 * @returns {string|*} 颜色class
 */
function getProgressColor(day) {
    var threshold = PROPERTY_PROGRESS_THRESHOLD; // 阈值
    var color = PROPERTY_PROGRESS_COLOR; // 阈值对应的颜色
    for (var i in threshold) {
        if (threshold[i] >= day) return color[i];
    }
    return color[color.length - 1];
}

/**
 * 获取进度条天数对应的长度（px）
 * @param day 天数
 * @returns {number} 长度px
 */
function getProgressPx(day) {
    return Math.min((day / PROGRESS_MAX_DAY * PROGRESS_MAX_PX), PROGRESS_MAX_PX);
}

/**
 * 初始化资产列表中进度条的样式
 * @param list
 * @returns {[]}
 */
function initTableProgressStyle(data) {
    var maxPx = PROGRESS_MAX_PX;
    var maxDay = PROGRESS_MAX_DAY;
    var style = {}; // 表格第i行数据的样式
    var nextOverhaulDay = data.nextOverhaulDay; // 下次检修天数
    var isOutLife = data.life <= 0; // 是否报废
    var life = data.life; // 距离报废天数
    var overhaulPx = (nextOverhaulDay / maxDay) * maxPx; // 下次检修天数进度长度（像素）
    overhaulPx = parseInt(Math.min(overhaulPx, maxPx));
    style.overHaulPx = overhaulPx;
    style.isOutLife = isOutLife;
    if (!isOutLife) {
        var lifePx = (life / maxDay) * maxPx;
        lifePx = parseInt(Math.min(lifePx, maxPx)); // 距离报废天数进度条长度（像素）
        style.lifePx = lifePx;
    } else {
        style.lifePx = 0;
    }
    var overhaulColor = getProgressColor(nextOverhaulDay); // 下次检修颜色
    var lifeColor = getProgressColor(life); // 距离报废颜色
    style.overhaulColor = overhaulColor;
    style.lifeColor = lifeColor;
    data.style = style; // 设置样式到数据的style属性
}

/**
 * 获取模糊查询后的筛选列表
 * @param screen
 * @returns {[]|*}
 */
function getScreenList(list, like) {
    var _list = []; // 过滤后的筛选列表
    if (entity(like)) return list;
    for (var i in list) {
        var str = list[i].name;
        if (str.search(like) >= 0) {
            _list.push(list[i]);
        }
    }
    return _list;
}

/**
 * 初始化自定义类型的属性
 * @param _this
 * @param obj
 * @param ref
 */
function initCustomize(_this, obj, ref) {
    setTimeout(function () {
        var isCustomize = _this.$refs[ref] && _this.$refs[ref].createdSelected;
        if (!obj.obj.propertyTypeId) return;
        if (isCustomize) {
            Vue.set(obj.obj, "control", null);
            Vue.set(obj.obj, "customizePropertyTypeName", obj.obj.propertyTypeId);
        } else {
            var pt = _this.propertyTypeMap[obj.obj.propertyTypeId];
            Vue.set(obj.obj, "control", pt.control + '');
            Vue.set(obj.obj, "customizePropertyTypeName", null);
        }
        obj.isAddCustomizePropertyType = isCustomize;
    }, 0)
}

/**
 * 创建二维码的值
 * @param data
 * @returns {string}
 */
function createQrcodeValue(data, tenantId, repairUrl) {
    var url = repairUrl + "?uniqueCode=" + data.uniqueCode
        + "&&tenantId=" + tenantId
        + "&&ts=" + new Date().getTime();
    console.log(encodeURI(url))
    return encodeURI(url);
}

var _dialogAdd = {
    show: false,
    loading: false,
    obj: {
        typeIdx: null,
        level: 1,
        createTimeMillis: null,
        // completeTimeMillis: null,
        phone: '',
        status: 1,
        name: "",
        property: null,
        placeName: '',
        bookTimeMillis: null,
    },
    collapse: "1",
    uniqueBtnLoading: false,
    isAddCustomizePropertyType: false,
    showResetQrcode: false,
}

var vue = new Vue({
    el: "#app",
    i18n: $i,
    data: {
        // region # v3
        updateStatusMap: {
            1: "未分配",
            2: "已分配",
            3: "处理中",
            4: "已完成",
        },
        detailDialogVisible: false,
        detailData: {},
        detailResult: null,
        detailEval: null,
        assignList: [],
        depAssignList: [],
        detailCollapse1: [],
        detailCollapse2: [],
        // endregion
        pickerOptions: {
            disabledDate: function(time) {
                return time.getTime() < (Date.now() - 86400000);
            },
        },
        REPAIR_PROPERTY_TYPE_FLAG: "REPAIR",
        DEFAULT_TYPE_NAME: "——",
        processMap: {
            1: '未分配',
            2: '已分配',
            3: '处理中',
            4: '已完成',
            8: '已撤销',
        },
        readMap: {
            1: '未读',
            "2,3,4,8": "已读",
        },
        // preview
        previewImageVisible: false,
        previewImageUrl: '',
        previewVideoVisible: false,
        previewVideoUrl: '',
        // fileList
        fileList: [],
        // user
        user: {},
        // total
        total: {
            todo: 0,
            finished: 0,
            sum: 0,
        },
        //
        config: _config,
        staticPath: _config.staticPath,
        multipleSelection: [],
        totalLoading: false,
        mainLoading: false, // 主界面的loading
        //分页信息
        page: {
            pageNum: 1,
            pageSize: 8,
            count: 1,
            target: '',
        },
        defaultProps: {
            children: 'children',
            label: 'name'
        },
        //列表数据初始化参数
        condition: {
            loading: {
                PROPERTY_NAME: false,
                PROPERTY_BRAND: false,
                PROPERTY_MODEL: false,
                REPAIR_NICKNAME: false,
                place: false,
            },
            pid: 0,
            placeId: null,
            placeName: null,
            like: null,
            names: [],
            progress: {
                maxOverhaul: 0,
                maxLife: 0,
            },
            sort: {
                create_time: {
                    orderBy: "DESC",
                    prop: "create_time",
                }
            }, // 排序方式
            screen: { // 名称/品牌/型号筛选列表
                PROPERTY_NAME: {like: '', hasDo: false, list: [], value: []},
                PROPERTY_BRAND: {like: '', hasDo: false, list: [], value: []},
                PROPERTY_MODEL: {like: '', hasDo: false, list: [], value: []},
                REPAIR_NICKNAME: {like: '', hasDo: false, list: [], value: []},
                TYPE_NAME: {like: '', hasDo: false, list: [], value: []},
            },
            propertyType: [], // 已选中的资产类型
            ptLike: '',
            status: null,
            typeName: "",
        },
        list: [],
        dialog: {//模态框属性
            feedback: {
                show: false,
                loading: false,
                obj: {},
                result: {
                    description: "",
                    status: 1,
                },
                fileList: [],
            },
            del: {
                show: false,
                msg: $i.t('p130'),
                id: null,
            },
            checkIn: {
                show: false,
                msg: $i.t('p181'),
                ids: '',
            },
            add: deepClone(_dialogAdd),
            update: {//编辑
                show: false,
                loading: false,
                obj: {},
                result: {
                    status: 1,
                },
                collapse: "1",
                uniqueBtnLoading: false,
                isAddCustomizePropertyType: false,
                showResetQrcode: false,
                allowEditPlace: false,
                assignList: [],
                assignVisible: false,
                assignLoading: false,
                oldStatus: 1,
                assignParams: {},
                oldAssignParams: {},
                oldAssignList: [],
                fileList: [],
            },
            selectUser: {
                show: false,
                multipleSelection: [],
                list: [],
                like: '',
                page: {
                    pageNum: 1,
                    pageSize: 8,
                    count: 1,
                },
                imageUrlPrefix: _config.server.central,
            },
            qrcode: {
                show: false,
                loading: false,
                obj: {},
            },
            template: {
                show: false,
                loading: false,
                like: '',
                chooseObj: {},
            },
            // region # 打印
            print: {
                show: false,
                obj: {},
                time: null,
                assignList: [],
                depAssignList: [],
                detailResult: null,
                detailEval: null,
            },
            // endregion
        },
        realPlace: [], // 源数据
        place: [], // 树状数据
        propertyType: [], // 全部资产类型
        propertyTypeMap: {}, // 资产映射
        PropertyTemplate: [], // 全部厂家模板
        uniqueCodeTip: $importTipObj.uniqueCode, // 唯一码设置说明
        tenantId: '', // 登录用户租户
        repairUrl: '', // 移动端报修页面地址
        statusMap: {
            "1": {name: "未分配", color: "#30AFE1"},
            "2": {name: "已分配", color: "#FF5D5D"},
            "3": {name: "处理中", color: "#E65775"},
            "4": {name: "已完成", color: "#27CC7D"},
            "8": {name: "已撤销", color: "#BDBDBD"},
        },
        propertyArray: [],
        propertyArrayMap: {},

        placeData: {},
        isAdmin: false,
        isAdminMode: false,

        types: [],
        levels: [
            {level: 1, name: '轻微'},
            {level: 2, name: '严重'},
            {level: 3, name: '紧急'},
        ],
        levelMapping: {
            1: '轻微',
            2: '严重',
            3: '紧急',
        },

        cdDepList: [],
        cdUserList: [],

        permitPlaceIdMap: {},
        placeIdServiceIdListMap: {},

        isShowFeedbackUpload: true,

        highLightIdMap: {},
    },
    created: function () {
        this.getList();
        this.getInitData();
    },
    mounted: function () {

    },
    computed: {
        // region # 评价
        isCanEval: function () {
            var obj = this.dialog.evaluate.evaluation;
            return !$u.isNull(obj.score);
        },
        // endregion
        filterTypes: function () {
            var obj = this.dialog.add.obj;
            var placeId = obj.placeId;
            if ($u.isNull(placeId)) return [];
            var types = this.types;
            if (this.isAdmin === true) {
                return types.concat([{id:-1,name:"(" + $i.t('p158') + ")",isUnSorted: true}]);
            }
            var serviceIdList = this.placeIdServiceIdListMap[placeId];
            if ($u.isNull(serviceIdList)) return types;
            var serviceIdMap = {};
            serviceIdList.forEach(function (sid) {
                serviceIdMap[sid] = true;
            });
            return types.filter(function (t) {
                return serviceIdMap[t.id] === true;
            });
        },
        /**
         *
         */
        isShowProgress: function () {
            // var target = this.dialog.add.obj.createTimeMillis;
            // if ($u.isNull(target)) return false;
            // var now = new Date().getTime();
            // return target < now;
            return true;
        },
        isCanAdd: function () {
            var obj = this.dialog.add.obj;
            return !$u.isNull(obj.placeName) &&
                !$u.isNull(obj.typeIdx) &&
                // (!this.isPropertyRepair || !$u.isNull(obj.name)) &&
                // !$u.isNull(obj.name) &&
                // !$u.isNull(obj.propertyTypeName) &&
                // !$u.isNull(obj.brand) &&
                // !$u.isNull(obj.description) &&
                !$u.isNull(obj.nickname) &&
                ($u.isNull(obj.phone) || /^[1][0-9]{10}$/.test(obj.phone)) &&
                // !$u.isNull(obj.phone) &&
                // /^[1][0-9]{10}$/.test(obj.phone) &&
                // !$u.isNull(obj.createTimeMillis) &&
                // (!this.isShowProgress || obj.status !== 4 || !$u.isNull(obj.completeTimeMillis)) &&
                !$u.isNull(obj.bookTimeMillis);
        },
        /**
         * 表头已选中的地点列表
         * @returns {*}
         */
        conditionPlaceSelect: function () {
            var place = this.place;
            var placeId = this.condition.placeId;
            if (entity(placeId)) return [];
            return $u.getListAttrByPid(place, placeId, "name", []);
        },
        /**
         * 表头品牌筛选列表
         */
        screenTypeList: function () {
            var list = this.propertyType;
            var like = this.condition.ptLike;
            return getScreenList(list, like);
        },
        /**
         * 表头品牌筛选列表
         */
        screenModelList: function () {
            var screen = this.condition.screen['PROPERTY_MODEL'];
            return getScreenList(screen.list, screen.like);
        },
        /**
         * 表头品牌筛选列表
         */
        screenBrandList: function () {
            var screen = this.condition.screen['PROPERTY_BRAND'];
            return getScreenList(screen.list, screen.like);
        },
        /**
         * 表头名称筛选列表
         */
        screenNameList: function () {
            var screen = this.condition.screen['PROPERTY_NAME'];
            return getScreenList(screen.list, screen.like);
        },
        /**
         * 表头品牌筛选列表
         */
        screenNicknameList: function () {
            var screen = this.condition.screen['REPAIR_NICKNAME'];
            return getScreenList(screen.list, screen.like);
        },

        isPropertyRepair: function () {
            /*var idx = this.dialog.add.obj.typeIdx;
            if ($u.isNull(idx)) return false;
            var type = this.filterTypes[idx];
            if ($u.isNull(type)) return false;
            var flag = type.flag;
            return flag === this.REPAIR_PROPERTY_TYPE_FLAG;*/
            return true;
        },

        typeNameList: function () {
            var screen = this.condition.screen['TYPE_NAME'];
            return getScreenList(screen.list, screen.like);
        },
    },
    methods: {
        // region # websocket
        _initWS: function () {
            var user = this.user;
            GLOBAL_USER_ID = user.id;
            GLOBAL_WS_MESSAGE = this._wsMessageCb;
            initWebSocket();
        },
        _wsMessageCb: function (e) {
            console.log("收到ws消息:", e.data);
            var data = JSON.parse(e.data);
            if (data.type === 1) {
                this.highLightIdMap[data.repairId] = true;
                this.$message.success($i.t('toast1'));
                highLightDebounce(data.repairId);
                // this.toFirstPage();
            }
        },
        jumpHighLightPage: function (id) {
            // reset filter
            this._clearCondition();
            var pageSize = this.page.pageSize;
            var _this = this;
            ajax.handle("get", "api/repair/maintainer/focusCount", {
                focusId: id
            }, null, function (rs) {
                var focusCount = rs.data;
                var pageNum = Math.floor(focusCount / pageSize) + 1;
                _this.getList(pageNum);
            });
        },
        _clearCondition: function () {
            this.$refs.condition.setCurrentKey(null);
            this.$refs.multipleTable.clearSort();
            var obj = this.condition;
            obj.like = '';
            obj.sort = {
                create_time: {
                    orderBy: "DESC",
                    prop: "create_time",
                }
            };
            obj.screen.PROPERTY_NAME.value = [];
            obj.screen.REPAIR_NICKNAME.value = [];
            obj.propertyType = [];
            obj.placeId = null;
            obj.status = null;
            obj.screen.TYPE_NAME.value = [];
        },
        highLightRow: function (obj) {
            var row = obj.row;
            if (this.highLightIdMap[row.id]) {
                return 'focus-row';
            }
            return "";
        },
        _clearHighLight: function (id) {
            if (this.highLightIdMap[id]) {
                Vue.delete(this.highLightIdMap, id);
            }
        },
        // endregion

        // region # 反馈
        fileChangeForFeedback: function (file, fileList) {
            // console.log(fileList);
            this.dialog.feedback.fileList = fileList;
        },
        fileRemoveForEdit: function (file) {
            console.log(file);
            if (file.old) {
                var fileList = this.dialog.update.fileList;
                var index = fileList.indexOf(file);
                fileList.splice(index, 1);
            } else {
                this.$refs['edit-upload'].handleRemove(file);
            }
        },
        // endregion

        // region # 签到
        showCheckInDialog: function (obj) {
            this._clearHighLight(obj.id);
            if (obj.status !== 2) {
                return;
            }
            var dialog = this.dialog.checkIn;
            dialog.id = obj.id;
            dialog.show = true;
        },
        doCheckIn: function () {
            var _this = this;
            var param = {};
            var dialog = this.dialog.checkIn;
            ajax.handle("post", "api/repair/maintainer/checkIn/byId/" + dialog.id, param, null, function (rs) {
                _this.$message.success($i.t('toast[7]'));
                _this.getList();
                dialog.show = false;
            });
        },
        // endregion

        // region # 评价
        showFeedbackDialog: function (obj) {
            if (obj.status !== 3) {
                return;
            }
            var dialog = this.dialog.feedback;
            dialog.obj = obj;
            dialog.result = {
                description: "",
                status: 1,
            };
            dialog.show = true;

            var _this = this;
            setTimeout(function () {
                _this.$refs['feedback-upload'].clearFiles();
                _this.isShowFeedbackUpload = false;
                setTimeout(function () {
                    _this.isShowFeedbackUpload = true;
                }, 0);
            }, 0);
        },
        doFeedback: function () {
            var dialog = this.dialog.feedback;
            var params = dialog.result;

            var formData = new FormData();
            for (var key in params) {
                formData.append(key, params[key]);
            }

            formData.append("repairId", dialog.obj.id);

            var fileList = dialog.fileList || [];

            var _this = this;
            if (fileList.length > 0) {
                imageCompress.compressList(fileList, formData, function (formData) {
                    _this._doFeedback(formData);
                });
                return;
            }

            this._doFeedback(formData);
        },
        _doFeedback: function (formData) {
            var _this = this;
            var obj = this.dialog.feedback;
            obj.loading = true;
            ajax.handleWithFiles("post", "api/repair/maintainer/result", formData, null, function (rs) {
                _this.$message.success($i.t('toast[7]'));
                obj.show = false;
                obj.loading = false;
                _this.getList();
            }, function (rs) {
                obj.loading = false;
                _this.$message.error(rs.msg);
            }, function (error) {
                obj.loading = false;
                _this.$message.error($i.t('toast[3]'));
            });
        },
        // endregion

        // region # 打印
        showPrintDialog: function (id) {
            var dialog = this.dialog.print;

            var _this = this;
            ajax.handle("get", "api/v2/repair/detail/byId/" + id,
                {}, null, function (rs) {
                    var data = rs.data;
                    var repair = data.repair;
                    repair.fileList = repair.files ? repair.files.split(",") : [];
                    dialog.obj = data.repair;
                    dialog.assignList = data.assignList;
                    dialog.depAssignList = data.depAssignList;
                    // 报修结果
                    var repairResult = data.repairResult || null;
                    if (!$u.isNull(repairResult)) {
                        repairResult.fileList = repairResult.files ? repairResult.files.split(",") : [];
                    }
                    dialog.detailResult = repairResult;
                    // 报修评价
                    dialog.detailEval = data.evaluation || null;
                    // 打印时间
                    dialog.time = new Date();
                    dialog.show = true;
                });
        },
        doPrint: function (domId) {
            Print('#' + domId);
        },
        // endregion

        // region # huawei
        _refreshPropertyList: function () {
            var obj = this.dialog.add.obj;
            var typeIdx = obj.typeIdx;
            var placeId = obj.placeId;
            obj.name = null;
            obj.property = null;
            obj.propertyType = null;
            obj.propertyTypeName = null;
            obj.propertyId = null;
            obj.brand = null;
            this.propertyArray = [];
            this.propertyArrayMap = {};
            if ($u.isNull(placeId) || $u.isNull(typeIdx)) return;
            var repairType = this.filterTypes[typeIdx];
            var repairTypeId = null;
            var onlyServiceIdUnSort = false;
            if (repairType.isUnSorted !== true) {
                repairTypeId = repairType.id;
            } else {
                onlyServiceIdUnSort = true;
            }
            this.dialog.add.loading = true;
            var _this = this;
            ajax.handle("get", "api/repair/getPropertyList", {
                    placeIds: placeId,
                    systemServiceIds: repairTypeId,
                    onlyServiceIdUnSort: onlyServiceIdUnSort,
                }, null, function (rs) {
                    var data = rs.data;
                    _this.propertyArray = rs.data;
                    var propertyArrayMap = {};
                    data.forEach(function (p) {
                        propertyArrayMap[p.id] = p;
                    });
                    _this.propertyArrayMap = propertyArrayMap;
                    _this.dialog.add.loading = false;
                }, function (rs) {
                    _this.$message.error($i.t('p151'));
                    _this.dialog.add.loading = false;
                }, function (error) {
                    _this.$message.error($i.t('p131'));
                    _this.dialog.add.loading = false;
                });
        },
        // endregion

        // region # v3/repair
        /**
         * 报修编辑时，选择文件后的回调
         * @param file
         * @param fileList
         */
        fileChangeForResult: function (file, fileList) {
            this.dialog.update.result.fileList = fileList;
        },
        /**
         * 查看报修详情
         * @param id
         */
        showDetail: function (id) {
            this._clearHighLight(id);
            var _this = this;
            this.assignList = [];
            this.depAssignList = [];
            this.mainLoading = true;
            this.detailCollapse1 = [];
            this.detailCollapse2 = [];
            // 获取detail
            ajax.handle("get", "api/v2/repair/detail/byId/" + id,
            {}, null, function (rs) {
                var data = rs.data;
                var repair = data.repair;
                repair.fileList = repair.files ? repair.files.split(",") : [];
                _this.detailData = data.repair;
                _this.assignList = data.assignList;
                _this.depAssignList = data.depAssignList;
                // 报修结果
                var repairResult = data.repairResult || null;
                if (!$u.isNull(repairResult)) {
                    repairResult.fileList = repairResult.files ? repairResult.files.split(",") : [];
                }
                _this.detailResult = repairResult;
                // 报修评价
                _this.detailEval = data.evaluation || null;
                _this.detailDialogVisible = true;
                _this.$nextTick(function () {
                    _this.mainLoading = false;
                });
            }, function (rs) {
                _this.$nextTick(function () {
                    _this.mainLoading = false;
                });
                _this.$message.error(rs.msg);
            }, function (error) {
                _this.$nextTick(function () {
                    _this.mainLoading = false;
                });
                _this.$message.error($i.t('p131'));
            });

        },
        /**
         * 报修编辑时，状态chg事件回调
         * @param value
         */
        updateStatusChg: function (value) {
            var dialog = this.dialog.update;
            var oldStatus = dialog.oldStatus;
            if ((oldStatus <= 2 && value > 2) || value === 1) {
                dialog.assignList = deepClone(dialog.oldAssignList);
                dialog.assignParams = deepClone(dialog.oldAssignParams);
            }
        },
        /**
         * 打印
         */
        printUpdateDialog: function (domId) {
            if (domId === 'printDom') {
                this.detailCollapse1 = ['1'];
                this.detailCollapse2 = ['1'];
            }
            setTimeout(function () {
                Print('#' + domId, {
                    title: $i.t('p132')
                });
            });
        },
        // endregion

        // region # v2/repair
        /**
         * 报修类型选择
         */
        repairTypeChange: function (idx) {
            /*if (data.flag !== this.REPAIR_PROPERTY_TYPE_FLAG) {
                var obj = this.dialog.add.obj;
                obj.property = null;
                obj.name = "";
                delete obj.propertyType;
                delete obj.propertyTypeName;
                delete obj.propertyId;
                delete obj.brand;
            }*/
        },

        _initTypeList: function (isExpand) {
            var obj = this.condition.screen.TYPE_NAME;
            obj.list = this.types;
        },
        // endregion

        // region # 选择用户相关
        userListSelectionChange: function (val) {
            this.dialog.selectUser.multipleSelection = val;
        },
        showSelectUser: function () {
            this.dialog.selectUser.show = true;
            this.toFirstUserPage();
        },
        toFirstUserPage: function () {
            this.dialog.selectUser.page.pageNum = 1;
            this.getUserList();
        },
        getUserList: function (pageNum) {
            var obj = this.dialog.selectUser;
            var url = "api/user/getUserList";
            obj.list = [];
            if (pageNum) obj.page.pageNum = pageNum;
            var param = {
                pageSize: obj.page.pageSize,
                pageNum: obj.page.pageNum,
                like: obj.like,
                roleId: -1,
                status: -1,
            };
            var _this = this;
            obj.loading = true;
            ajax.handle("get", url, param, null, function (rs) {
                obj.loading = false;
                var data = rs.data;
                obj.list = data.data;
                obj.page.count = data.count;
            }, function (rs) {
                _this.$message.error(rs.msg);
                obj.loading = false;
            }, function (err) {
                _this.$message.error($i.t('p133'));
                obj.loading = false;
            });
        },
        _checkAlreadySelected: function (selectedList) {
            var _this = this;

            // 应该要选中的idMap
            var userIdMap = {};
            selectedList.forEach(function (item) {
                userIdMap[item.id] = item;
            });

            setTimeout(function () {
                var list = _this.dialog.selectUser.list;
                // 第一页选过的idMap
                var alreadyCheckedIdMap = {};
                // 第一页勾选
                list.forEach(function (item) {
                    if (!$u.isNull(userIdMap[item.id])) {
                        _this.$refs.userListTable.toggleRowSelection(item, true);
                        alreadyCheckedIdMap[item.id] = true;
                    }
                });
                // 非第一页的勾选
                selectedList.forEach(function (item) {
                    if ($u.isNull(alreadyCheckedIdMap[item.id])) {
                        _this.$refs.userListTable.toggleRowSelection(item, true);
                    }
                });
            }, 0);
        },
        _clearSelectUserDialog: function () {
            this.dialog.selectUser.multipleSelection = [];
            if (this.$refs.userListTable) {
                this.$refs.userListTable.clearSelection();
            }
        },
        // endregion


        // region # 分配工单相关
/*        assignDialogCallback: function (data) {
            // var userList = data.userList || [];
            // var depList = data.depList || [];
            // TODO 这里可能要换成部门树选择？
            var dialog = this.dialog.selectUser;
            var status = dialog.obj.status;
            var userList = dialog.multipleSelection;
            var depList = [];
            if (status === 1 && userList.length === 0 && depList.length === 0) {
                $u.showError(this, "请选中要分配的人员");
                return;
            }
            var repairId = this.dialog.update.obj.id;
            var userIdArray = [], depIdArray = [];
            userList.forEach(function (item) {
                userIdArray.push(item.id);
            });
            depList.forEach(function (item) {
                depIdArray.push(item.id);
            });

            var params = {
                repairId: repairId,
                userIdList: userIdArray,
                depIdList: depIdArray
            };

            // 如果只分配给了部门，需要检查所分配的部门是否有设置负责人
            // 只有管理员需要这个提示
            if (userIdArray.length === 0 && this.isAdmin) {
                this._checkDepManager(params, userList, depList);
            } else {
                this._postAssign(params, userList, depList);
            }
        },*/
        assignDialogCallback: function (data) {
            var dialog = this.dialog.update;
            var status = dialog.obj.status;
            var userList = data.userList || [];
            var depList = data.depList || [];
            // if (status === 1 && userList.length === 0 && depList.length === 0) {
            if (userList.length === 0 && depList.length === 0) {
                $u.showError(this, $i.t('p134'));
                return;
            }
            var repairId = dialog.obj.id;
            var userIdArray = [], depIdArray = [];
            userList.forEach(function (item) {
                userIdArray.push(item.id);
            });
            depList.forEach(function (item) {
                depIdArray.push(item.id);
            });

            var params = {
                // repairId: repairId,
                userIdList: userIdArray,
                depIdList: depIdArray
            };

            // 如果只分配给了部门，需要检查所分配的部门是否有设置负责人
            // 只有管理员需要这个提示
            if (userIdArray.length === 0 && depList.length !== 0 && this.isAdmin) {
                this._checkDepManager(params, userList, depList);
            } else {
                this._postAssign(params, userList, depList);
            }
        },
        _checkDepManager: function (params, userList, depList) {
            var _this = this;
            var dialog = this.dialog.update;
            dialog.assignLoading = true;
            ajax.handle("get", "api/repair/checkDepManager", {
                depIds: params.depIdList.join(","),
            }, null, function (json) {
                dialog.assignLoading = false;
                var isOK = json.data === true;
                if (isOK) {
                    _this._postAssign(params, userList, depList);
                } else {
                    // 如果都没有负责人，需要弹框提醒
                    _this.$confirm($i.t('p135'), $i.t('tips'), {
                        confirmButtonText: $i.t('confirm'),
                        cancelButtonText: $i.t('cancel'),
                        type: 'warning',
                        callback: function (action, instance) {
                            if (action === 'confirm') {
                                _this._postAssign(params, userList, depList);
                            }
                        },
                    });
                }
            }, function (rs) {
                _this.$message.error(rs.msg);
                dialog.assignLoading = false;
            }, function (err) {
                _this.$message.error($i.t('p133'));
                dialog.assignLoading = false;
            });

        },
        // v3/repair
        _postAssign: function (params, userList, depList) {
            var dialog = this.dialog.update;
            dialog.assignVisible = false;
            dialog.assignLoading = false;
            userList.push.apply(userList, depList);
            dialog.assignList = userList;
            dialog.assignParams = params;
            // 如果有分配，需要将进度设置为"已分配"
            if (userList.length > 0) {
                dialog.obj.status = 2;
            }
        },
/*        _postAssign: function (params, userList, depList) {
            var _this = this;
            var dialog = this.dialog.update;
            dialog.assignLoading = true;

            var status = dialog.obj.status;

            var url = "api/repair-assign";
            var isEdit = status === 2;
            // 判断是否为编辑
            if (isEdit) {
                url = "api/repair-assign/edit";
            }

            ajax.handleWithCT("post", url, JSON.stringify(params), null, "application/json", function (json) {
                $u.showSuccess(_this, "分配成功");
                dialog.assignVisible = false;
                dialog.assignLoading = false;
                if (isEdit && userList.length === 0 && depList.length === 0) {
                    dialog.obj.status = 1;
                } else {
                    dialog.obj.status = 2;
                }
                userList.push.apply(userList, depList);
                dialog.assignList = userList;
                _this.getList();
            }, function (rs) {
                _this.$message.error(rs.msg);
                dialog.assignLoading = false;
            }, function (err) {
                _this.$message.error($i.t('p133'));
                dialog.assignLoading = false;
            });
        },*/
        doAssign: function () {
            // this.dialog.selectUser.show = true;
            // this.toFirstUserPage();
            // TODO ?
            var dialog = this.dialog.update;
            // var repairId = dialog.obj.id;
            this.getPlaceAndDepData(dialog);
        },
        getPlaceAndDepData: function (dialog) {                              // 获取地点和部门数据 接口
            var _this = this;
            ajax.handle("get", "api/department/getMyDepartment/byRepairId/" + dialog.obj.id, {}, null, function (json) {

                var data = json.data;

                var mode = data.mode;
                var depList = data.depList || [];

                _this.isAdminMode = mode === "admin";

                depList.forEach(function (item) {
                    item.isLeaf = true;
                });
                var treeDepList = _this.treeDataHandler(depList);

                if (!$u.isNull(mode) && mode !== "admin" && mode !== "all") {
                    // 限制部门
                    var filterIdArray = mode.split(",");
                    var allAfter = [];
                    var alreadyExistMap = {};
                    for (var key in filterIdArray) {
                        var depId = filterIdArray[key];
                        var afterFilter = $u.getListByPid(treeDepList, depId, []);
                        afterFilter.forEach(function (dep) {
                            var _dep = deepClone(dep);
                            delete _dep.children;
                            if (!alreadyExistMap[_dep.id]) {
                                allAfter.push(_dep);
                                alreadyExistMap[_dep.id] = true;
                            }
                        });
                    }
                    treeDepList = _this.treeDataHandler(allAfter);
                }

                _this.placeData = treeDepList;

                // 放入assignList
                var cdUserList = [];
                var cdDepList = [];
                var dialog = _this.dialog.update;
                if (dialog.obj.status === 2) {
                    var assignList = dialog.assignList;

                    assignList.forEach(function (item) {
                        if ('username' in item) {
                            // 用户
                            cdUserList.push(item);
                        } else {
                            // 部门
                            cdDepList.push(item);
                        }
                    });
                }
                _this.cdUserList = cdUserList;
                _this.cdDepList = cdDepList;

                dialog.assignVisible = true;
            })
        },
        treeDataHandler: function (resource, strongLeaf) {                     // 整合处理tree数据，resourse 资源，对其处理的数据
            var data = resource;
            var mapPlaceId = {};
            var zArr = [];
            var _this = this;
            data.forEach(function (item) {
                var id = item.id;
                var pid = item.pid;
                var self = item;
                if (mapPlaceId.hasOwnProperty(pid)) {
                    mapPlaceId[pid].children = mapPlaceId[pid].children || [];
                    mapPlaceId[pid].children.push(self);
                } else {
                    zArr.push(self);
                }
                mapPlaceId[id] = self;

                // region # monkey patch - 猴子布丁 🍮
                // No1.
                var depList = item.depList;
                if (depList) {
                    // 给depList下的所有记录标记为叶子
                    depList.forEach(function (item) {
                        item.isLeaf = true;
                    })
                    // 整理叶子树，即部门树
                    var depData = _this.treeDataHandler(depList);
                    depData.forEach(function (dep_item) {
                        self.children = self.children || [];
                        self.children.unshift(dep_item);
                    })
                    // 移除已经部门化冗余字段
                    delete self.depList;
                }

                // No2. 对非分类的部门处理，强调为叶子
                if (strongLeaf) {
                    item.isLeaf = true;
                }
                // endregion 🍮

            });
            // console.log(zArr);


            return zArr;
        },
        // endregion

        /**
         * 更新-进度完成
         */
        processComplete: function () {
            var obj = this.dialog.update.obj;
            obj.status = 4;
            if ($u.isNull(obj.completeTimeMillis)) {
                obj.completeTimeMillis = new Date().getTime();
            }
        },
        /**
         * 视频预览
         * @param url
         */
        handleVideoPreview: function (url) {
            // TODO
            this.previewVideoUrl = url;
            // this.previewVideoUrl = "http://192.168.2.36/video/test.mp4";
            this.previewVideoVisible = true;
        },
        /**
         * 图片预览
         * @param url
         */
        handlePicturePreview: function (url) {
            // TODO
            this.previewImageUrl = url;
            // this.previewImageUrl = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fs9.sinaimg.cn%2Fbmiddle%2F5ceba31bg5d6503750788&refer=http%3A%2F%2Fs9.sinaimg.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1614325373&t=85275bf99374ff5f7ca48637ce7a7c52";
            this.previewImageVisible = true;
        },
        /**
         *
         * @param file
         * @param fileList
         */
        fileChange: function (file, fileList) {
            this.fileList = fileList;
        },

        /**
         * 名称改变
         */
        propertyNameChange: function(id) {
            this.dialog.add.obj.name = this.propertyArrayMap[id].name;
            this.dialog.add.obj.propertyType = this.propertyArrayMap[id].propertyTypeId;
            this.dialog.add.obj.propertyTypeName = this.propertyArrayMap[id].propertyTypeName;
            this.dialog.add.obj.propertyId = this.propertyArrayMap[id].id;
            this.dialog.add.obj.brand = this.propertyArrayMap[id].brand;
        },
        /**
         * 进度
         */
        statusChange: function (arg) {
            var obj = arg[0];
            var type = arg[1];
            var isRefresh = arg[2];
            Vue.set(obj, 'status', type.value);
            if ( isRefresh ) this.toFirstPage();
        },
        /**
         * 清除所有的筛选是否已查询
         */
        cleanAllScreenHasDo: function () {
            var obj = this.condition;
            obj.screen["PROPERTY_NAME"].hasDo = false;
            obj.screen["PROPERTY_MODEL"].hasDo = false;
            obj.screen["PROPERTY_BRAND"].hasDo = false;
            obj.screen["REPAIR_NICKNAME"].hasDo = false;
        },

        /**
         * 触发文件input点击事件
         * @param inputId
         */
        choosePhoto: function (inputId) {
            $('#' + inputId).click();
        },
        /**
         * 获取/刷新全部资产类型
         */
        getAllPropertyType: function () {
            var _this = this;
            var param = {};
            ajax.handle("get", "v3/property/getAllPropertyType", param, null, function (rs) {
                var data = rs.data;
                _this.propertyType = data;
            }, function (rs) {
                console.log(rs)
            });
        },
        _clearSelectUserDialog: function () {
            this.dialog.selectUser.multipleSelection = [];
            if (this.$refs.userListTable) {
                this.$refs.userListTable.clearSelection();
            }
        },
        /**
         * 获取/刷新全部厂家模板列表
         */
        getPropertyTemplate: function () {
            var _this = this;
            var obj = this.dialog.template;
            var param = {
                like: obj.like,
            };
            obj.loading = true;
            ajax.handle("get", "v3/property/getTemplateList", param, null, function (rs) {
                var data = rs.data.data;
                _this.PropertyTemplate = data;
                obj.loading = false;
            }, function (rs) {
                console.log(rs)
                obj.loading = false;
            });
        },
        /**
         * 完成模板选择
         */
        submitTemplateChoose: function () {
            var obj = this.dialog.template.obj;
            var chooseTemplate = this.dialog.template.chooseObj;
            if (!entity(chooseTemplate)) {
                obj.obj.brand = chooseTemplate.brand;
                obj.obj.model = chooseTemplate.model;
                obj.obj.manufacturer = chooseTemplate.manufacturer;
                obj.obj.manufacturerPhone = chooseTemplate.manufacturerPhone;
                obj.obj.remarks = chooseTemplate.remarks;
                obj.obj.purchaseDateTS = chooseTemplate.purchaseDate;
            }
            this.dialog.template.chooseObj = {};
            this.dialog.template.show = false;
        },
        /**
         * 选择厂家模板
         * @param data
         */
        chooseTemplate: function (data) {
            this.dialog.template.chooseObj = data; // 设置选中的厂家模板
        },
        /**
         * 显示选择厂家模板模态框
         * @param obj dialog.add.obj或dialgo.update.obj
         */
        showTemplateDialog: function (obj) {
            this.dialog.template.obj = obj;
            this.dialog.template.show = true;
        },
        /**
         * 保存厂家模板
         * @param obj
         */
        saveTemplate: function (obj) {
            var _this = this;
            var param = this.createParam(obj);
            if (entity(param.brand)) return $u.showWarning(this, $i.t('p139'));
            ajax.handle("post", "v3/property/addTemplate", param, null, function (rs) {
                var data = rs.data;
                _this.getPropertyTemplate();
                $u.showSuccess(_this, $i.t('p140'))
            }, function (rs) {
                console.log(rs)
                $u.showError(_this, $i.t('p141'))
            });
        },
        /**
         * 查看资产二维码
         */
        showQrcodeDialog: function (data) {
            var obj = this.dialog.qrcode;
            obj.obj = data;
            var url = createQrcodeValue(data, this.tenantId, this.repairUrl);
            obj.show = true;
            setTimeout(function () {
                // $("#qrcode_qrcode").html(""); // 清除旧的二维码
                $u.initQrcode(obj, url, "qrcode_qrcode", 210, 210); // 创建二维码
            }, 0)
        },
        /**
         * 创建资产二维码
         * @param obj
         * @param elementId
         */
        createPropertyQrcode: function (obj, elementId) {
            var url = createQrcodeValue(obj.obj, this.tenantId, this.repairUrl);
            var param = this.createParam(obj);
            if (!this.verifyForm(param)) return;
            $u.initQrcode(obj, url, elementId, 210, 210);
            obj.showResetQrcode = true;
        },
        /**
         * 将自定义的内容放在请求参数的指定属性
         * @param ref 自定义内容所在组件的ref
         * @param param 请求参数
         * @param key v-model绑定的值
         * @param customKey 放入的属性的键
         */
        initCustomizeParam: function (ref, param, key, customKey) {
            var isCustomize = this.$refs[ref].createdLabel === param[key];
            if (isCustomize) {
                param[key] = null;
                param[customKey] = this.$refs[ref].createdLabel;
            }
        },
        /**
         * 自动生成二维码
         */
        autoCreateUniqueCode: function (obj) {
            var _this = this;
            var param = {};
            obj.uniqueBtnLoading = true;
            ajax.handle("get", "v3/property/autoCreateUniqueCode", param, null, function (rs) {
                var data = rs.data;
                Vue.set(obj.obj, 'uniqueCode', data);
                obj.uniqueBtnLoading = false;
            }, function (rs) {
                console.log(rs)
                obj.uniqueBtnLoading = false;
            });
        },
        /**
         * 终极限制input输入为数字方法
         * @param obj
         * @param key
         * @param isInt
         */
        handleAmountChange: function (obj, key, isInt) {
            var temp = obj[key].toString();
            if (isInt) {
                temp = temp.replace(/[^\d]/g, ""); //清除"数字"和"."以外的字符
                temp = temp.replace(/^(\-)*(\d+)$/, "$1$2"); //只能输入整数
            } else {
                temp = temp.replace(/。/g, ".");
                temp = temp.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
                temp = temp.replace(/^\./g, ""); //验证第一个字符是数字
                temp = temp.replace(/\.{2,}/g, ""); //只保留第一个, 清除多余的
                temp = temp.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                temp = temp.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
            }
            obj[key] = temp;
        },
        /**
         * 表头地点模糊查询
         * @param value
         * @param data
         * @returns {boolean}
         */
        placeFilter: function (value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        /**
         * 获取页面初始化数据
         */
        getInitData: function () {
            var _this = this;
            var param = {};
            this.totalLoading = true;
            ajax.handle("get", "api/repair/my/manage/data/init", param, null, function (rs) {
                console.log(rs);
                _this.user = rs.data.user;
                _this.total = rs.data.total;

                var isAdmin = rs.data.isAdmin || false;
                _this.isAdmin = isAdmin;
                _this.placeIdServiceIdListMap = rs.data.placeIdServiceIdListMap || {};

                var placeList = rs.data.place;
                if (!isAdmin) {
                    var permitPlaceIdList = rs.data.permitPlaceIdList || [];
                    var permitPlaceIdMap = {};
                    if (permitPlaceIdList.length > 0) {
                        permitPlaceIdList.forEach(function (_placeId) {
                            permitPlaceIdMap[_placeId] = true;
                        });
                    }
                    placeList = placeList.filter(function (p) {
                        return permitPlaceIdMap[p.id] === true;
                    });
                }

                _this.place = jsonTree(placeList, {});
                var propertyType = rs.data.propertyType;
                _this.propertyType = propertyType;
                for (var i in propertyType) {
                    Vue.set(_this.propertyTypeMap, propertyType[i].id, propertyType[i]);
                    // _this.propertyTypeMap[propertyType[i].id] = propertyType[i];
                }
                _this.types = rs.data.types;
                _this._initTypeList();
                _this._initWS();
                _this.$nextTick(function () {
                    _this.totalLoading = false;
                });
            }, function (rs) {
                _this.$nextTick(function () {
                    _this.totalLoading = false;
                });
                _this.$message.error($i.t('p142'));
            }, function (err) {
                _this.$nextTick(function () {
                    _this.totalLoading = false;
                });
                _this.$message.error($i.t('p143'));
            });
        },
        /**
         * 初始化flag对应的筛选列表
         * @param isExpand
         * @param flag
         */
        initScreenList: function (isExpand, flag) {
            var _this = this;
            var obj = this.condition;
            if (isExpand && !obj.screen[flag].hasDo) {
                var param = {flag: flag};
                obj.loading[flag] = true;
                var url = "api/central/property/getScreen";
                if (flag === "REPAIR_NICKNAME") {
                    url = "api/property/getScreen";
                }
                ajax.handle("get", url, param, null, function (rs) {
                    var data = rs.data;
                    obj.screen[flag].list = data;
                    obj.loading[flag] = false;
                    obj.screen[flag].hasDo = true;
                }, function (rs) {
                    console.log(rs)
                    obj.loading[flag] = false;
                    obj.screen[flag].hasDo = true;
                });
            }
        },
        /**
         * 更改列表查询排序规则
         * @param sort
         */
        sortChange: function (sort) {
            var prop = sort.prop;
            var order = sort.order;
            $u.saveSortSingle(prop, order, this.condition.sort);
            this.toFirstPage();
        },
        /**
         * 获取所有的地点数据
         */
        getAllPlace: function () {
            var _this = this;
            var obj = this.condition;
            var param = {};
            obj.loading.place = true;
            ajax.handle("get", "place/getAll", param, null, function (rs) {
                var data = rs.data;
                _this.realPlace = deepClone(data);
                data = jsonTree(data, {});
                _this.place = data;
                obj.loading.place = false;
            }, function (rs) {
                console.log(rs)
                obj.loading.place = false;
            });
        },
        /**
         * 执行删除数据
         */
        doDelete: function () {
            var ids = this.dialog.del.ids;
            this.dialog.del.show = false;
            this.ajaxMultipleDelete(ids);
        },
        //显示新增模态框
        showAddModal: function () {
            this.dialog.add.obj.createTimeMillis = new Date().getTime();
            this.dialog.add.obj.completeTimeMillis = new Date().getTime();
            this.dialog.add.obj.nickname = this.user.nickname || '';
            this.dialog.add.obj.phone = this.user.phone || '';
            this.dialog.add.show = true;
        },
        //删除单条数据
        singleDelete: function (id) {
            var _this = this;
            this.dialog.del.ids = id;
            this.dialog.del.show = true;
        },
        /**
         * 显示编辑模态框
         * @param data 需要编辑的数据对象
         */
        showUpdateDialog: function (data) {
            if (data.status >= 3) {
                return;
            }
            var obj = this.dialog.update;
            this._clearSelectUserDialog();
            obj.loading = true;
            var _this = this;
            ajax.handle("get", "api/v3/repair/detail/byId/" + data.id, {}, null, function (rs) {
                obj.loading = false;
                // if (data.status === 1) Vue.set(data, "status", 2);
                var repair = rs.data.repair;
                var copy = deepClone(repair);
                copy.spend = copy.spend ? formatSpendTime(copy.spend) : $i.t('p137');
                copy.createTime = moment(copy.createTime).format("YYYY-MM-DD HH:mm");


                copy.bookTimeMillis = $u.isNull(copy.bookTime) ? null : new Date(copy.bookTime).getTime();
                obj.obj = copy;

                var fileList = [];
                var files = copy.files ? copy.files.split(",") : [];
                if (files.length > 0) {
                    files.forEach(function (f) {
                        fileList.push({
                            name: "",
                            url: _this.staticPath + f,
                            old: true,
                            path: f,
                        });
                    });
                }
                _this.isShowEditUpload = false;
                obj.fileList = fileList;
                obj.show = true;
                setTimeout(function () {
                    _this.isShowEditUpload = true;
                }, 0);
            }, function (rs) {
                _this.$message.error($i.t('p138'));
                obj.loading = false;
            }, function (error) {
                obj.loading = false;
                _this.$message.error($i.t('p131'));
            });
        },
        //编辑
        update: function () {
            var _this = this;
            var obj = this.dialog.update;
            var params = {
                bookTimeMillis: obj.obj.bookTimeMillis,
                phone: obj.obj.phone,
                description: obj.obj.description  || '',
                level: obj.obj.level,
            };
            if ($u.isNull(params.bookTimeMillis)) {
                _this.$message.error($i.t('p178'));
                return;
            }
            var formData = new FormData();
            for (var key in params) {
                formData.append(key, params[key]);
            }


/*            // 分配工单&&Result
            if (params.status === 2) {
                // 分配工单
                buildFormData(formData, obj.assignParams, "repairAssignAddDto");
            } else if (params.status === 4) {
                // 维修结果
                buildFormData(formData, obj.result, "repairResult");
                // 处理文件
                // 文件处理
                var fileList = obj.result.fileList || [];
                if (fileList.length > 0) {
                    imageCompress.compressList(fileList, formData, function (formData) {
                        _this._doUpdate(formData);
                    });
                    return;
                }
            }*/

            var fileList = obj.fileList || [];
            var oldFileList = [];
            var newFileList = [];
            var oldFiles = "";
            console.log(fileList);
            if (fileList.length > 0) {
                fileList.forEach(function (f) {
                    if (f.old) {
                        oldFileList.push(f.path);
                    } else {
                        newFileList.push(f);
                    }
                });

                if (oldFileList.length > 0) {
                    oldFiles = oldFileList.join(",");
                }

                formData.append("oldFiles", oldFiles);

                console.log(newFileList);

                if (newFileList.length > 0) {
                    imageCompress.compressList(newFileList, formData, function (formData) {
                        _this._doUpdate(formData);
                    });
                    return;
                }
            } else {
                formData.append("oldFiles", oldFiles);
            }

            this._doUpdate(formData);
        },
        _doUpdate: function (formData) {
            var _this = this;
            var obj = this.dialog.update;
            obj.loading = true;
            // if (!this.verifyForm(param)) return;
            ajax.handleWithFiles("post", "api/repair/my/byId/" + obj.obj.id, formData, null, function (rs) {
                _this.$message.success($i.t('toast[0]'));
                obj.show = false;
                obj.loading = false;
                // _this.toFirstPage();
                _this.getList();
            }, function (rs) {
                obj.loading = false;
                _this.$message.error(rs.msg);
            }, function (error) {
                obj.loading = false;
                _this.$message.error($i.t('p144'));
            });
        },
        //取消部门选择
        cancelDep: function (type, obj, forware) {
            obj.depId = null;
            obj.depName = null;
            eval("this.$refs." + type + ".setCurrentKey(null)");
            if (forware) this.toFirstPage();
        },
        //取消地点选择
        cancelNodeSelect: function(type, obj, forware, place) {
            Vue.set(obj, place, {});
            eval("this.$refs." + type + ".setCurrentKey(null)");
            if (forware) this.toFirstPage();
        },
        cancelNodeSelect2: function(type, obj, forware, idKey, nameKey) {
            Vue.set(obj, idKey, null);
            Vue.set(obj, nameKey, null);
            eval("this.$refs." + type + ".setCurrentKey(null)");
            if (forware) this.toFirstPage();
        },
        //重置新增用户表单
        resetAddForm: function () {
            this.dialog.add = deepClone(_dialogAdd);
            $("#add_qrcode").html(""); // 清除二维码
        },
        /**
         * 检查表单数据合法性
         * @param param 待检查数据
         */
        verifyForm: function (param) {
            var name = param.name; // 名称
            var uniqueCode = param.uniqueCode; // 唯一码
            var propertyTypeId = param.propertyTypeId; // 资产类型
            var customizePropertyTypeName = param.customizePropertyTypeName;
            var control = param.control; // 是否控制资产
            if (entity(name)) {
                $u.showWarning(this, $i.t('p145'));
                return false;
            }
            if (entity(uniqueCode)) {
                $u.showWarning(this, $i.t('p146'));
                return false;
            }
            if (!/^\d{6}$/.test(uniqueCode)) {
                $u.showWarning(this, $i.t('p147'));
                return false;
            }
            if (entity(propertyTypeId) && entity(customizePropertyTypeName)) {
                $u.showWarning(this, $i.t('p148'));
                return false;
            }
            if (entity(control)) {
                $u.showWarning(this, $i.t('p149'));
                return false;
            }
            return true;
        },
        /**
         * 创建新增/更新时的请求参数
         * @param obj
         */
        createParam: function (obj) {
            var param = deepClone(obj.obj);
            if (param.customizePropertyTypeName) param.propertyTypeId = null; // 如果用户自定义资产类型，则不需要传资产id
            return param;
        },
        /**
         * 更新数据
         */
        updateData: function () {
            var _this = this;
            var obj = this.dialog.update;
            var param = this.createParam(obj);
            if (!this.verifyForm(param)) return;
            ajax.handle("post", "v3/property/update", param, null, function (rs) {
                _this.$message.success($i.t('toast[0]'));
                obj.show = false;
                obj.loading = false;
                if (obj.isAddCustomizePropertyType) {
                    _this.getAllPropertyType();
                }
                _this.getList();
                _this.cleanAllScreenHasDo();
            }, function (rs) {
                obj.loading = false;
                _this.$message.error(rs.msg);
            });
        },
        // 提交新增
        addData: function () {
            if (!this.isCanAdd) return;
            var obj = this.dialog.add;
            obj.loading = true;
            // var param = this.createParam(obj);
            // if ( !this.verifyForm(param) ) return;
            var params = deepClone(obj.obj);

            // 如果没有选择设备，清空不需要传递的参数
            if ($u.isNull(params.propertyId)) {
                delete params.propertyType;
                delete params.propertyTypeName;
                delete params.propertyId;
                delete params.brand;
                delete params.name;
            }

            // 参数处理
            var typeIdx = params.typeIdx;
            var repairType = this.filterTypes[typeIdx];
            if (repairType.isUnSorted !== true) {
                params.type = repairType.id;
                params.typeName = repairType.name;
                params.typeFlag = repairType.flag || "";
            }

            console.log(params);

            // if (!this.isShowProgress) params.status = 2;
            var formData = new FormData();
            for (var key in params) {
                formData.append(key, params[key]);
            }
            if ($u.isNull(params.completeTimeMillis)) {
                formData.delete("completeTimeMillis");
            }
            // 文件处理
            var fileList = this.fileList;
            if (fileList.length > 0) {
                var _this = this;
                imageCompress.compressList(fileList, formData, function (formData) {
                    _this._doAddData(formData);
                });
            } else {
                this._doAddData(formData);
            }

            // return ;
        },
        _doAddData: function (formData) {
            var obj = this.dialog.add;
            var _this = this;
            obj.loading = true;
            ajax.handleWithFiles("post", "api/repair", formData, null, function (rs) {
                _this.$message.success($i.t('p150'));
                obj.show = false;
                obj.loading = false;
                // if ( obj.isAddCustomizePropertyType ) {
                //     _this.getAllPropertyType();
                // }`
                _this.toFirstPage();
                _this.resetAddForm();
                _this.$refs["add-upload"].clearFiles();
                _this.fileList = [];
                _this.cleanAllScreenHasDo();
            }, function (rs) {
                obj.loading = false;
                _this.$message.error(rs.msg);
            }, function (error) {
                obj.loading = false;
                _this.$message.error($i.t('p131'));
            });
        },
        //跳转到第一页
        toFirstPage: function () {
            this.page.pageNum = 1;
            this.getList();
        },
        //跳转到最后一页
        toLastPage: function() {
            var pageSize = this.page.pageSize;
            var count = this.page.count;
            this.page.pageNum = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1;
            this.getList();
        },
        //跳转到目标页面
        toTargetPage: function() {
            if ($u.isNull(this.page.target)) {
                this.page.target = 1;
            }
            var pageSize = this.page.pageSize;
            var count = this.page.count;
            var maxPage = Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : 1; // 尾页页码
            this.page.target = this.page.target > maxPage ? maxPage : this.page.target;
            this.page.pageNum = this.page.target;
            this.getList();
        },
        //选择部门
        handleNodeClick: function (data, obj, forware, idKey, nameKey) {
            var depId = data.id;
            var depName = data.name;
            obj.depId = depId;
            obj.depName = depName;
            if (depId != obj[idKey]) {
                Vue.set(obj, idKey, depId);
                Vue.set(obj, nameKey, depName);
                Vue.set(obj, "ptype", data.type);
            }
            if (forware) this.toFirstPage();
        },
        getList: function (pageNum) {
            var _this = this;
            if (pageNum) _this.page.pageNum = pageNum;
            var sort = $u.getSortStr(this.condition.sort);
            var obj = this.condition;
            //请求参数
            var param = {
                num: this.page.pageSize,
                index: this.page.pageNum,
                search: obj.like,
                orderBy: sort, // 排序方式
                name: obj.screen.PROPERTY_NAME.value.join(","), // 按名称筛选
                nickname: obj.screen.REPAIR_NICKNAME.value.join(","), // 按报修人
                // brands: obj.screen.PROPERTY_BRAND.value.join(","), // 按品牌筛选
                // propertyType: obj.screen.PROPERTY_MODEL.value.join(","), // 按型号筛选
                propertyType: obj.propertyType.join(","), // 已选的资产类型
                placeName: this.conditionPlaceSelect.join(","), // 已选的地点
                status: obj.status,
                typeName: obj.screen.TYPE_NAME.value.join(","), // 报修类型
            };
            this.mainLoading = true;
            ajax.handle("get", "api/repair/maintainer/byDto", param, null, function (rs) {
                var data = rs.data.page.data;
                if (data.length === 0 && _this.page.pageNum > 1) {
                    _this.page.pageNum--;
                    return _this.getList();
                }
                var list = [];
                data.forEach(function (item) {
                    list.push(ajax.data2Camel(item));
                });
                _this.list = list;
                _this.page.count = rs.data.page.count;
                _this.$nextTick(function () {
                    _this.mainLoading = false;
                });
            }, function (rs) {
                _this.$nextTick(function () {
                    _this.mainLoading = false;
                });
                _this.$message.error(rs.msg);
            }, function (error) {
                _this.$nextTick(function () {
                    _this.mainLoading = false;
                });
                _this.$message.error($i.t('p131'));
            });
        },
        handleSelectionChange: function (val, obj) {
            if (obj) obj.multipleSelection = val;
            else this.multipleSelection = val;
        },
        //批量删除
        multipleDelete: function () {
            var _this = this;
            var ls = _this.multipleSelection;
            var ids = "";
            for (var i = 0; i < ls.length; i++) {
                ids = ids + ls[i].id + ",";
            }
            if (ls.length > 0) ids = ids.substring(0, ids.length - 1);
            if (ids.length > 0) {
                this.dialog.del.ids = ids;
                this.dialog.del.show = true;
            }
        },
        ajaxMultipleDelete: function (ids) {
            var _this = this;
            var param = {};
            ajax.handle("delete", "api/repair/byIds/" + ids, param, null, function (rs) {
                if (rs.code == 200) {
                    _this.$message.success($i.t('toast[2]'));
                    _this.getList();
                }
                _this.cleanAllScreenHasDo();
            }, function (rs) {
                _this.$message.error(rs.msg);
            }, function (error) {
                _this.$message.error($i.t('p131'));
            });
        },
    },
    watch: {
        "$i18n.locale": function() {
            this.updateStatusMap = $i.t('updateStatusMap');
            this.processMap = $i.t('processMap');
            this.readMap = $i.t('readMap');
            this.statusMap = $i.t('statusMap');
            this.levels = $i.t('levels');
            this.levelMapping = $i.t('levelMapping');
        },
        'condition.placeLike': function (val) {
            this.$refs.condition.filter(val);
        },
        'dialog.add.obj.placeId': function (val) {
            this._refreshPropertyList();
            var obj = this.dialog.add.obj;
            obj.typeIdx = null;
        },
        'dialog.add.obj.typeIdx': function () {
            this._refreshPropertyList();
           /* var obj = this.dialog.add.obj;
            var placeId = obj.placeId;
            if (this.isPropertyRepair) {
                obj.name = null;
                obj.property = null;
                obj.propertyType = null;
                obj.propertyTypeName = null;
                obj.propertyId = null;
                obj.brand = null;
                this.propertyArray = [];
                this.propertyArrayMap = {};
                if ($u.isNull(placeId)) return;
                this.dialog.add.loading = true;
                var _this = this;
                ajax.handle("get", "api/repair/getPropertyList", {
                    placeIds: placeId
                }, null, function (rs) {
                    var data = rs.data;
                    _this.propertyArray = rs.data;
                    var propertyArrayMap = {};
                    data.forEach(function (p) {
                        propertyArrayMap[p.id] = p;
                    });
                    _this.propertyArrayMap = propertyArrayMap;
                    _this.dialog.add.loading = false;
                }, function (rs) {
                    _this.$message.error($i.t('p151'));
                    _this.dialog.add.loading = false;
                }, function (error) {
                    _this.$message.error($i.t('p131'));
                    _this.dialog.add.loading = false;
                });
            }*/
        },
        /**
         * 改变资产类型时判断是否自定义类型
         */
        'dialog.add.obj.propertyTypeId': function () {
            var _this = this;
            var obj = this.dialog.add;
            var ref = 'add_property_type';
            initCustomize(_this, obj, ref);
        },
        'dialog.update.obj.propertyTypeId': function () {
            var _this = this;
            var obj = this.dialog.add;
            var ref = 'update_property_type';
            initCustomize(_this, obj, ref);
        },
    },
    filters: {
        formatUserList: function (list) {
            if ($u.isNull(list) || list.length === 0) return "——";
            var nameArray = [];
            list.forEach(function (item) {
                var nickname = item.nickname || item.name;
                if (!$u.isNull(nickname)) nameArray.push(nickname);
            });
            return nameArray.join("、");
        },
        formatUserList2: function (list) {
            if ($u.isNull(list) || list.length === 0) return "";
            var nameArray = [];
            list.forEach(function (item) {
                var nickname = item.nickname || item.name;
                if (!$u.isNull(nickname)) nameArray.push(nickname);
            });
            return nameArray.join("、");
        },
        /**
         * 日期格式化年月日
         * @param val
         * @returns {*}
         */
        formatDate: function (val, fmt) {
            if (!val) return "";
            return moment(val).format(fmt);
        },
        /**
         * 日期
         */
        day: function (val) {
            return val ? val + $i.t('p154') : "——";
        },
        spendFormat: function (val, status) {
            if (status !== 4) return "——";
            if ($u.isNull(val)) return "——";
            return formatSpendTime(val);
        },
        text: function (text) {
            return $u.isNull(text) ? '——' : text;
        },
        dateFull: function (mills) {
            if ($u.isNull(mills)) return '——';
            return formatDate(new Date(mills), "yyyy-MM-dd hh:mm:ss");
        },
        dateFull2: function (mills) {
            if ($u.isNull(mills)) return '';
            return formatDate(new Date(mills), "yyyy-MM-dd hh:mm:ss");
        },
    }
})

function formatSpendTime(val) {
    if (val <= 0) return $i.t('p152');
    if (val > 864000000) return $i.t('p153');
    var num = Math.ceil(val / 60);
    var minutes = num % 60;
    var hours = Math.floor(num / 60) % 24;
    var days = Math.floor(Math.floor(num / 60) / 24);
    var res = "";
    if (days !== 0) res += (days + $i.t('p154'));
    if (hours !== 0) res += (hours + $i.t('p155'));
    res += (minutes + $i.t('p156'));
    return res;
}

Vue.component("auto-padding", {
    props: {
        text: {
            type: String
        },
        enablePadding: {             //是否自动填充
            type: Boolean,
            default: true
        },
        prefixPadding: {            //前置占用的宽度
            type: String,
            default: "0px"
        }
    },
    data: function() {
        return {

        }
    },
    computed: {
        textArray: function() {
            if(this.text == null || this.text == "") {
                return [];
            }
            if(!this.enablePadding) {
                return [this.text];
            }

            var arr = [];
            for(var i = 0; i < this.text.length; i++) {
                arr.push(this.text[i]);
            }
            return arr;
        },
        paddingStyle: function() {
            return {
                "display": "flex",
                "justify-content": "space-between"
            }
        },
        containerStyle: function() {
            var width = "calc(100% - " + this.prefixPadding + ")";
            return {
                "display": "inline-block",
                "width": width
            }

        }
    },
    methods: function() {

    },
    template:
        '	<div :style="containerStyle">'+
        '		<div :style="paddingStyle">'+
        '			<span v-for="(item,index) in textArray" :key="index">{{item}}</span>'+
        '		</div>'+
        '	<div>'
})


function buildFormData(formData, data, parentKey) {
    if (data && data instanceof Array && !(data instanceof Date) && !(data instanceof File)) {
        for (var key1 in data) {
            buildFormData(formData, data[key1], parentKey ? parentKey + "[" + key1 + "]" : key1);
        }
    } else if (data && data instanceof Object && !(data instanceof Date) && !(data instanceof File)) {
        for (var key2 in data) {
            buildFormData(formData, data[key2], parentKey ? parentKey + "." + key2 : key2);
        }
    } else {
        const value = data == null ? '' : data;

        formData.append(parentKey, value);
    }
}