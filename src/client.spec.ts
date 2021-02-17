import { Client } from './client'
import { ClientConfig } from './types'
import { BASE_URL } from './consts'
import * as utilities from './utilities'

jest.mock('./utilities')

describe('Client', function () {
	let instance: Client
	let isBrowserMock: jest.Mock

	beforeEach(() => {
		instance = new Client({
			app: 'test-app',
			callbackURL: 'test-callback',
			apiURL: 'test-api-url',
			accessToken: 'test-access-token',
			responseType: 'test-response-type',
			scope: ['test-scope-item'],
		})

		isBrowserMock = utilities.isBrowser as jest.Mock
		isBrowserMock.mockReturnValue(false)
	})

	it('should create instance', function () {
		expect(new Client({} as ClientConfig)).toBeInstanceOf(Client)
	})

	it('should set api url', function () {
		instance.setApiURL('another-test-api-url')
		expect(instance.apiURL).toBe('another-test-api-url')
	})

	it('should set app', function () {
		instance.setApp('another-app')
		expect(instance.app).toBe('another-app')
	})

	it('should set callback url', function () {
		instance.setCallbackURL('another-url')
		expect(instance.callbackURL).toBe('another-url')
	})

	it('should set access token', function () {
		instance.setAccessToken('another-token')
		expect(instance.accessToken).toBe('another-token')
	})

	it('should remove access token', function () {
		instance.removeAccessToken()
		expect(instance.accessToken).toBeFalsy()
	})

	it('should set scope', function () {
		instance.setScope([])
		expect(instance.scope).toStrictEqual([])
	})

	it('should return login url', function () {
		instance.scope = null
		expect(instance.getLoginURL(''))
			.toBe(`${BASE_URL}/oauth2/authorize?client_id=test-app&redirect_uri=${encodeURIComponent(instance.callbackURL)}`)

		instance.scope = ['test-scope', 'test-scope-1']
		expect(instance.getLoginURL(''))
			.toBe(`${BASE_URL}/oauth2/authorize?client_id=test-app&redirect_uri=${encodeURIComponent(instance.callbackURL)}&scope=test-scope,test-scope-1`)

		instance.responseType = 'code'
		expect(instance.getLoginURL(''))
			.toBe(`${BASE_URL}/oauth2/authorize?client_id=test-app&redirect_uri=${encodeURIComponent(instance.callbackURL)}&response_type=code&scope=test-scope,test-scope-1`)

		expect(instance.getLoginURL('state'))
			.toBe(`${BASE_URL}/oauth2/authorize?client_id=test-app&redirect_uri=${encodeURIComponent(instance.callbackURL)}&response_type=code&scope=test-scope,test-scope-1&state=state`)
	})

	it('should change window location on login if its browser', function () {
		isBrowserMock.mockReturnValue(false)
		instance.login({ state: '' })
		expect(window.location).toBe('')

		isBrowserMock.mockReturnValue(true)
		instance.login({ state: '' })
		expect(window.location)
			.toBe(`${BASE_URL}/oauth2/authorize?client_id=test-app&redirect_uri=${encodeURIComponent(instance.callbackURL)}&scope=test-scope-item`)
	})
})