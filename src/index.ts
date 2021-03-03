export * from './client'
export * from './methods'
export * from './factories'

import { Client } from './client'
import { Initialize } from './factories'
import { sendTransaction, sendOperations, sendOperation, sign } from './methods'

export default {
	Client,
	Initialize,
	sendTransaction,
	sendOperations,
	sendOperation,
	sign
}
