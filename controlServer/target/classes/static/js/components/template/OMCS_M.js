var OMCSMessageType = {
    LoginOmcs: 1,
    LoginOmcsResult: 2,
    LogoutOmcs: 3,
    SetMultimediaManagerParameters: 4,
    MultimediaDeviceDisconnectEvent: 5,
    MultimediaManagerConnectionInterruptedEvent: 6,
    MultimediaManagerConnectionRebuildSucceedEvent: 7,
    MultimediaManagerAudioCaptured: 8,
    CloseConnection: 10,
    DeviceIsWorking: 11,
    DeviceIsWorkingResult: 12,
    DisconnectGuest: 13,
    DisconnectGuest2: 14,
    GetGuests: 15,
    GetGuestsResult: 16,
    IsUserOnline: 17,
    IsUserOnlineResult: 18,
    ConnectCamera: 30,
    ConnectCameraResult: 31,
    DisconnectCamera: 32,
    NewVideoFrameReceived: 33,
    SetCameraParameters: 34,
    CameraVideoSizeChanged: 35,
    CameraOwnerOutputChanged: 36,
    CameraConnectorDisconnectEvent: 37,
    ConnectMicrophone: 20,
    ConnectMicrophoneResult: 21,
    DisconnectMicrophone: 22,
    MuteMicrophone: 23,
    MicrophonOwnerOutputChanged: 24,
    MicrophonConnectorDisconnectEvent: 25,
    SetMicrophoneParameters: 26,
    ConnectDesktop: 40,
    ConnectDesktopResult: 41,
    DisconnectDesktop: 42,
    NewDesktopFrameReceived: 43,
    SetDesktopParameters: 44,
    DesktopVideoSizeChanged: 45,
    DesktopOwnerOutputChanged: 46,
    DesktopConnectorDisconnectEvent: 47,
    SendMouseMove: 48,
    SendKeyOperation: 49,
    SendMouseOperation: 50,
    ConnectWhiteBoardConnector: 60,
    ConnectWhiteBoardConnectorResult: 61,
    DisconnectWhiteBoardConnector: 62,
    NewWhiteBoardConnectorFrame: 63,
    WhiteBoardConnectorDisconnectEvent: 64,
    WhiteBoardVideoSizeChanged: 65,
    SetWhiteBoardParameters: 66,
    ConnectorAutoReconnectStart: 100,
    ConnectorAutoReconnectFailed: 101,
    ConnectorAutoReconnectSucceed: 102,
    JoinChatGroup: 103,
    ExitChatGroup: 104,
    ChatGroupSomeoneJoin: 105,
    ChatGroupSomeoneExit: 106,
    ChatGroupMemberIDs: 107
};
var MultimediaDeviceType = {Camera: 0, Microphone: 1, Desktop: 2, WhiteBoard: 3, ShortMessage: 4};
var ConnectResult = {
    Succeed: 0,
    Timeout: 1,
    TargetUserOffline: 2,
    DeviceInvalid: 3,
    OwnerNotInitialized: 4,
    ExceptionOccured: 5,
    SelfOffline: 6,
    ChannelUnavailable: 7,
    CantConnectRepeatly: 8,
    DeviceUnauthorized: 9,
    DeviceInUsing: 10,
    OwnerReject: 11
};
let omcsutil = {
    inherits: function (ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        })
    }, deepClone: function (obj) {
        let newObj = Array.isArray(obj) ? [] : {};
        if (obj && typeof obj === "object") {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    newObj[key] = (obj && typeof obj[key] === 'object') ? omcsutil.deepClone(obj[key]) : obj[key]
                }
            }
        }
        return newObj
    }
};

