import { BASE_URL } from '../consts'
import { SignErrors } from '../types'

export function sign(name: string, params: Record<string, any>, redirectUri: string): string | SignErrors {
	console.warn('The function "sign" is deprecated.')
	if (typeof name !== 'string' || typeof params !== 'object') {
		return {
			error: 'invalid_request',
			error_description: 'Request has an invalid format',
		}
	}
	let url = `${BASE_URL}/sign/${name}?`
	url += Object.keys(params)
		.map(key => `${key}=${encodeURIComponent(params[key])}`)
		.join('&')
	url += redirectUri ? `&redirect_uri=${encodeURIComponent(redirectUri)}` : ''
	return url
}