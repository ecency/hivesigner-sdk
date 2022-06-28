import { Parameters } from 'hive-uri';
import { CallbackFunction } from '../types';
import { Operation } from '@hiveio/dhive';
export declare function sendOperations(ops: Operation[], params: Parameters, cb: CallbackFunction): string | void;
