import { Token } from '../interfaces/token';
import { IServiceProvider, SERVICE_PROVIDER_INJECTION_TOKEN } from './../interfaces/service-provider.interface';
import { ServiceDescriptor, ServiceDependency, ServiceLifeTime } from '../interfaces/service-descriptor.model';
import { ServiceResolver } from './service-resolver';

// models
export interface ServiceInstance<T = any> {
	token: Token;
	descriptor: ServiceDescriptor;
	instance: T;
}

// interface
export class ResolutionContext {
	static create() {
		return new ResolutionContext();
	}

	public readonly activatingToken: Token[] = [];

	constructor() {}

	isActivating(token: Token) {
		return this.activatingToken.indexOf(token) != -1;
	}
	markAsActivating(token: Token) {
		this.activatingToken.push(token);
	}
	markAsActivated(token: Token) {
		const index = this.activatingToken.indexOf(token);
		this.activatingToken.splice(index, 1);
	}
}

export class ServiceProvider implements IServiceProvider {
	public static createRootProvider(resolver: ServiceResolver): ServiceProvider {
		const provider = new ServiceProvider(resolver);

		// we need to register IServiceProvider as service-provider
		resolver.internalAddNewService({
			lifetime: ServiceLifeTime.singleton,
			token: SERVICE_PROVIDER_INJECTION_TOKEN,
			dependencies: [],
			factory: async () => provider,
		});

		return provider;
	}

	public readonly parent: ServiceProvider;
	public readonly resolver: ServiceResolver;
	public readonly instances: Map<ServiceDescriptor, ServiceInstance> = new Map<ServiceDescriptor, ServiceInstance>();

	public constructor(resolver: ServiceResolver, parent?: ServiceProvider) {
		this.resolver = resolver;
		this.parent = parent || null;
	}

	public has(token: Token): boolean {
		return this.resolver.has(token);
	}
	public async get<TResult = any>(token: Token): Promise<TResult> {
		const instances = await this.resolveToken(ResolutionContext.create(), token);
		if (instances.length == 0) return null;
		if (instances.length > 1) throw new Error(`Multiple instance found for '${token as any}' token.`);
		return instances[0];
	}
	public async getAll<TResult = any>(token: Token): Promise<TResult[]> {
		const instances = await this.resolveToken(ResolutionContext.create(), token);
		return instances;
	}
	public createScope(): IServiceProvider {
		return new ServiceProvider(this.resolver, this);
	}

	public async resolveToken(context: ResolutionContext, token: Token) {
		// if not exists we should return null
		if (!this.has(token)) return [];

		if (context.isActivating(token)) throw new Error('Cycle dependency found');
		context.markAsActivating(token);

		// resolve the descriptor
		const descriptors = this.resolver.resolveAll(token);

		// we should resolve all providers of the token
		const result = [];
		for (let index = 0; index < descriptors.length; index++) {
			const service = descriptors[index];
			const instance = await this.resolveDescriptor(context, service);
			result.push(instance);
		}
		context.markAsActivated(token);
		return result;
	}
	public async resolveDescriptor<T>(context: ResolutionContext, descriptor: ServiceDescriptor): Promise<T> {
		// Based on provider lifetime the activation will be different
		//	1. transient: always new instance will be activated
		//	2. scoped	: activate once per container, and use the same object for other resolving request
		//	3. singleton: activate once per root-container.

		if (descriptor.lifetime == ServiceLifeTime.transient) return await this.activate<T>(context, descriptor);
		else if (descriptor.lifetime == ServiceLifeTime.scoped) return await this.resolveOrActivate<T>(context, descriptor);
		else {
			// if the current container is the root one, we should use that to activate the provider
			if (!this.parent) return await this.resolveOrActivate(context, descriptor);
			// otherwise we should ask the root container to resolve the provider
			else return await this.parent.resolveDescriptor(context, descriptor);
		}
	}
	public async resolveOrActivate<T>(context: ResolutionContext, descriptor: ServiceDescriptor): Promise<T> {
		// if the provider already exists, return existing one
		if (this.instances.has(descriptor)) return this.instances.get(descriptor).instance;

		// if the provider does not exists, activate the instance
		return await this.activate<T>(context, descriptor);
	}
	public async activate<T>(context: ResolutionContext, descriptor: ServiceDescriptor): Promise<T> {
		// first we need to resolve dependencies
		const dependencies = await this.resolveDependencies(context, descriptor.dependencies);

		// instantiate the provider by calling the factory method and passing the dependencies
		const instance = await descriptor.factory.apply(null, dependencies);

		// if the provider lifetime != transient, we should keep track of the provider for next-activation
		if (descriptor.lifetime != ServiceLifeTime.transient) {
			this.instances.set(descriptor, {
				descriptor: descriptor,
				instance: instance,
				token: descriptor.token,
			});
		}

		return instance;
	}
	public async resolveDependencies(context: ResolutionContext, dependencies: ServiceDependency[]): Promise<any[]> {
		const result: any[] = [];
		for (let depIndex = 0; depIndex < dependencies.length; depIndex++) {
			const dependency = dependencies[depIndex];
			result.push(await this.resolveDependency(context, dependency));
		}
		return result;
	}
	public async resolveDependency(context: ResolutionContext, dependency: ServiceDependency) {
		const instances = await this.resolveToken(context, dependency.token);

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
