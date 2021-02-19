"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOperations = void 0;
var hive_uri_1 = require("hive-uri");
var utilities_1 = require("../utilities");
var consts_1 = require("../consts");
function sendOperations(ops, params, cb) {
    var uri = hive_uri_1.encodeOps(ops, params);
    var webUrl = uri.replace('hive://', consts_1.BETA_URL + "/");
    if (cb && utilities_1.isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}
exports.sendOperations = sendOperations;
//# sourceMappingURL=send-operations.method.js.map