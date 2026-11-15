export interface LoginOptions {
	state: string
	/** From createPkcePair: protects a code flow sign-in with PKCE. */
	codeChallenge?: string
}
