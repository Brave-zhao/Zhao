
var records = {
    "place": [
        {
            "tenant_id": "000004",
            "create_time": 1617698609000,
            "is_open": null,
            "pid": 0,
            "priority": 0,
            "type": 0,
            "update_time": 1622692018000,
            "deleted": 0,
            "stream": "",
            "name": "腾尔教育学院",
            "id": 179,
            "status": 1
        },
        {
            "tenant_id": "000004",
            "create_time": 1617698623000,
            "is_open": null,
            "pid": 179,
            "priority": 0,
            "type": 0,
            "update_time": 1617698631000,
            "deleted": 0,
            "stream": null,
            "name": "一楼",
            "id": 180,
            "status": 1,
            "disabled": true
        },
        {
            "tenant_id": "000004",
            "create_time": 1617698664000,
            "is_open": null,
            "pid": 180,
            "priority": 0,
            "type": 2,
            "update_time": 1625997267000,
            "deleted": 0,
            "stream": "https://sample-videos.com/video123/flv/720/big_buck_bunny_720p_1mb.flv",
            "name": "2楼201",
            "id": 181,
            "status": 1,
            "disabled": true
        },
        {
            "tenant_id": "000004",
            "create_time": 1617698677000,
            "is_open": null,
            "pid": 180,
            "priority": 0,
            "type": 2,
            "update_time": 1625997275000,
            "deleted": 0,
            "stream": "rtmp://139.9.50.173/live/cam",
            "name": "快捷教室",
            "id": 182,
            "status": 1
        },
        {
            "tenant_id": "000004",
            "create_time": 1621677691000,
            "is_open": null,
            "pid": 180,
            "priority": 0,
            "type": 0,
            "update_time": 1621677691000,
            "deleted": 0,
            "stream": null,
            "name": "大厅",
            "id": 194,
            "status": 1
        },
        {
            "tenant_id": "000004",
            "create_time": 1625969947000,
            "is_open": null,
            "pid": 0,
            "priority": 0,
            "type": 0,
            "update_time": 1625969947000,
            "deleted": 0,
            "stream": "",
            "name": "演示厅",
            "id": 199,
            "status": 1
        },
        {
            "tenant_id": "000004",
            "create_time": 1625969958000,
            "is_open": null,
            "pid": 199,
            "priority": 0,
            "type": 2,
            "update_time": 1625997474000,
            "deleted": 0,
            "stream": "https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv",
            "name": "北京演示屏",
            "id": 200,
            "status": 1
        },
        {
            "tenant_id": "000004",
            "create_time": 1625970184000,
            "is_open": null,
            "pid": 199,
            "priority": 0,
            "type": 2,
            "update_time": 1625976170000,
            "deleted": 0,
            "stream": "https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv",
            "name": "广州演示屏",
            "id": 201,
            "status": 1
        },
        {
            "tenant_id": "000004",
            "create_time": 1625975739000,
            "is_open": null,
            "pid": 199,
            "priority": 0,
            "type": 2,
            "update_time": 1625975739000,
            "deleted": 0,
            "stream": null,
            "name": "河南演示屏",
            "id": 202,
            "status": 1
        },
        {
            "tenant_id": "000004",
            "create_time": 1625975755000,
            "is_open": null,
            "pid": 199,
            "priority": 0,
            "type": 2,
            "update_time": 1625975755000,
            "deleted": 0,
            "stream": null,
            "name": "河北演示屏",
            "id": 203,
            "status": 1
        }
    ]
}

