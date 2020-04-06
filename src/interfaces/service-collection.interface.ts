import { Type } from './type';
import { Token } from './token';
import { IServiceProvider } from './service-provider.interface';
import { ServiceDescriptor, ServiceLifeTime } from './service-descriptor.model';

export interface IServiceCollection {
	has(token: Token): boolean;
	add(service: ServiceDescriptor): IServiceCollection;
	add(type: Type<any>, lifetime: ServiceLifeTime): IServiceCollection;
	add<TService = any>(
		token: Token<any>,
		lifetime: ServiceLifeTime,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection;
	build(): Promise<IServiceProvider>;
}
