import { Initialize } from './initialize.factory'
import { ClientConfig } from '../types'
import { Client } from '../client'

describe('Initialize Client factory', function () {
	it('should create client instance', function () {
		expect(Initialize({} as ClientConfig)).toBeInstanceOf(Client)
	})
})
