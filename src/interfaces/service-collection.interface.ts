import { Token } from './token.type';
import { IServiceProvider } from './service-provider.interface';
import { ServiceDescriptor } from './service-descriptor.model';

export interface IServiceCollection {
	has(token: Token): boolean;
	add(service: ServiceDescriptor): IServiceCollection;
	build(): Promise<IServiceProvider>;
}
