import { Token } from './token';

export interface IServiceProvider {
	has(token: Token): boolean;
	get<TResult = any>(token: Token): Promise<TResult>;
	getAll<TResult = any>(token: Token): Promise<TResult[]>;
	createScope(): IServiceProvider;
}
