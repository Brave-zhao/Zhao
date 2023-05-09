/* 
 * 打印工具v0.1
 * 需要配合html2canvas使用：https://github.com/niklasvh/html2canvas
 * @author  ilongli
 * @date    2022/2/9
 * @refer   Print.js https://www.jq22.com/jquery-info15776
 */
(function (window, document) {
    var Print = function (dom, options) {
      if (!(this instanceof Print)) return new Print(dom, options);
    
      this.options = this.extend({
        title: null,
      }, options);

      this.dom = document.querySelector(dom);

      this.init();
    };
    Print.prototype = {
      init: function () {
        var _this = this;
        html2canvas(this.dom, {
          useCORS: true,
          allowTaint: true
        }).then(function(canvas) {
          var src;
          try {
            src = canvas.toDataURL('image/jpg', 1);
          } catch (error) {
            console.error(error);
            alert("打印时出现错误，如果页面内容不完整，请尝试更换新版浏览器，如chrome浏览器");
          }
          var image = new Image();
          image.src = src;
          var url = image.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
          var img = document.createElement('img');
          img.src = url;
          _this.writeIframe(img.outerHTML);
        });
      },

      extend: function (obj, obj2) {
        for (var k in obj2) {
          obj[k] = obj2[k];
        }
        return obj;
      },

      writeIframe: function (content) {
        var w, doc, iframe = document.createElement('iframe'),
          f = document.body.appendChild(iframe);
        iframe.id = "myIframe";
        iframe.style = "position:absolute;width:0;height:0;top:-10px;left:-10px;";
  
        w = f.contentWindow || f.contentDocument;
        doc = f.contentDocument || f.contentWindow.document;
        doc.open();
        if (this.options.title) {
          doc.write("<title>" + this.options.title + "</title>");
        }
        doc.write(content);
        doc.close();
        this.toPrint(w, function () {
          document.body.removeChild(iframe)
        });
      },
  
      toPrint: function (w, cb) {
        w.onload = function () {
          try {
            setTimeout(function () {
              w.focus();
              if (!w.document.execCommand('print', false, null)) {
                w.print();
              }
              w.close();
              cb && cb()
            });
          } catch (err) {
            console.log('err', err);
          }
        }
      }
    };
    window.Print = Print;
  }(window, document));