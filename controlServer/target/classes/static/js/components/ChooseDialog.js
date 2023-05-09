var ChooseDialog = Vue.extend({
    name: "ChooseDialog",
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        visiable: {
            type: Boolean,
            default: false,
        },
        placeData: {                                // 部门数据
            type: Array,
            default: []
        },
        form: {                                     // 表单数据，将选择的数据赋予它，或用它的数据来初始化激活选中状态（废弃）
            type: Object,
            default: {}
        },
        type: {                                     // 那类型的弹框
            type: String,
            default: "",
        },
        complete: {
            type: Function,
            default: null,
        },
        depList: {                                  // 初始化，选中的 `部门对象` 集合（新增）
            type: Array,
            default: []
        },
        userList: {                                // 初始化，选中的 `用户对象` 集合（新增）
            type: Array,
            default: []
        }
    },
    data: function () {
        return {
            _config: _config,
            defaultProps: {
                children: 'children',
                label: 'name'
            },
 
            depDialog: {                            // 管理部门弹框
                visiable: false,
                checkList: [],
                checkIds: [],
            },
            depAllChecked: false,
            userAllChecked: false,
 
            userDialog: {
                visiable: false,
                data: [],
                checkList: [],
                checkIds: [],
                fullName: " "
            },
            userData: [],
            defaultExpandedKeys: [],                 // 默认展开节点的keys集合
        }
    },
    created: function () {
        this.initHandler(this.visiable);
    },
    methods: {
        // region # 部门下的全选按钮
        getCheckedNodes: function () {                                  // 复选框状态改变：管理部门，点击时获取的选中的节点
            console.log(this.$refs.depTree.getCheckedNodes());
            var checkList = this.$refs.depTree.getCheckedNodes();
 
            // 过滤地点：精准打击
            this.depDialog.checkList = checkList.filter(function (item) {
                return item.isLeaf;
            })
            this.depDialog.checkIds = this.depDialog.checkList.map(function (item) {
                return item.id;
            })
        },
        allCheckHandler: function () {
            var ids = [];
            if (this.depAllChecked) {
                ids = this.placeData.map(function (item) {
                    return item.id
                })
            }
            this.$refs.depTree.setCheckedKeys(ids);
            this.getCheckedNodes();
        },
        // endregion
 
        // region # 选择部门或人员的弹框
        getUserListsByDepId: function (data) {                     // 根据部门ID获取用户列表 接口
            this.userDialog.visiable = true;
            // console.log(data);
            var depId = data.id;
            // TODO 通过id，递归获取旗下的所有id的集合
            var depIds = [];
            this.loopFlatId(data, depIds);
            // console.log(depIds);
            // TODO 通过id，递归获取完整名称
            var fullName = this.loopDepName(this.placeData, depId, " > ");
            this.userDialog.fullName = fullName;
            var _this = this;
            ajax.handle("get", "api/user/byDepIds/" + depIds, {}, null, function (json) {
                console.log(json);
                var data = json.data;
                // 请求完，对已有的数据进行比对。来重新初始化状态
                // 复用引用对象，如果存在了，就替换。方便后续的联动
                var checkList = _this.userDialog.checkList || [];
                data.forEach(function (item, index) {
                    item.isChecked = false;
                    for (var i = 0; i < checkList.length; i++) {
                        if (checkList[i].id === item.id) {
                            data[index] = checkList[i];
                            data[index].isChecked = true;
                            break;
                        }
                    }
                })
                _this.userData = data;
            })
        },
        userChangeHandler: function (record) {
            // console.log(record.isChecked, arguments);
            // 选中了传入对象进来，没有选中则是传入false，先不管重复了
            var isChecked = record.isChecked;
            if (isChecked) {
                this.userDialog.checkList.push(record);
            } else {
                var index = "";
                for (var i = 0; i < this.userDialog.checkList.length; i++) {
                    if (this.userDialog.checkList[i].id === record.id) {
                        index = i;
                        break;
                    }
                }
                // TODO 避免默认清除了所有数据，只有查询到索引时在删除
                if (index === "") {
                    return;
                } else {
                    this.userDialog.checkList.splice(index, 1);
                }
            }
 
            // 每次点击都遍历是否为全选状态
 
        },
        userAllCheckHandler: function (val) {
            // val ? true 遍历
            if(val) {
                var temp = [];
                this.userData.forEach(function(item, index) {
                    item.isChecked = true;
                    temp.push(item);
                })
                this.userDialog.checkList = temp;
            }else {
                this.userData.forEach(function(item, index) {
                    item.isChecked = false;
                })
                this.userDialog.checkList = [];
            }
        },
        deleteUserHandler: function (index) {
            this.userDialog.checkList[index].isChecked = false;
            // 不会触发 @change 事件，手动移除元素。
            this.userDialog.checkList.splice(index, 1);
        },
 
 
        initHandler: function (isVisiable) {
            /**
             * 思考要不每次都要初始化一个空数组，预防用了旧数据。感觉不可能，组件是独立的
             */
            this.depDialog.visiable = isVisiable;
            this.userDialog.visiable = false;
 
            // 初始化状态
            // 部门
            if(this.depList && this.depList.length !== 0) {
                // TODO 激活渲染已选择的记录和激活状态
                this.depDialog.checkList = JSON.parse(JSON.stringify(this.depList));
                this.depDialog.checkIds = this.depDialog.checkList.map(function (item) {
                    return item.id;
                })
                // TODO 激活tree组件的勾选状态，根据选中的id集合
                var initList = this.depList.map(function (item) {
                    return item.id;
                })
                this.$nextTick(function () {
                    this.defaultExpandedKeys = initList;
                    this.$refs.depTree && this.$refs.depTree.setCheckedKeys(initList);
                })
            }
 
            // ---
 
            // 用户
            if(this.userList && this.userList.length !== 0) {
                this.userDialog.checkList = JSON.parse(JSON.stringify(this.userList));
            }
        },
        initConfirm: function () {
            // 选中的部门对象集合，筛选过滤掉用户没有勾上的部门（右侧）
            var _this = this;
            var depList = this.depDialog.checkList.filter(function (item) {
                if (_this.depDialog.checkIds.indexOf(item.id) !== -1) {
                    return item;
                }
            })
            // 选中的用户对象集合
            var userList = this.userDialog.checkList;
            this.$emit("update:depList", depList);
            this.$emit("update:userList", userList);
 
            // region # monkey patch 可通过传递一个 complete 回调函数来接受数据（另一种接受数据的方式）
            // 分配工单
            if (this.complete) {
                this.complete({
                    userList: userList, depList: depList
                });
            } else {
                this.$emit("update:visiable", false);
            }
            // endregion
        },
 
        
        clearHandler: function () {                  // 清除按钮，清除也分情况，类似逻辑。唉，哎好像不用，无差别清除算了
            this.userDialog.checkList = [];
            this.depDialog.checkList = [];
            this.depDialog.checkIds = [];
            this.userData.forEach(function(item, index) {
                item.isChecked = false;
            })
            this.userAllChecked = false;
            this.$refs.depTree.setCheckedKeys([]);
        },
        changeActiveNode: function (data, node, tree) {
            // 单选的处理逻辑
            if (this.typeUI.singleChoose) {
                // 判断是否是部门，是选择起来。
                if (data.isLeaf) {
                    this.depDialog.checkList = [data];
                    this.depDialog.checkIds = [data.id];
                }
            }
        },
        // endregion
 
 
        // utils
        /**
         * 树结构，递归获取名称，根据ID
         * @param {Array} treeData
         * @param {Number} id
         * @return {String} 字符串
         */
        loopDepName: function(treeData, id, joinStr) {
            var str = "";
            var joinStr = joinStr || ",";
            for(var i = 0; i < treeData.length; i++) {
                var item = treeData[i];
                // 是
                if(item.id === id) {
                    return item.name;
                }
                if(item.children) {
                    str = item.name + joinStr + this.loopDepName(item.children, id, joinStr);
                    if(str === item.name + joinStr) {
                        str = ""
                    }else {
                        return str;
                    }
                }
            }
            return str;
        },
        /**
         * 树结构，递归扁平化收集id集合，传入树数据和接受数据标识符
         * @param {*} data 
         * @param {*} result 
         */
        loopFlatId: function(data, result) {
            var id = data.id || "";
            var children = data.children || [];
 
            result.push(id);
 
            if (children.length) {
                var _this = this;
                children.forEach(function (item) {
                    _this.loopFlatId(item, result);
                })
            }
        },
    },
    i18n: {
		locale: $i18n.obj.locale,
		messages: {
			"zh-CN": {
				cancel: "取消",
				confirm: "确定",
                back: "返回",
                allSelect: "全选",
                complete: "完成",
                clean: "清除",
                text: {
                    h1: "请选择",
                },
			},
			"en-US": {
                cancel: "Cancel",
                confirm: "OK",
                back: "return",
                allSelect: "Select All",
                complete: "Complete",
                clean: "Clear",
                text: {
                    h1: "Please select",
                },
            },
		},
	},
    watch: {
        "visiable": {
            handler: function (val) {
                window._choose = this;
                // console.log(this.type, this.typeUI);
                // console.log("%cChooseDialog 状态：", "color: blue;", val);
 
                // TODO: 由visiable而引起的显示，初始化一些基本状态。
                if (val) {
                    this.initHandler(true);
                }else {
                    this.depDialog.checkList = []
                    this.depDialog.checkIds = []
                    this.userDialog.checkList = []
                    this.userDialog.checkIds = []
                    this.$nextTick(function () {
                        if(this.$refs.depTree) {
                            this.$refs.depTree.setCheckedKeys([]);
                            var nodesMap = this.$refs.depTree.store.nodesMap;
                            for (let key in nodesMap) {
                                nodesMap[key].expanded = false;
                            }
                        }
                    })
                }
                this.depDialog.visiable = val;
                this.depAllChecked = false;
                this.userAllChecked = false;
            },
        },
        "depDialog.visiable": function (val) {
            this.$emit("update:visiable", val);
        }
    },
    computed: {
        typeUI: function () {                // 根据使用类型，来隐藏一些页面
            var type = this.type;
            var controller = {
                showCheckbox: false,
                showRen: true,
            }
 
            if (type === "permission") {     // 谁可以发起
                controller = {
                    showCheckbox: true,
                    showRen: true,
                }
            }
            if (type === "area") {          // 选择部门区域，单选的
                controller = {
                    showCheckbox: false,
                    showRen: false,
                    singleChoose: true
                }
            }
            if (type === "manageDep") {     // 管理部门
                controller = {
                    showCheckbox: true,
                    showRen: false,
                }
            }
            if (type === "manager") {       // 负责人
                controller = {
                    showCheckbox: false,
                    showRen: true,
                }
            }
            if (type === "initCc") {       // 抄送人
                controller = {
                    showCheckbox: false,
                    showRen: true,
                }
            }
            if (type === "cubicleApproveStrategy") {       // 审批人
                controller = {
                    showCheckbox: true,
                    showRen: true,
                }
            }
            if (type === "assign") {                       // 分配工单
                controller = {
                    showCheckbox: true,
                    showRen: true,
                }
            }
            if (type === "assignDep") {                       // 分配工单
                controller = {
                    showCheckbox: false,
                    showRen: true,
                }
            }
            return controller
        }
    },
   template: 
   '<el-dialog :visible.sync="depDialog.visiable"'+
'        title=""'+
'        class="flex-center"'+
'        custom-class="kb-dialog"'+
'        :show-close="false"'+
'        :lock-scroll="true"'+
'        :close-on-click-modal="false"'+
'    >'+
'        <div class="dep-wrapper" v-loading="loading">'+
'            <!-- 标题 -->'+
'            <div class="dep-head-wrapper flex-center">'+
'                <span class="font-18 color-bbb font-italic">{{$t("text.h1")}}</span>'+
'                <i @click="depDialog.visiable = false" class="iconfont iconOAkaoqin-quxiao-1 mr-15"></i>'+
'            </div>'+
'            <!-- 内容区 -->'+
'            <div class="dep-content-wrapper flex-center">'+
'                <div v-show="!userDialog.visiable" class="depBox-left mr-30">'+
'                    <el-scrollbar style="height: calc(100% - 56px)">'+
'                        <el-tree'+
'                            ref="depTree"'+
'                            :data="placeData"'+
'                            :show-checkbox="typeUI.showCheckbox"'+
'                            node-key="id"'+
'                            :props="defaultProps"'+
'                            @check="getCheckedNodes"'+
'                            @node-click="changeActiveNode"'+
'                            :expand-on-click-node="true"'+
'                            class="depTree"'+
'                            :default-expanded-keys="defaultExpandedKeys"'+
'                        >'+
'                            <span class="custom-tree-node" slot-scope="{ node, data }"'+
'                                :style="data.isLeaf ? \'color: #999\' : \'color: #333\' "'+
'                            >'+
'                                <span>{{ node.label }}</span>'+
'                                <!-- 叶子，即为部门。可点击来添加人员 -->'+
'                                <template v-if="typeUI.showRen">'+
'                                    <span v-if="data.isLeaf" @click="getUserListsByDepId(data)">'+
'                                        <i class="iconfont iconsum-copy mr-5"></i>人员'+
'                                    </span>'+
'                                </template>'+
'                                <!-- 叶子，即为部门。不可点击只是仅代表它是部门，可供选择, 改为用color来区分 -->'+
'                                <!--'+
'                                <template v-else>'+
'                                    <span v-if="data.isLeaf">'+
'                                        <i class="iconfont iconsum-copy mr-5"></i>'+
'                                    </span>'+
'                                </template> -->'+
'                            </span>'+
'                        </el-tree>'+
'                    </el-scrollbar>'+
'                    <div v-if="typeUI.showCheckbox" class="detpBox-left_btn-wrapper flex-start-center ml-20 mr-20">'+
'                        <el-checkbox @change="allCheckHandler" v-model="depAllChecked">{{$t("allSelect")}}</el-checkbox>'+
'                    </div>'+
'                </div>'+
'                <!-- 切换到用户选择 -->'+
'                <div v-show="userDialog.visiable" class="depBox-left mr-30">'+
'                    <div v-show="userDialog.visiable" class="person-wrapper">'+
'                        <div class="person-dep">'+
'                            <span :title="userDialog.fullName">{{ userDialog.fullName }}</span>'+
'                            <el-button @click="userDialog.visiable = false" type="text">{{$t("back")}}</el-button>'+
'                        </div>'+
'                        <div class="person-list">'+
'                            <el-scrollbar style="height: 100%">'+
'                                <div class="dexBox-right_wrapper">'+
'                                    <el-checkbox v-for="item in userData" class="dexBox-right_item" v-model="item.isChecked"'+
'                                        @change="userChangeHandler(item)">{{ item.nickname }}'+
'                                    </el-checkbox>'+
'                                </div>'+
'                            </el-scrollbar>'+
'                        </div>'+
'                        <div class="detpBox-left_btn-wrapper flex-start-center ml-20 mr-20">'+
'                            <el-checkbox @change="userAllCheckHandler" v-model="userAllChecked">{{$t("allSelect")}}</el-checkbox>'+
'                        </div>'+
'                    </div>'+
'                </div>'+
'                <!-- 右边显示内容框 -->'+
'                <div class="depBox-right">'+
'                    <el-scrollbar style="height: 100%">'+
'                        <el-checkbox-group class="dexBox-right_wrapper" v-model="depDialog.checkIds">'+
'                            <el-checkbox v-for="item in depDialog.checkList" class="dexBox-right_item" :label="item.id">{{ item.name }}</el-checkbox>'+
'                        </el-checkbox-group>'+
'                        <!-- 用户 -->'+
'                        <div class="depUser-wrapper">'+
'                            <div class="depUser-item" v-for="(item, index) in userDialog.checkList">'+
'                                <img class="depUser-item_img" :src="item.avatar ? item.avatar : \'\'" alt="">'+
'                                <span class="depUser-item_title">{{ item.nickname }}</span>'+
'                                <i @click="deleteUserHandler(index)" class="el-icon-circle-close"></i>'+
'                            </div>'+
'                        </div>'+
'                    </el-scrollbar>'+
'                </div>'+
'            </div>'+
'            <!-- 按钮区 -->'+
'            <div class="dep-btn-wrapper flex-center">'+
'                <el-button v-if="false" @click="clearHandler" type="text" class="flex-center mr-10 bg-fff color-999">{{$t("clean")}}</el-button>'+
'                <el-button @click="depDialog.visiable = false" type="text" class="flex-center mr-10 bg-fff color-999">{{$t("cancel")}}</el-button>'+
'                <el-button @click="initConfirm" type="text" class="flex-center mr-10 bg-fff color-999">{{$t("complete")}}</el-button>'+
'            </div>'+
'        </div>'+
'    </el-dialog>'
})
Vue.prototype.$chooseDialog = function (options) {
    var options = options || {};
    return new Promise(function (resolve, reject) {
        var instance = new ChooseDialog({
            propsData: {
                visiable: true,
                placeData: options.placeData,
                form: options.form,
                type: options.type,
                userList: options.record.cc
            }
        }).$mount();
        instance.$watch(
			function() {
				return $i18n.obj.locale;
			},
			function (val) {
				instants.$i18n.locale = val;
			}
		);
        instance.$on("update:visiable", function (val) {
            instance.depDialog.visiable = val;
        })
        instance.$on("update:userList", function (val) {
            options.record.cc = val;
        })
        instance && document.body.appendChild(instance.$el);
    })
}
Vue.component("ChooseDialog", ChooseDialog);