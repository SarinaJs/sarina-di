import { Token } from './token.type';
import { IServiceContainer } from './service-container.interface';
import { IServiceProviderActivator } from './service-descriptor.interface';
import { ServiceProvider } from './service-provider.interface';

export interface IServiceCollection {
	has(token: Token): boolean;
	add(token: Token, factory: IServiceProviderActivator): IServiceCollection;
	build(): Promise<IServiceContainer>;
}
