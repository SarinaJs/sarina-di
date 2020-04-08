import { getAnnotations, reflectable } from '@sarina/annotation';
import { optional, isOptionalParameter } from '@sarina/di';

describe('dependency-injection', () => {
	describe('annotation', () => {
		describe('optional', () => {
			describe('@optional', () => {
				it('should_register_optional_meta', () => {
					// Arrange

					// Act
					@reflectable()
					class SampleType {
						public constructor(@optional() name: string) {}
					}

					// Assert
					const meta = getAnnotations(SampleType, { name: '__di_optional__', type: 'parameter' });
					expect(meta).toHaveLength(1);
					expect(meta).toMatchObject([
						{
							name: '__di_optional__',
							methodName: 'constructor',
							parameterIndex: 0,
							type: 'parameter',
						},
					]);
				});
			});
			describe('isMultipleParameter', () => {
				it('should_return_false_if_annotation_not_defined', () => {
					// Arrange
					@reflectable()
					class SampleType {
						public constructor(name: string) {}
					}

					// Act
					const isMultiple = isOptionalParameter(SampleType, 'constructor', 0);

					// Assert
					expect(isMultiple).toBeFalsy();
				});
				it('should_return_true_if_annotation_not_defined', () => {
					// Arrange
					@reflectable()
					class SampleType {
						public constructor(@optional() name: string) {}
					}

					// Act
					const isMultiple = isOptionalParameter(SampleType, 'constructor', 0);

					// Assert
					expect(isMultiple).toBeTruthy();
				});
			});
		});
	});
});
