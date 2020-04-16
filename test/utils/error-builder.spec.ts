import { ErrorBuilder } from '@sarina/di/utils';
import { SarinaDependencyInjectionError } from '@sarina/di';

describe('dependency-injection', () => {
	describe('utils', () => {
		describe('ErrorBuilder', () => {
			it('consturctor_should_set_code_and_name', () => {
				// Arrange

				// Act
				const builder = new ErrorBuilder('x001', 'myError');

				// Assert
				expect(builder._name).toBe('myError');
				expect(builder._code).toBe('x001');
			});
			it('message_should_update_message', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				builder.message('My_Message');

				// Assert
				expect(builder._message).toBe('My_Message');
			});
			it('code_should_update_code', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				builder.code('x002');

				// Assert
				expect(builder._code).toBe('x002');
			});
			it('name_should_update_name', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				builder.name('MyName');

				// Assert
				expect(builder._name).toBe('MyName');
			});
			it('addNote_should_add_note', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				builder.addNote('MyName');

				// Assert
				expect(builder._helpNotes).toHaveLength(1);
				expect(builder._helpNotes[0]).toBe('MyName');
			});
			it('addData_should_add_data', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				builder.addData('key', 'value');

				// Assert
				expect(builder._data['key']).toBe('value');
			});
			it('build_should_return_Error', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				const error = builder.build();

				// Assert
				expect(error).toBeInstanceOf(Error);
			});
			it('build_should_create_message_without_helpnote_and_data', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				const error = builder.message('test').build();

				// Assert
				expect(error.message).toBe('x001: test');
			});
			it('build_should_create_message_with_notes', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				const error = builder
					.message('test')
					.addNote('1. test1')
					.addNote('2. test2')
					.build();

				// Assert
				expect(error.message).toBe('x001: test\n\t1. test1\n\t2. test2');
			});
			it('build_should_create_error_with_data', () => {
				// Arrange
				const builder = new ErrorBuilder('x001', 'myError');

				// Act
				const error = builder
					.message('test')
					.addData('k', 'v')
					.build();

				// Assert
				expect(error.data['k']).toBe('v');
			});
		});
	});
});
