var ws = null;
var global_callback = null;
var wsType = 'ws';
var typemap = {};
var lockReconnect = false; //是否真正建立连接
var timeout = 20 * 1000; //20秒一次心跳
var timeoutObj = null; //心跳心跳倒计时
var serverTimeoutObj = null; //心跳倒计时
var timeoutnum = null; // 断开重连倒计时

var initDebounce = debounce(function (e) {
  wsMessage(e);
}, 800);

function getWebIP() { // ip地址
  var path = window.location.href,
    pathName = window.location.pathname,
    pos = path.indexOf(pathName);
    curIp = path.substring(0, pos);
  return curIp;
}

function uuid() { // uuid
  var id = window.location.href.split('uuid=')[1];
  return id || 'admin';
}

function serverPort() { // 端口
  return '8084'
}

function serverUrl() { // 端口
  var url = _config.server.url;
  var newUrl = url.indexOf("http") == -1 ? getWebIP() : url;
  var baseUrl = newUrl.replace('http', 'ws');
  var wsurl = baseUrl + '/websocket/eastcato/' + uuid();
  return wsurl;
}

function initWebSocket() {
  var wsurl = serverUrl();
  ws = new WebSocket(wsurl); // 初始webSocket

  ws.onopen = function () { // 连接
    wsOpen();
  }
  ws.onmessage = function (e) { // 接收
    var data = JSON.parse(e.data);
    if (e.data.type == 'offline') {
      console.log(e.data);
    }
    // console.log("%c" + '接收' + ":", "color: green;font-size:15px", data);
    var _debounce = typemap[data.type]
    if (!_debounce) {
      _debounce = debounce(function (e) {
        wsMessage(e);
      }, 1000);
      typemap[data.type] = _debounce
    }

    _debounce(e);
    //收到服务器信息，心跳重置
    // reset();
  }
  ws.onclose = function (e) { // 关闭
    wsClose(e);
  }
  ws.onerror = function () {
    reconnect();
    console.log("%c" + '连接错误' + ":" + serverUrl(), "color: red;font-size:15px");
  }
}

function wsOpen(e) {
  //开启心跳
  // start();
  console.log("%c" + '连接成功' + ":" + serverUrl(), "color: green;font-size:15px");
}

// 数据接收
function wsMessage(e) {
  // if (!global_callback) return;
  global_callback(JSON.parse(e.data))
}

// 发送数据
function wsSend(agentData) {
  ws.send(JSON.stringify(agentData));
}

// 链接关闭
function wsClose(e) {
  reconnect();
  console.log("%c" + '连接断开' + ":", "color: red;font-size:15px", e.code);
}

function reconnect() {
  //重新连接
  if (lockReconnect) {
    return;
  }
  lockReconnect = true;
  //没连接上会一直重连，设置延迟避免请求过多
  timeoutnum && clearTimeout(timeoutnum);
  timeoutnum = setTimeout(function () {
    //新连接
    initWebSocket();
    lockReconnect = false;
  }, timeout);
}

function reset() {
  //重置心跳
  //清除时间
  clearTimeout(timeoutObj);
  clearTimeout(serverTimeoutObj);
  //重启心跳
  start();
}

function start() {
  //开启心跳
  timeoutObj && clearTimeout(timeoutObj);
  serverTimeoutObj && clearTimeout(serverTimeoutObj);
  timeoutObj = setTimeout(function () {
    //这里发送一个心跳，后端收到后，返回一个心跳消息
    if (ws.readyState == 1) {
      //如果连接正常
    } else {
      //否则重连
      reconnect();
    }
    serverTimeoutObj = setTimeout(function () {
      //超时关闭
      ws.close();
    }, timeout);
  }, timeout);
}

// 调用
function sendSock(agentData, callback) {
  global_callback = callback;
  if (ws.readyState === ws.OPEN) {
    wsSend(agentData)
  } else if (ws.readyState === ws.CONNECTING) {
    setTimeout(function () {
      sendSock(agentData, callback);
    }, 1000)
  } else {
    setTimeout(function () {
      sendSock(agentData, callback)
    })
  }
}

/**
 * 函数防抖，能够避免同一操作在短时间内连续进行
 */
function debounce(callback, delay) {
  var timer = null; //定时器
  delay = delay || 300; //默认300毫秒
  return function () {
    if (timer != null) {
      clearTimeout(timer);
    }
    var context = this;
    var args = arguments;
    timer = setTimeout(function () {
      timer = null;
      callback.apply(context, args);
    }, delay)
  }
}

initWebSocket();

window.socketApi = {
  sendSock: sendSock,
  uuid: uuid
}