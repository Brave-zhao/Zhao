/**
 * 项目配置
 */
var _config = {
	isLog: true,
	staticPath: "", //静态资源请求路径前缀
	server: {
		url: "http://192.168.2.113:8094/",
		//大平台服务器地址
		central: "http://192.168.2.113:8093/centralServer/",
		// 发布系统服务器地址
		publish: "http://192.168.2.99:6082/publish/",
		appointment: "http://192.168.2.113:8091/",
		ipIntercom: "http://192.168.2.93:8087"
	},
	omcs: {
		ip: "192.168.2.146",
		port: 9900,
		pluginDownloadUrl: "http://192.168.2.86:8087/public/plugin/IntercomPlugin7.0.zip",
	},
	ajax: {
		success_code: 200,
		connection_error: function (e) {
			console.log("connection_error:", e);
			if (e.status === 401) {
				// location.reload();
			} else if (e.status === 403) {
				alert("你的用户权限不足!");
			} else {
				// alert("发生意外错误，请检查网络");
			}
		},
		return_error: function (result) {
			var code = result.code || 404;
			if (code === 401) {
				// location.reload();
				alert("登录已过期");
			} else if (code === 403) {
				alert("你的用户权限不足");
			} else {
				alert("发生意外错误，请稍后再试！");
			}

		}
	},
}