"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOperation = void 0;
var consts_1 = require("../consts");
var hive_uri_1 = require("hive-uri");
var utilities_1 = require("../utilities");
function sendOperation(op, params, cb) {
    var uri = hive_uri_1.encodeOp(op, params);
    var webUrl = uri.replace('hive://', consts_1.BETA_URL + "/");
    if (cb && utilities_1.isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}
exports.sendOperation = sendOperation;
//# sourceMappingURL=send-operation.method.js.map