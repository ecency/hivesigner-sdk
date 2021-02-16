import { encodeOps, Parameters } from 'hive-uri'
import { isBrowser } from '../utilities'
import { BETA_URL } from '../consts'
import { CallbackFunction } from '../types'

export function sendOperations(ops: any[], params: Parameters, cb: CallbackFunction): string | void {
	const uri = encodeOps(ops, params)
	const webUrl = uri.replace('hive://', `${BETA_URL}/`)
	if (cb && isBrowser()) {
		const win = window.open(webUrl, '_blank')
		return win.focus()
	}
	return webUrl
}
