import { SignErrors } from '../types';
export declare function sign(name: string, params: Record<string, string | number | boolean>, redirectUri: string): string | SignErrors;
