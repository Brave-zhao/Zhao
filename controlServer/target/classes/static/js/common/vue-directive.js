/**
 * vue自定义指令
 */
var $directive = {
    /**
     * el-scrollbar滚动到底部加载更多指令,放在el-scrollbar或它的父级上
     * 例如：v-loadmore="function"
     */
    loadmore : {
        bind: function(el, binding) {
            // 获取element-ui定义好的scroll盒子
            var SELECTWRAP_DOM = el.querySelector(
                '.el-scrollbar__wrap'
            )
            SELECTWRAP_DOM.addEventListener('scroll', function() {
                /**
                 * scrollHeight 获取元素内容高度(只读)
                 * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
                 * clientHeight 读取元素的可见高度(只读)
                 * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
                 * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
                 */
                var condition =
                    this.scrollHeight - this.scrollTop <= (this.clientHeight + 1) // 添加1px的允许误差
                if (condition) {
                    binding.value();
                }
            })
        }
    }
}