import { CallbackFunction, ClientConfig, LoginOptions, Operation, SendResponse, TokenResponse } from './types'
import { API_URL, BASE_URL } from './consts'
import { isBrowser } from './utilities'

export class Client {
	public apiURL: string
	public app: string
	public callbackURL: string
	public scope: string[]
	public responseType: string
	public accessToken?: string

	constructor(config: ClientConfig) {
		this.apiURL = config.apiURL || API_URL
		this.app = config.app
		this.callbackURL = config.callbackURL
		this.accessToken = config.accessToken
		this.scope = config.scope
		this.responseType = config.responseType
	}

	public setBaseURL(): this {
		console.warn(
			'The function "setBaseUrl" is deprecated, the base URL is always "https://hivesigner.com", you can only change the API URL with "setApiURL"'
		)
		return this
	}

	public setApiURL(url: string): this {
		this.apiURL = url
		return this
	}

	public setApp(app: string): this {
		this.app = app
		return this
	}

	public setCallbackURL(url: string): this {
		this.callbackURL = url
		return this
	}

	public setAccessToken(accessToken: string): this {
		this.accessToken = accessToken
		return this
	}

	public removeAccessToken(): this {
		delete this.accessToken
		return this
	}

	public setScope(scope: string[]): this {
		this.scope = scope
		return this
	}

	/**
	 * The authorize URL. Pass `options.codeChallenge` (from createPkcePair) to
	 * protect a code flow sign-in with PKCE, which a native app needs for a
	 * custom scheme callback such as `myapp://callback`.
	 */
	public getLoginURL(state: string, account?: string, options: { codeChallenge?: string } = {}): string {
		const redirectUri = encodeURIComponent(this.callbackURL)
		let loginURL = `${BASE_URL}/oauth2/authorize?client_id=${this.app}&redirect_uri=${redirectUri}`
		if (this.responseType === 'code') {
			loginURL += `&response_type=${this.responseType}`
		}
		if (this.scope) {
			loginURL += `&scope=${this.scope.join(',')}`
		}
		if (state) {
			loginURL += `&state=${encodeURIComponent(state)}`
		}
		if (account) {
			loginURL += `&account=${encodeURIComponent(account)}`
		}
		// PKCE protects a code: the token flow has none, and Hivesigner ignores it there.
		if (options.codeChallenge && this.responseType === 'code') {
			loginURL += `&code_challenge=${encodeURIComponent(options.codeChallenge)}&code_challenge_method=S256`
		}
		return loginURL
	}

	public login(options: LoginOptions): void {
		if (isBrowser()) {
			// @ts-ignore
			window.location = this.getLoginURL(options.state, undefined, { codeChallenge: options.codeChallenge })
		}
	}

	/**
	 * Exchange a code for tokens at /api/oauth2/token. With PKCE send the
	 * verifier; a native app sends no secret and gets no refresh token. A
	 * server may pass its client secret as well.
	 *
	 * Sent WITHOUT the Authorization header: the API reads that header before
	 * the body, so a token this client already holds would be read instead of
	 * the code.
	 */
	public async exchangeCode(code: string, codeVerifier?: string, clientSecret?: string): Promise<TokenResponse> {
		const body: Record<string, string> = { code }
		if (codeVerifier) body.code_verifier = codeVerifier
		if (clientSecret) body.client_secret = clientSecret
		return (await this.makeRequest(`${this.apiURL}/api/oauth2/token`, 'POST', body, false)) as unknown as TokenResponse
	}

	public me(): Promise<SendResponse>
	public me(cb: CallbackFunction): Promise<SendResponse>
	public me(cb?: CallbackFunction): Promise<SendResponse> {
		return this.send('me', 'POST', {}, cb)
	}

	public decode(memo: string): Promise<SendResponse>
	public decode(memo: string, cb: CallbackFunction): Promise<SendResponse>
	public decode(memo: string, cb?: CallbackFunction): Promise<SendResponse> {
		return this.send('decode', 'POST', {memo: memo}, cb)
	}

	public vote(voter: string, author: string, permlink: string, weight: string | number): Promise<SendResponse>
	public vote(
		voter: string,
		author: string,
		permlink: string,
		weight: string | number,
		cb: CallbackFunction
	): Promise<SendResponse>
	public vote(
		voter: string,
		author: string,
		permlink: string,
		weight: string | number,
		cb?: CallbackFunction
	): Promise<SendResponse> {
		const params = {
			voter,
			author,
			permlink,
			weight
		}
		return this.broadcast([['vote', params]], cb)
	}

	public comment(
		parentAuthor: string,
		parentPermlink: string,
		author: string,
		permlink: string,
		title: string,
		body: any,
		jsonMetadata: any
	): Promise<SendResponse>
	public comment(
		parentAuthor: string,
		parentPermlink: string,
		author: string,
		permlink: string,
		title: string,
		body: any,
		jsonMetadata: any,
		cb: CallbackFunction
	): Promise<SendResponse>
	public comment(
		parentAuthor: string,
		parentPermlink: string,
		author: string,
		permlink: string,
		title: string,
		body: any,
		jsonMetadata: any,
		cb?: CallbackFunction
	): Promise<SendResponse> {
		let json = jsonMetadata
		if (typeof jsonMetadata !== 'string') {
			json = JSON.stringify(jsonMetadata)
		}
		const params = {
			parent_author: parentAuthor,
			parent_permlink: parentPermlink,
			author,
			permlink,
			title,
			body,
			json_metadata: json
		}
		return this.broadcast([['comment', params]], cb)
	}

