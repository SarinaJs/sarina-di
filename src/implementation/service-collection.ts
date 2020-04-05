import { Token } from '../interfaces/token';
import { IServiceCollection } from '../interfaces/service-collection.interface';
import { IServiceProvider } from '../interfaces/service-provider.interface';
import { ServiceDescriptor } from '../interfaces/service-descriptor.model';
import { ServiceResolver } from './service-resolver';
import { ServiceProvider } from './service-provider';

export class ServiceCollection implements IServiceCollection {
	public services: ServiceDescriptor[] = [];

	public constructor() {}

	public has(token: Token): boolean {
		return this.services.findIndex((s) => s.token == token) >= 0;
	}
	public add(service: ServiceDescriptor): IServiceCollection
	{
		this.services.push(service);
		return this;
	}

	public async build(): Promise<IServiceProvider> {
		const resolver = new ServiceResolver(this.services);
		return new ServiceProvider(resolver);
	}
}