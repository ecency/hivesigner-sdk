import { BETA_URL } from '../consts'
import { encodeOp, Parameters } from 'hive-uri'
import { isBrowser } from '../utilities'

export function sendOperation(op: any, params: Parameters, cb: Function): string | void {
	const uri = encodeOp(op, params)
	const webUrl = uri.replace('hive://', `${BETA_URL}/`)
	if (cb && isBrowser()) {
		const win = window.open(webUrl, '_blank')
		return win.focus()
	}
	return webUrl
}
