/**
 * 后台管理通用组件整合
 */
 var $i = typeof $i18n == 'undefined' ? {} : $i18n.obj;
 var $i18nT = function (key, value, type) {
	 var t = type ? type : 't';
	 return value != undefined ? $i[t](key, value) : $i[t](key)
 }
 var $VI18n = function(str, key, value, type) {
	 key = 'commonComponent.' + key;
	 var t = type ? type : 't';
	 var isCommon =  typeof $i != 'undefined';
	 // 如果没有传递的键值对 i18n会返回传入的值 如果值等于传递的值 则返回中文
	 if($i[t] && isCommon) return ($i18nT(key, value, type) == key) ? str : $i18nT(key, value, type);
	 return str;
 }

 /**
 * 确认框组件,基础组件是element-ui的el-dialog
 */
  var trConfirmDialog = Vue.extend({
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		width: {
			type: String,
			default: "500px"
		},
		message: {
			type: String,
			default: ""
		},
		iconClass: {
			type: String,
			default: "tr-confirm--dialog__icon"
		},
		resolve: {                 //promise resolve函数
			type: Function
		},
		reject: {                 //Promise reject函数
			type: Function
		},
		confirmText: {           //确认按钮文本
			type: String,
			default: "确定"
		},
		cancelText: {            //取消按钮文本
			type: String,
			default: "取消"
		},
	},
	mounted: function() {
		this.initData();
	},
	data: function() {
		return {
			show: false,
		}
	},
	methods: {
		initData: function() {
//			console.log("visible:", this.visible);
			this.show = this.visible;
		},
		cancel: function() {              //点击取消
			this.$emit("cancel");
			this.show = false;
			if(this.reject) {
				this.reject();
			}
		},
		confirm: function() {               //点击确认
			this.$emit("confirm");
			this.show = false;
			if(this.resolve) {
				this.resolve();
			}
		}
		
	},
	watch: {
		show: function(val) {
			this.$emit("update:visible", val);
		},
		visible: function(val) {
			this.show = val;
		}
	},
	computed: {
		confirmTextI18n: function() {
			return this.confirmText == '确定' ? $VI18n('确定','confirm') : this.confirmText;
		},
		cancelTextI18n: function() {
			return this.cancelText == '取消' ? $VI18n('取消','cancel') : this.cancelText;
		},
	},
	template: 
		'		<el-dialog '+
		'				class="tr-confirm--dialog"'+
		'				:visible.sync="show"'+
		'				:width="width"'+
		'				>'+
		'				<div class="tr-confirm--dialog__body">'+
		'					<div :class="iconClass"></div>'+
		'					<div class="tr-confirm--dialog__title" v-html="message"></div>'+
		'				</div>'+
		'				<div class="tr-confirm--dialog__footer">'+
		'					<button class="tr-confirm--dialog__button" @click="cancel">{{cancelTextI18n}}</button>'+
		'					<button class="tr-confirm--dialog__button tr-confirm--dialog__button-success" @click="confirm">{{confirmTextI18n}}</button>'+
		'				</div>'+
		'			</el-dialog>'
})

Vue.component("confirm-dialog", trConfirmDialog);


/**
 * 提供promise调用方式
 * @param {*} options 
 */
Vue.prototype.$yconfirm = function(options) {
	options = options || {};
	var promise = new Promise(function(resolve, reject) {
		var instants = new trConfirmDialog({
			propsData: {
				resolve: resolve,
				reject: reject,
				width: options.width,
				iconClass: options.iconClass,
				message: options.message,
				visible: true,
				confirmText: options.confirmText,
				cancelText: options.cancelText
			}
		}).$mount();
		if(instants) {
			document.body.appendChild(instants.$el);
		}
	})
	return promise;
}


/**
  *表格筛选，表头下拉筛选组件，使用element-ui的Dropdown下拉菜单
  */
  Vue.component("table-filter", {
    props: {
        value: {
            type: String | Number
        },
        data: {
            type: Array,
            default: function() {
                return [];
            }
        },
        props: {                     //配置，label配置显示的选项名称，value配置选项值
            type: Object
        },
        trigger: {               //触发方式,hover,click
            type: String,
            default: "click"
        },
        appendAll: {                  //是否添加全部选项，如果true则在下拉选项最前面添加全部选项
            type: Boolean,
            default: true
        },
        labelHighLight: {              //是否当有选择筛选条件时，标题高亮显示
            type: Boolean,
            default: true
        },
        placement: {               //弹窗弹出的位置
            type: String,
            default: "bottom"
        }
    },
    data: function() {
        return {
            dropdownVisible: false,       //下拉菜单是否已经显示
        }
    },
    computed: {
        labelKey: function() {
            if(this.props && this.props.label) {
                return this.props.label;
            }
            return "label";
        },
        valueKey: function() {
            if(this.props && this.props.value) {
                return this.props.value;
            }
            return "value";
        },
        options: function() {              //下拉选项
            var data = this.copyObject(this.data);
            if(this.appendAll) {
                var allOption = {};
                allOption[this.labelKey] = $VI18n("全部","all");
                allOption[this.valueKey] = null;
                data.unshift(allOption);
            }
            return data;
        },
        selected: {
            set: function(val) {
                this.$emit("input", val);
            },
            get: function() {
                return this.value;
            }
        },
    },
    created: function() {
    },
    mounted: function() {
        this.initData();
    },
    methods: {
        initData: function() {

        },
        handleCommand: function(command) {            //处理指令命令
            this.selected = command;
            this.$emit("change", command);
        },
        isItemActive: function(value) {                //判断是否激活
            return value == this.selected;
        },
        isLabelActive: function() {               //判断是否激活标题明亮
            if(!this.labelHighLight) {
                return false;
            }
            return this.selected != null;
        },
        handlevisibleChange: function(val) {
            this.dropdownVisible = val;
        },
        copyObject: function(obj) {
            try {
                return JSON.parse(JSON.stringify(obj));
            } catch (error) {
                return null;
            }
        }
    },
    watch: {
    },
    template: 
    '<div class="table-filter__container">'+
'				 <el-dropdown @command="handleCommand" @visible-change="handlevisibleChange" :trigger="trigger" class="table-filter__dropdown" :placement="placement">'+
'					 <div class="table-filter__wrapper">'+
'						 <div class="table-filter__label" :class="{\'active\': isLabelActive()}">'+
'							 <slot></slot>'+
'						 </div>'+
'						 <div class="table-fliter__icon" :class="{\'active\': dropdownVisible}">'+
'							 <i class="el-icon-caret-bottom"></i>'+
'						 </div>'+
'					 </div>'+
'					 <el-dropdown-menu slot="dropdown" class="table-filter__dropdown-menu">'+
'						 <el-dropdown-item :class="{\'active\': isItemActive(item[valueKey])}"'+
'							 v-for="item in options" '+
'							 :key="item[valueKey]" '+
'							 :command="item[valueKey]">'+
'							 {{item[labelKey]}}'+
'						 </el-dropdown-item>'+
'					 </el-dropdown-menu>'+
'				 </el-dropdown>'+
'			 </div>'
       //  `
       // 	 <div class="table-filter__container">
       // 		 <el-dropdown @command="handleCommand" @visible-change="handlevisibleChange" :trigger="trigger" class="table-filter__dropdown" :placement="placement">
       // 			 <div class="table-filter__wrapper">
       // 				 <div class="table-filter__label" :class="{'active': isLabelActive()}">
       // 					 <slot></slot>
       // 				 </div>
       // 				 <div class="table-fliter__icon" :class="{'active': dropdownVisible}">
       // 					 <i class="el-icon-caret-bottom"></i>
       // 				 </div>
       // 			 </div>
       // 			 <el-dropdown-menu slot="dropdown" class="table-filter__dropdown-menu">
       // 				 <el-dropdown-item :class="{'active': isItemActive(item[valueKey])}"
       // 					 v-for="item in options" 
       // 					 :key="item[valueKey]" 
       // 					 :command="item[valueKey]">
       // 					 {{item[labelKey]}}
       // 				 </el-dropdown-item>
       // 			 </el-dropdown-menu>
       // 		 </el-dropdown>
       // 	 </div>
       //  `
})

/**
  * 表头复选框勾选筛选
  */
 Vue.component("y-checkbox-filter", {
    props: {
        value: {
            type: Array,
            default: function() {
                return [];
            }
        },
        data: {
            type: Array,
            default: function() {
                return [];
            }
        },
        props: {                     //配置，label配置显示的选项名称，value配置选项值
            type: Object,
            default: function() {
                return {}
            }
        },
        trigger: {               //触发方式,hover,click
			type: String,
			default: "click"
		},
        labelHighLight: {              //是否当有选择筛选条件时，标题高亮显示
            type: Boolean,
            default: true
        },
        width: {                     //下拉框宽度
            type: String,
            default: "134px"
        },
        emptyText: {             //空白提示
            type: String,
            default: "暂无数据"
        },
        placement: {             //显示区域
            type: String,
            default: "bottom-start"
        }
    },
    data: function() {
        return {
            dropdownVisible: false,       //下拉菜单是否已经显示
            listData: [],                 //列表数据
            search: "",                  //搜索值
        }
    },
    computed: {
        labelKey: function() {
            return this.props.label || "label";
        },
        valueKey: function() {
            return this.props.value || "value";
        },
        checkedKey: function() {
            return "checked";
        },
        selected: {
            set: function(val) {
                this.$emit("input", val);
            },
            get: function() {
                return this.value;
            }
        },
        searchDebounce: function() {         //搜索防抖
            return this.$global.debounce(this.searchList, 400);
        },
        emptyTextI18n: function() {
            return this.emptyText == '暂无数据' ? $VI18n('暂无数据','noData') : this.emptyText;
        },
    },
    created: function() {
    },
    mounted: function() {
        this.initData();
    },
    methods: {
        initData: function() {
            this.initListData();
        },
        initListData: function() {
            var _this = this;
            this.data = this.data || [];
            var data = this.$global.copyObject(this.data).filter(function(el) {
                //根据搜索值过滤
                if(_this.$global.isNull(_this.search)) {
                    return true;
                }

                var label = el[_this.labelKey];
                if(_this.$global.isNull(label)) {
                    return false;
                }

                return label.indexOf(_this.search) != -1;
            }).map(function(el) {
                var value = el[_this.valueKey];
                var checked = _this.selected.indexOf(value) != -1;
                el[_this.checkedKey] = checked;
                return el;
            })

            this.listData = data;
        },
        isLabelActive: function() {               //判断是否激活标题明亮
            if(!this.labelHighLight) {
                return false;
            }
            return this.selected != null && this.selected.length > 0;
        },
        copyObject: function(obj) {
            try {
                return JSON.parse(JSON.stringify(obj));
            } catch (error) {
                return null;
            }
        },
        getLabel: function(record) {
            return record[this.labelKey] || $VI18n("暂无",'null[0]');
        },
        handlePopoverShow: function() {
            this.dropdownVisible = true;
        },
        handlePopoverHide: function() {
            this.dropdownVisible = false;
        },
        changeChecked: function(record, checked) {
            var data = this.getSelected();
            this.selected = data;
            var clone = this.$global.copyObject(data);
            this.$emit("change", clone, record[this.valueKey]);
            this.$emit("check", checked, record,  clone);
        },
        getSelected: function() {
            var _this = this;
            var data =  this.listData.filter(function(el) {
                return el[_this.checkedKey] == true;
            }).map(function(el) {
                return el[_this.valueKey];
            })
            return data;
        },
        checkAll: function(checked) {
            var data = this.getSelected();
            this.selected = data;
            var clone = this.$global.copyObject(data);
            this.$emit("change", clone);
            this.$emit("check-all", checked, clone);
        },
        searchList: function() {
            this.initListData();
            this.$emit("search", this.search);
        }
    },
    watch: {
        data: function(val) {
            this.initListData();
        },
        value: function(val) {
            this.initListData();
        },
        search: function(val) {
            this.searchDebounce();
        }
    },
    template: 
    '<div class="y-checkbox-filter">'+
'				 <el-popover'+
'					 popper-class="y-checkbox-filter__popover"'+
'					 :placement="placement"'+
'					 transition="el-zoom-in-top"'+
'					 @show="handlePopoverShow"'+
'					 @hide="handlePopoverHide"'+
'					 :trigger="trigger">'+
'					 <div class="y-checkbox-filter__wrapper" slot="reference">'+
'						 <div class="y-checkbox-filter__label" :class="{\'active\': isLabelActive()}">'+
'							 <slot></slot>'+
'						 </div>'+
'						 <div class="y-checkbox-filter__icon" :class="{\'active\': dropdownVisible}">'+
'							 <i class="el-icon-caret-bottom"></i>'+
'						 </div>'+
'					 </div >'+
' '+
'					 <div class="y-checkbox-filter__container" :style="{\'width\': width}">'+
'						 <div class="y-checkbox-filter__header">'+
'							 <div class="y-checkbox-filter__search">'+
'								 <input v-model="search" :placeholder="$VI18n(\'搜索\',\'search\')"/>'+
'							 </div>'+
'						 </div>'+
'						 <div class="y-checkbox-filter__body" v-if="listData.length > 0">'+
'							 <div class="y-checkbox-filter__row">'+
'								 <check-all-checkbox :checked-key="checkedKey" :data="listData" @check-all="checkAll">'+
'								 {{ $VI18n(\'全选\',\'allSelect\') }}'+
'								 </check-all-checkbox>'+
'							 </div>'+
'							 <el-scrollbar class="y-checkbox-filter__row--scroll">'+
'								 <div class="y-checkbox-filter__row" v-for="(record,index) in listData" :key="index">'+
'									 <div class="align-center">'+
'										 <el-checkbox v-model="record[checkedKey]" @change="changeChecked(record, $event)">'+
'											 <slot name="label">{{getLabel(record)}}</slot>'+
'										 </el-checkbox>'+
'									 </div>'+
'								 </div>'+
'							 </el-scrollbar>'+
'						 </div>'+
'						 <div class="y-checkbox-filter__tooltip" v-else>'+
'							 {{emptyTextI18n}}'+
'						 </div>'+
'					 </div>'+
'				 </el-popover>'+
'			 </div>'
       //  `
       // 	 <div class="y-checkbox-filter">
       // 		 <el-popover
       // 			 popper-class="y-checkbox-filter__popover"
       // 			 :placement="placement"
       // 			 transition="el-zoom-in-top"
       // 			 @show="handlePopoverShow"
       // 			 @hide="handlePopoverHide"
       // 			 :trigger="trigger">
       // 			 <div class="y-checkbox-filter__wrapper" slot="reference">
       // 				 <div class="y-checkbox-filter__label" :class="{'active': isLabelActive()}">
       // 					 <slot></slot>
       // 				 </div>
       // 				 <div class="y-checkbox-filter__icon" :class="{'active': dropdownVisible}">
       // 					 <i class="el-icon-caret-bottom"></i>
       // 				 </div>
       // 			 </div >

       // 			 <div class="y-checkbox-filter__container" :style="{'width': width}">
       // 				 <div class="y-checkbox-filter__header">
       // 					 <div class="y-checkbox-filter__search">
       // 						 <input v-model="search" :placeholder="$VI18n('搜索','search')"/>
       // 					 </div>
       // 				 </div>
       // 				 <div class="y-checkbox-filter__body" v-if="listData.length > 0">
       // 					 <div class="y-checkbox-filter__row">
       // 						 <check-all-checkbox :checked-key="checkedKey" :data="listData" @check-all="checkAll">
       // 						 {{ $VI18n('全选','allSelect') }}
       // 						 </check-all-checkbox>
       // 					 </div>
       // 					 <el-scrollbar class="y-checkbox-filter__row--scroll">
       // 						 <div class="y-checkbox-filter__row" v-for="(record,index) in listData" :key="index">
       // 							 <div class="align-center">
       // 								 <el-checkbox v-model="record[checkedKey]" @change="changeChecked(record, $event)">
       // 									 <slot name="label">{{getLabel(record)}}</slot>
       // 								 </el-checkbox>
       // 							 </div>
       // 						 </div>
       // 					 </el-scrollbar>
       // 				 </div>
       // 				 <div class="y-checkbox-filter__tooltip" v-else>
       // 					 {{emptyTextI18n}}
       // 				 </div>
       // 			 </div>
       // 		 </el-popover>
       // 	 </div>
       //  `
})



