export interface ClientConfig {
    apiURL?: string;
    app?: string;
    callbackURL?: string;
    scope?: string[];
    responseType?: string;
    accessToken?: string;
    /** Abort an API call that has not answered after this many milliseconds. No limit when unset. */
    timeout?: number;
}
