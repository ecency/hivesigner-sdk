"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = void 0;
var hive_uri_1 = require("hive-uri");
var consts_1 = require("../consts");
var utilities_1 = require("../utilities");
function sendTransaction(tx, params, cb) {
    var uri = hive_uri_1.encodeTx(tx, params);
    var webUrl = uri.replace('hive://', consts_1.BETA_URL + "/");
    if (cb && utilities_1.isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}
exports.sendTransaction = sendTransaction;
//# sourceMappingURL=send-transaction.method.js.map