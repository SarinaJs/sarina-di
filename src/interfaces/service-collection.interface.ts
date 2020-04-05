import { Token } from './token.type';
import { IServiceContainer } from './service-container.interface';
import { ServiceDescriptor } from './service-descriptor.model';

export interface IServiceCollection {
	has(token: Token): boolean;
	add(service: ServiceDescriptor): IServiceCollection;
	build(): Promise<IServiceContainer>;
}
