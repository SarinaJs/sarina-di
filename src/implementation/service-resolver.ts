import { Token, ServiceDescriptor } from '../interfaces';

export interface IServiceResolver {
	has(token: Token): boolean;
	resolveAll(token: Token): ServiceDescriptor[];
}
export class ServiceResolver implements IServiceResolver {
	public services: Map<Token, ServiceDescriptor[]> = new Map<Token, ServiceDescriptor[]>();

	public constructor(services: ServiceDescriptor[]) {
		services.forEach((service) => {
			if (!this.services.has(service.token)) this.services.set(service.token, []);
			this.services.get(service.token).push(service);
		});
	}

	public has(token: Token): boolean {
		return this.services.has(token);
	}
	public resolveAll(token: Token): ServiceDescriptor[] {
		return this.services.get(token) || [];
	}
	public internalAddNewService(service: ServiceDescriptor) {
		if (!this.services.has(service.token)) this.services.set(service.token, []);
		this.services.get(service.token).push(service);
	}
}
