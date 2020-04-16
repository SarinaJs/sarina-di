import { Token } from './token';

export const SERVICE_PROVIDER_INJECTION_TOKEN = Symbol('IServiceProvider');

export interface IServiceProvider {
	has(token: Token): boolean;
	get<TResult = any>(token: Token): Promise<TResult>;
	getAll<TResult = any>(token: Token): Promise<TResult[]>;
	createScope(): IServiceProvider;
}
