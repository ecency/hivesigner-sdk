import { Parameters } from 'hive-uri';
import { CallbackFunction, Transaction } from '../types';
export declare function sendTransaction(tx: Transaction, params: Parameters, cb: CallbackFunction): string | void;
