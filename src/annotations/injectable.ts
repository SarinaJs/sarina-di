import { Type } from '../interfaces';
import { getAnnotations, classAnnotationDecoratorMaker } from '@sarina/annotation';

export const injectable: () => ClassDecorator = () => classAnnotationDecoratorMaker('__di_injectable__', false);

export const isInjectable = (type: Type<any>) => {
	const annotations = getAnnotations(type, { type: 'class', name: '__di_injectable__' });
	return annotations.length > 0;
};
