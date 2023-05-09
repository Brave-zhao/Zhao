function ImageCompress(option) {

    option.quality = option.quality || 0.9;
    var config = option;

    this.compress = function (file, callback) {
        return process(file, callback);
    }

    this.compressList = function (fileList, formData, callback) {
        var count = 0;
        for (var idx in fileList) {
            var file = fileList[idx].raw;
            this.compress(file, function (res) {
                if (res.status === 0) {
                    // 失败，用压缩前的图片
                    formData.append("file", file);
                } else {
                    // 成功
                    formData.append("file", res.file);
                }
                count++;
                // console.log("compress回调完毕:", count, res);
                if (count === fileList.length) callback(formData);
            });
        }
    }

    const supportTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/bmp"
    ];

    //判断格式是否支持
    function isSupportedType(type) {
        return supportTypes.indexOf(type) !== -1;
    }

    function process(file, callback) {
        var outputType = file.type;
        if (isSupportedType(file.type) === false) {
            // 不支持的文件，直接返回原文件
            return callback({status: 2, file: file})
        }

        var img = new Image();
        img.onload = function () {
            try {
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                var scale = 1;
                if (config.maxWidth) {
                    scale = Math.min(1, config.maxWidth / canvas.width);
                }
                if (config.maxHeight) {
                    scale = Math.min(1, scale, config.maxHeight / canvas.height);
                }

                if (scale !== 1) {
                    var mirror = document.createElement("canvas");
                    mirror.width = Math.ceil(canvas.width * scale);
                    mirror.height = Math.ceil(canvas.height * scale);
                    var mctx = mirror.getContext("2d");
                    mctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, mirror.width, mirror.height);
                    canvas = mirror;
                }

                var dataURL = canvas.toDataURL(outputType, config.quality);
                var _file = dataURLtoFile(dataURL, file.name);
                callback({status: 1, file: _file})
            } catch (e) {
                console.error(e);
                callback({status: 0});
            }
        };
        img.onerror = function () {
            if (callback) callback({status: 0});
        };
        img.src = URL.createObjectURL(file);
    }

    function dataURLtoFile(dataurl, name) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], name, { type: mime });
    }

}
