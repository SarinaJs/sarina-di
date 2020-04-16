import { parameterAnnotationDecoratorMaker, getAnnotations, ParameterAnnotation } from '@sarina/annotation';
import { Token, Type } from '../interfaces';

export interface InjectData {
	token: Token<any>;
}

export const inject: (token?: Token<any>) => ParameterDecorator = (token?: Token<any>) =>
	parameterAnnotationDecoratorMaker('__di_inject__', false, {
		token: token,
	} as InjectData);

export const getInjectData = (target: Type<any>, methodName: string, index: number): InjectData => {
	const paramAnnotations = getAnnotations(target, {
		name: '__di_inject__',
		type: 'parameter',
	}) as ParameterAnnotation[];
	const annotation = paramAnnotations.find((s) => s.methodName == methodName && s.parameterIndex == index);
	if (!annotation) return null;
	return annotation.data;
};
