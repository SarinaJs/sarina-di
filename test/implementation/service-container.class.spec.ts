import {
	ServiceContainer,
	Token,
	IServiceDescriptor,
	ServiceLifeTime,
	IServiceProviderActivator,
	ResolutionContext,
} from '@sarina/di';

describe('dependency-injection', () => {
	describe('service-container.class', () => {
		describe('ServiceContainer', () => {
			describe('resolveDependency', () => {
				it('should_resolve_array_if_provider_is_multi', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('p1', {
						token: 'p1',
						providers: [
							{ dependencies: [], factory: async () => 'value_for_p1-0', lifetime: ServiceLifeTime.transient },
							{ dependencies: [], factory: async () => 'value_for_p1-1', lifetime: ServiceLifeTime.transient },
						],
					});
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const result = await rootContainer.resolveDependency(context, { isMulti: true, token: 'p1' });

					// Assert
					expect(result).toHaveLength(2);
					expect(result).toContain('value_for_p1-0');
					expect(result).toContain('value_for_p1-1');
				});
				it('should_resolve_single_if_provider_is_not_multi', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('p1', {
						token: 'p1',
						providers: [
							{ dependencies: [], factory: async () => 'value_for_p1-0', lifetime: ServiceLifeTime.transient },
						],
					});
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const result = await rootContainer.resolveDependency(context, { isMulti: false, token: 'p1' });

					// Assert
					expect(result).toBe('value_for_p1-0');
				});
				it('should_resolve_null_if_provider_is_single_optional_and_not_found', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
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
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const action = () =>
						rootContainer.resolveDependency(context, { isMulti: false, token: 'p1', isOptional: false });

					// Assert
					await expect(action()).rejects.toThrowError(`No provider found for 'p1' !`);
				});
				it('should_fail_if_provider_is_single_and_multiple_instance_found', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('p1', {
						token: 'p1',
						providers: [
							{
								dependencies: [],
								lifetime: ServiceLifeTime.transient,
								factory: async () =>
									new Promise((resolve, reject) => {
										setTimeout(() => resolve('p1'), 200);
									}),
							},
							{
								dependencies: [],
								lifetime: ServiceLifeTime.transient,
								factory: async () =>
									new Promise((resolve, reject) => {
										setTimeout(() => resolve('p2'), 100);
									}),
							},
						],
					});
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const action = () =>
						rootContainer.resolveDependency(context, { isMulti: false, token: 'p1', isOptional: false });

					// Assert
					await expect(action()).rejects.toThrowError(`Multiple instance found for 'p1' token.`);
				});
				it('should_resolve_providers_in_order_of_registration_for_multiple', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('p1', {
						token: 'p1',
						providers: [
							{
								dependencies: [],
								lifetime: ServiceLifeTime.transient,
								factory: async () =>
									new Promise((resolve, reject) => {
										setTimeout(() => resolve('p1'), 200);
									}),
							},
							{
								dependencies: [],
								lifetime: ServiceLifeTime.transient,
								factory: async () =>
									new Promise((resolve, reject) => {
										setTimeout(() => resolve('p2'), 100);
									}),
							},
						],
					});
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const result = await rootContainer.resolveDependency(context, { isMulti: true, token: 'p1' });

					// Assert
					expect(result).toHaveLength(2);
					expect(result[0]).toBe('p1');
					expect(result[1]).toBe('p2');
				});
			});
			describe('resolveDependencies', () => {
				it('should_resturn_empty_array_for_empty_dependencies', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const value = await rootContainer.resolveDependencies(context, []);

					// Assert
					expect(value).toHaveLength(0);
				});
				it('should_return_array_for_dependencies', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('p1', {
						token: 'p1',
						providers: [
							{
								dependencies: [],
								factory: async () => 'p1',
								lifetime: ServiceLifeTime.transient,
							},
						],
					});
					descriptors.set('p2', {
						token: 'p2',
						providers: [
							{
								dependencies: [],
								factory: async () => 'p2',
								lifetime: ServiceLifeTime.transient,
							},
						],
					});
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const value = await rootContainer.resolveDependencies(context, [
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
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('p1', {
						token: 'p1',
						providers: [
							{
								dependencies: [],
								factory: async () =>
									new Promise((resolve, rejecct) => {
										setTimeout(() => resolve('p1'), 10);
									}),
								lifetime: ServiceLifeTime.transient,
							},
						],
					});
					descriptors.set('p2', {
						token: 'p2',
						providers: [
							{
								dependencies: [],
								factory: async () =>
									new Promise((resolve, rejecct) => {
										setTimeout(() => resolve('p2'), 20);
									}),
								lifetime: ServiceLifeTime.transient,
							},
						],
					});
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const value = await rootContainer.resolveDependencies(context, [
						{ token: 'p1', isMulti: false, isOptional: false },
						{ token: 'p2', isMulti: false, isOptional: false },
					]);

					// Assert
					expect(value).toHaveLength(2);
					expect(value[0]).toBe('p1');
					expect(value[1]).toBe('p2');
				});
			});
			describe('activateProvider', () => {
				it('should_activate_by_using_provider_factory', async () => {
					// Arrange
					expect.assertions(2);
					const provider = {
						lifetime: ServiceLifeTime.singleton,
						dependencies: [],
						factory: async () => {
							expect(true).toBeTruthy();
							return 'value';
						},
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [provider],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const value = await sc.activateProvider<string>(context, provider);

					// Assert
					expect(value).toBe('value');
				});
				it('should_push_into_activatedInstances', async () => {
					// Arrange
					const provider: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.singleton,
						dependencies: [],
						factory: async () => {
							return 'value';
						},
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						token: 'token',
						providers: [provider],
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					await sc.activateProvider(context, provider);

					// Assert
					expect(sc.activatedInstances.has(provider)).toBeTruthy();
				});
				it('should_pass_dependencies_to_the_factory', async () => {
					// Arrange
					expect.assertions(3);
					const provider1: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.singleton,
						dependencies: [{ token: 'p2' }, { token: 'p3' }],
						factory: async (p2: string, p3: string) => {
							expect(p2).toBe('p2-p3');
							return `p1-${p2}-${p3}`;
						},
					};
					const provider2: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.singleton,
						dependencies: [{ token: 'p3' }],
						factory: async (p3: string) => {
							expect(p3).toBe('p3');
							return `p2-${p3}`;
						},
					};
					const provider3: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.singleton,
						dependencies: [],
						factory: async () => {
							return 'p3';
						},
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('p1', {
						token: 'p1',
						providers: [provider1],
					});
					descriptors.set('p2', {
						token: 'p2',
						providers: [provider2],
					});
					descriptors.set('p3', {
						token: 'p3',
						providers: [provider3],
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const value = await sc.activateProvider(context, provider1);

					// Assert
					expect(value).toBe('p1-p2-p3-p3');
				});
			});
			describe('resolveOrActivate', () => {
				it('should_create_new_instance_if_has_not_activated_yet', async () => {
					// Arrange
					expect.assertions(2);
					const provider: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => {
							expect(true).toBeTruthy();
							return 'value';
						},
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [provider],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const context = ResolutionContext.create();
					const value = await sc.resolveOrActivate<string>(context, provider);

					// Assert
					expect(value).toBe('value');
				});
				it('should_use_existing_instance_if_has_already_activated', async () => {
					// Arrange
					class Service {}
					const value = new Service();
					expect.assertions(3);
					const provider: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => {
							expect(true).toBeTruthy();
							return value;
						},
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [provider],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const value1 = await sc.resolveOrActivate<Service>(ResolutionContext.create(), provider);
					const value2 = await sc.resolveOrActivate<Service>(ResolutionContext.create(), provider);

					// Assert
					expect(value1).toBe(value);
					expect(value2).toBe(value);
				});
			});
			describe('resolveProvider', () => {
				describe('scope:transient', () => {
					it('should_create_new_instance_every_time', async () => {
						// Arrange
						class Service {}
						expect.assertions(6);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

						// Act
						const v1 = await rootContainer.resolveProvider<Service>(ResolutionContext.create(), provider);
						const v2 = await rootContainer.resolveProvider<Service>(ResolutionContext.create(), provider);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v2).toBeInstanceOf(Service);
						expect(v1).not.toBe(v2);
						expect(rootContainer.activatedInstances.size).toBe(0);
					});
					it('should_create_new_instance_every_time_into_current_container', async () => {
						// Arrange
						class Service {}
						expect.assertions(7);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.transient,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });
						const scopedContainer = new ServiceContainer({ isRoot: false, root: rootContainer });

						// Act
						const v1 = await scopedContainer.resolveProvider<Service>(ResolutionContext.create(), provider);
						const v2 = await scopedContainer.resolveProvider<Service>(ResolutionContext.create(), provider);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v2).toBeInstanceOf(Service);
						expect(v1).not.toBe(v2);
						expect(scopedContainer.activatedInstances.size).toBe(0);
						expect(rootContainer.activatedInstances.size).toBe(0);
					});
				});
				describe('scope:scoped', () => {
					it('should_create_new_instance_if_not_activated_yet', async () => {
						// Arrange
						class Service {}
						expect.assertions(3);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.scoped,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

						// Act
						const v1 = await rootContainer.resolveProvider(ResolutionContext.create(), provider);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(rootContainer.activatedInstances.size).toBe(1);
					});
					it('should_use_existing_instance', async () => {
						// Arrange
						class Service {}
						expect.assertions(4);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.scoped,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });
						const v1 = await rootContainer.resolveProvider(ResolutionContext.create(), provider);

						// Act
						const v2 = await rootContainer.resolveProvider(ResolutionContext.create(), provider);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v1).toBe(v2);
						expect(rootContainer.activatedInstances.size).toBe(1);
					});
				});
				describe('scope:singleton', () => {
					it('should_create_new_instance_for_rootContainer', async () => {
						// Arrange
						class Service {}
						expect.assertions(3);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

						// Act
						const value = await sc.resolveProvider(ResolutionContext.create(), provider);

						// Assert
						expect(value).toBeInstanceOf(Service);
						expect(sc.activatedInstances.size).toBe(1);
					});
					it('should_use_existing_insance_for_rootContainer', async () => {
						// Arrange
						class Service {}
						expect.assertions(5);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });
						const v1 = await sc.resolveProvider<Service>(ResolutionContext.create(), provider);

						// Act
						const v2 = await sc.resolveProvider<Service>(ResolutionContext.create(), provider);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v2).toBeInstanceOf(Service);
						expect(sc.activatedInstances.size).toBe(1);
						expect(v2).toBe(v1);
					});
					it('should_create_new_instance_in_rootContainer_for_scoped_container', async () => {
						// Arrange
						class Service {}
						expect.assertions(4);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });
						const scopedContainer = new ServiceContainer({ isRoot: false, root: rootContainer });

						// Act
						const v1 = await scopedContainer.resolveProvider<Service>(ResolutionContext.create(), provider);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(scopedContainer.activatedInstances.size).toBe(0);
						expect(rootContainer.activatedInstances.size).toBe(1);
					});
					it('should_use_existing_instance_in_rootContainer_for_scoped_container', async () => {
						// Arrange
						class Service {}
						expect.assertions(6);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });
						const scopedContainer = new ServiceContainer({ isRoot: false, root: rootContainer });
						const v1 = await scopedContainer.resolveProvider<Service>(ResolutionContext.create(), provider);

						// Act
						const v2 = await scopedContainer.resolveProvider<Service>(ResolutionContext.create(), provider);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v2).toBeInstanceOf(Service);
						expect(v1).toBe(v2);
						expect(scopedContainer.activatedInstances.size).toBe(0);
						expect(rootContainer.activatedInstances.size).toBe(1);
					});
					it('should_share_instance_for_scoped_containers', async () => {
						// Arrange
						class Service {}
						expect.assertions(7);
						const provider: IServiceProviderActivator = {
							lifetime: ServiceLifeTime.singleton,
							dependencies: [],
							factory: async () => {
								expect(true).toBeTruthy();
								return new Service();
							},
						};
						const descriptors = new Map<Token, IServiceDescriptor>();
						descriptors.set('token', {
							providers: [provider],
							token: 'token',
						});
						const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });
						const scopedContainer1 = new ServiceContainer({ isRoot: false, root: rootContainer });
						const scopedContainer2 = new ServiceContainer({ isRoot: false, root: rootContainer });

						// Act
						const v1 = await scopedContainer1.resolveProvider<Service>(ResolutionContext.create(), provider);
						const v2 = await scopedContainer2.resolveProvider<Service>(ResolutionContext.create(), provider);

						// Assert
						expect(v1).toBeInstanceOf(Service);
						expect(v2).toBeInstanceOf(Service);
						expect(v1).toBe(v2);
						expect(scopedContainer1.activatedInstances.size).toBe(0);
						expect(scopedContainer2.activatedInstances.size).toBe(0);
						expect(rootContainer.activatedInstances.size).toBe(1);
					});
				});
			});
			describe('getDescriptors', () => {
				it('should_return_current_descriptor_if_is_rootContainer', () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const value = rootContainer.getDescriptors();

					// Assert
					expect(value).toBe(descriptors);
				});
				it('should_return_current_descriptor_if_is_scopedContainer', () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });
					const scopedContainer = new ServiceContainer({ isRoot: false, root: rootContainer });

					// Act
					const value = scopedContainer.getDescriptors();

					// Assert
					expect(value).toBe(descriptors);
				});
			});
			describe('resolveToken', () => {
				it('should_return_empty_array_if_token_not_found', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const instances = await rootContainer.resolveToken(ResolutionContext.create(), 'token');

					// Assert
					expect(instances).toHaveLength(0);
				});
				it('should_return_array_of_resolved_instances', async () => {
					// Arrange
					const provider1: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value1',
					};
					const provider2: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value2',
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [provider1, provider2],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const instances = await sc.resolveToken(ResolutionContext.create(), 'token');

					// Assert
					expect(instances).toHaveLength(2);
					expect(instances).toContain('value1');
					expect(instances).toContain('value2');
				});
				it('should_return_array_of_resolved_in_order_of_registration', async () => {
					// Arrange
					const provider1: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => new Promise((resolve, reject) => setTimeout(() => resolve('value1'), 20)),
					};
					const provider2: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => new Promise((resolve, reject) => setTimeout(() => resolve('value2'), 10)),
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [provider1, provider2],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const instances = await sc.resolveToken(ResolutionContext.create(), 'token');

					// Assert
					expect(instances).toHaveLength(2);
					expect(instances[0]).toBe('value1');
					expect(instances[1]).toBe('value2');
				});
				it('should_if_cycle_dependency_found', async () => {
					// Arrange
					const provider1: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [{ token: 'p2' }],
						factory: async () => new Promise((resolve, reject) => setTimeout(() => resolve('value1'), 20)),
					};
					const provider2: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [{ token: 'p1' }],
						factory: async () => new Promise((resolve, reject) => setTimeout(() => resolve('value2'), 10)),
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('p1', {
						providers: [provider1],
						token: 'p1',
					});
					descriptors.set('p2', {
						providers: [provider2],
						token: 'p2',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const action = async () => await sc.resolveToken(ResolutionContext.create(), 'p2');

					// Assert
					expect(action()).rejects.toThrow('Cycle dependency found');
				});
			});

			describe('createScope', () => {
				it('should_create_new_scoped_container_by_rootContainer', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const scopedContainer = (await rootContainer.createScope()) as ServiceContainer;

					// Assert
					expect(scopedContainer).toBeInstanceOf(ServiceContainer);
					expect(scopedContainer.options.isRoot).toBeFalsy();
					expect((scopedContainer.options as any).root).toBe(rootContainer);
				});
				it('should_create_new_scoped_container_by_scopedContainer', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });
					const scopedContainer1 = new ServiceContainer({ isRoot: false, root: rootContainer });

					// Act
					const scopedContainer = (await scopedContainer1.createScope()) as ServiceContainer;

					// Assert
					expect(scopedContainer).toBeInstanceOf(ServiceContainer);
					expect(scopedContainer.options.isRoot).toBeFalsy();
					expect((scopedContainer.options as any).root).toBe(rootContainer);
				});
			});

			describe('getAll', () => {
				it('should_return_empty_array_if_no_provider_found', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const rootContainer = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const instances = await rootContainer.getAll<string>('token');

					// Assert
					expect(instances).toHaveLength(0);
				});
				it('should_return_all_instances', async () => {
					// Arrange
					const provider1: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value1',
					};
					const provider2: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value2',
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [provider1, provider2],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const instances = await sc.getAll<string>('token');

					// Assert
					expect(instances).toHaveLength(2);
					expect(instances).toContain('value1');
					expect(instances).toContain('value2');
				});
			});

			describe('get', () => {
				it('should_return_instance', async () => {
					// Arrange
					const provider: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value',
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [provider],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const instances = await sc.get<string>('token');

					// Assert
					expect(instances).toBe('value');
				});
				it('should_return_null_if_no_value_found', async () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const instances = await sc.get<string>('token');

					// Assert
					expect(instances).toBeNull();
				});
				it('should_fail_if_multiple_instance_activated', async () => {
					// Arrange
					const provider1: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value1',
					};
					const provider2: IServiceProviderActivator = {
						lifetime: ServiceLifeTime.transient,
						dependencies: [],
						factory: async () => 'value1',
					};
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [provider1, provider1],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act and Assert
					expect(sc.get<string>('token')).rejects.toThrowError(`Multiple instance found for 'token' token.`);
				});
			});

			describe('has', () => {
				it('should_return_true_if_provider_for_token_exists', () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					descriptors.set('token', {
						providers: [],
						token: 'token',
					});
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const value = sc.has('token');

					// Assert
					expect(value).toBeTruthy();
				});
				it('should_return_false_if_no_provider_for_token_exists', () => {
					// Arrange
					const descriptors = new Map<Token, IServiceDescriptor>();
					const sc = new ServiceContainer({ isRoot: true, descriptors: descriptors });

					// Act
					const value = sc.has('token');

					// Assert
					expect(value).toBeFalsy();
				});
			});
		});
	});
});