/**
  * 自定义模态框，基础组件是el-dialog
  */
 Vue.component("tr-dialog", {
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        width: {
            type: String,
            default: "500px"
        },
        title: {
            type: String,
            default: ""
        },
        bodyStyle: {
            type: Object
        },
        withCancel: {             //是否出现取消按钮
            type: Boolean,
            default: false
        },
        confirmText: {           //确认按钮文本
            type: String,
            default: "确定"
        },
        cancelText: {            //取消按钮文本
            type: String,
            default: "取消"
        },
        center: {
            type: Boolean,
            default: false
        },
        closeOnClickModal: {
            type: Boolean,
            default: true
        },
        modal: {
            type: Boolean,
            default: true
        },
        top: {
            type: String,
            default: "15vh"
        }
    },
    data: function() {
        return {
            show: false
        }
    },
    computed: {

    },
    created: function() {

    },
    mounted: function() {
        this.initData();
    },
    methods: {
        initData: function() {
            this.show = this.visible;
        },
        confirm: function() {
            this.$emit("confirm");
        },
        cancel: function() {
            this.$emit("cancel");
            this.show = false;
        },
        close: function() {
            this.$emit("close");
        },
        closed: function() {
            this.$emit("closed");
        },
        open: function() {
            this.$emit("open");
        },
        opened: function() {
            this.$emit("opened");
        },
    },
    watch: {
        show: function(val) {
            this.$emit("update:visible", val);
        },
        visible: function(val) {
            this.show = val;
        }
    },
    computed: {
        confirmTextI18n: function() {
            return this.confirmText == '确定' ? $VI18n('确定','confirm') : this.confirmText;
        },
        cancelTextI18n: function() {
            return this.cancelText == '取消' ? $VI18n('取消','cancel') : this.cancelText;
        },	
    },
    template: 
    '<el-dialog '+
'		 center'+
'		 :visible.sync="show"'+
'		 class="tr-dialog"'+
'		 :width="width"'+
'		 :top="top"'+
'		 @open="open"'+
'		 @close="close"'+
'		 @opened="opened"'+
'		 @closed="closed"'+
'		 :close-on-click-modal="closeOnClickModal"'+
'		 :modal="modal">'+
'		 <div slot="title" class="el-dialog__title">'+
'			 <slot name="title">{{title}}</slot>'+
'		 </div>'+
'		 <div class="tr-dialog__body" :class="{\'tr-dialog__body--center\': center}" :style="bodyStyle">'+
'			 <slot></slot>'+
'		 </div>'+
'		 <button class="tr-dialog__footer-btn" v-if="!withCancel" @click="confirm">'+
'			 {{confirmTextI18n}}'+
'		 </button>'+
' '+
'		 <div class="tr-dialog__footer-wrapper" v-else>'+
'			 <el-button size="small" @click="cancel">{{cancelTextI18n}}</el-button>'+
'			 <el-button type="primary" size="small" @click="confirm">{{confirmTextI18n}}</el-button>'+
'		 </div>'+
'	 </el-dialog>'
   //  `
   //  <el-dialog 
   // 	 center
   // 	 :visible.sync="show"
   // 	 class="tr-dialog"
   // 	 :width="width"
   // 	 :top="top"
   // 	 @open="open"
   // 	 @close="close"
   // 	 @opened="opened"
   // 	 @closed="closed"
   // 	 :close-on-click-modal="closeOnClickModal"
   // 	 :modal="modal">
   // 	 <div slot="title" class="el-dialog__title">
   // 		 <slot name="title">{{title}}</slot>
   // 	 </div>
   // 	 <div class="tr-dialog__body" :class="{'tr-dialog__body--center': center}" :style="bodyStyle">
   // 		 <slot></slot>
   // 	 </div>
   // 	 <button class="tr-dialog__footer-btn" v-if="!withCancel" @click="confirm">
   // 		 {{confirmTextI18n}}
   // 	 </button>

   // 	 <div class="tr-dialog__footer-wrapper" v-else>
   // 		 <el-button size="small" @click="cancel">{{cancelTextI18n}}</el-button>
   // 		 <el-button type="primary" size="small" @click="confirm">{{confirmTextI18n}}</el-button>
   // 	 </div>
   //  </el-dialog>
   //  `
})


/**
 * 抽屉组件，基础组件是el-drawer
 */
 Vue.component("tr-drawer", {
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ""
        },
        confirmText: {                 //确认按钮文本
            type: String,
            default: "完成"
        },
        cancelText: {                //取消按钮文本
            type: String,
            default: "取消"
        },
        modal: {                    //是否显示模态框
            type: Boolean,
            default: false
        },
        direction: {
            type: String,
            default: "rtl"
        },
        width: {
            type: String,
            default: "500px"
        },
        beforeClose: {                   //关闭前的回调，会暂停 Drawer 的关闭
            type: Function
        }

    },
    mounted: function() {
        this.initData();
    },
    data: function() {
        return {
            show: false,
        }
    },
    methods: {
        initData: function() {
//			console.log("visible:", this.visible);
            this.show = this.visible;
        },
        confirm: function() {
            //点击确认按钮
            this.$emit("confirm");
        },
        cancel: function() {
            console.log(this)
            this.closeDrawer();
            this.$emit("cancel");
        },
        handleClose: function() {
            this.$emit("close")
        },
        closeDrawer: function() {            //关闭抽屉
            if(this.beforeClose) {
                this.beforeClose(this.doCloseDrawer);  // 将关闭的执行权，交给回调函数
                return;
            }
            this.doCloseDrawer();
        },
        doCloseDrawer: function() {			// 修改显示状态
            this.show = false;
        }
        
    },
    computed: {
        confirmTextI18n: function() {
            return this.confirmText == '完成' ? $VI18n('完成','end') : this.confirmText;
        },
        cancelTextI18n: function() {
            return this.cancelText == '取消' ? $VI18n('取消','cancel') : this.cancelText;
        },	
    },
    watch: {
        show: function(val) {
            this.$emit("update:visible", val);
        },
        visible: function(val) {
            this.show = val;
        }

    },
    template: 
    ' <el-drawer'+
'				 class="custom-drawer"'+
'				 :visible.sync="show"'+
'				 :with-header="false"'+
'				 :wrapper-closable="false"'+
'				 :modal="modal"'+
'				 :size="width"'+
'				 :before-close="close"'+
'				 @close="handleClose">'+
'				 <div class="tr-drawer--container">'+
'					 <div class="tr-drawer--header">'+
'							 <div class="tr-drawer--header-part">'+
'								 <div class="tr-drawer__btn-close" @click="closeDrawer"><i class="el-icon-close"></i></div>'+
'								 <div class="tr-drawer--header__title">'+
'									 {{title}}'+
'								 </div>'+
'							 </div>'+
'							 <div>'+
'								 <slot name="btn"></slot>'+
'								 <el-button  class="ter-btn ter-btn--grey" @click="cancel">{{cancelTextI18n}}</el-button>'+
'								 <el-button class="ter-btn ter-btn--success" @click="confirm">{{confirmTextI18n}}</el-button>'+
'							 </div>'+
'					 </div>'+
'					 <div class="tr-drawer--body">'+
'						 <el-scrollbar class="custom-scrollbar">'+
'							 <div class="tr-drawer--body__wrapper">'+
'								 <slot></slot>'+
'							 </div>'+
'						 </el-scrollbar>'+
'					 </div>'+
'				 </div>'+
'			 </el-drawer>'
       //  `
       //  <el-drawer
       // 		 class="custom-drawer"
       // 		 :visible.sync="show"
       // 		 :with-header="false"
       // 		 :wrapper-closable="false"
       // 		 :modal="modal"
       // 		 :size="width"
       // 		 :before-close="close"
       // 		 @close="handleClose">
       // 		 <div class="tr-drawer--container">
       // 			 <div class="tr-drawer--header">
       // 					 <div class="tr-drawer--header-part">
       // 						 <div class="tr-drawer__btn-close" @click="closeDrawer"><i class="el-icon-close"></i></div>
       // 						 <div class="tr-drawer--header__title">
       // 							 {{title}}
       // 						 </div>
       // 					 </div>
       // 					 <div>
       // 						 <slot name="btn"></slot>
       // 						 <el-button  class="ter-btn ter-btn--grey" @click="cancel">{{cancelTextI18n}}</el-button>
       // 						 <el-button class="ter-btn ter-btn--success" @click="confirm">{{confirmTextI18n}}</el-button>
       // 					 </div>
       // 			 </div>
       // 			 <div class="tr-drawer--body">
       // 				 <el-scrollbar class="custom-scrollbar">
       // 					 <div class="tr-drawer--body__wrapper">
       // 						 <slot></slot>
       // 					 </div>
       // 				 </el-scrollbar>
       // 			 </div>
       // 		 </div>
       // 	 </el-drawer>
       //  `
})

