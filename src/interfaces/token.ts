import { Type } from './type';

export type Token<T = any> = Type<T> | string | symbol;