function messageReceived(messageType, msg) {
    // console.log("messageReceived:", messageType, msg);
    if (messageType == OMCSMessageType.LoginOmcsResult) {
        let baseResult = JSON.parse(msg);
        if (baseResult.ResultCode == 0) {
            GlobalUtil.multimediaManager.Available = true
        }
        this.onBaseResultReceived("登录OMCS", baseResult);
        return
    }
    if (messageType == OMCSMessageType.ConnectCameraResult) {
        let baseResult = JSON.parse(msg);
        this.onBaseResultReceived("连接" + baseResult.OwnerID + "摄像头:", baseResult);
        return
    }
    if (messageType == OMCSMessageType.ConnectMicrophoneResult) {
        let baseResult = JSON.parse(msg);
        this.onBaseResultReceived("连接" + baseResult.OwnerID + "麦克风:", baseResult);
        return
    }
    if (messageType == OMCSMessageType.ConnectDesktopResult) {
        let baseResult = JSON.parse(msg);
        this.onBaseResultReceived("连接" + baseResult.OwnerID + "远程桌面:", baseResult);
        return
    }
    if (messageType == OMCSMessageType.ConnectWhiteBoardConnectorResult) {
        let baseResult = JSON.parse(msg);
        this.onBaseResultReceived("连接" + baseResult.OwnerID + "电子白板:", baseResult);
        return
    }
    if (messageType == OMCSMessageType.ConnectorAutoReconnectSucceed) {
        let contract = JSON.parse(msg);
        console.log(contract.MultimediaDeviceType + "连接器重连成功，OwnerID：" + contract.OwnerID);
        return
    }
    if (messageType == OMCSMessageType.ConnectorAutoReconnectStart) {
        let contract = JSON.parse(msg);
        console.log(contract.MultimediaDeviceType + "连接器开始重连，OwnerID：" + contract.OwnerID);
        return
    }
    if (messageType == OMCSMessageType.ConnectorAutoReconnectFailed) {
        let contract = JSON.parse(msg);
        console.log(contract.MultimediaDeviceType + "连接器重连失败，OwnerID：" + contract.OwnerID + "  原因：" + contract.ConnectResult);
        return
    }
    if (messageType == OMCSMessageType.MultimediaDeviceDisconnectEvent) {
        let disconnectEventContract = JSON.parse(msg);
        GlobalUtil.multimediaManager.GetGuests(disconnectEventContract.MultimediaDeviceType);
        if ('function' !== typeof GlobalUtil.multimediaManager.DeviceDisconnected) {
            return
        }
        GlobalUtil.multimediaManager.DeviceDisconnected(disconnectEventContract.GuestID, disconnectEventContract.MultimediaDeviceType);
        return
    }
    if (messageType == OMCSMessageType.MultimediaManagerConnectionInterruptedEvent) {
        let serverIEP = JSON.parse(msg);
        GlobalUtil.multimediaManager.Available = false;
        console.log("本地多媒体已断开与服务器的连接 serverIEP：", serverIEP);
        if ('function' !== typeof GlobalUtil.multimediaManager.ConnectionInterrupted) {
            return
        }
        GlobalUtil.multimediaManager.ConnectionInterrupted(serverIEP);
        return
    }
    if (messageType == OMCSMessageType.MultimediaManagerConnectionRebuildSucceedEvent) {
        let serverIEP = JSON.parse(msg);
        GlobalUtil.multimediaManager.Available = true;
        console.log("本地多媒体重连成功 serverIEP：", serverIEP);
        if ('function' !== typeof GlobalUtil.multimediaManager.ConnectionRebuildSucceed) {
            return
        }
        GlobalUtil.multimediaManager.ConnectionRebuildSucceed(serverIEP);
        return
    }
    if (messageType == OMCSMessageType.MultimediaManagerAudioCaptured) {
        let data = JSON.parse(msg);
        if ('function' !== typeof GlobalUtil.multimediaManager.AudioCaptured) {
            return
        }
        GlobalUtil.multimediaManager.AudioCaptured(data);
        return
    }
    if (messageType == OMCSMessageType.ChatGroupSomeoneJoin) {
        let memberID = msg;
        if (GlobalUtil.multimediaManager.ChatGroup != null) {
            GlobalUtil.multimediaManager.ChatGroup.OtherMemberIDs.push(memberID)
        }
        if ('function' !== typeof GlobalUtil.multimediaManager.ChatGroupSomeoneJoin) {
            return
        }
        GlobalUtil.multimediaManager.ChatGroupSomeoneJoin(memberID);
        if (GlobalUtil.multimediaManager.ChatGroup != null && 'function' !== typeof GlobalUtil.multimediaManager.ChatGroup.SomeoneJoin) {
            return
        }
        GlobalUtil.multimediaManager.ChatGroup.SomeoneJoin(memberID);
        return
    }
    if (messageType == OMCSMessageType.ChatGroupSomeoneExit) {
        let memberID = msg;
        if (GlobalUtil.multimediaManager.ChatGroup != null) {
            var index = GlobalUtil.multimediaManager.ChatGroup.OtherMemberIDs.indexOf(memberID);
            GlobalUtil.multimediaManager.ChatGroup.OtherMemberIDs.splice(index, 1)
        }
        if ('function' !== typeof GlobalUtil.multimediaManager.ChatGroupSomeoneExit) {
            return
        }
        GlobalUtil.multimediaManager.ChatGroupSomeoneExit(memberID);
        if (GlobalUtil.multimediaManager.ChatGroup != null && 'function' !== typeof GlobalUtil.multimediaManager.ChatGroup.SomeoneExit) {
            return
        }
        GlobalUtil.multimediaManager.ChatGroup.SomeoneExit(memberID);
        return
    }
    if (messageType == OMCSMessageType.ChatGroupMemberIDs) {
        let data = JSON.parse(msg);
        var chatGroup = new ChatGroup();
        chatGroup.CurrentMemberID = data.CurrentMemberID;
        chatGroup.OtherMemberIDs = data.OtherMemberIDs;
        chatGroup.GroupID = data.GroupID;
        GlobalUtil.multimediaManager.ChatGroup = chatGroup;
        return
    }
    if (messageType == OMCSMessageType.GetGuestsResult) {
        let data = JSON.parse(msg);
        let deviceType = GlobalUtil.multimediaManager.deviceType;
        GlobalUtil.multimediaManager.Guests[deviceType] = data;
        GlobalUtil.multimediaManager.deviceType = -1;
        // 通知guest在线状态发生了改变
        if ('function' !== typeof GlobalUtil.multimediaManager.GuestsUpdate) {
            return
        }
        GlobalUtil.multimediaManager.GuestsUpdate(GlobalUtil.multimediaManager.Guests);
        return;
    }
};

function onBaseResultReceived(action, baseResult) {
    let tips = "";
    if (baseResult.ResultCode == 0) {
        tips = action + "成功"
    } else {
        tips = action + "失败：" + baseResult.FailCause
    }
    console.log(tips)
};

function getGuestHandle() {
    var manager = GlobalUtil.multimediaManager;
    var queue = manager.getGuestsQueue || [];

    if (queue.length === 0 && manager.getGuestInterval) {
        // 如果队列已经是空了，停止定时器
        clearInterval(manager.getGuestInterval);
        manager.getGuestInterval = null;
        return;
    }

    console.log("getGuestHandle:", manager.getGuestRetryCount, manager.deviceType);

    // 超时，reset，让给队列下一个任务执行
    if (manager.getGuestRetryCount > 100) {
        manager.getGuestRetryCount = 0;
        manager.deviceType = -1;
    }

    // 判断是否能拿到锁
    if (manager.deviceType !== -1) return;

    // 从队列中取出，执行任务
    var deviceType = queue.shift();
    // send
    manager.DoGetGuests(deviceType);
}

