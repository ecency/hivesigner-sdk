'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var hiveUri = require('hive-uri');

const API_URL = 'https://hivesigner.com';

const BASE_URL = 'https://hivesigner.com';

const BETA_URL = 'https://hivesigner.com';

function isBrowser() {
    return typeof window !== 'undefined' && !!window;
}

class Client {
    constructor(config) {
        this.apiURL = config.apiURL || API_URL;
        this.app = config.app;
        this.callbackURL = config.callbackURL;
        this.accessToken = config.accessToken;
        this.scope = config.scope;
        this.responseType = config.responseType;
    }
    setBaseURL() {
        console.warn('The function "setBaseUrl" is deprecated, the base URL is always "https://hivesigner.com", you can only change the API URL with "setApiURL"');
        return this;
    }
    setApiURL(url) {
        this.apiURL = url;
        return this;
    }
    setApp(app) {
        this.app = app;
        return this;
    }
    setCallbackURL(url) {
        this.callbackURL = url;
        return this;
    }
    setAccessToken(accessToken) {
        this.accessToken = accessToken;
        return this;
    }
    removeAccessToken() {
        delete this.accessToken;
        return this;
    }
    setScope(scope) {
        this.scope = scope;
        return this;
    }
    getLoginURL(state, account) {
        const redirectUri = encodeURIComponent(this.callbackURL);
        let loginURL = `${BASE_URL}/oauth2/authorize?client_id=${this.app}&redirect_uri=${redirectUri}`;
        if (this.responseType === 'code') {
            loginURL += `&response_type=${this.responseType}`;
        }
        if (this.scope) {
            loginURL += `&scope=${this.scope.join(',')}`;
        }
        if (state) {
            loginURL += `&state=${encodeURIComponent(state)}`;
        }
        if (account) {
            loginURL += `&account=${encodeURIComponent(account)}`;
        }
        return loginURL;
    }
    login(options) {
        if (isBrowser()) {
            // @ts-ignore
            window.location = this.getLoginURL(options.state);
        }
    }
    me(cb) {
        return this.send('me', 'POST', {}, cb);
    }
    decode(memo, cb) {
        return this.send('decode', 'POST', { memo: memo }, cb);
    }
    vote(voter, author, permlink, weight, cb) {
        const params = {
            voter,
            author,
            permlink,
            weight
        };
        return this.broadcast([['vote', params]], cb);
    }
    comment(parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, cb) {
        let json = jsonMetadata;
        if (typeof jsonMetadata !== 'string') {
            json = JSON.stringify(jsonMetadata);
        }
        const params = {
            parent_author: parentAuthor,
            parent_permlink: parentPermlink,
            author,
            permlink,
            title,
            body,
            json_metadata: json
        };
        return this.broadcast([['comment', params]], cb);
    }
    deleteComment(author, permlink, cb) {
        const params = {
            author,
            permlink
        };
        return this.broadcast([['delete_comment', params]], cb);
    }
    customJson(requiredAuths, requiredPostingAuths, id, json, cb) {
        const params = {
            required_auths: requiredAuths,
            required_posting_auths: requiredPostingAuths,
            id,
            json
        };
        return this.broadcast([['custom_json', params]], cb);
    }
    reblog(account, author, permlink, cb) {
        const json = ['reblog', { account, author, permlink }];
        return this.customJson([], [account], 'follow', JSON.stringify(json), cb);
    }
    follow(follower, following, cb) {
        const json = ['follow', { follower, following, what: ['blog'] }];
        return this.customJson([], [follower], 'follow', JSON.stringify(json), cb);
    }
    unfollow(unfollower, unfollowing, cb) {
        const json = ['follow', { follower: unfollower, following: unfollowing, what: [] }];
        return this.customJson([], [unfollower], 'follow', JSON.stringify(json), cb);
    }
    ignore(follower, following, cb) {
        const json = ['follow', { follower, following, what: ['ignore'] }];
        return this.customJson([], [follower], 'follow', JSON.stringify(json), cb);
    }
    claimRewardBalance(account, rewardHive, rewardHbd, rewardVests, cb) {
        const params = {
            account,
            reward_hive: rewardHive,
            reward_hbd: rewardHbd,
            reward_vests: rewardVests
        };
        return this.broadcast([['claim_reward_balance', params]], cb);
    }
    async revokeToken(cb) {
        await this.send('oauth2/token/revoke', 'POST', { token: this.accessToken }, cb);
        return this.removeAccessToken();
    }
    updateUserMetadata(metadata = {}, cb) {
        console.warn('The function "updateUserMetadata" is deprecated.');
        return this.send('me', 'PUT', { user_metadata: metadata }, cb);
    }
    async send(route, method, body, cb) {
        const url = `${this.apiURL}/api/${route}`;
        if (!cb) {
            return this.makeRequest(url, method, body);
        }
        try {
            const json = await this.makeRequest(url, method, body);
            return cb(null, json);
        }
        catch (failureResponse) {
            return cb(failureResponse, null);
        }
    }
    broadcast(operations, cb) {
        return this.send('broadcast', 'POST', { operations }, cb);
    }
    async makeRequest(url, method, body) {
        if (typeof globalThis.fetch !== 'function') {
            throw new Error('hivesigner: fetch is not available. Node.js 18+ or a modern browser is required. ' +
                'If you are in an older environment, provide a global fetch polyfill.');
        }
        const response = await globalThis.fetch(url, {
            method,
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                Authorization: this.accessToken,
            },
            body: JSON.stringify(body),
        });
        const json = await response.json();
        if (response.status !== 200 || json.error) {
            throw json;
        }
        return json;
    }
}

function sign(name, params, redirectUri) {
    console.warn('The function "sign" is deprecated.');
    if (typeof name !== 'string' || typeof params !== 'object' || params === null) {
        return {
            error: 'invalid_request',
            error_description: 'Request has an invalid format'
        };
    }
    let url = `${BASE_URL}/sign/${name}?`;
    url += Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    url += redirectUri ? `&redirect_uri=${encodeURIComponent(redirectUri)}` : '';
    return url;
}

function sendOperation(op, params, cb) {
    const uri = hiveUri.encodeOp(op, params);
    const webUrl = uri.replace('hive://', `${BETA_URL}/`);
    if (cb && isBrowser()) {
        const win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}

function sendOperations(ops, params, cb) {
    const uri = hiveUri.encodeOps(ops, params);
    const webUrl = uri.replace('hive://', `${BETA_URL}/`);
    if (cb && isBrowser()) {
        const win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}

function sendTransaction(tx, params, cb) {
    const uri = hiveUri.encodeTx(tx, params);
    const webUrl = uri.replace('hive://', `${BETA_URL}/`);
    if (cb && isBrowser()) {
        const win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}

function Initialize(config) {
    console.warn('The function "Initialize" is deprecated, please use the class "Client" instead.');
    return new Client(config);
}

var index = {
    Client,
    Initialize,
    sendTransaction,
    sendOperations,
    sendOperation,
    sign
};

exports.Client = Client;
exports.Initialize = Initialize;
exports["default"] = index;
exports.sendOperation = sendOperation;
exports.sendOperations = sendOperations;
exports.sendTransaction = sendTransaction;
exports.sign = sign;
