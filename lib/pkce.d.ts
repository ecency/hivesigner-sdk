/**
 * PKCE (RFC 7636) for apps that cannot keep a client secret: a native app makes
 * a fresh verifier for every sign-in, sends only its S256 challenge to the
 * authorize page, and proves it holds the verifier when it exchanges the code.
 * See https://hivesigner.com/docs/pkce
 */
export interface PkcePair {
    /** Kept by the app until the exchange. Never put it in a URL. */
    codeVerifier: string;
    /** Sent as `code_challenge` with `code_challenge_method=S256`. */
    codeChallenge: string;
}
/** BASE64URL(SHA256(verifier)), the S256 challenge of a verifier. */
export declare function pkceChallengeFor(codeVerifier: string): Promise<string>;
/** A new verifier (32 random bytes, 43 characters) and its S256 challenge. */
export declare function createPkcePair(): Promise<PkcePair>;
