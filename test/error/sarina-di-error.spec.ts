import { SarinaDependencyInjectionError } from '@sarina/di';

describe('dependency-injection', () => {
	describe('error', () => {
		describe('SarinaDependencyInjectionError', () => {
			it('constructor_should_set_code_name_message_data', () => {
				// Arrange

				// Act
				const data = new SarinaDependencyInjectionError('x001', 'myError', 'myMessage', { k: 'value' });

				// Assert
				expect(data.code).toBe('x001');
				expect(data.message).toBe('myMessage');
				expect(data.name).toBe('myError');
				expect(data.data['k']).toBe('value');
			});
			it('InvalidInjectableType_test', () => {
				// Arrange
				class SampleType {}

				// Act
				const error = SarinaDependencyInjectionError.InvalidInjectableType(SampleType);

				// Assert
				expect(error.code).toBe('x0001');
				expect(error.name).toBe('InvalidInjectableType');
				expect(error.message).toBe(
					"x0001: The 'SampleType' not marked as injectable.\n\t1. Check that you have marked type by @injectable() annotation\n\t2. Check that the provided type is a Class.",
				);
				expect(error.data['type']).toBe(SampleType);
			});
			it('MultipleInstanceFound_test', () => {
				// Arrange

				// Act
				const error = SarinaDependencyInjectionError.MultipleInstanceFound('token', 1);

				// Assert
				expect(error.code).toBe('x0002');
				expect(error.name).toBe('MultipleInstanceFound');
				expect(error.message).toBe(
					"x0002: 1 providers found for 'token'.\n\t1. Mark dependency as @multiple.\n\t2.Be sure only one service has been registered for 'token'.",
				);
				expect(error.data['token']).toBe('token');
			});
			it('NoProviderForTokenFound_test', () => {
				// Arrange

				// Act
				const error = SarinaDependencyInjectionError.NoProviderForTokenFound('token');

				// Assert
				expect(error.code).toBe('x0003');
				expect(error.name).toBe('NoProviderForTokenFound');
				expect(error.message).toBe(
					"x0003: No provider found for 'token'.\n\t1. Make sure provider for 'token' have been registered.",
				);
				expect(error.data['token']).toBe('token');
			});
			it('CycleDependencyDetected_test', () => {
				// Arrange

				// Act
				const error = SarinaDependencyInjectionError.CycleDependencyDetected('token', 'token2');

				// Assert
				expect(error.code).toBe('x0004');
				expect(error.name).toBe('CycleDependencyDetected');
				expect(error.message).toBe("x0004: Cycle dependency found. 'token' is dependent of 'token2'.");
				expect(error.data['token']).toBe('token');
				expect(error.data['dependant']).toBe('token2');
			});
		});
	});
});
