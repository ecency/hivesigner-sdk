import { Client } from '../client';
export function Initialize(config) {
    console.warn('The function "Initialize" is deprecated, please use the class "Client" instead.');
    return new Client(config);
}
//# sourceMappingURL=initialize.factory.js.map