/**
  * 宫格布局，比如3行4列
  */
 Vue.component("tr-grid", {
    props: {
        data: {                   //要显示的数据列表，如果为空，则以num为主
            type: Array
        },
        num: {                 //要显示的总宫格数
            type: Number,
            default: 0
        },
        cols: {                    //一行总列数
            type: Number,
            default: 1
        },
        hGap: {                   //水平每个宫格间距
            type: String,
            default: "0"
        },
        verGap: {             //垂直每个宫格间距
            type: String,
            default: "0"
        },
        isGrid: {               //是否宫格，则每一行显示的数量相同，不是宫格，则按长度随意编排
            type: Boolean,
            default: true
        }
    },
    data: function() {
        return {
        }
    },
    computed: {
        gridShellStyle: function() {
            var _this = this;
            var style = {
                "padding-right": this.hGap,
                "padding-bottom": this.verGap
            };

            if(this.isGrid) {
                style.width =  "calc( 100% / " + _this.cols + " )"
            }
            return style;
        },
        wrapperStyle: function() {
            var style = {
                "margin-right": "-" + this.hGap,
                "margin-bottom": "-" + this.verGap
            }
            return style;
        },
        hasAppend: function() {           //是否有追加内容
            return this.$slots.append;
        },
        hasPrepend: function() {
            return this.$slots.prepend;
        },
        gridData: function() {
            return this.data == null ? this.num : this.data;
        }
    },
    created: function() {
    },
    mounted: function() {
        this.initData();
    },
    methods: {
        initData: function() {
        },
    },
    watch: {
    },
    template: 
    ' <div class="tr-grid" :style="wrapperStyle">'+
'			 <div class="tr-grid__shell" :style="gridShellStyle" v-if="hasPrepend">'+
'				 <div class="tr-grid__box">'+
'					 <slot name="prepend"></slot>'+
'				 </div>'+
'			 </div>'+
'			 <div class="tr-grid__shell" :style="gridShellStyle" v-for="(box,index) in gridData" :key="index">'+
'				 <div class="tr-grid__box">'+
'					 <slot :row="box"></slot>'+
'				 </div>'+
'			 </div>'+
'			 <div class="tr-grid__shell" :style="gridShellStyle" v-if="hasAppend">'+
'				 <div class="tr-grid__box">'+
'					 <slot name="append"></slot>'+
'				 </div>'+
'			 </div>'+
'		 </div>'
   //  `
   // 	 <div class="tr-grid" :style="wrapperStyle">
   // 		 <div class="tr-grid__shell" :style="gridShellStyle" v-if="hasPrepend">
   // 			 <div class="tr-grid__box">
   // 				 <slot name="prepend"></slot>
   // 			 </div>
   // 		 </div>
   // 		 <div class="tr-grid__shell" :style="gridShellStyle" v-for="(box,index) in gridData" :key="index">
   // 			 <div class="tr-grid__box">
   // 				 <slot :row="box"></slot>
   // 			 </div>
   // 		 </div>
   // 		 <div class="tr-grid__shell" :style="gridShellStyle" v-if="hasAppend">
   // 			 <div class="tr-grid__box">
   // 				 <slot name="append"></slot>
   // 			 </div>
   // 		 </div>
   // 	 </div>
   //  `
})

 /**
  * 分页组件
  */
  Vue.component("tr-pagination", {
    props: {
        "current-page": {
            type: Number,
            default: 1
        },
        "page-size": {
            type: Number,
            default: 10
        },
        "total": {
            type: Number,
            default: 0
        },
        "dark": {                //是否黑色主题
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            indexInput: 1,
        }
    },
    computed: {
        pageCount: function() {            //总页数
            var pageCount = (this.total + this.pageSize - 1) / this.pageSize;
            return parseInt(pageCount);
        }
    },
    created: function() {

    },
    mounted: function() {
        this.initData();

    },
    methods: {
        initData: function() {
            this.indexInput = this.currentPage;
        },
        changePage: function(index) {
            index = parseInt(index);
            this.indexInput = index;
            this.$emit("current-change", index);
            
        },
        jumpTo: function() {
            if(this.indexInput == null || this.indexInput == "") {
                return;
            }
            var index = parseInt(this.indexInput);
            if(index < 1) {
                index = 1;
            }

            if(index > this.pageCount) {
                index = this.pageCount;
            }

            this.changePage(index);
        },
        jumpFirst: function() {             //跳转到首页
            this.changePage(1);
        },
        jumpLast: function() {              //跳转到尾页
            this.changePage(this.pageCount);
        }
    },
    watch: {
        currentPage: function(val) {
            this.indexInput = val;
        }
    },
    template: 
    '<div class="tr-pagination" :class="{\'tr-pagination--dark\': dark}">'+
'		 <button type="button" class="tr-pagination__btn" @click="jumpFirst">'+
'			 {{ $VI18n(\'首页\',\'page.f\') }}'+
'		 </button>'+
'		 <el-pagination'+
'		   class="tr-pagination__page"'+
'		   layout="prev, pager, next"'+
'		   :current-page="currentPage"'+
'		   :page-size="pageSize"'+
'		   :total="total"'+
'		   @current-change="changePage">'+
'		 </el-pagination>'+
'		 <button type="button" class="tr-pagination__btn" @click="jumpLast">'+
'			 {{ $VI18n(\'尾页\',\'page.l\') }}'+
'		 </button>'+
' '+
'		 <div class="tr-pagination__line"></div>'+
'		<div class="tr-pagination__jumper">'+
'			 <span>{{ $VI18n(\'跳至\',\'page.to\') }}</span>'+
'			 <input type="number" class="tr-pagination__jumper--input" v-model="indexInput" @keyup.enter="jumpTo"></input>'+
'			 <span>{{ $VI18n(\'页\',\'page.p\') }}</span>'+
' '+
'			 <button type="button" class="tr-pagination__jumper--btn" @click="jumpTo">{{ $VI18n(\'确定\',\'confirm\') }}</button>'+
'		</div>'+
'	 </div>'
   //  `
   //  <div class="tr-pagination" :class="{'tr-pagination--dark': dark}">
   // 	 <button type="button" class="tr-pagination__btn" @click="jumpFirst">
   // 		 {{ $VI18n('首页','page.f') }}
   // 	 </button>
   // 	 <el-pagination
   // 	   class="tr-pagination__page"
   // 	   layout="prev, pager, next"
   // 	   :current-page="currentPage"
   // 	   :page-size="pageSize"
   // 	   :total="total"
   // 	   @current-change="changePage">
   // 	 </el-pagination>
   // 	 <button type="button" class="tr-pagination__btn" @click="jumpLast">
   // 		 {{ $VI18n('尾页','page.l') }}
   // 	 </button>

   // 	 <div class="tr-pagination__line"></div>
   // 	<div class="tr-pagination__jumper">
   // 		 <span>{{ $VI18n('跳至','page.to') }}</span>
   // 		 <input type="number" class="tr-pagination__jumper--input" v-model="indexInput" @keyup.enter="jumpTo"></input>
   // 		 <span>{{ $VI18n('页','page.p') }}</span>

   // 		 <button type="button" class="tr-pagination__jumper--btn" @click="jumpTo">{{ $VI18n('确定','confirm') }}</button>
   // 	</div>
   //  </div>
   //  `
})


