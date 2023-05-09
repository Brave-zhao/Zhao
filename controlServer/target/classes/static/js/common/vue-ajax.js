/**
 * ajax实例，可配置基础参数，需要引入config.js和jquery.min.js
 * （注：为了防止IE Promise报错，需要引入bluebird.min.js）
 * 配置参数说明：
 * 配置分为全局配置和特定配置，特定配置会覆盖全局配置
 * 配置参数包括jquery ajax的所有配置参数，包括timeout,dataType等等
 * 以及自定义配置baseURL和loading
 * baseURL： 请求基础路径，完整路径=baseURL + url，如baseURL: /publish  url: admin/index，完整请求路径：/publish/admin/index
 * loading: 默认使用element-ui的全局loading，如果设置为false，则取消全局loading;要设置自定义loading，需要传入{context: context, target: name},
 * contxt是vue实例,target是loading变量名称
 * 如 loading: {context: this, target: "loading"}
 * extraParam是额外参数，在执行ajax时，会把extraParam的键值对加入到data中
 * showError为是否弹出错误信息，默认为true
 */
(function(Vue,window){
	if(Vue === undefined || Vue === null) {
		console.error("未引入vue.js");
		return;
	}
	function Ajax(globalConfig) {
		//项目基础url
		var baseURL = "";
		if(!isNull(globalConfig)) {
			baseURL = globalConfig.baseURL || "";
		}
		
		return {
			get: function(url, data, config) {
				var _url = mergeUrl(baseURL, url);
				return doAjax("get", _url, data, globalConfig, config);
				
			},
			post: function(url, data, config) {
				var _url = mergeUrl(baseURL, url);
				return doAjax("post", _url, data, globalConfig, config);
				
			},
			put: function(url, data, config) {
				var _url = mergeUrl(baseURL, url);
				return doAjax("put", _url, data, globalConfig, config);
				
			},
			delete: function(url, data, config) {
				var _url = mergeUrl(baseURL, url);
				return doAjax("delete", _url, data, globalConfig, config);
				
			}
		
		}
	}
	
	/**
	 * 执行ajax请求，并且返回Promise对象
	 * resolve方法声明：resolve(response)
	 * reject方法声明: reject(error)  error参数包含isNetworkError属性和error属性 
	 * isNetwordError: 是否网络错误
	 * error: 错误，返回码非200或者网络错误
	 */
	function doAjax(type, url, data, globalConfig, config) {
		var promise = new Promise(function(resolve, reject) {
			//合并配置
			var settings = mergeConfig(config, globalConfig);

			//获取额外参数
			if(!isNull(settings) && !isNull(settings.extraParam)) {
				if(isNull(data)) {
					data = {};
				}
				for(var key in settings.extraParam) {
					if(isNull(data[key])) {
						data[key] = settings.extraParam[key];
					}
				}
			}

			settings.type = type;
			settings.url = url;
			settings.data = data;
			//请求成功回调
			settings.success = function(rs) {
				hideLoading(settings);
				//200成功码
				if(rs.code == 200) {
					resolve(rs);
				}else {
					var error = {
						error: rs,
						isNetworkError: false
					};
					reject(error);
					//处理错误返回结果
					handleErrorCodeResult(rs, settings);
				}
				
			}
			
			//请求失败回调
			settings.error = function(error) {
				
				hideLoading(settings);

				//处理特定错误码
				handleErrorStatus(error, settings);

				var _error = {
					error: error,
					isNetworkError: true
				};
				reject(_error);
			}
			
			// 显示loading
			showLoading(settings);
			$.ajax(settings);
			
		})
		return promise;
	}
	
	
	/**
	 * 合并Url
	 */
	function mergeUrl(baseURL, url) {
		if(isNull(baseURL)) {
			baseURL = "";
		}
		
		if(isNull(url)) {
			url = "";
		}
		//去除baseURL的"/"后缀
		if(endWith(baseURL, "/")) {
			baseURL = baseURL.substring(0, baseURL.length - 1);
		}
		
		//添加url的"/"前缀
		if(url.indexOf("/") != 0) {
			url = "/" + url;
		}
		
		return baseURL + url;
	}
	
	
	
	/**
	 * 合并配置
	 */
	function mergeConfig(config, globalConfig) {
		if(isNull(config) && isNull(globalConfig)) {
			return {};
		}
		if(isNull(globalConfig) && !isNull(config)) {
			return config;
		}
		
		var merge = JSON.parse(JSON.stringify(globalConfig));
		if(isNull(config) && !isNull(globalConfig)) {
			return merge;
		}
		
		for(var key in config) {
			merge[key] = config[key];
		}
		return merge;
	}
	
	function isNull(e) {
		return e === undefined || e === null || e === "";
	}
	
	/**
	 * 根据配置显示loading
	 */
	function showLoading(config) {
		if(isShowLoading(config)) {
			//显示全局loading
			if(Vue.prototype.$loading) {
				var loading = Vue.prototype.$loading({
					text: "loading...",
					background: "rgba(0, 0, 0, 0.7)",
					customClass: "te-fullscreen--loading",
				})

				config.globalLoading = loading;
			}

			return;
		}

		//显示传入的loading
		if(config.loading && config.loading.context) {
			var target = config.loading.target || "loading";
			config.loading.context[target] = true;
		}
		
	}

	/**
	 * 隐藏loading
	 * @param {} config 
	 */
	function hideLoading(config) {
		if(isShowLoading(config)) {
			//关闭全局loading
			if(config.globalLoading) {
				config.globalLoading.close();
			}
			return;
		}

		//关闭局部Loading
		if(config.loading && config.loading.context) {
			var target = config.loading.target || "loading";
			config.loading.context[target] = false;
		}
	}

	/**
	 * 是否显示全局loading
	 */
	function isShowLoading(config) {
		if(!isNull(config) && !isNull(config.loading) && config.loading === false) {
			return false;
		}
		return isNull(config.loading) || config.loading === true;
	}
	/**
	 * 提示错误信息
	 */
	function showError(message, settings) {
		//判断是否不打印错误信息
		if(!isNull(settings) && settings.showError === false) {
			return;
		}
		if(Vue.prototype.$message != null) {
			Vue.prototype.$message({
				type: "error",
				message: message,
				customClass: "error-msg__messagebox"
			})
		}else {
			alert(message);
		}
	}
	
	function endWith(str,endStr) {
		var d = str.length - endStr.length;
	    return (d >= 0 && str.lastIndexOf(endStr) == d)
	}
	
	/**
	 * 处理错误的返回结果
	 */
	function handleErrorCodeResult(rs, settings) {
		if(isNull(rs) || isNull(rs.code)) {
			return ;
		}
		
		if(rs.code == 403) {
			showError("你的用户权限不足!", settings);
		} else if(rs.code == 401) {
			window.top.location.reload();
		} else {
			showError(rs.msg + "", settings);
		}
	}
	
	/**
	 * 处理特定错误状态码
	 */
	function handleErrorStatus(error, settings) {
		if(isNull(error) || isNull(error.status)) {
			return;
		}
		//处理特定错误
		if(error.status == 401) {            //cas未登录
			window.top.location.reload();
		} else if(error.status == 403) {
			showError("你的用户权限不足", settings);
		} else {
			showError("发生意外错误，请稍后再试！", settings)
		}
	}
	

	/**
	 * 兼容回调函数ajax调用
	 */
	 function CallbackAjax(config) {
		var baseUrl = config.server || config.baseURL || "";
		/**
		 * 执行ajax请求
		 * @param type            请求类型[get,post,put,delete]
		 * @param url            请求地址
		 * @param data            请求参数(没有则传入{})
		 * @param vueObj        vueObj，会自动设置vueObj的loading变量，不必手动处理，例子：{obj: this, lname: 'loading'}，
		 * 							如果lname不传入，则默认为'loading'，兼容{context: this, target: 'loading'}
		 * @param callback        回调函数
		 * @param errorHandle    失败时的回调
		 * @param connectErrorHandle    连接错误时的回调
		 */
		 this.handle = function (type, url, data, vueObj, callback, errorHandle, connectErrorHandle, config) {
			 var ajaxConfig = {
				 cache: false
			 };
			 if(vueObj) {
				 ajaxConfig.loading = {
					 context: vueObj.context || vueObj.obj,
					 target: vueObj.target || vueObj.lname
				 }
			 }
			 ajaxConfig = mergeConfig(config, ajaxConfig);
			 doAjax(type, mergeUrl(baseUrl, url), data, null, ajaxConfig)
			 	.then(function(rs) {
					 if(callback) {
						 callback(rs);
					 }
				})
				.catch(function(err) {
					if(err.isNetworkError && connectErrorHandle) {
						connectErrorHandle(err.error);
					}

					if(!err.isNetworkError && errorHandle) {
						errorHandle(err.error)
					}
				})
		 }

		/**
		 * 执行带文件的ajax请求
		 * @param type            请求类型[get,post,put,delete]
		 * @param url            请求地址
		 * @param formData        请求参数(没有则传入{})
		 * @param vueObj        vueObj，会自动设置vueObj的loading变量，不必手动处理，例子：{obj: this, lname: 'loading'}，如果lname不传入，则默认为'loading',兼容{context: this, target: 'loading'}
		 * @param callback        回调函数
		 * @param errorHandle    失败时的回调(如果不传入则使用默认的错误处理逻辑)
		 * @param connectErrorHandle    连接错误时的回调(如果不传入则使用默认的错误处理逻辑)
		 */
		 this.handleWithFiles = function (type, url, formData, vueObj, callback, errorHandle, connectErrorHandle, config) {
			var ajaxConfig = {
				cache: false
			};
			if(vueObj) {
				ajaxConfig.loading = {
					context: vueObj.context || vueObj.obj,
					target: vueObj.target || vueObj.lname
				}
			}
			ajaxConfig = mergeConfig(config, ajaxConfig);
			ajaxConfig.processData = false;
			ajaxConfig.contentType = false;

			doAjax(type, mergeUrl(baseUrl, url), formData, null, ajaxConfig)
			 	.then(function(rs) {
					 if(callback) {
						 callback(rs);
					 }
				})
				.catch(function(err) {
					if(err.isNetworkError && connectErrorHandle) {
						connectErrorHandle(err.error);
					}

					if(!err.isNetworkError && errorHandle) {
						errorHandle(err.error)
					}
				})
		 }

		 /**
		 * 指定contentType执行ajax请求
		 * @param type            请求类型[get,post,put,delete]
		 * @param url            请求地址
		 * @param data            请求参数(没有则传入{})
		 * @param vueObj        vueObj，会自动设置vueObj的loading变量，不必手动处理，例子：{obj: this, lname: 'loading'}，如果lname不传入，则默认为'loading',兼容{context: this, target: 'loading'}
		 * @param contentType    指定的contentType(必传)
		 * @param callback        回调函数
		 * @param errorHandle    失败时的回调
		 * @param connectErrorHandle    连接错误时的回调
		 */
		this.handleWithCT = function (type, url, data, vueObj, contentType, callback, errorHandle, connectErrorHandle) {
			var ajaxConfig = {
				cache: false
			};
			if(vueObj) {
				ajaxConfig.loading = {
					context: vueObj.context || vueObj.obj,
					target: vueObj.target || vueObj.lname
				}
			}
			ajaxConfig = mergeConfig(config, ajaxConfig);
			if(contentType) {
				ajaxConfig.contentType = contentType;
			}
			doAjax(type, mergeUrl(baseUrl, url), data, null, ajaxConfig)
			 	.then(function(rs) {
					 if(callback) {
						 callback(rs);
					 }
				})
				.catch(function(err) {
					if(err.isNetworkError && connectErrorHandle) {
						connectErrorHandle(err.error);
					}

					if(!err.isNetworkError && errorHandle) {
						errorHandle(err.error)
					}
				})
		}
	}
	var $config = window._c || window._config;
	//向vue挂载$http
	Vue.prototype.$http = new Ajax({
		baseURL: $config.server.url,
		cache: false,
		showError: true
	});

	Vue.prototype.$Ajax = Ajax;
	window.$Ajax = Ajax;
	window.Ajax = CallbackAjax;
}(Vue, window));