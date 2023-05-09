/****************************
 * AJAX请求类
 ****************************/
function Ajax(_c) {
	
	var URL = _c.server.url + "/";
	
	var SUCCESS_CODE = _c.ajax.success_code;
	
	var connection_error = _c.ajax.connection_error;
	var return_error = _c.ajax.return_error;

	/**
	 * 执行ajax请求
	 * @param type			请求类型[get,post,put,delete]
	 * @param url			请求地址
	 * @param data 			请求参数(没有则传入{})
	 * @param loading		loading器(没有则传入null)
	 * @param callback		回调函数
	 * @param errorHandle	失败时的回调(如果不传入则使用默认的错误处理逻辑)
	 * @param connectErrorHandle	连接错误时的回调(如果不传入则使用默认的错误处理逻辑)
	 */
	this.handle = function(type, url, data, loading, callback, errorHandle, connectErrorHandle) {
		$.ajax({
		    url: URL + url,
		    type: type,
		    dataType: "json",
		    data: data,
		    cache: false,
		    success: function (result) {
		    	if (result.code === SUCCESS_CODE) {
		    		callback(result);
		    	} else {
		    		if (errorHandle) {
		    			errorHandle(result);
		    		} else {
		    			console.log(URL + url)
		    			return_error(result);
		    		}
		    	}
		    	if (loading) loading.finish();
		    },
		    error: function(e) {
				if (e.status === 401) return location.reload();
		    	if (connectErrorHandle) {
		    		connectErrorHandle(e);
		    	} else {
		    		connection_error(e);
		    	}
		    	if (loading) loading.finish();
		    }
		});
	}
	
	/**
	 * 执行带文件的ajax请求
	 * @param type			请求类型[get,post,put,delete]
	 * @param url			请求地址
	 * @param formData 		请求参数(没有则传入{})
	 * @param loading		loading器(没有则传入null)
	 * @param callback		回调函数
	 * @param errorHandle	失败时的回调(如果不传入则使用默认的错误处理逻辑)
	 * @param connectErrorHandle	连接错误时的回调(如果不传入则使用默认的错误处理逻辑)
	 */
	this.handleWithFiles = function(type, url, formData, loading, callback, errorHandle, connectErrorHandle) {
		$.ajax({
			url: URL + url,
			type: type,
			data: formData,
			cache: false,
			processData : false,
			contentType : false,
			success: function (result) {
				if (result.code === SUCCESS_CODE) {
					callback(result);
				} else {
					if (errorHandle) {
						errorHandle(result);
					} else {
						return_error();
					}
				}
				if (loading) loading.finish();
			},
			error: function(e) {
				if (e.status === 401) return location.reload();
				if (connectErrorHandle) {
					connectErrorHandle(e);
				} else {
					connection_error(e);
				}
				if (loading) loading.finish();
			}
		});
	}

	/**
	 * 指定contentType执行ajax请求
	 * @param type            请求类型[get,post,put,delete]
	 * @param url            请求地址
	 * @param data            请求参数(没有则传入{})
	 * @param loading		loading器(没有则传入null)
	 * @param contentType    指定的contentType(必传)
	 * @param callback        回调函数
	 * @param errorHandle    失败时的回调(如果不传入则使用默认的错误处理逻辑)
	 * @param connectErrorHandle    连接错误时的回调(如果不传入则使用默认的错误处理逻辑)
	 */
	this.handleWithCT = function (type, url, data, loading, contentType, callback, errorHandle, connectErrorHandle) {
		$.ajax({
			url: URL + url,
			type: type,
			dataType: "json",
			contentType: contentType,
			data: data,
			cache: false,
			success: function (result) {
				if (result.code === SUCCESS_CODE) {
					callback(result);
				} else {
					if (errorHandle) {
						errorHandle(result);
					} else {
						return_error();
					}
				}
				if (loading) loading.finish();
			},
			error: function(e) {
				if (e.status === 401) return location.reload();
				if (connectErrorHandle) {
					connectErrorHandle(e);
				} else {
					connection_error(e);
				}
				if (loading) loading.finish();
			}
		});
	}


	/**
	 * 将json数据的键的下划线转为驼峰
	 */
	this.data2Camel = function(data) {
		if (!data) return null;
		var _data = {};
		for (var key in data) {
			_data[camelCase(key)] = data[key];
		}
		return _data;
	}
	
	/**
	 * 将字符串的下划线转驼峰
	 */
	function camelCase(string) { 
	    return string.replace( /_([a-z])/g, function(all, letter) {
	        return letter.toUpperCase();
	    });
	}
	
	/**
	 * json转formData
	 */
	this.json2formData = function(json) {
		var formData = new FormData();
		for (var key in json) {
			formData.append(key, json[key]);
		}
		return formData;
	}
	
	/**
	 * 数据判空与校验
	 * @param dataGroup			需要判空的json数据
	 * @param checkParmaName 	需要判空的字段，数组['name','age']
	 * @param notNullGroup		是否允许为空,数组[false, true]
	 * @param regExpGroup		需要判断的正则表达式，数组，下标位置要与checkParamName对应[*,+]，如果不需要正则匹配，则输入null[null,null]
	 * @param nullStr			如果字段为空，需要显示的提示，数组，下标位置要与checkParamName对应['名字不能为空','请输入年龄']，如果不需要提示，则输入''['','']
	 * @param 如果有字段判空与校验不成功，则返回true，否则返回false
	 */
	this.checkNull = function(dataGroup, checkParamName, notNullGroup, regExpGroup, nullStr) {
		for (var idx in checkParamName) {
			var data = dataGroup[checkParamName[idx]];
			var notNull = notNullGroup[idx];			
			// 判空
			if (data === undefined || data === '' || data === null) {
				if (notNull) {
					alertNullStr(nullStr[idx]);
					return true;
				}
			} else {
				// 判断正则
				var regExp = regExpGroup[idx];
				if (regExp) {
					if (typeof data === 'number') {
						data = data.toString();
					}
					if (!regExp.test(data)) {
						alertNullStr(nullStr[idx]);
						return true;
					}
				}
			}
		}
		return false;
	}
	
	// 输出判空提示
	function alertNullStr(str) {
		if (str && str != '' && str != null) {
			alert(str);
		}
	}
}





