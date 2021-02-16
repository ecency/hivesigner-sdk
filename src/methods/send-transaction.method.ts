import { encodeTx, Parameters } from 'hive-uri'
import { BETA_URL } from '../consts'
import { isBrowser } from '../utilities'
import { CallbackFunction } from '../types'

export function sendTransaction(tx: any, params: Parameters, cb: CallbackFunction): string | void {
	const uri = encodeTx(tx, params)
	const webUrl = uri.replace('hive://', `${BETA_URL}/`)
	if (cb && isBrowser()) {
		const win = window.open(webUrl, '_blank')
		return win.focus()
	}
	return webUrl
}
