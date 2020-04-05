import { ServiceCollection, ServiceLifeTime, ServiceProvider } from '@sarina/di';

describe('dependency-injection', () => {
	describe('service-collection', () => {
		describe('ServiceCollection', () => {
			describe('has', () => {
				it('shoud_return_false_if_no_provider_for_token_found', () => {
					// Arrange
					const sc = new ServiceCollection();

					// Act
					const value = sc.has('token');

					// Assert
					expect(value).toBeFalsy();
				});
				it('shoud_return_true_if_provider_for_token_found', () => {
					// Arrange
					const sc = new ServiceCollection();
					sc.add({
						token: 'token',
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: () => null,
					});

					// Act
					const value = sc.has('token');

					// Assert
					expect(value).toBeTruthy();
				});
			});
			describe('add', () => {
				it('should_register_service', () => {
					// Arrange
					const sc = new ServiceCollection();

					// Act
					const service = {
						token: 'token',
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => null,
					};
					sc.add(service);

					// Assert
					expect(sc.services).toHaveLength(1);
					expect(sc.services[0]).toBe(service);
				});
				it('should_register_duplicate_token', () => {
					// Arrange
					const sc = new ServiceCollection();

					// Act
					const provider = {
						token: 'token',
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => null,
					};
					sc.add(provider);
					sc.add(provider);

					// Assert
					expect(sc.services).toHaveLength(2);
					expect(sc.services[0]).toBe(provider);
					expect(sc.services[1]).toBe(provider);
				});
			});
			describe('build()', () => {
				it('build_should_create_root_container', async () => {
					// Arrange
					const serviceCollection = new ServiceCollection();
					const descriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => null,
					};
					serviceCollection.add(descriptor);

					// Act
					const serviceProvider = (await serviceCollection.build()) as ServiceProvider;
					const resolver = serviceProvider.resolver;
					const services = resolver.services;

					// Assert
					expect(serviceProvider).toBeInstanceOf(ServiceProvider);
					expect(serviceProvider.parent).toBeNull();
					expect(services.size).toBe(1);
				});
			});
		});
	});
});
