import { BETA_URL } from '../consts';
import { encodeOp } from 'hive-uri';
import { isBrowser } from '../utilities';
export function sendOperation(op, params, cb) {
    var uri = encodeOp(op, params);
    var webUrl = uri.replace('hive://', BETA_URL + "/");
    if (cb && isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}
//# sourceMappingURL=send-operation.method.js.map