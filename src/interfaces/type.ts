export interface Type<T> extends Function {
	new (...args: any[]): T;
}

export function isType(value: any): value is Type<any> {
	return typeof value === 'function';
}
