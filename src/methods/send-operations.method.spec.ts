import { Operation } from '@hiveio/dhive'
import * as hive from 'hive-uri'
import * as utilities from '../utilities'
import { CallbackFunction } from '../types'
import { BETA_URL } from '../consts'
import { sendOperations } from './send-operations.method'

jest.mock('../utilities')
jest.mock('hive-uri')

describe('Send operations method', function () {
	let ops: Operation[]
	let params: hive.Parameters
	let cb: CallbackFunction
	let encodeOpsMock: jest.Mock
	let isBrowserMock: jest.Mock

	beforeEach(() => {
		ops = [] as Operation[]
		params = {}
		cb = () => {}
		(window as { open: () => void }).open = jest.fn()

		encodeOpsMock = hive.encodeOps as jest.Mock
		encodeOpsMock.mockReturnValue('hive://')

		isBrowserMock = utilities.isBrowser as jest.Mock
		isBrowserMock.mockReturnValue(false)
	})

	it('should call call window open if its browser and has callback', function () {
		(window.open as jest.Mock).mockReturnValue({ focus: () => {} })
		isBrowserMock.mockReturnValue(true)

		sendOperations(ops, params, cb)
		expect(window.open).toHaveBeenCalledWith(`${BETA_URL}/`, '_blank')
	})

	it('should return url if its not browser', function () {
		expect(sendOperations(ops, params, cb)).toBe(`${BETA_URL}/`)
	})

	it('should return url if there is no callback', function () {
		cb = null
		expect(sendOperations(ops, params, cb)).toBe(`${BETA_URL}/`)
	})
})
