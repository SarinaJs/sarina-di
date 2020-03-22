import { Token } from '../interfaces/token.type';
import { IServiceCollection } from '../interfaces/service-collection.interface';
import { IServiceDescriptor, IServiceProviderActivator } from '../interfaces/service-descriptor.interface';
import { IServiceContainer } from '../interfaces';
import { ServiceContainer } from './service-container.class';

export class ServiceCollection implements IServiceCollection {
	public descriptorsMap: Map<Token, IServiceDescriptor>;

	public constructor() {
		this.descriptorsMap = new Map<Token, IServiceDescriptor>();
	}

	public has(token: Token): boolean {
		return this.descriptorsMap.has(token);
	}
	public add(token: Token, provider: IServiceProviderActivator): IServiceCollection {
		// first we need to find the service
		let theDescriptor = this.findOrCreateNewDescriptor(token);

		// add new provider to the providers array
		theDescriptor.providers.push(provider);

		return this;
	}

	public build(): IServiceContainer {
		// create a root sevice container with service descriptors
		const container = new ServiceContainer({
			isRoot: true,
			descriptors: this.descriptorsMap,
		});
		return container;
	}
	public findOrCreateNewDescriptor(token: Token) {
		// first chceck that the token already exists or not
		if (this.descriptorsMap.has(token)) return this.descriptorsMap.get(token);

		// if not, we create new descriptor and put into descriptors map
		const theDescriptor = {
			token: token,
			providers: [],
		} as IServiceDescriptor;
		this.descriptorsMap.set(token, theDescriptor);

		// return the new descriptor
		return theDescriptor;
	}
}