/**
 * 表头日期范围选择筛选
 */
 Vue.component("table-date-filter", {
	props: {
		value: {
			type: Array
		},
		labelHighLight: {              //是否当有选择筛选条件时，标题高亮显示
			type: Boolean,
			default: true
		},
		trigger: {               //触发方式,hover,click
			type: String,
			default: "click"
		},
		"value-format": {
			type: String,
			default: "timestamp"
		},
		format: {
			type: String
		},
		type: {                            //类型
			type: String,
			default: "datetimerange"
		},
		align: {
			type: String,
			default: "center"
		}
	},
	data: function() {
		return {
			dropdownVisible: false,
			dates: [],                //选择的日期
		}
	},
	created: function() {
	},
	mounted: function() {
		this.initData();
	},
	methods: {
		initData: function() {
			this.dates = this.value;
		},
		handlePopoverShow: function() {
			this.dropdownVisible = true;
			this.$refs.picker.pickerVisible = true;
		},
		handlePopoverHide: function() {
			this.dropdownVisible = false;
			// this.$refs.picker.pickerVisible = false;
		},
		isLabelActive: function() {               //判断是否激活标题明亮
			if(!this.labelHighLight) {
				return false;
			}
			return this.value != null && this.value.length > 0;
		},
		changeDate: function(dates) {
			this.$emit("input", dates);
			this.$emit("change", dates);
			this.handlePopoverHide();
		}
	},
	watch: {
		value: function(val) {
			this.dates = val;
		}
	},
	template: 
	'<div class="table-date-filter">'+
'		<el-popover'+
'			popper-class="table-date-filter__popover"'+
'			@show="handlePopoverShow"'+
'			@hide="handlePopoverHide"'+
'			:trigger="trigger">'+
'			<div class="table-date-filter__title" slot="reference">'+
'				<div class="table-date-filter__label" :class="{\'active\': isLabelActive()}">'+
'					<slot></slot>'+
'				</div>'+
'				<div class="table-date-filter__icon" :class="{\'active\': dropdownVisible}">'+
'					<i class="el-icon-caret-bottom"></i>'+
'				</div>'+
'				<div class="table-date-filter__picker-wrapper">'+
'					<el-date-picker'+
'						:type="type"'+
'						ref="picker"'+
'						v-model="dates"'+
'						@change="changeDate"'+
'						:align="align"'+
'						:value-format="valueFormat"'+
'						:format="format"'+
'						@blur="handlePopoverHide"'+
'						class="table-date-filter__picker">'+
'					</el-date-picker>'+
'				</div>'+
'			</div>'+
'		</el-popover>'+
'	</div>'
	// `
	// <div class="table-date-filter">
	// 	<el-popover
	// 		popper-class="table-date-filter__popover"
	// 		@show="handlePopoverShow"
	// 		@hide="handlePopoverHide"
	// 		:trigger="trigger">
	// 		<div class="table-date-filter__title" slot="reference">
	// 			<div class="table-date-filter__label" :class="{'active': isLabelActive()}">
	// 				<slot></slot>
	// 			</div>
	// 			<div class="table-date-filter__icon" :class="{'active': dropdownVisible}">
	// 				<i class="el-icon-caret-bottom"></i>
	// 			</div>

	// 			<div class="table-date-filter__picker-wrapper">
	// 				<el-date-picker
	// 					:type="type"
	// 					ref="picker"
	// 					v-model="dates"
	// 					@change="changeDate"
	// 					:align="align"
	// 					:value-format="valueFormat"
	// 					:format="format"
	// 					@blur="handlePopoverHide"
	// 					class="table-date-filter__picker">
	// 				</el-date-picker>
	// 			</div>
	// 		</div>
	// 	</el-popover>
	// </div>
	// `
})


 /**
  * 树状下拉框组件,基础组件是element-ui的el-select和el-tree
  */
  Vue.component("tree-select", {
    props: {
        clearable: {
            type: Boolean,
            default: true
        },
        props: {                  //如果是简单数据格式,配置为 {pid: "pid", id: "id", label: "name"}，如果不是简单数据格式，则{children: "children",label: "name"}
            type: Boolean,
            default: {}
        },
        data: {
            type: Array,
            default: []
        },
        simpleJson: {                            //是否简单数据格式
            type: Boolean,
            default: true
        },
        key: {                                  //树节点的key
            type: String,
            default: "id"
        },
        allowSelect: {                         //是否允许选择函数
            type: Function
        },
        value: {
            type: Object
        },
        placeholder: {
            type: String,
            default: "请选择"
        },
        selectClass: {
            type: String,
            default: ""
        },
        treeClass: {
            type: String,
            default: ""
        },
        round: {                      //是否圆角
            type: Boolean,
            default: false
        },
        dbclickEdit: {             //是否当点击时才可以编辑
            type: Boolean,
            default: false
        },
        clickCheck: {               //是否在点击的时候选中节点
            type: Boolean,
            default: true
        },
        disabled: {
           type: Boolean,
           default: false
        },
    },
    mounted: function() {
        this.initData();
    },
    computed: {
        treeProps: function() {
            var treeProps = {};
            if(this.simpleJson) {
                var treeProps = {
                    children: "children",
                    label: this.props.label || "name"
                }
            }else {
                //非简单数据格式
                var treeProps = this.props;
            }
            return treeProps;
        },
        idKey: function() {
            return this.key
        },
        selectNodeKey: function() {
            if(this.selectNode == null || this.selectNode[this.idKey]) {
                return null;
            }
            return this.selectNode[this.idKey];
        },
        isDisabled: function() {
            return this.selectDisabeld || this.disabled;
        },
        customSelectClass: function() {
            return this.selectClass + (this.round ? " tr-select-tree--round" : "") + (this.dbclickEdit ? " tr-select-tree__dbclick" : "");
        },
        placeholderI18n:function() {
            return this.placeholder == '请选择' ? $VI18n('请选择','plah.p4') : this.placeholder;
        }

    },
    data: function() {
        return {
            loading: false,
            selectNode: {},            //下拉框当前选中的节点
            optionNode: {},            //当前下拉选项选中的节点，未点确定键
            selectDisabeld: false,          //当前是否不可选择
            treeData: []
        }
    },
    methods: {
        initData: function() {
            //初始化树节点数据
            this.initTreeData();
            if(this.dbclickEdit) {
                this.selectDisabeld = true;
            }
        },
        initTreeData: function() {
            var _this = this;
            this.treeData = this.handleTreeData(this.data);
            _this.initSelectNode();
        },
        handleTreeData: function(data) {                //处理数据
            if(this.simpleJson) {
                return this.jsonTree(data, this.props)
            }
            return data;
        },
        initSelectNode: function() {
            if(this.value != null) {
                this.getNode(this.value);
            }
        },
        /**
         * 将简单的json转换成树格式
         */
        jsonTree: function (data,config) {
            var id = config.id || 'id',
                pid = config.pid || 'pid',
                children = config.children || 'children';
            var idMap = [],
                jsonTree = [];
            
            var _data = JSON.parse(JSON.stringify(data));
            _data.forEach(function(v){
                idMap[v[id]] = v;
            });
            _data.forEach(function(v){
                var parent = idMap[v[pid]];
                if(parent) {
                    !parent[children] && (parent[children] = []);
                    parent[children].push(v);
                } else {
                    jsonTree.push(v);
                }
            });
            return jsonTree;
        },
        changeSelectVisible: function(visible) {              //下拉菜单显示隐藏回调
            if(visible) {
                this.optionNode = this.selectNode;
                this.setCurrentNode(this.optionNode);
            }
        },
        changeTreeNode: function(data) {
            this.optionNode = data;
            //点击时直接选中
            if(this.clickCheck) {
                this.confirm();
                return;
            }
        },
        getNode: function(id) {
            if(id == null) {
                this.selectNode = {};
                return;
            }
            this.$nextTick(function() {
                var data = this.$refs.tree.getNode(id);
                if(data != null) {
                    this.selectNode = this.copyObject(data.data);
                }else {
                    this.selectNode = {};
                }
            });
        },
        setCurrentNode: function(node) {
            if(node == null || node[this.idKey] == null) {
                // console.log("取消高亮");
                this.$refs.tree.setCurrentKey(null);
            }else {
                this.$refs.tree.setCurrentKey(node[this.idKey]);
            }
            
        },
        confirm: function() {                //设置确定
            //判断是否节点可选择
            if(this.allowSelect != null) {
                if(!this.allowSelect(this.optionNode)) {
                    return false;
                }
            }
            this.selectNode = this.copyObject(this.optionNode);
            //设置隐藏下拉框
            this.$refs.select.blur();
        },
        cancel: function() {
            //设置隐藏下拉框
            this.$refs.select.blur();
        },
        copyObject: function(data) {
            try {
                return JSON.parse(JSON.stringify(data));
            }catch(error) {
                return null;
            }
        },
        clearSelect: function() {            //清空选择框回调
            this.selectNode = {};
        },
        handleDblclick: function() {           //处理节点双击事件
            if(this.dbclickEdit) {
                this.selectDisabeld = false;
                this.$nextTick(function() {
                    this.$refs.select.focus();
                })
            }
        },
        handleSelectBlur: function() {
            // if(this.dbclickEdit) {
            // 	this.selectDisabeld = true;
            // }
        },
        resetDbclickDisabled: function() {
            if(this.dbclickEdit) {
                this.selectDisabeld = true;
            }
        },
        clear: function() {                //点击清空按钮
            this.clearSelect();
            // this.$refs.select.blur();
            this.setCurrentNode(null);
        }
    },
    watch: {
        selectNode: function(val) {
            // console.log("selectNode:", val)
            var model = null;
            if(val != null && val[this.idKey] != null) {
                model = val[this.idKey];
            }
            this.$emit("input",model);
            this.$emit("change", val);
        },
        value: function(val) {
            if(this.selectNode[this.idKey] == val) {
                return;
            }
            this.getNode(val);
        },
        data: function(val) {
            this.initTreeData();
        }
    },
    template: 
    '<div class="tr-tree-select__wrapper" @dblclick="handleDblclick">'+
'		 <el-select '+
'			 :disabled="isDisabled"'+
'			 class="custom-select tr-tree-select" :class="customSelectClass" '+
'			 :clearable="clearable"'+
'			 popper-class="custom-select-option content-select-option"'+
'			 :placeholder="placeholderI18n"'+
'			 v-model="selectNode[treeProps.label]"'+
'			 @visible-change="changeSelectVisible"'+
'			 ref="select"'+
'			 @blur="handleSelectBlur"'+
'			 @clear="clearSelect">'+
'			 <el-option disabled>'+
'				 <div class="tr-tree-select--container" :class="treeClass" '+
'					 v-loading="loading"'+
'					 :element-loading-text="$t(\'loading[0]\')"'+
'					 element-loading-background="rgba(0, 0, 0, 0.7)">'+
'					 <div class="tr-tree-select--body">'+
'						 <el-scrollbar class="tr-tree-select--scrollbar">'+
'							 <el-tree '+
'								 :data="treeData" '+
'								 :props="treeProps"'+
'								 :expand-on-click-node="false"'+
'								 class="tr-select--tree"'+
'								 :node-key="key"'+
'								 ref="tree"'+
'								 :default-expand-all="true"'+
'								 @current-change="changeTreeNode">'+
'							 </el-tree>'+
'						 </el-scrollbar>'+
'					 </div>'+
'						 <div class="tr-tree-select--footer" v-if="!clickCheck">'+
'							 <a @click="cancel">{{ $VI18n(\'取消\',\'cancel\') }}</a>'+
'							 <a class="tr-tree-select--btn__active" @click="confirm">{{ $VI18n(\'确定\',\'confirm\') }}</a>'+
'						 </div>'+
' '+
'						 <div class="tr-tree-select--footer" v-if="clickCheck">'+
'							 <a @click="clear">{{ $VI18n(\'清空\',\'clear\') }}</a>'+
'						 </div>'+
'				 </div>'+
'			 </el-option>'+
'		 </el-select>'+
'	 </div>'
   //  `
   //  <div class="tr-tree-select__wrapper" @dblclick="handleDblclick">
   // 	 <el-select 
   // 		 :disabled="isDisabled"
   // 		 class="custom-select tr-tree-select" :class="customSelectClass" 
   // 		 :clearable="clearable"
   // 		 popper-class="custom-select-option content-select-option"
   // 		 :placeholder="placeholderI18n"
   // 		 v-model="selectNode[treeProps.label]"
   // 		 @visible-change="changeSelectVisible"
   // 		 ref="select"
   // 		 @blur="handleSelectBlur"
   // 		 @clear="clearSelect">
   // 		 <el-option disabled>
   // 			 <div class="tr-tree-select--container" :class="treeClass" 
   // 				 v-loading="loading"
   // 				 :element-loading-text="$t('loading[0]')"
   // 				 element-loading-background="rgba(0, 0, 0, 0.7)">
   // 				 <div class="tr-tree-select--body">
   // 					 <el-scrollbar class="tr-tree-select--scrollbar">
   // 						 <el-tree 
   // 							 :data="treeData" 
   // 							 :props="treeProps"
   // 							 :expand-on-click-node="false"
   // 							 class="tr-select--tree"
   // 							 :node-key="key"
   // 							 ref="tree"
   // 							 :default-expand-all="true"
   // 							 @current-change="changeTreeNode">
   // 						 </el-tree>
   // 					 </el-scrollbar>
   // 				 </div>
   // 					 <div class="tr-tree-select--footer" v-if="!clickCheck">
   // 						 <a @click="cancel">{{ $VI18n('取消','cancel') }}</a>
   // 						 <a class="tr-tree-select--btn__active" @click="confirm">{{ $VI18n('确定','confirm') }}</a>
   // 					 </div>

   // 					 <div class="tr-tree-select--footer" v-if="clickCheck">
   // 						 <a @click="clear">{{ $VI18n('清空','clear') }}</a>
   // 					 </div>
   // 			 </div>
   // 		 </el-option>
   // 	 </el-select>
   //  </div>
   //  `
})


