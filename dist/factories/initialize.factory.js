"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Initialize = void 0;
var client_1 = require("../client");
function Initialize(config) {
    console.warn('The function "Initialize" is deprecated, please use the class "Client" instead.');
    return new client_1.Client(config);
}
exports.Initialize = Initialize;
//# sourceMappingURL=initialize.factory.js.map