const hs = require('../lib/index');

global.fetch = jest.fn().mockResolvedValue({
  status: 200,
  json: async () => ({ error: '' })
});

describe('Require import testing', function () {
  it('should be instance of Client and call me', function () {
    const client = new hs.Client({ accessToken: 'some_wrong_access_token' });
    expect(client).toBeInstanceOf(hs.Client);

    const me = client.me();
    expect(me).toBeInstanceOf(Promise);
  });
});
