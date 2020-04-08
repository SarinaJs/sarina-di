import { getAnnotations, reflectable } from '@sarina/annotation';
import { multiple, isMultipleParameter } from '@sarina/di';

describe('dependency-injection', () => {
	describe('annotation', () => {
		describe('multiple', () => {
			describe('@multiple', () => {
				it('should_register_multiple_meta', () => {
					// Arrange

					// Act
					@reflectable()
					class SampleType {
						public constructor(@multiple() name: string) {}
					}

					// Assert
					const meta = getAnnotations(SampleType, { name: '__di_multiple__', type: 'parameter' });
					expect(meta).toHaveLength(1);
					expect(meta).toMatchObject([
						{
							name: '__di_multiple__',
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
					const isMultiple = isMultipleParameter(SampleType, 'constructor', 0);

					// Assert
					expect(isMultiple).toBeFalsy();
				});
				it('should_return_true_if_annotation_not_defined', () => {
					// Arrange
					@reflectable()
					class SampleType {
						public constructor(@multiple() name: string) {}
					}

					// Act
					const isMultiple = isMultipleParameter(SampleType, 'constructor', 0);

					// Assert
					expect(isMultiple).toBeTruthy();
				});
			});
		});
	});
});
