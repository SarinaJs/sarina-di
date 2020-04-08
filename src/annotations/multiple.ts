import { Type } from '../interfaces';
import { parameterAnnotationDecoratorMaker, getAnnotations, ParameterAnnotation } from '@sarina/annotation';

export const multiple: () => ParameterDecorator = () => parameterAnnotationDecoratorMaker('__di_multiple__', false);

export const isMultipleParameter = (target: Type<any>, methodName: string, index: number) => {
	const paramAnnotations = getAnnotations(target, {
		name: '__di_multiple__',
		type: 'parameter',
	}) as ParameterAnnotation[];
	const annotations = paramAnnotations.filter((s) => s.methodName == methodName && s.parameterIndex == index);
	return annotations.length > 0;
};
