/**
 * 工位系统菜单下的 报修管理
 */

 var messages = {
    "zh-CN": {
        head: "报修管理",
        all: "全选",
        delSelected: '删除选中',
        adoptSelected: "通过选中",
        rejectSelected: "驳回选中",
        refuseSelected: "拒绝选中",
        cancel: "取消",
        confirm: "确定",
        time: "时间",
        tips: "提示",
        place: "地点",
        allText: "全部",
        view: "查看",
        adopt: "通过",
        reject: "驳回",
        delete: "删除",
        status: "状态",
        add: "新增报修",
        complete: "完成",
        type: "类型",
        year: "年",
        month: "月",
        desc: "描述",
        day: "天",
        one: "一",
        edit: "编辑",
        page: {
            next: '下一页',
            t1: '跳至',
            t2: '页',
            ok: '确定',
            home: "首页",
            tail: "尾页",
        },
        table: {
            h1: "编号",
            h2: "报修类型",
            h3: "地点",
            h4: "设备名称",
            h5: "类型",
            h6: "报修人",
            h7: "用时时长",
            h8: "进度",
            h9: "读取情况",
            h10: "操作",
            h11: "故障描述"
        },
        total: {
            h1: "待完成",
            h2: "已完成",
            h3: "总报修",
            h4: "类型",
            h5: "品牌"
        },
        typeMapping: {
            1: '工位预约',
            2: '工位更换',
            3: '工位延长',
        },
        statuses: {
            0: '未审批',
            1: '已通过',
            2: '已驳回',
            '-1': '已过期',
        },
        statusMapping: {
            '-1': '已过期',
            0: '未审批',
            1: '已通过',
            2: '已驳回',
        },
        processMap: {
            1: '未分配',
            2: '已分配',
            3: '处理中',
            4: '已完成',
            8: '已撤销',
        },
        updateStatusMap: {
            1: "未分配",
            2: "已分配",
            3: "处理中",
            4: "已完成",
        },
        readMap: {
            1: '未读',
            "2,3,4,8": "已读",
        },
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
        statusMap: {
            "1": {name: "未分配", color: "#30AFE1"},
            "2": {name: "已分配", color: "#FF5D5D"},
            "3": {name: "处理中", color: "#E65775"},
            "4": {name: "已完成", color: "#27CC7D"},
            "8": {name: "已撤销", color: "#BDBDBD"},
        },
        typeArray: [{id: 1, name: '桌椅'}, {id: 2, name: '网络'}, {id: 3, name: '设备'}],
        typeMap: {1: '桌椅', 2: '网络', 3: '设备'},
        success: {
            h1: "分配成功",
            h2: "保存为厂家模板成功",
            h3: "保存厂家模板失败",
            h4: "更新成功",
            h5: "更新失败",
            h6: "编辑成功",
            h7: "新增成功",
            h8: "删除成功",
            h9: "获取报修信息失败，请关闭后重试",
            h10: "获取部门区域列表失败",
            h11: "(已失效)",
            h12: "区域",
            h13: "获取工位列表失败",
            h14: "获取图表数据失败",
        },
        dialog: {
            h1: "报修类型",
            h2: "等级",
            h3: "名称",
            h4: "类型",
            h5: "品牌",
            h6: "上门时间",
            h7: "图片/视频",
            h8: "手机号码",
            h9: "上报时间",
            h10: "完成状态",
            h11: "未处理",
            h12: "处理中",
            h13: "已完成",
            h14: "完成时间",
            h15: "资产名称",
            h16: "唯一码",
            h17: "自动生成",
            h18: "资产IP",
            h19: "资产端口",
            h20: "资产类型",
            h21: "所属地点",
            h22: "清空",
            h23: "修改地点",
            h24: "安装位置",
            h25: "报废年限",
            h26: "检修周期",
            h27: "否",
            h28: "是",
            h29: "供应商",
            h30: "联系人",
            h31: "厂家",
            h32: "选择已有的厂家模板",
            h33: "保存为厂家模板",
            h34: "型号",
            h35: "电话",
            h36: "购买日期",
            h37: "备注",
            h38: "重新生成二维码",
            h39: "打印二维码",
            h40: "二维码",
            h41: "厂家信息",
            h42: "供应商信息",
            h43: "资产信息",
            h44: "控制资产",
        },
        format: {
            h1: "确定操作?",
            h2: "开始日期",
            h3: "结束日期",
            h4: "请先选中{params}",
            h5: "是否确定删除?",
            h6: "名称不能为空",
            h7: "唯一码不能为空",
            h8: "唯一码应由6位数字组成",
            h9: "请选择资产类型",
            h10: "请选择控制资产",
            h11: "描述不能为空",
        },
        placeholder: {
            h1: "请输入类型",
            h2: "请输入品牌",
            h3: "请输入地点名称",
            h4: "请输入报修人",
            h5: "请输入内容",
            h6: "请输入手机号码",
            h7: "请输入设备名称",
            h8: "请选择类型",
            h9: "搜索相关内容",
            h10: "无",
            h11: "选择日期",
            h12: "请选择报修类型",
            h13: "请选中要分配的人员/部门",
            h14: "请填写品牌",
            h15: "请选择地点",
            h16: "请输入报修类型名称",
            h17: "请选择报修等级",
            h18: "请选择名称",
            h19: "选择上门时间",
            h20: "请输入资产名称",
            h21: "请输入唯一码",
            h22: "请输入资产端口",
            h23: "请输入资产IP",
            h24: "请选择",
            h25: "请输入安装位置",
            h26: "请输入供应商名称",
            h27: "请输入联系人",
            h28: "请输入供应商电话",
            h29: "请输入型号",
            h30: "请输入厂家",
            h31: "请输入厂家电话",
            h32: "请输入报废年限（单位年）",
            h33: "请输入检修周期（单位天）",
            h34: "请选择报修进度",
        },
        viewDialog: {
            name: "操 作",
            h2: "{params1}修改了描述：{params2}",
        },
        form: {
            name: "地　　点",
            h1: "工位编号",
            h2: "照片/视频",
            h3: "报修人",
            h4: "用时时长",
            h5: "上报时间",
            h6: "描　　述",
            h7: "手机号码",
        },
        addForm: {
            h1: "部门区域",
            h2: "工位",
            h3: "报修类型",
            h4: "描述",
            h5: "图片/视频",
            h6: "报修人",
        },
        process: {
            name: "编 辑",
            h1: "进　　度",
            h2: "上报",
            h3: "已分配",
            h4: "已撤销",
            h5: "处理中",
            h6: "已完成",
            h7: "地　　点",
            h8: "名　　称",
            h9: "照片/视频",
            h10: "无",
            h11: "报修人",
            h12: "用时时长",
            h13: "上报时间",
            h14: "手机号码",
            h15: "描　　述",
            h16: "分配工单",
            h17: "维修结果",
            h18: "已解决",
            h19: "未解决",
            h20: "反馈附件",
            h21: "维修反馈",
            h22: "报修详情",
            h23: "修改了描述：",
            h24: "打印",
            h25: "视频预览",
            h26: "状态：",
            h27: "上报时间：",
            h28: "完成时间：",
            h29: "基本信息",
            h30: "编号：",
            h31: "报修类型：",
            h32: "上门时间：",
            h33: "故障描述：",
            h34: "维修负责人：",
            h35: "分配部门：",
            h36: "照片/视频：",
            h37: "设备信息",
            h38: "设备名称：",
            h39: "设备类型：",
            h40: "报修反馈",
            h41: "维修结果：",
            h42: "成功",
            h43: "失败",
            h44: "描述：",
            h45: "用时：",
            h46: "评价",
            h47: "评分：",
            h48: "评语：",
            h49: "报修等级：",
        },
        previewDialog: {
            h1: "视频预览"
        },
        templateDialog: {
            name: "信息模板选择",
            h1: "品牌：",
            h2: "厂家：",
            h3: "购买日期：",
            h4: "备注：",
            h5: "型号：",
            h6: "电话：",
        },
        menu: {
            h1: "查看",
            h2: "编辑",
            h3: "删除",
        },
        timeUnit: {
            m: "分钟",
            h: "小时",
            d: "天",
        },
        chart: {
            t1: "报修率",
            u1: "日",
        },

        p16: "报修人",
        p47: "完成时间",
        p88: "维修结果",
        p108: "上报时间：",
        p113: "故障描述：",
        p121: "成功",
        p122: "失败",

        p159: "工单编号",
        p160: "完成状态",
        p161: "故障地点",
        p162: "故障等级",
        p163: "报修设备",
        p164: "视频/照片",
        p165: "维修人/部门",
        p166: "派单方式",
        p167: "派单时间",
        p168: "接单时间",
        p169: "维修描述",
        p170: "发起人评价",
        p171: "完成评价",
        p172: "打印时间：",
        p173: "报维修单",
        p174: "设备类型",
        printPreview: "打印预览",
        assignTypeMap: {
            1: "手动派单",
            2: "自动派单"
        },
    },
    "en-US": {
        head: "Repair Management",
        all: "Select All",
        delSelected: 'Delete selected',
        adoptSelected: "Selected by",
        rejectSelected: "Reject selected",
        refuseSelected: "Refuse to select",
        cancel: "Cancel",
        confirm: "OK",
        time: "time",
        tips: "Tips",
        place: "Location",
        allText: "All",
        view: "View",
        adopt: "pass",
        reject: "reject",
        delete: "Delete",
        status: "Status",
        add: "Add repair report",
        complete: "Complete",
        type: "Type",
        year: "year",
        month: "month",
        desc: "description",
        day: "day",
        one: "One",
        edit: "Edit",
        page: {
            next: 'Next page',
            t1: 'jump to',
            t2: 'page',
            ok: 'OK',
            home: "Home",
            tail: "Last page",
        },
        table: {
            h1: "Number",
            h2: "Repair Type",
            h3: "Location",
            h4: "device name",
            h5: "Type",
            h6: "Reporter",
            h7: "Time duration",
            h8: "Progress",
            h9: "Read condition",
            h10: "Operation",
            h11: "Fault description"
        },
        total: {
            h1: "to be completed",
            h2: "Completed",
            h3: "General repair report",
            h4: "Type",
            h5: "brand"
        },
        typeMapping: {
            1: 'Station reservation',
            2: 'Station replacement',
            3: 'Station extension',
        },
        statuses: {
            0: 'Not Approved',
            1: 'passed',
            2: 'rejected',
            '-1': 'Expired',
        },
        statusMapping: {
            '-1': 'Expired',
            0: 'Not Approved',
            1: 'passed',
            2: 'rejected',
        },
        processMap: {
            1: 'Not assigned',
            2: 'Assigned',
            3: 'Processing',
            4: 'Completed',
            8: 'Revoked',
        },
        updateStatusMap: {
            1: "Not assigned",
            2: "Assigned",
            3: "Processing",
            4: "Completed",
        },
        readMap: {
            1: 'Unread',
            "2,3,4,8": "Read",
        },
        levels: [
            {level: 1, name: 'minor'},
            {level: 2, name: 'critical'},
            {level: 3, name: 'urgent'},
        ],
        levelMapping: {
            1: 'slight',
            2: 'severe',
            3: 'emergency',
        },
        statusMap: {
            "1": {name: "Unassigned", color: "#30AFE1"},
            "2": {name: "Assigned", color: "#FF5D5D"},
            "3": {name: "Processing", color: "#E65775"},
            "4": {name: "Completed", color: "#27CC7D"},
            "8": {name: "Revoked", color: "#BDBDBD"},
        },
        typeArray: [{id: 1, name: 'desk and chair'}, {id: 2, name: 'network'}, {id: 3, name: 'device'}],
        typeMap: {1: 'tables and chairs', 2: 'network', 3: 'equipment'},
        success: {
            h1: "Allocation succeeded",
            h2: "Save as factory template successfully",
            h3: "Failed to save factory template",
            h4: "Update successful",
            h5: "Update failed",
            h6: "Edited successfully",
            h7: "Added successfully",
            h8: "Delete successful",
            h9: "Failed to obtain repair information, please close and try again",
            h10: "Failed to get department area list",
            h11: "(Expired)",
            h12: "region",
            h13: "Failed to get station list",
            h14: "Failed to get chart data",
        },
        dialog: {
            h1: "Repair Type",
            h2: "level",
            h3: "name",
            h4: "Type",
            h5: "brand",
            h6: "Home time",
            h7: "Picture/Video",
            h8: "Mobile number",
            h9: "Report time",
            h10: "Completed Status",
            h11: "unhandled",
            h12: "Processing",
            h13: "Completed",
            h14: "Completion time",
            h15: "Asset Name",
            h16: "Unique code",
            h17: "Auto generated",
            h18: "Asset IP",
            h19: "Asset Port",
            h20: "Asset Type",
            h21: "Location",
            h22: "Empty",
            h23: "Modify location",
            h24: "Installation location",
            h25: "Scrap period",
            h26: "Overhaul cycle",
            h27: "No",
            h28: "Yes",
            h29: "Supplier",
            h30: "Contact",
            h31: "Manufacturer",
            h32: "Select an existing manufacturer template",
            h33: "Save as factory template",
            h34: "Model",
            h35: "Phone",
            h36: "Purchase Date",
            h37: "Remarks",
            h38: "Regenerate QR code",
            h39: "Print QR code",
            h40: "QR code",
            h41: "Manufacturer information",
            h42: "Supplier Information",
            h43: "Asset Information",
            h44: "Control assets",
        },
        format: {
            h1: "Are you sure?",
            h2: "Start Date",
            h3: "End Date",
            h4: "Please select {params} first",
            h5: "Are you sure you want to delete?",
            h6: "Name cannot be empty",
            h7: "Unique code cannot be empty",
            h8: "The unique code should consist of 6 digits",
            h9: "Please select an asset type",
            h10: "Please select a control asset",
            h11: "Description cannot be empty",
        },
        placeholder: {
            h1: "Please enter a type",
            h2: "Please enter the brand",
            h3: "Please enter a location name",
            h4: "Please enter the repairer",
            h5: "Please enter content",
            h6: "Please enter your mobile number",
            h7: "Please enter the device name",
            h8: "Please select a type",
            h9: "Search related content",
            h10: "none",
            h11: "Select date",
            h12: "Please select the repair type",
            h13: "Please select the person/department to be assigned",
            h14: "Please fill in the brand",
            h15: "Please select a location",
            h16: "Please enter the repair type name",
            h17: "Please select the repair level",
            h18: "Please select a name",
            h19: "Choose the time of arrival",
            h20: "Please enter the asset name",
            h21: "Please enter a unique code",
            h22: "Please enter the asset port",
            h23: "Please enter the asset IP",
            h24: "Please select",
            h25: "Please enter the installation location",
            h26: "Please enter the supplier name",
            h27: "Please enter a contact",
            h28: "Please enter supplier phone number",
            h29: "Please enter the model number",
            h30: "Please enter the manufacturer",
            h31: "Please enter the manufacturer's phone number",
            h32: "Please enter the retirement period (unit year)",
            h33: "Please enter the maintenance cycle (unit day)",
            h34: "Please select the repair progress",
        },
        viewDialog: {
            name: "operation",
            h2: "{params1} modified the description: {params2}",
        },
        form: {
            name: "Location",
            h1: "Station number",
            h2: "Photo/Video",
            h3: "reporter",
            h4: "Time duration",
            h5: "Report time",
            h6: "Description",
            h7: "Mobile number",
        },
        addForm: {
            h1: "Department Area",
            h2: "Station",
            h3: "Repair Type",
            h4: "Description",
            h5: "Picture/Video",
            h6: "Reporter",
        },
        process: {
            name: "Edit",
            h1: "Progress",
            h2: "Report",
            h3: "Allocated",
            h4: "Revoked",
            h5: "Processing",
            h6: "Completed",
            h7: "Location",
            h8: "Name",
            h9: "Photo/Video",
            h10: "none",
            h11: "Reporter",
            h12: "Time duration",
            h13: "Report time",
            h14: "Mobile number",
            h15: "Description",
            h16: "Assign work order",
            h17: "Repair Result",
            h18: "resolved",
            h19: "unresolved",
            h20: "Feedback Attachment",
            h21: "Maintenance Feedback",
            h22: "Repair details",
            h23: "Modified description:",
            h24: "print",
            h25: "Video preview",
            h26: "Status:",
            h27: "Report time:",
            h28: "Completion time:",
            h29: "Basic Information",
            h30: "Number:",
            h31: "Repair type:",
            h32: "Home time:",
            h33: "Fault description:",
            h34: "Maintenance person in charge:",
            h35: "Assignment department:",
            h36: "Photo/Video:",
            h37: "Device Information",
            h38: "Device name:",
            h39: "Device type:",
            h40: "Repair feedback",
            h41: "Repair result:",
            h42: "Success",
            h43: "Failure",
            h44: "Description:",
            h45: "Time:",
            h46: "Evaluation",
            h47: "rating:",
            h48: "Comment:",
            h49: "Repair level:",
        },
        previewDialog: {
            h1: "Video preview"
        },
        templateDialog: {
            name: "Information template selection",
            h1: "Brand:",
            h2: "Manufacturer:",
            h3: "Purchase Date:",
            h4: "Remarks:",
            h5: "Model:",
            h6: "Phone:",
        },
        menu: {
            h1: "View",
            h2: "Edit",
            h3: "delete",
        },
        timeUnit: {
            m: "minutes",
            h: "hour",
            d: "day",
        },
        chart: {
            t1: "Repair rate",
            u1: "",
        },

        p16: "Reporter",
        p47: "Completion time",
        p88: "Repair Results",
        p108: "Report time:",
        p113: "Fault description:",
        p121: "Success",
        p122: "Failure",

        p159: "Order number",
        p160: "Completed Status",
        p161: "Fault location",
        p162: "Repair level",
        p163: "Repair equipment",
        p164: "Video/Photo",
        p165: "Maintenance Person/Department",
        p166: "Order dispatch method",
        p167: "Delivery time",
        p168: "Order Time",
        p169: "Repair Description",
        p170: "Initiator Evaluation",
        p171: "Complete the evaluation",
        p172: "Print time:",
        p173: "Report for maintenance",
        p174: "Device Type",
        printPreview: "Print Preview",
        assignTypeMap: {
            1: "Manual dispatch",
            2: "Auto dispatch"
        },
    },
}

$i18n.init(messages);