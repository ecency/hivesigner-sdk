/** What /api/oauth2/token answers. `refresh_token` is absent for a PKCE
    exchange without a client secret. */
export interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    username: string;
}
