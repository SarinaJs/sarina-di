import { Type } from '../interfaces/type';
import { Token } from '../interfaces/token';
import { getType } from '@sarina/annotation';
import { ServiceResolver } from './service-resolver';
import { ServiceProvider } from './service-provider';
import { SarinaDependencyInjectionError } from '../errors';
import { IServiceCollection } from '../interfaces/service-collection.interface';
import { ServiceDescriptor, ServiceLifeTime } from '../interfaces/service-descriptor.model';
import { isInjectable, getInjectData, isMultipleParameter, isOptionalParameter } from '../annotations';
import { IServiceProvider, SERVICE_PROVIDER_INJECTION_TOKEN } from '../interfaces/service-provider.interface';

export class ServiceCollection implements IServiceCollection {
	public services: ServiceDescriptor[] = [];

	public constructor() {}

	public has(token: Token): boolean {
		return this.services.findIndex((s) => s.token == token) >= 0;
	}

	public add(service: ServiceDescriptor): IServiceCollection {
		this.services.push(service);
		return this;
	}
	public addClass(token: Token, type: Type<any>, lifetime: ServiceLifeTime): IServiceCollection;
	public addClass(type: Type<any>, lifetime: ServiceLifeTime): IServiceCollection;
	public addClass(...args: any[]): IServiceCollection {
		const token: Type<any> = args[0];
		let type: Type<any> = args[0];
		let lifetime = ServiceLifeTime.transient;
		if (args.length == 2) {
			type = args[0];
			lifetime = args[1];
		} else {
			type = args[1];
			lifetime = args[2];
		}

		// check that type has defined annotation
		const injectableAnnotation = isInjectable(type);
		if (!injectableAnnotation) throw SarinaDependencyInjectionError.InvalidInjectableType(type);

		// fetch type information
		const typeDef = getType(type);

		// fetch dependencies
		const dependencies = typeDef.constructor.parameters.map((param, index) => {
			// get the parameter token
			//	- token has not marked as @inject, parameter type will be used
			//	- token has marked with @Inject, if token exists, token will used otherwise parameter type will be used
			const paramInjectData = getInjectData(type, 'constructor', index);
			const theToken: Token = paramInjectData?.token || param.type;

			// get multiple parameter annotation
			const isMultiple = isMultipleParameter(type, 'constructor', index);

			// get optional parameter annotation
			const isOptional = isOptionalParameter(type, 'constructor', index);

			return { token: theToken, isMulti: isMultiple, isOptional: isOptional };
		});

		const descriptor = {
			dependencies: dependencies,
			factory: (...args: any[]) => new type(...args),
			lifetime: lifetime,
			token: token,
		};

		return this.add(descriptor);
	}
	public addFactory<TService>(
		token: Token<any>,
		lifetime: ServiceLifeTime,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection {
		const descriptor = {
			dependencies: [
				{
					token: SERVICE_PROVIDER_INJECTION_TOKEN,
					isMulti: false,
					isOptional: false,
				},
			],
			factory: factory,
			lifetime: lifetime,
			token: token,
		};
		return this.add(descriptor);
	}
	public addValue<T>(token: Token, value: T): IServiceCollection {
		return this.add({
			dependencies: [],
			factory: async () => value,
			lifetime: ServiceLifeTime.singleton,
			token: token,
		});
	}

	public addTransientClass(token: Token, type: Type<any>): IServiceCollection;
	public addTransientClass(type: Type<any>): IServiceCollection;
	public addTransientClass(...args: any[]): IServiceCollection {
		return this.addClass.apply(this, [...args, ServiceLifeTime.transient]);
	}

	public addSingletonClass(token: Token, type: Type<any>): IServiceCollection;
	public addSingletonClass(type: Type<any>): IServiceCollection;
	public addSingletonClass(...args: any[]): IServiceCollection {
		return this.addClass.apply(this, [...args, ServiceLifeTime.singleton]);
	}

	public addScopedClass(token: Token, type: Type<any>): IServiceCollection;
	public addScopedClass(type: Type<any>): IServiceCollection;
	public addScopedClass(...args: any[]): IServiceCollection {
		return this.addClass.apply(this, [...args, ServiceLifeTime.scoped]);
	}

	public addTransientFactory<TService = any>(
		token: Token<any>,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection {
		return this.addFactory(token, ServiceLifeTime.transient, factory);
	}
	public addSingletonFactory<TService = any>(
		token: Token<any>,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection {
		return this.addFactory(token, ServiceLifeTime.singleton, factory);
	}
	public addScopedFactory<TService = any>(
		token: Token<any>,
		factory: (provider: IServiceProvider) => Promise<TService>,
	): IServiceCollection {
		return this.addFactory(token, ServiceLifeTime.scoped, factory);
	}

	public async build(): Promise<IServiceProvider> {
		const resolver = new ServiceResolver([...this.services]);
		return new ServiceProvider(resolver);
	}
}