function MultimediaManager() {
    var self = this;
    EventEmitter.call(this);
    this.deviceType = -1;
    this.getGuestRetryCount = 0;
    this.getGuestsQueue = [];
    this.getGuestInterval = null;
    this.Guests = {};
    this.GuestsUpdate = function (guests) {
        self.emit('guestsUpdate', guests);
    };
    this.websocket = null;
    this.isSocketClosed = true;
    this.Available = false;
    this.OmcsLogPath = "";
    this.SecurityLogEnabled = false;
    this.CameraVideoWidth = 640;
    this.CameraVideoHeight = 480;
    this.MaxCameraFrameRate = 10;
    this.CameraEncodeQuality = 10;
    this.OutputVideo = true;
    this.ChannelMode = 1;
    this.OutputAudio = true;
    this.MicrophoneDeviceIndex = 0;
    this.SpeakerIndex = 0;
    this.CameraDeviceIndex = 0;
    this.AutoReconnect = false;
    this.ChatGroup = null;
    this.DesktopIndex = 0;
    this.DesktopZoomCoef = 1;
    this.OutputDesktop = true;
    this.DesktopX = null;
    this.DesktopY = null;
    this.DesktopWidth = null;
    this.DesktopHeight = null;
    this.DesktopEncodeQuality = 10;
    this.SetOmcsLogPath = function (value) {
        self.OmcsLogPath = value;
        self.setMultimediaManagerParameters(JSON.stringify({OmcsLogPath: self.OmcsLogPath}))
    };
    this.SetSecurityLogEnabled = function (value) {
        self.SecurityLogEnabled = value;
        self.setMultimediaManagerParameters(JSON.stringify({SecurityLogEnabled: self.SecurityLogEnabled}))
    };
    this.SetCameraVideoSize = function (width, height) {
        self.CameraVideoWidth = width;
        self.CameraVideoHeight = height;
        self.setMultimediaManagerParameters(JSON.stringify({
            CameraVideoWidth: self.CameraVideoWidth,
            CameraVideoHeight: self.CameraVideoHeight
        }))
    };
    this.SetMaxCameraFrameRate = function (value) {
        self.MaxCameraFrameRate = value;
        self.setMultimediaManagerParameters(JSON.stringify({MaxCameraFrameRate: self.MaxCameraFrameRate}))
    };
    this.SetCameraEncodeQuality = function (value) {
        self.CameraEncodeQuality = value;
        self.setMultimediaManagerParameters(JSON.stringify({CameraEncodeQuality: self.CameraEncodeQuality}))
    };
    this.SetOutputVideo = function (value) {
        self.OutputVideo = value;
        self.setMultimediaManagerParameters(JSON.stringify({OutputVideo: self.OutputVideo}))
    };
    this.SetOutputAudio = function (value) {
        self.OutputAudio = value;
        self.setMultimediaManagerParameters(JSON.stringify({OutputAudio: self.OutputAudio}))
    };
    this.SetChannelMode = function (value) {
        self.ChannelMode = value;
        self.setMultimediaManagerParameters(JSON.stringify({ChannelMode: self.ChannelMode}))
    };
    this.SetMicrophoneDeviceIndex = function (value) {
        self.MicrophoneDeviceIndex = value;
        self.setMultimediaManagerParameters(JSON.stringify({MicrophoneDeviceIndex: self.MicrophoneDeviceIndex}))
    };
    this.SetSpeakerIndex = function (value) {
        self.SpeakerIndex = value;
        self.setMultimediaManagerParameters(JSON.stringify({SpeakerIndex: self.SpeakerIndex}))
    };
    this.SetCameraDeviceIndex = function (value) {
        self.CameraDeviceIndex = value;
        self.setMultimediaManagerParameters(JSON.stringify({CameraDeviceIndex: self.CameraDeviceIndex}))
    };
    this.SetDesktopIndex = function (index) {
        self.DesktopIndex = index;
        self.setMultimediaManagerParameters(JSON.stringify({DesktopIndex: self.DesktopIndex}))
    };
    this.SetDesktopZoomCoef = function (value) {
        self.DesktopZoomCoef = value;
        self.setMultimediaManagerParameters(JSON.stringify({DesktopZoomCoef: self.DesktopZoomCoef}))
    };
    this.SetOutputDesktop = function (value) {
        self.OutputDesktop = value;
        self.setMultimediaManagerParameters(JSON.stringify({OutputDesktop: self.OutputDesktop}))
    };
    this.SetDesktopEncodeQuality = function (value) {
        self.DesktopEncodeQuality = value;
        self.setMultimediaManagerParameters(JSON.stringify({DesktopEncodeQuality: self.DesktopEncodeQuality}))
    };
    this.SetDesktopRegion = function (x, y, width, height) {
        self.DesktopX = x;
        self.DesktopY = y;
        self.DesktopWidth = width;
        self.DesktopHeight = height;
        self.setMultimediaManagerParameters(JSON.stringify({
            DesktopWidth: self.DesktopWidth,
            DesktopHeight: self.DesktopHeight,
            DesktopX: self.DesktopX,
            DesktopY: self.DesktopY
        }))
    };
    this.SetAutoReconnect = function (value) {
        self.AutoReconnect = value
    };
    this.setMultimediaManagerParameters = function (msg) {
        if (self.isSocketClosed) return;
        self.sendMessage(OMCSMessageType.SetMultimediaManagerParameters, msg)
    };
    this.Connected = function () {
        return !self.isSocketClosed
    };
    this.AudioPlayed = null;
    this.AudioCaptured = null;
    this.ConnectionInterrupted = null;
    this.ConnectionRebuildSucceed = null;
    this.DeviceConnected = null;
    this.DeviceDisconnected = null;
    this.ConnectorDisconnected = null;
    this.DeviceErrorOccurred = null;
    this.ChatGroupSomeoneJoin = null;
    this.ChatGroupSomeoneExit = null;
    this.ChangeCameraDeviceAsyn = function (deviceIndex) {
    };
    this.DeviceIsWorking = function (deviceType) {
    };
    this.DisconnectGuest = function (notifyGuest) {
    };
    this.DisconnectGuest2 = function (guestID, deviceType, notifyGuest) {
    };
    this.GetGuests = function (deviceType) {
        this.getGuestsQueue.push(deviceType);
        if (this.getGuestInterval === null) {
            this.getGuestInterval = setInterval(getGuestHandle, 250);
        }
    };
    this.DoGetGuests = function (deviceType) {
        self.getGuestRetryCount = 0;
        self.deviceType = deviceType;
        self.sendMessage(OMCSMessageType.GetGuests, deviceType);
    };
    this.IsUserOnline = function (userID) {
    };
    this.JoinChatGroup = function (groupID) {
        self.sendMessage(OMCSMessageType.JoinChatGroup, groupID)
    };
    this.ExitChatGroup = function (groupID) {
        self.sendMessage(OMCSMessageType.ExitChatGroup, groupID)
    };
    this.connection = function (serverIP, serverPort) {
        console.log("connection!!!");
        if (!self.isSocketClosed) {
            return
        }
        let host = "ws://127.0.0.1:9910/";
        self.websocket = new WebSocket(host);
        try {
            self.websocket.onopen = function (msg) {
                console.log("连接OMCS插件成功！");
                self.isSocketClosed = false
            };
            self.websocket.addEventListener('open', function () {
                self.emit('open')
            });
            self.websocket.onmessage = function (res) {
                if (typeof res.data == "string") {
                    let msg = res.data;
                    msg = msg.substring(0, msg.length - 1);
                    let messageType = -1;
                    let strs = msg.split('$');
                    if (strs.length > 1) {
                        messageType = parseInt(strs[0]);
                        msg = strs[1]
                    }
                    messageReceived(messageType, msg);
                    self.emit('messageReceived', messageType, msg)
                } else {
                    self.emit('error', "接收到非文本消息")
                }
            };
            self.websocket.onerror = function (error) {
                console.log("连接omcs插件出错，请检查是否安装OMCS插件 或 插件是否开启", error);
                self.emit('connectOmcsServiceError', error)
            };
            self.websocket.onclose = function (event) {
                self.isSocketClosed = true;
                self.Available = false;
                console.log("webSocket连接关闭", event);
                self.emit('close', event)
            }
        } catch (ex) {
            console.log(ex)
        }
    };
    this.Initialize = function (userID, password, serverIP, serverPort) {
        let logonOMCSContract = {
            userID: userID,
            password: password,
            serverIP: serverIP,
            serverPort: serverPort,
            MaxLengthOfUserID: GlobalUtil.maxLengthOfUserID,
            CameraDeviceIndex: self.CameraDeviceIndex,
            CameraVideoWidth: self.CameraVideoWidth,
            CameraVideoHeight: self.CameraVideoHeight,
            CameraEncodeQuality: self.CameraEncodeQuality,
            MaxCameraFrameRate: self.MaxCameraFrameRate,
            ChannelMode: self.ChannelMode,
            MicrophoneDeviceIndex: self.MicrophoneDeviceIndex,
            SpeakerIndex: self.SpeakerIndex,
            OutputAudio: self.OutputAudio,
            OutputVideo: self.OutputVideo,
            OmcsLogPath: self.OmcsLogPath,
            SecurityLogEnabled: self.SecurityLogEnabled,
            AutoReconnect: self.AutoReconnect,
            DesktopIndex: self.DesktopIndex,
            DesktopZoomCoef: self.DesktopZoomCoef,
            OutputDesktop: self.OutputDesktop,
            DesktopEncodeQuality: self.DesktopEncodeQuality,
            DesktopX: self.DesktopX,
            DesktopY: self.DesktopY,
            DesktopWidth: self.DesktopWidth,
            DesktopHeight: self.DesktopHeight,
        };
        let msg = JSON.stringify(logonOMCSContract);
        self.sendMessage(OMCSMessageType.LoginOmcs, msg)
    };
    this.IsP2PChannelExist = function (destUserID) {
    };
    this.sendMessage = function (messageType, msg) {
        if (self.websocket == undefined) {
            console.log("socket为空，发送失败");
            return
        }
        if (self.isSocketClosed) {
            console.log("socket连接已断开，发送失败");
            return
        }
        let data = messageType + '$' + msg + "\0";
        self.websocket.send(data)
    };
    this.connection()
};

