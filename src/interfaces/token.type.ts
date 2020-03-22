import { Type } from '../types/type.type';

export type Token<T = any> = Type<T> | string | symbol;
