import theoretically from 'jest-theories';
import {
	ServiceCollection,
	ServiceLifeTime,
	ServiceProvider,
	injectable,
	inject,
	multiple,
	optional,
	SERVICE_PROVIDER_INJECTION_TOKEN,
	IServiceProvider,
} from '@sarina/di';

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

			describe('addClass', () => {
				it('should_register_service_by_type', () => {
					// Arrange
					const sc = new ServiceCollection();
					@injectable()
					class SampleType {}

					// Act
					const descriptor = sc.addClass(SampleType, ServiceLifeTime.transient);

					// Assertion
					expect(sc.services).toHaveLength(1);
					expect(sc.services[0].token).toBe(SampleType);
					expect(sc.services[0].lifetime).toBe(ServiceLifeTime.transient);
					expect(sc.services[0].dependencies).toHaveLength(0);
				});
				it('should_raise_error_if_type_is_not_injectable', () => {
					// Arrange
					const sc = new ServiceCollection();
					class SampleType {}

					// Act
					const action = () => sc.addClass(SampleType, ServiceLifeTime.transient);

					// Assertion
					expect(action).toThrow('Type not marked as Injectable');
				});
				it('lifeTime_should_be_equal_to_provided_value', () => {
					// Arrange
					const sc = new ServiceCollection();
					@injectable()
					class SampleType {}

					// Act
					sc.addClass(SampleType, ServiceLifeTime.transient);

					// Assertion
					const descriptor = sc.services[0];
					expect(descriptor.lifetime).toBe(ServiceLifeTime.transient);
				});
				it('token_should_be_same_as_type', () => {
					// Arrange
					const sc = new ServiceCollection();
					@injectable()
					class SampleType {}

					// Act
					sc.addClass(SampleType, ServiceLifeTime.transient);

					// Assertion
					const descriptor = sc.services[0];
					expect(descriptor.token).toBe(SampleType);
				});
				it('factory_should_return_instance_of_type', async () => {
					// Arrange
					const sc = new ServiceCollection();
					@injectable()
					class SampleType {}

					// Act
					sc.addClass(SampleType, ServiceLifeTime.transient);

					// Assertion
					const descriptor = sc.services[0];
					expect(await descriptor.factory()).toBeInstanceOf(SampleType);
				});
				it('should_add_by_provided_type', async () => {
					// Arrange
					const sc = new ServiceCollection();
					@injectable()
					class SampleType {}

					// Act
					sc.addClass('my-token', SampleType, ServiceLifeTime.transient);

					// Assertion
					const descriptor = sc.services[0];
					expect(descriptor.lifetime).toBe(ServiceLifeTime.transient);
					expect(descriptor.token).toBe('my-token');
					expect(await descriptor.factory()).toBeInstanceOf(SampleType);
				});
				describe('dependencies', () => {
					it('should_registry_emptyArray_for_parameterless_type', () => {
						// Arrange
						const sc = new ServiceCollection();

						@injectable()
						class SampleType {}

						// Act
						sc.addClass(SampleType, ServiceLifeTime.transient);

						// Assertion
						const descriptor = sc.services[0];
						expect(descriptor.dependencies).toHaveLength(0);
					});
					it('should_register_paramType_as_token_by_default', () => {
						// Arrange
						const sc = new ServiceCollection();

						@injectable()
						class SampleType {
							constructor(name: string) {}
						}

						// Act
						sc.addClass(SampleType, ServiceLifeTime.transient);

						// Assertion
						const descriptor = sc.services[0];
						expect(descriptor.dependencies).toHaveLength(1);
						expect(descriptor.dependencies[0].token).toBe(String);
					});
					it('should_register_required_by_default', () => {
						// Arrange
						const sc = new ServiceCollection();

						@injectable()
						class SampleType {
							constructor(name: string) {}
						}

						// Act
						sc.addClass(SampleType, ServiceLifeTime.transient);

						// Assertion
						const descriptor = sc.services[0];
						expect(descriptor.dependencies).toHaveLength(1);
						expect(descriptor.dependencies[0].isOptional).toBe(false);
					});
					it('should_register_single_by_default', () => {
						// Arrange
						const sc = new ServiceCollection();

						@injectable()
						class SampleType {
							constructor(name: string) {}
						}

						// Act
						sc.addClass(SampleType, ServiceLifeTime.transient);

						// Assertion
						const descriptor = sc.services[0];
						expect(descriptor.dependencies).toHaveLength(1);
						expect(descriptor.dependencies[0].isMulti).toBe(false);
					});
					describe('@inject', () => {
						it('should_set_type_with_paramType_if_token_not_provided', () => {
							// Arrange
							const sc = new ServiceCollection();

							@injectable()
							class SampleType {
								constructor(@inject() name: string) {}
							}

							// Act
							sc.addClass(SampleType, ServiceLifeTime.transient);

							// Assertion
							const descriptor = sc.services[0];
							expect(descriptor.dependencies).toHaveLength(1);
							expect(descriptor.dependencies[0].token).toBe(String);
						});
						it('should_set_type_with_provided_token', () => {
							// Arrange
							const sc = new ServiceCollection();

							@injectable()
							class SampleType {
								constructor(@inject('my-service') name: string) {}
							}

							// Act
							sc.addClass(SampleType, ServiceLifeTime.transient);

							// Assertion
							const descriptor = sc.services[0];
							expect(descriptor.dependencies).toHaveLength(1);
							expect(descriptor.dependencies[0].token).toBe('my-service');
						});
					});
					describe('@multuple', () => {
						it('should_set_multiple', () => {
							// Arrange
							const sc = new ServiceCollection();

							@injectable()
							class SampleType {
								constructor(@multiple() name: string) {}
							}

							// Act
							sc.addClass(SampleType, ServiceLifeTime.transient);

							// Assertion
							const descriptor = sc.services[0];
							expect(descriptor.dependencies).toHaveLength(1);
							expect(descriptor.dependencies[0].isMulti).toBe(true);
						});
					});
					describe('@optional', () => {
						it('should_set_optional', () => {
							// Arrange
							const sc = new ServiceCollection();

							@injectable()
							class SampleType {
								constructor(@optional() name: string) {}
							}

							// Act
							sc.addClass(SampleType, ServiceLifeTime.transient);

							// Assertion
							const descriptor = sc.services[0];
							expect(descriptor.dependencies).toHaveLength(1);
							expect(descriptor.dependencies[0].isOptional).toBe(true);
						});
					});
				});
				describe('overloads', () => {
					theoretically(
						(data) => `should_add_as_${data.lifetime}_type_as_token`,
						[
							{ lifetime: ServiceLifeTime.transient, func: 'Transient' },
							{ lifetime: ServiceLifeTime.scoped, func: 'Scoped' },
							{ lifetime: ServiceLifeTime.singleton, func: 'Singleton' },
						],
						async (data) => {
							// Arrange
							const sc = new ServiceCollection();
							@injectable()
							class SampleType {}

							// Act
							const descriptor = sc[`add${data.func}Class`](SampleType);

							// Assertion
							expect(sc.services).toHaveLength(1);
							expect(sc.services[0].token).toBe(SampleType);
							expect(sc.services[0].lifetime).toBe(data.lifetime);
							expect(sc.services[0].dependencies).toHaveLength(0);
							expect(await sc.services[0].factory()).toBeInstanceOf(SampleType);
						},
					);
					theoretically(
						(data) => `should_add_as_${data.lifetime}_by_custom_token`,
						[
							{ lifetime: ServiceLifeTime.transient, func: 'Transient' },
							{ lifetime: ServiceLifeTime.scoped, func: 'Scoped' },
							{ lifetime: ServiceLifeTime.singleton, func: 'Singleton' },
						],
						async (data) => {
							// Arrange
							const sc = new ServiceCollection();
							@injectable()
							class SampleType {}

							// Act
							const descriptor = sc[`add${data.func}Class`]('token', SampleType);

							// Assertion
							expect(sc.services).toHaveLength(1);
							expect(sc.services[0].token).toBe('token');
							expect(sc.services[0].lifetime).toBe(data.lifetime);
							expect(sc.services[0].dependencies).toHaveLength(0);
							expect(await sc.services[0].factory()).toBeInstanceOf(SampleType);
						},
					);
				});
			});
			describe('addFactory', () => {
				it('should_register_service_by_factory', () => {
					// Arrange
					const sc = new ServiceCollection();

					// Act
					sc.addFactory('my-service', ServiceLifeTime.transient, (p: IServiceProvider) => p.get('my-service2'));

					// Assertion
					expect(sc.services).toHaveLength(1);
					expect(sc.services[0].token).toBe('my-service');
					expect(sc.services[0].lifetime).toBe(ServiceLifeTime.transient);
					expect(sc.services[0].dependencies).toHaveLength(1);
					expect(sc.services[0].dependencies[0].token).toBe(SERVICE_PROVIDER_INJECTION_TOKEN);
					expect(sc.services[0].dependencies[0].isMulti).toBe(false);
					expect(sc.services[0].dependencies[0].isOptional).toBe(false);
				});
				describe('overloads', () => {
					theoretically(
						(data) => `should_add_as_${data.lifetime}`,
						[
							{ lifetime: ServiceLifeTime.transient, func: 'Transient' },
							{ lifetime: ServiceLifeTime.scoped, func: 'Scoped' },
							{ lifetime: ServiceLifeTime.singleton, func: 'Singleton' },
						],
						async (data) => {
							// Arrange
							const sc = new ServiceCollection();

							// Act
							sc[`add${data.func}Factory`]('token', async () => 'value');

							// Assertion
							expect(sc.services).toHaveLength(1);
							expect(sc.services[0].token).toBe('token');
							expect(sc.services[0].lifetime).toBe(data.lifetime);
							expect(sc.services[0].dependencies).toHaveLength(1);
							expect(await sc.services[0].factory()).toBe('value');
						},
					);
				});
			});
			describe('addValue', () => {
				it('should_regsiter_service_byValue', async () => {
					// Arrange
					const sc = new ServiceCollection();

					// Act
					sc.addValue('my-service', 'my-value');

					// Assertion
					expect(sc.services).toHaveLength(1);
					expect(sc.services[0].token).toBe('my-service');
					expect(sc.services[0].lifetime).toBe(ServiceLifeTime.singleton);
					expect(sc.services[0].dependencies).toHaveLength(0);
					expect(await sc.services[0].factory()).toBe('my-value');
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
