/**
 * 工位系统菜单下的 报修管理
 */

 var messages = {
    "zh-CN": {
        head: "能耗分析",
        all: "全选",
        cancel: "取消",
        confirm: "确定",
        time: "时间",
        tips: "提示",
        place: "地点",
        allText: "全部",
        type: "类型",
        year: "年",
        month: "月",
        day: "日",
        dialog: {
            h1: "区域：",
            h2: "选择时间：",
            h3: "选择日期：",
            h4: "总能耗",
            h5: "导出",
            h6: "类型",
            h7: "占比(%)",
            h8: "环比(%)",
            h9: "能耗同比",
            h10: "今日电量",
            h11: "昨日用电量",
            h12: "日电量",
            h13: "日用电量",
            h14: "今个月电量",
            h15: "上个月用电量",
            h16: "月电量",
            h17: "月用电量",
            h18: "今年电量",
            h19: "上一年用电量",
            h20: "年电量",
            h21: "年用电量",
        },
        placeholder: {
            h1: "获取图表数据失败",
            h2: "获取失败",
        },
        dateFormat: "yyyy年MM月dd日",
    },
    "en-US": {
        head: "Energy Analysis",
        all: "Select All",
        cancel: "Cancel",
        confirm: "OK",
        time: "time",
        tips: "Tips",
        place: "Location",
        allText: "All",
        type: "Type",
        year: "year",
        month: "month",
        day: "Day",
        dialog: {
            h1: "Region:",
            h2: "Select time:",
            h3: "Select date:",
            h4: "Total energy consumption",
            h5: "Export",
            h6: "Type",
            h7: "Proportion (%)",
            h8: "Ratio(%)",
            h9: "Comparison of energy consumption",
            h10: "Today's battery",
            h11: "Yesterday's electricity consumption",
            h12: "Daily Electricity",
            h13: "Daily electricity consumption",
            h14: "Battery this month",
            h15: "Power consumption last month",
            h16: "Monthly Power",
            h17: "Monthly electricity consumption",
            h18: "Power this year",
            h19: "Power consumption last year",
            h20: "Annual Power",
            h21: "Annual electricity consumption",
        },
        placeholder: {
            h1: "Failed to get chart data",
            h2: "Failed to get",
        },
        dateFormat: "yyyy-MM-dd",
    },
}

$i18n.init(messages);