/**
  * 树状下拉框组件,基础组件是element-ui的el-select和el-tree
  */
 Vue.component("tree-check", {
    props: {
        clearable: {
            type: Boolean,
            default: false
        },
        props: {                  //如果是简单数据格式,配置为 {pid: "pid", id: "id", label: "name"}，如果不是简单数据格式，则{children: "children",label: "name"}
            type: Boolean,
            default: {}
        },
        data: {
            type: Array,
            default: []
        },
        simpleJson: {                            //是否简单数据格式
            type: Boolean,
            default: true
        },
        key: {                                  //树节点的key
            type: String,
            default: "id"
        },
        value: {
            type: Array,
            default: []
        },
        placeholder: {
            type: String,
            default: "请选择"
        },
        selectClass: {
            type: String,
            default: ""
        },
        treeClass: {
            type: String,
            default: ""
        },
        round: {                      //是否圆角
            type: Boolean,
            default: false
        },
        collapseTags: {           //是否折叠tag
            type: Boolean, 
            default: false
        },
        filterNode: {              //过滤节点函数，如果返回false，则在勾选之后不会选择该值
            type: Function
        }
    },
    mounted: function() {
        this.initData();
    },
    computed: {
        treeProps: function() {
            var treeProps = {};
            if(this.simpleJson) {
                var treeProps = {
                    children: "children",
                    label: this.props.label || "name"
                }
            }else {
                //非简单数据格式
                var treeProps = this.props;
            }
            return treeProps;
        },
        idKey: function() {
            return this.key
        },
        placeholderI18n:function() {
            return this.placeholder == '请选择' ? $VI18n('请选择','plah.p4') : this.placeholder;
        }

    },
    data: function() {
        return {
            treeData: [],
            loading: false,
            checkNodes: [],                //当前选中的节点数据
            // optionCheckNodes: [],             //在下拉选项中已选择的节点
            selectLabels: [],                   //当前选中的节点label值
            selectLabelsDump: [],                //当前选中的节点label值副本
            hasObtained: false,                    //是否已经获取到树节点
            originValues: []                       //在未加载树之前已经存在的节点数据
        }
    },
    methods: {
        initData: function() {
            //初始化树节点数据
            this.initTreeData();
        },
        initTreeData: function() {
            var _this = this;
            this.treeData = this.handleTreeData(this.data);
            // console.log("treeData:", this.treeData);
            this.hasObtained = true;
            this.originValues = this.value;
            this.initCheckedNode();
        },
        handleTreeData: function(data) {                //处理数据
            if(this.simpleJson) {
                return this.jsonTree(data, this.props)
            }
            return data;
        },
        initCheckedNode: function() {
            // console.log("选择：", this.originValues);
            // console.log("初始化树");
            this.$nextTick(function() {
                this.autoCheckNodes(this.originValues, false);
            })
            
        },
        /**
         * 将简单的json转换成树格式
         */
        jsonTree: function (data,config) {
            var id = config.id || 'id',
                pid = config.pid || 'pid',
                children = config.children || 'children';
            var idMap = [],
                jsonTree = [];
            
            var _data = JSON.parse(JSON.stringify(data));
            _data.forEach(function(v){
                idMap[v[id]] = v;
            });
            _data.forEach(function(v){
                var parent = idMap[v[pid]];
                if(parent) {
                    !parent[children] && (parent[children] = []);
                    parent[children].push(v);
                } else {
                    jsonTree.push(v);
                }
            });
            return jsonTree;
        },
        changeSelectVisible: function(visible) {              //下拉菜单显示隐藏回调
            if(visible) {
                this.autoCheckNodes();
            }
        },
        autoCheckNodes: function(keys, isChangeValue) {               //根据id数组自动选中节点
            this.$nextTick(function() {
                if(!this.hasObtained) {
                    return;
                }
                if(this.isNull(keys)) {
                    keys = this.value;
                }
                
                this.cancelChecked();
                //选中指定的keys
                this.checkedKeys(keys);

                this.setSelectLabels();

                if(this.isNull(isChangeValue) || isChangeValue) {
                    this.changeValue();
                }
            })
            
        },
        cancelChecked: function() {             //取消选中已经选中的节点
            var keys = this.$refs.tree.getCheckedKeys();
            var _this = this;
            keys.forEach(function(key) {
                _this.$refs.tree.setChecked(key, false);
            })
            // console.log("删除后：", this.$refs.tree.getCheckedKeys())
        },
        checkedKeys: function(keys) {
            // console.log("keys:", keys);
            this.$refs.tree.setCheckedKeys(keys);
            var _this = this;
            var nodes = keys.map(function(key) {
                var node = _this.$refs.tree.getNode(key);
                if(_this.isNull(node)) {
                    return null;
                }
                return node.data;
            }).filter(function(data) {
                return !_this.isNull(data);
            });
            if(!this.isNull(this.filterNode)) {
                nodes = nodes.filter(function(data) {
                    return _this.filterNode(data);
                })
            }
            // console.log("nodes:", nodes);
            this.checkNodes = this.copyObject(nodes);
            // this.optionCheckNodes = this.copyObject(nodes);
        },
        confirm: function() {                //设置确定
            var keys = this.$refs.tree.getCheckedKeys();
            // console.log("keys:", keys);
            this.autoCheckNodes(keys);
            //设置隐藏下拉框
            this.$refs.select.blur();

            this.$emit("confirm", keys, this.checkNodes)
        },
        cancel: function() {
            //设置隐藏下拉框
            this.$refs.select.blur();
        },
        copyObject: function(data) {
            try {
                return JSON.parse(JSON.stringify(data));
            }catch(error) {
                return null;
            }
        },
        isNull: function(variable) {
            return variable === undefined || variable === null || variable === "";
        },
        clearSelect: function() {            //清空选择框回调
            this.checkNodes = [];
        },
        compareArray: function(arr1,arr2) {             //比较两个数组是否相同
            if(arr1 == arr2) {
                return true;
            }
            if(this.isNull(arr1) && !this.isNull(arr2)) {
                return false;
            }

            if(this.isNull(arr2) && !this.isNull(arr1)) {
                return false;
            }

            //对比每个元素
            if(arr1.length != arr2.length) {
                return false;
            }

            return arr1.every(function(e, index) {
                return arr2[index] == e;
            })
        },
        setSelectLabels: function() {              //设置数组中的label
            var _this = this;
            this.selectLabels = this.checkNodes.map(function(data) {
                return data[_this.treeProps.label];
            });
            this.selectLabelsDump = this.copyObject(this.selectLabels);
            // console.log(this.checkNodes,this.selectLabels);
        },
        handleRemoveTag: function(tag) {                  //处理移除tag事件
            var index = this.selectLabelsDump.indexOf(tag);
            var data = this.checkNodes[index];
            // console.log(JSON.parse(JSON.stringify(this.checkNodes)));
            this.checkNodes.splice(index, 1);
            
            // console.log(index,this.checkNodes);
            // var dom = this.$refs.tree;
            // if(!this.isNull(dom)) {
            // 	dom.setChecked(data[this.key], false);
            // }
            this.selectLabelsDump = this.copyObject(this.selectLabels);
            this.changeValue();
        },
        changeValue: function() {
            var _this = this;
            var keys = this.checkNodes.map(function(data) {
                return data[_this.key];
            });
            // console.log("keys:", keys, val);
            var old = this.value;
            // this.value = keys;
            if(this.compareArray(keys, old)) {
                return;
            }
            this.$emit("change", keys, this.checkNodes);
            this.$emit("input", keys);
        }

    },
    watch: {
        checkNodes: function(val) {

        },
        value: function(val, old) {
            console.log("value改变：", val);
            // this.setSelectLabels();
            if(this.compareArray(val, old)) {
                return;
            }
            // console.log("hasObtained:", this.hasObtained, val);
            if(!this.hasObtained) {
                this.originValues = val;
            }
            // console.log("origin:", this.originValues, val);
            this.autoCheckNodes(val, false);
        },
        data: function() {
            this.initTreeData();
        }
    },
    template:
    '<el-select '+
'				 class="tr-tree-select tr-tree-select__check" :class="selectClass +  (round ? \'tr-select-tree--round\' : \'\')" '+
'				 :clearable="clearable"'+
'				 popper-class="custom-select-option content-select-option"'+
'				 :placeholder="placeholderI18n"'+
'				 @visible-change="changeSelectVisible"'+
'				 ref="select"'+
'				 multiple="true"'+
'				 :collapse-tags="collapseTags"'+
'				 v-model="selectLabels"'+
'				 @clear="clearSelect"'+
'				 @remove-tag="handleRemoveTag">'+
'				 <el-option disabled>'+
'					 <div class="tr-tree-select--container" :class="treeClass" '+
'						 v-loading="loading"'+
'						 :element-loading-text="$t(\'loading[0]\')"'+
'						 element-loading-background="rgba(0, 0, 0, 0.7)">'+
'						 <div class="tr-tree-select--body">'+
'							 <el-scrollbar class="tr-tree-select--scrollbar">'+
'								 <el-tree '+
'									 :data="treeData" '+
'									 :props="treeProps"'+
'									 :expand-on-click-node="false"'+
'									 class="tr-select--tree tr-select--tree__check"'+
'									 :node-key="key"'+
'									 ref="tree"'+
'									 show-checkbox="true"'+
'									 check-on-click-node="true"'+
'									 :default-expand-all="true">'+
'								 </el-tree>'+
'							 </el-scrollbar>'+
'						 </div>'+
'							 <div class="tr-tree-select--footer">'+
'							 <a @click="cancel">{{ $VI18n(\'取消\',\'cancel\') }}</a>'+
'							 <a class="tr-tree-select--btn__active" @click="confirm">{{ $VI18n(\'确定\',\'confirm\') }}</a>'+
'						 </div>'+
'					 </div>'+
'				 </el-option>'+
'			 </el-select>'
   //  `
   //   <el-select 
   // 			 class="tr-tree-select tr-tree-select__check" :class="selectClass +  (round ? 'tr-select-tree--round' : '')" 
   // 			 :clearable="clearable"
   // 			 popper-class="custom-select-option content-select-option"
   // 			 :placeholder="placeholderI18n"
   // 			 @visible-change="changeSelectVisible"
   // 			 ref="select"
   // 			 multiple="true"
   // 			 :collapse-tags="collapseTags"
   // 			 v-model="selectLabels"
   // 			 @clear="clearSelect"
   // 			 @remove-tag="handleRemoveTag">
   // 			 <el-option disabled>
   // 				 <div class="tr-tree-select--container" :class="treeClass" 
   // 					 v-loading="loading"
   // 					 :element-loading-text="$t('loading[0]')"
   // 					 element-loading-background="rgba(0, 0, 0, 0.7)">
   // 					 <div class="tr-tree-select--body">
   // 						 <el-scrollbar class="tr-tree-select--scrollbar">
   // 							 <el-tree 
   // 								 :data="treeData" 
   // 								 :props="treeProps"
   // 								 :expand-on-click-node="false"
   // 								 class="tr-select--tree tr-select--tree__check"
   // 								 :node-key="key"
   // 								 ref="tree"
   // 								 show-checkbox="true"
   // 								 check-on-click-node="true"
   // 								 :default-expand-all="true">
   // 							 </el-tree>
   // 						 </el-scrollbar>
   // 					 </div>
   // 						 <div class="tr-tree-select--footer">
   // 						 <a @click="cancel">{{ $VI18n('取消','cancel') }}</a>
   // 						 <a class="tr-tree-select--btn__active" @click="confirm">{{ $VI18n('确定','confirm') }}</a>
   // 					 </div>
   // 				 </div>
   // 			 </el-option>
   // 		 </el-select>
   // 	 `
})

/**
 * 监听指定div宽度或高度变化指令
 */
 Vue.directive("resize", {
	bind: function (el, binding) {
		var width = '', height = '';
        function isReize () {
          var style = document.defaultView.getComputedStyle(el);
          if (width !== style.width || height !== style.height) {
            binding.value();  // 关键
          }
          width = style.width;
          height = style.height;
        }
        el.__vueSetInterval__ = setInterval(isReize, 300);
    },
	unbind: function(el) {
		clearInterval(el.__vueSetInterval__);
	}
})
 
/**
 * 懒加载轮播组件简易版
 */
Vue.component("tr-lazy-carousel", {
	props: {
		height: {
			type: String
		},
		autoplay: {
			type: Boolean,
			default: true
		},
		interval: {
			type: Number,
			default: 3000
		},
		loop: {
			type: Boolean,
			default: true
		},
		initialIndex: {
			type: Number,
			default: 0
		},
		maxSlides: {         //允许显示的最多slide数量，如果为-1，则显示全部slide
			type: Number,
			default: 3
		}
	},
	data: function() {
		return {
			items: [],
			activeIndex: -1,       //当前选中的索引
			timer: null, 
		}
	},
	created: function() {
	},
	mounted: function() {
		this.initData();
	},
	methods: {
		initData: function() {
			this.updateItems();
			//初始化activeIndex
			this.$nextTick(function() {
				if(this.initialIndex < this.items.length && this.initialIndex >= 0) {
					this.activeIndex = this.initialIndex;
				}
				this.startTimer();
			})
		},
		updateItems: function() {
			this.items = this.$children.filter(function(child) {
				return child.$options && child.$options.name === "tr-lazy-carousel-item";
			});
		},
		resetItemPosition: function(oldIndex) {
			var _this = this;
			this.items.forEach(function(item, index) {
				item.translateItem(index, _this.activeIndex, oldIndex);
			})
		},
		startTimer: function() {
			if(!this.autoplay || this.interval <= 0 || this.timer) {
				return;
			}
			this.timer = setInterval(this.playSlides, this.interval);
		},
		playSlides: function() {
			if (this.activeIndex < this.items.length - 1) {
				this.activeIndex++;
			} else if (this.loop) {
				this.activeIndex = 0;
			}
		},
		pauseTimer: function() {
			if (this.timer) {
			  clearInterval(this.timer);
			  this.timer = null;
			}
		},
		resetTimer: function() {
			this.pauseTimer();
			this.startTimer();
		},
		setActiveItem: function(index) {
			index = Number(index);
			if (isNaN(index) || index !== Math.floor(index)) {
				console.warn('[tr-lazy-carousel]index must be an integer.');
				return;
			}
			var length = this.items.length;
			var oldIndex = this.activeIndex;
			if (index < 0) {
				this.activeIndex = this.loop ? length - 1 : 0;
			} else if (index >= length) {
				this.activeIndex = this.loop ? 0 : length - 1;
			} else {
				this.activeIndex = index;
			}
			if (oldIndex === this.activeIndex) {
				this.resetItemPosition(oldIndex);
			}
			this.resetTimer();
		},
		prev: function() {
			this.setActiveItem(this.activeIndex - 1);
		},
		next: function() {
			this.setActiveItem(this.activeIndex + 1);
		},
		onResize: function() {
			this.resetItemPosition();
		}
	},
	watch: {
		activeIndex: function(val, oldVal) {
			this.resetItemPosition(oldVal);
			if (oldVal > -1) {
				this.$emit('change', val, oldVal);
			}
		},
		autoplay: function(val, oldVal) {
			val ? this.startTimer() : this.pauseTimer();
		},
		interval: function(val, oldVal) {
			this.setActiveItem(this.activeIndex);
		},
		items: function(val) {
			if(val.length > 0) {
				this.setActiveItem(this.initialIndex);
			}
		}
	},
	template: 
	'<div class="tr-lazy-carousel" v-resize="onResize">'+
'		<div class="tr-lazy-carousel__container" :style="{height: height}">'+
'			<slot></slot>'+
'		</div>'+
'	</div>'
	// `
	// <div class="tr-lazy-carousel" v-resize="onResize">
	// 	<div class="tr-lazy-carousel__container" :style="{height: height}">
	// 		<slot></slot>
	// 	</div>
	// </div>

	// `
})
/**
 * 懒加载轮播每一项内容
 */
Vue.component("tr-lazy-carousel-item", {
	props: {

	},
	data: function() {
		return {
			slideShow: false,
			translate: 0,          //位移距离
			animating: false,    //是否位移中
			active: false,       //当前是否选中
		}
	},
	computed: {
		itemStyle: function() {
			return {
				transform: "translateX(" + this.translate + "px)"
			};
		},
	},
	created: function() {
		this.$parent && this.$parent.updateItems();
	},
	destroyed: function() {
		this.$parent && this.$parent.updateItems();
	},
	mounted: function() {
		this.initData();
	},
	methods: {
		initData: function() {
		},
		translateItem: function(index, activeIndex, oldIndex) {
			var length = this.$parent.items.length;
			if(oldIndex !== undefined) {
				this.animating = index === activeIndex || index === oldIndex;
			}
			//根据是否loop处理当前索引
			if (index !== activeIndex && length > 2 && this.$parent.loop) {
				index = this.processIndex(index, activeIndex, length);
			}

			this.active = index === activeIndex;
			this.slideShow = this.calcShow(index, activeIndex, oldIndex);
          	this.translate = this.calcTranslate(index, activeIndex);
		},
		calcShow: function(index, activeIndex, oldIndex) {
			var maxSlides = this.$parent.maxSlides;
			if(maxSlides <= -1) {
				return true;
			}
			var diff = Math.abs(index - activeIndex);
			return diff <= maxSlides / 2;
		},
		processIndex: function(index, activeIndex, length) {
			if(activeIndex === 0 && index === length - 1) {
				return -1;
			}

			if(activeIndex === length - 1 && index === 0) {
				return length;
			}

			if(index < activeIndex - 1 && activeIndex - index >= length / 2) {
				return length + 1;
			}

			if(index > activeIndex + 1 && index - activeIndex >= length / 2) {
				return -2;
			}
			return index;
		},
		calcTranslate: function(index, activeIndex) {         //计算位移
			var distance = this.$parent.$el["offsetWidth"];
			return distance * (index - activeIndex);
		}
	},
	watch: {
	},
	template: 
	'<div class="tr-lazy-carousel-item" v-if="slideShow" :style="itemStyle" :class="{\'is-animating\': animating, \'is-active\': active}">'+
'		<slot></slot>'+
'	</div>'
	// `
	// <div class="tr-lazy-carousel-item" v-if="slideShow" :style="itemStyle" :class="{'is-animating': animating, 'is-active': active}">
	// 	<slot></slot>
	// </div>
	// `
})


