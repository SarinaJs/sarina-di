import { Type, isType } from '@sarina/di';

describe('dependency-injection', () => {
	describe('interfaces', () => {
		describe('type', () => {
			describe('isType', () => {
				it('should_return_true_if_value_is_Type', () => {
					// Arrange
					class SampleType {}

					// Act
					const value = isType(SampleType);

					// Assert
					expect(value).toBeTruthy();
				});
				it('should_return_false_if_value_is_not_type', () => {
					// Arrange
					class SampleType {}

					// Act
					const value = isType(new SampleType());

					// Assert
					expect(value).toBeFalsy();
				});
			});
		});
	});
});
