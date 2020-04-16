import { Type, Token } from '../interfaces';
import { ErrorBuilder } from './../utils/error-builder';
import { tokenToString } from '../utils';

export class SarinaDependencyInjectionError extends Error {
	public constructor(
		public readonly code: string,
		name: string,
		message: string,
		public readonly data: { [key: string]: string },
	) {
		super(message);
		this.name = name;
	}

	public static InvalidInjectableType(type: Type<any>) {
		return new ErrorBuilder('x0001', 'InvalidInjectableType')
			.message(`The '${type.name}' not marked as injectable.`)
			.addNote('1. Check that you have marked type by @injectable() annotation')
			.addNote('2. Check that the provided type is a Class.')
			.addData('type', type)
			.build();
	}
	public static MultipleInstanceFound(token: Token, instanceLength: number) {
		return new ErrorBuilder('x0002', 'MultipleInstanceFound')
			.message(`${instanceLength} providers found for '${tokenToString(token)}'.`)
			.addNote('1. Mark dependency as @multiple.')
			.addNote(`2.Be sure only one service has been registered for '${tokenToString(token)}'.`)
			.addData('token', token)
			.build();
	}
	public static NoProviderForTokenFound(token: Token) {
		return new ErrorBuilder('x0003', 'NoProviderForTokenFound')
			.message(`No provider found for '${tokenToString(token)}'.`)
			.addNote(`1. Make sure provider for '${tokenToString(token)}' have been registered.`)
			.addData('token', token)
			.build();
	}
	public static CycleDependencyDetected(token: Token, dependant: Token) {
		return new ErrorBuilder('x0004', 'CycleDependencyDetected')
			.message(`Cycle dependency found. '${tokenToString(token)}' is dependent of '${tokenToString(dependant)}'.`)
			.addData('token', token)
			.addData('dependant', dependant)
			.build();
	}
}
