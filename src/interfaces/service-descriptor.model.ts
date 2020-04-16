import { Token } from './token';

export enum ServiceLifeTime {
	transient = 'transient',
	singleton = 'singleton',
	scoped = 'scoped',
}

export interface ServiceDependency {
	token: Token;
	isMulti?: boolean;
	isOptional?: boolean;
}
export interface ServiceDescriptor {
	token: Token;
	lifetime: ServiceLifeTime;
	dependencies: ServiceDependency[];
	factory: (...deps: any[]) => Promise<any>;
}
