/**
 * 自定义管理
 */

var PAGE_NAME = "controlTemplateIndex";
$i18n.initDefault(PAGE_NAME);
var $i = $i18n.obj;

var vue = new Vue({
    el: "#app",
    i18n: $i18n.obj,
    created: function () {

    },
    mounted: function () {
        this.initData();
    },
    computed: {},
    data: {
        page: {
            pageNum: 1,
            pageSize: 17,
            count: 0,
            search: ""
        },
        templateList: [],

        showAddTemplate: false,
        templateName: "",
        searchDebounce: null,
        importLoading: false, //导入加载

        showPublish: false,
        activeTab: "first",
        placeData: [],
        placeId: [],
        treeProps: {
            children: "children",
            label: "name"
        },
        templateId: "",

        editTemplate: false
    },
    methods: {
        initData: function () {
            var _this = this;
            this.searchDebounce = this.$global.debounce(function () {
                _this.getTemplateLibrary()
            }, 600)
            this.getTemplateLibrary();
            //初始化超级管理员权限
            this.$global.hasSuperPermission()
                .then(function(rs) {
                    _this.editTemplate = rs;
                    if (!_this.editTemplate) _this.getPlaceData();
                })
        },
        dblclickUpdate: function (item) {
            var id = item.id;
            if (!this.editTemplate) {
                this.templateId = id;
                this.getAssignedPlace();
                return;
            }
            // console.log(item);
            window.location.href = this.$global.fullServerUrl('/admin/control/template?templateId=' + id);
        },
        confirmAddTemplate: function () {
            if (!(this.templateName.replace(/^\s*|\s*$/g, ''))) return this.$global.showError($i.t("form[0]"));
            this.saveLocalStorage();
            window.location.href = this.$global.fullServerUrl('/admin/control/template');
        },
        addTemplate: function () {
            this.showAddTemplate = true;
            this.$nextTick(function () {
                var node = this.$refs.addInput;
                node.focus();
            })
        },
        showDeleteConfirm: function (item) {
            var _this = this;
            this.$yconfirm({
                message: $i.t('ctiml1'),
                confirmText: $i.t('confirm'),
                visible: false,
                withCancel: false,
                cancelText: $i.t('cancel')
            }).then(function () {
                console.log(item.id);
                _this.deleteTemplate(item.id)
            }).catch(function () {})
        },

        /**
         * 将数据保存在localStorage
         * @param {*} data 需要存在localStorage的对象数据
         */
        saveLocalStorage: function (data) {
            var result = {
                page: this.page,
                name: this.templateName
            }
            if (data) {
                for (var key in data) {
                    result[key] = data[key];
                }
            }
            localStorage.setItem("controlIndex", JSON.stringify(result));
        },





        pageChange: function (val) {
            this.page.pageNum = val;
            this.getTemplateLibrary();
            this.saveLocalStorage();
        },
        getTemplateLibrary: function () {
            // /screenManager/api/control-template/template/library
            var url = "/api/control-template/template/library",
                data = this.page,
                _this = this;
            var config = {}
            this.$http.get(url, data, config).then(function (res) {
                _this.templateList = res.data.data;
                _this.page.count = res.data.count;
            }).catch(function (err) {})
        },
        deleteTemplate: function (id) {
            // /screenManager/api/control-template/templates
            var url = "/api/control-template/templates",
                _this = this;

            this.$http.delete(url, {
                ids: id
            }).then(function () {
                _this.$global.showSuccess($i.t('toast[2]'));
                _this.page.pageNum = 1;
                _this.getTemplateLibrary();
            }).catch(function () {});
        },


       /******************************导入****************************************************/
		handleImportSuccess: function (response, file, fileList) {
			this.importLoading = false;
			if (response.code != 200) {
				this.$global.showError(response.msg);
				return;
			}

			this.$global.showSuccess($i.t('ctijs1'));
			this.pageChange(1);

		},
		handleImportError: function () {
			this.importLoading = false;
			this.$global.showError($i.t('ctijs2'));
		},
		handleBeforeImport: function () {
			this.importLoading = true;
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
        /**
         * 选择要分配的地点
         * @param {*} data 
         * @param {*} node 
         */
        handlePlaceCheck: function (data, node) {
            this.placeId = node.checkedKeys
        },
        /**
         * 确认分配地点
         */
        confirmPublish: function () {
            var ids = this.placeId.join(","),
                _this = this,
                url = "/api/control-template/template/places";
            var data = {
                templateId: this.templateId,
                placeIds: ids
            }
            var config = null;

            this.$http.put(url, data, config).then(function () {
                _this.$global.showSuccess($i.t("ctijs3"));
                _this.showPublish = false;
            }).catch(function () {})
        },
        /**
         * 获取当前模板已分配地点列表
         */
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
                _this.showPublish = true;
            })
        },

    },
    watch: {
        "page.search": function (val) {
            this.searchDebounce();
        },
    },
    filters: {

    }
})