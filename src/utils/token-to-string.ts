import { Token } from './../interfaces';

export const tokenToString = (token: Token): string => {
	if (typeof token === 'function') {
		return token.name;
	}
	if (typeof token == 'symbol') {
		return token.toString();
	}
	return token;
};

// export default {
// 	tokenToString: tokenToString,
// };
