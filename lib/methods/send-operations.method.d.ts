import { Parameters } from 'hive-uri';
import { CallbackFunction, Operation } from '../types';
export declare function sendOperations(ops: Operation[], params: Parameters, cb: CallbackFunction): string | void;
