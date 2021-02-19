"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
var cross_fetch_1 = require("cross-fetch");
var consts_1 = require("./consts");
var utilities_1 = require("./utilities");
var Client = /** @class */ (function () {
    function Client(config) {
        this.apiURL = config.apiURL || consts_1.API_URL;
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
    Client.prototype.getLoginURL = function (state) {
        var redirectUri = encodeURIComponent(this.callbackURL);
        var loginURL = consts_1.BASE_URL + "/oauth2/authorize?client_id=" + this.app + "&redirect_uri=" + redirectUri;
        if (this.responseType === 'code') {
            loginURL += "&response_type=" + this.responseType;
        }
        if (this.scope) {
            loginURL += "&scope=" + this.scope.join(',');
        }
        if (state) {
            loginURL += "&state=" + encodeURIComponent(state);
        }
        return loginURL;
    };
    Client.prototype.login = function (options) {
        if (utilities_1.isBrowser()) {
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
        return __awaiter(this, void 0, void 0, function () {
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
        return __awaiter(this, void 0, void 0, function () {
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
        return __awaiter(this, void 0, void 0, function () {
            var response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cross_fetch_1.default(url, {
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
exports.Client = Client;
//# sourceMappingURL=client.js.map