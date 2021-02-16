import { encodeTx, Parameters } from 'hive-uri'
import { BETA_URL } from '../consts'
import { isBrowser } from '../utilities'

export function sendTransaction(tx: any, params: Parameters, cb: Function): string | void {
	const uri = encodeTx(tx, params)
	const webUrl = uri.replace('hive://', `${BETA_URL}/`)
	if (cb && isBrowser()) {
		const win = window.open(webUrl, '_blank')
		return win.focus()
	}
	return webUrl
}
