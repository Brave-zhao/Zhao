/**
 * 班牌树
 */
Vue.component("brand-tree", {
	props: {
		data: {
			type: Array,
			default: function() {
				return [];
			}
		},
		props: {
			type: Object,
			default: function() {
				return {
					label: "name",
					value: "id",
					checked: "checked"
				}
			}
		}
	},
	data: function() {
		return {
			collapse: false,              //是否折叠
		}
	},
	computed: {
		valueKey: function() {
			return this.props.value || "id";
		},
		labelKey: function() {
			return this.props.label || "name";
		},
		checkedKey: function() {
			return this.props.checked || "checked";
		}
	},
	created: function() {
	},
	mounted: function() {
		this.initData();
	},
	methods: {
		initData: function() {
			//初始化数据
			this.resetData();
		},
		resetData: function() {
			var _this = this;
			this.data.forEach(function(el) {
				if(el[_this.checkedKey]) {
					return;
				}

				_this.$set(el, _this.checkedKey, false);
			})
		},
		collapseList: function() {              //折叠班牌列表
			this.collapse = !this.collapse;
		},
		unfold: function() {                   //展开
			this.collapse = false;
		},
		fold: function() {               //折叠
			this.collapse = true;
		}
	},
	watch: {
		data: function(val) {
			this.resetData();
		}
	},
	template: 
	'<div class="brand-tree">'+
'		<div class="brand-tree__title">'+
'			<div class="brand-tree__caret cr-primary" :class="{collapse: collapse}" @click="collapseList">'+
'				<i class="el-icon-caret-bottom"></i>'+
'			</div>'+
'			<check-all-checkbox :data="data" :checked-key="checkedKey">'+
'				<slot name="title">所有班牌</slot>'+
'			</check-all-checkbox>'+
'		</div>'+
'		<transition name="el-zoom-in-top">'+
'		<div class="brand-tree__list" v-show="!collapse">'+
'			<div class="brand-tree__row" v-for="brand in data" :key="brand[valueKey]">'+
'				<el-checkbox v-model="brand[checkedKey]">'+
'					<slot>{{brand[labelKey]}}</slot>'+
'				</el-checkbox>'+
'			</div>'+
'		</div>'+
'		</transition>'+
'	</div>'
	// `
	// <div class="brand-tree">
	// 	<div class="brand-tree__title">
	// 		<div class="brand-tree__caret cr-primary" :class="{collapse: collapse}" @click="collapseList">
	// 			<i class="el-icon-caret-bottom"></i>
	// 		</div>

	// 		<check-all-checkbox :data="data" :checked-key="checkedKey">
	// 			<slot name="title">所有班牌</slot>
	// 		</check-all-checkbox>
	// 	</div>
	// 	<transition name="el-zoom-in-top">
	// 	<div class="brand-tree__list" v-show="!collapse">
	// 		<div class="brand-tree__row" v-for="brand in data" :key="brand[valueKey]">
	// 			<el-checkbox v-model="brand[checkedKey]">
	// 				<slot>{{brand[labelKey]}}</slot>
	// 			</el-checkbox>
	// 		</div>
	// 	</div>
	// 	</transition>
	// </div>
	// `
})