import { tokenToString } from '@sarina/di/utils';

describe('dependency-injection', () => {
	describe('utils', () => {
		describe('tokenToString()', () => {
			it('should_return_class_name_as_token', () => {
				// Arrange
				class SampleType {}

				// Act
				const value = tokenToString(SampleType);

				// Assert
				expect(value).toBe('SampleType');
			});
			it('should_return_function_name_as_token', () => {
				// Arrange
				const myFunction = () => {};

				// Act
				const value = tokenToString(myFunction as any);

				// Assert
				expect(value).toBe('myFunction');
			});
			it('should_return_string_name_as_token', () => {
				// Arrange

				// Act
				const value = tokenToString('myToken');

				// Assert
				expect(value).toBe('myToken');
			});
			it('should_return_symbol_name_as_token', () => {
				// Arrange

				// Act
				const value = tokenToString(Symbol('name'));

				// Assert
				expect(value).toBe('Symbol(name)');
			});
		});
	});
});
