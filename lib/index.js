'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fetch = require('cross-fetch');
var hiveUri = require('hive-uri');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var API_URL = 'https://hivesigner.com';

var BASE_URL = 'https://hivesigner.com';

var BETA_URL = 'https://hivesigner.com';

function isBrowser() {
    return typeof window !== 'undefined' && !!window;
}

var Client = /** @class */ (function () {
    function Client(config) {
        this.apiURL = config.apiURL || API_URL;
        this.app = config.app;
        this.callbackURL = config.callbackURL;
        this.accessToken = config.accessToken;
        this.scope = config.scope;
        this.responseType = config.responseType;
    }
    Client.prototype.setBaseURL = function () {
        console.warn('The function "setBaseUrl" is deprecated, the base URL is always "https://hivesigner.com", you can only change the API URL with "setApiURL"');
        return this;
    };
    Client.prototype.setApiURL = function (url) {
        this.apiURL = url;
        return this;
    };
    Client.prototype.setApp = function (app) {
        this.app = app;
        return this;
    };
    Client.prototype.setCallbackURL = function (url) {
        this.callbackURL = url;
        return this;
    };
    Client.prototype.setAccessToken = function (accessToken) {
        this.accessToken = accessToken;
        return this;
    };
    Client.prototype.removeAccessToken = function () {
        delete this.accessToken;
        return this;
    };
    Client.prototype.setScope = function (scope) {
        this.scope = scope;
        return this;
    };
    Client.prototype.getLoginURL = function (state, select_account) {
        var redirectUri = encodeURIComponent(this.callbackURL);
        var loginURL = BASE_URL + "/oauth2/authorize?client_id=" + this.app + "&redirect_uri=" + redirectUri;
        if (this.responseType === 'code') {
            loginURL += "&response_type=" + this.responseType;
        }
        if (this.scope) {
            loginURL += "&scope=" + this.scope.join(',');
        }
        if (state) {
            loginURL += "&state=" + encodeURIComponent(state);
        }
        if (select_account) {
            loginURL += "&select_account=" + select_account;
        }
        return loginURL;
    };
    Client.prototype.login = function (options) {
        if (isBrowser()) {
            // @ts-ignore
            window.location = this.getLoginURL(options.state);
        }
    };
    Client.prototype.me = function (cb) {
        return this.send('me', 'POST', {}, cb);
    };
    Client.prototype.vote = function (voter, author, permlink, weight, cb) {
        var params = {
            voter: voter,
            author: author,
            permlink: permlink,
            weight: weight
        };
        return this.broadcast([['vote', params]], cb);
    };
    Client.prototype.comment = function (parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, cb) {
        var json = jsonMetadata;
        if (typeof jsonMetadata !== 'string') {
            json = JSON.stringify(jsonMetadata);
        }
        var params = {
            parent_author: parentAuthor,
            parent_permlink: parentPermlink,
            author: author,
            permlink: permlink,
            title: title,
            body: body,
            json_metadata: json
        };
        return this.broadcast([['comment', params]], cb);
    };
    Client.prototype.deleteComment = function (author, permlink, cb) {
        var params = {
            author: author,
            permlink: permlink
        };
        return this.broadcast([['delete_comment', params]], cb);
    };
    Client.prototype.customJson = function (requiredAuths, requiredPostingAuths, id, json, cb) {
        var params = {
            required_auths: requiredAuths,
            required_posting_auths: requiredPostingAuths,
            id: id,
            json: json
        };
        return this.broadcast([['custom_json', params]], cb);
    };
    Client.prototype.reblog = function (account, author, permlink, cb) {
        var json = ['reblog', { account: account, author: author, permlink: permlink }];
        return this.customJson([], [account], 'follow', JSON.stringify(json), cb);
    };
    Client.prototype.follow = function (follower, following, cb) {
        var json = ['follow', { follower: follower, following: following, what: ['blog'] }];
        return this.customJson([], [follower], 'follow', JSON.stringify(json), cb);
    };
    Client.prototype.unfollow = function (unfollower, unfollowing, cb) {
        var json = ['follow', { follower: unfollower, following: unfollowing, what: [] }];
        return this.customJson([], [unfollower], 'follow', JSON.stringify(json), cb);
    };
    Client.prototype.ignore = function (follower, following, cb) {
        var json = ['follow', { follower: follower, following: following, what: ['ignore'] }];
        return this.customJson([], [follower], 'follow', JSON.stringify(json), cb);
    };
    Client.prototype.claimRewardBalance = function (account, rewardHive, rewardHbd, rewardVests, cb) {
        var params = {
            account: account,
            reward_hive: rewardHive,
            reward_hbd: rewardHbd,
            reward_vests: rewardVests
        };
        return this.broadcast([['claim_reward_balance', params]], cb);
    };
    Client.prototype.revokeToken = function (cb) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send('oauth2/token/revoke', 'POST', { token: this.accessToken }, cb)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.removeAccessToken()];
                }
            });
        });
    };
    Client.prototype.updateUserMetadata = function (metadata, cb) {
        if (metadata === void 0) { metadata = {}; }
        console.warn('The function "updateUserMetadata" is deprecated.');
        return this.send('me', 'PUT', { user_metadata: metadata }, cb);
    };
    Client.prototype.send = function (route, method, body, cb) {
        return __awaiter(this, void 0, Promise, function () {
            var url, json, failureResponse_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.apiURL + "/api/" + route;
                        if (!cb) {
                            return [2 /*return*/, this.makeRequest(url, method, body)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest(url, method, body)];
                    case 2:
                        json = _a.sent();
                        return [2 /*return*/, cb(null, json)];
                    case 3:
                        failureResponse_1 = _a.sent();
                        return [2 /*return*/, cb(failureResponse_1, null)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.broadcast = function (operations, cb) {
        return this.send('broadcast', 'POST', { operations: operations }, cb);
    };
    Client.prototype.makeRequest = function (url, method, body) {
        return __awaiter(this, void 0, Promise, function () {
            var response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch__default['default'](url, {
                            method: method,
                            headers: {
                                Accept: 'application/json, text/plain, */*',
                                'Content-Type': 'application/json',
                                Authorization: this.accessToken,
                            },
                            body: JSON.stringify(body),
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        if (response.status !== 200 || json.error) {
                            throw json;
                        }
                        return [2 /*return*/, json];
                }
            });
        });
    };
    return Client;
}());

function sign(name, params, redirectUri) {
    console.warn('The function "sign" is deprecated.');
    if (typeof name !== 'string' || typeof params !== 'object' || params === null) {
        return {
            error: 'invalid_request',
            error_description: 'Request has an invalid format'
        };
    }
    var url = BASE_URL + "/sign/" + name + "?";
    url += Object.keys(params)
        .map(function (key) { return key + "=" + encodeURIComponent(params[key]); })
        .join('&');
    url += redirectUri ? "&redirect_uri=" + encodeURIComponent(redirectUri) : '';
    return url;
}

function sendOperation(op, params, cb) {
    var uri = hiveUri.encodeOp(op, params);
    var webUrl = uri.replace('hive://', BETA_URL + "/");
    if (cb && isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}

function sendOperations(ops, params, cb) {
    var uri = hiveUri.encodeOps(ops, params);
    var webUrl = uri.replace('hive://', BETA_URL + "/");
    if (cb && isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}

function sendTransaction(tx, params, cb) {
    var uri = hiveUri.encodeTx(tx, params);
    var webUrl = uri.replace('hive://', BETA_URL + "/");
    if (cb && isBrowser()) {
        var win = window.open(webUrl, '_blank');
        return win.focus();
    }
    return webUrl;
}

function Initialize(config) {
    console.warn('The function "Initialize" is deprecated, please use the class "Client" instead.');
    return new Client(config);
}

var index = {
    Client: Client,
    Initialize: Initialize,
    sendTransaction: sendTransaction,
    sendOperations: sendOperations,
    sendOperation: sendOperation,
    sign: sign
};

exports.Client = Client;
exports.Initialize = Initialize;
exports.default = index;
exports.sendOperation = sendOperation;
exports.sendOperations = sendOperations;
exports.sendTransaction = sendTransaction;
exports.sign = sign;