function DynamicCameraConnector() {
    var self = this;
    this._VideoWidth = 640;
    this._VideoHeight = 480;
    this._AutoReconnect = false;
    this._DisplayVideoParameters = false;
    this._OwnerOutput = true;
    this._Connected = false;
    this._OwnerID = "";
    this._Viewer = null;
    this.multimediaManager = null;
    this.NewFrameReceived = null;
    this.Disconnected = null;
    this.ConnectEnded = null;
    this.AutoReconnectStart = null;
    this.AutoReconnectFailed = null;
    this.AutoReconnectSucceed = null;
    this.OwnerOutputChanged = null;
    this.GetAutoReconnect = function () {
        return self._AutoReconnect
    };
    this.GetVideoWidth = function () {
        return self._VideoWidth
    };
    this.GetVideoHeight = function () {
        return self._VideoHeight
    };
    this.GetOwnerOutput = function () {
        return self._OwnerOutput
    };
    this.GetConnected = function () {
        return self._Connected
    };
    this.GetOwnerID = function () {
        return self._OwnerID
    };
    this.SetViewer = function (viewer) {
        self._Viewer = viewer;
        self._Viewer.width = self._VideoWidth;
        self._Viewer.height = self._VideoHeight;
        self.ctx = viewer.getContext("2d");
        console.log("SetViewer", self._VideoWidth, self._VideoHeight)
    };
    this.SetAutoReconnect = function (value) {
        self._AutoReconnect = value;
        self.SetCameraParameters(JSON.stringify({OwnerID: self._OwnerID, AutoReconnect: self._AutoReconnect}))
    };
    this.SetOwnerCameraVideoSize = function (videoWidth, videoHeight) {
        console.log("SetOwnerCameraVideoSize", videoWidth, videoHeight);
        self._VideoWidth = videoWidth;
        self._VideoHeight = videoHeight;
        self.SetCameraParameters(JSON.stringify({
            OwnerID: self._OwnerID,
            CameraVideoWidth: self._VideoWidth,
            CameraVideoHeight: self._VideoHeight
        }))
    };
    this.SetOwnerOutput = function (value) {
        self._OwnerOutput = value;
        self.SetCameraParameters(JSON.stringify({OwnerID: self._OwnerID, OwnerOutput: self._OwnerOutput}))
    };
    this.SetDisplayVideoParameters = function (value) {
        self._DisplayVideoParameters = value;
        self.SetCameraParameters(JSON.stringify({
            OwnerID: self._OwnerID,
            DisplayVideoParameters: self._DisplayVideoParameters
        }))
    };
    this.SetCameraParameters = function (msg) {
        if (!self._Connected) return;
        self.multimediaManager.sendMessage(OMCSMessageType.SetCameraParameters, msg)
    };
    this.BeginConnect = function (destUserID) {
        if (self.multimediaManager == undefined) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.ConnectCamera, destUserID);
        self._OwnerID = destUserID
    };
    this.Disconnect = function () {
        if (self.multimediaManager == undefined) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.DisconnectCamera, self._OwnerID);
        self._Connected = false
    };
    this.Dispose = function () {
        self = null
    };
    this.ctx = null;
    this.SetMultimediaManager = function (_multimediaManager) {
        self.multimediaManager = _multimediaManager;
        self.multimediaManager.addListener('messageReceived', function (messageType, msg) {
            if (messageType < 0) {
                return
            }
            if (messageType == OMCSMessageType.ConnectCameraResult) {
                var baseResult = JSON.parse(msg);
                if (baseResult.OwnerID !== self._OwnerID) {
                    return
                }
                if (baseResult.ResultCode == 0) {
                    self._Connected = true;
                    self.SetOwnerOutput(self._OwnerOutput);
                    self.SetDisplayVideoParameters(self._DisplayVideoParameters);
                    self.SetAutoReconnect(self._AutoReconnect)
                }
                if (self.ConnectEnded == undefined || self.ConnectEnded == null) {
                    return
                }
                self.ConnectEnded(self._OwnerID, baseResult);
                return
            }
            if (messageType == OMCSMessageType.CameraConnectorDisconnectEvent) {
                var connectorDisconnectEventContract = JSON.parse(msg);
                if (connectorDisconnectEventContract.OwnerID !== self._OwnerID) {
                    return
                }
                if (self.Disconnected == undefined || self.Disconnected == null) {
                    return
                }
                self.Disconnected(connectorDisconnectEventContract.OwnerID, connectorDisconnectEventContract.ConnectorDisconnectedType);
                return
            }
            if (messageType == OMCSMessageType.NewVideoFrameReceived) {
                if (!self._Connected) {
                    return
                }
                let data = JSON.parse(msg);
                if (data.OwnerID !== self._OwnerID) {
                    return
                }
                if (self._Viewer !== undefined && self._Viewer !== null) {
                    var imggg = new Image();
                    imggg.src = "data:image/jpg;base64," + data.Base64;
                    imggg.onload = function () {
                        self.ctx.drawImage(imggg, 0, 0, imggg.width, imggg.height)
                    }
                }
                if (self.NewFrameReceived !== undefined && self.NewFrameReceived !== null) {
                    self.NewFrameReceived(data.OwnerID, "data:image/jpg;base64," + data.Base64)
                }
                return
            }
            if (messageType == OMCSMessageType.CameraVideoSizeChanged) {
                let changedContract = JSON.parse(msg);
                if (changedContract.OwnerID !== self._OwnerID) {
                    return
                }
                console.log("CameraVideoSizeChanged", changedContract.VideoWidth, changedContract.VideoHeight);
                self._VideoWidth = changedContract.VideoWidth;
                self._VideoHeight = changedContract.VideoHeight;
                self._Viewer.width = self._VideoWidth;
                self._Viewer.height = self._VideoHeight;
                return
            }
            if (messageType == OMCSMessageType.CameraOwnerOutputChanged) {
                let changedContract = JSON.parse(msg);
                if (changedContract.OwnerID !== self._OwnerID) {
                    return
                }
                self._OwnerOutput = changedContract.OwnerOutput;
                if (self.OwnerOutputChanged !== undefined && self.OwnerOutputChanged !== null) {
                    self.OwnerOutputChanged(self._OwnerID, changedContract.OwnerOutput)
                }
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectStart && self.AutoReconnectStart != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Camera) {
                    return
                }
                self.AutoReconnectStart(self._OwnerID);
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectSucceed && self.AutoReconnectSucceed != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Camera) {
                    return
                }
                self.AutoReconnectSucceed(self._OwnerID);
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectFailed && self.AutoReconnectFailed != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Camera) {
                    return
                }
                self.AutoReconnectFailed(self._OwnerID, contract.ConnectResult);
                return
            }
        })
    };
    this.SetMultimediaManager(GlobalUtil.multimediaManager)
};

