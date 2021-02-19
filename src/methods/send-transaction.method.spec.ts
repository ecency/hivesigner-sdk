import { sendTransaction } from './send-transaction.method'
import { Transaction } from '@hiveio/dhive'
import * as hive from 'hive-uri'
import * as utilities from '../utilities'
import { CallbackFunction } from '../types'
import { BETA_URL } from '../consts'

jest.mock('../utilities')
jest.mock('hive-uri')

describe('Send transaction method', function () {
	let tx: Transaction
	let params: hive.Parameters
	let cb: CallbackFunction
	let encodeTxMock: jest.Mock
	let isBrowserMock: jest.Mock

	beforeEach(() => {
		tx = {} as Transaction
		params = {}
		cb = () => {}
		(window as { open: () => void }).open = jest.fn()

		encodeTxMock = hive.encodeTx as jest.Mock
		encodeTxMock.mockReturnValue('hive://')

		isBrowserMock = utilities.isBrowser as jest.Mock
		isBrowserMock.mockReturnValue(false)
	})

	it('should call call window open if its browser and has callback', function () {
		(window.open as jest.Mock).mockReturnValue({ focus: () => {} })
		isBrowserMock.mockReturnValue(true)

		sendTransaction(tx, params, cb)
		expect(window.open).toHaveBeenCalledWith(`${BETA_URL}/`, '_blank')
	})

	it('should return url if its not browser', function () {
		expect(sendTransaction(tx, params, cb)).toBe(`${BETA_URL}/`)
	})

	it('should return url if there is no callback', function () {
		cb = null
		expect(sendTransaction(tx, params, cb)).toBe(`${BETA_URL}/`)
	})
})
