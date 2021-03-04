import hivesigner from '../dist/index'

describe('Testing default import', function () {
  it('should contain Client class', function () {
    expect(hivesigner.Client).toBeTruthy()

    const client = new hivesigner.Client({})
    expect(client).toBeInstanceOf(hivesigner.Client)
  })
})