function MicrophoneConnector() {
    var self = this;
    this._AutoReconnect = false;
    this._Mute = false;
    this._OwnerOutput = true;
    this._Connected = false;
    this._OwnerID = "";
    this.multimediaManager = null;
    this.Disconnected = null;
    this.ConnectEnded = null;
    this.AutoReconnectStart = null;
    this.AutoReconnectFailed = null;
    this.AutoReconnectSucceed = null;
    this.OwnerOutputChanged = null;
    this.GetMute = function () {
        return self._Mute
    };
    this.SetMute = function (isMute) {
        if (self.multimediaManager == undefined) {
            return
        }
        self._Mute = isMute;
        self.SetMicrophoneParameters(JSON.stringify({OwnerID: self._OwnerID, Mute: self._Mute}))
    };
    this.GetOwnerOutput = function () {
        return self._OwnerOutput
    };
    this.GetConnected = function () {
        return self._Connected
    };
    this.GetOwnerID = function () {
        return self._OwnerID
    };
    this.GetAutoReconnect = function () {
        return self._AutoReconnect
    };
    this.SetAutoReconnect = function (value) {
        self._AutoReconnect = value;
        self.SetMicrophoneParameters(JSON.stringify({OwnerID: self._OwnerID, AutoReconnect: self._AutoReconnect}))
    };
    this.SetMicrophoneParameters = function (msg) {
        if (!self._Connected) return;
        self.multimediaManager.sendMessage(OMCSMessageType.SetMicrophoneParameters, msg)
    };
    this.BeginConnect = function (destUserID) {
        if (self.multimediaManager == undefined) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.ConnectMicrophone, destUserID);
        self._OwnerID = destUserID
    };
    this.Disconnect = function () {
        if (self.multimediaManager == undefined) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.DisconnectMicrophone, self._OwnerID);
        self._Connected = false
    };
    this.Dispose = function () {
        self = null
    };
    this.SetMultimediaManager = function (_multimediaManager) {
        self.multimediaManager = _multimediaManager;
        self.multimediaManager.addListener('messageReceived', function (messageType, msg) {
            if (messageType < 0) {
                return
            }
            if (messageType == OMCSMessageType.ConnectMicrophoneResult) {
                var baseResult = JSON.parse(msg);
                if (baseResult.OwnerID !== self._OwnerID) {
                    return
                }
                if (baseResult.ResultCode == 0) {
                    self._Connected = true;
                    self.SetAutoReconnect(self._AutoReconnect);
                    self.SetMute(self._Mute)
                }
                if (self.ConnectEnded == undefined || self.ConnectEnded == null) {
                    return
                }
                self.ConnectEnded(self._OwnerID, baseResult);
                return
            }
            if (messageType == OMCSMessageType.MicrophonConnectorDisconnectEvent) {
                var disconnectEventContract = JSON.parse(msg);
                if (disconnectEventContract.OwnerID !== self._OwnerID) {
                    return
                }
                if (self.Disconnected == undefined || self.Disconnected == null) {
                    return
                }
                self.Disconnected(self._OwnerID, disconnectEventContract.ConnectorDisconnectedType);
                return
            }
            if (messageType == OMCSMessageType.MicrophonOwnerOutputChanged) {
                let changedContract = JSON.parse(msg);
                if (changedContract.OwnerID !== self._OwnerID) {
                    return
                }
                self._OwnerOutput = changedContract.OwnerOutput;
                if (self.OwnerOutputChanged !== undefined && self.OwnerOutputChanged !== null) {
                    self.OwnerOutputChanged(self._OwnerID, changedContract.OwnerOutput)
                }
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectStart && self.AutoReconnectStart != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Microphone) {
                    return
                }
                self.AutoReconnectStart(self._OwnerID);
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectSucceed && self.AutoReconnectSucceed != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Microphone) {
                    return
                }
                self.AutoReconnectSucceed(self._OwnerID);
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectFailed && self.AutoReconnectFailed != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Microphone) {
                    return
                }
                self.AutoReconnectFailed(self._OwnerID, contract.ConnectResult);
                return
            }
        })
    };
    this.SetMultimediaManager(GlobalUtil.multimediaManager)
};

