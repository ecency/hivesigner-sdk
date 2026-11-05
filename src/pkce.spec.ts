import { Client } from './client'
import { createPkcePair, pkceChallengeFor } from './pkce'
import * as hivesigner from './index'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { webcrypto } = require('crypto') // @types/node 14 does not declare it

// Jest 26's node sandbox leaves out the Web Crypto global that Node 20+ and
// browsers have; give it Node's own.
beforeAll(() => {
	if (!(globalThis as any).crypto) (globalThis as any).crypto = webcrypto
})

// RFC 7636 appendix B.
const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'

describe('PKCE helpers', () => {
	it('computes the S256 challenge of a verifier (RFC 7636 test vector)', async () => {
		expect(await pkceChallengeFor(VERIFIER)).toBe(CHALLENGE)
	})

	it('makes a fresh verifier of 43 URL-safe characters and its challenge', async () => {
		const a = await createPkcePair()
		const b = await createPkcePair()
		expect(a.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
		expect(a.codeVerifier).not.toBe(b.codeVerifier)
		expect(a.codeChallenge).toBe(await pkceChallengeFor(a.codeVerifier))
	})

	it('says why when Web Crypto is missing', async () => {
		const saved = (globalThis as any).crypto
		;(globalThis as any).crypto = undefined
		try {
			await expect(createPkcePair()).rejects.toThrow(/Web Crypto/)
		} finally {
			;(globalThis as any).crypto = saved
		}
	})

	it('is exported from the package', () => {
		expect(hivesigner.createPkcePair).toBe(createPkcePair)
		expect(hivesigner.default.createPkcePair).toBe(createPkcePair)
	})
})

describe('Client with PKCE', () => {
	const client = () => new Client({
		app: 'myapp',
		callbackURL: 'myapp://callback',
		responseType: 'code',
		scope: ['posting'],
		accessToken: 'an-old-token',
	})

	it('adds the challenge and S256 to the login URL', () => {
		const url = new URL(client().getLoginURL('st', undefined, { codeChallenge: CHALLENGE }))
		expect(url.searchParams.get('code_challenge')).toBe(CHALLENGE)
		expect(url.searchParams.get('code_challenge_method')).toBe('S256')
		expect(url.searchParams.get('redirect_uri')).toBe('myapp://callback')
		expect(url.searchParams.get('response_type')).toBe('code')
	})

	it('adds no challenge to a token flow URL, where it means nothing', () => {
		const c = client()
		c.responseType = 'token'
		expect(c.getLoginURL('st', undefined, { codeChallenge: CHALLENGE })).not.toContain('code_challenge')
	})

	it('leaves the login URL as it was without a challenge', () => {
		const url = client().getLoginURL('st')
		expect(url).not.toContain('code_challenge')
	})

	it('exchanges a code with the verifier, without the access token header', async () => {
		const fetchMock = jest.fn().mockResolvedValue({
			status: 200,
			json: async () => ({ access_token: 'T', username: 'alice', expires_in: 604800 }),
		})
		global.fetch = fetchMock
		const tokens = await client().exchangeCode('CODE', VERIFIER)
		expect(tokens.access_token).toBe('T')
		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toBe('https://hivesigner.com/api/oauth2/token')
		expect(init.method).toBe('POST')
		// The API reads Authorization before the body's code: an old token sent
		// along would be exchanged instead of the code.
		expect(init.headers.Authorization).toBeUndefined()
		expect(JSON.parse(init.body)).toEqual({ code: 'CODE', code_verifier: VERIFIER })
	})

	it('sends the client secret too when a server passes one', async () => {
		const fetchMock = jest.fn().mockResolvedValue({ status: 200, json: async () => ({}) })
		global.fetch = fetchMock
		await client().exchangeCode('CODE', VERIFIER, 'SECRET')
		expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
			code: 'CODE', code_verifier: VERIFIER, client_secret: 'SECRET',
		})
	})

	it('rejects with the API error on a refused exchange', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			status: 401,
			json: async () => ({ error: 'invalid_grant', error_description: 'The code was already used' }),
		})
		await expect(client().exchangeCode('CODE', VERIFIER)).rejects.toEqual({
			error: 'invalid_grant', error_description: 'The code was already used',
		})
	})
})
