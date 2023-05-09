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
			default: "5rem"
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
	template: 
	'<el-dialog '+
'		center'+
'		:visible.sync="show"'+
'		class="tr-dialog"'+
'		:width="width"'+
'		:top="top"'+
'		@open="open"'+
'		@close="close"'+
'		@opened="opened"'+
'		@closed="closed"'+
'		:close-on-click-modal="closeOnClickModal"'+
'		:modal="modal">'+
'		<div slot="title" class="el-dialog__title">'+
'			<slot name="title">{{title}}</slot>'+
'		</div>'+
'		<div class="tr-dialog__body" :class="{\'tr-dialog__body--center\': center}" :style="bodyStyle">'+
'			<slot></slot>'+
'		</div>'+
'		<button class="tr-dialog__footer-btn" v-if="!withCancel" @click="confirm">'+
'			{{confirmText}}'+
'		</button>'+
'		<div class="tr-dialog__footer-wrapper" v-else>'+
'			<el-button size="small" @click="cancel">{{cancelText}}</el-button>'+
'			<el-button type="primary" size="small" @click="confirm">{{confirmText}}</el-button>'+
'		</div>'+
'	</el-dialog>'
	// `
	// <el-dialog 
	// 	center
	// 	:visible.sync="show"
	// 	class="tr-dialog"
	// 	:width="width"
	// 	:top="top"
	// 	@open="open"
	// 	@close="close"
	// 	@opened="opened"
	// 	@closed="closed"
	// 	:close-on-click-modal="closeOnClickModal"
	// 	:modal="modal">
	// 	<div slot="title" class="el-dialog__title">
	// 		<slot name="title">{{title}}</slot>
	// 	</div>
	// 	<div class="tr-dialog__body" :class="{'tr-dialog__body--center': center}" :style="bodyStyle">
	// 		<slot></slot>
	// 	</div>
	// 	<button class="tr-dialog__footer-btn" v-if="!withCancel" @click="confirm">
	// 		{{confirmText}}
	// 	</button>

	// 	<div class="tr-dialog__footer-wrapper" v-else>
	// 		<el-button size="small" @click="cancel">{{cancelText}}</el-button>
	// 		<el-button type="primary" size="small" @click="confirm">{{confirmText}}</el-button>
	// 	</div>
	// </el-dialog>
	// `
})