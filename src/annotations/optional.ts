import { Type } from '../interfaces';
import { parameterAnnotationDecoratorMaker, getAnnotations, ParameterAnnotation } from '@sarina/annotation';

export const optional: () => ParameterDecorator = () => parameterAnnotationDecoratorMaker('__di_optional__', false);

export const isOptionalParameter = (target: Type<any>, methodName: string, index: number) => {
	const paramAnnotations = getAnnotations(target, {
		name: '__di_optional__',
		type: 'parameter',
	}) as ParameterAnnotation[];
	const annotations = paramAnnotations.filter((s) => s.methodName == methodName && s.parameterIndex == index);
	return annotations.length > 0;
};