/**
 * 逐条滚动组件第二版（解决第一版滚动卡顿问题），需要使用swiper
 */
 Vue.component("step-scroll-v2", {
    props: {
        data: {
            type: Array,
            default: function() {
                return [];
            }
        },
        limitMoveNum: {                   //开启无缝滚动的数据量
            type: Number,
            default: 5
        },
        isSingleRemUnit: {                  //是否开启rem度量
            type: Boolean,
            default: false
        },
        autoCalSize: {                //是否自动计算容器大小，高度计算方式：(limitMoveNum - 1) *  singleHeight，宽度计算方式：(limitMoveNum - 1) * singleWidth
            type: Boolean,
            default: true
        },
        singleHeight: {            //单步运动停止的高度(默认值0是无缝不停止的滚动)
            type: Number,
            default: 0
        },
        singleWidth: {         //单步运动停止的宽度(默认值0是无缝不停止的滚动)
            type: Number,
            default: 0
        },
        direction: {                   //方向，horizontal：横向滚动， vertical：竖向滚动
            type: Object,
            default: "vertical"
        },
        speed: {                   //数值越大速度滚动越快
            type: Number,
            default: 1
        },
        waitTime: {            //单步停止等待时间(默认值2500ms)
            type: Number,
            default: 2500
        },
        hoverStop: {                    //是否启用鼠标hover控制
            type: Boolean,
            default: true
        },
        center: {                    //当不滚动时,是否居中显示
            type: Boolean,
            default: false
        },
        loop: {                   //是否循环播放
            type: Boolean,
            default: true
        }
    },
    data: function() {
        return {
            swiper: null,             //轮播器变量
 
        }
    },
    computed: {
        swiperOption: function() {
            return {
                speed: this.swiperSpeed,
                slidesPerView: this.slidesPerView,
                observer: true,        //修改swiper自己或子元素时，自动初始化swiper
                observeParents: true,     //修改swiper的父元素时，自动初始化swiper
                autoplay: {
                    delay: this.waitTime,
                    disableOnInteraction: false,
                    reverseDirection: this.reverseDirection,
 
                },
                direction: this.swiperDirection,
                loop: this.swiperLoop
            }
        },
        swiperDirection: function() {
            if(this.direction == 2 || this.direction == 3 || this.direction == "horizontal") {
                return "horizontal";
            }
 
            return "vertical";
        },
        swiperSingleHeight: function() {
            var unit = this.isSingleRemUnit ? "rem" : "px";
            return this.singleHeight + unit;
        },
        swiperSingleWidth: function() {
            var unit = this.isSingleRemUnit ? "rem" : "px";
            return this.singleWidth + unit;
        },
        isHorizontal: function() {           //是否横向滚动
            return this.swiperDirection == "horizontal";
        },
        containerHeight: function() {            //计算容器高度
            if(this.isHorizontal) {
                return null;
            }
            if(!this.autoCalSize || this.singleHeight <= 0 || this.limitMoveNum <= 1) {
                return null;
            }
 
            var limit = this.slidesPerView;
            var height = limit * this.singleHeight;
            return height + (this.isSingleRemUnit ? "rem" : "px");
        },
        containerWidth: function() {
            if(!this.isHorizontal) {
                return null;
            }
 
            if(!this.autoCalSize || this.singleWidth <= 0 || this.limitMoveNum <= 1) {
                return null;
            }
            var limit = this.slidesPerView;
            console.log("limit: " + limit);
            var width = limit * this.singleWidth;
            return width + (this.isSingleRemUnit ? "rem" : "px");
        },
        swiperClass: function() {
            return "step-scroll-v2__swiper-" + this.uuid();
        },
        reverseDirection: function() {
            if(this.direction == 1 || this.direction == 3) {
                return true;
            }
            return false;
        },
        swiperSpeed: function() {
            var initSpeed = 1500;
            if(this.speed == 0) {
                return initSpeed;
            }
            return parseInt(initSpeed / this.speed);
        },
        swiperLoop: function() {
            if(!this.loop) {
                return false;
            }
 
            return this.data.length >= this.limitMoveNum;
        },
        slidesPerView: function() {
            return Math.min(this.limitMoveNum - 1, this.data.length);
        },
        containerStyle: function() {
            return {
                height: this.containerHeight,
                width: this.containerWidth
            }
        },
        componentStyle: function() {
            if(this.center) {
                return {};
            }
            return this.containerStyle;
        }
        
    },
    mounted: function() {
        this.initSwiper();
    },
    methods: {
        initSwiper: function() {                    //初始化swiper
			var _this = this;
            if(this.swiper != null) {
                this.swiper.destroy();
            }
            this.$nextTick(function() {
                this.swiper = new Swiper("." + this.swiperClass, this.swiperOption);
				if(this.hoverStop) {
					this.swiper.el.onmouseover = function(){
						_this.swiper.autoplay.stop();
					}

					this.swiper.el.onmouseout = function(){
						_this.swiper.autoplay.start();
					}
				}
            });
            
        },
        uuid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
    },
    watch: {
        data: function(val, oldVal) {
            if(oldVal == null || val == null) {
                this.initSwiper();
                return;
            }
 
            if(oldVal.length != val.length) {
                this.initSwiper();
            }
            
        }
    },
    template: 
    '<div class="step-scroll-v2" :style="componentStyle">'+
'        <div class="swiper-container" :class="swiperClass" :style="containerStyle">'+
'            <div class="swiper-wrapper">'+
'                <div class="swiper-slide" v-for="(record,index) in data"  :key="index">'+
'                    <slot :row="record"></slot>'+
'                </div>'+
'            </div>'+
'        </div>'+
'    </div>'
    // `
    // <div class="step-scroll-v2" :style="componentStyle">
    //     <div class="swiper-container" :class="swiperClass" :style="containerStyle">
    //         <div class="swiper-wrapper">
    //             <div class="swiper-slide" v-for="(record,index) in data"  :key="index">
    //                 <slot :row="record"></slot>
    //             </div>
    //         </div>
    //     </div>
    // </div>
    // `
});

Vue.component("auto-scroll-v2", {
    props: {
        text: {                    //显示的文本内容
            type: String,
            default: ""
        },
        width: {
            type: String
        },
        height: {
            type: String
        },
        maxWidth: {
            type: String
        },
        speed: {                   //速度，数值越大越快
            type: Number,
            default: 1
        },
        direction: {               //滚动方向， 2向左 3向右
            type: Number,
            default: 2
        },
        itemClass: {                //每一项的class
            type: String
        },
        align: {                   //文本对齐方式
            type: String,
            align: "left"
        },
        seamless: {            //是否无缝滚动
            type: Boolean,
            default: true
        },
        waitTime: {       //滚完之后等待时间，小于等于0，则不等待
            type: Number,
            default: 0
        }
        
    },
    data: function() {
        return {
            isScroll: false,             //是否滚动
            offsetHeight: -1,
            wrapperWidth: -1,
            containerWidth: -1,
            scrollLeft: 0,               //滚动的left值
            waitTimer: null,            //等待的计时器
            isWaiting: false,             //是否等待
        }
    },
    computed: {
        wrapperStyle: function() {
            return {
                "text-align": this.align
            }
        },
        componentStyle: function() {
            return {
                "max-width": this.maxWidth,
                "width": this.width,
                "height": this.height
            }
        },
        scorllStyle: function() {
            return {
                "width": this.containerWidth + "px",
                "height": this.offsetHeight + "px"
            }
        },
        scrollWrapperStyle: function() {                     //滚动容器样式
            if(this.isScrollToLeft) {
                return {
                    left: this.scrollLeft + "px"
                }
            }
            //向右滚动
            return {
                right: this.scrollLeft + "px",
            }
        },
        scrollDistance: function() {                     //每次滚动的距离
            return this.speed;
        },
        isScrollToLeft: function() {                //是否向左滚动
            return this.direction == 2;
        },
        isScrollToRight: function() {                //是否向右滚动
            return this.direction == 3;
        },
        textNum: function() {
            return this.seamless ? 2 : 1;
        },
        nextWaitTime: function() {
            return this.waitTime;
        }
 
        
    },
    mounted: function() {
        this.initScroll();
    },
    methods: {
        initScroll: function() {             //初始化是否滚动
            this.isScroll = false;
            this.$nextTick(function() {
                this.offsetHeight = this.$refs.wrapper.offsetHeight;
                var wrapperWidth = this.$refs.wrapper.offsetWidth;
                var containerWidth = this.$refs.container.offsetWidth;
                this.wrapperWidth = wrapperWidth;
                this.containerWidth = containerWidth;
                this.isScroll = containerWidth < wrapperWidth;
                console.log("wrapperWidth:" + wrapperWidth + "  containerWidth:" + containerWidth 
                    + "  isScroll:" + this.isScroll + " offsetHeight:" + this.offsetHeight);
                
                if(this.isScroll) {
                    this.animate();
                }
            })
        },
        animate: function() {                                 //滚动到指定位置
            if(!this.isScroll || this.isWaiting) {
                return;
            }
            if(this.isScrollToEnd()) {
                this.scrollLeft = 0;
                //判断waitTime，等待时间后
                if(this.nextWaitTime > 0) {
                    this.waitForNextScroll();
                    return;
                }
            } else {
                this.scrollLeft -= this.scrollDistance;
            }
            requestAnimationFrame(this.animate);
        },
        waitForNextScroll: function() {      //等待下一次滚动
            this.isWaiting = true;
            if(this.waitTimer != null) {
                clearTimeout(this.waitTimer);
            }
            var _this = this;
            this.waitTimer = setTimeout(function() {
                _this.isWaiting = false;
                _this.animate();
            }, this.nextWaitTime);
        },
        isScrollToEnd: function() {               //是否已滚动到末尾
            var parts = this.$refs["scrollPart"];
            if(parts == null || parts.length <= 0) {
                return false;
            }
            var width = parts[0].offsetWidth;
            return Math.abs(this.scrollLeft) > width
        },
        reset: function() {             //重置方法，在内容变化时，可调用该方法，重新计算是否需要滚动
            if(this.waitTimer != null) {
                _this.isWaiting = false;
                clearTimeout(this.waitTimer);
            }
            this.isScroll = false;
            this.initScroll();
        }
    },
    watch: {
        text: function(val) {
            this.isScroll = false;
            this.initScroll();
        },
        width: function(val) {
            this.isScroll = false;
            this.initScroll();
        },
        maxWidth: function(val) {
            this.isScroll = false;
            this.initScroll();
        }
    },
    template: 
    '<div class="auto-scroll-v2"  :style="componentStyle">'+
'        <div class="auto-scroll-v2__container" ref="container" v-if="!isScroll">'+
'            <div class="auto-scroll-v2__wrapper" ref="wrapper" :style="wrapperStyle" >'+
'                <slot>{{text}}</slot>'+
'            </div>'+
'        </div>'+
' '+
'        <div class="auto-scroll-v2__scroll" v-if="isScroll" :style="scorllStyle">'+
'            <div class="auto-scroll-v2__scroll-wrapper" :style="scrollWrapperStyle">'+
'                <div v-for="n in textNum" class="auto-scroll-v2__scroll-part" ref="scrollPart" :class="itemClass">'+
'                    <slot>{{text}}</slot>'+
'                </div>'+
'            </div>'+
'        </div>'+
'    </div>'
    // `
    // <div class="auto-scroll-v2"  :style="componentStyle">
    //     <div class="auto-scroll-v2__container" ref="container" v-if="!isScroll">
    //         <div class="auto-scroll-v2__wrapper" ref="wrapper" :style="wrapperStyle" >
    //             <slot>{{text}}</slot>
    //         </div>
    //     </div>
 
    //     <div class="auto-scroll-v2__scroll" v-if="isScroll" :style="scorllStyle">
    //         <div class="auto-scroll-v2__scroll-wrapper" :style="scrollWrapperStyle">
    //             <div v-for="n in textNum" class="auto-scroll-v2__scroll-part" ref="scrollPart" :class="itemClass">
    //                 <slot>{{text}}</slot>
    //             </div>
    //         </div>
    //     </div>
    // </div>
    // `
})

