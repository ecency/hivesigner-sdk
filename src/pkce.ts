/**
 * PKCE (RFC 7636) for apps that cannot keep a client secret: a native app makes
 * a fresh verifier for every sign-in, sends only its S256 challenge to the
 * authorize page, and proves it holds the verifier when it exchanges the code.
 * See https://hivesigner.com/docs/pkce
 */

export interface PkcePair {
	/** Kept by the app until the exchange. Never put it in a URL. */
	codeVerifier: string
	/** Sent as `code_challenge` with `code_challenge_method=S256`. */
	codeChallenge: string
}

function subtleCrypto(): Crypto {
	const c = (globalThis as { crypto?: Crypto }).crypto
	if (!c || !c.subtle || typeof c.getRandomValues !== 'function') {
		throw new Error(
			'hivesigner: Web Crypto is not available. Node.js 20+ or a modern browser is required for PKCE.'
		)
	}
	return c
}

function base64url(bytes: Uint8Array): string {
	let binary = ''
	bytes.forEach((b) => {
		binary += String.fromCharCode(b)
	})
	const b64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** BASE64URL(SHA256(verifier)), the S256 challenge of a verifier. */
export async function pkceChallengeFor(codeVerifier: string): Promise<string> {
	const digest = await subtleCrypto().subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
	return base64url(new Uint8Array(digest))
}

/** A new verifier (32 random bytes, 43 characters) and its S256 challenge. */
export async function createPkcePair(): Promise<PkcePair> {
	const codeVerifier = base64url(subtleCrypto().getRandomValues(new Uint8Array(32)))
	return { codeVerifier, codeChallenge: await pkceChallengeFor(codeVerifier) }
}
