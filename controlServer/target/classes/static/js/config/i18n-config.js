/**
 * 国际化文本配置文件
 * 中文信息配置在messages变量的en-US属性中
 * 英文信息变量配置在messages变量的zh-CN属性中
 * 导入i18n-config.js后会自动引入全局变量$i18n,下面大多数操作需要用到
 *
 * 初始化只需要在创建Vue实例时加入i18n,例如-----------------------
 * var vue = new Vue({
 *     el: '#app',
 *     i18n: $i18n.init(messages),
 *     data: {...},
 *     ...
 * })
 * 其中messages为国际化文本变量，可以参照public/v2/i18n下面的js编写
 *
 * 默认启用中文/英文-----------------
 * 修改本文件中变量i18n的local属性即可
 *
 * 动态切换中文/英文-----------------
 * 调用$i18n.switchLanguage("en-US")
 *
 * 页面中使用--------------------
 * 在页面引入国际化文本，使用$t("...")
 * 例如: $t("menu.home")
 * */
var LANG_ARRAY = [
    { name: '中文', locale: 'zh-CN'},
    { name: '英文', locale: 'en-US'},
];

var LOCALE_CACHE_KEY = "tenger_appointment_i18n_locale";

var DEFAULT_LANG = 'zh-CN';

var dateTimeFormats = {
    'zh-CN': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
        }
    },
    'en-US': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
        }
    }
}

// Create VueI18n instance with options
var $i18n = {
    obj: null,
    switchCallback: null,
    _checkAndGetLocalCache: function () {
        var localeCache = window.localStorage.getItem(LOCALE_CACHE_KEY);
        // check
        if (localeCache) {
            for (let i = 0; i < LANG_ARRAY.length; i++) {
                if (localeCache === LANG_ARRAY[i].locale) {
                    return localeCache;
                }
            }
            window.localStorage.setItem(LOCALE_CACHE_KEY, DEFAULT_LANG);
        }
        return DEFAULT_LANG;
    },
    init: function (messages, extraOptions, switchCallback) {
        var options = {
            locale: DEFAULT_LANG, // set locale
            messages: messages,
            dateTimeFormats: dateTimeFormats,
            fallbackLocale: DEFAULT_LANG,
            silentTranslationWarn: true,
        }

        try {
            var _localeCache = this._checkAndGetLocalCache();

            if (_localeCache) options.locale = _localeCache;
        } catch (e) {
            console.log("ie模式下不支持localstorage")
        }

        if (extraOptions) {
            for (var key in extraOptions) {
                options[key] = extraOptions[key];
            }
        }

        // 如果是子页面，需要调用父页面方法，返回当前locale
        if (window != top) {
            options.locale = this.getLocalCache() || 'zh-CN';
            try {
                var parentLocale = parent.$i18n.obj.locale;
                if (parentLocale) {
                    options.locale = parentLocale;
                }
            } catch (e) {
                // ignore
            }
        }

        this.obj = new VueI18n(options);
        var _this = this;
        setTimeout(function() {
            _this.switchElementLang(options.locale);
        }, 0);
        this.initChildI18n();
        this.switchCallback = switchCallback;
        return this.obj;
    },
    switchElementLang: function(locale) {
        if ( ELEMENT && ELEMENT.lang ) {
            if ( locale === "zh-CN" ) {
                ELEMENT.locale(ELEMENT.lang.zhCN);
            } else {
                ELEMENT.locale(ELEMENT.lang.en);
            }
        }
    },
    switchLanguage: function (locale, callback) {
        this.switchElementLang(locale);
        if (this.obj) {
            this.obj.locale = locale;
            document.title = this.obj.t('pageTitle.home');
            this.initChildI18n();
        }
        window.localStorage.setItem(LOCALE_CACHE_KEY, locale);
        if (callback) callback(locale);
        if (this.switchCallback) this.switchCallback(locale);
    },
    initChildI18n: function() {
        var _this = this;
        setTimeout(function () {
            $('iframe').each(function() {
                try {
                    var _childI18n = $(this)[0].contentWindow.$i18n;
                    if (_childI18n) {
                        _childI18n.switchLanguage(_this.obj.locale);
                    }
                } catch (e) {
                    $(this)[0].contentWindow.postMessage(_this.obj.locale, '*');
                }
            });
        }, 0);
    },
    getLocalCache: function() {
        try {
            return this._checkAndGetLocalCache();
        } catch (e) {
            console.log("ie模式下不支持localstorage")
            return null;
        }
    },
};

addEventListener('message', function (e) {
    var locale = e.data;
    for (let i = 0; i < LANG_ARRAY.length; i++) {
        if (locale === LANG_ARRAY[i].locale) {
            $i18n.switchLanguage(e.data);
            break;
        }
    }
});