function DynamicDesktopConnector() {
    var self = this;
    this._AutoReconnect = false;
    this._VideoWidth = 0;
    this._VideoHeight = 0;
    this._OwnerOutput = true;
    this._Connected = false;
    this._OwnerID = "";
    this._Viewer = null;
    this._DisplayVideoParameters = false;
    this._WatchingOnly = true;
    this._ShowMouseCursor = true;
    this.multimediaManager = null;
    this.NewFrameReceived = null;
    this.Disconnected = null;
    this.ConnectEnded = null;
    this.AutoReconnectStart = null;
    this.AutoReconnectFailed = null;
    this.AutoReconnectSucceed = null;
    this.OwnerOutputChanged = null;
    this.ScaleRatioX = 1;
    this.ScaleRatioY = 1;
    this.SetScaleRatio = function (ratioX, ratioY) {
        this.ScaleRatioX = ratioX;
        this.ScaleRatioY = ratioY;
    };
    this.GetVideoWidth = function () {
        return self._VideoWidth
    };
    this.GetVideoHeight = function () {
        return self._VideoHeight
    };
    this.GetOwnerOutput = function () {
        return self._OwnerOutput
    };
    this.GetConnected = function () {
        return self._Connected
    };
    this.GetOwnerID = function () {
        return self._OwnerID
    };
    this.SetViewer = function (viewer) {
        self._Viewer = viewer;
        self._Viewer.width = self._VideoWidth;
        self._Viewer.height = self._VideoHeight;
        self.ctx = viewer.getContext("2d");
        self.caozuo()
    };
    this.GetAutoReconnect = function () {
        return self._AutoReconnect
    };
    this.SetAutoReconnect = function (value) {
        self._AutoReconnect = value;
        self.SetDesktopParameters(JSON.stringify({OwnerID: self._OwnerID, AutoReconnect: self._AutoReconnect}))
    };
    this.SetWatchingOnly = function (value) {
        self._WatchingOnly = value;
        self.SetDesktopParameters(JSON.stringify({OwnerID: self._OwnerID, WatchingOnly: self._WatchingOnly}))
    };
    this.SetShowMouseCursor = function (value) {
        self._ShowMouseCursor = value;
        self.SetDesktopParameters(JSON.stringify({OwnerID: self._OwnerID, ShowMouseCursor: self._ShowMouseCursor}))
    };
    this.SetOwnerOutput = function (value) {
        self._OwnerOutput = value;
        self.SetDesktopParameters(JSON.stringify({OwnerID: self._OwnerID, OwnerOutput: self._OwnerOutput}))
    };
    this.SetDisplayVideoParameters = function (value) {
        self._OwnerOutput = value;
        self.SetDesktopParameters(JSON.stringify({
            OwnerID: self._OwnerID,
            DisplayVideoParameters: self._DisplayVideoParameters
        }))
    };
    this.SetDesktopParameters = function (msg) {
        if (!self._Connected) return;
        self.multimediaManager.sendMessage(OMCSMessageType.SetDesktopParameters, msg)
    };
    this.BeginConnect = function (destUserID) {
        if (self.multimediaManager == undefined) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.ConnectDesktop, destUserID);
        self._OwnerID = destUserID
    };
    this.Disconnect = function () {
        if (self.multimediaManager == undefined) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.DisconnectDesktop, self._OwnerID);
        self._Connected = false
    };
    this.SendKeyOperation = function (keyValue, down) {
        let contract = {OwnerID: self._OwnerID, KeyValue: keyValue, Down: down};
        if (self.multimediaManager == undefined || self._WatchingOnly) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.SendKeyOperation, JSON.stringify(contract))
    };
    this.SendMouseOperation = function (x, y, leftButton, down) {
        x =  Math.floor(x * this.ScaleRatioX);
        y =  Math.floor(y * this.ScaleRatioY);
        console.log(x,y,leftButton, down);
        let contract = {OwnerID: self._OwnerID, X: x, Y: y, LeftButton: leftButton, Down: down};
        if (self.multimediaManager == undefined || self._WatchingOnly) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.SendMouseOperation, JSON.stringify(contract))
    };
    this.SendMouseMove = function (x, y) {
        x =  Math.floor(x * this.ScaleRatioX);
        y =  Math.floor(y * this.ScaleRatioY);
        let contract = {OwnerID: self._OwnerID, X: x, Y: y};
        if (self.multimediaManager == undefined || self._WatchingOnly) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.SendMouseMove, JSON.stringify(contract))
    };
    this.Dispose = function () {
        self = null
    };
    this.ctx = null;
    this.SetMultimediaManager = function (_multimediaManager) {
        self.multimediaManager = _multimediaManager;
        self.multimediaManager.addListener('messageReceived', function (messageType, msg) {
            if (messageType < 0) {
                return
            }
            if (messageType == OMCSMessageType.ConnectDesktopResult) {
                var baseResult = JSON.parse(msg);
                if (baseResult.OwnerID !== self._OwnerID) {
                    return
                }
                if (baseResult.ResultCode == 0) {
                    self._Connected = true;
                    self.SetWatchingOnly(self._WatchingOnly);
                    self.SetShowMouseCursor(self._ShowMouseCursor);
                    self.SetOwnerOutput(self._OwnerOutput);
                    self.SetDisplayVideoParameters(self._DisplayVideoParameters);
                    self.SetAutoReconnect(self._AutoReconnect)
                }
                if (self.ConnectEnded == undefined || self.ConnectEnded == null) {
                    return
                }
                self.ConnectEnded(self._OwnerID, baseResult);
                return
            }
            if (messageType == OMCSMessageType.DesktopConnectorDisconnectEvent) {
                var disconnectEventContract = JSON.parse(msg);
                if (disconnectEventContract.OwnerID !== self._OwnerID) {
                    return
                }
                if (self.Disconnected == undefined || self.Disconnected == null) {
                    return
                }
                self.Disconnected(self._OwnerID, disconnectEventContract.ConnectorDisconnectedType);
                return
            }
            if (messageType == OMCSMessageType.NewDesktopFrameReceived) {
                if (!self._Connected) {
                    return
                }
                let data = JSON.parse(msg);
                if (data.OwnerID !== self._OwnerID) {
                    return
                }
                if (self._Viewer !== undefined && self._Viewer !== null) {
                    var imggg = new Image();
                    imggg.src = "data:image/jpg;base64," + data.Base64;
                    imggg.onload = function () {
                        self.ctx.drawImage(imggg, 0, 0, imggg.width, imggg.height)
                    }
                }
                if (self.NewFrameReceived !== undefined && self.NewFrameReceived !== null) {
                    self.NewFrameReceived(data.OwnerID, "data:image/jpg;base64," + data.Base64)
                }
                return
            }
            if (messageType == OMCSMessageType.DesktopVideoSizeChanged) {
                let changedContract = JSON.parse(msg);
                if (changedContract.OwnerID !== self._OwnerID) {
                    return
                }
                self._VideoWidth = changedContract.VideoWidth;
                self._VideoHeight = changedContract.VideoHeight;
                self._Viewer.width = self._VideoWidth;
                self._Viewer.height = self._VideoHeight;
                console.log("DesktopVideoSizeChanged", changedContract.VideoWidth, changedContract.VideoHeight);
                return
            }
            if (messageType == OMCSMessageType.DesktopOwnerOutputChanged) {
                let changedContract = JSON.parse(msg);
                if (changedContract.OwnerID !== self._OwnerID) {
                    return
                }
                self._OwnerOutput = changedContract.OwnerOutput;
                if (self.OwnerOutputChanged !== undefined && self.OwnerOutputChanged !== null) {
                    self.OwnerOutputChanged(self._OwnerID, changedContract.OwnerOutput)
                }
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectStart && self.AutoReconnectStart != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Desktop) {
                    return
                }
                self.AutoReconnectStart(self._OwnerID);
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectSucceed && self.AutoReconnectSucceed != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Desktop) {
                    return
                }
                self.AutoReconnectSucceed(self._OwnerID);
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectFailed && self.AutoReconnectFailed != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.Desktop) {
                    return
                }
                self.AutoReconnectFailed(self._OwnerID, contract.ConnectResult);
                return
            }
        })
    };
    this.SetMultimediaManager(GlobalUtil.multimediaManager);
    this.caozuo = function () {
        var x;
        var y;
        self._Viewer.onmousemove = function (event) {
            if (event.target !== self._Viewer) {
                return
            }
            x = event.offsetX;
            y = event.offsetY;
            self.SendMouseMove(x, y)
        };
        self._Viewer.onmousedown = function (event) {
            if (event.target !== self._Viewer) {
                return
            }
            let x = event.offsetX;
            let y = event.offsetY;
            let btnNum = event.button;
            let leftButton;
            if (btnNum == 2) {
                leftButton = false;
                // console.log(leftButton, x, y);
                self.SendMouseOperation(x, y, leftButton, true)
            } else if (btnNum == 0) {
                leftButton = true;
                // console.log(leftButton, x, y);
                self.SendMouseOperation(x, y, leftButton, true)
            }
        };
        self._Viewer.onmouseup = function (event) {
            if (event.target !== self._Viewer) {
                return
            }
            let x = event.offsetX;
            let y = event.offsetY;
            let btnNum = event.button;
            let leftButton;
            if (btnNum == 2) {
                leftButton = false;
                self.SendMouseOperation(x, y, leftButton, false)
            } else if (btnNum == 0) {
                leftButton = true;
                self.SendMouseOperation(x, y, leftButton, false)
            }
        };
        document.onkeydown = function (ev) {
            let oEvent = ev || event;
            let keyValue = oEvent.keyCode;
            self.SendKeyOperation(keyValue, true)
        };
        document.onkeyup = function (ev) {
            let oEvent = ev || event;
            let keyValue = oEvent.keyCode;
            self.SendKeyOperation(keyValue, false)
        }
    }
};

