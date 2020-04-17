import { Type } from './type';
import { Token } from './token';
import { IServiceProvider } from './service-provider.interface';
import { ServiceDescriptor, ServiceLifeTime } from './service-descriptor.model';

export interface IServiceCollection {
	has(token: Token): boolean;
	add(service: ServiceDescriptor): IServiceCollection;

	addClass(type: Type<any>, lifetime: ServiceLifeTime): IServiceCollection;
	addClass(token: Token, type: Type<any>, lifetime: ServiceLifeTime): IServiceCollection;
	addTransientClass(token: Token, type: Type<any>): IServiceCollection;
	addTransientClass(type: Type<any>): IServiceCollection;
	addSingletonClass(token: Token, type: Type<any>): IServiceCollection;
	addSingletonClass(type: Type<any>): IServiceCollection;
	addScopedClass(token: Token, type: Type<any>): IServiceCollection;
	addScopedClass(type: Type<any>): IServiceCollection;

	addFactory<TService = any>(
		token: Token<any>,
		lifetime: ServiceLifeTime,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection;
	addTransientFactory<TService = any>(
		token: Token<any>,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection;
	addSingletonFactory<TService = any>(
		token: Token<any>,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection;
	addScopedFactory<TService = any>(
		token: Token<any>,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection;

	addValue<T>(token: Token, value: T): IServiceCollection;

	build(): IServiceProvider;
}
