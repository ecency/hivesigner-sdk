import { encodeOps } from 'hive-uri';
import { isBrowser } from '../utilities';
import { BETA_URL } from '../consts';
export function sendOperations(ops, params, cb) {
    var uri = encodeOps(ops, params);
    var webUrl = uri.replace('hive://', BETA_URL + "/");
    if (cb && isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}
//# sourceMappingURL=send-operations.method.js.map