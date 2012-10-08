var HTTP = require("http");

var Q = require("q");
var Q_HTTP = require("q-http");
var JACK2 = require("jack2");

exports.createClient = function(apiAccessCode, options) {
    options = options || {};
    options.params = options.params || {};
    options.params.apiAccessCode = apiAccessCode;
    return new FlurryClient(options);
}

exports.FlurryClient = FlurryClient;

function FlurryClient(options) {
    this._options = options;
    this._client = Q_HTTP.request;
    if (!this._options.rateLimit) {
        this._client = JACK2.RateLimit(this._client, this._options.rateLimit || 1000);
    }
}

FlurryClient.prototype.host = "api.flurry.com";

FlurryClient.prototype._request = function(path, params, callback) {
    var self = this;
    var allParams = {};
    for (var param in this._options.params) {
        allParams[param] = this._options.params[param];
    }
    for (var param in params) {
        allParams[param] = params[param];
    }

    if (allParams.startDate instanceof Date) {
        allParams.startDate = _formatDate(allParams.startDate);
    }
    if (allParams.endDate instanceof Date) {
        allParams.endDate = _formatDate(allParams.endDate);
    }

    var fullPath = path + "?" + _makeQuery(allParams);

    return Q.when(this._client({
        host: this.host,
        port: 80,
        method: "GET",
        path: fullPath,
        headers: { "Accept": "application/json" }
    }), function(response) {
        if (response.status >= 200 && response.status < 300) {
            return Q.when(getBody(response.body), function(body) {
                return _transformObject(JSON.parse(body));
            });
        } else {
            throw new Error(response.status);
        }
    }).nend(callback);
};

FlurryClient.prototype.getApplication = function() {
    var options = _parseArgs(["apiKey"], arguments);
    options.params["apiKey"] = options.apiKey;
    return this._request("/appInfo/getApplication", options.params, options.callback);
}
FlurryClient.prototype.getAllApplications = function() {
    var options = _parseArgs([], arguments);
    return this._request("/appInfo/getAllApplications", options.params, options.callback);
}
FlurryClient.prototype.getAppMetrics = function() {
    var options = _parseArgs(["apiKey", "metricName", "startDate", "endDate"], arguments);
    options.params["apiKey"]    = options.apiKey;
    options.params["startDate"] = options.startDate;
    options.params["endDate"]   = options.endDate;
    return this._request("/appMetrics/" + options.metricName, options.params, options.callback);
}
FlurryClient.prototype.getEventMetricsSummary = function() {
    var options = _parseArgs(["apiKey", "startDate", "endDate"], arguments);
    options.params["apiKey"]    = options.apiKey;
    options.params["startDate"] = options.startDate;
    options.params["endDate"]   = options.endDate;
    return this._request("/eventMetrics/Summary", options.params, options.callback);
}
FlurryClient.prototype.getEventMetrics = function() {
    var options = _parseArgs(["apiKey", "eventName", "startDate", "endDate"], arguments);
    options.params["apiKey"]    = options.apiKey;
    options.params["eventName"] = options.eventName;
    options.params["startDate"] = options.startDate;
    options.params["endDate"]   = options.endDate;
    return this._request("/eventMetrics/Event", options.params, options.callback);
}

function _parseDate(date) {
    var m;
    if (m = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{2}) (\d{1,2}):(\d{2}) (\w+)/)) {
        return new Date(
            parseInt("20" + m[3], 10), 
            parseInt(m[1], 10)-1,
            parseInt(m[2], 10),
            parseInt(m[4], 10) + (m[6] === "PM" ? 12 : 0),
            parseInt(m[5], 10), 
            0, 0
        );
    } else if (m = date.match(/(\d+)-(\d+)-(\d+)/)) {
        return new Date(
            parseInt(m[1], 10), 
            parseInt(m[2], 10)-1,
            parseInt(m[3], 10)
        );
    } else {
        return date;
    }
}

function _formatDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return [date.getFullYear(), (month<10?"0":"")+month, (day<10?"0":"")+day].join("-");
}

function _transformObject(o) {
    var object = {};
    for (var k in o) {
        if (k.charAt(0) === "@") {
            if (/^@(date|(generated|created|start|end)Date)$/.test(k)) {
                object[k.slice(1)] = _parseDate(o[k]);
            } else if (/^\d+(\.\d+)?$/.test(o[k]) &&
                k !== "@version" && k !== "@name"
            ) {
                object[k.slice(1)] = parseFloat(o[k]);
            } else {
                object[k.slice(1)] = o[k];
            }
        } else if (Array.isArray(o[k])) {
            object[k + "s"] = o[k].map(_transformObject);
        } else {
            object[k] = _transformObject(o[k]);
        };
    }
    return object;
}

function _makeQuery(params) {
    return Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    }).join("&");
}
function _parseArgs(names, args) {
    function fail() {
        throw new Error("Expected arguments: " + names.join(",") + "[, params][, callback]");
    }
    var args = Array.prototype.slice.call(args);
    var options = {};
    names.forEach(function(name) {
        if (args.length === 0) {
            fail();
        }
        options[name] = args.shift();
    });
    if (args.length > 0 && typeof args[0] === "object") {
        options.params = args.shift();
    } else {
        options.params = {};
    }
    if (args.length > 0 && typeof args[0] === "function") {
        options.callback = args.shift();
    }
    if (args.length > 0) {
        fail();
    }
    return options;
}

function getBody(body) {
    var buffer = "";
    return Q.when(
        body.forEach(function(data) { buffer += data; }),
        function() { return buffer; }
    );
}

exports.daysAgo = function(days) {
    return new Date(new Date().getTime()-days*24*60*60*1000);
}
