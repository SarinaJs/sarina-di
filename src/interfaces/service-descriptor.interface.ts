import { Token } from './token.type';
import { ServiceLifeTime } from './service-lifetime.enum';

export interface IServiceDependency {
	token: Token;
	isMulti?: boolean;
	isOptional?: boolean;
}
export interface IServiceProviderActivator {
	lifetime: ServiceLifeTime;
	dependencies: IServiceDependency[];
	factory: (...deps: any[]) => Promise<any>;
}
export interface IServiceDescriptor {
	token: Token;
	providers: IServiceProviderActivator[];
}
