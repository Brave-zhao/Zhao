/****************************
 * 防抖动
 * @author  ilongli
 * @date    2021年4月21日10:55:04
 * @example
 * var debounce = new Debounce(1000);
 * debounce.execute(() => { //do something });
 ****************************/
function Debounce(delay) {

    var timer = null;

    this.execute = function (fn) {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn, delay);
    }

}
