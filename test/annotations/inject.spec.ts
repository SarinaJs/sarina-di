import { getAnnotations, reflectable } from '@sarina/annotation';
import { inject, getInjectData } from '@sarina/di';

describe('dependency-injection', () => {
	describe('annotation', () => {
		describe('inject', () => {
			describe('@inject', () => {
				it('should_register_inject_meta', () => {
					// Arrange

					// Act
					@reflectable()
					class SampleType {
						public constructor(@inject() name: string) {}
					}

					// Assert
					const meta = getAnnotations(SampleType, { name: '__di_inject__', type: 'parameter' });
					expect(meta).toHaveLength(1);
					expect(meta).toMatchObject([
						{
							name: '__di_inject__',
							methodName: 'constructor',
							parameterIndex: 0,
							type: 'parameter',
						},
					]);
				});
				it('should_register_inject_meta_with_token', () => {
					// Arrange

					// Act
					@reflectable()
					class SampleType {
						public constructor(@inject('myService') name: string) {}
					}

					// Assert
					const meta = getAnnotations(SampleType, { name: '__di_inject__', type: 'parameter' });
					expect(meta).toHaveLength(1);
					expect(meta).toMatchObject([
						{
							name: '__di_inject__',
							methodName: 'constructor',
							parameterIndex: 0,
							type: 'parameter',
							data: {
								token: 'myService',
							},
						},
					]);
				});
			});
			describe('getInjectData', () => {
				it('should_return_null_if_annotation_not_defined', () => {
					// Arrange
					@reflectable()
					class SampleType {
						public constructor(name: string) {}
					}

					// Act
					const data = getInjectData(SampleType, 'constructor', 0);

					// Assert
					expect(data).toBeNull();
				});
				it('should_return_empty_data_if_annotation_defined', () => {
					// Arrange
					@reflectable()
					class SampleType {
						public constructor(@inject() name: string) {}
					}

					// Act
					const data = getInjectData(SampleType, 'constructor', 0);

					// Assert
					expect(data).toMatchObject({});
				});
				it('should_return_data_withToken_if_annotation_defined_withToken', () => {
					// Arrange
					@reflectable()
					class SampleType {
						public constructor(@inject('my-service') name: string) {}
					}

					// Act
					const data = getInjectData(SampleType, 'constructor', 0);

					// Assert
					expect(data).toMatchObject({ token: 'my-service' });
				});
			});
		});
	});
});
