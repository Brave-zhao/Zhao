/**
 *	vue通用方法，部分方法需要依赖其他js
 *  必须引入vue.js
 */
 (function(Vue,window){
	if(Vue === undefined || Vue === null) {
		console.error("未引入vue.js");
		return;
	}
	Vue.prototype.$global = {
			/**
    	     * 检查参数是否为空
    	     */
    	    isNull: function(variable) {
    	    	return variable === undefined || variable === null || variable === "";
			},
			/**
			 * 判断对象是否为空，如果对象键值对为空，也返回true
			 * @param {*} obj 
			 */
			isObjectNull: function(obj) {
				if(this.isNull(obj)) {
					return true;
				}

				var keyCount = 0;
				for(var key in obj) {
					keyCount++;
				}
				return keyCount == 0;
			},
    	    /**
    	     * 获取请求参数
    	     */
    	    getUrlParam: function(name) {     //获取请求参数
    			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
                var r = window.location.search.substr(1).match(reg);  //匹配目标参数
                if (r != null) return unescape(r[2]); return null; //返回参数值
    		},
    		
    		/**
    		 * 显示成功提示，需要引入element-ui
    		 */
    		showSuccess: function(msg) {                   //显示成功提示
    			Vue.prototype.$message.success(msg);
    		}, 
    		/**
    		 * 显示失败提示，需要引入element-ui
    		 */
    		showError: function(msg) {                 //显示失败提示
    			Vue.prototype.$message.error(msg);
			},
			/**
    		 * 显示警告提示，需要引入element-ui
    		 */
			showWarning: function(msg) {                 //显示警告提示
    		    Vue.prototype.$message.warning(msg);
			},
			/**
			 * 显示通知，需要引入element-ui
			 * @param {*} title 标题
			 * @param {*} msg 消息内容
			 * @param {*} type 类型 success/warning/info/error
			 */
			notify: function(title,msg, type) {
				if(this.isNull(title)) {
					title = "提示";
				}
				return Vue.prototype.$notify({
					title: title,
					message: msg,
					dangerouslyUseHTMLString: true,
					type: type,
					duration: 8000,
				});
			},
    		 /**
    	     * 获取服务器地址
    	     */
    	    serverUrl: function() {
    	    	var server = "";
    	    	if(_config != undefined && _config != null) {
    	    		server = _config.server.url;
    	    		//console.log("server:" + server);
    	    	}else {
    	    		console.error("未能获取到_config配置参数，请先引入config.js配置文件")
    	    	}
    	    	return server;
    	    },
    	    fullServerUrl: function(url) {             //完整的后台链接
    	    	return this.mergeUrl(this.serverUrl(), url);
    	    },
    	    /**
    	     * 获取静态资源地址
    	     */
    	    staticUrl: function() {
    	    	var staticPath = "";
    	    	if(_config != undefined && _config != null) {
    	    		staticPath = _config.staticPath;
    	    		//console.log("server:" + server);
    	    	}else {
    	    		console.error("未能获取到_config配置参数，请先引入config.js配置文件")
    	    	}
    	    	return staticPath;
    	    },
    	    fullStaticUrl: function(url) {                //完整的资源链接
    	    	return this.mergeUrl(this.staticUrl(), url);
			},
			fullStaticUrlAutoJudge: function(url) {
				var url = this.fullStaticUrl(url);
				if(url.indexOf("http://") != 0 && url.indexOf("https://") != 0) {
					var prefix = location.protocol + "//" + location.host;
					return this.mergeUrl(prefix, url);
				}
				return url;
			},
    	    /**
			 * 比较两个日期大小，如果相同返回0，在之后返回1，之前返回-1
			 * 需要引入moment.js
			 * @param {Date} compared 被比较的日期
			 * @param {Date} date 要比较的日期
			 * @param {String} check 要比较的单位，Y-年  M-月 D-日
			 */
			compareDate: function(compared, date, check) {
			    var comparedM = moment(compared);
			    var dateM = moment(date);

			    if(dateM.isSame(comparedM, check)) {
			        return 0;
			    }
			    if(dateM.isBefore(comparedM, check)) {
			        return -1;
			    }
			    return 1;
			    
			},
			/**
			 * 格式化日期
			 * 需要引入moment.js
			 */
			formatDate: function(date,pattern) {
				if(date == null) {
					return null;
				}
				if(pattern == null) {
					pattern = "YYYY-MM-DD HH:mm:ss";
				}
				return moment(date).format(pattern);
			},
			/**
			 * 获取日期是星期几
			 * 需要引入moment.js
			 */
			getDateWeekday: function(date) {  
				var weeks = ["一","二","三","四","五","六","日"];
				return weeks[this.formatDate(date,"E") - 1];
			},
			/**
			 * 获取两个时间的时间差文本
			 * @param {*} compared 被比较的时间
			 * @param {*} date 要比较的时间
			 */
			 diffTimeText: function(compared, date) {                
				compared = moment(compared);
				date = moment(date);
				return this.diffTimeTextByDiff(date.diff(compared));
			},
			diffTimeTextByDiff: function(diff, split) {
				split = split || "";
				var duration = moment.duration(diff);
				if(duration == null || duration._data == null) {
					return "";
				}
				var array = [];
				var days = duration._data.days;
				if(days > 0) {
					array.push(days + "天");
				}

				var hours = duration._data.hours;
				if(hours > 0) {
					array.push(hours + "小时");
				}

				var mins = duration._data.minutes;
				if(mins > 0) {
					array.push(mins + "分钟");
				}

				if(array.length <= 0) {
					return "0分钟";
				}
				return array.join(split);
			},
			/**
			 * 判断数字是否小于10，如果小于10则添加0
			 */
			addZero: function(num) {
				var _num = parseInt(num);
				return _num < 10 ? "0" + _num : _num;
			},
			/**
			 * 数字转大写字母
			 */
			numToAlpha: function(num) {
				return String.fromCharCode(64 + parseInt(num));
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
			/**
			 * 在数组中查找指定key并value相同的对象，并返回第一个查找到的
			 */
			findByKeyValue: function(array,key,value) {
				if(this.isNull(array)) {
					return null;
				}
				for(var i=0;i<array.length;i++) {
					if(array[i][key] == value) {
						return array[i];
					}
				}
				return null;
			},
			/**
			 * 在数组中查找指定key并value相同的对象，并返回数组
			 */
			listByKeyValue: function(array,key,value) {
				if(this.isNull(array)) {
					return null;
				}
				
				return array.filter(function(ele) {
					 return ele[key] == value;
				})
			},
			/**
			 * 复制数组（只复制数组，元素引用不变）
			 */
			copyArray: function(array) {
				if(this.isNull(array)) {
					return null;
				}
				var newArray = new Array();
				array.forEach(function(element) {
					newArray.push(element);
				})
				return newArray;
			},
			/**
			 * 复制对象(深拷贝)
			 */
			copyObject: function(obj) {
				if(this.isNull(obj)) {
					return null;
				}
				try {
					return JSON.parse(JSON.stringify(obj));
				} catch (e) {
					return null;
				}
 			},
 			/**
 			 * 函数防抖，能够避免同一操作在短时间内连续进行
 			 */
 			debounce: function(callback,delay) {      
 				var timer = null;          //定时器
 				delay = delay || 300;       //默认300毫秒
 				return function() {
 					if(timer != null) {
 						clearTimeout(timer);
 					}
 					var context = this;
 					var args = arguments;
 					timer = setTimeout(function() {
 						timer = null;
 						callback.apply(context,args);
 					},delay)
 				}
 			},
 			mergeUrl: function(baseURL, url) {
 				if(this.isNull(baseURL)) {
 					baseURL = "";
 				}
 				
 				if(this.isNull(url)) {
 					url = "";
 				}
 				//去除baseURL的"/"后缀
 				if(this.endWith(baseURL, "/")) {
 					baseURL = baseURL.substring(0, baseURL.length - 1);
 				}
 				//添加url的"/"前缀
 				if(url.indexOf("/") != 0) {
 					url = "/" + url;
 				}
 				return baseURL + url;
 			},
 			endWith: function(str,endStr) {
 				var d = str.length-endStr.length;
 			    return (d >= 0 && str.lastIndexOf(endStr) == d)
 			},
 			isAllowSuffix: function(filename, allowSuffixs) {                  //判断当前文件名称是否符合后缀
 				if(this.isNull(filename)) {
 					return false;
 				}
 				if(this.isNull(allowSuffixs)) {
 					return false;
 				}
 				var _this = this;
 				var isAllow = allowSuffixs.some(function(suffix) {
// 					console.log(filename,suffix);
 					return _this.endWith(filename.toLowerCase(), suffix.toLowerCase());
 				})
 				return isAllow;
			 },
			 getFilename: function(url) {                     //获取文件名称
				 if(this.isNull(url)) {
					 return "";
				 }
				 var index = url.lastIndexOf("/");
				 return url.substring(index + 1);
			 },
			 parseObject: function(str) {                        //解析json字符串
				if(this.isNull(str)) {
					return null;
				}
				 try {
					 return JSON.parse(str);
				 } catch (error) {
					 return null;
				 }
			 },
			 /**
			  * 保存item到Localstorage
			  * @param {*} key 
			  * @param {*} item 
			  */
			 setItem: function(key, item) {
				if(this.isNull(item)) {
					localStorage.removeItem(key);
				}
				if(typeof(item) == "string") {
					localStorage.setItem(key, item);
				}else {
					localStorage.setItem(key, JSON.stringify(item));
				}
			 },
			 /**
			  * 获取localstorage中保存的数据
			  * @param {*} key 
			  */
			 getItem: function(key) {
				 var item = localStorage.getItem(key);
				 if(this.isNull(item)) {
					 return item;
				 }

				 try {
					return JSON.parse(item);
				 } catch (error) {
					 return item;
				 }
			 },
			 removeItem: function(key) {
				 localStorage.removeItem(key);
			 },
			 /**
			  * 在目标链接中添加back参数
			  * @param {*} target 
			  * @param {*} back 
			  */
			 addUrlBackParam: function(target, back) {
				back = back ||  window.location.href;
				return this.addUrlParam(target, "back", encodeURIComponent(back));
			 },
			 /**
			  * 从当前链接获取back参数
			  */
			 getUrlBackParam: function() {
				var url = this.getUrlParam("back");
				if(this.isNull(url)) {
					return null;
				}
				return decodeURIComponent(url);
			 },
			 /**
			  * 添加链接参数
			  * @param {*} param 
			  * @param {*} value 
			  */
			 addUrlParam: function(url, param, value) {
				if(this.isNull(url) || this.isNull(param)) {
					return url;
				}
				var join = url.indexOf("?") != -1 ? "&" : "?";
				return url + join  + param + "=" + value;
				
			 },
			 /**
			  * 转换日期字符串格式，需要引入moment.js
			  * @param {*} oldFormat 旧的日期格式
			  * @param {*} newFormat 新的日期格式
			  */
			 transDateFormat: function(date, oldFormat, newFormat) {
				if(this.isNull(date)) {
					return null;
				}
				return moment(date, oldFormat).format(newFormat);
			 },
			 /**
			  * 判断是否布局可编辑列表区域
			  * @param {*} layout 
			  */
			 isListableLayout: function(layout) {
				if(this.isNull(layout)) {
					return false;
				}
				return layout.listEditable;
			 },
			 getVideoUrl: function(lib) {
				if(this.isNull(lib)) {
					return "";
				}
				if(lib.way == 1) {
					return this.fullStaticUrl(lib.videoUrl)
				}
				return lib.videoUrl;
			 },
			 getDocUrl: function(lib) {           //根据文档类型获取链接，如果是图片，则返回完整图片路径，如果是ppt或doc返回相应的图标路径
				if(this.isNull(lib)) {
					return "";
				}

				if(lib.type == 6 && lib.fileType == 1) {          //doc
					return this.fullStaticUrl("public/images/admin/lib/word-space.png");
				}

				if(lib.type == 6 && lib.fileType == 2) {          //ppt
					return this.fullStaticUrl("public/images/admin/lib/ppt-space.png");
				}
				return this.fullStaticUrl(lib.imgUrl);
			 },
			 /**
			  * 驼峰转横杠
			  * @param {*} str 
			  */
			 toBarLine: function(str) {
				 return this.toJoiner(str, "-");
			},
			toJoiner: function(str, joiner) {               //驼峰转换成指定连接符
				var temp = str.replace(/[A-Z]/g, function (match) {	
					return joiner + match.toLowerCase();
				});
				if(temp.slice(0,1) === joiner){ //如果首字母是大写，执行replace时会多一个_，这里需要去掉
					temp = temp.slice(1);
				}
				return temp;
			},
			/**
			 * 横杆转驼峰
			 * @param {*} str 
			 */
			toCamel: function(str) {
				return str.replace(/([^-])(?:-+([^-]))/g, function ($0, $1, $2) {
				return $1 + $2.toUpperCase();
				});
			},
			uuid: function() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = Math.random() * 16 | 0,
						v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},
			getBasePath: function() {              //获取项目完整连接，包括项目路径
				return location.protocol + "//" + location.host + this.serverUrl();
			},
			mergeUrl: function(baseURL, url) {
			   if(this.isNull(baseURL)) {
				   baseURL = "";
			   }
			   
			   if(this.isNull(url)) {
				   url = "";
			   }
			   //去除baseURL的"/"后缀
			   if(this.endWith(baseURL, "/")) {
				   baseURL = baseURL.substring(0, baseURL.length - 1);
			   }
			   //添加url的"/"前缀
			   if(url.indexOf("/") != 0) {
				   url = "/" + url;
			   }
			   return baseURL + url;
		   },
		   preventDialogClose: function(done, msg) {
				msg = msg || "操作未完成，确定关闭吗？";
				Vue.prototype.$confirm(msg, "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: 'warning'
				}).then(function() {
					done();
				}).catch(function(err) {
	
				})
		   },
		   copyNotExistElement: function(copy, copied, config) {
				if(this.isNull(config)) {
					config = {};
				}

				var key = config.key || "id";
				if(this.isNull(copied)) {
					return [];
				}

				if(this.isNull(copy)) {
					return copied;
				}
				var _this = this;
				//判断copy里的元素是否在copied是否已存在
				var result = copy.filter(function(e) {
					var find = _this.findByKeyValue(copied, key, e[key]);
					return !_this.isNull(find);
				});
				copied.filter(function(e) {
					var find = _this.findByKeyValue(result, key, e[key]);
					return _this.isNull(find);
				}).forEach(function(e) {
					result.push(e);
				})

				return result;
		},
		clearFormValidate: function(dom) {
			if(dom && dom.clearValidate) {
				dom.clearValidate();
			}
		},
		mergeObjects: function() {         //合并多个对象，键值相同则会覆盖
			var obj = {};
			for(var i=0; i<arguments.length; i++) {
				if(!this.isNull(arguments[i])) {
					var arg = arguments[i];
					for(var key in arg) {
						obj[key] = arg[key];
					}
				}
			}

			return obj;
		},
		isObject: function(obj) {                    //判断是否对象
			return Object.prototype.toString.call(obj) === "[object Object]"
			|| Object.prototype.toString.call(obj) === "[object Array]"
		},
		looseEquals: function(a, b) {            //判断两个对象值是否相等
			if (a == b) return true
			var _this = this;
			var isObjectA = this.isObject(a);
			var isObjectB = this.isObject(b);
			// console.log(isObjectA, isObjectB);
			if (isObjectA && isObjectB) {
				try {
					var isArrayA = Array.isArray(a)
					var isArrayB = Array.isArray(b)
					if (isArrayA && isArrayB) {
						return a.length === b.length && a.every(function(e, i) {
							return _this.looseEquals(e, b[i])
						})
					} else if (a instanceof Date && b instanceof Date) {
						return a.getTime() === b.getTime()

					} else if (!isArrayA && !isArrayB) {
						var keysA = Object.keys(a)
						var keysB = Object.keys(b)
						return keysA.length === keysB.length && keysA.every(function(key) {
							return _this.looseEquals(a[key], b[key])
						})
					} else {
						return false
					}
				} catch (e) {
					return false
				}
			} else if (!isObjectA && !isObjectB) {
				return String(a) === String(b)
			}
			return false;
		},
		/**
		 * 字节转换：b => mb
		 * @param {*} limit 
		 * @returns 
		 */
		formatByte: function (limit){
			if (limit == "" || limit == null) {
				return "——"
			}

			var size = "";
			var threshold = 1;
			if(limit < threshold * 1024){                            //小于0.1KB，则转化成B
				size = limit.toFixed(2) + "B"
			}else if(limit < threshold * 1024 * 1024){            //小于0.1MB，则转化成KB
				size = (limit/1024).toFixed(2) + "KB"
			}else if(limit < threshold * 1024 * 1024 * 1024){        //小于0.1GB，则转化成MB
				size = (limit/(1024 * 1024)).toFixed(2) + "MB"
			}else{                                            //其他转化成GB
				size = (limit/(1024 * 1024 * 1024)).toFixed(2) + "GB"
			}
		
			var sizeStr = size + "";                        //转成字符串
			var index = sizeStr.indexOf(".");                    //获取小数点处的索引
			var dou = sizeStr.substr(index + 1 ,2)            //获取小数点后两位的值
			if(dou == "00"){                                //判断后两位是否为00，如果是则删除00
				return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
			}
			return size;
		},
		/**
		 * 判断是否为IE浏览器
		 * @returns 
		 */
		isIE: function () {
			if (!!window.ActiveXObject || "ActiveXObject" in window) {
				return true
			} else {
				return false
			}
		},
		/**
		 * 将整型时长（单位秒）转换成时间格式字符串，如10转成00:10，如果指定bit位数，则会转换成指定位数的字符串，
		 * 如果不指定，则根据时长多少则显示多少(最少2位)
		 * @param {*}} duration 
		 * @param {*} bit 
		 */
		durationToTimeStr: function(duration, bit) {        
			var array = this.durationToTimeArray(duration);
			bit = bit || array.length;
			if(bit < 2) {
				bit = 2;
			}
			var newArray = [];
			var diff = bit - array.length;
			//补零
			for(var i = 0; i < diff; i++) {
				newArray.push("00");
			}

			array.reverse().filter(function(el, index) {
				return index < bit;
			}).reverse()
			.forEach(function(el) {
				var num = el < 10 ? "0" + el : el;
				newArray.push(num);
			})
			return newArray.join(":");

		},
		durationToTimeArray: function(duration) {
			// console.log(duration);
			duration = parseInt(duration);

			var result = [];
			for(var i = 0; i < 2; i ++) {
				var el = duration % 60;
				result.unshift(el);
				duration = parseInt(duration / 60);
			}
			while(duration > 0) {
				var val = duration % 100;
				result.unshift(val);
				duration = parseInt(duration / 100);
			}
			return result;
		},
		/**
		 * 颜色转换：RGB 转 HEX 十六进制
		 * @param {*} r
		 * @param {*} g 
		 * @param {*} b 
		 * @returns 
		 */
		rgbToHex: function(r, g, b) {
			r = Number(r), g = Number(g), b = Number(b);
			return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		},
		/**
		 * 颜色转换：十六进制 转 rgba
		 * @param {*} hex 
		 * @param {*} opacity [可选]
		 * @returns 
		 */
		hexToRgba: function(hex, opacity) {
			return 'rgba(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length/3 + '})', 'g')).map(function(l) { return parseInt(hex.length%2 ? l+l : l, 16) }).concat(isFinite(opacity) ? opacity : 1).join(',') + ')';
		},
		/**
		 * 获取url不带请求参数的路径
		 * @param {}} url 
		 */
		getUrlWithoutQuery: function(url) {
			if(this.isNull(url)) {
				return url;
			}
			if(url.indexOf("?") == -1) {
				return url;
			}
			var arr = url.split("?");
			return arr.length > 0 ? arr[0] : url;
		},
		getBrandTypeName: function(type) {                   //根据班牌类型获取班牌类型名称
			var typeMap = {
				1: "班牌",
				2: "导览牌",
				3: "宣传屏"
			}
			return typeMap[type] || "显示屏";
		},
		getSiteConfig: function() {                     //获取当前激活的工地配置
			if(this.isNull(_config)) {
				console.error("config.js配置文件未导入，无法获取到工地配置");
				return {};
			}
			var active = _config.activeSite;
			var config = _config.siteConfig[active] || {};
			console.log("激活工地为：" + active + ",配置为:", config);
			return config;
		},
		openDownload: function(url) {
			var $a = document.createElement('a');
			$a.setAttribute("href", url);
			$a.setAttribute("download", "");
			$a.setAttribute("target","_blank");//弹出窗体
			//模拟js事件
			var evObj = document.createEvent('MouseEvents');
			evObj.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);
			$a.dispatchEvent(evObj);
			console.log($a)
		},
		/**
		 * 根据父节点id获取子孙列表
		 * @param {*} list 树节点列表
		 * @param {*} pid 父节点id
		 * @param {*} idKey id键名，默认id
		 * @param {*} pidKey pid键名,默认pid
		 */
		listChildrenByPid: function(list, pid, idKey, pidKey) { 
			pid = pid || 0;
			idKey = idKey || "id";
			pidKey = pidKey || "pid";
			
			if(list.length <= 0) {
				return [];
			}
			var descendants = [];            //子孙节点列表
			var children = this.listByKeyValue(list, pidKey, pid);
			for(var i = 0; i < children.length; i++) {
				descendants.push(children[i]);
				var data = this.listChildrenByPid(list, children[i][idKey], idKey, pidKey);
				
				for(var j = 0; j < data.length; j++) {
					descendants.push(data[j]);
				}
			}
			return descendants;
		},
		/**
		 * 根据父节点id获取子孙id列表
		 * @param {*} list 树节点列表
		 * @param {*} pid 父节点id
		 * @param {*} idKey id键名，默认id
		 * @param {*} pidKey pid键名,默认pid
		 */
		listChildrenIdsByPid: function(list, pid, idKey, pidKey) {
			idKey = idKey || "id";
			var children = this.listChildrenByPid(list, pid, idKey, pidKey);
			return children.map(function(el) {
				return el[idKey];
			})
			
		},
		/**
		 * 复制文本到剪贴板
		 */
		clipboard: function(value) {
			value = value || "";
			var input = document.createElement("input");
			input.setAttribute("readonly", "readonly");
			input.setAttribute("value", value);
			document.body.appendChild(input);
			input.setSelectionRange(0, 9999);
			if (document.execCommand("copy")) {
				input.select();
				document.execCommand("copy");
				console.log("复制成功:" + value);
			}
			document.body.removeChild(input);
		},

		getWeatherIconV2: function(info) {
			//天气对应图标
			var iconMap = {
				"暴雪": "暴雪.png",
				"暴雨": "暴雨.png",
				"大暴雨": "大暴雨.png",
				"大雪": "大雪.png",
				"大雨": "大雨.png",
				"冻雨": "冻雨.png",
				"多云": "多云.png",
				"浮尘": "浮尘.png",
				"雷阵雨": "雷阵雨.png",
				"雷阵雨伴有冰雹": "雷阵雨伴有冰雹.png",
				"霾": "霾.png",
				"强沙尘暴": "强沙尘暴.png",
				"晴": "晴.png",
				"沙尘暴": "沙尘暴.png",
				"特大暴雨": "特大暴雨.png",
				"雾": "雾.png",
				"小雪": "小雪.png",
				"小雨": "小雨.png",
				"扬沙": "扬沙.png",
				"阴": "阴.png",
				"雨夹雪": "雨夹雪.png",
				"阵雪": "阵雪.png",
				"阵雨": "阵雨.png",
				"中雪": "中雪.png",
				"中雨": "中雨.png"
			};
			//判断是否包含"转"
			var weather = info;

			var spliter = "转";
			if(info.indexOf(spliter) != -1) {
				//获取转后面的天气
				var weathers = info.split(spliter);
				weather = weathers[weathers.length - 1];
			}

			// console.log("解析出来的天气：", weather);
			var icon = iconMap[weather] || iconMap["多云"];
			return this.fullServerUrl("public/images/weather/") + icon;
		},
		/**
		 * 限流函数
		 * @param {*} callback 回调函数
		 * @param {*} interval 限流时间
		 * @returns 
		 */
		throttle: function(callback, interval) {
			var last = 0;
			var interval = interval || 300;
			return function () {
				var context = this;
				var args = arguments;
				var now = Date.now();
				// 根据当前时间和上次执行时间的差值判断是否频繁
				if (now - last >= interval) {
					last = now;
					callback.apply(context, args);
				}
			};
		},
		isFirefox: function() {        //是否火狐浏览器
			return !!window.navigator.userAgent.match(/firefox/i);
		},
		removeUrlParams: function(url, params) {
			for (var index = 0; index < params.length; index++) {
				var item = params[index];
				var fromIndex = url.indexOf(item + "="); //必须加=号，避免参数值中包含item字符串
				if (fromIndex !== -1) {
				// 通过url特殊符号，计算出=号后面的的字符数，用于生成replace正则
				var startIndex = url.indexOf("=", fromIndex);
				var endIndex = url.indexOf("&", fromIndex);
				var hashIndex = url.indexOf("#", fromIndex);
			
				var reg = "";
				if (endIndex !== -1) {
					// 后面还有search参数的情况
					var num = endIndex - startIndex;
					reg = new RegExp(item + "=.{" + num + "}");
					url = url.replace(reg, "");
				} else if (hashIndex !== -1) {
					// 有hash参数的情况
					var num = hashIndex - startIndex - 1;
					reg = new RegExp("&?" + item + "=.{" + num + "}");
					url = url.replace(reg, "");
				} else {
					// search参数在最后或只有一个参数的情况
					reg = new RegExp("&?" + item + "=.+");
					url = url.replace(reg, "");
				}
				}
			}
			var noSearchParam = url.indexOf("=");
			if (noSearchParam === -1) {
				url = url.replace(/\?/, ""); // 如果已经没有参数，删除？号
			}
			return url;
			  
		},
		setCookie: function(key, value, time) {
			var cookie = key + "=" + value;
			if(time) {
				var date = new Date();
				date.setTime(date.getTime() + time);
				cookie += ";expires=" + date.toGMTString();
			}
			document.cookie = cookie;
		},
		getCookie: function(key) {
			/*获取cookie参数*/
            var getCookie = document.cookie.replace(/[ ]/g,"");  //获取cookie，并且将获得的cookie格式化，去掉空格字符
            var arrCookie = getCookie.split(";")  //将获得的cookie以"分号"为标识 将cookie保存到arrCookie的数组中
            var tips;  //声明变量tips
            for(var i = 0; i < arrCookie.length; i++){   //使用for循环查找cookie中的tips变量
                var arr = arrCookie[i].split("=");   //将单条cookie用"等号"为标识，将单条cookie保存为arr数组
                if(key == arr[0]){  //匹配变量名称，其中arr[0]是指的cookie名称，如果该条变量为tips则执行判断语句中的赋值操作
                    tips = arr[1];   //将cookie的值赋给变量tips
                    break;   //终止for循环遍历
                }
            }
            return tips;
		},
		deleteCookie: function(key) {
			var date = new Date(); //获取当前时间
            date.setTime(date.getTime() - 10000); //将date设置为过去的时间
            document.cookie = key + "=v;expires =" + date.toGMTString();//设置cookie
		},
		/**
		 * 判断是否有超级管理员权限
		 */
		hasSuperPermission: function() {
			//只获取cookie，如果存在，则是超级管理员
			//返回Promise，预防以后通过接口返回
			var _this = this;
			return new Promise(function(resolve, reject) {
				var value = _this.getCookie("TENGER_S_A_K");
				resolve(!_this.isNull(value))
			});
		},
		/**
		 * 清空超级管理员权限标识
		 */
		clearSuperPermission: function() {
			this.deleteCookie("TENGER_S_A_K");
		}

	}
}(Vue,window));
