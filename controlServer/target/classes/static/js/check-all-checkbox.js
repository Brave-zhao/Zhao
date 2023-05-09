/**
 * 可全选复选框
 */
Vue.component("check-all-checkbox", {
	props: {
		label: {                //复选框文本
			type: String,
			default: "全选"
		},
		data: {             //绑定的列表，根据列表中的每个对象字段进行判断是否全选
			type: Array,
			default: function() {
				return [];
			}
		},
		checkedKey: {          //对象中是否选中的键名
			type: String,
			default: "checked"
		},
		size: {
			type: String,
			default: "small"
		}
	},
	data: function() {
		return {
			checked: false,             //是否勾选
			isIndeterminate: false,
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
			this.getCheckedStatus();
		},
		getCheckedStatus: function() {               //获取选中状态
			var length = this.getCheckedLength();
			this.isIndeterminate = length > 0 && length < this.data.length;
			this.checked = length > 0 && length >= this.data.length;
		},
		getCheckedLength: function() {             //获取已勾选个数
			var length = 0;
			for(var i=0; i<this.data.length; i++) {
				var el = this.data[i];
				if(typeof el == "boolean" && el === true) {           //boolean类型
					length ++;
					continue;
				}

				//对象，则解析里面的checkedKey
				if(el[this.checkedKey] === true) {
					length ++;
				}
			}
			return length;
		},
		handleCheckAllChange: function(val) {         //处理选中全部或者取消选中全部事件
			this.isIndeterminate = false;
			this.checkAllData(val)
			this.$emit("check-all", val);
		},
		checkAllData: function(checked) {
			for(var i=0; i<this.data.length; i++) {
				var el = this.data[i];
				if(typeof el == "boolean") {           //boolean类型
					el = checked;
					continue;
				}

				//对象，则解析里面的checkedKey
				this.$set(el, this.checkedKey, checked)
			}
		}
	},
	watch: {
		data: {
			deep: true,
			handler: function(val) {
				this.getCheckedStatus();
			}
		}
	},
	template: 
	'<el-checkbox '+
'				v-model="checked" '+
'				:size="size" '+
'				:disabled="data.length <= 0"'+
'				@change="handleCheckAllChange"'+
'				:indeterminate="isIndeterminate">'+
'				<slot>{{label}}</slot>'+
'				</el-checkbox>'
		// `
		// 	<el-checkbox 
		// 		v-model="checked" 
		// 		:size="size" 
		// 		:disabled="data.length <= 0"
		// 		@change="handleCheckAllChange"
		// 		:indeterminate="isIndeterminate">
		// 		<slot>{{label}}</slot>
		// 		</el-checkbox>
		// `
})