/**
 * 图片预览，能够缩放图片、拖拽移动预览
 */
Vue.component("tr-image-viewer", {
	props: {
		width: {
			type: String,
			default: "100%"
		},
		height: {
			type: String,
			default: "100%"
		},
		url: {
			type: String
		},
		wheelScaleRate: {      //滚轮缩放的速率
			type: Number,
			default: 0.015
		},
		initialScale: {       //初始缩放倍数
			type: Number,
			default: 1
		},
		mode: {         //图片填充模式，contain: 按宽高比例显示图片， fill: 图片铺满容器
			type: String,
			default: "contain"
		},
		minScale: {        //最小缩放比例
			type: Number,
			default: 0.2
		},
		maxScale: {        //最大缩放比例
			type: Number,
			default: 10
		},
		draggable: {          //是否可拖动
			type: Boolean,
			default: true
		},
		scalable: {          //是否可缩放
			type: Boolean,
			default: true
		},
		alwaysInside: {         //图片是否永远在内部
			type: Boolean,
			default: false
		}
	},
	data: function() {
		return {
			transform: {
				scale: 1,
				deg: 0,
				offsetX: 0,
				offsetY: 0,
				enableTransition: false
			},
			loading: false,     //是否正在加载
			error: false,      //是否加载错误
			zoomPageX: -1,
			zoomPageY: -1
		}
	},
	computed: {
		viewerStyle: function() {
			return {
				width: this.width,
				height: this.height
			}
		},
		imgStyle: function() {
			var style =  {
				transform: "scale(" +  this.transform.scale + ") rotate(" + this.transform.deg + ")",
				transition: this.transform.enableTransition ? 'transform .3s' : '',
				"margin-left": this.transform.offsetX + "px",
				"margin-top": this.transform.offsetY + "px"
			}
			if(this.isContainMode) {
				style.maxWidth = "100%";
				style.maxHeight = "100%";
			} else {
				style.width = "100%";
				style.height = "100%";
			}
			return style;
		},
		isContainMode: function() {
			return this.mode == "contain";
		},
		mousewheelEventName: function() {        //鼠标滚动事件名称
			return this.$global.isFirefox() ? "DOMMouseScroll" : "mousewheel";
		}
	},
	created: function() {
		if(this.alwaysInside) {
			this.minScale = 1;
			this.mode = "fill";
		}
		var scale = this.initialScale;
		if(this.initialScale < this.minScale) {
			scale = this.minScale;
		}

		this.transform.scale = scale;
	},
	beforeDestroy: function() {
		this.unregisterEventListeners();
	},
	destroyed: function() {
	},
	mounted: function() {
		this.initData();
	},
	methods: {
		initData: function() {
			this.registerEventListeners();
		},
		handleImgLoad: function() {          //图片加载成功
			this.loading = false;
			this.error = false;
			// console.log("图片url=" + this.url + "加载完成：", this.loading);
		},
		handleImgError: function() {          //图片加载失败
			this.loading = false;
			this.error = true;
			// console.error("图片url=" + this.url + "加载失败");
		},
		handleMouseDown: function(e) {          //处理图片鼠标点击事件
			if(this.loading || !this.draggable || this.error) {
				return;
			}
			var offsetX = this.transform.offsetX;
			var offsetY = this.transform.offsetY;
			//拖拽事件，使用限流函数
			var _this = this;
			this._dragHandler = this.$global.throttle(function(ev) {
				_this.handleDragEvent(e, ev, offsetX, offsetY);
				
			}, 10);

			// var viewer = this.$refs.viewer;
			//添加鼠标移动和弹起事件
			document.addEventListener("mousemove", this._dragHandler);
			document.addEventListener("mouseup", function(ev) {
				//移除鼠标事件
				document.removeEventListener("mousemove", _this._dragHandler)
			});

			document.addEventListener("mouseleave", function(ev) {
				//移除鼠标事件
				document.removeEventListener("mousemove", _this._dragHandler)
			});
			e.preventDefault();
		},
		handleDragEvent: function(prev, current, offsetX, offsetY) {
			var _offsetX = offsetX + current.pageX - prev.pageX;
			var _offsetY = offsetY + current.pageY - prev.pageY;
			if(this.alwaysInside) {
				var offset = this.getAlawysInsideOffset(_offsetX, _offsetY);
				_offsetX = offset.offsetX;
				_offsetY = offset.offsetY;
			}
			this.transform.offsetX = _offsetX;
			this.transform.offsetY = _offsetY;
		},
		getAlawysInsideOffset: function(offsetX, offsetY) {
			var width = this.$refs.viewer.offsetWidth;
			var height = this.$refs.viewer.offsetHeight;
			var scale = this.transform.scale;
			var imgWidth = width * scale;
			var imgHeight = height * scale;
			var allowWidth = imgWidth - width;
			var allowHeight = imgHeight - height;
			if(offsetX >= allowWidth) {
				offsetX = allowWidth;
			}

			if(offsetY >= allowHeight) {
				offsetY = allowHeight;
			}

			if(offsetX <= -allowWidth) {
				offsetX = -allowWidth;
			}
			if(offsetY <= -allowHeight) {
				offsetY = -allowHeight;
			}
			return {
				offsetX: offsetX,
				offsetY: offsetY
			}
		},
		reset: function() {        //重置图片样式
			this.transform = {
				scale: 1,
				deg: 0,
				offsetX: 0,
				offsetY: 0,
				enableTransition: false
			}
		},
		handleActions: function(action, option) {
			if(this.loading) {
				return;
			}

			option = option || {
				zoomRate: 0.2,
				enableTransition: this.transform.enableTransition
			};
			var zoomRate = option.zoomRate;       //缩放的比例
			var transform = this.transform;
			//缩小
			if(action == "zoomOut" && transform.scale > this.minScale) {
				transform.scale = parseFloat((transform.scale - zoomRate).toFixed(3));
			}

			//放大
			if(action == "zoomIn" && transform.scale < this.maxScale) {
				transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
			}

			if(action == "zoomOut" || action == "zoomIn") {
				if(this.alwaysInside) {
					var offset = this.getAlawysInsideOffset(transform.offsetX, transform.offsetY);
					transform.offsetX = offset.offsetX;
					transform.offsetY = offset.offsetY;
				}
			}
			transform.enableTransition = option.enableTransition;
		},
		registerEventListeners: function() {           //注册事件处理器
			var _this = this;
			//滚轮事件
			this._mouseWheelHandler = function(e) {
				_this.zoomPageX = e.pageX;
				_this.zoomPageY = e.pageY;
				if(!_this.scalable) {
					return;
				}
				var delta = e.wheelDelta ? e.wheelDelta : -e.detail;
				if(delta > 0) {
					_this.handleActions("zoomIn", {
						zoomRate: _this.wheelScaleRate,
						enableTransition: false
					})
				} else {
					_this.handleActions("zoomOut", {
						zoomRate: _this.wheelScaleRate,
						enableTransition: false
					})
				}
				e.preventDefault();
			};
			var viewer = this.$refs.viewer;
			viewer.addEventListener(this.mousewheelEventName, this._mouseWheelHandler);
		},
		unregisterEventListeners: function() {        //取消事件处理器
			var viewer = this.$refs.viewer;
			viewer.removeEventListener(this.mousewheelEventName, this._mouseWheelHandler);
			this._keyHandler = null;
			this._mouseWheelHandler = null;
		}

	},
	watch: {
		url: function(val, oldVal) {
			this.$nextTick(function() {
				var $img = this.$refs.img;
				if(!$img.complete) {
					this.loading = true;
				}
			})
			this.reset();
		}
	},
	template: 
    '<div class="tr-image-viewer" :style="viewerStyle" ref="viewer">'+
'		<div class="tr-image-viewer__canvas">'+
'			<img :src="url" :style="imgStyle" '+
'			    class="tr-image-viewer__image"'+
'				@load="handleImgLoad"'+
'				@error="handleImgError"'+
'				@mousedown="handleMouseDown"'+
'				v-if="!error"'+
'				ref="img"/>'+
'			<span v-else>图片加载失败</span>'+
'		</div>'+
'	</div>'
	// `
	// <div class="tr-image-viewer" :style="viewerStyle" ref="viewer">
	// 	<div class="tr-image-viewer__canvas">
	// 		<img :src="url" :style="imgStyle" 
	// 		    class="tr-image-viewer__image"
	// 			@load="handleImgLoad"
	// 			@error="handleImgError"
	// 			@mousedown="handleMouseDown"
	// 			v-if="!error"
	// 			ref="img"/>
	// 		<span v-else>图片加载失败</span>
	// 	</div>
	// </div>
	// `
})

/**
 * 长按事件，可以指定长按多少秒触发
 */
Vue.directive("longpress", {
	bind: function (el, binding, vnode) {
        if (typeof binding.value !== 'function') {
            var compName = vnode.context.name;
            // 将警告传递给控制台
            var warn = "[longpress:] provided expression: " + binding.expression + " is not a function, but has to be ";
            if (compName) { 
                warn += ("Found in component" +  compName)
            }
            console.warn(warn);
        }
        //获取长按时间
        var vm = vnode.context;
        var time = el.getAttribute("longpress-time");
        time = time || 1000;
        //长按定时器
        var pressTimer = null;
        var start = function(e) {
            if(e.type === "click" && e.button !== 0) {
                return;
            }
            if(pressTimer === null) {
                pressTimer = setTimeout(function() {
                    //执行函数
                    handler(e);
                }, time)
            }
        }

        var handler = function(e) {
            binding.value(e);
        }

        var cancel = function(e) {
            if(pressTimer !== null) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        }
        el.addEventListener("mousedown", start);
        el.addEventListener("touchstart", start);

        el.addEventListener("click", cancel);
        el.addEventListener("mouseout", cancel);
        el.addEventListener("touchend", cancel);
        el.addEventListener("touchcancel", cancel);
        
        el.__pressTimer__ = pressTimer;
        el.__pressStart__ = start;
        el.__pressCancel__ = cancel;
    },
	unbind: function(el) {
        var start = el.__pressStart__;
        var cancel = el.__pressCancel__;

        clearTimeout(el.__pressTimer__);
        el.removeEventListener("mousedown", start);
        el.removeEventListener("touchstart", start);

        el.removeEventListener("click", cancel);
        el.removeEventListener("mouseout", cancel);
        el.removeEventListener("touchend", cancel);
        el.removeEventListener("touchcancel", cancel);
        
	}
})

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
				"justify-content": "space-between",
				"flex-wrap": "wrap"
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
	`
	<div :style="containerStyle">
		<div :style="paddingStyle">
			<span v-for="(item,index) in textArray" :key="index">{{item}}</span>
		</div>
	<div>
	`
});





