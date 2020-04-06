import { Token } from '../interfaces/token';
import { getType } from '@sarina/annotation';
import { isInjectable, getInjectData, isMultipleParameter, isOptionalParameter } from '../annotations';
import { Type, isType } from '../interfaces/type';
import { ServiceResolver } from './service-resolver';
import { ServiceProvider } from './service-provider';
import { IServiceProvider } from '../interfaces/service-provider.interface';
import { IServiceCollection } from '../interfaces/service-collection.interface';
import { ServiceDescriptor, ServiceLifeTime, ServiceDependency } from '../interfaces/service-descriptor.model';

export class ServiceCollection implements IServiceCollection {
	public services: ServiceDescriptor[] = [];

	public constructor() {}

	public has(token: Token): boolean {
		return this.services.findIndex((s) => s.token == token) >= 0;
	}

	public add(type: Type<any>, lifetime: ServiceLifeTime): IServiceCollection;
	public add(service: ServiceDescriptor): IServiceCollection;
	public add(...args: any[]) {
		if (args.length == 0) return this;
		if (args.length == 1) {
			this.services.push(args[0]);
		}
		if (args.length == 2 && isType(args[0])) {
			this.services.push(this.getDescriptorByType(args[0], args[1]));
		}

		return this;
	}

	public async build(): Promise<IServiceProvider> {
		const resolver = new ServiceResolver(this.services);
		return new ServiceProvider(resolver);
	}

	public getDescriptorByType(type: Type<any>, lifetime: ServiceLifeTime): ServiceDescriptor {
		// check that type has defined annotation
		const injectableAnnotation = isInjectable(type);
		if (!injectableAnnotation) throw new Error('Type not marked as Injectable');

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

		// return descrptor
		return {
			dependencies: dependencies,
			factory: (...args: any[]) => new type(...args),
			lifetime: lifetime,
			token: type,
		};
	}
}
