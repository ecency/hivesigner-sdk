import { Operation } from '@hiveio/dhive'
import * as hive from 'hive-uri'
import * as utilities from '../utilities'
import { CallbackFunction } from '../types'
import { BETA_URL } from '../consts'
import { sendOperation } from './send-operation.method'

jest.mock('../utilities')
jest.mock('hive-uri')

describe('Send operation method', function () {
	let op: Operation
	let params: hive.Parameters
	let cb: CallbackFunction
	let windowOpenSpy: jasmine.Spy
	let encodeOpMock: jest.Mock
	let isBrowserMock: jest.Mock

	beforeEach(() => {
		op = {} as Operation
		params = {}
		cb = () => {}
		windowOpenSpy = spyOn(window, 'open')

		encodeOpMock = hive.encodeOp as jest.Mock
		encodeOpMock.mockReturnValue('hive://')

		isBrowserMock = utilities.isBrowser as jest.Mock
		isBrowserMock.mockReturnValue(false)
	})

	it('should call call window open if its browser and has callback', function () {
		windowOpenSpy.and.returnValue({ focus: () => {} })
		isBrowserMock.mockReturnValue(true)

		sendOperation(op, params, cb)
		expect(window.open).toHaveBeenCalledWith(`${BETA_URL}/`, '_blank')
	})

	it('should return url if its not browser', function () {
		expect(sendOperation(op, params, cb)).toBe(`${BETA_URL}/`)
	})

	it('should return url if there is no callback', function () {
		cb = null
		expect(sendOperation(op, params, cb)).toBe(`${BETA_URL}/`)
	})
})