/*! lil.js - v0.1.13 - MIT License - https://github.com/lil-js/all */
(function(global) {
    var lil = global.lil = global.lil || {};
    lil.VERSION = "0.1.13";
    lil.alias = lil.globalize = function() {
        global._ = lil;
    };
})(window);

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "exports" ], factory);
    } else if (typeof exports === "object") {
        factory(exports);
        if (typeof module === "object" && module !== null) {
            module.exports = exports = exports.http;
        }
    } else {
        factory(root.lil = root.lil || {});
    }
})(this, function(exports) {
    "use strict";
    var VERSION = "0.1.15";
    var toStr = Object.prototype.toString;
    var slicer = Array.prototype.slice;
    var hasOwn = Object.prototype.hasOwnProperty;
    var hasBind = typeof Function.prototype.bind === "function";
    var origin = location.origin;
    var originRegex = /^(http[s]?:\/\/[a-z0-9\-\.\:]+)[\/]?/i;
    var jsonMimeRegex = /application\/json/;
    var hasDomainRequest = typeof XDomainRequest !== "undefined";
    var noop = function() {};
    var defaults = {
        method: "GET",
        timeout: 30 * 1e3,
        auth: null,
        data: null,
        headers: null,
        withCredentials: false,
        responseType: "text"
    };
    function isObj(o) {
        return o && toStr.call(o) === "[object Object]" || false;
    }
    function assign(target) {
        var i, l, x, cur, args = slicer.call(arguments).slice(1);
        for (i = 0, l = args.length; i < l; i += 1) {
            cur = args[i];
            for (x in cur) if (hasOwn.call(cur, x)) target[x] = cur[x];
        }
        return target;
    }
    function once(fn) {
        var called = false;
        return function() {
            if (called === false) {
                called = true;
                fn.apply(null, arguments);
            }
        };
    }
    function setHeaders(xhr, headers) {
        if (isObj(headers)) {
            headers["Content-Type"] = headers["Content-Type"] || http.defaultContent;
            for (var field in headers) if (hasOwn.call(headers, field)) {
                xhr.setRequestHeader(field, headers[field]);
            }
        }
    }
    function getHeaders(xhr) {
        var headers = {}, rawHeaders = xhr.getAllResponseHeaders().trim().split("\n");
        rawHeaders.forEach(function(header) {
            var split = header.trim().split(":");
            var key = split.shift().trim();
            var value = split.join(":").trim();
            headers[key] = value;
        });
        return headers;
    }
    function isJSONResponse(xhr) {
        return jsonMimeRegex.test(xhr.getResponseHeader("Content-Type"));
    }
    function encodeParams(params) {
        return Object.getOwnPropertyNames(params).filter(function(name) {
            return params[name] !== undefined;
        }).map(function(name) {
            var value = params[name] === null ? "" : params[name];
            return encodeURIComponent(name) + (value ? "=" + encodeURIComponent(value) : "");
        }).join("&").replace(/%20/g, "+");
    }
    function parseData(xhr) {
        var data = null;
        if (xhr.responseType === "text") {
            data = xhr.responseText;
            if (isJSONResponse(xhr) && data) data = JSON.parse(data);
        } else {
            data = xhr.response;
        }
        return data;
    }
    function getStatus(status) {
        return status === 1223 ? 204 : status;
    }
    function buildResponse(xhr) {
        var response = {
            xhr: xhr,
            status: getStatus(xhr.status),
            statusText: xhr.statusText,
            data: null,
            headers: {}
        };
        if (xhr.readyState === 4) {
            response.data = parseData(xhr);
            response.headers = getHeaders(xhr);
        }
        return response;
    }
    function buildErrorResponse(xhr, error) {
        var response = buildResponse(xhr);
        response.error = error;
        if (error.stack) response.stack = error.stack;
        return response;
    }
    function cleanReferences(xhr) {
        xhr.onreadystatechange = xhr.onerror = xhr.ontimeout = null;
    }
    function isValidResponseStatus(xhr) {
        var status = getStatus(xhr.status);
        return status >= 200 && status < 300 || status === 304;
    }
    function onError(xhr, cb) {
        return once(function(err) {
            cb(buildErrorResponse(xhr, err), null);
        });
    }
    function onLoad(config, xhr, cb) {
        return function(ev) {
            if (xhr.readyState === 4) {
                cleanReferences(xhr);
                if (isValidResponseStatus(xhr)) {
                    cb(null, buildResponse(xhr));
                } else {
                    onError(xhr, cb)(ev);
                }
            }
        };
    }
    function isCrossOrigin(url) {
        var match = url.match(originRegex);
        return match && match[1] === origin;
    }
    function getURL(config) {
        var url = config.url;
        if (isObj(config.params)) {
            url += (url.indexOf("?") === -1 ? "?" : "&") + encodeParams(config.params);
        }
        return url;
    }
    function XHRFactory(url) {
        if (hasDomainRequest && isCrossOrigin(url)) {
            return new XDomainRequest();
        } else {
            return new XMLHttpRequest();
        }
    }
    function createClient(config) {
        var method = (config.method || "GET").toUpperCase();
        var auth = config.auth;
        var url = getURL(config);
        var xhr = XHRFactory(url);
        if (auth) {
            xhr.open(method, url, true, auth.user, auth.password);
        } else {
            xhr.open(method, url);
        }
        xhr.withCredentials = config.withCredentials;
        xhr.responseType = config.responseType;
        xhr.timeout = config.timeout;
        setHeaders(xhr, config.headers);
        return xhr;
    }
    function updateProgress(xhr, cb) {
        return function(ev) {
            if (ev.lengthComputable) {
                cb(ev, ev.loaded / ev.total);
            } else {
                cb(ev);
            }
        };
    }
    function hasContentTypeHeader(config) {
        return config && isObj(config.headers) && (config.headers["content-type"] || config.headers["Content-Type"]) || false;
    }
    function buildPayload(xhr, config) {
        var data = config.data;
        if (isObj(config.data) || Array.isArray(config.data)) {
            if (hasContentTypeHeader(config) === false) {
                xhr.setRequestHeader("Content-Type", "application/json");
            }
            data = JSON.stringify(config.data);
        }
        return data;
    }
    function timeoutResolver(cb, timeoutId) {
        return function() {
            clearTimeout(timeoutId);
            cb.apply(null, arguments);
        };
    }
    function request(config, cb, progress) {
        var xhr = createClient(config);
        var data = buildPayload(xhr, config);
        var errorHandler = onError(xhr, cb);
        if (hasBind) {
            xhr.ontimeout = errorHandler;
        } else {
            var timeoutId = setTimeout(function abort() {
                if (xhr.readyState !== 4) {
                    xhr.abort();
                }
            }, config.timeout);
            cb = timeoutResolver(cb, timeoutId);
            errorHandler = onError(xhr, cb);
        }
        xhr.onreadystatechange = onLoad(config, xhr, cb);
        xhr.onerror = errorHandler;
        if (typeof progress === "function") {
            xhr.onprogress = updateProgress(xhr, progress);
        }
        try {
            xhr.send(data ? data : null);
        } catch (e) {
            errorHandler(e);
        }
        return {
            xhr: xhr,
            config: config
        };
    }
    function requestFactory(method) {
        return function(url, options, cb, progress) {
            var i, l, cur = null;
            var config = assign({}, defaults, {
                method: method
            });
            var args = slicer.call(arguments);
            for (i = 0, l = args.length; i < l; i += 1) {
                cur = args[i];
                if (typeof cur === "function") {
                    if (args.length === i + 1 && typeof args[i - 1] === "function") {
                        progress = cur;
                    } else {
                        cb = cur;
                    }
                } else if (isObj(cur)) {
                    assign(config, cur);
                } else if (typeof cur === "string" && !config.url) {
                    config.url = cur;
                }
            }
            return request(config, cb || noop, progress);
        };
    }
    function http(config, data, cb, progress) {
        return requestFactory("GET").apply(null, arguments);
    }
    http.VERSION = VERSION;
    http.defaults = defaults;
    http.defaultContent = "text/plain";
    http.get = requestFactory("GET");
    http.post = requestFactory("POST");
    http.put = requestFactory("PUT");
    http.del = requestFactory("DELETE");
    http.patch = requestFactory("PATCH");
    http.head = requestFactory("HEAD");
    return exports.http = http;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "exports" ], factory);
    } else if (typeof exports === "object") {
        factory(exports);
        if (typeof module === "object" && module !== null) {
            module.exports = exports.Event;
        }
    } else {
        factory(root.lil = root.lil || {});
    }
})(this, function(exports) {
    "use strict";
    var VERSION = "0.1.3";
    var slice = Array.prototype.slice;
    var hasOwn = Object.prototype.hasOwnProperty;
    function Event() {}
    Event.prototype.constructor = Event;
    Event.prototype.addListener = Event.prototype.on = function(event, fn, once) {
        if (typeof event !== "string") throw new TypeError("First argument must be a string");
        if (typeof fn !== "function") throw new TypeError("Second argument must be a function");
        if (!findListener.call(this, event, fn)) {
            getListeners.call(this, event).push({
                fn: fn,
                once: once || false
            });
        }
        return this;
    };
    Event.prototype.removeListener = Event.prototype.off = function(event, fn) {
        var index;
        var listeners = getListeners.call(this, event);
        var listener = findListener.call(this, event, fn);
        if (listener) {
            index = listeners.indexOf(listener);
            if (index >= 0) listeners.splice(index, 1);
        }
        return this;
    };
    Event.prototype.addOnceListener = Event.prototype.once = function(event, fn, once) {
        this.addListener(event, fn, true);
        return this;
    };
    Event.prototype.emit = Event.prototype.fire = function(event) {
        var i, l, listener, args = slice.call(arguments).slice(1);
        var listeners = getListeners.call(this, event);
        if (event) {
            for (i = 0, l = listeners.length; i < l; i += 1) {
                listener = listeners[i];
                if (listener.once) listeners.splice(i, 1);
                listener.fn.apply(null, args);
            }
        }
        return this;
    };
    Event.prototype.removeAllListeners = Event.prototype.offAll = function(event) {
        if (event && hasOwn.call(this._events, event)) {
            this._events[event].splice(0);
        }
        return this;
    };
    function findListener(event, fn) {
        var i, l, listener, listeners = getListeners.call(this, event);
        for (i = 0, l = listeners.length; i < l; i += 1) {
            listener = listeners[i];
            if (listener.fn === fn) return listener;
        }
    }
    function getListeners(event, fn) {
        var events = getEvents.call(this);
        return hasOwn.call(events, event) ? events[event] : events[event] = [];
    }
    function getEvents() {
        return this._events || (this._events = {});
    }
    Event.VERSION = VERSION;
    exports.Event = Event;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "exports" ], factory);
    } else if (typeof exports === "object") {
        factory(exports);
        if (typeof module === "object" && module !== null) {
            module.exports = exports.uuid;
        }
    } else {
        factory(root.lil = root.lil || {});
    }
})(this, function(exports) {
    var VERSION = "0.1.0";
    var uuidRegex = {
        "3": /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
        "4": /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
        "5": /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
        all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    };
    function uuid() {
        var uuid = "", i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-";
            uuid += (i === 12 ? 4 : i === 16 ? random & 3 | 8 : random).toString(16);
        }
        return uuid;
    }
    function isUUID(str, version) {
        var pattern = uuidRegex[version ? String(version) : "all"];
        return pattern && pattern.test(str);
    }
    uuid.isUUID = isUUID;
    uuid.VERSION = VERSION;
    exports.uuid = uuid;
    exports.isUUID = isUUID;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "exports" ], factory);
    } else if (typeof exports === "object") {
        factory(exports);
        if (typeof module === "object" && module !== null) {
            module.exports = exports = exports.uri;
        }
    } else {
        factory(root.lil = root.lil || {});
    }
})(this, function(exports) {
    "use strict";
    var VERSION = "0.1.2";
    var REGEX = /^(?:([^:\/?#]+):\/\/)?((?:([^\/?#@]*)@)?([^\/?#:]*)(?:\:(\d*))?)?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n)*))?/i;
    function isStr(o) {
        return typeof o === "string";
    }
    function mapSearchParams(search) {
        var map = {};
        if (typeof search === "string") {
            search.split("&").forEach(function(values) {
                values = values.split("=");
                if (map.hasOwnProperty(values[0])) {
                    map[values[0]] = Array.isArray(map[values[0]]) ? map[values[0]] : [ map[values[0]] ];
                    map[values[0]].push(values[1]);
                } else {
                    map[values[0]] = values[1];
                }
            });
            return map;
        }
    }
    function accessor(type) {
        return function(value) {
            if (value) {
                this.parts[type] = isStr(value) ? decodeURIComponent(value) : value;
                return this;
            }
            this.parts = this.parse(this.build());
            return this.parts[type];
        };
    }
    function URI(uri) {
        this.uri = uri || null;
        if (isStr(uri) && uri.length) {
            this.parts = this.parse(uri);
        } else {
            this.parts = {};
        }
    }
    URI.prototype.parse = function(uri) {
        var parts = decodeURIComponent(uri || "").match(REGEX);
        var auth = (parts[3] || "").split(":");
        var host = auth.length ? (parts[2] || "").replace(/(.*\@)/, "") : parts[2];
        return {
            uri: parts[0],
            protocol: parts[1],
            host: host,
            hostname: parts[4],
            port: parts[5],
            auth: parts[3],
            user: auth[0],
            password: auth[1],
            path: parts[6],
            search: parts[7],
            query: mapSearchParams(parts[7]),
            hash: parts[8]
        };
    };
    URI.prototype.protocol = function(host) {
        return accessor("protocol").call(this, host);
    };
    URI.prototype.host = function(host) {
        return accessor("host").call(this, host);
    };
    URI.prototype.hostname = function(hostname) {
        return accessor("hostname").call(this, hostname);
    };
    URI.prototype.port = function(port) {
        return accessor("port").call(this, port);
    };
    URI.prototype.auth = function(auth) {
        return accessor("host").call(this, auth);
    };
    URI.prototype.user = function(user) {
        return accessor("user").call(this, user);
    };
    URI.prototype.password = function(password) {
        return accessor("password").call(this, password);
    };
    URI.prototype.path = function(path) {
        return accessor("path").call(this, path);
    };
    URI.prototype.search = function(search) {
        return accessor("search").call(this, search);
    };
    URI.prototype.query = function(query) {
        return query && typeof query === "object" ? accessor("query").call(this, query) : this.parts.query;
    };
    URI.prototype.hash = function(hash) {
        return accessor("hash").call(this, hash);
    };
    URI.prototype.get = function(value) {
        return this.parts[value] || "";
    };
    URI.prototype.build = URI.prototype.toString = URI.prototype.valueOf = function() {
        var p = this.parts, buf = [];
        if (p.protocol) buf.push(p.protocol + "://");
        if (p.auth) buf.push(p.auth + "@"); else if (p.user) buf.push(p.user + (p.password ? ":" + p.password : "") + "@");
        if (p.host) {
            buf.push(p.host);
        } else {
            if (p.hostname) buf.push(p.hostname);
            if (p.port) buf.push(":" + p.port);
        }
        if (p.path) buf.push(p.path);
        if (p.query && typeof p.query === "object") {
            if (!p.path) buf.push("/");
            buf.push("?" + Object.keys(p.query).map(function(name) {
                if (Array.isArray(p.query[name])) {
                    return p.query[name].map(function(value) {
                        return name + (value ? "=" + value : "");
                    }).join("&");
                } else {
                    return name + (p.query[name] ? "=" + p.query[name] : "");
                }
            }).join("&"));
        } else if (p.search) {
            buf.push("?" + p.search);
        }
        if (p.hash) {
            if (!p.path) buf.push("/");
            buf.push("#" + p.hash);
        }
        return this.url = buf.filter(function(part) {
            return isStr(part);
        }).join("");
    };
    function uri(uri) {
        return new URI(uri);
    }
    function isURL(uri) {
        return typeof uri === "string" && REGEX.test(uri);
    }
    uri.VERSION = VERSION;
    uri.is = uri.isURL = isURL;
    uri.URI = URI;
    exports.uri = uri;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "exports" ], factory);
    } else if (typeof exports === "object") {
        factory(exports);
        if (typeof module === "object" && module !== null) {
            module.exports = exports;
        }
    } else {
        factory(root.lil = root.lil || {});
    }
})(this, function(exports) {
    "use strict";
    var VERSION = "0.1.2";
    var toStr = Object.prototype.toString;
    var nativeIsFinite = isFinite;
    var nativeIsArray = Array.isArray;
    var keys = Object.keys;
    var binaryRegex = /[U]?Int|Float[0-9]{1,2}Array\]$/i;
    var types = [ "Boolean", "NaN", "Number", "String", "Null", "Undefined", "RegExp", "Date", "Function", "Symbol", "Arguments", "Error", "Array", "Element", "Generator", "Map", "WeakMap", "WeakSet", "Binary", "Object" ];
    exports.type = {
        VERSION: VERSION
    };
    function isNull(o) {
        return o === null;
    }
    exports.isNull = isNull;
    function isObject(o) {
        return o && toStr.call(o) === "[object Object]" || false;
    }
    exports.isObject = isObject;
    exports.isPlainObject = function isPlainObject(o) {
        return isObject(o) && isObject(Object.getPrototypeOf(o)) && isNull(Object.getPrototypeOf(Object.getPrototypeOf(o)));
    };
    function isArray(o) {
        return nativeIsArray ? nativeIsArray(o) : o && toStr.call(o) === "[object Array]" || false;
    }
    exports.isArray = isArray;
    function isTypedArray(o) {
        return o && binaryRegex.test(toStr.call(o)) || false;
    }
    exports.isTypedArray = isTypedArray;
    function isFn(fn) {
        return typeof fn === "function";
    }
    exports.isFn = exports.isFunction = isFn;
    function isBool(o) {
        return o === true || o === false || o && toStr.call(o) === "[object Boolean]" || false;
    }
    exports.isBool = exports.isBoolean = isBool;
    function isDate(o) {
        return o && toStr.call(o) === "[object Date]" || false;
    }
    exports.isDate = isDate;
    exports.isElement = function isElement(o) {
        return o && o.nodeType === 1 || false;
    };
    function isString(o) {
        return typeof o === "string" || o && typeof o === "object" && toStr.call(o) === "[object String]" || false;
    }
    exports.isString = isString;
    function isNumber(o) {
        return typeof o === "number" || o && typeof o === "object" && toStr.call(o) === "[object Number]" || false;
    }
    exports.isNumber = isNumber;
    function isRegExp(o) {
        return o && toStr.call(o) === "[object RegExp]" || false;
    }
    exports.isRegExp = isRegExp;
    function isNaN(o) {
        return isNumber(o) && o != +o;
    }
    exports.isNaN = isNaN;
    exports.isFinite = function isFinite(o) {
        return nativeIsFinite(o) && !isNaN(parseFloat(o)) || false;
    };
    function isError(o) {
        return o && toStr.call(o).indexOf("Error") !== -1 || false;
    }
    exports.isError = isError;
    var isMap = exports.isMap = function isMap(o) {
        return o && toStr.call(o) === "[object Map]" || false;
    };
    var isWeakMap = exports.isWeakMap = isMapType("WeakMap");
    var isWeakSet = exports.isWeakSet = isMapType("WeakSet");
    function isMapType(type) {
        return function isMapType(o) {
            return o && toStr.call(o) === "[object " + type + "]" || false;
        };
    }
    exports.isPromise = function isPromise(o) {
        return isObject(o) && isFn(o.then) || false;
    };
    exports.isGenerator = function isGenerator(o) {
        return isObject(o) && isFn(o.next) && isFn(o.send) || false;
    };
    exports.isBuffer = function isBuffer(o) {
        return o && toStr.call(o) === "[object Buffer]" || toStr.call(o) === "[object ArrayBuffer]" || toStr.call(o) === "[object DataView]" || false;
    };
    function isBlob(o) {
        return o && toStr.call(o) === "[object Blob]" || toStr.call(o) === "[object BlobBuilder]" || false;
    }
    exports.isBlob = isBlob;
    function isFile(o) {
        return o && toStr.call(o) === "[object File]" || toStr.call(o) === "[object FileReader]" || false;
    }
    exports.isBlob = isFile;
    exports.isBinary = function isBinary(o) {
        return o && isBlob(o) || isFile(o) || isTypedArray(o) || false;
    };
    function isUndefined(o) {
        return typeof o === "undefined";
    }
    exports.isUndefined = isUndefined;
    function isSymbol(o) {
        return o && toStr.call(o) === "[object Symbol]" || false;
    }
    exports.isSymbol = isSymbol;
    function isArguments(o) {
        return o && toStr.call(o) === "[object Arguments]" || false;
    }
    exports.isArguments = isArguments;
    function isEmpty(o) {
        if (!o) return true;
        if (isString(o) || isArray(o)) return o.length === 0;
        if (isObject(o)) return keys(o).length === 0;
        return false;
    }
    exports.isEmpty = isEmpty;
    exports.notEmpty = function(o) {
        return !isEmpty(o);
    };
    exports.isMutable = function isMutable(o) {
        return isObject(o) || isArray(o) || isError(o) || isArguments(o) || isDate(o) || isFn(o) || false;
    };
    exports.isIterable = function isIterable(o) {
        return isObject(o) || isArray(o) || isArguments(o) || isMap(o) || isWeakMap(o) || isWeakSet(o) || false;
    };
    exports.isPrimitive = function(o) {
        return isBool(o) || isString(o) || isNumber(o) || isFn(o) || isNull(o) || isUndefined(o) || isRegExp(o) || isSymbol(o) || false;
    };
    exports.is = exports.isType = function isType(o) {
        for (var i = 0, l = types.length; i < l; i += 1) {
            if (exports["is" + types[i]](o)) {
                return types[i].toLowerCase();
            }
        }
        return "undefined";
    };
});