import {
	ServiceResolver,
	ServiceProvider,
	ServiceDescriptor,
	ServiceLifeTime,
	ResolutionContext,
	SERVICE_PROVIDER_INJECTION_TOKEN,
	SarinaDependencyInjectionError,
} from '@sarina/di';

describe('dependency-injection', () => {
	describe('service-provider', () => {
		describe('ResolutionContext', () => {
			it('create_should_return_ResolutionContext_instance', () => {
				// Arrange

				// Act
				const context = ResolutionContext.create('token');

				// Assert
				expect(context.requestedToken).toBe('token');
			});
			it('isActivating_should_return_false_if_not_inList', () => {
				// Arrange
				const context = ResolutionContext.create('token');

				// Act
				const result = context.isActivating('token');

				// Assert
				expect(result).toBeFalsy();
			});
			it('isActivating_should_return_trueif_not_inList', () => {
				// Arrange
				const context = ResolutionContext.create('token');
				context.activatingToken.push('token');

				// Act
				const result = context.isActivating('token');

				// Assert
				expect(result).toBeTruthy();
			});
			it('markAsActivating_should_register_token_as_activating', () => {
				// Arrange
				const context = ResolutionContext.create('token');

				// Act
				context.markAsActivating('token');

				// Assert
				expect(context.activatingToken).toHaveLength(1);
				expect(context.activatingToken[0]).toBe('token');
			});
			it('markAsActivated_should_unRegister_token_as_activating', () => {
				// Arrange
				const context = ResolutionContext.create('token');
				context.markAsActivated('token');

				// Act
				context.markAsActivated('token');

				// Assert
				expect(context.activatingToken).toHaveLength(0);
			});
		});
		describe('ServiceContainer', () => {
			describe('createRootProvider', () => {
				it('should_create_root_service_provider', () => {
					// Arrange

					// Act
					const provider = ServiceProvider.createRootProvider(new ServiceResolver([]));

					// Assert
					expect(provider.parent).toBeNull();
				});
				it('should_register_selfInstance_as_service', async () => {
					// Arrange

					// Act
					const provider = ServiceProvider.createRootProvider(new ServiceResolver([]));

					// Assert
					expect(provider.resolver.services.size).toBe(1);
					const resolvedProvider = await provider.get(SERVICE_PROVIDER_INJECTION_TOKEN);
					expect(resolvedProvider).toBe(provider);
				});
			});
			describe('resolveDependency', () => {
				it('should_resolve_array_if_provider_is_multi', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'p1',
							dependencies: [],
							factory: async () => 'value_for_p1-0',
							lifetime: ServiceLifeTime.transient,
						},
						{
							token: 'p1',
							dependencies: [],
							factory: async () => 'value_for_p1-1',
							lifetime: ServiceLifeTime.transient,
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('p1');
					const result = await provider.resolveDependency(context, { isMulti: true, token: 'p1' });

					// Assert
					expect(result).toHaveLength(2);
					expect(result).toContain('value_for_p1-0');
					expect(result).toContain('value_for_p1-1');
				});
				it('should_resolve_single_if_provider_is_not_multi', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'p1',
							dependencies: [],
							factory: async () => 'value_for_p1-0',
							lifetime: ServiceLifeTime.transient,
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('p1');
					const result = await provider.resolveDependency(context, { isMulti: false, token: 'p1' });

					// Assert
					expect(result).toBe('value_for_p1-0');
				});
				it('should_resolve_null_if_provider_is_single_optional_and_not_found', async () => {
					// Arrange
					const resolver = new ServiceResolver([]);
					const rootContainer = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('p1');
					const result = await rootContainer.resolveDependency(context, {
						isMulti: false,
						token: 'p1',
						isOptional: true,
					});

					// Assert
					expect(result).toBeNull();
				});
				it('should_fail_if_provider_is_single_required_and_not_found', async () => {
					// Arrange
					expect.assertions(2);
					const resolver = new ServiceResolver([]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('p1');
					const action = () => provider.resolveDependency(context, { isMulti: false, token: 'p1', isOptional: false });

					// Assert
					try {
						await action();
					} catch (e) {
						const err: SarinaDependencyInjectionError = e;
						expect(err.code).toBe('x0003');
						expect(err.name).toBe('NoProviderForTokenFound');
					}
				});
				it('should_fail_if_provider_is_single_and_multiple_instance_found', async () => {
					// Arrange
					expect.assertions(2);
					const resolver = new ServiceResolver([
						{
							token: 'p1',
							dependencies: [],
							lifetime: ServiceLifeTime.transient,
							factory: async () =>
								new Promise((resolve, reject) => {
									setTimeout(() => resolve('p1'), 200);
								}),
						},
						{
							token: 'p1',
							dependencies: [],
							lifetime: ServiceLifeTime.transient,
							factory: async () =>
								new Promise((resolve, reject) => {
									setTimeout(() => resolve('p2'), 100);
								}),
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('p1');
					const action = () => provider.resolveDependency(context, { isMulti: false, token: 'p1', isOptional: false });

					// Assert
					try {
						await action();
					} catch (e) {
						const err: SarinaDependencyInjectionError = e;
						expect(err.code).toBe('x0002');
						expect(err.name).toBe('MultipleInstanceFound');
					}
				});
				it('should_resolve_providers_in_order_of_registration_for_multiple', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'p1',
							dependencies: [],
							lifetime: ServiceLifeTime.transient,
							factory: async () =>
								new Promise((resolve, reject) => {
									setTimeout(() => resolve('p1'), 200);
								}),
						},
						{
							token: 'p1',
							dependencies: [],
							lifetime: ServiceLifeTime.transient,
							factory: async () =>
								new Promise((resolve, reject) => {
									setTimeout(() => resolve('p2'), 100);
								}),
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('p1');
					const result = await provider.resolveDependency(context, { isMulti: true, token: 'p1' });

					// Assert
					expect(result).toHaveLength(2);
					expect(result[0]).toBe('p1');
					expect(result[1]).toBe('p2');
				});
			});
			describe('resolveDependencies', () => {
				it('should_return_empty_array_for_empty_dependencies', async () => {
					// Arrange
					const resolver = new ServiceResolver([]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('token');
					const value = await provider.resolveDependencies(context, []);

					// Assert
					expect(value).toHaveLength(0);
				});
				it('should_return_array_for_dependencies', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'p1',
							dependencies: [],
							factory: async () => 'p1',
							lifetime: ServiceLifeTime.transient,
						},
						{
							token: 'p2',
							dependencies: [],
							factory: async () => 'p2',
							lifetime: ServiceLifeTime.transient,
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('token');
					const value = await provider.resolveDependencies(context, [
						{ token: 'p1', isMulti: false, isOptional: false },
						{ token: 'p2', isMulti: false, isOptional: false },
					]);
					// Assert
					expect(value).toHaveLength(2);
					expect(value[0]).toBe('p1');
					expect(value[1]).toBe('p2');
				});
				it('should_return_array_orderd_by_definition_for_dependencies', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'p1',
							dependencies: [],
							factory: async () =>
								new Promise((resolve, rejecct) => {
									setTimeout(() => resolve('p1'), 10);
								}),
							lifetime: ServiceLifeTime.transient,
						},
						{
							token: 'p2',
							dependencies: [],
							factory: async () =>
								new Promise((resolve, rejecct) => {
									setTimeout(() => resolve('p2'), 20);
								}),
							lifetime: ServiceLifeTime.transient,
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('token');
					const value = await provider.resolveDependencies(context, [
						{ token: 'p1', isMulti: false, isOptional: false },
						{ token: 'p2', isMulti: false, isOptional: false },
					]);
					// Assert
					expect(value).toHaveLength(2);
					expect(value[0]).toBe('p1');
					expect(value[1]).toBe('p2');
				});
			});
			describe('activate', () => {
				it('should_activate_by_using_descriptor', async () => {
					// Arrange
					expect.assertions(2);
					const descriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.singleton,
						dependencies: [],
						factory: async () => {
							expect(true).toBeTruthy();
							return 'value';
						},
					};
					const resolver = new ServiceResolver([descriptor]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('token');
					const value = await provider.activate<string>(context, descriptor);

					// Assert
					expect(value).toBe('value');
				});
				it('should_push_into_instances', async () => {
					// Arrange
					const descriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.singleton,
						dependencies: [],
						factory: async () => {
							expect(true).toBeTruthy();
							return 'value';
						},
					};
					const resolver = new ServiceResolver([descriptor]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('token');
					await provider.activate(context, descriptor);

					// Assert
					expect(provider.instances.has(descriptor)).toBeTruthy();
					expect(provider.instances.get(descriptor).instance).toBe('value');
				});
				it('should_pass_dependencies_to_the_factory', async () => {
					// Arrange
					expect.assertions(3);
					const desc1: ServiceDescriptor = {
						token: 'p1',
						lifetime: ServiceLifeTime.singleton,
						dependencies: [{ token: 'p2' }, { token: 'p3' }],
						factory: async (p2: string, p3: string) => {
							expect(p2).toBe('p2-p3');
							return `p1-${p2}-${p3}`;
						},
					};
					const desc2: ServiceDescriptor = {
						token: 'p2',
						lifetime: ServiceLifeTime.singleton,
						dependencies: [{ token: 'p3' }],
						factory: async (p3: string) => {
							expect(p3).toBe('p3');
							return `p2-${p3}`;
						},
					};
					const desc3: ServiceDescriptor = {
						token: 'p3',
						lifetime: ServiceLifeTime.singleton,
						dependencies: [],
						factory: async () => {
							return 'p3';
						},
					};
					const resolver = new ServiceResolver([desc1, desc2, desc3]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('token');
					const value = await provider.activate(context, desc1);

					// Assert
					expect(value).toBe('p1-p2-p3-p3');
				});
			});
			describe('resolveOrActivate', () => {
				it('should_create_new_instance_if_has_not_activated_yet', async () => {
					// Arrange
					expect.assertions(3);
					const service1: ServiceDescriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => {
							expect(true).toBeTruthy();
							return 'value';
						},
					};
					const resolver = new ServiceResolver([service1]);
					const provider = new ServiceProvider(resolver);

					// Act
					const context = ResolutionContext.create('token');
					const value = await provider.resolveOrActivate<string>(context, service1);

					// Assert
					expect(provider.instances.size).toBe(1);
					expect(value).toBe('value');
				});
				it('should_use_existing_instance_if_has_already_activated', async () => {
					// Arrange
					class Service {}
					const value = new Service();
					expect.assertions(4);
					const service1: ServiceDescriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => {
							expect(true).toBeTruthy();
							return value;
						},
					};
					const resolver = new ServiceResolver([service1]);
					const provider = new ServiceProvider(resolver);

					// Act
					const value1 = await provider.resolveOrActivate<Service>(ResolutionContext.create('token'), service1);
					const value2 = await provider.resolveOrActivate<Service>(ResolutionContext.create('token'), service1);

					// Assert
					expect(provider.instances.size).toBe(1);
					expect(value1).toBe(value);
					expect(value2).toBe(value);
				});
			});
			describe('resolveDescriptor', () => {
				describe('scope:transient', () => {
					it('should_create_new_instance_every_time', async () => {
						// Arrange
						class Service {}
						expect.assertions(6);
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const resolver = new ServiceResolver([descriptor]);
						const provider = new ServiceProvider(resolver);

						// Act
						const v1 = await provider.resolveDescriptor<Service>(ResolutionContext.create('token'), descriptor);
						const v2 = await provider.resolveDescriptor<Service>(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v2).toBeInstanceOf(Service);
						expect(v1).not.toBe(v2);
						expect(provider.instances.size).toBe(0);
					});
					it('should_create_new_instance_every_time_into_current_provider', async () => {
						// Arrange
						class Service {}
						expect.assertions(7);
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const resolver = new ServiceResolver([descriptor]);
						const rootProvider = new ServiceProvider(resolver);
						const childProvider = new ServiceProvider(resolver, rootProvider);

						// Act
						const v1 = await rootProvider.resolveDescriptor<Service>(ResolutionContext.create('token'), descriptor);
						const v2 = await childProvider.resolveDescriptor<Service>(ResolutionContext.create('token'), descriptor);
						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v2).toBeInstanceOf(Service);
						expect(v1).not.toBe(v2);
						expect(rootProvider.instances.size).toBe(0);
						expect(childProvider.instances.size).toBe(0);
					});
				});
				describe('scope:scoped', () => {
					it('should_create_new_instance_if_not_activated_yet', async () => {
						// Arrange
						class Service {}
						expect.assertions(3);
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.scoped,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const resolver = new ServiceResolver([descriptor]);
						const provider = new ServiceProvider(resolver);

						// Act
						const v1 = await provider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(provider.instances.size).toBe(1);
					});
					it('should_use_existing_instance', async () => {
						// Arrange
						class Service {}
						expect.assertions(4);
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.scoped,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const resolver = new ServiceResolver([descriptor]);
						const provider = new ServiceProvider(resolver);
						const v1 = await provider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Act
						const v2 = await provider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v1).toBe(v2);
						expect(provider.instances.size).toBe(1);
					});
					it('should_create_in_current_provider', async () => {
						// Arrange
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.scoped,
							dependencies: [],
							factory: async () => 'value',
						};
						const resolver = new ServiceResolver([descriptor]);
						const rootProvider = new ServiceProvider(resolver);
						const scopedProvider = new ServiceProvider(resolver, rootProvider);

						// Act
						const v1 = await scopedProvider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(v1).toBe('value');
						expect(scopedProvider.instances.size).toBe(1);
						expect(rootProvider.instances.size).toBe(0);
					});
					it('should_use_current_provider_not_parent', async () => {
						// Arrange
						let value = 'null';
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.scoped,
							dependencies: [],
							factory: async () => value,
						};
						const resolver = new ServiceResolver([descriptor]);
						const rootProvider = new ServiceProvider(resolver);
						const scopedProvider = new ServiceProvider(resolver, rootProvider);
						value = 'root';
						const rootValue = await rootProvider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Act
						value = 'scoped';
						const v1 = await scopedProvider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(rootValue).toBe('root');
						expect(v1).toBe('scoped');
						expect(scopedProvider.instances.size).toBe(1);
						expect(rootProvider.instances.size).toBe(1);
					});
				});
				describe('scope:singleton', () => {
					it('should_create_new_instance_for_rootProvider', async () => {
						// Arrange
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => 'value',
						};
						const resolver = new ServiceResolver([descriptor]);
						const provider = new ServiceProvider(resolver);

						// Act
						const value = await provider.resolveDescriptor(ResolutionContext.create('token'), descriptor);
						// Assert
						expect(value).toBe('value');
						expect(provider.instances.size).toBe(1);
					});
					it('should_create_new_instance_in_rootProvider_for_scopedProvider', async () => {
						// Arrange
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => 'value',
						};
						const resolver = new ServiceResolver([descriptor]);
						const rootProvider = new ServiceProvider(resolver);
						const scopedProvider = new ServiceProvider(resolver, rootProvider);

						// Act
						const value = await scopedProvider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(value).toBe('value');
						expect(rootProvider.instances.size).toBe(1);
						expect(scopedProvider.instances.size).toBe(0);
					});
					it('should_create_new_instance_in_rootProvider_for_nested_scopedProvider', async () => {
						// Arrange
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => 'value',
						};
						const resolver = new ServiceResolver([descriptor]);
						const rootProvider = new ServiceProvider(resolver);
						const scopedProvider = new ServiceProvider(resolver, rootProvider);
						const nestedProvider = new ServiceProvider(resolver, scopedProvider);

						// Act
						const value = await nestedProvider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(value).toBe('value');
						expect(rootProvider.instances.size).toBe(1);
						expect(scopedProvider.instances.size).toBe(0);
						expect(nestedProvider.instances.size).toBe(0);
					});
					it('should_use_existing_insance_for_rootContainer', async () => {
						// Arrange
						const value = {};
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => value,
						};
						const resolver = new ServiceResolver([descriptor]);
						const rootProvider = new ServiceProvider(resolver);
						const scopedProvider = new ServiceProvider(resolver, rootProvider);
						const rootValue = await rootProvider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Act
						const scopedValue = await scopedProvider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(rootValue).toBe(value);
						expect(scopedValue).toBe(value);
						expect(scopedValue).toBe(rootValue);
						expect(rootProvider.instances.size).toBe(1);
						expect(scopedProvider.instances.size).toBe(0);
					});
					it('should_share_instance_for_scoped_containers', async () => {
						// Arrange
						const value = {};
						const descriptor: ServiceDescriptor = {
							token: 'token',
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => value,
						};
						const resolver = new ServiceResolver([descriptor]);
						const rootProvider = new ServiceProvider(resolver);
						const scoped1Provider = new ServiceProvider(resolver, rootProvider);
						const scoped2Provider = new ServiceProvider(resolver, rootProvider);
						const rootValue = await rootProvider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Act
						const scoped2Value = await scoped1Provider.resolveDescriptor(ResolutionContext.create('token'), descriptor);
						const scoped1Value = await scoped2Provider.resolveDescriptor(ResolutionContext.create('token'), descriptor);

						// Assert
						expect(rootValue).toBe(value);
						expect(scoped1Value).toBe(value);
						expect(scoped1Value).toBe(rootValue);
						expect(scoped2Value).toBe(rootValue);
						expect(scoped2Value).toBe(scoped1Value);
						expect(rootProvider.instances.size).toBe(1);
						expect(scoped1Provider.instances.size).toBe(0);
						expect(scoped2Provider.instances.size).toBe(0);
					});
				});
			});
			describe('resolveToken', () => {
				it('should_return_empty_array_if_token_not_found', async () => {
					// Arrange
					const resolver = new ServiceResolver([]);
					const rootProvider = new ServiceProvider(resolver);

					// Act
					const instances = await rootProvider.resolveToken(ResolutionContext.create('token'), 'token');

					// Assert
					expect(instances).toHaveLength(0);
				});
				it('should_return_array_of_resolved_instances', async () => {
					// Arrange
					const descriptor1: ServiceDescriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value1',
					};
					const descriptor2: ServiceDescriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value2',
					};
					const resolver = new ServiceResolver([descriptor1, descriptor2]);
					const rootProvider = new ServiceProvider(resolver);

					// Act
					const instances = await rootProvider.resolveToken(ResolutionContext.create('token'), 'token');

					// Assert
					expect(instances).toHaveLength(2);
					expect(instances).toContain('value1');
					expect(instances).toContain('value2');
				});
				it('should_return_array_of_resolved_in_order_of_registration', async () => {
					// Arrange
					const descriptor1: ServiceDescriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => new Promise((resolve, reject) => setTimeout(() => resolve('value1'), 20)),
					};
					const descriptor2: ServiceDescriptor = {
						token: 'token',
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => new Promise((resolve, reject) => setTimeout(() => resolve('value2'), 10)),
					};
					const resolver = new ServiceResolver([descriptor1, descriptor2]);
					const rootProvider = new ServiceProvider(resolver);

					// Act
					const instances = await rootProvider.resolveToken(ResolutionContext.create('token'), 'token');

					// Assert
					expect(instances).toHaveLength(2);
					expect(instances[0]).toBe('value1');
					expect(instances[1]).toBe('value2');
				});
				it('should_if_cycle_dependency_found', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'p1',
							lifetime: ServiceLifeTime.transient,
							dependencies: [{ token: 'p2' }],
							factory: async () => 'valu1',
						},
						{
							token: 'p2',
							lifetime: ServiceLifeTime.transient,
							dependencies: [{ token: 'p1' }],
							factory: async () => 'valu2',
						},
					]);
					const rootProvider = new ServiceProvider(resolver);

					// Act
					const action = async () => await rootProvider.resolveToken(ResolutionContext.create('token'), 'p2');

					// Assert
					try {
						await action();
					} catch (e) {
						const err: SarinaDependencyInjectionError = e;
						expect(err.code).toBe('x0004');
						expect(err.name).toBe('CycleDependencyDetected');
					}
				});
			});
			describe('createScope', () => {
				it('should_create_new_scopedProvider_by_rootProvider', async () => {
					// Arrange
					const resolver = new ServiceResolver([]);
					const rootProvider = new ServiceProvider(resolver);

					// Act
					const scopedProvider = (await rootProvider.createScope()) as ServiceProvider;

					// Assert
					expect(scopedProvider).toBeInstanceOf(ServiceProvider);
					expect(rootProvider.parent).toBeNull();
					expect(scopedProvider.parent).toBe(rootProvider);
				});
				it('should_create_new_scopedProvider_by_scopedProvider', async () => {
					// Arrange
					const resolver = new ServiceResolver([]);
					const rootProvider = new ServiceProvider(resolver);
					const scopedProvider1 = new ServiceProvider(resolver, rootProvider);

					// Act
					const scopedProvider2 = (await scopedProvider1.createScope()) as ServiceProvider;

					// Assert
					expect(scopedProvider2).toBeInstanceOf(ServiceProvider);
					expect(scopedProvider2.parent).toBe(scopedProvider1);
					expect(scopedProvider1.parent).toBe(rootProvider);
					expect(rootProvider.parent).toBeNull();
				});
			});

			describe('getAll', () => {
				it('should_return_empty_array_if_no_token_found', async () => {
					// Arrange
					const resolver = new ServiceResolver([]);
					const rootProvider = new ServiceProvider(resolver);

					// Act
					const instances = await rootProvider.getAll<string>('token');

					// Assert
					expect(instances).toHaveLength(0);
				});
				it('should_return_all_instances', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'token',
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => 'value1',
						},
						{
							token: 'token',
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => 'value2',
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const instances = await provider.getAll<string>('token');

					// Assert
					expect(instances).toHaveLength(2);
					expect(instances).toContain('value1');
					expect(instances).toContain('value2');
				});
			});
			describe('get', () => {
				it('should_return_instance', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'token',
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => 'value',
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const instances = await provider.get<string>('token');

					// Assert
					expect(instances).toBe('value');
				});
				it('should_return_null_if_no_value_found', async () => {
					// Arrange
					const resolver = new ServiceResolver([]);
					const provider = new ServiceProvider(resolver);

					// Act
					const instances = await provider.get<string>('token');

					// Assert
					expect(instances).toBeNull();
				});
				it('should_fail_if_multiple_instance_activated', async () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'token',
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => 'value1',
						},
						{
							token: 'token',
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => 'value2',
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act and Assert
					try {
						await provider.get<string>('token');
					} catch (e) {
						const err: SarinaDependencyInjectionError = e;
						expect(err.code).toBe('x0002');
						expect(err.name).toBe('MultipleInstanceFound');
						expect(err.data['token']).toBe('token');
					}
				});
			});

			describe('has', () => {
				it('should_return_true_if_provider_for_token_exists', () => {
					// Arrange
					const resolver = new ServiceResolver([
						{
							token: 'token',
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => 'value',
						},
					]);
					const provider = new ServiceProvider(resolver);

					// Act
					const value = provider.has('token');

					// Assert
					expect(value).toBeTruthy();
				});
				it('should_return_false_if_no_provider_for_token_exists', () => {
					// Arrange
					const resolver = new ServiceResolver([]);
					const provider = new ServiceProvider(resolver);

					// Act
					const value = provider.has('token');

					// Assert
					expect(value).toBeFalsy();
				});
			});
		});
	});
});
