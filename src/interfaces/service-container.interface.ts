import { Token } from './token.type';

export interface IServiceContainer {
	has(token: Token): boolean;
	get<TResult = any>(token: Token): Promise<TResult>;
	getAll<TResult = any>(token: Token): Promise<TResult[]>;
	createScope(): IServiceContainer;
}
