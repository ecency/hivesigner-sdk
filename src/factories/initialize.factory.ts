import { ClientConfig } from '../types'
import { Client } from '../client'

export function Initialize(config: ClientConfig): Client {
	console.warn('The function "Initialize" is deprecated, please use the class "Client" instead.')
	return new Client(config)
}
