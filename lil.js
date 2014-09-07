/*! lil.js - v0.1 - MIT License - https://github.com/lil-js/all */
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
    var VERSION = "0.1.0";
    var toStr = Object.prototype.toString;
    var slicer = Array.prototype.slice;
    var origin = location.origin;
    var originRegex = /^(http[s]?:\/\/[a-z0-9\-\.\:]+)[\/]?/i;
    var defaults = {
        method: "GET",
        timeout: 30 * 1e3,
        auth: null,
        headers: null,
        async: true,
        withCredentials: false,
        responseType: "text"
    };
    function isObj(o) {
        return o && toStr.call(o) === "[object Object]";
    }
    function isArr(o) {
        return o && toStr.call(o) === "[object Array]";
    }
    function extend(target) {
        var i, l, x, cur, args = slicer.call(arguments).slice(1);
        for (i = 0, l = args.length; i < l; i += 1) {
            cur = args[i];
            for (x in cur) if (cur.hasOwnProperty(x)) {
                target[x] = cur[x];
            }
        }
        return target;
    }
    function setHeaders(xhr, headers) {
        if (isObj(headers)) {
            headers["Content-Type"] = headers["Content-Type"] || http.defaultContent;
            for (var field in headers) {
                xhr.setRequestHeader(field, headers[field]);
            }
        }
    }
    function getHeaders(xhr) {
        var map = {}, headers = xhr.getAllResponseHeaders().split("\n");
        headers.forEach(function(header) {
            if (header) {
                header = header.split(":");
                map[header[0].trim()] = (header[1] || "").trim();
            }
        });
        return map;
    }
    function parseData(xhr) {
        var data, content = xhr.getResponseHeader("Content-Type");
        if (xhr.responseType === "text") {
            data = xhr.responseText;
            if (content === "application/json") data = JSON.parse(data);
        } else {
            data = xhr.response;
        }
        return data;
    }
    function buildResponse(xhr) {
        return {
            xhr: xhr,
            status: xhr.status,
            data: parseData(xhr),
            headers: getHeaders(xhr)
        };
    }
    function buildErrorResponse(xhr, error) {
        var response = buildResponse(xhr);
        response.error = error;
        return response;
    }
    function onError(xhr, cb) {
        var called = false;
        return function(err) {
            if (!called) {
                cb(buildErrorResponse(xhr, err), null);
                called = true;
            }
        };
    }
    function onLoad(xhr, cb) {
        return function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    cb(null, buildResponse(xhr));
                } else {
                    cb(buildResponse(xhr), null);
                }
            }
        };
    }
    function isCrossOrigin(url) {
        var match = url.match(originRegex);
        return match && match[1] === origin;
    }
    function createClient(config) {
        var xhr = null;
        var method = (config.method || "GET").toUpperCase();
        var auth = config.auth || {};
        var url = config.url;
        if (isCrossOrigin(url)) {
            if (typeof XDomainRequest !== "undefined") {
                xhr = new XDomainRequest();
            }
        } else {
            xhr = new XMLHttpRequest();
        }
        xhr.open(method, url, config.async, auth.user, auth.password);
        xhr.withCredentials = config.withCredentials;
        xhr.responseType = config.responseType;
        xhr.timeout = config.timeout;
        setHeaders(xhr, config.headers);
        return xhr;
    }
    function updateProgress(xhr, cb) {
        return function(ev) {
            if (evt.lengthComputable) {
                cb(ev, evt.loaded / evt.total);
            } else {
                cb(ev);
            }
        };
    }
    function request(config, cb, progress) {
        var xhr = createClient(config);
        var data = isObj(config.data) || isArr(config.data) ? JSON.stringify(config.data) : config.data;
        var errorHandler = onError(xhr, cb);
        xhr.addEventListener("load", onLoad(xhr, cb), false);
        xhr.addEventListener("error", errorHandler, false);
        xhr.addEventListener("timeout", errorHandler, false);
        xhr.addEventListener("abort", errorHandler, false);
        if (typeof progress === "function") xhr.addEventListener("progress", updateProgress(xhr, progress), false);
        try {
            xhr.send(data);
        } catch (e) {
            errorHandler(e);
        }
        return xhr;
    }
    function requestFactory(method) {
        return function(url, options, cb, progress) {
            var config = extend({}, defaults);
            var args = slicer.call(arguments);
            var i, cur = null;
            for (i = 0, l = args.length; i < l; i += 1) {
                cur = args[i];
                if (typeof cur === "function") {
                    cb = cur;
                    if (cb !== cur) progress = cur;
                } else if (isObj(cur)) {
                    extend(config, cur);
                } else if (typeof cur === "string") {
                    config.url = cur;
                }
            }
            return request(config, cb, progress);
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
            module.exports = exports = exports.uri;
        }
    } else {
        factory(root.lil = root.lil || {});
    }
})(this, function(exports) {
    var VERSION = "0.1.0";
    var REGEX = /^(?:([^:\/?#]+):\/\/)?((?:([^\/?#@]*)@)?([^\/?#:]*)(?:\:(\d*))?)?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n)*))?/i;
    function isStr(o) {
        return typeof o === "string";
    }
    function mapSearchParams(search) {
        var map = {};
        if (search) {
            search.split("&").forEach(function(values) {
                if (values) {
                    values = values.split("=");
                    if (map.hasOwnProperty(values[0])) {
                        map[values[0]] = Array.isArray(map[values[0]]) ? map[values[0]] : [ map[values[0]] ];
                        map[values[0]].push(values[1]);
                    } else {
                        map[values[0]] = values[1];
                    }
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
        if (p.host) buf.push(p.host); else {
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
    uri.VERSION = VERSION;
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
    var VERSION = "0.1.0";
    var toStr = Object.prototype.toString;
    var nativeIsFinite = isFinite;
    var nativeIsArray = Array.isArray;
    var keys = Object.keys;
    var binaryRegex = /[U]?Int|Float[0-9]{1,2}Array\]$/i;
    var types = [ "Boolean", "NaN", "Number", "String", "Null", "Undefined", "RegExp", "Date", "Function", "Symbol", "Arguments", "Error", "Array", "Element", "Generator", "Map", "Binary", "Object" ];
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
    exports.isMap = function isMap(o) {
        return o && toStr.call(o) === "[object Map]" || false;
    };
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
        return o && isBlob(o) || isFile(o) || binaryRegex.test(toStr.call(o)) || false;
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
        return isObject(o) || isArray(o) || isArguments(o) || false;
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