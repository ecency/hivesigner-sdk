import { sign } from './sign.method'
import { BASE_URL } from '../consts'

describe('Sign method', function () {
	let name: string
	let params: Record<string, string | number | boolean>
	let redirectUri: string

	beforeEach(() => {
		name = ''
		params = {}
		redirectUri = ''
	})

	it('should return url if given correct parameters', function () {
		name = 'name'
		params = { one: 'one', two: 'two' }
		redirectUri = 'https://example.com'

		expect(sign(name, params, redirectUri))
			.toBe(`${BASE_URL}/sign/name?one=one&two=two&redirect_uri=https%3A%2F%2Fexample.com`)
	})

	it('should return url if given correct parameters without redirect uri', function () {
		name = 'name'
		params = { one: 'one', two: 'two' }
		redirectUri = null

		expect(sign(name, params, redirectUri)).toBe(`${BASE_URL}/sign/name?one=one&two=two`)
	})

	it('should return url if given correct name and empty parameters', function () {
		name = 'name'

		expect(sign(name, params, redirectUri)).toBe(`${BASE_URL}/sign/name?`)
	})

	it('should return error if given incorrect name', function () {
		name = null

		expect(sign(name, params, redirectUri)).toStrictEqual({
			error: 'invalid_request',
			error_description: 'Request has an invalid format'
		})
	})

	it('should return error if given incorrect params', function () {
		params = undefined
		expect(sign(name, params, redirectUri)).toStrictEqual({
			error: 'invalid_request',
			error_description: 'Request has an invalid format'
		})

		params = undefined
		expect(sign(name, params, redirectUri)).toStrictEqual({
			error: 'invalid_request',
			error_description: 'Request has an invalid format'
		})
	})
})
