import { ServiceLifeTime } from './service-lifetime.enum';
import { IServiceDependency } from './service-descriptor.interface';
import { Type } from '../types/type.type';
import { Token } from './token.type';

export type ServiceProvider = Type<any>;

export interface IServiceProvider {
	lifetime: ServiceLifeTime;
}
export interface IFactoryServiceProvider<T = any> extends IServiceProvider {
	dependencies: [IServiceDependency];
	factory: (...args: any[]) => T;
}
export interface IClassServiceProvider<T = any> extends IServiceProvider {
	token?: Token;
	class: Type<T>;
}
export interface IValueServiceProvider<T = any> extends IServiceProvider {
	token: Token;
	value: T;
}
export interface IExistingServiceProvider extends IServiceProvider {
	token: Token;
	to: Token;
}
