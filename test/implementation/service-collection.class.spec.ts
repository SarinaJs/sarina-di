import { ServiceCollection, ServiceLifeTime, ServiceContainer } from '@sarina/di';

describe('dependency-injection', () => {
	describe('service-collection.class', () => {
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
					sc.add('token', {
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: () => {
							return null;
						},
					});

					// Act
					const value = sc.has('token');

					// Assert
					expect(value).toBeTruthy();
				});
			});
			describe('add', () => {
				it('add_should_create_new_descriptor_if_token_not_found', () => {
					// Arrange
					const sc = new ServiceCollection();

					// Act
					const provider = {
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => null,
					};
					sc.add('token', provider);

					// Assert
					expect(sc.descriptorsMap.size).toBe(1);
					expect(sc.descriptorsMap.get('token').token).toBe('token');
					expect(sc.descriptorsMap.get('token').providers).toHaveLength(1);
					expect(sc.descriptorsMap.get('token').providers[0]).toBe(provider);
				});
				it('add_should_use_existing_descriptor_if_token_alread_exists', () => {
					// Arrange
					const sc = new ServiceCollection();

					// Act
					const provider = {
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => null,
					};
					const provider2 = {
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => null,
					};
					sc.add('token', provider);
					sc.add('token', provider2);

					// Assert
					expect(sc.descriptorsMap.size).toBe(1);
					expect(sc.descriptorsMap.get('token').token).toBe('token');
					expect(sc.descriptorsMap.get('token').providers).toHaveLength(2);
					expect(sc.descriptorsMap.get('token').providers[0]).toBe(provider);
					expect(sc.descriptorsMap.get('token').providers[1]).toBe(provider2);
				});
			});
			describe('build()', () => {
				it('build_should_create_root_container', async () => {
					// Arrange
					const sc = new ServiceCollection();
					const provider = {
						lifetime: ServiceLifeTime.scoped,
						dependencies: [],
						factory: async () => null,
					};
					sc.add('token', provider);

					// Act
					const container = (await sc.build()) as ServiceContainer;
					const descriptors = container.getDescriptors();

					// Assert
					expect(container).toBeInstanceOf(ServiceContainer);
					expect(container.options.isRoot).toBeTruthy();
					expect(descriptors.get('token').token).toBe('token');
					expect(descriptors.get('token').providers).toHaveLength(1);
					expect(descriptors.get('token').providers[0]).toBe(provider);
				});
			});
			describe('addTransient', () => {
				describe('type<any>', () => {});
			});
		});
	});
});
