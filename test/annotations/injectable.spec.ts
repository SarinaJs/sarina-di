import { getAnnotations } from '@sarina/annotation';
import { injectable, isInjectable } from '@sarina/di';

describe('dependency-injection', () => {
	describe('annotation', () => {
		describe('injectable', () => {
			describe('@injectable', () => {
				it('should_register_injectable_meta', () => {
					// Arrange

					// Act
					@injectable()
					class SampleType {}

					// Assert
					const meta = getAnnotations(SampleType, { name: '__di_injectable__', type: 'class' });
					expect(meta).toHaveLength(1);
					expect(meta).toMatchObject([
						{
							name: '__di_injectable__',
							type: 'class',
						},
					]);
				});
			});
			describe('isInjectable', () => {
				it('should_return_false_if_type_not_marked', () => {
					// Arrange
					class SampleType {}

					// Act
					const value = isInjectable(SampleType);

					// Assert
					expect(value).toBeFalsy();
				});
				it('should_return_true_if_type_is_marked', () => {
					// Arrange
					@injectable()
					class SampleType {}

					// Act
					const value = isInjectable(SampleType);

					// Assert
					expect(value).toBeTruthy();
				});
			});
		});
	});
});