/**
 * 树状下拉框组件,基础组件是element-ui的el-select和el-tree
 */
 Vue.component("table-tree-filter", {
	props: {
		clearable: {
			type: Boolean,
			default: true
		},
		props: {                  //如果是简单数据格式,配置为 {pid: "pid", id: "id", label: "name"}，如果不是简单数据格式，则{children: "children",label: "name"}
			type: Object,
			default: {}
		},
		data: {
			type: Array,
			default: []
		},
		simpleJson: {                            //是否简单数据格式
			type: Boolean,
			default: true
		},
		key: {                                  //树节点的key
			type: String,
			default: "id"
		},
		allowSelect: {                         //是否允许选择函数
			type: Function
		},
		value: {
			type: Object
		},
		selectClass: {
			type: String,
			default: ""
		},
		treeClass: {
			type: String,
			default: ""
		},
		trigger: {               //触发方式,hover,click
			type: String,
			default: "click"
		},
		labelHighLight: {              //是否当有选择筛选条件时，标题高亮显示
			type: Boolean,
			default: true
		},
		isSingle: {              //是否单选
			type: Boolean,
			default: true
		},
        searchable: {             //是否可搜索
            type: Boolean,
            default: false,
        }
	},
	mounted: function() {
		this.initData();
	},
	computed: {
		treeProps: function() {
			var treeProps = {};
			if(this.simpleJson) {
				var treeProps = {
					children: "children",
					label: this.props.label || "name"
				}
			}else {
				//非简单数据格式
				var treeProps = this.props;
			}
			return treeProps;
		},
		idKey: function() {
			return this.key
		},
		selectNodeKey: function() {
			if(this.selectNode == null || this.selectNode[this.idKey]) {
				return null;
			}
			return this.selectNode[this.idKey];
		},
		isDisabled: function() {
			return this.selectDisabeld;
		},
		customSelectClass: function() {
			return this.selectClass + (this.round ? " tr-select-tree--round" : "") + (this.dbclickEdit ? " tr-select-tree__dbclick" : "");
		},
		showCheckbox: function() {
			return !this.isSingle;
		},
        labelKey: function() {
            return this.props.label || "name";
        }

	},
	data: function() {
		return {
			loading: false,
			selectNode: {},            //下拉框当前选中的节点
			optionNode: {},            //当前下拉选项选中的节点，未点确定键
			selectDisabeld: false,          //当前是否不可选择
			treeData: [],
			dropdownVisible: false,          //下拉是否可见
			selectNodes: [],
            search: "",                     //搜索值
		}
	},
	methods: {
		initData: function() {
			//初始化树节点数据
			this.initTreeData();
			if(this.dbclickEdit) {
				this.selectDisabeld = true;
			}
		},
		initTreeData: function() {
			var _this = this;
            this.treeData = this.handleTreeData(this.data);
            _this.initSelectNode();
		},
		handleTreeData: function(data) {                //处理数据
			if(this.simpleJson) {
				return this.jsonTree(data, this.props)
			}
			return data;
		},
		initSelectNode: function() {
			if(this.value != null) {
				if(this.isSingle) {
					this.getNode(this.value);
				}else {
					this.checkNodes(this.value);
				}
				
			}
		},
		/**
		 * 将简单的json转换成树格式
		 */
		jsonTree: function (data,config) {
			var id = config.id || 'id',
				pid = config.pid || 'pid',
				children = config.children || 'children';
			var idMap = [],
				jsonTree = [];
			
			var _data = JSON.parse(JSON.stringify(data));
			_data.forEach(function(v){
				idMap[v[id]] = v;
			});
			_data.forEach(function(v){
				var parent = idMap[v[pid]];
				if(parent) {
					!parent[children] && (parent[children] = []);
					parent[children].push(v);
				} else {
					jsonTree.push(v);
				}
			});
			return jsonTree;
		},
		changeSelectVisible: function(visible) {              //下拉菜单显示隐藏回调
			if(visible) {
				this.optionNode = this.selectNode;
				this.setCurrentNode(this.optionNode);
			}
		},
		changeTreeNode: function(data) {
			this.optionNode = data;

			//选中时，直接改变当前值
			this.confirmValue();
			this.$refs.select.showPopper = false;
		},
		getNode: function(id) {
			if(id == null) {
				this.selectNode = {};
				return;
			}
			this.$nextTick(function() {
				var data = this.$refs.tree.getNode(id);
				if(data != null) {
					this.selectNode = this.copyObject(data.data);
				}else {
					this.selectNode = {};
				}
			});
		},
		setCurrentNode: function(node) {
			if(node == null || node[this.idKey] == null) {
				// console.log("取消高亮");
				this.$refs.tree.setCurrentKey(null);
			}else {
				this.$refs.tree.setCurrentKey(node[this.idKey]);
			}
			
		},
		confirm: function() {                //设置确定
			//判断是否节点可选择
			if(this.allowSelect != null) {
				if(!this.allowSelect(this.optionNode)) {
					return false;
				}
			}
			this.selectNode = this.copyObject(this.optionNode);
			//设置隐藏下拉框
			this.$refs.select.showPopper = false;
		},
		cancel: function() {
			//设置隐藏下拉框
			this.$refs.select.showPopper = false;
		},
		copyObject: function(data) {
			try {
				return JSON.parse(JSON.stringify(data));
			}catch(error) {
				return null;
			}
		},
		handleSelectBlur: function() {
			// if(this.dbclickEdit) {
			// 	this.selectDisabeld = true;
			// }
		},
		isLabelActive: function() {               //判断是否激活标题明亮
			if(!this.labelHighLight) {
				return false;
			}

			if(this.isSingle) {
				return this.value != null
			}
			return this.value != null && this.value.length > 0;
		},
		handlevisibleChange: function(val) {
			this.dropdownVisible = val;
		},
		confirmValue: function() {
			//判断是否节点可选择
			if(this.allowSelect != null) {
				if(!this.allowSelect(this.optionNode)) {
					return false;
				}
			}
			this.selectNode = this.copyObject(this.optionNode);
		},
		handleCheckTreeNode: function(data, checked, indeterminate) {                     //监听勾选树节点
			// console.log(data, checked);
			var nodes = [];
			var dom = this.$refs.tree;
			if(dom) {
				nodes = dom.getCheckedNodes();
			}

			this.selectNodes = nodes;
			console.log(this.selectNodes);
		},
		checkNodes: function(ids) {                   //勾选树节点
			ids = ids || this.value;
			this.$nextTick(function() {
				this.$refs.tree.setCheckedKeys(ids);
			});
		},
        filterNode: function(value, data) {
            if (!value) {
                return true;
            }
            return data[this.labelKey].indexOf(value) !== -1;
        }
	},
	watch: {
		selectNode: function(val) {
			// console.log("selectNode:", val)
			var model = null;
			if(val != null && val[this.idKey] != null) {
				model = val[this.idKey];
			}
			this.$emit("input",model);
			this.$emit("change", model, val);
		},
		selectNodes: function(val) {
			var value = [];
			var _this = this;
			if(val != null) {
				value = val.map(function(el) {
					return el[_this.idKey];
				})
			}

			this.$emit("input", value);
			this.$emit("change", value, val);

		},
		value: function(val) {
			if(this.isSingle) {
				if(this.selectNode[this.idKey] == val) {
					return;
				}
				this.getNode(val);
				return;
			}

			//多选
			this.checkNodes();
		},
		data: function(val) {
            this.initTreeData();
		},
        search: function(val) {
            this.$refs.tree.filter(val);
        }
		
	},
	template: 
    '<div class="table-tree-filter">'+
'		<el-popover'+
'			transition="el-zoom-in-top"'+
'			placement="bottom"'+
'			@show="handlevisibleChange(true)"'+
'			@hide="handlevisibleChange(false)"'+
'			ref="select"'+
'			:trigger="trigger"'+
'            popper-class="table-tree-filter__custom-popper">'+
'			<div class="table-tree-filter__wrapper" slot="reference">'+
'				<div class="table-tree-filter__label" :class="{\'active\': isLabelActive()}">'+
'					<slot></slot>'+
'				</div>'+
'				<div class="table-tree-fliter__icon" :class="{\'active\': dropdownVisible}">'+
'					<i class="el-icon-caret-bottom"></i>'+
'				</div>'+
'			</div>'+
'			<div class="table-tree-filter__popover">'+
'                <div class="table-tree-filter__header" v-if="searchable">'+
'                    <div class="table-tree-filter__search">'+
'                        <input v-model="search" :placeholder="$VI18n(\'搜索\',\'search\')"/>'+
'                    </div>'+
'                </div>'+
'				<div class="table-tree-filter__body">'+
'					<el-scrollbar class="tr-tree-select--scrollbar">'+
'						<el-tree '+
'							:data="treeData" '+
'							:props="treeProps"'+
'							:expand-on-click-node="false"'+
'							class="tr-select--tree"'+
'							:node-key="key"'+
'							ref="tree"'+
'							:default-expand-all="true"'+
'							@current-change="changeTreeNode"'+
'							v-if="isSingle"'+
'                            :filter-node-method="filterNode">'+
'						</el-tree>'+
'						<el-tree '+
'							:data="treeData" '+
'							:props="treeProps"'+
'							:expand-on-click-node="false"'+
'							class="tr-select--tree tr-select--tree__nohighlight"'+
'							:node-key="key"'+
'							ref="tree"'+
'							:show-checkbox="true"'+
'							:check-on-click-node="true"'+
'							:default-expand-all="true"'+
'							@check="handleCheckTreeNode"'+
'							v-if="!isSingle"'+
'                            :filter-node-method="filterNode">'+
'						</el-tree>'+
'					</el-scrollbar>'+
'				</div>'+
'			</div>'+
'		</el-popover>'+
'	</div>'
	// `
	// <div class="table-tree-filter">
	// 	<el-popover
	// 		transition="el-zoom-in-top"
	// 		placement="bottom"
	// 		@show="handlevisibleChange(true)"
	// 		@hide="handlevisibleChange(false)"
	// 		ref="select"
	// 		:trigger="trigger"
    //         popper-class="table-tree-filter__custom-popper">
	// 		<div class="table-tree-filter__wrapper" slot="reference">
	// 			<div class="table-tree-filter__label" :class="{'active': isLabelActive()}">
	// 				<slot></slot>
	// 			</div>
	// 			<div class="table-tree-fliter__icon" :class="{'active': dropdownVisible}">
	// 				<i class="el-icon-caret-bottom"></i>
	// 			</div>
	// 		</div>
	// 		<div class="table-tree-filter__popover">
    //             <div class="table-tree-filter__header" v-if="searchable">
    //                 <div class="table-tree-filter__search">
    //                     <input v-model="search" :placeholder="$VI18n('搜索','search')"/>
    //                 </div>
    //             </div>
	// 			<div class="table-tree-filter__body">
	// 				<el-scrollbar class="tr-tree-select--scrollbar">
	// 					<el-tree 
	// 						:data="treeData" 
	// 						:props="treeProps"
	// 						:expand-on-click-node="false"
	// 						class="tr-select--tree"
	// 						:node-key="key"
	// 						ref="tree"
	// 						:default-expand-all="true"
	// 						@current-change="changeTreeNode"
	// 						v-if="isSingle"
    //                         :filter-node-method="filterNode">
	// 					</el-tree>

	// 					<el-tree 
	// 						:data="treeData" 
	// 						:props="treeProps"
	// 						:expand-on-click-node="false"
	// 						class="tr-select--tree tr-select--tree__nohighlight"
	// 						:node-key="key"
	// 						ref="tree"
	// 						:show-checkbox="true"
	// 						:check-on-click-node="true"
	// 						:default-expand-all="true"
	// 						@check="handleCheckTreeNode"
	// 						v-if="!isSingle"
    //                         :filter-node-method="filterNode">
	// 					</el-tree>
	// 				</el-scrollbar>
	// 			</div>
	// 		</div>
	// 	</el-popover>
	// </div>
	// `
})

/**
 * 表头日期范围选择筛选
 */
 Vue.component("table-date-filter", {
	props: {
		value: {
			type: Array
		},
		labelHighLight: {              //是否当有选择筛选条件时，标题高亮显示
			type: Boolean,
			default: true
		},
		trigger: {               //触发方式,hover,click
			type: String,
			default: "hover"
		},
		"value-format": {
			type: String,
			default: "timestamp"
		},
		format: {
			type: String
		},
		type: {                            //类型
			type: String,
			default: "datetimerange"
		},
		align: {
			type: String,
			default: "center"
		}
	},
	data: function() {
		return {
			dropdownVisible: false,
			dates: [],                //选择的日期
		}
	},
	created: function() {
	},
	mounted: function() {
		this.initData();
	},
	methods: {
		initData: function() {
			this.dates = this.value;
		},
		handlePopoverShow: function() {
			this.dropdownVisible = true;
			this.$refs.picker.pickerVisible = true;
		},
		handlePopoverHide: function() {
			this.dropdownVisible = false;
			// this.$refs.picker.pickerVisible = false;
		},
		isLabelActive: function() {               //判断是否激活标题明亮
			if(!this.labelHighLight) {
				return false;
			}
			return this.value != null && this.value.length > 0;
		},
		changeDate: function(dates) {
			this.$emit("input", dates);
			this.$emit("change", dates);
		}
	},
	watch: {
		value: function(val) {
			this.dates = val;
		}
	},
	template: 
	`
	<div class="table-date-filter">
		<el-popover
			popper-class="table-date-filter__popover"
			@show="handlePopoverShow"
			@hide="handlePopoverHide"
			:trigger="trigger">
			<div class="table-date-filter__title" slot="reference">
				<div class="table-date-filter__label" :class="{'active': isLabelActive()}">
					<slot></slot>
				</div>
				<div class="table-date-filter__icon" :class="{'active': dropdownVisible}">
					<i class="el-icon-caret-bottom"></i>
				</div>

				<div class="table-date-filter__picker-wrapper">
					<el-date-picker
						:type="type"
						ref="picker"
						v-model="dates"
						@change="changeDate"
						:align="align"
						:value-format="valueFormat"
						:format="format"
						class="table-date-filter__picker">
					</el-date-picker>
				</div>
			</div>
		</el-popover>
	</div>
	`
})


