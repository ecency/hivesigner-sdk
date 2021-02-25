import { encodeTx } from 'hive-uri';
import { BETA_URL } from '../consts';
import { isBrowser } from '../utilities';
export function sendTransaction(tx, params, cb) {
    var uri = encodeTx(tx, params);
    var webUrl = uri.replace('hive://', BETA_URL + "/");
    if (cb && isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}
//# sourceMappingURL=send-transaction.method.js.map