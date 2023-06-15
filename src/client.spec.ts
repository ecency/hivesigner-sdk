import { Client } from './client'
import { ClientConfig } from './types'
import { API_URL, BASE_URL } from './consts'
import * as utilities from './utilities'
import * as crossFetch from 'cross-fetch'

jest.mock('./utilities')
jest.mock('cross-fetch')

describe('Client', function () {
	let instance: Client
	let isBrowserMock: jest.Mock
	let crossFetchMock: jest.Mock
	let crossFetchResponseMock: { status: string | number, json: () => {} }

	beforeEach(() => {
		instance = new Client({
			app: 'test-app',
			callbackURL: 'test-callback',
			apiURL: API_URL,
			accessToken: 'test-access-token',
			responseType: 'test-response-type',
			scope: ['test-scope-item'],
		})

		isBrowserMock = utilities.isBrowser as jest.Mock
		isBrowserMock.mockReturnValue(false)

		crossFetchResponseMock = {
			status: 200,
			json: async () => ({ error: '' })
		}
		crossFetchMock = crossFetch.fetch as jest.Mock
		crossFetchMock.mockImplementation(async (...args: any[]) => crossFetchResponseMock)
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

		expect(instance.getLoginURL('state', 'demo'))
			.toBe(`${BASE_URL}/oauth2/authorize?client_id=test-app&redirect_uri=${encodeURIComponent(instance.callbackURL)}&response_type=code&scope=test-scope,test-scope-1&state=state&account=demo`)
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

	it('should return promise resolve on send call', async function () {
		const response = await instance.send('me', 'POST', {})
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/me`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({})
		})
		expect(response).toStrictEqual(await crossFetchResponseMock.json())
	})

	it('should return promise error on send call with if 200 status', async function () {
		crossFetchResponseMock = {
			status: 'not_200_OK',
			json: async () => ({ error: '' })
		}
		try {
			const response = await instance.send('me', 'POST', {})
			// Test should be broken
			console.error('Client.send not threw error')
			expect(true).toBe(false)
		} catch (failureResponse) {
			expect(failureResponse).toStrictEqual(await crossFetchResponseMock.json())
		}
	})

	it('should return promise error on send call if has json error', async function () {
		crossFetchResponseMock = {
			status: 200,
			json: async () => ({ error: 'I have an error' })
		}
		try {
			const response = await instance.send('me', 'POST', {})
			// Test should be broken
			console.error('Client.send not threw error')
			expect(true).toBe(false)
		} catch (failureResponse) {
			expect(failureResponse).toBeTruthy()
			expect(failureResponse).toStrictEqual(await crossFetchResponseMock.json())
		}
	})

	it('should return promise with results on send call with callback', async function () {
		const callback = jest.fn().mockReturnValue('results')
		const response = await instance.send('me', 'POST', {}, callback)

		expect(callback).toHaveBeenCalled()
		expect(callback).toHaveBeenCalledWith(null, await crossFetchResponseMock.json())
		expect(callback).lastReturnedWith('results')
		expect(response).toBe('results')
	})

	it('should return promise with failure results on send call with callback', async function () {
		const callback = jest.fn().mockReturnValue('results')
		crossFetchResponseMock = {
			status: 'not_200_OK',
			json: async () => ({ error: '' })
		}
		const response = await instance.send('me', 'POST', {}, callback)


		expect(callback).toHaveBeenCalled()
		expect(callback).toHaveBeenCalledWith(await crossFetchResponseMock.json(), null)
		expect(callback).lastReturnedWith('results')
		expect(response).toBe('results')
	})

	it('should return promise on broadcast call', async function () {
		const response = await instance.broadcast([])
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({ operations: [] })
		})
		expect(response).toBeTruthy()
	})

	it('should return promise on updateUserMetadata call', async function () {
		const response = await instance.updateUserMetadata({ username: '' })
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/me`,{
			method: 'PUT',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({ user_metadata: { username: '' } })
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return client instance on revokeToken call', async function () {
		const response = await instance.revokeToken()
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/oauth2/token/revoke`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({ token: 'test-access-token' })
		})
		expect(response).toBeInstanceOf(Client)
	})

	it('should send request and return promise on claimRewardBalance call', async function () {
		const response = await instance.claimRewardBalance('', '', '', '')
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['claim_reward_balance', {
					account: '',
					reward_hive: '',
					reward_hbd: '',
					reward_vests: ''
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on custom json call', async function () {
		const response = await instance.customJson('', '', '', {})
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['custom_json', {
					required_auths: '',
					required_posting_auths: '',
					id: '',
					json: {}
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on ignore call', async function () {
		const response = await instance.ignore('', '')
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['custom_json', {
					required_auths: [],
					required_posting_auths: [''],
					id: 'follow',
					json: JSON.stringify(['follow', {
						follower: '',
						following: '',
						what: ['ignore']
					}])
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on unfollow call', async function () {
		const response = await instance.unfollow('', '')
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['custom_json', {
					required_auths: [],
					required_posting_auths: [''],
					id: 'follow',
					json: JSON.stringify(['follow', {
						follower: '',
						following: '',
						what: []
					}])
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on follow call', async function () {
		const response = await instance.follow('', '')
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['custom_json', {
					required_auths: [],
					required_posting_auths: [''],
					id: 'follow',
					json: JSON.stringify(['follow', {
						follower: '',
						following: '',
						what: ['blog']
					}])
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on reblog call', async function () {
		const response = await instance.reblog('', '', '')
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['custom_json', {
					required_auths: [],
					required_posting_auths: [''],
					id: 'follow',
					json: JSON.stringify(['reblog', {
						account: '',
						author: '',
						permlink: ''
					}])
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on deleteComment call', async function () {
		const response = await instance.deleteComment('', '')
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['delete_comment', {
					author: '',
					permlink: ''
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on comment call', async function () {
		let response = await instance.comment('', '', '', '', '', {}, {})
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['comment', {
					parent_author: '',
					parent_permlink: '',
					author: '',
					permlink: '',
					title: '',
					body: {},
					json_metadata: JSON.stringify({})
				}]]
			})
		})
		expect(response).toBeTruthy()

		response = await instance.comment('', '', '', '', '', {}, 'meta')
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['comment', {
					parent_author: '',
					parent_permlink: '',
					author: '',
					permlink: '',
					title: '',
					body: {},
					json_metadata: 'meta'
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on vote call', async function () {
		const response = await instance.vote('', '', '', 0)
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({
				operations: [['vote', {
					voter: '',
					author: '',
					permlink: '',
					weight: 0
				}]]
			})
		})
		expect(response).toBeTruthy()
	})

	it('should send request and return promise on me call', async function () {
		const response = await instance.me()
		expect(crossFetch.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/me`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({})
		})
		expect(response).toBeTruthy()
	})
})