Vue.component("w-tree-filter", {
    name: "w-tree-filter",
    props: {
        value: {
            type: Array,
            default: []
        },
        activeNodeKey: {
            type: [Number, String],
            default: ""
        },
        isTable: {
            type: Boolean,
            default: false
        }
    },
    i18n: { // `i18n` 选项，为组件设置语言环境信息
        messages: {
            'zh-CN': { allText: "全部", p1: "搜索相关内容" },
            'en-US': { allText: "All", p1: "Search related content" }
        }
    },
    data: function() {
        return {
            placeData: [],
            defaultProps: {
              children: 'children',
              label: 'name'
            },
            
            // 搜索过滤节点
            filterText: "",
            
            // 默认选中的节点，需要展开选中的节点所在的父节点
            defaultExpandedKeys: [],
            currentNodeKey: null,

            checkPlace: "",
        }
    },
    created: function() {
        this.placeData = this.value;
    },
    methods: {
        isNull: function(rs) {
            return rs === "" || rs === null || rs === undefined;
        },
        handleNodeClick: function(data) {
                console.log(data);
            },
        filterNode: function(value, data) {
            if(!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        changeActiveNode: function(data, node, tree) {                  // 节点被点击时触发，整合一下所有的节点ID集合
            // 扁平化 -> 收集id集合
            var ids = [];
            // this._flatHandler(data, ids);

            this.$emit("update:activeNodeKey", data.id);

            this.checkPlace = data;
        },
        _flatHandler: function(data, result) {
            /**
             * push 1
             * 循环调用 children  _flatHandler 
             * 
             */
            var id = data.id || "";
            var children = data.children || [];

            result.push(id);

            if (children.length) {
                var _this = this;
                children.forEach(function (item) {
                    _this._flatHandler(item, result);
                })
            }
        },
        cancelHandler: function() {
            this.$refs.tree.setCurrentKey(null);
            this.$emit("update:activeNodeKey", "")

            this.checkPlace = ""
            this.$refs.popoverRef.doClose();
        }
    },
    watch: {
        filterText: function(val) {
            this.$refs.tree.filter(val)
        },
        value: function(val) {
            this.placeData = val;
        }
    },
    template: 

    '    <el-popover'+
    '        ref="popoverRef"'+
    '        placement="top-start"'+
    '        title=""'+
    '        trigger="click"'+
    '        popper-class="tree-popper"'+
    '        :visible-arrow="false"'+
    '    >   '+
    '        <span v-if="isTable" slot="reference" style="cursor: pointer;">'+
    '            <slot name="default"></slot>'+
    '            <i class="el-icon-caret-bottom"></i>'+
    '        </span>'+
    '        <div v-else class="x-diDian-wrapper" slot="reference">'+
    '            <input :value="checkPlace.name" readonly :placeholder="$t(\'allText\')" />'+
    '            <i class="el-icon-arrow-down"></i>'+
    '        </div>'+
    '        <div class="tree-wrapper">'+
    '            <!-- 搜索框 -->'+
    '            <div v-if="false" class="search-item">'+
    '                <input class="input" type="text" placeholder="$t(\'p1\')" '+
    '                    v-model="filterText"'+
    '                />'+
    '                <i class="iconfont iconOAkaoqin-sousuo-"></i>'+
    '            </div>'+
    '            <!-- 按钮组 -->'+
    '            <div v-if="placeData && placeData.length" class="btn-group-item">'+
    '                <el-button type="text" @click="cancelHandler">{{$t("allText")}}</el-button>'+
    '            </div>'+
    '            <!-- 内容区 -->'+
    '            <div class="t-content-item">'+
    '                <el-scrollbar style="height: 280px;">'+
    '                    <el-tree :data="placeData" :props="defaultProps"'+
    '                        :filter-node-method="filterNode"'+
    '                        ref="tree"'+
    '                        :highlight-current="true"'+
    '                        node-key="id"'+
    '                        :default-expanded-keys="defaultExpandedKeys"'+
    '                        :current-node-key="currentNodeKey"'+
    '                        @node-click="changeActiveNode"'+
    '                    ></el-tree>'+
    '                </el-scrollbar>'+
    '            </div>'+
    '            '+
    '            '+
    '            '+
    '        </div>'+
    '    </el-popover>'

})