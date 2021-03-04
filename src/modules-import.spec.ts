// @ts-ignore
import { Client } from '../dist/index'

describe('Testing module imports', function () {
  it('should contain Client class', function () {
    expect(Client).toBeTruthy()

    const client = new Client({})
    expect(client).toBeInstanceOf(Client)
  })
})