function DynamicWhiteBoardConnector() {
    var self = this;
    this._AutoReconnect = false;
    this._VideoWidth = 0;
    this._VideoHeight = 0;
    this._Connected = false;
    this._OwnerID = "";
    this._Viewer = null;
    this.multimediaManager = null;
    this.Disconnected = null;
    this.ConnectEnded = null;
    this.AutoReconnectStart = null;
    this.AutoReconnectFailed = null;
    this.AutoReconnectSucceed = null;
    this.NewFrameReceived = null;
    this.GetConnected = function () {
        return self._Connected
    };
    this.GetOwnerID = function () {
        return self._OwnerID
    };
    this.GetVideoWidth = function () {
        return self._VideoWidth
    };
    this.GetVideoHeight = function () {
        return self._VideoHeight
    };
    this.GetAutoReconnect = function () {
        return self._AutoReconnect
    };
    this.SetAutoReconnect = function (value) {
        self._AutoReconnect = value;
        self.SetWhiteBoardParameters(JSON.stringify({OwnerID: self._OwnerID, AutoReconnect: self._AutoReconnect}))
    };
    this.SetWhiteBoardParameters = function (msg) {
        if (!self._Connected) return;
        self.multimediaManager.sendMessage(OMCSMessageType.SetWhiteBoardParameters, msg)
    };
    this.SetViewer = function (viewer) {
        self._Viewer = viewer;
        self._Viewer.width = self._VideoWidth;
        self._Viewer.height = self._VideoHeight;
        self.ctx = viewer.getContext("2d")
    };
    this.Dispose = function () {
        self = null
    };
    this.BeginConnect = function (destUserID) {
        if (self.multimediaManager == undefined) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.ConnectWhiteBoardConnector, destUserID);
        self._OwnerID = destUserID
    };
    this.Disconnect = function () {
        if (self.multimediaManager == undefined) {
            return
        }
        self.multimediaManager.sendMessage(OMCSMessageType.DisconnectWhiteBoardConnector, self._OwnerID);
        self._Connected = false
    };
    this.ctx = null;
    this.SetMultimediaManager = function (_multimediaManager) {
        self.multimediaManager = _multimediaManager;
        self.multimediaManager.addListener('messageReceived', function (messageType, msg) {
            if (messageType < 0) {
                return
            }
            if (messageType == OMCSMessageType.ConnectWhiteBoardConnectorResult) {
                var baseResult = JSON.parse(msg);
                if (baseResult.OwnerID !== self._OwnerID) {
                    return
                }
                if (baseResult.ResultCode == 0) {
                    self._Connected = true;
                    self.SetAutoReconnect(self._AutoReconnect)
                }
                if (self.ConnectEnded == undefined || self.ConnectEnded == null) {
                    return
                }
                self.ConnectEnded(self._OwnerID, baseResult);
                return
            }
            if (messageType == OMCSMessageType.WhiteBoardConnectorDisconnectEvent) {
                var disconnectEventContract = JSON.parse(msg);
                if (disconnectEventContract.OwnerID !== self._OwnerID) {
                    return
                }
                if (self.Disconnected == undefined || self.Disconnected == null) {
                    return
                }
                self.Disconnected(self._OwnerID, disconnectEventContract.ConnectorDisconnectedType);
                return
            }
            if (messageType == OMCSMessageType.NewWhiteBoardConnectorFrame) {
                var data = JSON.parse(msg);
                if (data.OwnerID !== self._OwnerID) {
                    return
                }
                if (self._Viewer !== undefined && self._Viewer !== null) {
                    var imggg = new Image();
                    imggg.src = "data:image/jpg;base64," + data.Base64;
                    imggg.onload = function () {
                        self.ctx.drawImage(imggg, 0, 0, imggg.width, imggg.height)
                    }
                }
                if (self.NewFrameReceived !== undefined && self.NewFrameReceived !== null) {
                    self.NewFrameReceived(data.OwnerID, "data:image/jpg;base64," + data.Base64)
                }
                return
            }
            if (messageType == OMCSMessageType.WhiteBoardVideoSizeChanged) {
                let changedContract = JSON.parse(msg);
                if (changedContract.OwnerID !== self._OwnerID) {
                    return
                }
                self._VideoWidth = changedContract.VideoWidth;
                self._VideoHeight = changedContract.VideoHeight;
                self._Viewer.width = self._VideoWidth;
                self._Viewer.height = self._VideoHeight;
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectStart && self.AutoReconnectStart != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.WhiteBoard) {
                    return
                }
                self.AutoReconnectStart(self._OwnerID);
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectSucceed && self.AutoReconnectSucceed != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.WhiteBoard) {
                    return
                }
                self.AutoReconnectSucceed(self._OwnerID);
                return
            }
            if (messageType == OMCSMessageType.ConnectorAutoReconnectFailed && self.AutoReconnectFailed != null) {
                let contract = JSON.parse(msg);
                if (contract.OwnerID !== self._OwnerID || contract.MultimediaDeviceType !== MultimediaDeviceType.WhiteBoard) {
                    return
                }
                self.AutoReconnectFailed(self._OwnerID, contract.ConnectResult);
                return
            }
        })
    };
    this.SetMultimediaManager(GlobalUtil.multimediaManager)
};
{
    function EventEmitter() {
        this._3 = {}
    };var isArray = Array.isArray;
    EventEmitter.prototype.addListener = function (type, listener, scope, once) {
        if ('function' !== typeof listener) {
            throw new Error('addListener only takes instances of Function')
        }
        ;this.emit('newListener', type, typeof listener.listener === 'function' ? listener.listener : listener);
        if (!this._3[type]) {
            this._3[type] = listener
        } else if (isArray(this._3[type])) {
            this._3[type].push(listener)
        } else {
            this._3[type] = [this._3[type], listener]
        }
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.once = function (type, listener, scope) {
        if ('function' !== typeof listener) {
            throw new Error('.once only takes instances of Function');
        }
        ;var self = this;

        function g() {
            self.removeListener(type, g);
            listener.apply(this, arguments)
        };g.listener = listener;
        self.on(type, g);
        return this
    };
    EventEmitter.prototype.removeListener = function (type, listener, scope) {
        if ('function' !== typeof listener) {
            throw new Error('removeListener only takes instances of Function');
        }
        ;
        if (!this._3[type]) return this;
        var list = this._3[type];
        if (isArray(list)) {
            var position = -1;
            for (var i = 0, length = list.length; i < length; i++) {
                if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
                    position = i;
                    break
                }
            }
            ;
            if (position < 0) return this;
            list.splice(position, 1);
            if (list.length == 0) {
                delete this._3[type]
            }
        } else if (list === listener || (list.listener && list.listener === listener)) {
            delete this._3[type]
        }
        ;
        return this
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.removeAllListeners = function (type) {
        if (arguments.length === 0) {
            this._3 = {};
            return this
        }
        ;
        if (type && this._3 && this._3[type]) this._3[type] = null;
        return this
    };
    EventEmitter.prototype.listeners = function (type) {
        if (!this._3[type]) this._3[type] = [];
        if (!isArray(this._3[type])) {
            this._3[type] = [this._3[type]]
        }
        ;
        return this._3[type]
    };
    EventEmitter.prototype.emit = function (type) {
        var type = arguments[0];
        var handler = this._3[type];
        if (!handler) return false;
        if (typeof handler == 'function') {
            switch (arguments.length) {
                case 1:
                    handler.call(this);
                    break;
                case 2:
                    handler.call(this, arguments[1]);
                    break;
                case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;
                default:
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) {
                        args[i - 1] = arguments[i]
                    }
                    handler.apply(this, args)
            }
            ;
            return true
        } else if (isArray(handler)) {
            var l = arguments.length;
            var args = new Array(l - 0x1);
            for (let i = 1; i < l; i++) args[i - 1] = arguments[i];
            var listeners = handler.slice();
            for (let i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args)
            }
            ;
            return true
        } else {
            return false
        }
    }
}
omcsutil.inherits(MultimediaManager, EventEmitter);

