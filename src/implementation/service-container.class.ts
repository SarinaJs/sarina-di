import { Token } from '../interfaces/token.type';
import { IServiceContainer } from './../interfaces/service-container.interface';
import {
	IServiceDescriptor,
	IServiceProviderActivator,
	IServiceDependency,
} from '../interfaces/service-descriptor.interface';
import { ServiceLifeTime } from '../interfaces/service-lifetime.enum';

// interface
export interface RootServiceContainerOptions {
	isRoot: true;
	descriptors: Map<Token, IServiceDescriptor>;
}
export interface ScopedServiceContainerOptions {
	isRoot: false;
	root: ServiceContainer;
}
export type ServiceContainerOptions = ScopedServiceContainerOptions | RootServiceContainerOptions;

export class ServiceContainer implements IServiceContainer {
	public readonly activatedInstances: Map<IServiceProviderActivator, any>;
	public readonly options: ServiceContainerOptions;

	public constructor(options: ServiceContainerOptions) {
		this.activatedInstances = new Map<IServiceProviderActivator, any>();
		this.options = options;
	}

	public has(token: Token): boolean {
		return this.getDescriptors().has(token);
	}
	public async get<TResult = any>(token: Token): Promise<TResult> {
		const instances = await this.resolveToken(token);
		if (instances.length == 0) return null;
		if (instances.length > 1) throw new Error(`Multiple instance found for '${token as any}' token.`);
		return instances[0];
	}
	public async getAll<TResult = any>(token: Token): Promise<TResult[]> {
		const instances = await this.resolveToken(token);
		return instances;
	}
	public createScope(): IServiceContainer {
		return new ServiceContainer({
			isRoot: false,
			root: this.options.isRoot == true ? this : this.options.root,
		});
	}

	public getDescriptors(): Map<Token, IServiceDescriptor> {
		if (this.options.isRoot == true) return this.options.descriptors;
		else return this.options.root.getDescriptors();
	}
	public async resolveToken(token: Token) {
		// if not exists we should return null
		if (!this.has(token)) return [];

		// resolve the descriptor
		const theDescriptor = this.getDescriptors().get(token);

		// we should resolve all providers of the token
		const result = [];
		for (let providerIndex = 0; providerIndex < theDescriptor.providers.length; providerIndex++) {
			const provider = theDescriptor.providers[providerIndex];
			const instance = await this.resolveProvider(provider);
			result.push(instance);
		}

		return result;
	}
	public async resolveProvider<T>(provider: IServiceProviderActivator): Promise<T> {
		// Based on provider lifetime the activation will be different
		//	1. transient: always new instance will be activated
		//	2. scoped	: activate once per container, and use the same object for other resolving request
		//	3. singleton: activate once per root-container.

		if (provider.lifetime == ServiceLifeTime.transient) return await this.activateProvider<T>(provider);
		else if (provider.lifetime == ServiceLifeTime.scoped) return await this.resolveOrActivate<T>(provider);
		else {
			// if the current container is the root one, we should use that to activate the provider
			if (this.options.isRoot == true) return await this.resolveOrActivate(provider);
			// otherwise we should ask the root container to resolve the provider
			else return await this.options.root.resolveProvider(provider);
		}
	}
	public async resolveOrActivate<T>(provider: IServiceProviderActivator): Promise<T> {
		// if the provider already exists, return existing one
		if (this.activatedInstances.has(provider)) return this.activatedInstances.get(provider) as T;

		// if the provider does not exists, activate the instance
		return await this.activateProvider<T>(provider);
	}
	public async activateProvider<T>(provider: IServiceProviderActivator): Promise<T> {
		// first we need to resolve dependencies
		const dependencies = await this.resolveDependencies(provider.dependencies);

		// instantiate the provider by calling the factory method and passing the dependencies
		const instance = await provider.factory.apply(null, dependencies);

		// if the provider lifetime != transient, we should keep track of the provider for next-activation
		if (provider.lifetime != ServiceLifeTime.transient) {
			this.activatedInstances.set(provider, instance);
		}

		return instance;
	}
	public async resolveDependencies(dependencies: IServiceDependency[]): Promise<any[]> {
		const result: any[] = [];
		for (let depIndex = 0; depIndex < dependencies.length; depIndex++) {
			const dependency = dependencies[depIndex];
			result.push(await this.resolveDependency(dependency));
		}
		return result;
	}
	public async resolveDependency(dependency: IServiceDependency) {
		const instances = await this.resolveToken(dependency.token);

		// if the provider requires multiple instance, we can resolve all by token
		if (dependency.isMulti == true) return instances;

		// if dependency is required and no instance found, we should throw error
		if (instances.length == 0) {
			if (!dependency.isOptional) throw new Error(`No provider found for '${dependency.token as any}' !`);
			return null;
		}

		if (instances.length > 1) throw new Error(`Multiple instance found for '${dependency.token as any}' token.`);

		return instances[0];
	}
}
