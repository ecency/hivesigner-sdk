"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = void 0;
var consts_1 = require("../consts");
function sign(name, params, redirectUri) {
    console.warn('The function "sign" is deprecated.');
    if (typeof name !== 'string' || typeof params !== 'object' || params === null) {
        return {
            error: 'invalid_request',
            error_description: 'Request has an invalid format'
        };
    }
    var url = consts_1.BASE_URL + "/sign/" + name + "?";
    url += Object.keys(params)
        .map(function (key) { return key + "=" + encodeURIComponent(params[key]); })
        .join('&');
    url += redirectUri ? "&redirect_uri=" + encodeURIComponent(redirectUri) : '';
    return url;
}
exports.sign = sign;
//# sourceMappingURL=sign.method.js.map