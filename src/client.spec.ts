import { Client } from './client'
import { ClientConfig } from './types'
import { API_URL, BASE_URL } from './consts'
import * as utilities from './utilities'

jest.mock('./utilities')

describe('Client', function () {
	let instance: Client
	let isBrowserMock: jest.Mock
	let fetchMock: jest.Mock
	let fetchResponseMock: { status: string | number, json: () => {} }

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

		fetchResponseMock = {
			status: 200,
			json: async () => ({ error: '' })
		}
		fetchMock = jest.fn().mockImplementation(async (...args: any[]) => fetchResponseMock)
		global.fetch = fetchMock
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/me`,{
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Authorization: 'test-access-token',
			},
			body: JSON.stringify({})
		})
		expect(response).toStrictEqual(await fetchResponseMock.json())
	})

	it('should return promise error on send call with if 200 status', async function () {
		fetchResponseMock = {
			status: 'not_200_OK',
			json: async () => ({ error: '' })
		}
		try {
			const response = await instance.send('me', 'POST', {})
			// Test should be broken
			console.error('Client.send not threw error')
			expect(true).toBe(false)
		} catch (failureResponse) {
			expect(failureResponse).toStrictEqual(await fetchResponseMock.json())
		}
	})

	it('should return promise error on send call if has json error', async function () {
		fetchResponseMock = {
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
			expect(failureResponse).toStrictEqual(await fetchResponseMock.json())
		}
	})

	it('should return promise with results on send call with callback', async function () {
		const callback = jest.fn().mockReturnValue('results')
		const response = await instance.send('me', 'POST', {}, callback)

		expect(callback).toHaveBeenCalled()
		expect(callback).toHaveBeenCalledWith(null, await fetchResponseMock.json())
		expect(callback).lastReturnedWith('results')
		expect(response).toBe('results')
	})

	it('should return promise with failure results on send call with callback', async function () {
		const callback = jest.fn().mockReturnValue('results')
		fetchResponseMock = {
			status: 'not_200_OK',
			json: async () => ({ error: '' })
		}
		const response = await instance.send('me', 'POST', {}, callback)


		expect(callback).toHaveBeenCalled()
		expect(callback).toHaveBeenCalledWith(await fetchResponseMock.json(), null)
		expect(callback).lastReturnedWith('results')
		expect(response).toBe('results')
	})

	it('should return promise on broadcast call', async function () {
		const response = await instance.broadcast([])
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/me`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/oauth2/token/revoke`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/broadcast`,{
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
		expect(global.fetch).toHaveBeenCalledWith(`${instance.apiURL}/api/me`,{
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

	describe('timeout', function () {
		// A fetch that, like the real one, never answers on its own and rejects
		// when its signal aborts.
		const hangingFetch = () => jest.fn().mockImplementation((_url: string, init: any) => new Promise((_resolve, reject) => {
			init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
		}))

		it('sends no signal when no timeout is set, as before', async function () {
			await instance.send('me', 'POST', {})
			expect(fetchMock.mock.calls[0][1].signal).toBeUndefined()
		})

		it('aborts a call that takes longer than the timeout from the config', async function () {
			global.fetch = hangingFetch()
			const client = new Client({ app: 'test-app', accessToken: 'test-access-token', timeout: 20 })
			await expect(client.me()).rejects.toMatchObject({ name: 'TimeoutError' })
		})

		it('aborts a call that takes longer than a timeout set later, and reports it to a callback', async function () {
			global.fetch = hangingFetch()
			expect(instance.setTimeout(20)).toBe(instance)
			const callback = jest.fn()
			await instance.me(callback)
			expect(callback).toHaveBeenCalledWith(expect.objectContaining({ name: 'TimeoutError' }), null)
		})

		it('applies to the code exchange too', async function () {
			global.fetch = hangingFetch()
			instance.setTimeout(20)
			await expect(instance.exchangeCode('code', 'verifier')).rejects.toMatchObject({ name: 'TimeoutError' })
		})

		it('does not abort a call that answers in time', async function () {
			instance.setTimeout(1000)
			await expect(instance.me()).resolves.toStrictEqual(await fetchResponseMock.json())
		})

		it('fails a body that cannot be serialized once, and leaves no timer behind', async function () {
			const unhandled = jest.fn()
			process.on('unhandledRejection', unhandled)
			try {
				instance.setTimeout(20)
				const circular: any = {}
				circular.self = circular
				await expect(instance.send('broadcast', 'POST', circular)).rejects.toBeInstanceOf(TypeError)
				await new Promise((resolve) => setTimeout(resolve, 60))
				expect(unhandled).not.toHaveBeenCalled()
			} finally {
				process.off('unhandledRejection', unhandled)
			}
		})

		it('cancels the request itself where AbortController exists', async function () {
			const aborted = jest.fn()
			class FakeAbortController {
				signal = { addEventListener: (_type: string, fn: () => void) => { this.listeners.push(fn) } }
				listeners: (() => void)[] = []
				abort() { aborted(); this.listeners.forEach((fn) => fn()) }
			}
			const original = (global as any).AbortController
			;(global as any).AbortController = FakeAbortController
			try {
				global.fetch = hangingFetch()
				instance.setTimeout(20)
				await expect(instance.me()).rejects.toMatchObject({ name: 'TimeoutError' })
				expect((global.fetch as jest.Mock).mock.calls[0][1].signal).toBeDefined()
				expect(aborted).toHaveBeenCalledTimes(1)
			} finally {
				;(global as any).AbortController = original
			}
		})
	})
})