	public deleteComment(author: string, permlink: string): Promise<SendResponse>
	public deleteComment(author: string, permlink: string, cb: CallbackFunction): Promise<SendResponse>
	public deleteComment(author: string, permlink: string, cb?: CallbackFunction): Promise<SendResponse> {
		const params = {
			author,
			permlink
		}
		return this.broadcast([['delete_comment', params]], cb)
	}

	public customJson(requiredAuths: any, requiredPostingAuths: any, id: string, json: any): Promise<SendResponse>
	public customJson(
		requiredAuths: any,
		requiredPostingAuths: any,
		id: string,
		json: any,
		cb: CallbackFunction
	): Promise<SendResponse>
	public customJson(
		requiredAuths: any,
		requiredPostingAuths: any,
		id: string,
		json: any,
		cb?: CallbackFunction
	): Promise<SendResponse> {
		const params = {
			required_auths: requiredAuths,
			required_posting_auths: requiredPostingAuths,
			id,
			json
		}
		return this.broadcast([['custom_json', params]], cb)
	}

	public reblog(account: string, author: string, permlink: string): Promise<SendResponse>
	public reblog(account: string, author: string, permlink: string, cb: CallbackFunction): Promise<SendResponse>
	public reblog(account: string, author: string, permlink: string, cb?: CallbackFunction): Promise<SendResponse> {
		const json = ['reblog', { account, author, permlink }]
		return this.customJson([], [account], 'follow', JSON.stringify(json), cb)
	}

	public follow(follower: string, following: string): Promise<SendResponse>
	public follow(follower: string, following: string, cb: CallbackFunction): Promise<SendResponse>
	public follow(follower: string, following: string, cb?: CallbackFunction): Promise<SendResponse> {
		const json = ['follow', { follower, following, what: ['blog'] }]
		return this.customJson([], [follower], 'follow', JSON.stringify(json), cb)
	}

	public unfollow(unfollower: string, unfollowing: string): Promise<SendResponse>
	public unfollow(unfollower: string, unfollowing: string, cb: CallbackFunction): Promise<SendResponse>
	public unfollow(unfollower: string, unfollowing: string, cb?: CallbackFunction): Promise<SendResponse> {
		const json = ['follow', { follower: unfollower, following: unfollowing, what: <string[]>[] }]
		return this.customJson([], [unfollower], 'follow', JSON.stringify(json), cb)
	}

	public ignore(follower: string, following: string): Promise<SendResponse>
	public ignore(follower: string, following: string, cb: CallbackFunction): Promise<SendResponse>
	public ignore(follower: string, following: string, cb?: CallbackFunction): Promise<SendResponse> {
		const json = ['follow', { follower, following, what: ['ignore'] }]
		return this.customJson([], [follower], 'follow', JSON.stringify(json), cb)
	}

	public claimRewardBalance(
		account: string,
		rewardHive: string,
		rewardHbd: string,
		rewardVests: string,
	): Promise<SendResponse>
	public claimRewardBalance(
		account: string,
		rewardHive: string,
		rewardHbd: string,
		rewardVests: string,
		cb: CallbackFunction
	): Promise<SendResponse>
	public claimRewardBalance(
		account: string,
		rewardHive: string,
		rewardHbd: string,
		rewardVests: string,
		cb?: CallbackFunction
	): Promise<SendResponse> {
		const params = {
			account,
			reward_hive: rewardHive,
			reward_hbd: rewardHbd,
			reward_vests: rewardVests
		}
		return this.broadcast([['claim_reward_balance', params]], cb)
	}

	public async revokeToken(): Promise<Client>
	public async revokeToken(cb: CallbackFunction): Promise<Client>
	public async revokeToken(cb?: CallbackFunction): Promise<Client> {
		await this.send('oauth2/token/revoke', 'POST', { token: this.accessToken }, cb)
		return this.removeAccessToken()
	}

	public updateUserMetadata(metadata: any): Promise<SendResponse>
	public updateUserMetadata(metadata: any, cb: CallbackFunction): Promise<SendResponse>
	public updateUserMetadata(metadata: any = {}, cb?: CallbackFunction): Promise<SendResponse> {
		console.warn('The function "updateUserMetadata" is deprecated.')
		return this.send('me', 'PUT', { user_metadata: metadata }, cb)
	}

	public async send(route: string, method: string, body: any): Promise<SendResponse>
	public async send(route: string, method: string, body: any, cb: CallbackFunction): Promise<SendResponse>
	public async send(route: string, method: string, body: any, cb?: CallbackFunction): Promise<SendResponse> {
		const url = `${this.apiURL}/api/${route}`

		if (!cb) {
			return this.makeRequest(url, method, body)
		}

		try {
			const json = await this.makeRequest(url, method, body)
			return cb(null, json)
		} catch (failureResponse) {
			return cb(failureResponse, null)
		}
	}

	public broadcast(operations: Operation[]): Promise<SendResponse>
	public broadcast(operations: Operation[], cb: CallbackFunction): Promise<SendResponse>
	public broadcast(operations: Operation[], cb?: CallbackFunction): Promise<SendResponse> {
		return this.send('broadcast', 'POST', { operations }, cb)
	}

	private async makeRequest(url: string, method: string, body: any, withToken = true): Promise<SendResponse> {
		if (typeof globalThis.fetch !== 'function') {
			throw new Error(
				'hivesigner: fetch is not available. Node.js 18+ or a modern browser is required. ' +
				'If you are in an older environment, provide a global fetch polyfill.'
			)
		}
		const response = await globalThis.fetch(url, {
			method,
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				...(withToken ? { Authorization: this.accessToken } : {}),
			},
			body: JSON.stringify(body),
		})

		const json = await response.json()

		if (response.status !== 200 || json.error) {
			throw json
		}

		return json
	}
}
