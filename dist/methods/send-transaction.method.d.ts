import { Parameters } from 'hive-uri';
import { CallbackFunction } from '../types';
import { Transaction } from '@hiveio/dhive';
export declare function sendTransaction(tx: Transaction, params: Parameters, cb: CallbackFunction): string | void;