function OrayDic() {
    this.array = [];
    this.add = function (key, item) {
        var index = this.array.indexOf(key);
        if (index != -1) {
            throw new Error("key has exist !")
        } else {
            this.array.push(key, item)
        }
    };
    this.remove = function (key) {
        var index = this.array.indexOf(key);
        if (index != -1) {
            this.array.splice(index, 2)
        }
    };
    this.getItem = function (key) {
        var index = this.array.indexOf(key);
        if (index != -1) {
            return this.array[index + 1]
        }
        ;
        return null
    };
    this.setValue = function (key, value) {
        var index = this.array.indexOf(key);
        if (index != -1) {
            this.array[index + 1] = value
        }
    }
};

function ChatGroup() {
    var self = this;
    this.GroupID = "";
    this.CurrentMemberID = "";
    this.OtherMemberIDs = [];
    this.GetOtherMemberIDs = function () {
        return self.OtherMemberIDs
    };
    this.SomeoneJoin = null;
    this.SomeoneExit = null
};var ChatType = {Audio: 0, Video: 1};
var MultimediaManagerFactory = {GetSingleton: makeManager};

function makeManager() {
    console.log("makeManager");
    if (GlobalUtil.multimediaManager == undefined || GlobalUtil.multimediaManager == null) {
        GlobalUtil.multimediaManager = new MultimediaManager()
    }
    return GlobalUtil.multimediaManager
};
// if (document.readyState == 'loading') {
//     document.addEventListener('DOMContentLoaded', makeManager)
// } else {
//     makeManager()
// }
;var GlobalUtil = {
    multimediaManager: null, maxLengthOfUserID: 11, SetMaxLengthOfUserID: function (maxLength) {
        GlobalUtil.maxLengthOfUserID = maxLength
    }
}