import { ServiceResolver, ServiceDescriptor, ServiceLifeTime } from '@sarina/di';

describe('dependency-injection', () => {
	describe('service-resolver', () => {
		describe('constructor', () => {
			it('should_populate_services_into_tokens', () => {
				// Arrange
				const services: ServiceDescriptor[] = [
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
				];

				// Act
				const resolver = new ServiceResolver(services);

				// Assert
				expect(resolver.services.get('token1')).toMatchObject([services[0]]);
			});
			it('should_aggreage_services_by_token', () => {
				// Arrange
				const services: ServiceDescriptor[] = [
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token2',
					},
				];

				// Act
				const resolver = new ServiceResolver(services);

				// Assert
				expect(resolver.services.get('token1')).toMatchObject([services[0], services[1]]);
				expect(resolver.services.get('token2')).toMatchObject([services[2]]);
			});
		});
		describe('has', () => {
			it('should_return_true_if_found', () => {
				// Arrange
				const resolver = new ServiceResolver([
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
				]);

				// Act
				const exists = resolver.has('token1');

				// Assert
				expect(exists).toBeTruthy();
			});
			it('should_return_false_if_not_found', () => {
				// Arrange
				const resolver = new ServiceResolver([
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
				]);

				// Act
				const exists = resolver.has('tokrn2');

				// Assert
				expect(exists).toBeFalsy();
			});
		});
		describe('resolveAll', () => {
			it('should_return_empty_array_if_no_token_found', () => {
				// Arrange
				const resolver = new ServiceResolver([
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
				]);

				// Act
				const descriptors = resolver.resolveAll('tokrn');

				// Assert
				expect(descriptors).toHaveLength(0);
			});
			it('should_return_descritprs_as_array', () => {
				// Arrange
				const resolver = new ServiceResolver([
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
				]);

				// Act
				const descriptors = resolver.resolveAll('token1');

				// Assert
				expect(descriptors).toHaveLength(2);
				expect(descriptors[0].token).toBe('token1');
				expect(descriptors[1].token).toBe('token1');
			});
			it('should_return_descritprs_matched_to_token', () => {
				// Arrange
				const resolver = new ServiceResolver([
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token2',
					},
				]);

				// Act
				const descriptors = resolver.resolveAll('token1');

				// Assert
				expect(descriptors).toHaveLength(1);
				expect(descriptors[0].token).toBe('token1');
			});
		});
		describe('internalAddNewService', () => {
			it('should_addNewService_into_tokens', () => {
				// Arrange
				const newService = {
					dependencies: [],
					factory: () => null,
					lifetime: ServiceLifeTime.scoped,
					token: 'token1',
				};
				const resolver = new ServiceResolver([]);

				// Act
				resolver.internalAddNewService(newService);

				// Assert
				expect(resolver.services.get('token1')).toMatchObject([newService]);
			});
			it('should_addNewService_by_token', () => {
				// Arrange
				const services: ServiceDescriptor[] = [
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token1',
					},
					{
						dependencies: [],
						factory: () => null,
						lifetime: ServiceLifeTime.scoped,
						token: 'token2',
					},
				];
				const resolver = new ServiceResolver([]);

				// Act
				resolver.internalAddNewService(services[0]);
				resolver.internalAddNewService(services[1]);
				resolver.internalAddNewService(services[2]);

				// Assert
				expect(resolver.services.get('token1')).toMatchObject([services[0], services[1]]);
				expect(resolver.services.get('token2')).toMatchObject([services[2]]);
			});
		});
	});
});
